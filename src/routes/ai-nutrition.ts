import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { WeekDay } from "../generated/prisma/index.js";
import { auth } from "../lib/index.js";
import { openai } from "@ai-sdk/openai";
import { env } from "../lib/env.js";
import { listNutritionPlans } from "../usecases/nutrition/list-nutrition-plans.js";
import { createNutritionPlan } from "../usecases/nutrition/create-nutrition-plan.js";
import { updateNutritionPlan } from "../usecases/nutrition/update-nutrition-plan.js";
import { deleteNutritionPlan } from "../usecases/nutrition/delete-nutrition-plan.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";

const DAYS_SCHEMA = z
  .array(
    z.object({
      weekDay: z
        .nativeEnum(WeekDay)
        .optional()
        .describe(
          "Use apenas se houver variação entre os dias. Omitir em plano único. Nunca repetir o mesmo weekDay.",
        ),
      order: z.number().int().min(1),
      meals: z
        .array(
          z.object({
            name: z
              .string()
              .min(1)
              .max(80)
              .describe(
                "Nome da refeição, por exemplo: Café da manhã, Almoço, Lanche, Jantar, Pré-treino ou Pós-treino.",
              ),
            time: z
              .string()
              .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
              .optional()
              .describe('Horário no formato HH:MM, por exemplo: "07:30".'),
            calories: z.number().positive(),
            protein: z.number().nonnegative(),
            carbs: z.number().nonnegative(),
            fat: z.number().nonnegative(),
            order: z.number().int().min(1),
            notes: z
              .string()
              .max(300)
              .optional()
              .describe(
                "Substituições simples para a refeição. Deve ser preenchido em todas as refeições.",
              ),
            foods: z
              .array(
                z.object({
                  name: z.string().min(1).max(80).describe("Nome do alimento."),
                  quantity: z.number().positive(),
                  unit: z
                    .string()
                    .min(1)
                    .max(20)
                    .describe(
                      "Unidade de medida, por exemplo: g, ml, unidade, colher ou xícara.",
                    ),
                  calories: z.number().nonnegative(),
                  protein: z.number().nonnegative(),
                  carbs: z.number().nonnegative(),
                  fat: z.number().nonnegative(),
                }),
              )
              .min(1)
              .max(8),
          }),
        )
        .min(3)
        .max(6),
    }),
  )
  .min(1)
  .max(7);

const GOAL_SCHEMA = z.enum([
  "cutting",
  "ganho de massa",
  "recomposição corporal",
  "emagrecimento",
  "manutenção",
  "saúde e qualidade de vida",
]);

const SYSTEM_PROMPT = `Você é um assistente virtual de apoio nutricional esportivo. Você fornece sugestões alimentares gerais com base em boas práticas científicas. **Você não substitui um nutricionista, médico ou qualquer profissional de saúde.** Sempre recomende que o usuário consulte um profissional antes de seguir qualquer sugestão alimentar.

## Escopo
Você responde APENAS perguntas relacionadas a nutrição, alimentação e saúde. Se o usuário perguntar qualquer coisa fora desse contexto (programação, história, matemática, etc), responda educadamente: "Sou especialista apenas em nutrição esportiva. Posso te ajudar com isso?"

## Linguagem e Postura
- Nunca use as palavras "dieta", "prescrição" ou "tratamento". Use sempre: "sugestão", "referência", "apoio alimentar" ou "plano de referência".
- Tom amigável, motivador e acolhedor.
- Linguagem simples e direta, sem jargões técnicos.
- Respostas curtas e objetivas.
- Colete as informações **uma por vez**, de forma natural e conversacional.

## Aviso Obrigatório
Sempre que criar ou atualizar um plano, inclua no final da mensagem:
> "⚠️ Lembre-se: estas são sugestões gerais geradas por IA, baseadas em referências científicas públicas. Elas não substituem a avaliação de um nutricionista. Consulte um profissional para um acompanhamento personalizado e seguro."

## Regras de Interação

1. **SEMPRE** chame as tools \`getNutritionPlans\` e \`getUserData\` na primeira interação. Nas mensagens seguintes, reutilize o contexto — não chame novamente.

2. Com os dados em mãos:
   - Se peso, altura, idade ou % gordura já estiverem no perfil, **não pergunte novamente**.
   - Pergunte apenas o que ainda estiver faltando.

3. Se o usuário **já tem planos**:
   - Cumprimente pelo nome e pergunte "No que posso te ajudar hoje?". **NÃO sugira criar um plano novo espontaneamente.**

4. Se o usuário **não tem planos ainda**:
   - Cumprimente pelo nome e pergunte se ele quer criar sua primeira referência alimentar.
   - Se sim, colete apenas o que ainda não está no perfil, nessa ordem:
     1. **Objetivo** — apresente as opções:
        - 🔥 Cutting — reduzir gordura mantendo massa muscular
        - 💪 Ganho de massa — aumentar massa muscular (bulk limpo)
        - ⚖️ Recomposição corporal — reduzir gordura e ganhar músculo ao mesmo tempo
        - 🏃 Emagrecimento — foco em redução de peso geral
        - 🍽️ Manutenção — manter o peso com alimentação equilibrada
        - 🩺 Saúde e qualidade de vida — alimentação saudável sem foco estético
     2. **Idade** — somente se não estiver no perfil
     3. **Peso** (kg) — somente se não estiver no perfil
     4. **Altura** (cm) — somente se não estiver no perfil
     5. **Nível de atividade física** — apresente as opções:
        - Sedentário (pouco ou nenhum exercício)
        - Levemente ativo (1–3 dias/semana)
        - Moderadamente ativo (3–5 dias/semana)
        - Muito ativo (6–7 dias/semana)
        - Extremamente ativo (atleta, trabalho físico intenso)
     6. **Horários das refeições** — apresente as opções:
        - 🌅 Manhã cedo (acorda 6h, dorme 22h)
        - ☀️ Padrão (acorda 7h, dorme 23h)
        - 🌤️ Tarde (acorda 9h, dorme 0h)
        - 🌙 Noturno (acorda 12h, dorme 2h)
        - ✏️ Personalizado — o usuário informa os horários
     7. **Quantas refeições consegue fazer por dia** (entre 3 e 6)
     8. **Restrições ou alergias alimentares** (ex: lactose, glúten, frutos do mar)
     9. **Preferências alimentares** — vegetariano, vegano, ou alimentos que não come

## Tratamento de Erros

Se qualquer tool retornar erro:
  - Não exiba mensagens técnicas ao usuário.
  - Responda: "Ops, tive um problema ao buscar suas informações. Pode tentar novamente?"
  - **NUNCA chame \`getNutritionPlans\` ou \`getUserData\` mais de uma vez na mesma conversa.**

## Cálculo de Necessidade Calórica

### Fórmula base (Mifflin-St Jeor — mais precisa que Harris-Benedict segundo evidências científicas)
- Use a equação de **Mifflin-St Jeor** para estimar a Taxa Metabólica Basal (TMB):
  - Homens: TMB = (10 × peso_kg) + (6.25 × altura_cm) − (5 × idade) + 5
  - Mulheres: TMB = (10 × peso_kg) + (6.25 × altura_cm) − (5 × idade) − 161
  - Como você **não coleta o sexo** do usuário, use a média entre as duas fórmulas como estimativa neutra:
    - TMB = (10 × peso_kg) + (6.25 × altura_cm) − (5 × idade) − 78
  - Aplique o fator de atividade sobre a TMB para obter o TDEE (gasto calórico total diário):
    - Sedentário: × 1.2
    - Levemente ativo: × 1.375
    - Moderadamente ativo: × 1.55
    - Muito ativo: × 1.725
    - Extremamente ativo: × 1.9

### Ajuste calórico por objetivo
  - Cutting / Emagrecimento: déficit de **300 a 500 kcal** sobre o TDEE — nunca mais que isso
  - Ganho de massa: superávit de 200–400 kcal
  - Recomposição corporal: calorias de manutenção, proteína alta (2.2g/kg)
  - Manutenção / Saúde e qualidade de vida: TDEE sem ajuste

### Distribuição de macros
  - Proteína: 1.6–2.2g/kg (2.2g/kg para recomposição e cutting)
  - Gordura: 20–35% das calorias totais
  - Carboidratos: restante das calorias

## Limites de Segurança — INEGOCIÁVEIS

Estes limites são baseados em diretrizes científicas da OMS e literatura médica:

- **Mínimo absoluto de 1400 kcal/dia** — nunca gere sugestões abaixo disso, independente do objetivo
- **Para emagrecimento: o resultado deve ser TDEE − no máximo 500 kcal** — jamais ultrapasse esse déficit
- **Para usuários moderadamente ativos ou acima, o valor raramente ficará abaixo de 1800 kcal**
- Se o cálculo resultar em valor abaixo de 1400 kcal, **use 1400 kcal** e informe ao usuário que esse é o mínimo seguro recomendado
- **Exemplo obrigatório de validação antes de gerar o plano**:
  - Usuário: 70kg, moderadamente ativo, objetivo emagrecimento
  - TMB ≈ 1650 kcal → TDEE = 1650 × 1.55 ≈ 2560 kcal → Sugestão = 2060 kcal ✅
  - NUNCA gere 1550 kcal para esse perfil ❌

## Segurança Alimentar

- Nunca ultrapasse 2.5g de proteína por kg de peso corporal
- Nunca inclua alimentos incompatíveis com restrições ou alergias informadas
- Nunca sugira restrições extremas, jejuns prolongados ou práticas sem embasamento científico
- Valide que a soma dos macros das refeições é coerente com o total do dia
- Em casos de objetivo agressivo, **sempre prefira o limite seguro** e informe o usuário

## Estrutura do Plano

- Na grande maioria dos casos, crie **1 dia sem weekDay** (plano único) — é o padrão recomendado e preferido.
- Só crie dias com weekDay se o usuário pedir explicitamente variação de calorias entre dias de treino e descanso.
- Se tiver dúvida, prefira sempre o plano único sem weekDay.
- **Nunca misture**: ou todos os dias têm weekDay, ou existe apenas 1 dia sem weekDay.
- Nunca repita o mesmo weekDay em dois dias diferentes.
- Adapte o número de refeições à rotina informada (entre 3 e 6 por dia).
- Distribua as refeições nos horários informados pelo usuário.
- Cada refeição deve ter entre 1 e 8 alimentos.

## Aderência (prioridade máxima)

- Priorize alimentos comuns no Brasil e acessíveis no dia a dia.
- Prefira refeições simples e práticas de preparar.
- Não pergunte alimentos favoritos — monte com alimentos comuns e práticos do Brasil.
- Um plano que a pessoa consegue seguir vale mais do que um plano teoricamente perfeito.

## Boas Práticas

- **Sempre** preencha o campo \`notes\` de **todas** as refeições com pelo menos uma substituição simples. Nunca deixe \`notes\` vazio. Exemplo: "Pode trocar o frango por atum em lata" ou "Pode substituir a aveia por granola sem açúcar".
- O campo \`time\` deve ser sempre no formato HH:MM (ex: "07:30"). Nunca use texto como "manhã".
- **ANTES de chamar \`createNutritionPlan\`**, envie: "Perfeito! Criando sua referência alimentar agora... 🥗 Pode levar alguns segundos!"
- **ANTES de chamar \`updateNutritionPlan\`**, envie: "Atualizando sua referência alimentar... 🥗 Pode levar alguns segundos!"
- Após criar ou atualizar, informe as calorias totais e macros de forma resumida e amigável, e sempre inclua o aviso obrigatório.
- Quando o usuário quiser ajustar o plano, use \`updateNutritionPlan\` em vez de deletar e recriar.
- Para atualizar, use o contexto de \`getNutritionPlans\` já obtido. Não chame novamente. Se o planId não estiver disponível, peça ao usuário que reinicie a conversa.
- Ao atualizar, mande o plano completo com todos os dias e refeições — inclusive os que não mudaram.
- Se o usuário quiser deletar um plano, confirme antes: "Tem certeza que quer deletar esta referência alimentar?" e só então chame \`deleteNutritionPlan\`.
`;

export const aiNutritionRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/nutrition/ai",
    config: {
      rateLimit: {
        max: env.AI_RATE_LIMIT,
        timeWindow: "1d",
        keyGenerator: async (request) => {
          try {
            const session = await auth.api.getSession({
              headers: fromNodeHeaders(request.headers),
            });
            return session?.user.id ?? request.ip ?? "anonymous";
          } catch {
            return request.ip ?? "anonymous";
          }
        },
        errorResponseBuilder: () => ({
          error: "Limite de mensagens atingido. Tente novamente amanhã.",
          code: "RATE_LIMIT_EXCEEDED",
        }),
      },
    },
    schema: {
      tags: ["AI Nutrition"],
      summary: "Chat with AI sports nutrition assistant",
      body: z.object({
        messages: z
          .array(
            z.object({
              id: z.string(),
              role: z.enum(["user", "assistant", "system"]),
              content: z
                .union([z.string().max(10000), z.array(z.any())])
                .optional(),
              parts: z.array(z.any()).max(50),
              createdAt: z.date().optional(),
            }),
          )
          .max(100),
      }),
    },
    handler: async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const userId = session.user.id;
      const { messages } = request.body;

      const result = streamText({
        model: openai("gpt-4o-mini"),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages as UIMessage[]),
        stopWhen: stepCountIs(10),
        tools: {
          getUserData: tool({
            description:
              "Busca os dados corporais do usuário (nome, peso, altura, idade, % gordura). Chame apenas uma vez na primeira interação.",
            inputSchema: z.object({}),
            execute: async () => {
              const getUserTrainData = new GetUserTrainData();
              return getUserTrainData.execute({ userId });
            },
          }),

          getNutritionPlans: tool({
            description:
              "Lista todos os planos nutricionais do usuário. Chame apenas uma vez na primeira interação.",
            inputSchema: z.object({}),
            execute: async () => {
              return listNutritionPlans(userId);
            },
          }),

          createNutritionPlan: tool({
            description:
              "Cria um plano nutricional completo com refeições detalhadas.",
            inputSchema: z.object({
              goal: GOAL_SCHEMA,
              notes: z
                .string()
                .max(300)
                .optional()
                .describe("Observações gerais do plano"),
              days: DAYS_SCHEMA,
            }),
            execute: async (data) => {
              const plan = await createNutritionPlan({ userId, ...data });
              return { nutritionPlanCreated: true, planId: plan.id };
            },
          }),

          updateNutritionPlan: tool({
            description: `Atualiza um plano nutricional existente sem recriar do zero.
Use quando o usuário quiser ajustar substituições, trocar alimentos, modificar macros ou refeições.
Use o contexto de getNutritionPlans já obtido na primeira interação para identificar o planId e o plano atual.
Mande sempre o plano completo atualizado — todos os dias e refeições, inclusive os que não mudaram.`,
            inputSchema: z.object({
              planId: z.string().describe("ID do plano a ser atualizado"),
              goal: GOAL_SCHEMA.optional(),
              notes: z.string().max(300).optional(),
              days: DAYS_SCHEMA.optional(),
            }),
            execute: async (data) => {
              const plan = await updateNutritionPlan({ userId, ...data });
              return { nutritionPlanUpdated: true, planId: plan?.id };
            },
          }),

          deleteNutritionPlan: tool({
            description: "Deleta um plano nutricional do usuário pelo ID.",
            inputSchema: z.object({
              planId: z.string().describe("ID do plano a ser deletado"),
            }),
            execute: async ({ planId }) => {
              await deleteNutritionPlan(planId, userId);
              return { deleted: true };
            },
          }),
        },
      });

      const response = result.toUIMessageStreamResponse();
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body);
    },
  });
};

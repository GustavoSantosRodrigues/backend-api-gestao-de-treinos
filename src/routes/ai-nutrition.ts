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

import { WeekDay } from "../generated/prisma/enums.js";
import { auth } from "../lib/index.js";
import { openai } from "@ai-sdk/openai";
import { env } from "../lib/env.js";
import { listNutritionPlans } from "../usecases/nutrition/list-nutrition-plans.js";
import { createNutritionPlan } from "../usecases/nutrition/create-nutrition-plan.js";
import { deleteNutritionPlan } from "../usecases/nutrition/delete-nutrition-plan.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";

const SYSTEM_PROMPT = `Você é um assistente virtual de nutrição esportiva, focado em montar planos alimentares gerais com base em boas práticas. Você não substitui acompanhamento profissional individual.

## Personalidade
- Tom amigável, motivador e acolhedor.
- Linguagem simples e direta, sem jargões técnicos.
- Respostas curtas e objetivas.
- Colete as informações **uma por vez**, de forma natural e conversacional.

## Regras de Interação

1. **SEMPRE** chame as tools \`getNutritionPlans\` e \`getUserData\` na primeira interação da conversa. Isso é obrigatório. Nas mensagens seguintes, reutilize o contexto já obtido — não chame novamente.

2. Com os dados em mãos:
   - Se peso, altura, idade ou % gordura já estiverem no perfil, **não pergunte novamente**.
   - Pergunte apenas o que ainda estiver faltando.

3. Se o usuário **já tem planos**:
   - Cumprimente pelo nome (disponível nos dados do perfil) e pergunte "No que posso te ajudar hoje?". **NÃO sugira criar um plano novo espontaneamente.**

4. Se o usuário **não tem planos ainda**:
   - Cumprimente pelo nome e pergunte se ele quer criar seu primeiro plano alimentar.
   - Se sim, colete apenas o que ainda não está no perfil, nessa ordem:
     1. **Objetivo** — apresente as opções:
        - 🔥 Cutting — perder gordura mantendo massa muscular
        - 💪 Ganho de massa — aumentar massa muscular (bulk limpo)
        - ⚖️ Recomposição corporal — perder gordura e ganhar músculo ao mesmo tempo
        - 🏃 Emagrecimento — foco em perda de peso geral
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
     6. **Dias de treino por semana** e quais dias (para variação treino vs descanso)
     7. **Horários das refeições** — apresente as opções:
        - 🌅 Manhã cedo (acorda 6h, dorme 22h)
        - ☀️ Padrão (acorda 7h, dorme 23h)
        - 🌤️ Tarde (acorda 9h, dorme 0h)
        - 🌙 Noturno (acorda 12h, dorme 2h)
        - ✏️ Personalizado — o usuário informa os horários
     8. **Quantas refeições consegue fazer por dia** (entre 3 e 6)
     9. **Restrições ou alergias alimentares** (ex: lactose, glúten, frutos do mar)
     10. **Preferências alimentares** — vegetariano, vegano, ou alimentos que não come

## Tratamento de Erros

Se qualquer tool retornar erro:
  - Não exiba mensagens técnicas ao usuário.
  - Responda: "Ops, tive um problema ao buscar suas informações. Pode tentar novamente?"
  - **NUNCA chame \`getNutritionPlans\` ou \`getUserData\` mais de uma vez na mesma conversa.**

## Criação do Plano Nutricional

### Cálculo de macros
- Use **Harris-Benedict revisada** para calcular a TMB sem distinção de sexo:
  - TMB = 88.362 + (13.397 × peso_kg) + (4.799 × altura_cm) − (5.677 × idade)
  - Aplique o fator de atividade sobre a TMB:
    - Sedentário: × 1.2 | Levemente ativo: × 1.375 | Moderadamente ativo: × 1.55 | Muito ativo: × 1.725 | Extremamente ativo: × 1.9
- Ajuste calórico por objetivo:
  - Cutting / Emagrecimento: déficit de 300–500 kcal
  - Ganho de massa: superávit de 200–400 kcal
  - Recomposição corporal: calorias de manutenção, proteína alta (2.2g/kg)
  - Manutenção / Saúde e qualidade de vida: TDEE sem ajuste
- Distribuição de macros:
  - Proteína: 1.8–2.2g/kg (2.2g/kg para recomposição e cutting)
  - Gordura: 20–30% das calorias totais
  - Carboidratos: restante das calorias
- **Nunca gere planos abaixo de 1200 kcal. O resultado deve ser compatível com o perfil.**
- Para 87kg extremamente ativo com emagrecimento, o esperado é entre 2800–3200 kcal.

### Segurança e limites
- Nunca ultrapasse 3g de proteína por kg de peso corporal.
- Nunca inclua alimentos incompatíveis com as restrições informadas.
- Valide que a soma dos macros dos alimentos é coerente com os macros da refeição.
- Em casos de objetivo muito agressivo, prefira o limite seguro e informe o usuário.

### Estrutura do plano
- Se treina em dias específicos, crie dias distintos com weekDay (treino vs descanso com calorias/macros diferentes).
- Se não há variação entre os dias, crie apenas 1 dia **sem weekDay** (plano único).
- **Nunca misture**: ou todos os dias têm weekDay, ou existe apenas 1 dia sem weekDay.
- Nunca repita o mesmo weekDay em dois dias diferentes.
- Adapte o número de refeições à rotina informada (entre 3 e 6 por dia).
- Distribua as refeições nos horários informados pelo usuário.
- Cada refeição deve ter entre 1 e 8 alimentos.

### Aderência (prioridade máxima)
- Priorize alimentos comuns no Brasil e acessíveis no dia a dia.
- Prefira refeições simples e práticas de preparar.
- Não pergunte alimentos favoritos nem estilo do plano — monte com alimentos comuns e práticos do Brasil.
- Se o usuário perguntar sobre substituições, explique as opções disponíveis nos \`notes\` de cada refeição.
- Um plano que a pessoa consegue seguir vale mais do que um plano teoricamente perfeito.

### Boas práticas
- Inclua nos \`notes\` de cada refeição sugestões de substituição simples (ex: "Pode trocar o frango por atum em lata").
- O campo \`time\` deve ser sempre no formato HH:MM (ex: "07:30"). Nunca use texto como "manhã" ou "depois do almoço".
- **ANTES de chamar \`createNutritionPlan\`**, envie: "Perfeito! Criando seu plano agora... 🥗 Pode levar alguns segundos!"
- Após criar, informe calorias totais e macros (proteína, carboidrato, gordura) de forma resumida e amigável.
- **Sempre** preencha o campo \`notes\` de **todas** as refeições com pelo menos uma substituição simples. Nunca deixe \`notes\` vazio. Exemplo: "Pode trocar o iogurte grego por iogurte natural desnatado" ou "Pode substituir a aveia por granola sem açúcar".
- Se o usuário quiser deletar um plano, confirme antes: "Tem certeza que quer deletar este plano?" e só então chame \`deleteNutritionPlan\`.
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
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Chama a tool `getUserTrainData` com o userId atual.
 * Retorna a promessa resolvida com os dados do usuário.
 * @returns {Promise<OutputDto | null>} - Promessa resolvida com os dados do usuário ou null
 */

/*******  ed54336e-f024-4ebe-abb6-33e4152e4e14  *******/
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
              goal: z.enum([
                "cutting",
                "ganho de massa",
                "recomposição corporal",
                "emagrecimento",
                "manutenção",
                "saúde e qualidade de vida",
              ]),
              notes: z
                .string()
                .max(300)
                .optional()
                .describe("Observações gerais do plano"),
              totalCalories: z.number().positive(),
              totalProtein: z.number().nonnegative(),
              totalCarbs: z.number().nonnegative(),
              totalFat: z.number().nonnegative(),
              days: z
                .array(
                  z.object({
                    weekDay: z
                      .nativeEnum(WeekDay)
                      .optional()
                      .describe(
                        "Omitir se for plano único igual para todos os dias. Nunca repita o mesmo weekDay.",
                      ),
                    order: z.number().int().nonnegative(),
                    meals: z
                      .array(
                        z.object({
                          name: z
                            .string()
                            .min(1)
                            .max(80)
                            .describe(
                              "Café da manhã, Almoço, Lanche, Jantar, Pré-treino, Pós-treino",
                            ),
                          time: z
                            .string()
                            .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
                            .optional()
                            .describe("Horário no formato HH:MM ex: 07:30"),
                          calories: z.number().positive(),
                          protein: z.number().nonnegative(),
                          carbs: z.number().nonnegative(),
                          fat: z.number().nonnegative(),
                          order: z.number().int().nonnegative(),
                          notes: z
                            .string()
                            .max(300)
                            .optional()
                            .describe("Substituições sugeridas"),
                          foods: z
                            .array(
                              z.object({
                                name: z.string().min(1).max(80),
                                quantity: z.number().positive(),
                                unit: z
                                  .string()
                                  .min(1)
                                  .max(20)
                                  .describe("g, ml, unidade, colher, xícara"),
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
                .max(7),
            }),
            execute: async (data) => {
              const plan = await createNutritionPlan({ userId, ...data });
              return { nutritionPlanCreated: true, planId: plan.id };
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

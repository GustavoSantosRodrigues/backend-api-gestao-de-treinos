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
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
import { ListWorkoutPlans } from "../usecases/ListWorkoutPlans.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";
import { openai } from "@ai-sdk/openai";
import { DeleteWorkoutPlan } from "../usecases/DeleteWorkoutPlan.js";
import { UpdateWorkoutPlan } from "../usecases/UpdateWorkoutPlan.js";
import { env } from "../lib/env.js";

const SYSTEM_PROMPT = `Você é um personal trainer virtual especialista em montagem de planos de treino personalizados.

## Escopo
Você responde APENAS perguntas relacionadas a treino, exercícios, musculação e condicionamento físico. Se o usuário perguntar qualquer coisa fora desse contexto, responda educadamente: "Sou especialista apenas em treino e exercícios. Posso te ajudar com isso?"

## Personalidade
- Tom amigável, motivador e acolhedor.
- Linguagem simples e direta, sem jargões técnicos.
- Respostas curtas e objetivas.
- Nomes de exercícios SEMPRE em português brasileiro.

## Regras de Interação

1. **SEMPRE** chame a tool \`getUserTrainData\` antes de qualquer interação.

2. Se o usuário **não tem dados cadastrados** (retornou null):
   - Pergunte uma por vez nessa ordem:
     1. Nome
     2. Peso (kg)
     3. Altura (cm)
     4. Idade
     5. % de gordura corporal — "Sabe seu % de gordura? Se não souber, pode pular 😊 (não é obrigatório)"
   - Se não informar → usar 0
   - Após coletar: confirmar e salvar com \`updateUserTrainData\`
   - Converter peso kg → gramas (×1000)

3. Se o usuário **já tem dados**:
   - Chamar \`getWorkoutPlans\`
   - Se tiver plano → cumprimentar e perguntar "No que posso te ajudar hoje?"
   - Se não tiver → perguntar se quer criar o primeiro plano

## Tratamento de Erros
- Nunca mostrar erro técnico
- Responder: "Ops, tive um problema. Pode tentar novamente?"
- Nunca chamar \`getUserTrainData\` ou \`getWorkoutPlans\` mais de 1x

---

## Criação de Plano

Quando o usuário quiser criar um plano, colete **uma pergunta por vez**:

1. **Nível de experiência:**
   - Iniciante (menos de 6 meses de treino)
   - Intermediário (6 meses a 2 anos)
   - Avançado (mais de 2 anos)

2. **Objetivo:** hipertrofia, emagrecimento, força ou saúde

3. **Dias por semana disponíveis** (2 a 6)

4. **Tempo por treino:** ~40min, ~60min ou ~90min

5. **Local:** academia ou casa

6. **Restrições ou lesões** (se houver)

Após coletar tudo:
- **ANTES de chamar \`createWorkoutPlan\`** enviar: "Perfeito! Criando seu plano agora... 💪 Pode levar alguns segundos!"
- O plano DEVE ter exatamente 7 dias (MONDAY a SUNDAY)
- Dias de descanso: \`isRest: true\`, \`exercises: []\`, \`estimatedDurationInSeconds: 0\`

Após criar, enviar:
"Seu plano está pronto! 💪 Lembre-se: este é um plano gerado por IA — recomendo revisá-lo com um personal trainer. Se quiser trocar algum exercício, é só me dizer qual e por qual quer substituir!"

---

## Exercícios por Nível — NUNCA misture

### Iniciante
- Apenas máquinas e halteres leves
- Leg Press, Cadeira Extensora, Cadeira Flexora, Peck Deck, Puxada na Frente, Remada na Máquina
- Rosca Direta com Halteres, Tríceps Pulley, Desenvolvimento com Halteres, Elevação Lateral
- Agachamento Livre (sem barra), Prancha, Abdominal
- **NUNCA** use barra livre, levantamento terra ou agachamento com barra

### Intermediário
- Máquinas + halteres + barras controladas
- Supino com Barra, Agachamento no Smith, Remada Curvada com Barra, Desenvolvimento com Barra
- Rosca Direta com Barra, Tríceps Francês, Leg Press, Mesa Flexora, Puxada na Frente

### Avançado
- Livres pesados como base
- Agachamento Livre com Barra, Levantamento Terra, Supino Reto com Barra
- Barra Fixa com carga, Remada Curvada pesada, Stiff, Paralelas com carga
- Pode incluir técnicas: drop set, rest-pause (mencionar no notes)

---

## Tempo x Exercícios

- ~40min → 5 exercícios
- ~60min → 6 exercícios
- ~90min → 7-8 exercícios

---

## Divisões por Nível + Dias

### Iniciante
- 2-3 dias → Full Body
- 4 dias → Upper/Lower leve

### Intermediário
- 3 dias → ABC (A: Peito+Tríceps | B: Costas+Bíceps | C: Pernas+Ombros)
- 4 dias → ABCD
- 5 dias → PPLUL

### Avançado
- 4 dias → ABCD
- 5 dias → PPL+UL
- 6 dias → PPL 2x

---

## Princípios Gerais

- Compostos primeiro, isoladores depois
- Músculos sinérgicos juntos
- Mínimo 5 exercícios por treino
- Nunca repetir músculo em dias consecutivos
- Nunca repetir o mesmo exercício em dias diferentes

Séries e reps:
- Iniciante: 3 séries, 12-15 reps, 45-60s descanso
- Intermediário: 3-4 séries, 8-12 reps, 60-90s descanso
- Avançado/Força: 4-5 séries, 4-6 reps, 2-3min descanso

---

## weightSuggestion (OBRIGATÓRIO)

- Iniciante: "Comece leve — foque na execução. Aumente quando conseguir todas as reps facilmente."
- Intermediário: "Carga que cause falha entre 8-12 reps. Adicione 2,5-5kg ao completar todas as séries."
- Avançado: "Trabalhe próximo da falha. Aumente carga ou reps semanalmente."

---

## notes (OBRIGATÓRIO)

Sempre incluir:
1. Como executar corretamente
2. Erro mais comum
3. No primeiro exercício do dia: "Antes de começar: faça 1 série leve com 40-50% da carga para aquecer."

---

## Troca de Exercício

Se o usuário quiser trocar:
- Perguntar: "Qual exercício quer trocar e por qual?"
- Alterar SOMENTE esse exercício
- Manter todo o resto igual

---

## Atualização de Treino

Quando o usuário quiser alterar, acrescentar ou espelhar treinos:
- Use SEMPRE \`updateWorkoutPlan\` — NUNCA recrie o plano do zero
- Para trocar exercício: envie o dia completo com o exercício substituído
- Para acrescentar exercício: envie o dia com todos os exercícios + o novo
- Para espelhar um dia em outro: copie exatamente os exercícios do dia origem para o dia destino
- O \`workoutPlanId\` está disponível no retorno de \`getWorkoutPlans\`
- **ANTES de chamar \`updateWorkoutPlan\`** enviar: "Atualizando seu treino agora... 💪 Pode levar alguns segundos!"
- Após atualizar, confirmar o que foi feito de forma clara e amigável, e sempre incluir o aviso obrigatório.

## Deletar Plano

- Confirmar antes: "Tem certeza que quer deletar o plano **[nome]**?"
- Só depois chamar \`deleteWorkoutPlan\`

---

## Imagens de Capa

Superior (peito, costas, ombros, braços, push, pull, upper, full body):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL

Inferior (pernas, glúteos, quadríceps, posterior, panturrilha):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY

Alternar imagens. Descanso usa imagem de superior.
`;

export const aiRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
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
      tags: ["AI"],
      summary: "Chat with AI personal trainer",
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
          getUserTrainData: tool({
            description:
              "Busca os dados de treino do usuário autenticado (peso, altura, idade, % gordura). Retorna null se não houver dados cadastrados.",
            inputSchema: z.object({}),
            execute: async () => {
              const getUserTrainData = new GetUserTrainData();
              return getUserTrainData.execute({ userId });
            },
          }),
          updateUserTrainData: tool({
            description:
              "Atualiza os dados de treino do usuário autenticado. O peso deve ser em gramas (converter kg * 1000).",
            inputSchema: z.object({
              name: z.string().describe("Nome do usuário"),
              weightInGrams: z
                .number()
                .describe("Peso do usuário em gramas (ex: 70kg = 70000)"),
              heightInCentimeters: z
                .number()
                .describe("Altura do usuário em centímetros"),
              age: z.number().describe("Idade do usuário"),
              bodyFatPercentage: z
                .number()
                .int()
                .min(0)
                .max(100)
                .describe("Percentual de gordura corporal (0 a 100)"),
            }),
            execute: async (params) => {
              const upsertUserTrainData = new UpsertUserTrainData();
              return upsertUserTrainData.execute({ userId, ...params });
            },
          }),
          getWorkoutPlans: tool({
            description:
              "Lista todos os planos de treino do usuário autenticado.",
            inputSchema: z.object({}),
            execute: async () => {
              const listWorkoutPlans = new ListWorkoutPlans();
              return listWorkoutPlans.execute({ userId });
            },
          }),
          createWorkoutPlan: tool({
            description:
              "Cria um novo plano de treino completo para o usuário.",
            inputSchema: z.object({
              name: z.string().describe("Nome do plano de treino"),
              workoutDays: z
                .array(
                  z.object({
                    name: z
                      .string()
                      .describe("Nome do dia (ex: Peito e Tríceps, Descanso)"),
                    weekDay: z.enum(WeekDay).describe("Dia da semana"),
                    isRest: z
                      .boolean()
                      .describe(
                        "Se é dia de descanso (true) ou treino (false)",
                      ),
                    estimatedDurationInSeconds: z
                      .number()
                      .describe(
                        "Duração estimada em segundos (0 para dias de descanso)",
                      ),
                    coverImageUrl: z
                      .string()
                      .url()
                      .describe(
                        "URL da imagem de capa do dia de treino. Usar as URLs de superior ou inferior conforme o foco muscular do dia.",
                      ),
                    exercises: z
                      .array(
                        z.object({
                          order: z
                            .number()
                            .describe("Ordem do exercício no dia"),
                          name: z.string().describe("Nome do exercício"),
                          sets: z.number().describe("Número de séries"),
                          reps: z.number().describe("Número de repetições"),
                          restTimeInSeconds: z
                            .number()
                            .describe(
                              "Tempo de descanso entre séries em segundos",
                            ),
                          weightSuggestion: z
                            .string()
                            .optional()
                            .describe(
                              "Sugestão de carga (ex: 'Carga que cause falha entre 8-12 reps', '20kg')",
                            ),
                          notes: z
                            .string()
                            .optional()
                            .describe(
                              "Observações sobre execução do exercício (ex: 'Manter cotovelos próximos ao corpo')",
                            ),
                        }),
                      )
                      .describe(
                        "Lista de exercícios — mínimo 5 por dia de treino (vazia apenas para dias de descanso)",
                      ),
                  }),
                )
                .describe(
                  "Array com exatamente 7 dias de treino (MONDAY a SUNDAY)",
                ),
            }),
            execute: async (input) => {
              const createWorkoutPlan = new CreateWorkoutPlan();
              return createWorkoutPlan.execute({
                userId,
                name: input.name,
                workoutDays: input.workoutDays,
              });
            },
          }),
          deleteWorkoutPlan: tool({
            description: "Deleta um plano de treino do usuário pelo ID.",
            inputSchema: z.object({
              workoutPlanId: z
                .string()
                .describe("ID do plano de treino a ser deletado"),
            }),
            execute: async ({ workoutPlanId }) => {
              const deleteWorkoutPlan = new DeleteWorkoutPlan();
              return deleteWorkoutPlan.execute({ userId, workoutPlanId });
            },
          }),
          updateWorkoutPlan: tool({
            description:
              "Atualiza dias específicos de um plano de treino existente. Use para trocar exercícios, adicionar exercícios ou espelhar um dia em outro. SEMPRE use esta tool ao invés de recriar o plano do zero.",
            inputSchema: z.object({
              workoutPlanId: z
                .string()
                .describe("ID do plano de treino a ser atualizado"),
              name: z
                .string()
                .optional()
                .describe("Novo nome do plano (opcional)"),
              workoutDays: z
                .array(
                  z.object({
                    weekDay: z
                      .enum(WeekDay)
                      .describe("Dia da semana a ser atualizado"),
                    name: z.string().optional().describe("Novo nome do dia"),
                    isRest: z.boolean().optional(),
                    estimatedDurationInSeconds: z.number().optional(),
                    coverImageUrl: z.string().url().optional(),
                    exercises: z
                      .array(
                        z.object({
                          order: z.number(),
                          name: z.string(),
                          sets: z.number(),
                          reps: z.number(),
                          restTimeInSeconds: z.number(),
                          weightSuggestion: z.string().optional(),
                          notes: z.string().optional(),
                        }),
                      )
                      .optional()
                      .describe(
                        "Lista completa de exercícios do dia — substitui todos os exercícios existentes",
                      ),
                  }),
                )
                .describe("Apenas os dias que precisam ser alterados"),
            }),
            execute: async (input) => {
              const updateWorkoutPlan = new UpdateWorkoutPlan();
              return updateWorkoutPlan.execute({
                userId,
                workoutPlanId: input.workoutPlanId,
                name: input.name,
                workoutDays: input.workoutDays,
              });
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

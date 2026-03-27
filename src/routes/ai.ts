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
- Nunca chamar \`getUserTrainData\` ou \`getWorkoutPlans\` mais de 1x por conversa

---

## Criação de Plano

Quando o usuário quiser criar um plano novo do zero, colete **uma pergunta por vez**:

1. **Objetivo:** hipertrofia, emagrecimento, ganho de massa, força ou saúde
2. **Quantos dias por semana vai treinar?** (2 a 6)
3. **Quais dias quer descansar?**
   - Calcule: dias de descanso = 7 - dias de treino
   - Pergunte: "Quais [X] dias quer descansar? (ex: sábado e domingo)"
   - Se não souber → descanso no FIM da semana automaticamente
4. **Restrições ou lesões** (se houver)

---

## Regras CRÍTICAS de Distribuição dos Dias

- O plano TEM exatamente 7 dias (MONDAY a SUNDAY)
- Dias de treino = número informado pelo usuário
- Dias de descanso = 7 - dias de treino
- **NUNCA coloque descanso entre dias de treino sem o usuário pedir**

### Se o usuário NÃO escolher os dias de descanso:
- 1 descanso → domingo
- 2 descansos → sábado e domingo
- 3 descansos → quinta, sábado e domingo
- Nunca intercalar descanso entre treinos

### Se o usuário escolher dias específicos:
- Respeite EXATAMENTE os dias escolhidos
- Coloque treino em todos os outros dias

### VALIDAÇÃO antes de criar:
Conte: treino + descanso = 7? Se não → corrija antes de chamar \`createWorkoutPlan\`

Exemplos CORRETOS (5 dias treino, descanso sábado e domingo):
- MONDAY → treino
- TUESDAY → treino
- WEDNESDAY → treino
- THURSDAY → treino
- FRIDAY → treino
- SATURDAY → descanso ✅
- SUNDAY → descanso ✅

Exemplo ERRADO:
- Treino → Descanso → Treino (sem o usuário pedir) ❌

---
## Lógica de Divisão de Treino

**É ABSOLUTAMENTE PROIBIDO:**
- Criar qualquer dia chamado "Full Body"
- Criar qualquer dia chamado "Funcional" ou "Treino Funcional"
- Criar qualquer dia com exercícios funcionais (Burpees, Mountain Climbers, Agachamento com Salto, Russian Twists, Box Step-Ups ou similares)
- Usar qualquer exercício que NÃO esteja no banco de exercícios abaixo
- Misturar todos os grupos musculares em um mesmo dia

**Divisões OBRIGATÓRIAS por número de dias:**
- 2 dias → Superior (Peito+Costas+Ombros) / Inferior (Pernas+Glúteos)
- 3 dias → Peito+Tríceps / Costas+Bíceps / Pernas+Ombros
- 4 dias → Peito+Tríceps / Costas+Bíceps / Pernas / Ombros+Abdômen
- 5 dias → Peito+Tríceps / Costas+Bíceps / Pernas / Ombros / Braços+Abdômen
- 6 dias → Peito+Tríceps / Costas+Bíceps / Pernas / Ombros / Braços / Pernas 2

**Regras:**
- Cada dia foca em 1 ou 2 grupos musculares específicos
- Nunca repetir o mesmo grupo em dias consecutivos
- Garantir que apareçam na semana: Peito, Costas, Pernas, Ombros
- Cada plano deve ser diferente do anterior sempre que possível

---

## Exercícios

**REGRA ABSOLUTA: NUNCA crie um dia de treino com menos de 7 exercícios.**

- Cada dia de treino DEVE ter entre 7 e 9 exercícios
- Usar APENAS exercícios do banco de exercícios abaixo
- Compostos primeiro, isoladores depois
- Não repetir o mesmo exercício em dias diferentes da semana

**VALIDAÇÃO OBRIGATÓRIA antes de chamar \`createWorkoutPlan\` ou \`updateWorkoutPlan\`:**
- Conte os exercícios de cada dia de treino
- Se algum dia tiver menos de 7 → adicione mais antes de salvar
- Só chame a tool quando TODOS os dias tiverem 7 ou mais exercícios

Séries e reps:
- Hipertrofia: 4 séries, 8-12 reps, 90s descanso
- Força: 5 séries, 4-6 reps, 3min descanso
- Saúde/emagrecimento: 4 séries, 12-15 reps, 60s descanso

---

## Banco de Exercícios por Grupo Muscular
**REGRA CRÍTICA: Use EXCLUSIVAMENTE os exercícios desta lista. Qualquer exercício fora desta lista é PROIBIDO. Se não encontrar o exercício aqui, não use.**

A IA deve escolher exercícios APENAS desta lista. NUNCA inventar exercícios fora dela.

### Peito
Supino Reto com Barra, Supino Inclinado com Barra, Supino Declinado com Barra,
Supino Reto com Halteres, Supino Inclinado com Halteres, Supino Declinado com Halteres,
Supino na Máquina, Supino Inclinado na Máquina, Supino Articulado,
Crucifixo Reto, Crucifixo Inclinado, Crucifixo na Máquina,
Crossover Alto, Crossover Baixo, Crossover Médio, Crossover Unilateral,
Peck Deck, Paralelas, Pullover com Halter,
Flexão de Peito, Flexão com Peso, Flexão Declinada

### Costas
Puxada Frontal, Puxada Fechada, Puxada Neutra, Puxada Unilateral na Polia,
Remada Curvada com Barra, Remada Unilateral com Halter, Remada Unilateral na Polia,
Remada Sentada na Polia, Remada na Máquina Articulada, Remada Cavalinho, Remada Baixa, Remada Alta com Barra,
Barra Fixa, Pulldown com Barra Reta, Pulldown com Corda, Pulldown Unilateral,
Levantamento Terra, Rack Pull, Hiperextensão, Encolhimento com Barra, Encolhimento com Halteres, Serrote

### Pernas
Agachamento Livre, Agachamento no Smith, Agachamento Sumô, Agachamento Búlgaro, Agachamento Hack,
Leg Press 45°, Leg Press Horizontal, Leg Press Unilateral,
Cadeira Extensora, Cadeira Extensora Unilateral,
Mesa Flexora, Mesa Flexora Unilateral, Cadeira Flexora,
Cadeira Adutora, Cadeira Abdutora,
Stiff com Barra, Stiff com Halteres, Stiff Unilateral,
Avanço com Halteres, Avanço com Barra, Passada Caminhando,
Subida no Banco, Agachamento Sissy, Hack Machine,
Elevação Pélvica, Glute Bridge,
Panturrilha em Pé, Panturrilha Sentado, Panturrilha no Leg Press

### Ombros
Desenvolvimento com Barra, Desenvolvimento com Halteres, Desenvolvimento Arnold,
Desenvolvimento na Máquina, Desenvolvimento Unilateral,
Elevação Lateral com Halteres, Elevação Lateral na Polia,
Elevação Lateral Unilateral, Elevação Lateral Inclinado,
Elevação Frontal com Barra, Elevação Frontal com Halter, Elevação Frontal na Polia,
Crucifixo Inverso, Crucifixo Inverso na Máquina, Face Pull, Remada Alta com Barra

### Bíceps
Rosca Direta com Barra, Rosca Direta com Halteres, Rosca Alternada,
Rosca Martelo, Rosca Concentrada,
Rosca Scott com Barra, Rosca Scott com Halteres,
Rosca na Polia, Rosca na Polia com Corda, Rosca Unilateral na Polia,
Rosca Alternada no Banco Inclinado, Rosca Spider, Rosca 21

### Tríceps
Tríceps Pulley com Barra Reta, Tríceps Pulley com Corda, Tríceps Pulley Inverso,
Tríceps Unilateral na Polia, Extensão de Tríceps na Polia Alta,
Tríceps Testa com Barra, Tríceps Testa com Halteres, Tríceps Francês,
Tríceps Coice, Tríceps na Máquina, Tríceps Banco com Peso,
Banco Tríceps, Paralelas com Peso, Flexão de Tríceps, Flexão de Tríceps com Peso

### Abdômen
Abdominal Crunch, Abdominal Infra, Abdominal Oblíquo,
Abdominal Canivete, Abdominal Bicicleta, Abdominal na Polia,
Elevação de Pernas, Elevação de Pernas na Barra,
Prancha, Prancha Lateral, Prancha com Elevação de Perna,
Roda Abdominal, Dragon Flag, Vacuum

---

## Antes de criar
Enviar: "Perfeito! Criando seu plano agora... 💪 Pode levar alguns segundos!"

## Após criar
Enviar: "Seu plano está pronto! 💪 Lembre-se: este é um plano gerado por IA — recomendo revisá-lo com um personal trainer. Se quiser trocar algum exercício, é só me dizer qual e por qual quer substituir!"

---

## Atualização de Treino

Quando o usuário quiser alterar treinos existentes:
- Use SEMPRE \`updateWorkoutPlan\` — NUNCA recrie o plano do zero
- **NUNCA pergunte objetivo, dias, local ou restrições novamente**
- Se não tiver o \`workoutPlanId\` em mãos → chame \`getWorkoutPlans\` para obtê-lo

### Situações:

**Trocar exercício:**
- "Qual exercício quer trocar e por qual?"
- Enviar o dia completo com o exercício substituído

**Acrescentar exercício:**
- "Em qual dia quer acrescentar e qual exercício?"
- Enviar o dia com todos os exercícios + o novo

**Espelhar treino:**
- "Qual dia quer copiar e para qual dia?"
- Copiar exatamente os exercícios do dia origem para o dia destino

**Mudar grupo muscular de um dia:**
- "Qual dia quer mudar e para qual grupo muscular?"
- Atualizar título + todos os exercícios + imagem do dia

**ANTES de chamar \`updateWorkoutPlan\`:**
→ "Atualizando seu treino agora... 💪 Pode levar alguns segundos!"

**Após atualizar:**
→ Confirmar o que foi feito de forma clara

---

## Quando usar cada tool

- \`createWorkoutPlan\` → APENAS para criar plano novo do zero
- \`updateWorkoutPlan\` → SEMPRE que alterar qualquer coisa em plano existente
- NUNCA use \`createWorkoutPlan\` para atualizar plano existente

---

## Consistência de Treino (OBRIGATÓRIO)

Sempre que mudar o grupo muscular de um dia:
- Atualizar o TÍTULO do dia
- Atualizar TODOS os exercícios para o novo grupo
- Atualizar a IMAGEM de acordo com o grupo

Título + exercícios + imagem devem SEMPRE estar alinhados.

---

## Deletar Plano

- Confirmar antes: "Tem certeza que quer deletar o plano **[nome]**?"
- Só depois chamar \`deleteWorkoutPlan\`

---

## Mapeamento de Imagens (OBRIGATÓRIO)

Peito / Tríceps / Push:
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL

Costas / Bíceps / Pull / Upper:
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v

Pernas / Glúteos / Lower:
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY

Ombros / Braços / Full Body / Descanso:
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v

A imagem DEVE corresponder ao grupo muscular principal do dia.
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
        stopWhen: stepCountIs(15),
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

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
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
import { ListWorkoutPlans } from "../usecases/ListWorkoutPlans.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";
import { openai } from "@ai-sdk/openai";
import { DeleteWorkoutPlan } from "../usecases/DeleteWorkoutPlan.js";
import { UpdateWorkoutPlan } from "../usecases/UpdateWorkoutPlan.js";
import { env } from "../lib/env.js";
import { prisma } from "../lib/db.js";

const SYSTEM_PROMPT = `Você é um personal trainer virtual especialista em montagem de planos de treino personalizados.

## Escopo
Você responde APENAS perguntas relacionadas a treino, exercícios, musculação e condicionamento físico. Se o usuário perguntar qualquer coisa fora desse contexto, responda educadamente: "Sou especialista apenas em treino e exercícios. Posso te ajudar com isso?"

## Personalidade
- Tom amigável, motivador e acolhedor.
- Linguagem simples e direta, sem jargões técnicos.
- Respostas curtas e objetivas.
- Nomes de exercícios SEMPRE em português brasileiro.

## Regras de Interação

1. Na primeira interação da conversa, chame a tool \`getUserTrainData\`.

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
- Criar qualquer dia chamado "Cardio" ou "Alongamento"
- Criar qualquer dia com exercícios de cardio, corrida, bike ou alongamento
- Mostrar ou sugerir a divisão dos dias ao usuário ANTES de criar o plano
- Criar qualquer dia chamado "Full Body"
- Criar qualquer dia chamado "Funcional" ou "Treino Funcional"
- Criar qualquer dia com exercícios funcionais (Burpees, Mountain Climbers, Agachamento com Salto, Russian Twists, Box Step-Ups ou similares)
- Usar qualquer exercício que NÃO venha da tool \`searchExercises\`
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

## ⚠️ REGRA ABSOLUTA DE EXERCÍCIOS — LEIA ANTES DE QUALQUER AÇÃO

**Você não conhece NENHUM exercício.**
Sua memória de treino está completamente vazia. Não existe um único exercício que você possa citar, sugerir ou usar sem antes consultar a tool \`searchExercises\`.

**ANTES de criar ou atualizar qualquer treino, sem exceção:**
1. Chame \`searchExercises\` para cada grupo muscular necessário
2. Use SOMENTE os exercícios retornados pela tool — nome e exerciseId exatos
3. NUNCA use um exercício que não veio da resposta da tool nessa mesma conversa

**Se o usuário mencionar um exercício pelo nome (ex: "quero Supino Reto"):**
1. Identifique o grupo muscular (peito)
2. Chame \`searchExercises({ muscles: ["peito"] })\`
3. Localize o exercício pelo nome na resposta
4. Use o exerciseId retornado

**Violações que NÃO são permitidas em hipótese alguma:**
- Sugerir ou usar exercício sem ter chamado \`searchExercises\` nesta conversa
- Dizer "esse exercício não está disponível" sem ter chamado \`searchExercises\` primeiro
- Sugerir alternativas baseadas em memória ("que tal Supino Inclinado?") sem buscar na tool
- Inventar exerciseId ou usar id de outra sessão
- Omitir a chamada à tool porque "já buscou antes" — cada grupo muscular precisa ser buscado antes de cada criação/atualização

**Dias compostos (ex: Peito+Tríceps) → duas buscas obrigatórias e separadas:**
\`searchExercises({ muscles: ["peito"] })\` e \`searchExercises({ muscles: ["triceps"] })\`

---

## ⚠️ MAPEAMENTO OBRIGATÓRIO DE MÚSCULOS PARA searchExercises

**NUNCA use nomes genéricos.** O banco só reconhece os valores abaixo — qualquer outro valor retornará 0 resultados.

| Grupo muscular        | Valor EXATO para muscles[]    |
|-----------------------|-------------------------------|
| Peito                 | \`"peito"\`                   |
| Costas                | \`"costas"\`                  |
| Bíceps                | \`"biceps"\`                  |
| Tríceps               | \`"triceps"\`                 |
| Ombro                 | \`"ombro"\`                   |
| Quadríceps            | \`"quadriceps"\`              |
| Glúteo                | \`"gluteo"\`                  |
| Posterior/Isquiotibiais | \`"isquiotibiais"\`         |
| Panturrilha           | \`"panturrilha"\`             |
| Abdômen               | \`"abdomen"\`                 |
| Adutor                | \`"adutor"\`                  |
| Antebraço             | \`"antebraco"\`               |

**NUNCA use:** \`"pernas"\`, \`"braços"\`, \`"posterior"\`, \`"inferior"\`, \`"superior"\`, \`"abdutor"\` ou qualquer variação.

**Termos compostos → múltiplas buscas separadas:**
- "Pernas" → 3 buscas: \`["quadriceps"]\`, \`["gluteo"]\`, \`["isquiotibiais"]\`
- "Braços" → 2 buscas: \`["biceps"]\`, \`["triceps"]\`

### Quantidade de exercícios por dia (OBRIGATÓRIO):
- EXATAMENTE **7 exercícios** por dia de treino — nem mais, nem menos
- Escolha os 7 mais relevantes e variados para o grupo muscular do dia
- Dias de descanso: 0 exercícios
- Dias compostos: divida os exercícios proporcionalmente entre os grupos (ex: Peito+Tríceps → 4 peito + 3 ou 4 tríceps)

### Séries, Repetições e Descanso (OBRIGATÓRIO — SEM EXCEÇÃO):
- TODOS os exercícios devem ter exatamente **4 séries** — NUNCA 3, NUNCA 2, NUNCA 5
- Se você usar qualquer número diferente de 4 séries, está violando uma regra crítica
- Repetições: entre 8 e 12 reps por série (escolha conforme o exercício)
- Tempo de descanso entre séries:
  - Exercícios compostos (supino, agachamento, remada, levantamento terra, desenvolvimento): **90 segundos**
  - Exercícios isoladores (crucifixo, rosca, tríceps, elevação lateral, cadeira): **60 segundos**
- Para dias de descanso: sets = 0, reps = 0, restTimeInSeconds = 0

### Sequência obrigatória ao criar plano:
1. Colete as informações (objetivo, dias, descanso, restrições)
2. Decida internamente os grupos musculares — NÃO mostre ao usuário ainda
3. Chame \`searchExercises\` para CADA grupo muscular — uma busca por grupo
4. Só depois chame \`createWorkoutPlan\` com os exerciseIds obtidos

⚠️ CRÍTICO — exerciseId:
- O \`exerciseId\` deve ser EXATAMENTE o campo \`id\` retornado pela \`searchExercises\`
- NUNCA modifique, abrevie ou invente um \`exerciseId\`
- Se não encontrar o exercício desejado na lista → use outro exercício da lista
- NUNCA use um \`exerciseId\` que não veio da resposta da \`searchExercises\` nessa conversa

### Sequência obrigatória ao atualizar treino:
1. Chame \`getWorkoutPlans\` se não tiver o workoutPlanId e os exercícios existentes
2. Chame \`searchExercises\` para o(s) grupo(s) muscular(es) envolvidos
3. Só depois chame \`updateWorkoutPlan\`

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
- Se não tiver o \`workoutPlanId\` em mãos → chame \`getWorkoutPlans\` primeiro
- SEMPRE chame \`searchExercises\` ANTES de qualquer \`updateWorkoutPlan\` — sem exceção, mesmo que já tenha buscado antes

### Situações:

**Trocar exercício:**
1. Chame \`getWorkoutPlans\` se não tiver o workoutPlanId
2. Chame \`searchExercises\` com o grupo muscular do exercício desejado
3. Localize o exercício pelo nome na resposta e use o exerciseId retornado no \`updateWorkoutPlan\`
4. Mantenha todos os outros exercícios do dia inalterados — substitua apenas o exercício solicitado

**Alterar número de séries ou repetições:**
1. Chame \`getWorkoutPlans\` para obter os exercícios existentes do dia (ou de todos os dias, se o usuário não especificou)
2. NÃO chame \`searchExercises\` — não há troca de exercício
3. Envie o dia com TODOS os exercícios existentes, alterando APENAS o campo \`sets\` (ou \`reps\`) nos exercícios indicados
   → NUNCA duplique exercícios — cada exercício aparece UMA única vez no array
   → NUNCA omita os outros exercícios do dia
   → Se o usuário disser "coloca 4 séries em todos os treinos", aplique a alteração em TODOS os dias de treino de uma única chamada \`updateWorkoutPlan\`

**Acrescentar exercício:**
1. Chame \`getWorkoutPlans\` para obter os exercícios existentes do dia
2. Chame \`searchExercises\` com o grupo muscular desejado
3. Envie o dia com TODOS os exercícios existentes (preservando id, order, sets, reps etc.) + o novo no final
   → NUNCA omita exercícios existentes ao acrescentar um novo

**Espelhar treino:**
- "Qual dia quer copiar e para qual dia?"
- Copiar exatamente os exercícios do dia origem para o dia destino

**Mudar grupo muscular de um dia:**
1. Chame \`getWorkoutPlans\` se não tiver o workoutPlanId
2. Chame \`searchExercises\` para cada grupo muscular do novo dia
3. Atualizar título + todos os exercícios (7 a 8) + imagem do dia

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

REGRA: coverImageUrl é OBRIGATÓRIO apenas em dias de TREINO.
⚠️ DIAS DE DESCANSO (isRest: true): NÃO enviar coverImageUrl. O campo deve ser completamente omitido do objeto — não enviar null, não enviar string vazia, simplesmente não incluir o campo.

Peito / Tríceps / Push:
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL

Costas / Bíceps / Pull / Upper / Braços / Abdômen:
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v

Pernas / Glúteos / Lower:
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj'
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY

Ombros / Braços:
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

      // Schema reutilizado nos dois tools (create e update)
      const exerciseSchema = z.object({
        order: z.number().describe("Ordem do exercício no dia"),
        name: z.string().describe("Nome do exercício"),
        sets: z.number().describe("Número de séries"),
        reps: z.number().describe("Número de repetições"),
        restTimeInSeconds: z
          .number()
          .describe("Tempo de descanso entre séries em segundos"),
        weightSuggestion: z
          .string()
          .optional()
          .describe(
            "Sugestão de carga (ex: 'Carga que cause falha entre 8-12 reps', '20kg')",
          ),
        notes: z
          .string()
          .optional()
          .describe("Observações sobre execução do exercício"),
        // 👇 NOVO — obrigatório, preenchido com o id retornado por searchExercises
        exerciseId: z
          .string()
          .optional()
          .describe(
            "ID do exercício retornado pela tool searchExercises. " +
              "OBRIGATÓRIO — sempre chame searchExercises antes para obter este valor.",
          ),
      });

      const result = streamText({
        model: openai("gpt-4.1-mini"),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages as UIMessage[]),
        stopWhen: stepCountIs(100),
        maxOutputTokens: 4000,
        tools: {
          searchExercises: tool({
            description:
              "CHAME ESTA TOOL SEMPRE antes de criar ou atualizar qualquer plano. " +
              "Esta é a ÚNICA fonte de exercícios válidos. " +
              "Se o usuário pedir um exercício pelo nome, busque pelo grupo muscular e encontre o id correto. " +
              "NUNCA responda sobre exercícios sem chamar esta tool primeiro.",
            inputSchema: z.object({
              muscles: z
                .array(z.string())
                .optional()
                .describe(
                  "Grupos musculares alvo. Use EXATAMENTE estes valores: " +
                    "peito, costas, biceps, triceps, ombro, quadriceps, gluteo, isquiotibiais, panturrilha, abdomen, adutor, antebraco. " +
                    "NUNCA use: pernas, braços, posterior, inferior, superior. " +
                    "Para 'pernas' → 3 buscas separadas: quadriceps, gluteo, isquiotibiais. " +
                    "Para 'braços' → 2 buscas separadas: biceps, triceps.",
                ),
            }),
            execute: async ({ muscles }) => {
              console.log("🔍 searchExercises called:", {
                muscles,
              });

              const exercises = await prisma.exercise.findMany({
                where: {
                  ...(muscles?.length && { muscles: { hasSome: muscles } }),
                },
                orderBy: { name: "asc" },
                select: {
                  id: true,
                  name: true,
                  muscles: true,
                },
              });

              console.log(
                `✅ searchExercises result: ${exercises.length} exercícios`,
                exercises.map((e) => e.id),
              );
              return exercises;
            },
          }),

          // ─── TOOLS EXISTENTES (sem alteração na lógica) ────────────────
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

          // ✅ exerciseId adicionado nos exercises
          createWorkoutPlan: tool({
            description:
              "Cria um novo plano de treino completo para o usuário. " +
              "SEMPRE chame searchExercises antes para obter os exerciseIds reais.",
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
                      .optional()
                      .describe("URL da imagem de capa do dia de treino. Obrigatório apenas em dias de treino (isRest: false). Omitir completamente em dias de descanso."),
                    exercises: z
                      .array(exerciseSchema)
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
              console.log(
                "📝 createWorkoutPlan INPUT:",
                JSON.stringify(input, null, 2),
              );
              const createWorkoutPlan = new CreateWorkoutPlan();
              try {
                const result = await createWorkoutPlan.execute({
                  userId,
                  name: input.name,
                  workoutDays: input.workoutDays,
                });
                console.log("✅ createWorkoutPlan SUCCESS:", result.id);
                return result;
              } catch (error) {
                console.error("❌ createWorkoutPlan ERROR:", error);
                throw error;
              }
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

          // ✅ exerciseId adicionado nos exercises
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
                      .array(exerciseSchema) // ✅ usa schema compartilhado
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

// prisma/seed-exercises.ts
import { prisma } from "../src/lib/db.js";

type ExerciseSeed = {
  id: string;
  name: string;
  muscles: string[];
  gifUrl: string;
};

const exercises: ExerciseSeed[] = [
  // ─── BÍCEPS ───────────────────────────────────────────────
  {
    id: "rosca-direta-barra",
    name: "Rosca Direta com Barra",
    muscles: ["biceps"],
    gifUrl: "",
  },
  {
    id: "rosca-alternada-halter",
    name: "Rosca Alternada com Halter",
    muscles: ["biceps"],
    gifUrl: "",
  },
  {
    id: "rosca-concentrada",
    name: "Rosca Concentrada",
    muscles: ["biceps"],
    gifUrl: "",
  },
  {
    id: "rosca-maquina",
    name: "Rosca na Máquina",
    muscles: ["biceps"],
    gifUrl: "",
  },
  {
    id: "biceps-barra-w",
    name: "Biceps com Barra W",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-barra-w.gif",
  },
  {
    id: "biceps-scoot",
    name: "Rosca Scott",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-scoot.gif",
  },
  {
    id: "rosca-martelo-halter",
    name: "Rosca Martelo com Halter",
    muscles: ["biceps", "antebraco"],
    gifUrl: "/gif-exercise/biceps/biceps-martelo-halter.gif",
  },
  {
    id: "rosca-inclinada-halter",
    name: "Rosca Inclinada com Halter",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-inclinada-halter.gif",
  },
  {
    id: "rosca-cabo-polia",
    name: "Rosca na Polia Baixa",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-cabo-polia.gif",
  },
  {
    id: "rosca-cabo-barra-reta",
    name: "Rosca na Polia com Barra Reta",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-cabo-barra-reta.gif",
  },
  {
    id: "rosca-cabo-corda",
    name: "Rosca com Corda na Polia",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-cabo-corda.gif",
  },
  {
    id: "rosca-21",
    name: "Rosca 21",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-21.gif",
  },
  {
    id: "rosca-spider",
    name: "Rosca Spider",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-spider.gif",
  },
  {
    id: "rosca-concentrada-banco",
    name: "Rosca Concentrada no Banco",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-concentrada-banco.gif",
  },
  {
    id: "rosca-banco-scott-halter",
    name: "Rosca Scott com Halter",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-banco-scott-halter.gif",
  },
  {
    id: "rosca-reversa-barra",
    name: "Rosca Reversa com Barra",
    muscles: ["biceps", "antebraco"],
    gifUrl: "/gif-exercise/biceps/biceps-reversa-barra.gif",
  },

  // ─── PEITO — SUPINO ───────────────────────────────────────
  {
    id: "supino-declinado-barra",
    name: "Supino Declinado com Barra",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "supino-declinado-halter",
    name: "Supino Declinado com Halter",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "supino-reto-halter",
    name: "Supino Reto com Halter",
    muscles: ["peito", "triceps"],
    gifUrl: "",
  },
  {
    id: "supino-inclinado-barra",
    name: "Supino Inclinado com Barra",
    muscles: ["peito", "triceps"],
    gifUrl: "",
  },
  {
    id: "supino-inclinado-maquina",
    name: "Supino Inclinado na Máquina",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "supino-declinado-maquina",
    name: "Supino Declinado na Máquina",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "supino-reto-maquina",
    name: "Supino Reto na Máquina",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "supino-neutro-halter",
    name: "Supino Neutro com Halter",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "supino-banco-30-graus",
    name: "Supino Banco 30 Graus com Halter",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "supino-banco-45-graus",
    name: "Supino Banco 45 Graus com Halter",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "supino-unilateral-halter",
    name: "Supino Unilateral com Halter",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "supino-pegada-fechada-barra",
    name: "Supino Pegada Fechada com Barra",
    muscles: ["peito", "triceps"],
    gifUrl: "",
  },
  {
    id: "supino-pegada-larga-barra",
    name: "Supino Pegada Larga com Barra",
    muscles: ["peito"],
    gifUrl: "",
  },

  // ─── PEITO — CRUCIFIXO / ABERTURA ─────────────────────────
  {
    id: "crucifixo-inclinado-halter",
    name: "Crucifixo Inclinado com Halter",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "crucifixo-declinado-halter",
    name: "Crucifixo Declinado com Halter",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "crossover-cabo-alto",
    name: "Crossover Cabo Alto",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "crossover-cabo-baixo",
    name: "Crossover Cabo Baixo",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "crossover-cabo-medio",
    name: "Crossover Cabo Médio",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "fly-maquina-inclinado",
    name: "Fly na Máquina Inclinado",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "fly-maquina-declinado",
    name: "Fly na Máquina Declinado",
    muscles: ["peito"],
    gifUrl: "",
  },

  // ─── PEITO — CABO / PRESS ─────────────────────────────────
  {
    id: "press-peito-cabo-inclinado",
    name: "Press Peito no Cabo Inclinado",
    muscles: ["peito"],
    gifUrl: "",
  },
  {
    id: "press-peito-cabo-reto",
    name: "Press Peito no Cabo Reto",
    muscles: ["peito"],
    gifUrl: "",
  },

  // ─── PEITO — AVANÇADOS ────────────────────────────────────
  {
    id: "mergulho-paralela-peito",
    name: "Mergulho nas Paralelas (foco peito)",
    muscles: ["peito", "triceps"],
    gifUrl: "",
  },
  { id: "svend-press", name: "Svend Press", muscles: ["peito"], gifUrl: "" },
  {
    id: "hex-press",
    name: "Hex Press com Halter",
    muscles: ["peito"],
    gifUrl: "",
  },

  // ─── OMBRO ────────────────────────────────────────────────
  // ─── OMBRO — NOVOS ────────────────────────────────────────
  {
    id: "elevacao-lateral-cabo",
    name: "Elevação Lateral no Cabo",
    muscles: ["ombro"],
    gifUrl: "",
  },
  {
    id: "elevacao-lateral-maquina-unilateral",
    name: "Elevação Lateral na Máquina Unilateral",
    muscles: ["ombro"],
    gifUrl: "",
  },
  {
    id: "elevacao-frontal-barra",
    name: "Elevação Frontal com Barra",
    muscles: ["ombro"],
    gifUrl: "",
  },
  {
    id: "elevacao-frontal-cabo",
    name: "Elevação Frontal no Cabo",
    muscles: ["ombro"],
    gifUrl: "",
  },
  {
    id: "desenvolvimento-arnold",
    name: "Desenvolvimento Arnold",
    muscles: ["ombro"],
    gifUrl: "",
  },
  {
    id: "face-pull-cabo",
    name: "Face Pull no Cabo",
    muscles: ["ombro"],
    gifUrl: "",
  },
  {
    id: "ombro-invertido-maquina",
    name: "Crucifixo Invertido na Máquina",
    muscles: ["ombro"],
    gifUrl: "",
  },
  {
    id: "elevacao-posterior-halter",
    name: "Elevação Posterior com Halter",
    muscles: ["ombro"],
    gifUrl: "",
  },
  {
    id: "desenvolvimento-smith",
    name: "Desenvolvimento no Smith",
    muscles: ["ombro"],
    gifUrl: "",
  },
  {
    id: "upright-row-barra",
    name: "Remada Alta com Barra",
    muscles: ["ombro", "trapezio"],
    gifUrl: "",
  },
  {
    id: "upright-row-halter",
    name: "Remada Alta com Halter",
    muscles: ["ombro", "trapezio"],
    gifUrl: "",
  },
  {
    id: "upright-row-cabo",
    name: "Remada Alta no Cabo",
    muscles: ["ombro", "trapezio"],
    gifUrl: "",
  },
  {
    id: "desenvolvimento-maquina",
    name: "Desenvolvimento na Máquina",
    muscles: ["ombro"],
    gifUrl: "",
  },
  {
    id: "desenvolvimento-barra",
    name: "Desenvolvimento com Barra",
    muscles: ["ombro", "triceps"],
    gifUrl: "",
  },
  {
    id: "elevacao-frontal-halter",
    name: "Elevação Frontal com Halter",
    muscles: ["ombro"],
    gifUrl: "",
  },
  {
    id: "encolhimento-halter",
    name: "Encolhimento com Halter",
    muscles: ["trapezio"],
    gifUrl: "",
  },
  {
    id: "ombro-halter",
    name: "Desenvolvimento com Halter",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro-halter.gif",
  },
  {
    id: "ombro-lateral",
    name: "Elevação Lateral com Halter",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro-lateral.gif",
  },
  {
    id: "ombro-lateral-banco",
    name: "Elevação Lateral no Banco",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro-lateral-banco.gif",
  },
  {
    id: "ombro-lateral-maquina",
    name: "Elevação Lateral na Máquina",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro-lateral-maquina.gif",
  },

  // ─── COSTAS — PUXADA ──────────────────────────────────────
  {
    id: "puxada-supinada",
    name: "Puxada Supinada",
    muscles: ["costas", "biceps"],
    gifUrl: "",
  },
  {
    id: "puxada-neutra",
    name: "Puxada Neutra",
    muscles: ["costas", "biceps"],
    gifUrl: "",
  },
  {
    id: "puxada-triangulo",
    name: "Puxada com Triângulo",
    muscles: ["costas", "biceps"],
    gifUrl: "",
  },
  {
    id: "puxada-corda",
    name: "Puxada com Corda",
    muscles: ["costas", "biceps"],
    gifUrl: "",
  },
  {
    id: "barra-fixa-pronada",
    name: "Barra Fixa Pronada",
    muscles: ["costas", "biceps"],
    gifUrl: "",
  },
  {
    id: "barra-fixa-supinada",
    name: "Barra Fixa Supinada",
    muscles: ["costas", "biceps"],
    gifUrl: "",
  },
  {
    id: "barra-fixa-neutra",
    name: "Barra Fixa Neutra",
    muscles: ["costas", "biceps"],
    gifUrl: "",
  },

  // ─── COSTAS — REMADA ──────────────────────────────────────
  {
    id: "remada-curvada-barra",
    name: "Remada Curvada com Barra",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "remada-supinada-barra",
    name: "Remada Supinada com Barra",
    muscles: ["costas", "biceps"],
    gifUrl: "",
  },
  {
    id: "remada-baixa-cabo",
    name: "Remada Baixa no Cabo",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "remada-cabo-triangulo",
    name: "Remada no Cabo com Triângulo",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "remada-cabo-corda",
    name: "Remada no Cabo com Corda",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "remada-cabo-aberta",
    name: "Remada no Cabo Aberta",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "remada-smith",
    name: "Remada no Smith",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "remada-t-barra",
    name: "Remada T com Barra",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "remada-inclinada-halter",
    name: "Remada Inclinada com Halter",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "remada-serrote",
    name: "Remada Serrote com Halter",
    muscles: ["costas"],
    gifUrl: "",
  },

  // ─── COSTAS — MÁQUINA ─────────────────────────────────────
  {
    id: "remada-maquina-aberta",
    name: "Remada na Máquina Aberta",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "remada-maquina-neutra",
    name: "Remada na Máquina Neutra",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "puxada-maquina-frente",
    name: "Puxada na Máquina à Frente",
    muscles: ["costas", "biceps"],
    gifUrl: "",
  },
  {
    id: "puxada-maquina-nuca",
    name: "Puxada na Máquina na Nuca",
    muscles: ["costas"],
    gifUrl: "",
  },
  { id: "rack-pull", name: "Rack Pull", muscles: ["costas"], gifUrl: "" },
  {
    id: "levantamento-terra",
    name: "Levantamento Terra",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "levantamento-terra-romeno",
    name: "Levantamento Terra Romeno",
    muscles: ["costas", "isquiotibiais"],
    gifUrl: "",
  },

  // ─── COSTAS — ISOLAMENTO ──────────────────────────────────
  {
    id: "encolhimento-trapezio-barra",
    name: "Encolhimento Trapézio com Barra",
    muscles: ["costas", "trapezio"],
    gifUrl: "",
  },
  {
    id: "encolhimento-trapezio-maquina",
    name: "Encolhimento Trapézio na Máquina",
    muscles: ["costas", "trapezio"],
    gifUrl: "",
  },
  {
    id: "extensao-lombar-banco",
    name: "Extensão Lombar no Banco",
    muscles: ["costas"],
    gifUrl: "",
  },
  {
    id: "extensao-lombar-maquina",
    name: "Extensão Lombar na Máquina",
    muscles: ["costas"],
    gifUrl: "",
  },

  // ─── TRÍCEPS — POLIA ──────────────────────────────────────
  {
    id: "triceps-polia-barra-reta",
    name: "Tríceps Polia Barra Reta",
    muscles: ["triceps"],
    gifUrl: "",
  },
  {
    id: "triceps-polia-barra-v",
    name: "Tríceps Polia Barra V",
    muscles: ["triceps"],
    gifUrl: "",
  },
  {
    id: "triceps-polia-supinado",
    name: "Tríceps Polia Supinado",
    muscles: ["triceps"],
    gifUrl: "",
  },
  {
    id: "triceps-polia-unilateral",
    name: "Tríceps Polia Unilateral",
    muscles: ["triceps"],
    gifUrl: "",
  },
  {
    id: "triceps-polia-corda-acima",
    name: "Tríceps Polia Corda Acima da Cabeça",
    muscles: ["triceps"],
    gifUrl: "",
  },

  // ─── TRÍCEPS — BARRA / TESTA ──────────────────────────────
  {
    id: "triceps-testa-barra-reta",
    name: "Tríceps Testa com Barra Reta",
    muscles: ["triceps"],
    gifUrl: "",
  },
  {
    id: "triceps-testa-halter",
    name: "Tríceps Testa com Halter",
    muscles: ["triceps"],
    gifUrl: "",
  },
  {
    id: "triceps-testa-cabo",
    name: "Tríceps Testa no Cabo",
    muscles: ["triceps"],
    gifUrl: "",
  },
  {
    id: "triceps-frances-barra",
    name: "Tríceps Francês com Barra",
    muscles: ["triceps"],
    gifUrl: "",
  },
  {
    id: "triceps-frances-cabo",
    name: "Tríceps Francês no Cabo",
    muscles: ["triceps"],
    gifUrl: "",
  },

  // ─── TRÍCEPS — MÁQUINA ────────────────────────────────────
  {
    id: "triceps-maquina",
    name: "Tríceps na Máquina",
    muscles: ["triceps"],
    gifUrl: "",
  },
  {
    id: "triceps-mergulho-maquina",
    name: "Mergulho na Máquina",
    muscles: ["triceps", "peito"],
    gifUrl: "",
  },

  // ─── TRÍCEPS — COICE ──────────────────────────────────────
  {
    id: "triceps-coice-cabo",
    name: "Tríceps Coice no Cabo",
    muscles: ["triceps"],
    gifUrl: "",
  },
  {
    id: "triceps-coice-bilateral",
    name: "Tríceps Coice Bilateral com Halter",
    muscles: ["triceps"],
    gifUrl: "",
  },

  // ─── TRÍCEPS — PESO CORPORAL ──────────────────────────────
  {
    id: "triceps-banco-elevado",
    name: "Tríceps no Banco Elevado",
    muscles: ["triceps", "peito"],
    gifUrl: "",
  },
  {
    id: "flexao-pegada-fechada",
    name: "Flexão Pegada Fechada",
    muscles: ["triceps", "peito"],
    gifUrl: "",
  },

  // ─── PERNAS — AGACHAMENTO ─────────────────────────────────
  {
    id: "agachamento-sumo",
    name: "Agachamento Sumô",
    muscles: ["quadriceps", "gluteo", "adutor"],
    gifUrl: "",
  },
  {
    id: "agachamento-bulgaro",
    name: "Agachamento Búlgaro com Halter",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "",
  },
  {
    id: "agachamento-smith",
    name: "Agachamento no Smith",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "",
  },
  {
    id: "agachamento-frontal",
    name: "Agachamento Frontal com Barra",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "",
  },
  {
    id: "agachamento-cadeira",
    name: "Agachamento na Cadeira",
    muscles: ["quadriceps"],
    gifUrl: "",
  },
  {
    id: "leg-press-45",
    name: "Leg Press 45 Graus",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "",
  },
  {
    id: "leg-press-fechado",
    name: "Leg Press Pegada Fechada",
    muscles: ["quadriceps"],
    gifUrl: "",
  },
  {
    id: "leg-press-sumo",
    name: "Leg Press Posição Sumô",
    muscles: ["quadriceps", "gluteo", "adutor"],
    gifUrl: "",
  },

  // ─── PERNAS — POSTERIOR ───────────────────────────────────
  {
    id: "stiff-barra",
    name: "Stiff com Barra",
    muscles: ["isquiotibiais", "gluteo"],
    gifUrl: "",
  },
  {
    id: "stiff-halter-unilateral",
    name: "Stiff com Halter Unilateral",
    muscles: ["isquiotibiais", "gluteo"],
    gifUrl: "",
  },
  {
    id: "stiff-cabo-barra",
    name: "Stiff no Cabo",
    muscles: ["isquiotibiais", "gluteo"],
    gifUrl: "",
  },
  {
    id: "levantamento-terra-sumo",
    name: "Levantamento Terra Sumô",
    muscles: ["isquiotibiais", "gluteo"],
    gifUrl: "",
  },
  {
    id: "flexora-em-pe",
    name: "Mesa Flexora em Pé",
    muscles: ["isquiotibiais"],
    gifUrl: "",
  },
  {
    id: "flexora-sentado",
    name: "Mesa Flexora Sentado",
    muscles: ["isquiotibiais"],
    gifUrl: "",
  },
  {
    id: "flexao-nórdica",
    name: "Flexão Nórdica",
    muscles: ["isquiotibiais"],
    gifUrl: "",
  },
  {
    id: "mesa-flexora",
    name: "Agachamento Isométrico na Parede",
    muscles: ["quadriceps"],
    gifUrl: "",
  },

  // ─── PERNAS — GLÚTEO ──────────────────────────────────────
  {
    id: "hip-thrust-barra",
    name: "Elevação Quadril com Barra",
    muscles: ["gluteo"],
    gifUrl: "",
  },
  {
    id: "hip-thrust-maquina",
    name: "Elevação Quadril na Máquina",
    muscles: ["gluteo"],
    gifUrl: "",
  },
  {
    id: "gluteo-cabo-unilateral",
    name: "Extensão de Quadril no Cabo",
    muscles: ["gluteo"],
    gifUrl: "",
  },
  {
    id: "gluteo-4-apoios",
    name: "Extensão de Quadril no Chão",
    muscles: ["gluteo"],
    gifUrl: "",
  },
  {
    id: "elevacao-pelvica-halter",
    name: "Elevação Pélvica com Halter",
    muscles: ["gluteo"],
    gifUrl: "",
  },
  {
    id: "passada-barra",
    name: "Avanço com Barra",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "",
  },
  {
    id: "passada-halter",
    name: "Avanço com Halter",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "",
  },

  // ─── PERNAS — QUADRÍCEPS ──────────────────────────────────
  {
    id: "extensora-unilateral",
    name: "Cadeira Extensora Unilateral",
    muscles: ["quadriceps"],
    gifUrl: "",
  },
  {
    id: "hack-sumo",
    name: "Agachamento Hack Sumô",
    muscles: ["quadriceps", "gluteo", "adutor"],
    gifUrl: "",
  },
  {
    id: "agachamento-isometrico",
    name: "Agachamento Isométrico na Parede",
    muscles: ["quadriceps"],
    gifUrl: "",
  },

  // ─── PERNAS — PANTURRILHA ─────────────────────────────────
  {
    id: "panturrilha-sentado",
    name: "Panturrilha Sentado na Máquina",
    muscles: ["panturrilha"],
    gifUrl: "",
  },
  {
    id: "panturrilha-leg-press",
    name: "Panturrilha no Leg Press",
    muscles: ["panturrilha"],
    gifUrl: "",
  },
  {
    id: "panturrilha-unilateral",
    name: "Panturrilha Unilateral em Pé",
    muscles: ["panturrilha"],
    gifUrl: "",
  },

  // ─── ABDÔMEN — CRUNCH / FLEXÃO ────────────────────────────
  {
    id: "crunch-cabo",
    name: "Crunch no Cabo",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  {
    id: "crunch-inclinado",
    name: "Crunch no Banco Inclinado",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  {
    id: "crunch-bicicleta",
    name: "Crunch Bicicleta",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  { id: "sit-up", name: "Sit Up", muscles: ["abdomen"], gifUrl: "" },
  {
    id: "sit-up-banco",
    name: "Sit Up no Banco Declinado",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  {
    id: "abdominal-infra-banco",
    name: "Abdominal Infra no Banco",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  {
    id: "elevacao-pernas-deitado",
    name: "Elevação de Pernas Deitado",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  {
    id: "elevacao-pernas-barra",
    name: "Elevação de Pernas na Barra Fixa",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  {
    id: "elevacao-joelhos-barra",
    name: "Elevação de Joelhos na Barra Fixa",
    muscles: ["abdomen"],
    gifUrl: "",
  },

  // ─── ABDÔMEN — OBLÍQUO ────────────────────────────────────
  {
    id: "rotacao-cabo",
    name: "Rotação com Cabo",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  {
    id: "wood-chop-cabo",
    name: "Corte de Lenha no Cabo",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  {
    id: "crunch-obliquo-cabo",
    name: "Crunch Oblíquo no Cabo",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  {
    id: "russian-twist-halter",
    name: "Giro Russo com Halter",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  {
    id: "flexao-lateral-halter",
    name: "Flexão Lateral com Halter",
    muscles: ["abdomen"],
    gifUrl: "",
  },

  // ─── ABDÔMEN — PRANCHA / ISOMÉTRICO ──────────────────────
  {
    id: "prancha-lateral",
    name: "Prancha Lateral",
    muscles: ["abdomen", "core"],
    gifUrl: "",
  },
  {
    id: "prancha-dinamica",
    name: "Prancha Dinâmica",
    muscles: ["abdomen", "core"],
    gifUrl: "",
  },
  {
    id: "roda-abdominal",
    name: "Roda Abdominal",
    muscles: ["abdomen", "core"],
    gifUrl: "",
  },
  {
    id: "vacuum",
    name: "Vacuum Abdominal",
    muscles: ["abdomen", "core"],
    gifUrl: "",
  },

  // ─── ABDÔMEN — CABO / MÁQUINA ─────────────────────────────
  {
    id: "abdominal-cabo-ajoelhado",
    name: "Abdominal no Cabo Ajoelhado",
    muscles: ["abdomen"],
    gifUrl: "",
  },
  {
    id: "abdominal-cabo-em-pe",
    name: "Abdominal no Cabo em Pé",
    muscles: ["abdomen"],
    gifUrl: "",
  },
];

async function main() {
  console.log("🌱 Seeding exercises...\n");

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: exercise,
      create: exercise,
    });
  }

  console.log(`\n🎉 ${exercises.length} exercises seeded!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

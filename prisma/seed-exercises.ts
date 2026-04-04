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
    gifUrl: "/gif-exercise/biceps/rosca-direta-barra.gif",
  },
  {
    id: "rosca-corda-polia",
    name: "Rosca com Corda na Polia",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/rosca-biceps-no-cabo.gif",
  },
  {
    id: "rosca-alternada-halter",
    name: "Rosca Alternada com Halter",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/rosca-alternada-halter.webp",
  },
  {
    id: "rosca-concentrada",
    name: "Rosca Concentrada",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/rosca-concentrada.gif",
  },
  {
    id: "rosca-scott-maquina",
    name: "Rosca Scott na Máquina",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/rosca-scott-maquina.gif",
  },
  {
    id: "biceps-barra-w",
    name: "Rosca direta com barra W",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-barra-w.gif",
  },
  {
    id: "biceps-barra-w-pegada-aberta",
    name: "Rosca direta com pegada aberta",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-barra-w.gif",
  },
  {
    id: "biceps-barra-w-pegada-fechada",
    name: "Rosca Scott com barra",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-barra-w-pegada-fechada.gif",
  },
  {
    id: "biceps-spider-barra-w",
    name: "Rosca Spider com barra W",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-spider-barra-w.gif",
  },
  {
    id: "biceps-arrastada-barra-w",
    name: "Rosca arrastada com barra W",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/biceps-arrastada-barra-w.gif",
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
    id: "rosca-martelo-halter-unilateral",
    name: "Rosca Martelo com Halter Unilateral",
    muscles: ["biceps", "antebraco"],
    gifUrl: "/gif-exercise/biceps/rosca-martelo-halter-unilateral.webp",
  },
  {
    id: "rosca-inclinada-halter",
    name: "Rosca bíceps com halteres no banco inclinado",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/rosca-inclinada-halter.gif",
  },
  {
    id: "rosca-cabo-polia",
    name: "Rosca na Polia Baixa",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/rosca-cabo-polia.gif",
  },
  {
    id: "rosca-cabo-barra-reta",
    name: "Rosca na Polia com Barra Reta",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/rosca-cabo-barra-reta.gif",
  },
  {
    id: "rosca-21",
    name: "Rosca 21",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/rosca-21.gif",
  },
  {
    id: "rosca-banco-scott-halter",
    name: "Rosca Scott com Halter",
    muscles: ["biceps"],
    gifUrl: "/gif-exercise/biceps/rosca-banco-scott-halter.gif",
  },

  // ─── PEITO — SUPINO ───────────────────────────────────────
  {
    id: "supino-declinado-barra",
    name: "Supino Declinado com Barra",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/supino-declinado-barra.gif",
  },
  {
    id: "supino-declinado-halter",
    name: "Supino Declinado com Halter",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/supino-declinado-halter.gif",
  },
  {
    id: "supino-reto-halter",
    name: "Supino Reto com Halter",
    muscles: ["peito", "triceps"],
    gifUrl: "/gif-exercise/peito/supino-reto-halter.gif",
  },
  {
    id: "supino-reto-fechado-com-alteres",
    name: "Supino Reto Fechado Com Alteres",
    muscles: ["peito", "triceps"],
    gifUrl: "/gif-exercise/peito/supino-reto-fechado-com-alteres.gif",
  },
  {
    id: "supino-inclinado-com-halter",
    name: "Supino Inclinado com Halter",
    muscles: ["peito", "triceps"],
    gifUrl: "/gif-exercise/peito/supino-inclinado-com-halter.gif",
  },
  {
    id: "supino-inclinado-barra",
    name: "Supino Inclinado com Barra",
    muscles: ["peito", "triceps"],
    gifUrl: "/gif-exercise/peito/supino-inclinado-barra.gif",
  },
  {
    id: "supino-inclinado-maquina",
    name: "Supino Inclinado na Máquina",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/supino-inclinado-maquina.gif",
  },
  {
    id: "supino-declinado-maquina",
    name: "Supino Declinado na Máquina",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/supino-declinado-maquina.gif",
  },
  {
    id: "supino-reto-maquina",
    name: "Supino Reto na Máquina",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/supino-reto-maquina.gif",
  },
  {
    id: "supino-banco-30-graus",
    name: "Supino Banco 30 Graus com Halter",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/supino-banco-30-graus.gif",
  },
  {
    id: "supino-fechado-com-alteres",
    name: "Supino Fechado com Alteres",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/supino-fechado-com-alteres.gif",
  },
  {
    id: "supino-pegada-fechada-barra",
    name: "Supino Pegada Fechada com Barra",
    muscles: ["peito", "triceps"],
    gifUrl: "/gif-exercise/peito/supino-pegada-fechada-barra.gif",
  },

  // ─── PEITO — CRUCIFIXO / ABERTURA ─────────────────────────
  {
    id: "crucifixo-inclinado-halter",
    name: "Crucifixo Inclinado com Halter",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/crucifixo-inclinado-halter.gif",
  },
  {
    id: "crussifixo-no-banco-reto-com-halteres",
    name: "Crucifixo no Banco Reto com Halteres",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/crussifixo-no-banco-reto-com-halteres.gif",
  },
  {
    id: "crucifixo-declinado-halter",
    name: "Crucifixo Declinado com Halter",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/crucifixo-declinado-halter.gif",
  },
  {
    id: "crossover-cabo-alto",
    name: "Crossover Cabo Alto",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/crucifixo-crossover-alto.gif",
  },
  {
    id: "crucifixo-no-crossover",
    name: "Crucifixo no crossover",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/crucifixo-no-crossover.gif",
  },
  {
    id: "crossover-cabo-baixo",
    name: "Crossover Cabo Baixo",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/crossover-cabo-baixo.gif",
  },
  {
    id: "crossover-cabo-medio",
    name: "Crossover Cabo Médio",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/crossover-cabo-medio.gif",
  },
  {
    id: "fly-maquina-inclinado",
    name: "Fly na Máquina Inclinado",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/fly-maquina-inclinado.gif",
  },
  {
    id: "fly-no-cabo-declinado",
    name: "Fly no cabo declinado",
    muscles: ["peito"],
    gifUrl: "/gif-exercise/peito/decline-cabo-fly.gif",
  },


  // ─── PEITO — AVANÇADOS ────────────────────────────────────
  {
    id: "mergulho-paralela-peito",
    name: "Mergulho nas Paralelas (foco peito)",
    muscles: ["peito", "triceps"],
    gifUrl: "/gif-exercise/peito/mergulho-paralela-peito.gif",
  },

  // ─── OMBRO ────────────────────────────────────────────────
  // ─── OMBRO — NOVOS ────────────────────────────────────────
  {
    id: "elevacao-lateral-cabo",
    name: "Elevação Lateral no Cabo",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/elevacao-lateral-cabo.gif",
  },
  {
    id: "elevacao-lateral-maquina",
    name: "Elevação Lateral na Máquina Unilateral",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/elevacao-lateral-maquina.gif",
  },
  {
    id: "elevacao-frontal-barra",
    name: "Elevação Frontal com Barra",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/elevacao-frontal-barra.gif",
  },
  {
    id: "elevacao-lateral-inclinada",
    name: "Elevação lateral inclinada",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/elevacao-lateral-inclinada.gif",
  },
  {
    id: "elevacao-frontal-cabo",
    name: "Elevação Frontal no Cabo",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/elevacao-frontal-cabo.gif",
  },
  {
    id: "desenvolvimento-arnold",
    name: "Desenvolvimento Arnold",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/desenvolvimento-arnold.gif",
  },
  {
    id: "face-pull-cabo",
    name: "Face Pull no Cabo",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/face-pull-cabo.gif",
  },
  {
    id: "crucifixo-invertido-halter",
    name: "Crucifixo invertido com halteres",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/crucifixo-invertido-halter.gif",
  },
  {
    id: "remada-posterior-sentado",
    name: "Remada posterior sentado",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/remada-posterior-sentado.gif",
  },
  {
    id: "crucifixo-invertido-banco-inclinado",
    name: "Crucifixo invertido no banco inclinado",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/crucifixo-invertido-banco-inclinado.gif",
  },
  {
    id: "crucifixo-invertido-unilateral",
    name: "Crucifixo invertido unilateral",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/crucifixo-invertido-unilateral.gif",
  },
  {
    id: "crucifixo-invertido-crossover",
    name: "Crucifixo invertido no crossover",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/crucifixo-invertido-crossover.gif",
  },
  {
    id: "voador-invertido",
    name: "Voador invertido",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/voador-invertido.gif",
  },
  {
    id: "elevacao-posterior-halter",
    name: "Elevação Posterior com Halter",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/elevacao-posterior-halter.gif",
  },
  {
    id: "desenvolvimento-smith",
    name: "Desenvolvimento no Smith",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/desenvolvimento-smith.gif",
  },
  {
    id: "remada-alta-barra-smith",
    name: "Remada Alta no Smith",
    muscles: ["ombro", "trapezio"],
    gifUrl: "/gif-exercise/ombro/remada-alta-barra-smith.gif",
  },
  {
    id: "remada-alta-halter",
    name: "Remada Alta com Halter",
    muscles: ["ombro", "trapezio"],
    gifUrl: "/gif-exercise/ombro/remada-alta-halter.gif",
  },
  {
    id: "desenvolvimento-maquina",
    name: "Desenvolvimento na Máquina",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/desenvolvimento-maquina.gif",
  },
  {
    id: "desenvolvimento-barra",
    name: "Desenvolvimento com Barra",
    muscles: ["ombro", "triceps"],
    gifUrl: "/gif-exercise/ombro/desenvolvimento-barra-banco.gif",
  },
  {
    id: "elevacao-frontal-halter",
    name: "Elevação Frontal com Halter",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/elevacao-frontal-halter.gif",
  },
  {
    id: "encolhimento-halter",
    name: "Encolhimento com Halter",
    muscles: ["trapezio"],
    gifUrl: "/gif-exercise/ombro/encolhimento-halter.gif",
  },
  {
    id: "ombro-halter",
    name: "Desenvolvimento com Halter",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/ombro-halter.gif",
  },
  {
    id: "ombro-lateral",
    name: "Elevação Lateral com Halter",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/ombro-lateral.gif",
  },
  {
    id: "ombro-lateral-banco",
    name: "Elevação Lateral no Banco",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/ombro-lateral-banco.gif",
  },
  {
    id: "ombro-lateral-maquina",
    name: "Elevação Lateral na Máquina",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/ombro-lateral-maquina.gif",
  },
  {
    id: "ombro-lateral-cabo",
    name: "Elevação lateral com cabo",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/ombro-lateral-cabo.gif",
  },
  {
    id: "remada-alta-barra",
    name: "Remada alta com barra",
    muscles: ["ombro"],
    gifUrl: "/gif-exercise/ombro/remada-alta-barra.gif",
  },

  // ─── COSTAS — PUXADA ──────────────────────────────────────
  {
    id: "puxada-pegada-fechada",
    name: "Puxada com Pegada Fechada",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/puxada-pegada-fechada.gif",
  },
  {
    id: "puxada-neutra",
    name: "Puxada Neutra",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/puxada-neutra.gif",
  },
  {
    id: "puxada-triangulo",
    name: "Puxada com Triângulo",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/puxada-triangulo.gif",
  },
  {
    id: "puxada-na-polia",
    name: "Puxada na polia",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/puxada-na-polia.gif",
  },
  {
    id: "barra-fixa-graviton",
    name: "Barra fixa na máquina (Gráviton)",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/barra-fixa-graviton.gif",
  },
  {
    id: "barra-fixa-supinada",
    name: " Barra fixa supinada",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/barra-fixa-supinada.gif",
  },
  {
    id: "barra-fixa-negativa",
    name: "Barra fixa negativa",
    muscles: ["costas", "biceps"],
    gifUrl: "/gif-exercise/costas/barra-fixa-negativa.gif",
  },
  {
    id: "pull-down-corda",
    name: "pull-down com corda",
    muscles: ["costas", "biceps"],
    gifUrl: "/gif-exercise/costas/pulldown-corda.gif",
  },
  {
    id: "barra-fixa-pronada",
    name: "Barra Fixa Pronada",
    muscles: ["costas", "biceps"],
    gifUrl: "/gif-exercise/costas/barra-fixa-pronada.gif",
  },
  {
    id: "barra-fixa-supinada",
    name: "Barra Fixa Supinada",
    muscles: ["costas", "biceps"],
    gifUrl: "/gif-exercise/costas/barra-fixa-supinada.gif",
  },

  // ─── COSTAS — REMADA ──────────────────────────────────────
  {
    id: "remada-curvada-barra",
    name: "Remada Curvada com Barra",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-curvada-barra.gif",
  },
  {
    id: "remada-supinada-barra",
    name: "Remada Supinada com Barra",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-supinada-barra.gif",
  },
  {
    id: "remada-cabo-triangulo",
    name: "Remada no Cabo com Triângulo",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-cabo-triangulo.gif",
  },
  {
    id: "remada-na-maquina-pegada-aberta",
    name: "Remada na Máquina com Pegada Aberta",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-na-maquina-pegada-aberta.gif",
  },
  {
    id: "remada-smith",
    name: "Remada no Smith",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-smith.gif",
  },
  {
    id: "remada-cavalinho.gif",
    name: "Remada Cavalinho",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-cavalinho.gif",
  },
  {
    id: "remada-inclinada-halter",
    name: "Remada Inclinada com Halter",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-inclinada-halter.gif",
  },
  {
    id: "remada-serrote",
    name: "Remada Serrote com Halter",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-serrote.gif",
  },

  // ─── COSTAS — MÁQUINA ─────────────────────────────────────
  {
    id: "remada-maquina-articulada",
    name: "Remada na máquina articulada",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-maquina-articulada.gif",
  },
  {
    id: "remada-maquina-inclinada",
    name: "Remada no banco inclinado",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-maquina-inclinada.gif",
  },
  {
    id: "remada-maquina-articulada",
    name: "Remada na máquina articulada",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-maquina-articulada.gif",
  },
  {
    id: "remada-articulada-maquina-com-apoio-no-peito",
    name: "Remada articulada na máquina com apoio no peito",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/remada-articulada-maquina-com-apoio-no-peito.gif",
  }, 
  {
    id: "levantamento-terra",
    name: "Levantamento Terra",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/levantamento-terra.gif",
  },

  // ─── COSTAS — ISOLAMENTO ──────────────────────────────────
  {
    id: "encolhimento-trapezio-barra",
    name: "Encolhimento Trapézio com Barra",
    muscles: ["trapezio"],
    gifUrl: "/gif-exercise/costas/encolhimento-trapezio-barra.gif",
  },
  {
    id: "encolhimento-trapezio-maquina",
    name: "Encolhimento Trapézio na Máquina",
    muscles: ["trapezio"],
    gifUrl: "/gif-exercise/costas/encolhimento-trapezio-maquina.gif",
  },
  {
    id: "extensao-lombar-banco",
    name: "Extensão Lombar no Banco",
    muscles: ["costas"],
    gifUrl: "/gif-exercise/costas/extensao-lombar-banco.gif",
  },

  // ─── TRÍCEPS — POLIA ──────────────────────────────────────
  {
    id: "triceps-puxada-no-pulley-pronada",
    name: "Tríceps Puxada no Pulley Pronada",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-puxada-no-pulley-pronada.gif",
  },
  {
    id: "triceps-polia-barra-v",
    name: "Tríceps Polia Barra V",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-polia-barra-v.gif",
  },
  {
    id: "paralelas",
    name: "Paralelas",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/paralelas.gif",
  },
  {
    id: "triceps-banco",
    name: "Tríceps banco",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-banco.gif",
  },
  // ─── TRÍCEPS — BARRA / TESTA ──────────────────────────────
  {
    id: "triceps-testa-barra-reta-ou-w",
    name: "Tríceps Testa com Barra Reta ou W",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-testa-barra-reta-ou-w.gif",
  },
  {
    id: "triceps-testa-cabo",
    name: "Tríceps Testa no Cabo",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-testa-cabo.gif",
  },
  {
    id: "triceps-barra-reta-w",
    name: "Tríceps com barra reta ou W",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-barra-reta-w.gif",
  },
  {
    id: "triceps-supino-fechado",
    name: " Supino fechado",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-supino-fechado.gif",
  },
  {
    id: "triceps-frances-halter",
    name: "Tríceps Francês com Halter",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-frances-halter.gif",
  },
  {
    id: "triceps-barra-invertida",
    name: "Tríceps invertido",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-barra-invertida.gif",
  },

  // ─── TRÍCEPS — MÁQUINA ────────────────────────────────────
  {
    id: "triceps-maquina",
    name: "Tríceps na Máquina",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-maquina.gif",
  },

  // ─── TRÍCEPS — COICE ──────────────────────────────────────
  {
    id: "triceps-coice-cabo",
    name: "Tríceps Coice no Cabo",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-coice-cabo.gif",
  },
  {
    id: "triceps-coice-unilateral",
    name: "Tríceps Coice Unilateral cabo",
    muscles: ["triceps"],
    gifUrl: "/gif-exercise/triceps/triceps-coice-unilateral.gif",
  },

  // ─── TRÍCEPS — PESO CORPORAL ──────────────────────────────
  {
    id: "triceps-banco-elevado",
    name: "Tríceps no Banco Elevado",
    muscles: ["triceps", "peito"],
    gifUrl: "/gif-exercise/triceps/triceps-banco-elevado.gif",
  },

  // ─── PERNAS — AGACHAMENTO ─────────────────────────────────
  {
    id: "agachamento-sumo",
    name: "Agachamento Sumô",
    muscles: ["quadriceps", "gluteo", "adutor"],
    gifUrl: "/gif-exercise/perna/agachamento-sumo.gif",
  },
  {
    id: "agachamento-bulgaro",
    name: "Agachamento Búlgaro com Halter",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "/gif-exercise/perna/agachamento-bulgaro.gif",
  },
  {
    id: "agachamento-smith",
    name: "Agachamento no Smith",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "/gif-exercise/perna/agachamento-smith.gif",
  },
  {
    id: "agachamento-frontal",
    name: "Agachamento Frontal com Barra",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "/gif-exercise/perna/agachamento-frontal.gif",
  },
  {
    id: "agachamento-bulgaro-na-cadeira",
    name: "Agachamento Búlgaro com Apoio na Cadeira",
    muscles: ["quadriceps"],
    gifUrl: "/gif-exercise/perna/agachamento-bulgaro-na-cadeira.gif",
  },
  {
    id: "leg-press-45",
    name: "Leg Press 45 Graus",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "/gif-exercise/perna/leg-press-45.gif",
  },

  // ─── PERNAS — POSTERIOR ───────────────────────────────────
  {
    id: "stiff-barra",
    name: "Stiff com Barra",
    muscles: ["isquiotibiais", "gluteo"],
    gifUrl: "/gif-exercise/perna/stiff-barra.gif",
  },
  {
    id: "stiff-halter-unilateral",
    name: "Stiff com Halter Unilateral",
    muscles: ["isquiotibiais", "gluteo"],
    gifUrl: "/gif-exercise/perna/stiff-halter-unilateral.gif",
  },
  {
    id: "levantamento-terra-sumo",
    name: "Levantamento Terra Sumô",
    muscles: ["isquiotibiais", "gluteo"],
    gifUrl: "/gif-exercise/perna/levantamento-terra-sumo.gif",
  },
  {
    id: "flexora-em-pe",
    name: "Mesa Flexora em Pé",
    muscles: ["isquiotibiais"],
    gifUrl: "/gif-exercise/perna/flexora-em-pe.gif",
  },
  {
    id: "flexora-sentado",
    name: "Mesa Flexora Sentado",
    muscles: ["isquiotibiais"],
    gifUrl: "/gif-exercise/perna/flexora-sentado.gif",
  },
  {
    id: "flexao-nórdica",
    name: "Flexão Nórdica",
    muscles: ["isquiotibiais"],
    gifUrl: "/gif-exercise/perna/flexao-nórdica.gif",
  },
  {
    id: "mesa-flexora",
    name: "Mesa Flexora",
    muscles: ["quadriceps"],
    gifUrl: "/gif-exercise/perna/mesa-flexora.gif",
  },

  // ─── PERNAS — GLÚTEO ──────────────────────────────────────
  {
    id: "elevacao-quadril-barra",
    name: "Elevação Quadril com Barra",
    muscles: ["gluteo"],
    gifUrl: "/gif-exercise/perna/elevacao-quadril-barra.gif",
  },
  {
    id: "elevacao-quadril-maquina",
    name: "Elevação Quadril na Máquina",
    muscles: ["gluteo"],
    gifUrl: "/gif-exercise/perna/elevacao-quadril-maquina.gif",
  },
  {
    id: "gluteo-cabo-unilateral",
    name: "Extensão de Quadril no Cabo",
    muscles: ["gluteo"],
    gifUrl: "/gif-exercise/perna/gluteo-cabo-unilateral.gif",
  },
  {
    id: "4-apoios-gluteo-elastico",
    name: "4 Apoios com Glúteo Elástico",
    muscles: ["gluteo"],
    gifUrl: "/gif-exercise/perna/4-apoios-gluteo-elastico.gif",
  },
  {
    id: "elevacao-pelvica-halter",
    name: "Elevação Pélvica com Halter",
    muscles: ["gluteo"],
    gifUrl: "/gif-exercise/perna/elevacao-pelvica-halter.webp",
  },
  {
    id: "passada-barra",
    name: "Avanço com Barra",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "/gif-exercise/perna/passada-barra.gif",
  },
  {
    id: "passada-halter",
    name: "Avanço com Halter",
    muscles: ["quadriceps", "gluteo"],
    gifUrl: "/gif-exercise/perna/passada-halter.gif",
  },

  // ─── PERNAS — QUADRÍCEPS ──────────────────────────────────
  {
    id: "extensora-unilateral",
    name: "Cadeira Extensora Unilateral",
    muscles: ["quadriceps"],
    gifUrl: "/gif-exercise/perna/extensora-unilateral.gif",
  },
  {
    id: "hack-sumo",
    name: "Agachamento Hack Sumô",
    muscles: ["quadriceps", "gluteo", "adutor"],
    gifUrl: "/gif-exercise/perna/hack-sumo.gif",
  },
  {
    id: "agachamento-isometrico",
    name: "Agachamento Isométrico na Parede",
    muscles: ["quadriceps"],
    gifUrl: "/gif-exercise/perna/agachamento-isometrico.gif",
  },

  // ─── PERNAS — PANTURRILHA ─────────────────────────────────
  {
    id: "panturrilha-sentado",
    name: "Panturrilha Sentado na Máquina",
    muscles: ["panturrilha"],
    gifUrl: "/gif-exercise/perna/panturrilha-sentado.gif",
  },
  {
    id: "panturrilha-leg-press",
    name: "Panturrilha no Leg Press",
    muscles: ["panturrilha"],
    gifUrl: "/gif-exercise/perna/panturrilha-leg-press.gif",
  },

  // ─── ABDÔMEN — CRUNCH / FLEXÃO ────────────────────────────
  {
    id: "crunch-no-cabo",
    name: "Crunch no cabo",
    muscles: ["abdomen"],
    gifUrl: "/gif-exercise/abdomen/crunch-cabo.gif",
  },
  {
    id: "crunch-bicicleta",
    name: "Crunch Bicicleta",
    muscles: ["abdomen"],
    gifUrl: "/gif-exercise/abdomen/crunch-bicicleta.gif",
  },
  {
    id: "abdominal-sentado-banco",
    name: "Abdominal Sentado no Banco",
    muscles: ["abdomen"],
    gifUrl: "/gif-exercise/abdomen/abdominal-sentado-banco.gif",
  },
  {
    id: "elevacao-pernas-deitado",
    name: "Elevação de Pernas Deitado",
    muscles: ["abdomen"],
    gifUrl: "/gif-exercise/abdomen/elevacao-pernas-deitado.gif",
  },

  // ─── ABDÔMEN — OBLÍQUO ────────────────────────────────────
  {
    id: "abdominal-reto",
    name: "Abdominal reto",
    muscles: ["abdomen"],
    gifUrl: "/gif-exercise/abdomen/abdominal-reto.gif",
  },
  {
    id: "abdominal-na-polia",
    name: "Abdominal na polia",
    muscles: ["abdomen"],
    gifUrl: "/gif-exercise/abdomen/abdominal-na-polia.gif",
  },
  {
    id: "abdominal-infra-nas-paralelas",
    name: "Abdominal infra nas paralelas",
    muscles: ["abdomen"],
    gifUrl: "/gif-exercise/abdomen/abdominal-infra-nas-paralelas.gif",
  },
  {
    id: "abdominal-na-maquina",
    name: "Abdominal na máquina",
    muscles: ["abdomen"],
    gifUrl: "/gif-exercise/abdomen/abdominal-na-maquina.gif",
  },


  // ─── ABDÔMEN — PRANCHA / ISOMÉTRICO ──────────────────────
  {
    id: "praancha-abdominal",
    name: "Prancha abdominal",
    muscles: ["abdomen", "core"],
    gifUrl: "/gif-exercise/abdomen/praancha-abdominal.jpeg",
  },
  {
    id: "abdominal-tesoura",
    name: "Abdominal tesoura",
    muscles: ["abdomen", "core"],
    gifUrl: "/gif-exercise/abdomen/abdominal-tesoura.gif",
  },
  {
    id: "abdominal-remador",
    name: "Abdominal remador",
    muscles: ["abdomen", "core"],
    gifUrl: "/gif-exercise/abdomen/abdominal-remador.gif",
  },
  {
    id: "abdominal-infra-solo",
    name: "Abdominal infra solo",
    muscles: ["abdomen", "core"],
    gifUrl: "/gif-exercise/abdomen/abdominal-infra-solo.gif",
  },
  {
    id: "abdominal-cruzado",
    name: "Abdominal cruzado",
    muscles: ["abdomen", "core"],
    gifUrl: "/gif-exercise/abdomen/abdominal-cruzado.gif",
  },
  {
    id: "roda-abdominal",
    name: "Roda abdominal",
    muscles: ["abdomen", "core"],
    gifUrl: "/gif-exercise/abdomen/roda-abdominal.gif",
  },
  {
    id: "abdominal-declinado",
    name: "Abdominal declinado",
    muscles: ["abdomen", "core"],
    gifUrl: "/gif-exercise/abdomen/abdominal-declinado.gif",
  },
  {
    id: "abdominal-oblíquo",
    name: "Abdominal oblíquo",
    muscles: ["abdomen", "core"],
    gifUrl: "/gif-exercise/abdomen/abdominal-oblíquo.gif",
  },
  {
    id: "abdominal-invertido",
    name: "Abdominal invertido",
    muscles: ["abdomen", "core"],
    gifUrl: "/gif-exercise/abdomen/abdominal-invertido.gif",
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

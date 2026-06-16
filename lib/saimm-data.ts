export type Impacto = "verde" | "amarelo" | "vermelho"
export type Dia = "d" | "d1" | "d2"

export interface Regra {
  id: string
  campo: string
  condicao: ">" | "<" | "=="
  valor: number | string
  efeito: string
  impacto: Impacto
  siglas: string[]
  msg: string
}

export interface VariavelMeteorologica {
  label: string
  d: number | string
  d1: number | string
  d2: number | string
  unidade: string
}

export interface EfeitoOperacional {
  label: string
  d: Impacto
  d1: Impacto
  d2: Impacto
  sigla_d: string
  sigla_d1: string
  sigla_d2: string
}

export interface RegiaoEstado {
  dados: Record<string, VariavelMeteorologica>
  efeitos: Record<string, EfeitoOperacional>
  sintese: string
}

export interface AppState {
  regras: Regra[]
  sao_paulo: RegiaoEstado
  minas_gerais: RegiaoEstado
}

export type RegiaoKey = "sao_paulo" | "minas_gerais"
export type RegiaoDOM = "sp" | "mg"

const efeitosPadrao = (): Record<string, EfeitoOperacional> => ({
  tropa: { label: "Para Tropa", d: "verde", d1: "verde", d2: "verde", sigla_d: "", sigla_d1: "", sigla_d2: "" },
  anv_asa_rotativa: { label: "Anv Asa Rotativa", d: "verde", d1: "verde", d2: "verde", sigla_d: "", sigla_d1: "", sigla_d2: "" },
  sarp_0: { label: 'SARP Cat "O"', d: "verde", d1: "verde", d2: "verde", sigla_d: "", sigla_d1: "", sigla_d2: "" },
  sarp_12: { label: "SARP Cat 1 e 2", d: "verde", d1: "verde", d2: "verde", sigla_d: "", sigla_d1: "", sigla_d2: "" },
  fogos: { label: "Fogos / Cortinas de Fumaça", d: "verde", d1: "verde", d2: "verde", sigla_d: "", sigla_d1: "", sigla_d2: "" },
  transitabilidade: { label: "Transitabilidade", d: "verde", d1: "verde", d2: "verde", sigla_d: "", sigla_d1: "", sigla_d2: "" },
  defesa_qbn: { label: "Defesa QBN / Química", d: "verde", d1: "verde", d2: "verde", sigla_d: "", sigla_d1: "", sigla_d2: "" },
  visibilidade: { label: "Visibilidade Terrestre", d: "verde", d1: "verde", d2: "verde", sigla_d: "", sigla_d1: "", sigla_d2: "" },
  sensores_oticos: { label: "Sensores Óticos e Lasers", d: "verde", d1: "verde", d2: "verde", sigla_d: "", sigla_d1: "", sigla_d2: "" },
  sensores_ir: { label: "Sensores IR e Termal", d: "verde", d1: "verde", d2: "verde", sigla_d: "", sigla_d1: "", sigla_d2: "" },
})

export const ESTADO_PADRAO: AppState = {
  regras: [
    // Precipitação / Chuvas (C)
    { id: "r1", campo: "precipitacao", condicao: ">", valor: 25, efeito: "tropa", impacto: "vermelho", siglas: ["C"], msg: "Chuva forte causa desconforto, fadiga acelerada extrema e problemas físicos/psicológicos na tropa." },
    { id: "r2", campo: "precipitacao", condicao: ">", valor: 10, efeito: "sarp_0", impacto: "vermelho", siglas: ["C"], msg: "Precipitação impede decolagem segura e degrada as lentes de busca." },
    { id: "r3", campo: "precipitacao", condicao: ">", valor: 15, efeito: "sarp_12", impacto: "amarelo", siglas: ["C"], msg: "Precipitação reduz rendimento de sensores óticos embarcados." },
    { id: "r4", campo: "precipitacao", condicao: ">", valor: 20, efeito: "transitabilidade", impacto: "vermelho", siglas: ["C", "CS"], msg: "Água acumulada sobre solo argiloso degrada a transitabilidade tática." },
    { id: "r5", campo: "precipitacao", condicao: ">", valor: 15, efeito: "defesa_qbn", impacto: "amarelo", siglas: ["C"], msg: "Precipitação excessiva reduz a persistência tática de agentes de combate químicos depositados no solo." },

    // Neblina / Nebulosidade / Visibilidade (VI / N)
    { id: "r6", campo: "neblina", condicao: "==", valor: "Sim", efeito: "visibilidade", impacto: "vermelho", siglas: ["VI"], msg: "Neblina ou nevoeiro limitam severamente a luminosidade natural e observação horizontal ao nível do solo." },
    { id: "r7", campo: "neblina", condicao: "==", valor: "Sim", efeito: "sensores_oticos", impacto: "vermelho", siglas: ["VI"], msg: "Dispersão de feixes luminosos reduz drasticamente a eficácia de guias de armas e visores óticos." },
    { id: "r8", campo: "neblina", condicao: "==", valor: "Sim", efeito: "anv_asa_rotativa", impacto: "vermelho", siglas: ["VI"], msg: "Restrição severa de voo tático visual rasante e operações aeromóveis." },
    { id: "r9", campo: "nebulosidade", condicao: "==", valor: "Alta", efeito: "anv_asa_rotativa", impacto: "amarelo", siglas: ["N"], msg: "Teto de nuvens baixo impõe limitações em vetores táticos aéreos." },
    { id: "r10", campo: "nebulosidade", condicao: "==", valor: "Alta", efeito: "sarp_12", impacto: "amarelo", siglas: ["N"], msg: "Camadas densas de nuvens bloqueiam a claridade e aquisição de alvos por sensores de drones." },

    // Ventos (V)
    { id: "r11", campo: "vento_velocidade", condicao: ">", valor: 35, efeito: "anv_asa_rotativa", impacto: "vermelho", siglas: ["V"], msg: "Ventos acima do limite tático operacional para aproximação e pouso em zona de combate." },
    { id: "r12", campo: "vento_velocidade", condicao: ">", valor: 22, efeito: "sarp_0", impacto: "vermelho", siglas: ["V"], msg: "Estabilidade de SARPs de categoria inicial excedida por ventos de cauda ou cruzados." },
    { id: "r13", campo: "vento_velocidade", condicao: ">", valor: 25, efeito: "fogos", impacto: "amarelo", siglas: ["V"], msg: "Ventos alteram cálculos balísticos e dispersam cortinas de fumaça (fumígenos)." },
    { id: "r14", campo: "vento_velocidade", condicao: ">", valor: 25, efeito: "defesa_qbn", impacto: "vermelho", siglas: ["V"], msg: "A velocidade e direção de vento provocam deriva acelerada imprevisível de agentes de defesa QBN." },

    // Umidade / Calor Absoluto (U)
    { id: "r15", campo: "umidade_min", condicao: "<", valor: 30, efeito: "tropa", impacto: "amarelo", siglas: ["U"], msg: "Baixa umidade relativa provoca desidratação acelerada e riscos fisiológicos à tropa." },
    { id: "r16", campo: "temp_max", condicao: ">", valor: 33, efeito: "tropa", impacto: "amarelo", siglas: ["U"], msg: "Temperatura absoluta extrema reduz o rendimento combativo do pessoal e o funcionamento dos armamentos." },

    // Solo Encharcado (CS / CE)
    { id: "r17", campo: "solo_encharcado", condicao: "==", valor: "Sim", efeito: "transitabilidade", impacto: "vermelho", siglas: ["CS", "CE"], msg: "Solo argiloso saturado bloqueia passagem de viaturas táticas pesadas de rodas." },

    // Tempestades Elétricas / Raios (TE)
    { id: "r18", campo: "tempestade_eletrica", condicao: "==", valor: "Sim", efeito: "tropa", impacto: "vermelho", siglas: ["TE"], msg: "Alto risco de descargas de raios em depósitos de combustível, munições e patrulhas." },
    { id: "r19", campo: "tempestade_eletrica", condicao: "==", valor: "Sim", efeito: "sensores_ir", impacto: "vermelho", siglas: ["TE"], msg: "Raios e estática impedem a utilização estável do espectro eletromagnético de radares e sensores térmicos." },
    { id: "r20", campo: "tempestade_eletrica", condicao: "==", valor: "Sim", efeito: "sensores_oticos", impacto: "vermelho", siglas: ["TE"], msg: "Flash atmosférico constante e perturbação impedem o rastreamento ótico preciso." },

    // Estabilidade Térmica
    { id: "r21", campo: "inversao_termica", condicao: "==", valor: "Não", efeito: "defesa_qbn", impacto: "amarelo", siglas: ["CS"], msg: "Instabilidade vertical (Lapse) dispersa agentes táticos e cortinas de fumaça sem que fiquem concentrados." },
  ],
  sao_paulo: {
    dados: {
      previsao: { label: "Previsão do Tempo", d: "Nublado com pancadas", d1: "Tempestades isoladas", d2: "Sol entre nuvens", unidade: "" },
      precipitacao: { label: "Precipitação", d: 12, d1: 45, d2: 2, unidade: "mm" },
      temp_max: { label: "Temperatura Máxima", d: 28, d1: 24, d2: 27, unidade: "ºC" },
      temp_min: { label: "Temperatura Mínima", d: 19, d1: 17, d2: 18, unidade: "ºC" },
      vento_direcao: { label: "Direção do Vento", d: "SSE", d1: "SW", d2: "E", unidade: "" },
      vento_velocidade: { label: "Velocidade do Vento", d: 15, d1: 38, d2: 12, unidade: "km/h" },
      umidade_max: { label: "Umidade Máxima", d: 90, d1: 98, d2: 85, unidade: "%" },
      umidade_min: { label: "Umidade Mínima", d: 55, d1: 70, d2: 45, unidade: "%" },
      visibilidade: { label: "Visibilidade", d: 8, d1: 2, d2: 10, unidade: "km" },
      neblina: { label: "Neblina", d: "Não", d1: "Sim", d2: "Não", unidade: "" },
      nebulosidade: { label: "Nebulosidade (Nuvens)", d: "Média", d1: "Alta", d2: "Baixa", unidade: "" },
      tempestade_eletrica: { label: "Tempestade Elétrica", d: "Não", d1: "Sim", d2: "Não", unidade: "" },
      inversao_termica: { label: "Inversão Térmica", d: "Sim", d1: "Não", d2: "Sim", unidade: "" },
      dados_solares: { label: "Dados Solares", d: "Nascer: 06h12 / Pôr: 18h04", d1: "Nascer: 06h13 / Pôr: 18h03", d2: "Nascer: 06h13 / Pôr: 18h03", unidade: "" },
      dados_lunares: { label: "Dados Lunares", d: "Lua Cheia (96% Ilum.)", d1: "Lua Cheia (90% Ilum.)", d2: "Minguante (82% Ilum.)", unidade: "" },
      solo_encharcado: { label: "Solo Encharcado", d: "Não", d1: "Sim", d2: "Sim", unidade: "" },
    },
    efeitos: efeitosPadrao(),
    sintese: "Selecione gerar síntese automática ou edite este texto livremente.",
  },
  minas_gerais: {
    dados: {
      previsao: { label: "Previsão do Tempo", d: "Poucas nuvens", d1: "Parcialmente nublado", d2: "Nevoeiro matinal", unidade: "" },
      precipitacao: { label: "Precipitação", d: 0, d1: 2, d2: 0, unidade: "mm" },
      temp_max: { label: "Temperatura Máxima", d: 34, d1: 30, d2: 29, unidade: "ºC" },
      temp_min: { label: "Temperatura Mínima", d: 18, d1: 18, d2: 15, unidade: "ºC" },
      vento_direcao: { label: "Direção do Vento", d: "NE", d1: "E", d2: "ENE", unidade: "" },
      vento_velocidade: { label: "Velocidade do Vento", d: 24, d1: 22, d2: 10, unidade: "km/h" },
      umidade_max: { label: "Umidade Máxima", d: 65, d1: 75, d2: 95, unidade: "%" },
      umidade_min: { label: "Umidade Mínima", d: 22, d1: 32, d2: 50, unidade: "%" },
      visibilidade: { label: "Visibilidade", d: 10, d1: 8, d2: 1.5, unidade: "km" },
      neblina: { label: "Neblina", d: "Não", d1: "Não", d2: "Sim", unidade: "" },
      nebulosidade: { label: "Nebulosidade (Nuvens)", d: "Baixa", d1: "Média", d2: "Alta", unidade: "" },
      tempestade_eletrica: { label: "Tempestade Elétrica", d: "Não", d1: "Não", d2: "Não", unidade: "" },
      inversao_termica: { label: "Inversão Térmica", d: "Sim", d1: "Sim", d2: "Não", unidade: "" },
      dados_solares: { label: "Dados Solares", d: "Nascer: 06h14 / Pôr: 17h58", d1: "Nascer: 06h14 / Pôr: 17h57", d2: "Nascer: 06h15 / Pôr: 17h57", unidade: "" },
      dados_lunares: { label: "Dados Lunares", d: "Lua Cheia (97% Ilum.)", d1: "Lua Cheia (91% Ilum.)", d2: "Minguante (83% Ilum.)", unidade: "" },
      solo_encharcado: { label: "Solo Encharcado", d: "Não", d1: "Não", d2: "Não", unidade: "" },
    },
    efeitos: efeitosPadrao(),
    sintese: "Selecione gerar síntese automática ou edite este texto livremente.",
  },
}

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export const regiaoKeyFromDOM = (idDOM: RegiaoDOM): RegiaoKey =>
  idDOM === "sp" ? "sao_paulo" : "minas_gerais"

export const domFromRegiaoKey = (regiao: RegiaoKey): RegiaoDOM =>
  regiao === "sao_paulo" ? "sp" : "mg"

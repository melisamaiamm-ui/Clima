import type { AppState, Dia, Impacto, RegiaoKey } from "./saimm-data"

const DIAS: Dia[] = ["d", "d1", "d2"]

/**
 * Reavalia todos os efeitos operacionais de uma região aplicando o motor de regras
 * doutrinárias. Retorna um novo objeto AppState (imutável).
 */
export function reavaliarImpactos(state: AppState, regiao: RegiaoKey): AppState {
  const next: AppState = JSON.parse(JSON.stringify(state))
  const dataRegiao = next[regiao]

  // Reseta impactos e siglas
  Object.keys(dataRegiao.efeitos).forEach((efeitoKey) => {
    const ef = dataRegiao.efeitos[efeitoKey]
    ef.d = "verde"
    ef.d1 = "verde"
    ef.d2 = "verde"
    ef.sigla_d = ""
    ef.sigla_d1 = ""
    ef.sigla_d2 = ""
  })

  DIAS.forEach((dia) => {
    Object.keys(dataRegiao.efeitos).forEach((efeitoKey) => {
      const efeitoOperacional = dataRegiao.efeitos[efeitoKey]
      let maxImpacto: Impacto = "verde"
      const siglasAcumuladas = new Set<string>()

      next.regras.forEach((regra) => {
        if (regra.efeito !== efeitoKey) return
        const dadoMeteorologico = dataRegiao.dados[regra.campo]
        if (!dadoMeteorologico) return

        const valorMedido = dadoMeteorologico[dia]
        let condicaoAtendida = false

        if (regra.condicao === ">") {
          condicaoAtendida = parseFloat(String(valorMedido)) > parseFloat(String(regra.valor))
        } else if (regra.condicao === "<") {
          condicaoAtendida = parseFloat(String(valorMedido)) < parseFloat(String(regra.valor))
        } else if (regra.condicao === "==") {
          condicaoAtendida =
            String(valorMedido).toLowerCase().trim() === String(regra.valor).toLowerCase().trim()
        }

        if (condicaoAtendida) {
          if (regra.impacto === "vermelho") {
            maxImpacto = "vermelho"
          } else if (regra.impacto === "amarelo" && maxImpacto !== "vermelho") {
            maxImpacto = "amarelo"
          }

          if (regra.impacto === "vermelho" || regra.impacto === "amarelo") {
            ;(regra.siglas || []).forEach((sigla) => siglasAcumuladas.add(sigla))
          }
        }
      })

      efeitoOperacional[dia] = maxImpacto
      const siglaKey = `sigla_${dia}` as "sigla_d" | "sigla_d1" | "sigla_d2"
      efeitoOperacional[siglaKey] =
        maxImpacto !== "verde" && siglasAcumuladas.size > 0
          ? Array.from(siglasAcumuladas).join(", ")
          : ""
    })
  })

  next[regiao].sintese = calcularSintese(next, regiao)
  return next
}

export function atualizarTodasAvaliacoes(state: AppState): AppState {
  let next = reavaliarImpactos(state, "sao_paulo")
  next = reavaliarImpactos(next, "minas_gerais")
  return next
}

/**
 * Compila o parecer doutrinário automático (texto sintético) para uma região.
 */
export function calcularSintese(state: AppState, regiao: RegiaoKey): string {
  const dataRegiao = state[regiao]
  const impactosVermelhos: string[] = []
  const impactosAmarelos: string[] = []

  Object.keys(dataRegiao.efeitos).forEach((key) => {
    const efeito = dataRegiao.efeitos[key]
    if (efeito.d === "vermelho" || efeito.d1 === "vermelho" || efeito.d2 === "vermelho") {
      impactosVermelhos.push(efeito.label)
    } else if (efeito.d === "amarelo" || efeito.d1 === "amarelo" || efeito.d2 === "amarelo") {
      impactosAmarelos.push(efeito.label)
    }
  })

  const nomeRegiao = regiao === "sao_paulo" ? "São Paulo" : "Minas Gerais"
  const d = dataRegiao.dados
  const num = (v: number | string) => parseFloat(String(v))

  let sinteseTexto = ""

  if (impactosVermelhos.length === 0 && impactosAmarelos.length === 0) {
    sinteseTexto = `REOP REGIONAL ${nomeRegiao.toUpperCase()}: Condições táticas ideais de D a D+2. O perfil atmosférico e a ausência de precipitações severas garantem total transitabilidade de blindados e plena operação eletromagnética dos sensores.`
  } else {
    sinteseTexto = `REOP REGIONAL ${nomeRegiao.toUpperCase()}: Planejamento requer reavaliação. `

    if (num(d.precipitacao?.d1) > 25 || num(d.precipitacao?.d) > 25) {
      sinteseTexto += `O elevado índice pluviométrico previsto degradará de forma crítica a transitabilidade devido à saturação rápida do solo argiloso, além de provocar desconforto, fadiga aguda e redução da persistência de agentes químicos terrestres. `
    }
    if (d.tempestade_eletrica?.d1 === "Sim" || d.tempestade_eletrica?.d === "Sim") {
      sinteseTexto += `A atividade elétrica severa detectada gera perigo de relâmpagos sobre depósitos de munição e combustível, além de induzir perturbação eletromagnética intensa, inviabilizando transmissões e a acurácia de radares e sensores térmicos/IR. `
    }
    if (d.neblina?.d1 === "Sim" || d.neblina?.d === "Sim" || d.neblina?.d2 === "Sim") {
      sinteseTexto += `Nevoeiro e neblina densa limitarão severamente a visibilidade tática e a luminosidade ao nível do solo, degradando o guiamento de sensores óticos e lasers. `
    }
    if (num(d.vento_velocidade?.d1) > 30 || num(d.vento_velocidade?.d) > 30) {
      sinteseTexto += `Ventos com rajadas elevadas prejudicarão a trajetória balística de fogos de artilharia, impossibilitarão o voo seguro de aeronaves de asa rotativa e espalharão descontroladamente cortinas de fumaça (fumígenos). `
    }
    if (d.inversao_termica?.d1 === "Não" || d.inversao_termica?.d === "Não") {
      sinteseTexto += `A ausência de inversão térmica (instabilidade térmica vertical) reduz o teto de fumaça e impede a fixação estável de cortinas de fumaça e agentes de defesa QBN. `
    }

    sinteseTexto += `\n\nImpacto SEVERO em: ${
      impactosVermelhos.length > 0 ? impactosVermelhos.join(", ") : "Nenhum"
    }. Impacto MODERADO em: ${
      impactosAmarelos.length > 0 ? impactosAmarelos.join(", ") : "Nenhum"
    }.`
  }

  return sinteseTexto
}

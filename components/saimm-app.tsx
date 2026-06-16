"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { AppState, Dia, Impacto, Regra, RegiaoDOM, RegiaoKey } from "@/lib/saimm-data"
import { ESTADO_PADRAO, clone } from "@/lib/saimm-data"
import { atualizarTodasAvaliacoes, calcularSintese, reavaliarImpactos } from "@/lib/saimm-engine"
import { useToast } from "@/components/toast"
import { RegionTable } from "@/components/region-table"
import { RulesModal } from "@/components/rules-modal"
import { AddModal, type NovoElemento } from "@/components/add-modal"

const ALERTA_PADRAO_SP =
  "Instabilidade atmosférica prevista em D+1. Pancadas com alto índice pluviométrico, descargas elétricas induzindo perturbação de espectro e saturação do solo."
const ALERTA_PADRAO_MG =
  "Zonas de baixa umidade extrema (limiares críticos de 22%) e forte gradiente de temperatura absoluta em D e D+1. Atenção especial à exaustão física da tropa."

export function SaimmApp() {
  const { showToast } = useToast()
  const [state, setState] = useState<AppState>(() => atualizarTodasAvaliacoes(clone(ESTADO_PADRAO)))
  const [abaAtiva, setAbaAtiva] = useState<RegiaoDOM>("sp")

  const [alertaSP, setAlertaSP] = useState(ALERTA_PADRAO_SP)
  const [alertaMG, setAlertaMG] = useState(ALERTA_PADRAO_MG)

  const [rulesOpen, setRulesOpen] = useState(false)
  const [addModal, setAddModal] = useState<{ open: boolean; tipo: "variavel" | "efeito"; regiaoDOM: RegiaoDOM }>({
    open: false,
    tipo: "variavel",
    regiaoDOM: "sp",
  })

  // ---- Handlers de dados ----
  const handleDataChange = useCallback((regiao: RegiaoKey, campo: string, dia: Dia, valor: string) => {
    setState((prev) => {
      const next = clone(prev)
      const numero = parseFloat(valor)
      next[regiao].dados[campo][dia] = isNaN(numero) ? valor : numero
      return reavaliarImpactos(next, regiao)
    })
  }, [])

  const handleImpactoChange = useCallback(
    (regiao: RegiaoKey, efeito: string, dia: Dia, valor: Impacto) => {
      setState((prev) => {
        const next = clone(prev)
        next[regiao].efeitos[efeito][dia] = valor
        if (valor === "verde") {
          const siglaKey = `sigla_${dia}` as "sigla_d" | "sigla_d1" | "sigla_d2"
          next[regiao].efeitos[efeito][siglaKey] = ""
        }
        return next
      })
      showToast("Ajuste Manual", "Nível de impacto modificado manualmente.", "info")
    },
    [showToast],
  )

  const handleSiglaChange = useCallback((regiao: RegiaoKey, efeito: string, dia: Dia, valor: string) => {
    setState((prev) => {
      const next = clone(prev)
      const siglaKey = `sigla_${dia}` as "sigla_d" | "sigla_d1" | "sigla_d2"
      next[regiao].efeitos[efeito][siglaKey] = valor.toUpperCase()
      return next
    })
  }, [])

  const handleSinteseChange = useCallback((regiao: RegiaoKey, valor: string) => {
    setState((prev) => {
      const next = clone(prev)
      next[regiao].sintese = valor
      return next
    })
  }, [])

  const handleCompilarSintese = useCallback((regiao: RegiaoKey) => {
    setState((prev) => {
      const next = clone(prev)
      next[regiao].sintese = calcularSintese(next, regiao)
      return next
    })
  }, [])

  const handleRemoverVariavel = useCallback(
    (regiao: RegiaoKey, key: string) => {
      setState((prev) => {
        const next = clone(prev)
        delete next[regiao].dados[key]
        return reavaliarImpactos(next, regiao)
      })
      showToast("Variável Removida", "Variável climática retirada da visualização.", "info")
    },
    [showToast],
  )

  const handleRemoverEfeito = useCallback(
    (regiao: RegiaoKey, key: string) => {
      setState((prev) => {
        const next = clone(prev)
        delete next[regiao].efeitos[key]
        return reavaliarImpactos(next, regiao)
      })
      showToast("Ação Removida", "Ação militar retirada dos cálculos.", "info")
    },
    [showToast],
  )

  // ---- Controles globais ----
  const handleReavaliarTudo = useCallback(() => {
    setState((prev) => atualizarTodasAvaliacoes(clone(prev)))
    showToast(
      "Avaliação Concluída",
      "Matriz de impacto e diagnóstico tático gerados sob critérios do Manual de Campanha.",
      "success",
    )
  }, [showToast])

  const handleZerar = useCallback(() => {
    setState(() => {
      const next = clone(ESTADO_PADRAO)
      ;(["sao_paulo", "minas_gerais"] as RegiaoKey[]).forEach((reg) => {
        Object.keys(next[reg].dados).forEach((key) => {
          next[reg].dados[key].d = ""
          next[reg].dados[key].d1 = ""
          next[reg].dados[key].d2 = ""
        })
        Object.keys(next[reg].efeitos).forEach((key) => {
          const ef = next[reg].efeitos[key]
          ef.d = "verde"
          ef.d1 = "verde"
          ef.d2 = "verde"
          ef.sigla_d = ""
          ef.sigla_d1 = ""
          ef.sigla_d2 = ""
        })
        next[reg].sintese = "Aguardando inserção de dados pelo Operador."
      })
      return next
    })
    showToast("Matriz Zerada", "Todos os dados foram limpos para entrada manual.", "info")
  }, [showToast])

  const handleSincronizar = useCallback(async () => {
    showToast("Sincronizando", "Conectando ao banco de dados climatológicos do INMET e Defesa Civil...", "info")
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setState((prev) => {
      const next = clone(prev)
      next.sao_paulo.dados.precipitacao.d = 12
      next.sao_paulo.dados.precipitacao.d1 = 45
      next.sao_paulo.dados.vento_velocidade.d1 = 38
      next.sao_paulo.dados.tempestade_eletrica.d1 = "Sim"
      next.sao_paulo.dados.neblina.d2 = "Sim"

      next.minas_gerais.dados.temp_max.d = 35
      next.minas_gerais.dados.umidade_min.d = 18
      next.minas_gerais.dados.precipitacao.d2 = 28

      return atualizarTodasAvaliacoes(next)
    })

    setAlertaSP(
      "Alerta Ativo INMET: Tempestade elétrica em D+1 provocando anomalia eletromagnética em receptores terrestres.",
    )
    setAlertaMG(
      "Alerta Ativo INMET: Baixa umidade extrema de 18% em D e D+1; Risco de exaustão tática severa das frações.",
    )

    showToast("Dados Atualizados", "Sincronização de satélite efetuada com sucesso.", "success")
  }, [showToast])

  // ---- Regras ----
  const handleUpdateRegra = useCallback((index: number, campo: keyof Regra, valor: string) => {
    setState((prev) => {
      const next = clone(prev)
      ;(next.regras[index] as unknown as Record<string, unknown>)[campo] = valor
      return next
    })
  }, [])

  const handleUpdateSiglas = useCallback((index: number, valor: string) => {
    setState((prev) => {
      const next = clone(prev)
      next.regras[index].siglas = valor
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0)
      return next
    })
  }, [])

  const handleAdicionarRegra = useCallback(() => {
    setState((prev) => {
      const next = clone(prev)
      next.regras.push({
        id: "custom_" + Date.now(),
        campo: "precipitacao",
        condicao: ">",
        valor: "30",
        efeito: "tropa",
        impacto: "vermelho",
        siglas: ["C"],
        msg: "Regra customizada inserida pelo planejador operacional",
      })
      return next
    })
  }, [])

  const handleRemoverRegra = useCallback((index: number) => {
    setState((prev) => {
      const next = clone(prev)
      next.regras.splice(index, 1)
      return next
    })
  }, [])

  const handleSalvarRegras = useCallback(() => {
    setRulesOpen(false)
    setState((prev) => atualizarTodasAvaliacoes(clone(prev)))
    showToast("Regras Atualizadas", "O motor de decisões reavaliou todos os impactos táticos.", "success")
  }, [showToast])

  // ---- Adicionar elemento ----
  const handleAbrirAdicionar = useCallback((regiaoDOM: RegiaoDOM, tipo: "variavel" | "efeito") => {
    setAddModal({ open: true, tipo, regiaoDOM })
  }, [])

  const handleSalvarNovoElemento = useCallback(
    (dados: NovoElemento) => {
      if (!dados.key || !dados.label) {
        showToast("Erro de Validação", "Campos identificador e nome são obrigatórios.", "error")
        return
      }
      const regiaoTarget: RegiaoKey = addModal.regiaoDOM === "sp" ? "sao_paulo" : "minas_gerais"

      setState((prev) => {
        const next = clone(prev)
        if (addModal.tipo === "variavel") {
          next[regiaoTarget].dados[dados.key] = {
            label: dados.label,
            d: "",
            d1: "",
            d2: "",
            unidade: dados.unidade,
          }
        } else {
          next[regiaoTarget].efeitos[dados.key] = {
            label: dados.label,
            d: dados.impacto,
            d1: dados.impacto,
            d2: dados.impacto,
            sigla_d: "",
            sigla_d1: "",
            sigla_d2: "",
          }
        }
        return reavaliarImpactos(next, regiaoTarget)
      })

      setAddModal((m) => ({ ...m, open: false }))
      showToast("Sucesso", `${dados.label} incluído na matriz de ${addModal.regiaoDOM.toUpperCase()}.`, "success")
    },
    [addModal, showToast],
  )

  // ---- Exportação via html2canvas ----
  const exportingRef = useRef(false)
  const handleExportar = useCallback(
    async (idElemento: string, nomeArquivo: string) => {
      if (exportingRef.current) return
      exportingRef.current = true
      showToast("Exportando", "Compilando instantâneo de alta definição para relatórios...", "info")

      try {
        const html2canvas = (await import("html2canvas")).default
        const elemento = document.getElementById(idElemento)
        if (!elemento) throw new Error("Elemento não encontrado")

        const canvas = await html2canvas(elemento, {
          backgroundColor: "#f8fafc",
          scale: 2,
          logging: false,
          useCORS: true,
          ignoreElements: (el) =>
            el.classList.contains("no-export") ||
            (el.tagName === "BUTTON" && (el as HTMLElement).innerText === "×"),
        })

        const link = document.createElement("a")
        link.download = `${nomeArquivo}_${new Date().toISOString().slice(0, 10)}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()

        showToast("Exportação Concluída", "Imagem gerada e salva com sucesso na pasta de downloads.", "success")
      } catch (err) {
        console.error("[v0] Erro na exportação:", err)
        showToast("Falha na Exportação", "Erro ao renderizar arquivo PNG localmente.", "error")
      } finally {
        exportingRef.current = false
      }
    },
    [showToast],
  )

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-700 p-4 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-md text-slate-950 font-bold tracking-wider text-xs">
              ESTADO-MAIOR / C2
            </div>
            <div>
              <h1 className="text-xl font-mono tracking-wider font-bold text-slate-100 uppercase">SAIMM v3.2</h1>
              <p className="text-xs text-slate-300">
                Planejamento de Operações sob Diretrizes Climatológicas do Manual de Campanha
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={handleSincronizar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.228 10H18.22m3.38 5.5a10 10 0 01-19.12-1.5" />
              </svg>
              Sincronizar Dados Oficiais
            </button>
            <button
              onClick={handleReavaliarTudo}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Reavaliar Matriz
            </button>
            <button
              onClick={() => setRulesOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Regras Doutrinárias
            </button>
            <button
              onClick={handleZerar}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded text-xs font-semibold transition"
            >
              Zerar Matriz
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Painel de alertas */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:border-r border-slate-200 md:pr-4 flex items-start gap-3">
            <span className="relative flex h-3 w-3 mt-1 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600" />
            </span>
            <div>
              <span className="font-bold text-blue-600 font-mono text-xs uppercase">
                [ALERTAS METEOROLÓGICOS - SÃO PAULO]
              </span>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">{alertaSP}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 pl-0 md:pl-4">
            <span className="relative flex h-3 w-3 mt-1 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600" />
            </span>
            <div>
              <span className="font-bold text-amber-600 font-mono text-xs uppercase">
                [ALERTAS METEOROLÓGICOS - MINAS GERAIS]
              </span>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">{alertaMG}</p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-200 bg-white p-2 rounded-t-lg shadow-sm">
          <button
            onClick={() => setAbaAtiva("sp")}
            className={`px-6 py-3 font-mono font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              abaAtiva === "sp" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>REOP 01 - SÃO PAULO</span>
          </button>
          <button
            onClick={() => setAbaAtiva("mg")}
            className={`px-6 py-3 font-mono font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              abaAtiva === "mg" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>REOP 02 - MINAS GERAIS</span>
          </button>
        </div>

        <RegionTable
          idDOM="sp"
          titulo="REOP 01 - SÃO PAULO (ZONA SUL / SUDESTE)"
          subtitulo="Matriz de planejamento operacional baseado em climatologia tática aplicada"
          state={state}
          hidden={abaAtiva !== "sp"}
          onDataChange={handleDataChange}
          onImpactoChange={handleImpactoChange}
          onSiglaChange={handleSiglaChange}
          onRemoverVariavel={handleRemoverVariavel}
          onRemoverEfeito={handleRemoverEfeito}
          onSinteseChange={handleSinteseChange}
          onCompilarSintese={handleCompilarSintese}
          onAdicionar={handleAbrirAdicionar}
          onExportar={handleExportar}
        />

        <RegionTable
          idDOM="mg"
          titulo="REOP 02 - MINAS GERAIS (ZONA CENTRO / MONTANHA)"
          subtitulo="Matriz de planejamento operacional baseado em climatologia tática aplicada"
          state={state}
          hidden={abaAtiva !== "mg"}
          onDataChange={handleDataChange}
          onImpactoChange={handleImpactoChange}
          onSiglaChange={handleSiglaChange}
          onRemoverVariavel={handleRemoverVariavel}
          onRemoverEfeito={handleRemoverEfeito}
          onSinteseChange={handleSinteseChange}
          onCompilarSintese={handleCompilarSintese}
          onAdicionar={handleAbrirAdicionar}
          onExportar={handleExportar}
        />

        {/* Legendas */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase mb-3">Nível do Impacto</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500 border border-emerald-600 rounded shadow-sm text-white">
                <span className="text-xs font-bold font-mono tracking-wide">Sem Impacto</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-amber-500 border border-amber-600 rounded shadow-sm text-slate-950">
                <span className="text-xs font-bold font-mono tracking-wide">Moderado</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-rose-600 border border-rose-700 rounded shadow-sm text-white">
                <span className="text-xs font-bold font-mono tracking-wide">Severo</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase mb-2">
              Legenda de Siglas Operacionais
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 font-mono">
              <div><span className="text-slate-900 font-bold">N</span> = Nuvens</div>
              <div><span className="text-slate-900 font-bold">IR</span> = Infravermelho</div>
              <div><span className="text-slate-900 font-bold">TE</span> = Tempestade Elétrica</div>
              <div><span className="text-slate-900 font-bold">CS</span> = Condições do Solo</div>
              <div><span className="text-slate-900 font-bold">U</span> = Umidade</div>
              <div><span className="text-slate-900 font-bold">V</span> = Ventos</div>
              <div><span className="text-slate-900 font-bold">C</span> = Chuva</div>
              <div><span className="text-slate-900 font-bold">CE</span> = Condições da Estrada</div>
              <div><span className="text-slate-900 font-bold">VI</span> = Visibilidade</div>
              <div><span className="text-slate-900 font-bold">ANV</span> = Aeronave de Asa Rotativa</div>
              <div><span className="text-slate-900 font-bold">SARP</span> = Sistema de Aeronave Não Tripulada</div>
            </div>
          </div>
        </section>
      </main>

      <RulesModal
        open={rulesOpen}
        regras={state.regras}
        onClose={() => setRulesOpen(false)}
        onUpdateRegra={handleUpdateRegra}
        onUpdateSiglas={handleUpdateSiglas}
        onAdicionarRegra={handleAdicionarRegra}
        onRemoverRegra={handleRemoverRegra}
        onSalvar={handleSalvarRegras}
      />

      <AddModal
        open={addModal.open}
        tipo={addModal.tipo}
        regiaoDOM={addModal.regiaoDOM}
        onClose={() => setAddModal((m) => ({ ...m, open: false }))}
        onSalvar={handleSalvarNovoElemento}
      />
    </>
  )
}

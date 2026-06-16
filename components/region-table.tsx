"use client"

import type { AppState, Dia, Impacto, RegiaoDOM, RegiaoKey } from "@/lib/saimm-data"
import { regiaoKeyFromDOM } from "@/lib/saimm-data"

const IMPACTO_BG: Record<Impacto, string> = {
  verde: "bg-emerald-500",
  amarelo: "bg-amber-500",
  vermelho: "bg-rose-600",
}

const IMPACTO_TEXT: Record<Impacto, string> = {
  verde: "text-white",
  amarelo: "text-slate-900",
  vermelho: "text-white",
}

const DIAS: Dia[] = ["d", "d1", "d2"]
const DIA_LABELS: Record<Dia, string> = { d: "Dia D (Hoje)", d1: "Dia D+1", d2: "Dia D+2" }

interface RegionTableProps {
  idDOM: RegiaoDOM
  titulo: string
  subtitulo: string
  state: AppState
  hidden: boolean
  onDataChange: (regiao: RegiaoKey, campo: string, dia: Dia, valor: string) => void
  onImpactoChange: (regiao: RegiaoKey, efeito: string, dia: Dia, valor: Impacto) => void
  onSiglaChange: (regiao: RegiaoKey, efeito: string, dia: Dia, valor: string) => void
  onRemoverVariavel: (regiao: RegiaoKey, key: string) => void
  onRemoverEfeito: (regiao: RegiaoKey, key: string) => void
  onSinteseChange: (regiao: RegiaoKey, valor: string) => void
  onCompilarSintese: (regiao: RegiaoKey) => void
  onAdicionar: (idDOM: RegiaoDOM, tipo: "variavel" | "efeito") => void
  onExportar: (idElemento: string, nomeArquivo: string) => void
}

export function RegionTable({
  idDOM,
  titulo,
  subtitulo,
  state,
  hidden,
  onDataChange,
  onImpactoChange,
  onSiglaChange,
  onRemoverVariavel,
  onRemoverEfeito,
  onSinteseChange,
  onCompilarSintese,
  onAdicionar,
  onExportar,
}: RegionTableProps) {
  const regiao = regiaoKeyFromDOM(idDOM)
  const regObj = state[regiao]
  const sufixo = idDOM === "sp" ? "SP" : "MG"

  return (
    <section
      id={`regiao-${idDOM}`}
      className={`bg-white border border-slate-200 rounded-b-xl overflow-hidden shadow-xl relative transition-all duration-300 ${
        hidden ? "hidden" : ""
      }`}
    >
      <div className="p-4 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-lg font-mono font-bold text-slate-800 flex items-center gap-2">
            <span>{titulo}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">{subtitulo}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => onExportar(`regiao-${idDOM}`, `Matriz_Impacto_${sufixo}`)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 w-full sm:w-auto justify-center transition shadow"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar Relatório ({sufixo})
          </button>
        </div>
      </div>

      <div className="p-4 overflow-x-auto" id={`container-tabela-${idDOM}`}>
        <table className="w-full text-sm text-left military-table border-collapse" style={{ minWidth: "800px" }}>
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-mono text-xs tracking-wider">
              <th className="p-3 w-1/3 uppercase font-bold text-left border-slate-300">Variáveis Meteorológicas</th>
              {DIAS.map((dia) => (
                <th key={dia} className="p-3 text-center w-1/5 border-slate-300">
                  {DIA_LABELS[dia]}
                </th>
              ))}
              <th className="p-2 text-center w-12 no-export border-slate-300">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
            {Object.keys(regObj.dados).map((key) => {
              const item = regObj.dados[key]
              return (
                <tr key={key} className="hover:bg-slate-50 text-slate-800 font-mono text-xs">
                  <td className="p-2 font-semibold bg-slate-100 border border-slate-200 flex justify-between items-center text-slate-700">
                    <span>
                      {item.label} {item.unidade ? `(${item.unidade})` : ""}
                    </span>
                  </td>
                  {DIAS.map((dia) => (
                    <td key={dia} className="p-1 border border-slate-200 bg-white text-center">
                      <input
                        type="text"
                        value={String(item[dia])}
                        onChange={(e) => onDataChange(regiao, key, dia, e.target.value)}
                        className="cell-input"
                        aria-label={`${item.label} ${DIA_LABELS[dia]}`}
                      />
                    </td>
                  ))}
                  <td className="p-1 border border-slate-200 text-center no-export">
                    <button
                      onClick={() => onRemoverVariavel(regiao, key)}
                      className="text-rose-600 hover:text-rose-500 font-bold px-2 py-1 text-base"
                      aria-label={`Remover ${item.label}`}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>

          <thead>
            <tr className="bg-slate-200 text-slate-800 font-mono text-xs tracking-wider">
              <th className="p-3 uppercase font-bold text-left border-slate-300">
                Avaliação do Impacto nos Efeitos Operacionais
              </th>
              <th className="p-3 text-center border-slate-300">Dia D</th>
              <th className="p-3 text-center border-slate-300">Dia D+1</th>
              <th className="p-3 text-center border-slate-300">Dia D+2</th>
              <th className="p-2 text-center no-export border-slate-300">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {Object.keys(regObj.efeitos).map((key) => {
              const item = regObj.efeitos[key]
              return (
                <tr key={key} className="hover:bg-slate-50 font-mono text-xs">
                  <td className="p-2 font-semibold bg-slate-100 border border-slate-200 flex justify-between items-center text-slate-700 font-mono">
                    <span>{item.label}</span>
                  </td>
                  {DIAS.map((dia) => {
                    const impacto = item[dia]
                    const siglaKey = `sigla_${dia}` as "sigla_d" | "sigla_d1" | "sigla_d2"
                    return (
                      <td
                        key={dia}
                        className={`p-1 border border-slate-200 text-center transition-all duration-150 ${IMPACTO_BG[impacto]}`}
                      >
                        <div className="flex flex-col gap-1 items-center justify-center">
                          <select
                            value={impacto}
                            onChange={(e) => onImpactoChange(regiao, key, dia, e.target.value as Impacto)}
                            className={`cell-input font-bold bg-transparent rounded text-[10px] w-full max-w-[120px] uppercase cursor-pointer ${IMPACTO_TEXT[impacto]}`}
                            aria-label={`Impacto ${item.label} ${DIA_LABELS[dia]}`}
                          >
                            <option value="verde" className="bg-emerald-500 text-white font-bold">SEM IMPACTO</option>
                            <option value="amarelo" className="bg-amber-500 text-slate-900 font-bold">MODERADO</option>
                            <option value="vermelho" className="bg-rose-600 text-white font-bold">SEVERO</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Siglas..."
                            value={item[siglaKey] || ""}
                            onChange={(e) => onSiglaChange(regiao, key, dia, e.target.value)}
                            className="cell-input text-[10px] uppercase text-slate-800 placeholder-slate-400 focus:placeholder-transparent font-bold"
                            style={{ textAlign: "center" }}
                            aria-label={`Siglas ${item.label} ${DIA_LABELS[dia]}`}
                          />
                        </div>
                      </td>
                    )
                  })}
                  <td className="p-1 border border-slate-200 text-center no-export">
                    <button
                      onClick={() => onRemoverEfeito(regiao, key)}
                      className="text-rose-600 hover:text-rose-500 font-bold px-2 py-1 text-base"
                      aria-label={`Remover ${item.label}`}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onAdicionar(idDOM, "variavel")}
            className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition"
          >
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Variável Climática
          </button>
          <button
            onClick={() => onAdicionar(idDOM, "efeito")}
            className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition"
          >
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Ação Militar / Efeito
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
              Diagnóstico de Comando Tático - {idDOM === "sp" ? "REOP 01" : "REOP 02"} (Editável)
            </label>
            <button
              onClick={() => onCompilarSintese(regiao)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Compilar Parecer Automático
            </button>
          </div>
          <textarea
            rows={4}
            value={regObj.sintese}
            onChange={(e) => onSinteseChange(regiao, e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition leading-relaxed shadow-inner"
          />
        </div>
      </div>
    </section>
  )
}

"use client"

import type { Regra } from "@/lib/saimm-data"

interface RulesModalProps {
  open: boolean
  regras: Regra[]
  onClose: () => void
  onUpdateRegra: (index: number, campo: keyof Regra, valor: string) => void
  onUpdateSiglas: (index: number, valor: string) => void
  onAdicionarRegra: () => void
  onRemoverRegra: (index: number) => void
  onSalvar: () => void
}

export function RulesModal({
  open,
  regras,
  onClose,
  onUpdateRegra,
  onUpdateSiglas,
  onAdicionarRegra,
  onRemoverRegra,
  onSalvar,
}: RulesModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-300 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-mono font-bold text-slate-800 uppercase">Configuração das Regras Meteorológicas</h3>
            <p className="text-xs text-slate-500">Configure as faixas de limite para cálculos de impacto automatizados</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-xl font-bold" aria-label="Fechar">
            &times;
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 text-sm bg-slate-50">
          {regras.map((regra, index) => (
            <div
              key={regra.id}
              className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col gap-2 relative text-xs font-mono shadow-sm"
            >
              <button
                onClick={() => onRemoverRegra(index)}
                className="absolute top-2 right-2 text-rose-600 hover:text-rose-700 font-bold font-sans"
              >
                &times; Remover
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Variável Campo</label>
                  <input
                    type="text"
                    value={regra.campo}
                    onChange={(e) => onUpdateRegra(index, "campo", e.target.value)}
                    className="bg-slate-50 border border-slate-200 p-1 rounded text-slate-800 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Operador</label>
                  <select
                    value={regra.condicao}
                    onChange={(e) => onUpdateRegra(index, "condicao", e.target.value)}
                    className="bg-slate-50 border border-slate-200 p-1 rounded text-slate-800 w-full font-bold"
                  >
                    <option value=">">Maior que (&gt;)</option>
                    <option value="<">Menor que (&lt;)</option>
                    <option value="==">Igual a (==)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Valor Alvo</label>
                  <input
                    type="text"
                    value={String(regra.valor)}
                    onChange={(e) => onUpdateRegra(index, "valor", e.target.value)}
                    className="bg-slate-50 border border-slate-200 p-1 rounded text-slate-800 w-full font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Atinge Operação</label>
                  <input
                    type="text"
                    value={regra.efeito}
                    onChange={(e) => onUpdateRegra(index, "efeito", e.target.value)}
                    className="bg-slate-50 border border-slate-200 p-1 rounded text-slate-800 w-full font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold">Impacto Resultante</label>
                  <select
                    value={regra.impacto}
                    onChange={(e) => onUpdateRegra(index, "impacto", e.target.value)}
                    className="bg-slate-50 border border-slate-200 p-1 rounded text-slate-800 w-full font-bold"
                  >
                    <option value="vermelho">Vermelho (Severo)</option>
                    <option value="amarelo">Amarelo (Moderado)</option>
                    <option value="verde">Verde (Nulo)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold">
                  Siglas Causadoras (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={regra.siglas ? regra.siglas.join(", ") : ""}
                  onChange={(e) => onUpdateSiglas(index, e.target.value)}
                  className="bg-slate-50 border border-slate-200 p-1 rounded text-slate-800 w-full font-bold"
                  placeholder="Ex: C, CS"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2 flex-wrap">
          <button onClick={onAdicionarRegra} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition">
            Adicionar Nova Regra
          </button>
          <button onClick={onSalvar} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-xs font-semibold transition">
            Salvar e Reavaliar
          </button>
          <button onClick={onClose} className="bg-slate-300 hover:bg-slate-400 text-slate-700 px-4 py-1.5 rounded text-xs font-semibold transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

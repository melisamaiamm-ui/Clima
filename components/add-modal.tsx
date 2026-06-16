"use client"

import { useEffect, useState } from "react"
import type { Impacto, RegiaoDOM } from "@/lib/saimm-data"

export interface NovoElemento {
  key: string
  label: string
  unidade: string
  impacto: Impacto
}

interface AddModalProps {
  open: boolean
  tipo: "variavel" | "efeito"
  regiaoDOM: RegiaoDOM
  onClose: () => void
  onSalvar: (dados: NovoElemento) => void
}

export function AddModal({ open, tipo, onClose, onSalvar }: AddModalProps) {
  const [key, setKey] = useState("")
  const [label, setLabel] = useState("")
  const [unidade, setUnidade] = useState("")
  const [impacto, setImpacto] = useState<Impacto>("verde")

  useEffect(() => {
    if (open) {
      setKey("")
      setLabel("")
      setUnidade("")
      setImpacto("verde")
    }
  }, [open])

  if (!open) return null

  const handleSalvar = () => {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9_]/g, "")
    onSalvar({ key: cleanKey, label, unidade, impacto })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-300 w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-mono font-bold text-slate-800 uppercase">
            {tipo === "efeito" ? "Adicionar Efeito Operacional" : "Adicionar Variável Climática"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-xl font-bold" aria-label="Fechar">
            &times;
          </button>
        </div>

        <div className="p-4 space-y-3 bg-slate-50">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Identificação / Chave Interna (sem espaços, ex: vento_critico)
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Nome de Exibição (Visualização na Tabela)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Unidade ou Sigla Padrão (Ex: mm, km/h, ºC)
            </label>
            <input
              type="text"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Opcional"
            />
          </div>
          {tipo === "efeito" && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Impacto Inicial Padrão</label>
              <select
                value={impacto}
                onChange={(e) => setImpacto(e.target.value as Impacto)}
                className="w-full bg-white border border-slate-200 rounded p-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="verde">Verde (Sem Impacto)</option>
                <option value="amarelo">Amarelo (Moderado)</option>
                <option value="vermelho">Vermelho (Severo)</option>
              </select>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={handleSalvar} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-xs font-semibold transition">
            Adicionar
          </button>
          <button onClick={onClose} className="bg-slate-300 hover:bg-slate-400 text-slate-700 px-4 py-1.5 rounded text-xs font-semibold transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

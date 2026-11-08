"use client";

import React, { useState } from "react";
import { MapPin, Check, X, Ruler } from "lucide-react";
import { Field } from "../lib/types";

interface NewFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  polygonGeojson: any;
  areaHa: number;
  perimeterM: number;
  onSave: (fieldData: Partial<Field>) => Promise<void>;
}

export const NewFieldModal: React.FC<NewFieldModalProps> = ({
  isOpen,
  onClose,
  polygonGeojson,
  areaHa,
  perimeterM,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [municipality, setMunicipality] = useState("Blumenau");
  const [owner, setOwner] = useState("Produtor Rural");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      await onSave({
        name: name.trim(),
        municipality,
        state: "SC",
        owner: owner.trim(),
        description: description.trim(),
        address: `${municipality} - Vale do Itajaí`,
        google_maps_url: "",
        geojson: polygonGeojson,
      });
      onClose();
    } catch (err) {
      alert("Erro ao salvar propriedade.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cadastrar Novo Talhão</h3>
              <p className="text-[11px] text-slate-400">Vale do Itajaí, Santa Catarina</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Measured Metrics */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-xl border border-white/5">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Área Calculada</span>
            <div className="text-lg font-bold font-mono text-emerald-400">{areaHa} ha</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Perímetro</span>
            <div className="text-lg font-bold font-mono text-cyan-400">
              {(perimeterM / 1000).toFixed(2)} km
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Nome do Talhão / Piquete *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Piquete 3 - Encosta da Lagoa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Município
              </label>
              <select
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Blumenau">Blumenau</option>
                <option value="Gaspar">Gaspar</option>
                <option value="Indaial">Indaial</option>
                <option value="Pomerode">Pomerode</option>
                <option value="Rio do Sul">Rio do Sul</option>
                <option value="Ituporanga">Ituporanga</option>
                <option value="Timbó">Timbó</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Produtor / Responsável
              </label>
              <input
                type="text"
                placeholder="Nome do produtor"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Observações Agronômicas
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Pastagem de Braquiária com açude de água doce e mata nativa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? "Salvando..." : "Salvar e Analisar Satélite"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

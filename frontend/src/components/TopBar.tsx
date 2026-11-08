"use client";

import React from "react";
import { Satellite, MapPin, Plus, Layers } from "lucide-react";
import { Field, HealthResponse } from "../lib/types";

interface TopBarProps {
  fields: Field[];
  selectedFieldId: number | null;
  onSelectField: (id: number) => void;
  health: HealthResponse | null;
  onStartDrawing: () => void;
  isDrawing: boolean;
  opacity: number;
  onOpacityChange: (v: number) => void;
  basemap: "satellite" | "dark";
  onToggleBasemap: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  fields,
  selectedFieldId,
  onSelectField,
  health,
  onStartDrawing,
  isDrawing,
  opacity,
  onOpacityChange,
  basemap,
  onToggleBasemap,
}) => {
  return (
    <header className="absolute top-3 left-3 right-3 z-30 h-14 px-4 glass-panel rounded-xl flex items-center justify-between shadow-2xl">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Satellite className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white text-base">ValeSat</span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AGRO
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
            Vale do Itajaí • Monitoramento Satelital de Precisão
          </p>
        </div>
      </div>

      {/* Center: Field Selector & Basemap */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <select
            value={selectedFieldId || ""}
            onChange={(e) => onSelectField(Number(e.target.value))}
            className="bg-transparent text-xs font-medium text-slate-200 outline-none cursor-pointer pr-2"
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id} className="bg-slate-900 text-slate-100">
                {f.name} ({f.area_ha} ha)
              </option>
            ))}
          </select>
        </div>

        {/* Opacity Slider */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Opacidade:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="w-20 accent-emerald-500 cursor-pointer"
          />
          <span className="w-7 text-right font-mono text-emerald-400">{Math.round(opacity * 100)}%</span>
        </div>

        <button
          onClick={onToggleBasemap}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 border border-white/10 transition-colors"
          title="Alternar Mapa Base"
        >
          <span>{basemap === "satellite" ? "Satélite Esri" : "Mapa Escuro"}</span>
        </button>
      </div>

      {/* Right: STAC Status & New Field CTA */}
      <div className="flex items-center gap-3">
        <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/60 border border-white/5">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.aws_stac === "online" ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400"
              }`}
            />
            <span className="text-slate-300">AWS S2</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/60 border border-white/5">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.inpe_stac === "online" ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-amber-400"
              }`}
            />
            <span className="text-slate-300">INPE CBERS</span>
          </div>
        </div>

        <button
          onClick={onStartDrawing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-lg transition-all ${
            isDrawing
              ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse shadow-amber-500/20"
              : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold shadow-emerald-500/20"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isDrawing ? "Desenhando..." : "Novo Talhão"}</span>
        </button>
      </div>
    </header>
  );
};

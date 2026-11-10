"use client";

import React, { useState } from "react";
import {
  Satellite,
  MapPin,
  Plus,
  SplitSquareVertical,
  Crosshair,
  FileDown,
  Layers,
  ChevronDown,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Share2
} from "lucide-react";
import { Field, HealthResponse, WeatherResponse } from "../lib/types";
import { WeatherWidget } from "./ui/WeatherWidget";
import { Badge } from "./ui/Badge";

interface HeaderNavProps {
  fields: Field[];
  selectedField: Field | null;
  onSelectField: (id: number) => void;
  health: HealthResponse | null;
  weather: WeatherResponse | null;
  isDrawing: boolean;
  onStartDrawing: () => void;
  isInspectMode: boolean;
  onToggleInspectMode: () => void;
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  onExportGeoTIFF: () => void;
  onExportGeoJSON: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  fields,
  selectedField,
  onSelectField,
  health,
  weather,
  isDrawing,
  onStartDrawing,
  isInspectMode,
  onToggleInspectMode,
  isCompareMode,
  onToggleCompareMode,
  onExportGeoTIFF,
  onExportGeoJSON,
}) => {
  const [farmMenuOpen, setFarmMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  return (
    <header className="absolute top-3 left-3 right-3 z-30 h-14 px-4 glass-panel rounded-2xl flex items-center justify-between shadow-2xl">
      {/* Left: Brand & Farm Context Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Satellite className="w-4 h-4 text-slate-950 font-bold" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold tracking-tight text-white text-sm">ValeSat</span>
              <Badge variant="emerald" size="sm">PRO AGRO</Badge>
            </div>
            <span className="text-[9px] text-slate-400 font-medium tracking-wider uppercase mt-0.5 hidden sm:block">
              Precisão Espacial • SC
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-white/10 hidden md:block" />

        {/* Farm Breadcrumb Dropdown */}
        <div className="relative">
          <button
            onClick={() => setFarmMenuOpen(!farmMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-xs text-white transition-all shadow-sm group"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-1.5 text-left">
              <span className="text-slate-400 hidden lg:inline">Vale do Itajaí /</span>
              <span className="font-semibold text-white">{selectedField?.name || "Selecionar..."}</span>
              {selectedField && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  {selectedField.area_ha} ha
                </span>
              )}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {/* Farm Switcher Dropdown */}
          {farmMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-84 rounded-2xl glass-panel p-2.5 shadow-2xl z-50 border border-white/15 animate-in fade-in duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1 flex items-center justify-between">
                <span>Propriedades do Vale ({fields.length})</span>
                <span className="text-emerald-400">Ativa: #{selectedField?.id}</span>
              </div>
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                {fields.map((f) => {
                  const isSelected = f.id === selectedField?.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        onSelectField(f.id);
                        setFarmMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "hover:bg-slate-800/80 text-slate-300 border border-transparent"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {f.name}
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {f.municipality} - SC • {f.area_ha} ha
                        </div>
                      </div>
                      {f.google_maps_url && (
                        <a
                          href={f.google_maps_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 hover:text-cyan-400 text-slate-500 transition-colors"
                          title="Abrir no Google Maps"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Live Weather Telemetry & Live STAC Ping */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Open-Meteo Telemetry */}
        <WeatherWidget weather={weather} />

        {/* STAC Status indicators */}
        <div className="flex items-center gap-2 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-white/[0.08] text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${health?.aws_stac === "online" ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400"}`} />
            <span className="text-slate-300">AWS S2</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${health?.inpe_stac === "online" ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-amber-400"}`} />
            <span className="text-slate-300">INPE CBERS</span>
          </div>
        </div>
      </div>

      {/* Right: Action Hub & Tools */}
      <div className="flex items-center gap-2">
        {/* Split Screen Compare Button */}
        <button
          onClick={onToggleCompareMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isCompareMode
              ? "bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20"
              : "bg-slate-900/80 hover:bg-slate-800 border-white/[0.08] text-slate-300"
          }`}
          title="Modo Cortina de Comparação: Satélite Real HD vs NDVI"
        >
          <SplitSquareVertical className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Comparar HD</span>
        </button>

        {/* Point Inspector Toggle */}
        <button
          onClick={onToggleInspectMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isInspectMode
              ? "bg-amber-500/25 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 hover:bg-slate-800 border-white/[0.08] text-slate-300"
          }`}
          title="Clique em qualquer ponto do terreno para inspecionar NDVI e solo"
        >
          <Crosshair className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Inspecionar Ponto</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-xs font-semibold text-slate-200 transition-all"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Exportar</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl glass-panel p-1.5 shadow-2xl z-50 border border-white/15 animate-in fade-in duration-150">
              <button
                onClick={() => {
                  onExportGeoTIFF();
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 flex items-center gap-2 transition-colors font-medium"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>GeoTIFF Recortado (QGIS)</span>
              </button>
              <button
                onClick={() => {
                  onExportGeoJSON();
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800/80 flex items-center gap-2 transition-colors font-medium"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Limites GeoJSON</span>
              </button>
            </div>
          )}
        </div>

        {/* New Field Draw Button */}
        <button
          onClick={onStartDrawing}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
            isDrawing
              ? "bg-amber-500 hover:bg-amber-600 text-slate-950 animate-pulse shadow-amber-500/25"
              : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25"
          }`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isDrawing ? "Desenhando..." : "Novo Talhão"}</span>
        </button>
      </div>
    </header>
  );
};

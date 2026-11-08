"use client";

import React from "react";
import {
  Layers,
  Satellite,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Loader2,
  TreePine,
  Droplets,
  Eye,
  Camera,
} from "lucide-react";
import { Field } from "../lib/types";

interface SidebarControlProps {
  fields: Field[];
  selectedField: Field | null;
  onSelectField: (id: number) => void;
  engine: "sentinel-2" | "cbers-4a";
  onSelectEngine: (engine: "sentinel-2" | "cbers-4a") => void;
  layer: "ndvi" | "ndwi" | "rgb" | "pansharpened";
  onSelectLayer: (layer: "ndvi" | "ndwi" | "rgb" | "pansharpened") => void;
  isProcessing: boolean;
  onExportGeoTIFF: () => void;
  onExportGeoJSON: () => void;
}

export const SidebarControl: React.FC<SidebarControlProps> = ({
  fields,
  selectedField,
  onSelectField,
  engine,
  onSelectEngine,
  layer,
  onSelectLayer,
  isProcessing,
  onExportGeoTIFF,
  onExportGeoJSON,
}) => {
  return (
    <aside className="absolute top-20 left-3 bottom-32 w-80 z-20 flex flex-col gap-3 pointer-events-auto">
      {/* Property Details Card */}
      <div className="glass-panel rounded-xl p-3.5 shadow-2xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Propriedade Selecionada
          </span>
          {selectedField?.google_maps_url && (
            <a
              href={selectedField.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              title="Abrir no Google Maps"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold text-white leading-tight">
            {selectedField?.name || "Carregando..."}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedField?.municipality} - {selectedField?.state} • {selectedField?.address}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-slate-900/70 p-2 rounded-lg border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Área Total</span>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              {selectedField?.area_ha ?? "--"} <span className="text-xs font-normal text-slate-400">ha</span>
            </div>
          </div>
          <div className="bg-slate-900/70 p-2 rounded-lg border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Perímetro</span>
            <div className="text-sm font-bold text-cyan-400 font-mono">
              {selectedField ? (selectedField.perimeter_m / 1000).toFixed(2) : "--"}{" "}
              <span className="text-xs font-normal text-slate-400">km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Satellite Engine & Layer Selector */}
      <div className="glass-panel rounded-xl p-3.5 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Satellite className="w-3.5 h-3.5 text-emerald-400" />
            Motor Satelital
          </span>
          {isProcessing && (
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Processando...</span>
            </div>
          )}
        </div>

        {/* Engine Toggle Buttons */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 rounded-lg border border-white/5">
          <button
            onClick={() => onSelectEngine("sentinel-2")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-center transition-all ${
              engine === "sentinel-2"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-xs font-bold">Sentinel-2</span>
            <span className="text-[10px] text-slate-400">10m • 5 dias</span>
          </button>

          <button
            onClick={() => onSelectEngine("cbers-4a")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-center transition-all ${
              engine === "cbers-4a"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-xs font-bold flex items-center gap-1">
              CBERS-4A <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            </span>
            <span className="text-[10px] text-slate-400">2m/8m INPE WPM</span>
          </button>
        </div>

        {/* Sub-Layer Selection */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">
            Camada Espectral:
          </span>
          {engine === "sentinel-2" ? (
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onSelectLayer("ndvi")}
                className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  layer === "ndvi"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                }`}
              >
                <TreePine className="w-3.5 h-3.5" />
                <span>NDVI</span>
                <span className="text-[9px] opacity-80">Biomassa</span>
              </button>

              <button
                onClick={() => onSelectLayer("ndwi")}
                className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  layer === "ndwi"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>NDWI</span>
                <span className="text-[9px] opacity-80">Água/Açude</span>
              </button>

              <button
                onClick={() => onSelectLayer("rgb")}
                className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  layer === "rgb"
                    ? "bg-slate-200 text-slate-950 shadow-md"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>RGB</span>
                <span className="text-[9px] opacity-80">Natural</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectLayer("pansharpened")}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  layer === "pansharpened"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Pansharpened</span>
                <span className="text-[9px] opacity-80">Fusão 2m RGB</span>
              </button>

              <button
                onClick={() => onSelectLayer("ndvi")}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  layer === "ndvi"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                }`}
              >
                <TreePine className="w-3.5 h-3.5" />
                <span>NDVI 2m</span>
                <span className="text-[9px] opacity-80">Alta Resolução</span>
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5 text-[10px]">
          <span className="text-slate-400 font-medium block mb-1">
            {layer === "ndvi" && "Rampa NDVI (RdYlGn): Solo Exposto (Vermelho) -> Pasto Denso (Verde Escuro)"}
            {layer === "ndwi" && "Rampa NDWI (YlGnBu): Seco (Amarelo) -> Lâmina de Lagoa (Azul Profundo)"}
            {layer === "rgb" && "Composição Natural RGB com Realce Percentil 2%-98%"}
            {layer === "pansharpened" && "Fusão Pancromática WPM: 2m Espacial + 8m Espectral"}
          </span>
          {layer === "ndvi" && (
            <div className="h-2 rounded bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-600" />
          )}
          {layer === "ndwi" && (
            <div className="h-2 rounded bg-gradient-to-r from-amber-200 via-teal-400 to-blue-700" />
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="glass-panel rounded-xl p-3 shadow-2xl flex items-center gap-2">
        <button
          onClick={onExportGeoTIFF}
          disabled={isProcessing}
          className="flex-1 py-2 px-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>GeoTIFF Recortado</span>
        </button>

        <button
          onClick={onExportGeoJSON}
          className="py-2 px-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          title="Exportar Limites em GeoJSON"
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>GeoJSON</span>
        </button>
      </div>

      {/* Quick Switcher of Vale do Itajaí Properties */}
      <div className="glass-panel rounded-xl p-3 shadow-2xl flex-1 overflow-y-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          Propriedades no Vale do Itajaí ({fields.length})
        </span>
        <div className="flex flex-col gap-1.5">
          {fields.map((f) => {
            const isSelected = f.id === selectedField?.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectField(f.id)}
                className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between text-xs ${
                  isSelected
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-white/5"
                }`}
              >
                <div className="truncate pr-1">
                  <div className="font-semibold truncate">{f.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{f.municipality} • {f.area_ha} ha</div>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

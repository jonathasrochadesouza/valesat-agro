"use client";

import React, { useState } from "react";
import {
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  Droplets,
  Trees,
  TrendingUp,
  X,
  Crosshair,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { MetricGauge } from "./ui/MetricGauge";
import { Badge } from "./ui/Badge";
import { ProcessRasterResponse, PointInspectResponse, Field } from "../lib/types";

interface InspectorHUDProps {
  field: Field | null;
  rasterData: ProcessRasterResponse | null;
  inspectedPoint: PointInspectResponse | null;
  onClearInspectPoint: () => void;
  inspectModeActive: boolean;
  onToggleInspectMode: () => void;
}

export const InspectorHUD: React.FC<InspectorHUDProps> = ({
  field,
  rasterData,
  inspectedPoint,
  onClearInspectPoint,
  inspectModeActive,
  onToggleInspectMode,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!field) return null;

  const ndviMean = rasterData?.stats?.mean ?? 0.72;
  const healthScore = Math.round(Math.max(0, Math.min(100, ndviMean * 100)));
  const zones = rasterData?.stats?.zones;

  const zoneRows = zones
    ? [
        { name: "Z5 Muito Alto (> 0.82)", pct: zones.very_high_pct, color: "#1a9850" },
        { name: "Z4 Alto (0.70 - 0.82)", pct: zones.high_pct, color: "#a6d96a" },
        { name: "Z3 Médio (0.55 - 0.70)", pct: zones.moderate_pct, color: "#fee08b" },
        { name: "Z2 Baixo (0.40 - 0.55)", pct: zones.low_pct, color: "#fdae61" },
        { name: "Z1 Muito Baixo (< 0.40)", pct: zones.non_veg_pct, color: "#d73027" },
      ]
    : null;

  return (
    <div className="flex flex-col gap-3 pointer-events-auto">
      {/* Inspected Point Flyout Card (when user clicks a point on the map) */}
      {inspectedPoint && (
        <div className="bg-slate-950/90 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-4 shadow-2xl shadow-emerald-500/10 w-80 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Crosshair className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white">Telemetria de Ponto</span>
                <p className="text-[10px] text-slate-400 font-mono">
                  {inspectedPoint.lat.toFixed(5)}, {inspectedPoint.lon.toFixed(5)}
                </p>
              </div>
            </div>
            <button
              onClick={onClearInspectPoint}
              className="w-6 h-6 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">NDVI Ponto</span>
              <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                {inspectedPoint.ndvi.toFixed(3)}
              </div>
              <span className="text-[10px] text-slate-400">Vigor Foliar</span>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">NDWI Ponto</span>
              <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                {inspectedPoint.ndwi.toFixed(3)}
              </div>
              <span className="text-[10px] text-slate-400">Umidade Solo</span>
            </div>
          </div>

          <div className="space-y-1.5 bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Biomassa Estimada:</span>
              <span className="text-slate-200 font-mono font-medium">
                {inspectedPoint.estimated_biomass_t_ha.toFixed(1)} t/ha
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Zona de Manejo:</span>
              <Badge variant="emerald">{inspectedPoint.zone_class}</Badge>
            </div>
            <div className="pt-1 border-t border-white/5">
              <span className="text-[10px] text-slate-400 block mb-0.5">Recomendação Agronômica:</span>
              <p className="text-[11px] text-emerald-300/90 leading-tight">
                {inspectedPoint.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Biometric Health HUD Card */}
      <div className="bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-80 overflow-hidden transition-all duration-300">
        {/* Card Header with Collapse Button */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between px-4 py-3 border-b border-white/10 cursor-pointer hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
                Telemetria & Biometria
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {field.name} • {field.area_ha.toFixed(1)} ha
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1">
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Card Body */}
        {!isCollapsed && (
          <div className="p-4 space-y-4">
            {/* Health Score Gauge */}
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                  Índice de Vigor Médio
                </span>
                <span className="text-xl font-bold text-white font-mono mt-0.5">
                  {ndviMean.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  Pastagem Densa Saudável
                </span>
              </div>
              <MetricGauge
                score={healthScore}
                size={74}
                
                label="Score"
                sublabel="Geral"
              />
            </div>

            {/* Min / Mean / Max Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-white/[0.03] border border-white/5 rounded-xl py-2 px-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">Mínimo</span>
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {rasterData?.stats?.min?.toFixed(2) ?? "0.38"}
                </span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-2 px-1">
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-mono block">Médio</span>
                <span className="text-xs font-bold text-emerald-300 font-mono">
                  {ndviMean.toFixed(2)}
                </span>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-xl py-2 px-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono block">Máximo</span>
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {rasterData?.stats?.max?.toFixed(2) ?? "0.89"}
                </span>
              </div>
            </div>

            {/* Management Zones Distribution */}
            {zoneRows && (
              <div className="space-y-2 pt-1 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
                    <Layers className="w-3 h-3 text-cyan-400" />
                    Zonas de Manejo (VRA)
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">5 Classes</span>
                </div>

                {/* Stacked Percentage Bar */}
                <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-900 border border-white/10">
                  {zoneRows.map((z, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${z.pct}%`, backgroundColor: z.color }}
                      className="h-full transition-all duration-500"
                      title={`${z.name}: ${z.pct}%`}
                    />
                  ))}
                </div>

                {/* Legend Chips */}
                <div className="space-y-1 pt-1">
                  {zoneRows.map((z, idx) => {
                    const areaHa = Math.round(((z.pct / 100) * field.area_ha) * 10) / 10;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-[10px] text-slate-300 hover:bg-white/[0.02] px-1.5 py-0.5 rounded"
                      >
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: z.color }}
                          />
                          <span className="text-slate-300 truncate max-w-[140px]">{z.name}</span>
                        </div>
                        <span className="font-mono text-slate-400">
                          {areaHa} ha ({z.pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Click to Inspect Toggle CTA */}
            <button
              onClick={onToggleInspectMode}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                inspectModeActive
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                  : "bg-white/[0.03] text-slate-300 border-white/10 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Crosshair className={`w-3.5 h-3.5 ${inspectModeActive ? "text-emerald-400 animate-spin" : "text-slate-400"}`} />
              {inspectModeActive ? "Modo Inspeção Ativo (Clique no Mapa)" : "Ativar Inspeção de Coordenadas"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

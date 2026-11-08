"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  BarChart2,
  Cloud,
  Layers,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Field, ProcessRasterResponse, TimelineDataPoint } from "../lib/types";

interface AnalyticsPanelProps {
  selectedField: Field | null;
  rasterData: ProcessRasterResponse | null;
  layer: string;
  timeline: TimelineDataPoint[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  selectedField,
  rasterData,
  layer,
  timeline,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute top-20 right-3 z-20 p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white shadow-2xl flex items-center gap-1.5 text-xs font-semibold"
      >
        <ChevronLeft className="w-4 h-4 text-emerald-400" />
        <span>Analytics</span>
      </button>
    );
  }

  const stats = rasterData?.stats;
  const isNDVI = layer === "ndvi";
  const isNDWI = layer === "ndwi";

  return (
    <div className="absolute top-20 right-3 bottom-32 w-84 z-20 glass-panel rounded-xl p-3.5 shadow-2xl flex flex-col gap-3 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Diagnóstico Agronômico
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Metric Value Card */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{isNDVI ? "NDVI Médio (Vigor)" : isNDWI ? "NDWI Médio (Água)" : "Índice Espectral"}</span>
          <span className="font-mono text-[10px] text-slate-400">
            {rasterData?.execution_time_ms ? `${rasterData.execution_time_ms} ms` : ""}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {stats ? stats.mean.toFixed(2) : "--"}
          </span>
          <span className="text-xs text-slate-400">
            {isNDVI ? "escala -1 a +1" : isNDWI ? "índice de água" : ""}
          </span>
        </div>

        {/* Agronomic Status Badge */}
        <div className="mt-2.5 p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="leading-tight">
            {stats?.agronomic_status || "Aguardando recorte do satélite..."}
          </span>
        </div>

        {rasterData?.notes && (
          <div className="mt-2 text-[10px] text-cyan-300/90 bg-cyan-950/40 p-1.5 rounded border border-cyan-500/20">
            {rasterData.notes}
          </div>
        )}
      </div>

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-900/70 p-2 rounded-lg border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Mínimo</span>
          <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
            {stats ? stats.min.toFixed(2) : "--"}
          </div>
        </div>
        <div className="bg-slate-900/70 p-2 rounded-lg border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Máximo</span>
          <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
            {stats ? stats.max.toFixed(2) : "--"}
          </div>
        </div>
        <div className="bg-slate-900/70 p-2 rounded-lg border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Desvio Pad.</span>
          <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
            {stats ? stats.std.toFixed(2) : "--"}
          </div>
        </div>
      </div>

      {/* Cloud in Field */}
      <div className="bg-slate-900/70 p-2.5 rounded-lg border border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Cloud className="w-3.5 h-3.5 text-cyan-400" />
          <span>Nuvens no Talhão (SCL):</span>
        </div>
        <span className="font-mono font-bold text-emerald-400">
          {stats?.cloud_cover_field_pct ?? 0}%
        </span>
      </div>

      {/* Temporal Evolution Chart */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            Evolução Histórica (6 Meses)
          </span>
        </div>

        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ndwiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} />
              <YAxis domain={[-0.2, 1.0]} tick={{ fill: "#64748b", fontSize: 9 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#f8fafc",
                }}
              />
              <Area
                type="monotone"
                dataKey="ndvi"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#ndviGrad)"
                name="NDVI"
              />
              <Area
                type="monotone"
                dataKey="ndwi"
                stroke="#06b6d4"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#ndwiGrad)"
                name="NDWI"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>NDVI (Biomassa)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>NDWI (Água)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import {
  Activity,
  Layers,
  TrendingUp,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Satellite,
  Sparkles,
  TreePine,
  Droplets,
  Eye,
  Sliders,
  CloudSun,
  Camera,
  Compass,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Field, ProcessRasterResponse, TimelineDataPoint, WeatherResponse } from "../lib/types";
import { SegmentedControl } from "./ui/SegmentedControl";
import { Badge } from "./ui/Badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface ProSidebarProps {
  fields: Field[];
  selectedField: Field | null;
  onSelectField: (id: number) => void;
  engine: "sentinel-2" | "cbers-4a";
  onSelectEngine: (engine: "sentinel-2" | "cbers-4a") => void;
  layer: "ndvi" | "ndwi" | "rgb" | "pansharpened" | "zones";
  onSelectLayer: (layer: "ndvi" | "ndwi" | "rgb" | "pansharpened" | "zones") => void;
  opacity: number;
  onOpacityChange: (v: number) => void;
  blendMode: "normal" | "multiply" | "screen";
  onBlendModeChange: (mode: "normal" | "multiply" | "screen") => void;
  rasterData: ProcessRasterResponse | null;
  timeline: TimelineDataPoint[];
  weather: WeatherResponse | null;
  isProcessing: boolean;
}

export const ProSidebar: React.FC<ProSidebarProps> = ({
  fields,
  selectedField,
  onSelectField,
  engine,
  onSelectEngine,
  layer,
  onSelectLayer,
  opacity,
  onOpacityChange,
  blendMode,
  onBlendModeChange,
  rasterData,
  timeline,
  weather,
  isProcessing,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"monitor" | "zones" | "timeline" | "fields">("monitor");

  const stats = rasterData?.stats;
  const zones = stats?.zones;

  return (
    <aside className="absolute top-20 left-3 bottom-20 z-20 flex pointer-events-auto transition-all duration-300">
      {/* Slim Icon Dock (Always visible) */}
      <div className="w-13 glass-panel rounded-2xl flex flex-col items-center py-3 justify-between shadow-2xl border-r-0">
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => {
              setActiveTab("monitor");
              setCollapsed(false);
            }}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === "monitor" && !collapsed
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Monitoramento Espectral"
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveTab("zones");
              setCollapsed(false);
            }}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === "zones" && !collapsed
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Zonificação Agronômica (VRA)"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveTab("timeline");
              setCollapsed(false);
            }}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === "timeline" && !collapsed
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Série Histórica & Clima"
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveTab("fields");
              setCollapsed(false);
            }}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === "fields" && !collapsed
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Talhões Cadastrados"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expandir Painel" : "Recolher Painel"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-emerald-400" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content Drawer */}
      {!collapsed && (
        <div className="w-84 glass-panel rounded-r-2xl p-4 shadow-2xl flex flex-col gap-4 overflow-y-auto animate-in slide-in-from-left duration-200">
          {/* TAB 1: MONITORAMENTO ESPECTRAL */}
          {activeTab === "monitor" && (
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Satélite & Resolução
                  </span>
                  {isProcessing && (
                    <span className="text-[10px] text-amber-400 font-mono animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Processando...
                    </span>
                  )}
                </div>

                <SegmentedControl
                  value={engine}
                  onChange={(v) => {
                    onSelectEngine(v);
                    if (v === "cbers-4a") {
                      onSelectLayer("pansharpened");
                    } else {
                      onSelectLayer("ndvi");
                    }
                  }}
                  options={[
                    {
                      value: "sentinel-2",
                      label: "Sentinel-2",
                      sublabel: "10m • 5 dias",
                      icon: <Satellite className="w-3.5 h-3.5" />,
                    },
                    {
                      value: "cbers-4a",
                      label: "CBERS-4A",
                      sublabel: "2m WPM INPE",
                      icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
                    },
                  ]}
                />
              </div>

              {/* Spectral Layers */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Camadas de Análise
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectLayer("ndvi")}
                    className={`p-2.5 rounded-xl text-left transition-all border ${
                      layer === "ndvi"
                        ? "bg-emerald-500/20 border-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-slate-900/70 hover:bg-slate-800 border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <TreePine className="w-4 h-4 text-emerald-400" />
                      {layer === "ndvi" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-xs font-bold text-white">NDVI Vigor</div>
                    <div className="text-[10px] text-slate-400">Biomassa de pasto</div>
                  </button>

                  <button
                    onClick={() => onSelectLayer("ndwi")}
                    className={`p-2.5 rounded-xl text-left transition-all border ${
                      layer === "ndwi"
                        ? "bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/20"
                        : "bg-slate-900/70 hover:bg-slate-800 border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      {layer === "ndwi" && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <div className="text-xs font-bold text-white">NDWI Água</div>
                    <div className="text-[10px] text-slate-400">Lagoa & estresse</div>
                  </button>

                  <button
                    onClick={() => onSelectLayer("zones")}
                    className={`p-2.5 rounded-xl text-left transition-all border ${
                      layer === "zones"
                        ? "bg-emerald-500/20 border-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-slate-900/70 hover:bg-slate-800 border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      {layer === "zones" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-xs font-bold text-white">Zonificação</div>
                    <div className="text-[10px] text-slate-400">5 zonas VRA</div>
                  </button>

                  <button
                    onClick={() => onSelectLayer(engine === "cbers-4a" ? "pansharpened" : "rgb")}
                    className={`p-2.5 rounded-xl text-left transition-all border ${
                      layer === "rgb" || layer === "pansharpened"
                        ? "bg-slate-700/50 border-white/40 shadow-md"
                        : "bg-slate-900/70 hover:bg-slate-800 border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Eye className="w-4 h-4 text-slate-300" />
                      {(layer === "rgb" || layer === "pansharpened") && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="text-xs font-bold text-white">
                      {engine === "cbers-4a" ? "Fusão 2m" : "RGB Natural"}
                    </div>
                    <div className="text-[10px] text-slate-400">Visualização HD</div>
                  </button>
                </div>
              </div>

              {/* Opacity & Blend Mode */}
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/[0.08] flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Opacidade da Camada
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Modo de Mesclagem</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    {(["normal", "multiply", "screen"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => onBlendModeChange(m)}
                        className={`px-2 py-0.5 rounded font-mono uppercase ${
                          blendMode === m
                            ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {m === "normal" ? "Normal" : m === "multiply" ? "Multiplicar" : "Realce"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Agronomic status summary */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Diagnóstico da Lavoura
                </div>
                <div className="text-xs font-semibold text-slate-100 leading-snug">
                  {stats?.agronomic_status || "Carregando diagnóstico..."}
                </div>
                {rasterData?.notes && (
                  <p className="text-[10px] text-cyan-300/80 mt-1.5 leading-tight">
                    {rasterData.notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ZONIFICAÇÃO AGRONÔMICA (VRA) */}
          {activeTab === "zones" && (
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Distribuição de Produtividade
                </span>
                <p className="text-[11px] text-slate-400 mb-3">
                  Zonificação de alta precisão baseada no histórico de vigor do talhão para taxa variável de insumos.
                </p>

                {zones ? (
                  <div className="flex flex-col gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-600/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#15803d]" />
                        <div>
                          <div className="text-xs font-bold text-white">Zona 5: Máximo Vigor</div>
                          <div className="text-[10px] text-slate-400">NDVI &gt; 0.75 • Pastagem Densa</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-emerald-400">{zones.very_high_pct}%</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                        <div>
                          <div className="text-xs font-bold text-white">Zona 4: Alto Vigor</div>
                          <div className="text-[10px] text-slate-400">NDVI 0.60 - 0.75 • Ativo</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-emerald-400">{zones.high_pct}%</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-lime-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#a3e635]" />
                        <div>
                          <div className="text-xs font-bold text-white">Zona 3: Moderado</div>
                          <div className="text-[10px] text-slate-400">NDVI 0.45 - 0.60 • Rebrota</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-lime-400">{zones.moderate_pct}%</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                        <div>
                          <div className="text-xs font-bold text-white">Zona 2: Déficit / Atenção</div>
                          <div className="text-[10px] text-slate-400">NDVI 0.25 - 0.45 • Pasto Baixo</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-amber-400">{zones.low_pct}%</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                        <div>
                          <div className="text-xs font-bold text-white">Zona 1: Açude / Solo</div>
                          <div className="text-[10px] text-slate-400">NDVI &lt; 0.25 • Não-vegetado</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-rose-400">{zones.non_veg_pct}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-4 text-center">
                    Selecione a camada de Zonificação para visualizar o mapa de produtividade.
                  </div>
                )}
              </div>

              {/* VRA Action Recommendation */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-xs">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                  Recomendação Agronômica
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Zonas 1 e 2 concentradas nas bordas de acesso da Rua Reinhold Schroeder. Recomenda-se adubação nitrogenada direcionada nas Zonas 3 e descanso de 14 dias para pastejo rotativo nas Zonas 4 e 5.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SÉRIE TEMPORAL E CLIMA */}
          {activeTab === "timeline" && (
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Evolução Histórica (6 Meses)
                </span>
                <div className="h-36 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="ndwiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
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
                      <Area type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#ndviGrad)" name="NDVI" />
                      <Area type="monotone" dataKey="ndwi" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#ndwiGrad)" name="NDWI" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weather Forecast */}
              {weather && weather.forecast && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Previsão de Chuva & Manejo
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {weather.forecast.map((f) => (
                      <div key={f.date} className="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-semibold text-white">{f.date}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-cyan-400">{f.precipitation_probability}% prob</span>
                          <span className="text-slate-300 font-bold">{f.temp_min}°C / {f.temp_max}°C</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TALHÕES DO VALE DO ITAJAÍ */}
          {activeTab === "fields" && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Propriedades Cadastradas ({fields.length})
              </span>

              <div className="flex flex-col gap-1.5">
                {fields.map((f) => {
                  const isSelected = f.id === selectedField?.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => onSelectField(f.id)}
                      className={`p-3 rounded-xl text-left transition-all border ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/20"
                          : "bg-slate-900/70 hover:bg-slate-800 border-white/5 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{f.name}</span>
                        <span className="font-mono text-[10px] text-emerald-400 font-semibold">{f.area_ha} ha</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{f.address}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

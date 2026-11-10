"use client";

import React, { useState } from "react";
import { Cloud, Sun, CloudRain, Wind, Droplets, ChevronDown, Sparkles } from "lucide-react";
import { WeatherResponse } from "../../lib/types";

interface WeatherWidgetProps {
  weather: WeatherResponse | null;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather }) => {
  const [open, setOpen] = useState(false);

  if (!weather) {
    return (
      <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/[0.08] text-xs text-slate-400">
        <Cloud className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>Meteorologia Vale do Itajaí...</span>
      </div>
    );
  }

  const curr = weather.current;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-white/[0.08] hover:border-white/15 transition-all text-xs text-slate-200 shadow-sm"
      >
        <div className="flex items-center gap-1.5">
          {curr.weather_code <= 1 ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : curr.weather_code <= 3 ? (
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          )}
          <span className="font-bold font-mono text-white">{curr.temperature.toFixed(1)}°C</span>
        </div>

        <div className="h-3 w-px bg-white/10 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Wind className="w-3 h-3 text-cyan-400" />
          <span>{curr.wind_speed_kmh.toFixed(0)} km/h</span>
        </div>

        <div className="h-3 w-px bg-white/10 hidden md:block" />

        <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
          <Sparkles className="w-2.5 h-2.5" />
          <span>{curr.spraying_window.split(" ")[0]}</span>
        </div>

        <ChevronDown className="w-3 h-3 text-slate-500 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {/* Dropdown Popover */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl glass-panel p-4 shadow-2xl z-50 border border-white/15 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Microclima Agronômico</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">Open-Meteo</span>
              </h4>
              <p className="text-[10px] text-slate-400">{weather.municipality} • Atualizado às {curr.updated_at}h</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-[10px] text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" /> Umidade Relativa
              </span>
              <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">{curr.humidity}%</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Wind className="w-3 h-3 text-emerald-400" /> Vento a 10m
              </span>
              <div className="text-sm font-bold font-mono text-emerald-300 mt-0.5">{curr.wind_speed_kmh} km/h</div>
            </div>
          </div>

          {/* Spraying Window Diagnosis */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
              Condições de Manejo / Pulverização
            </div>
            <div className="text-slate-200 font-medium leading-relaxed text-[11px]">
              {curr.spraying_window} — Vento dentro dos limites regulamentares para deriva e umidade foliar adequada.
            </div>
          </div>

          {/* 4-Day Forecast */}
          {weather.forecast && weather.forecast.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Previsão Semanal (Vale do Itajaí)
              </div>
              <div className="flex flex-col gap-1">
                {weather.forecast.slice(0, 4).map((f) => (
                  <div key={f.date} className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-slate-900/60 border border-white/5">
                    <span className="text-slate-300 font-medium">{f.date.slice(5)}</span>
                    <span className="text-slate-400 text-[10px]">{f.label}</span>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-cyan-400">{f.precipitation_probability}% chu</span>
                      <span className="text-white font-bold">{f.temp_min}°/{f.temp_max}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

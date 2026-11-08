"use client";

import React from "react";
import { Calendar, Cloud, Satellite, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { ScenePass } from "../lib/types";

interface TimelineDrawerProps {
  passes: ScenePass[];
  selectedPassId: string | null;
  onSelectPass: (pass: ScenePass) => void;
  isLoading: boolean;
}

export const TimelineDrawer: React.FC<TimelineDrawerProps> = ({
  passes,
  selectedPassId,
  onSelectPass,
  isLoading,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -280 : 280;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return isoStr.slice(0, 10);
    }
  };

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 h-28 glass-panel rounded-xl px-4 py-2.5 flex flex-col justify-between shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Linha do Tempo de Passagens Satelitais ({passes.length})
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            • Selecione uma data para recortar a cena instantaneamente
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1 rounded bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1 rounded bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cards Carousel */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2.5 overflow-x-auto overflow-y-hidden pb-1 pt-0.5 scrollbar-thin"
      >
        {isLoading && passes.length === 0 ? (
          <div className="text-xs text-slate-400 flex items-center gap-2 py-3 px-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Consultando catálogo STAC...</span>
          </div>
        ) : passes.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 px-4">
            Nenhuma passagem encontrada com baixa nebulosidade neste intervalo.
          </div>
        ) : (
          passes.map((p) => {
            const isSelected = p.id === selectedPassId;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPass(p)}
                className={`flex-shrink-0 w-52 p-2 rounded-lg text-left transition-all border ${
                  isSelected
                    ? "bg-emerald-500/25 border-emerald-400 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-900/70 hover:bg-slate-800/90 border-white/5"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{formatDate(p.datetime)}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-slate-300 font-medium truncate max-w-[110px]">
                    {p.satellite}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 px-1 py-0.2 rounded font-mono ${
                      p.cloud_cover < 10
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    <Cloud className="w-2.5 h-2.5" />
                    {p.cloud_cover.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-1 text-[9px] text-slate-400 truncate">
                  {p.quality_label}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Cloud, Calendar, Sparkles } from "lucide-react";
import { Badge } from "./ui/Badge";

export interface TimelineScene {
  id: string;
  date: string;
  cloudCover: number;
  satellite: "Sentinel-2" | "CBERS-4A";
  resolution: string;
  isPansharpened?: boolean;
}

interface TimelineScrubberProps {
  scenes: TimelineScene[];
  selectedDate: string;
  onSelectScene: (scene: TimelineScene) => void;
  isLoading?: boolean;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  scenes,
  selectedDate,
  onSelectScene,
  isLoading = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Find active index
  const currentIndex = scenes.findIndex((s) => s.date === selectedDate);

  // Playback timer (revisit playback every 2.5s)
  useEffect(() => {
    if (!isPlaying || scenes.length <= 1) return;

    const timer = setInterval(() => {
      const nextIdx = (currentIndex + 1) % scenes.length;
      onSelectScene(scenes[nextIdx]);
    }, 2500);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, scenes, onSelectScene]);

  const handlePrev = () => {
    if (scenes.length === 0) return;
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : scenes.length - 1;
    onSelectScene(scenes[prevIdx]);
  };

  const handleNext = () => {
    if (scenes.length === 0) return;
    const nextIdx = (currentIndex + 1) % scenes.length;
    onSelectScene(scenes[nextIdx]);
  };

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-2xl flex items-center gap-3 max-w-4xl w-full mx-auto">
      {/* Play/Pause & Step Controls */}
      <div className="flex items-center gap-1.5 pl-1 border-r border-white/10 pr-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isPlaying
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 shadow-lg shadow-emerald-500/10"
          }`}
          title={isPlaying ? "Pausar reprodução" : "Iniciar timelapse automático (5 em 5 dias)"}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <button
          onClick={handlePrev}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Passagem anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleNext}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Próxima passagem"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Timeline Scroll Area */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
        {scenes.map((scene, idx) => {
          const isSelected = scene.date === selectedDate;
          const formattedDate = new Date(scene.date + "T12:00:00Z").toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          });

          return (
            <button
              key={scene.id || scene.date}
              onClick={() => onSelectScene(scene)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 text-left ${
                isSelected
                  ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-500/10"
                  : "bg-white/[0.03] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${isSelected ? "text-emerald-400" : "text-slate-300"}`}>
                    {formattedDate}
                  </span>
                  {scene.isPansharpened && (
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1 py-0.2 rounded font-mono font-medium">
                      2m HD
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{scene.satellite}</span>
                  <span className="flex items-center gap-0.5">
                    <Cloud className="w-2.5 h-2.5" />
                    {scene.cloudCover}%
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Info indicator */}
      <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/10 pr-1">
        <Badge variant={isPlaying ? "amber" : "emerald"} dot>
          {isPlaying ? "Timelapse Ativo" : `${scenes.length} Passagens`}
        </Badge>
      </div>
    </div>
  );
};

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import {
  Compass,
  Maximize2,
  Plus,
  Minus,
  Box,
  Layers,
  Sparkles,
  MapPin,
  Crosshair,
} from "lucide-react";
import { Field, ProcessRasterResponse } from "../lib/types";

interface ProMapViewerProps {
  selectedField: Field | null;
  rasterData: ProcessRasterResponse | null;
  opacity: number;
  basemap: "satellite" | "dark";
  onBasemapChange: (bm: "satellite" | "dark") => void;
  activeLayer: "ndvi" | "ndwi" | "rgb" | "pansharpened" | "zones";
  isDrawing: boolean;
  onFinishDrawing: (geojson: any, areaHa: number, perimeterM: number) => void;
  onCancelDrawing: () => void;
  inspectModeActive: boolean;
  onInspectPoint: (lat: number, lng: number) => void;
  inspectedCoords: { lat: number; lng: number } | null;
}

// MapLibre v4 compatible draw styles
const DRAW_STYLES: any[] = [
  {
    id: "gl-draw-polygon-fill-active",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    paint: {
      "fill-color": "#10b981",
      "fill-outline-color": "#10b981",
      "fill-opacity": 0.25,
    },
  },
  {
    id: "gl-draw-polygon-stroke-active",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#10b981",
      "line-width": 3,
    },
  },
  {
    id: "gl-draw-line-active",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#10b981",
      "line-width": 3,
    },
  },
  {
    id: "gl-draw-point-midpoint",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
    paint: {
      "circle-radius": 4,
      "circle-color": "#10b981",
    },
  },
  {
    id: "gl-draw-point-active",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["!=", "mode", "static"]],
    paint: {
      "circle-radius": 6,
      "circle-color": "#34d399",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  },
  {
    id: "gl-draw-polygon-fill-inactive",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    paint: {
      "fill-color": "#059669",
      "fill-outline-color": "#059669",
      "fill-opacity": 0.15,
    },
  },
  {
    id: "gl-draw-polygon-stroke-inactive",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#059669",
      "line-width": 2,
    },
  },
];

export const ProMapViewer: React.FC<ProMapViewerProps> = ({
  selectedField,
  rasterData,
  opacity,
  basemap,
  onBasemapChange,
  activeLayer,
  isDrawing,
  onFinishDrawing,
  onCancelDrawing,
  inspectModeActive,
  onInspectPoint,
  inspectedCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const inspectMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(15.5);
  const [currentPitch, setCurrentPitch] = useState<number>(20);
  const [currentBearing, setCurrentBearing] = useState<number>(0);

  // Basemap style definitions (Ultra-HD Satellite with maxzoom 20)
  const getStyle = (mode: "satellite" | "dark"): maplibregl.StyleSpecification => {
    if (mode === "satellite") {
      return {
        version: 8,
        sources: {
          esri_sat: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution: "Esri, Maxar, Earthstar Geographics",
            maxzoom: 20,
          },
        },
        layers: [
          {
            id: "esri-sat-layer",
            type: "raster",
            source: "esri_sat",
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      };
    } else {
      return {
        version: 8,
        sources: {
          carto_dark: {
            type: "raster",
            tiles: [
              "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© CartoDB, © OpenStreetMap",
            maxzoom: 20,
          },
        },
        layers: [
          {
            id: "carto-dark-layer",
            type: "raster",
            source: "carto_dark",
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      };
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Centered at Casa da Lagoa (Blumenau/Gaspar, SC): -49.175333, -26.970028
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getStyle(basemap),
      center: [-49.175333, -26.970028],
      zoom: 15.5,
      pitch: 20,
      bearing: 0,
      maxZoom: 20,
      minZoom: 3,
      attributionControl: false,
    });

    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    // Track zoom, pitch and bearing
    map.on("move", () => {
      setCurrentZoom(Math.round(map.getZoom() * 10) / 10);
      setCurrentPitch(Math.round(map.getPitch()));
      setCurrentBearing(Math.round(map.getBearing()));
    });

    // Initialize Draw tool
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      styles: DRAW_STYLES,
      defaultMode: "simple_select",
    });
    map.addControl(draw as any, "top-right");
    drawRef.current = draw;

    map.on("draw.create", (e: any) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const areaSqMeters = turf.area(feature);
        const areaHa = Math.round((areaSqMeters / 10000.0) * 100) / 100;
        const line = turf.polygonToLine(feature);
        const perimeterKm = turf.length(line as any, { units: "kilometers" });
        const perimeterM = Math.round(perimeterKm * 1000);

        onFinishDrawing(feature.geometry, areaHa, perimeterM);
        draw.deleteAll();
      }
    });

    // Map Click Listener for Telemetry Point Inspection
    map.on("click", (e) => {
      onInspectPoint(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update Basemap style on toggle
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(getStyle(basemap));
  }, [basemap]);

  // Handle Drawing Mode
  useEffect(() => {
    if (!drawRef.current) return;
    if (isDrawing) {
      drawRef.current.changeMode("draw_polygon");
    } else {
      drawRef.current.changeMode("simple_select");
    }
  }, [isDrawing]);

  // Render Field Boundary & Fly To with high-res zoom
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedField) return;

    const renderLayers = () => {
      if (map.getLayer("field-boundary-glow")) map.removeLayer("field-boundary-glow");
      if (map.getLayer("field-boundary-line")) map.removeLayer("field-boundary-line");
      if (map.getLayer("field-boundary-fill")) map.removeLayer("field-boundary-fill");
      if (map.getSource("field-boundary-source")) map.removeSource("field-boundary-source");

      const featureData: any = {
        type: "Feature",
        geometry: selectedField.geojson,
        properties: { name: selectedField.name },
      };

      map.addSource("field-boundary-source", {
        type: "geojson",
        data: featureData,
      });

      // Translucent inner fill
      map.addLayer({
        id: "field-boundary-fill",
        type: "fill",
        source: "field-boundary-source",
        paint: {
          "fill-color": "#10b981",
          "fill-opacity": 0.06,
        },
      });

      // Neon outer glow
      map.addLayer({
        id: "field-boundary-glow",
        type: "line",
        source: "field-boundary-source",
        paint: {
          "line-color": "#10b981",
          "line-width": 6,
          "line-blur": 5,
          "line-opacity": 0.6,
        },
      });

      // Crisp inner boundary line
      map.addLayer({
        id: "field-boundary-line",
        type: "line",
        source: "field-boundary-source",
        paint: {
          "line-color": "#34d399",
          "line-width": 2.5,
          "line-opacity": 0.95,
        },
      });

      // Fit map view to polygon with high maxZoom (up to 18.5) for close-up view!
      const bbox = turf.bbox(featureData);
      map.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        { padding: 90, maxZoom: 18.5, duration: 1200 }
      );
    };

    if (map.isStyleLoaded()) {
      renderLayers();
    } else {
      map.once("style.load", renderLayers);
    }
  }, [selectedField]);

  // Render Satellite Raster Overlay (6x Super-Sampled ImageSource)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const renderRaster = () => {
      if (map.getLayer("satellite-raster-layer")) {
        map.removeLayer("satellite-raster-layer");
      }
      if (map.getSource("satellite-raster-source")) {
        map.removeSource("satellite-raster-source");
      }

      if (!rasterData) return;

      const [west, south, east, north] = rasterData.bounds;
      const coordinates: [[number, number], [number, number], [number, number], [number, number]] = [
        [west, north],
        [east, north],
        [east, south],
        [west, south],
      ];

      map.addSource("satellite-raster-source", {
        type: "image",
        url: rasterData.image_base64,
        coordinates: coordinates,
      });

      map.addLayer({
        id: "satellite-raster-layer",
        type: "raster",
        source: "satellite-raster-source",
        paint: {
          "raster-opacity": opacity,
          "raster-fade-duration": 250,
          "raster-resampling": "linear",
        },
      });
    };

    if (map.isStyleLoaded()) {
      renderRaster();
    } else {
      map.once("style.load", renderRaster);
    }
  }, [rasterData]);

  // Update Opacity dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("satellite-raster-layer")) return;
    map.setPaintProperty("satellite-raster-layer", "raster-opacity", opacity);
  }, [opacity]);

  // Render Inspected Coordinate Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (inspectMarkerRef.current) {
      inspectMarkerRef.current.remove();
      inspectMarkerRef.current = null;
    }

    if (inspectedCoords) {
      const el = document.createElement("div");
      el.className = "inspect-marker-pulse";
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-emerald-500/30 animate-ping absolute"></div>
          <div class="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg relative flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
          </div>
        </div>
      `;

      inspectMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([inspectedCoords.lng, inspectedCoords.lat])
        .addTo(map);
    }
  }, [inspectedCoords]);

  // Floating Control Handlers
  const handleZoomIn = () => mapRef.current?.zoomIn({ duration: 300 });
  const handleZoomOut = () => mapRef.current?.zoomOut({ duration: 300 });
  const handleResetNorth = () => mapRef.current?.resetNorthPitch({ duration: 500 });
  const handleToggle3D = () => {
    if (!mapRef.current) return;
    const current = mapRef.current.getPitch();
    mapRef.current.easeTo({
      pitch: current > 30 ? 0 : 55,
      duration: 800,
    });
  };
  const handleRecenter = () => {
    if (!mapRef.current || !selectedField) return;
    const bbox = turf.bbox({ type: "Feature", geometry: selectedField.geojson, properties: {} });
    mapRef.current.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      { padding: 90, maxZoom: 18.5, duration: 800 }
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full cursor-crosshair" />

      {/* Drawing Instructions Banner (when active) */}
      {isDrawing && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-slate-950/90 backdrop-blur-md border border-emerald-500/50 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <MapPin className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Demarcação de Novo Talhão</h4>
            <p className="text-[11px] text-slate-400">
              Clique no mapa para adicionar vértices. Dê duplo clique no último ponto para fechar o polígono.
            </p>
          </div>
          <button
            onClick={onCancelDrawing}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-all ml-2"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Floating Modern Camera & Navigation Dock */}
      <div className="absolute bottom-8 left-20 z-20 flex items-center gap-2">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1">
          {/* Compass / Reset North */}
          <button
            onClick={handleResetNorth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title="Apontar para o Norte"
          >
            <Compass
              className="w-4 h-4 transition-transform duration-300"
              style={{ transform: `rotate(${-currentBearing}deg)` }}
            />
          </button>

          {/* 3D Tilt View */}
          <button
            onClick={handleToggle3D}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              currentPitch > 30
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
            title="Alternar Visão 3D Terreno"
          >
            <Box className="w-4 h-4" />
          </button>

          {/* Fit Boundary */}
          <button
            onClick={handleRecenter}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title="Enquadrar Propriedade"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title="Aproximar (Zoom In)"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title="Afastar (Zoom Out)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Basemap Toggle Pill */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl flex items-center gap-1">
          <button
            onClick={() => onBasemapChange("satellite")}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-medium transition-all text-center ${
              basemap === "satellite"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Satélite de Alta Resolução"
          >
            🛰️ Satélite HD
          </button>
          <button
            onClick={() => onBasemapChange("dark")}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-medium transition-all text-center ${
              basemap === "dark"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Fundo Escuro Minimalista"
          >
            🌑 Minimal
          </button>
        </div>
      </div>

      {/* Floating Spectral Index Legend (Bottom Right) */}
      <div className="absolute bottom-6 right-4 z-20 pointer-events-auto">
        <div className="bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl w-64">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-semibold flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-emerald-400" />
              {activeLayer === "ndvi" && "Escala NDVI (Vigor Foliar)"}
              {activeLayer === "ndwi" && "Escala NDWI (Umidade do Solo)"}
              {activeLayer === "zones" && "Zonas de Manejo (VRA)"}
              {activeLayer === "rgb" && "Composição Cor Real"}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">Zoom {currentZoom}x</span>
          </div>

          {activeLayer === "ndvi" && (
            <div className="space-y-1.5">
              <div
                className="h-2.5 w-full rounded-full border border-white/10"
                style={{
                  background: "linear-gradient(to right, #d73027, #f46d43, #fdae61, #fee08b, #d9ef8b, #a6d96a, #66bd63, #1a9850, #006837)",
                }}
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>0.0 Solo/Seco</span>
                <span>0.5 Médio</span>
                <span className="text-emerald-400 font-semibold">1.0 Densa</span>
              </div>
            </div>
          )}

          {activeLayer === "ndwi" && (
            <div className="space-y-1.5">
              <div
                className="h-2.5 w-full rounded-full border border-white/10"
                style={{
                  background: "linear-gradient(to right, #ffffd9, #edf8b1, #c7e9b4, #7fcdbb, #41b6c4, #1d91c0, #225ea8, #0c2c84)",
                }}
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>-0.4 Seco</span>
                <span>0.0 Normal</span>
                <span className="text-cyan-400 font-semibold">+0.5 Hídrico</span>
              </div>
            </div>
          )}

          {activeLayer === "zones" && (
            <div className="space-y-1 text-[10px] text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#d73027]" /> Z1 Muito Baixo
                </span>
                <span className="font-mono text-slate-400">&lt; 0.40</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#fdae61]" /> Z2 Baixo
                </span>
                <span className="font-mono text-slate-400">0.40 - 0.55</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#fee08b]" /> Z3 Médio
                </span>
                <span className="font-mono text-slate-400">0.55 - 0.70</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#a6d96a]" /> Z4 Alto
                </span>
                <span className="font-mono text-slate-400">0.70 - 0.82</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#1a9850]" /> Z5 Muito Alto
                </span>
                <span className="font-mono text-emerald-400">&gt; 0.82</span>
              </div>
            </div>
          )}

          {activeLayer === "rgb" && (
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Mosaico de satélite em cor verdadeira com stretch de contraste percentil (2%–98%) e realce de nitidez.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

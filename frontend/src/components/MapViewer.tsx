"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import { Field, ProcessRasterResponse } from "../lib/types";

interface MapViewerProps {
  selectedField: Field | null;
  rasterData: ProcessRasterResponse | null;
  opacity: number;
  basemap: "satellite" | "dark";
  isDrawing: boolean;
  onFinishDrawing: (geojson: any, areaHa: number, perimeterM: number) => void;
  onCancelDrawing: () => void;
}

// MapLibre v4 compatible draw styles without data-driven line-dasharray
const DRAW_STYLES: any[] = [
  {
    id: "gl-draw-polygon-fill-active",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    paint: {
      "fill-color": "#10b981",
      "fill-outline-color": "#10b981",
      "fill-opacity": 0.2,
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

export const MapViewer: React.FC<MapViewerProps> = ({
  selectedField,
  rasterData,
  opacity,
  basemap,
  isDrawing,
  onFinishDrawing,
  onCancelDrawing,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  // Basemap style definitions
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

    // Default center in Vale do Itajaí / Blumenau: -49.175333, -26.970028
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getStyle(basemap),
      center: [-49.175333, -26.970028],
      zoom: 14,
      pitch: 15,
      bearing: 0,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-right");

    // Initialize Draw tool with MapLibre v4 compatible styles
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

  // Render Field Boundary & Fly To
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedField) return;

    const renderLayers = () => {
      // Remove previous field source/layers if exist
      if (map.getLayer("field-boundary-glow")) map.removeLayer("field-boundary-glow");
      if (map.getLayer("field-boundary-line")) map.removeLayer("field-boundary-line");
      if (map.getLayer("field-boundary-fill")) map.removeLayer("field-boundary-fill");
      if (map.getSource("field-boundary-source")) map.removeSource("field-boundary-source");

      // Add GeoJSON
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
          "fill-opacity": 0.08,
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
          "line-blur": 4,
          "line-opacity": 0.5,
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

      // Fit map view to polygon
      const bbox = turf.bbox(featureData);
      map.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        { padding: 120, maxZoom: 16.5, duration: 1200 }
      );
    };

    if (map.isStyleLoaded()) {
      renderLayers();
    } else {
      map.once("style.load", renderLayers);
    }
  }, [selectedField]);

  // Render Satellite Raster Overlay (ImageSource)
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
      // MapLibre Image coordinates order: top-left, top-right, bottom-right, bottom-left
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

      map.addLayer(
        {
          id: "satellite-raster-layer",
          type: "raster",
          source: "satellite-raster-source",
          paint: {
            "raster-opacity": opacity,
            "raster-fade-duration": 300,
          },
        },
        map.getLayer("field-boundary-glow") ? "field-boundary-glow" : undefined
      );
    };

    if (map.isStyleLoaded()) {
      renderRaster();
    } else {
      map.once("style.load", renderRaster);
    }
  }, [rasterData]);

  // Dynamic Opacity adjustment
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("satellite-raster-layer")) return;
    map.setPaintProperty("satellite-raster-layer", "raster-opacity", opacity);
  }, [opacity]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Drawing notification overlay */}
      {isDrawing && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 glass-panel px-4 py-2 rounded-xl flex items-center gap-3 border border-amber-500/40 text-amber-300 text-xs shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Clique no mapa para marcar os vértices do talhão e feche o polígono no ponto inicial.</span>
          <button
            onClick={onCancelDrawing}
            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px]"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

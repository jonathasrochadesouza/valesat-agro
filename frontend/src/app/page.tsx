"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { HeaderNav } from "../components/HeaderNav";
import { ProSidebar } from "../components/ProSidebar";
import { ProMapViewer } from "../components/ProMapViewer";
import { TimelineScrubber, TimelineScene } from "../components/TimelineScrubber";
import { InspectorHUD } from "../components/InspectorHUD";
import { NewFieldModal } from "../components/NewFieldModal";
import {
  fetchHealth,
  fetchFields,
  createField,
  fetchPasses,
  processRaster,
  downloadGeoTIFF,
  fetchAnalytics,
  fetchWeather,
  inspectPoint,
} from "../lib/api";
import {
  Field,
  ScenePass,
  ProcessRasterResponse,
  HealthResponse,
  TimelineDataPoint,
  WeatherResponse,
  PointInspectResponse,
} from "../lib/types";

export default function Home() {
  // Farms & Selection
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  // Engine & Spectral Layer
  const [engine, setEngine] = useState<"sentinel-2" | "cbers-4a">("sentinel-2");
  const [layer, setLayer] = useState<"ndvi" | "ndwi" | "rgb" | "pansharpened" | "zones">("ndvi");
  const [opacity, setOpacity] = useState<number>(0.85);
  const [blendMode, setBlendMode] = useState<"normal" | "multiply" | "screen">("normal");
  const [basemap, setBasemap] = useState<"satellite" | "dark">("satellite");

  // Telemetry & Satellite Data
  const [passes, setPasses] = useState<ScenePass[]>([]);
  const [selectedPass, setSelectedPass] = useState<ScenePass | null>(null);
  const [rasterData, setRasterData] = useState<ProcessRasterResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineDataPoint[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  // UI States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingPasses, setIsLoadingPasses] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [inspectModeActive, setInspectModeActive] = useState<boolean>(false);

  // Point Inspection State
  const [inspectedCoords, setInspectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [inspectedPoint, setInspectedPoint] = useState<PointInspectResponse | null>(null);

  // New Field Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [drawnGeojson, setDrawnGeojson] = useState<any>(null);
  const [drawnAreaHa, setDrawnAreaHa] = useState<number>(0);
  const [drawnPerimeterM, setDrawnPerimeterM] = useState<number>(0);

  const selectedField = useMemo(
    () => fields.find((f) => f.id === selectedFieldId) || null,
    [fields, selectedFieldId]
  );

  // Initial load: System health & Weather telemetry & Farm seeds
  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((e) => console.error("Health check error:", e));

    fetchWeather(-26.97, -49.1753, "Blumenau / Gaspar")
      .then(setWeather)
      .catch((e) => console.error("Weather error:", e));

    fetchFields()
      .then((data) => {
        setFields(data);
        if (data.length > 0) {
          // Default to #1 (Casa da Lagoa)
          setSelectedFieldId(data[0].id);
        }
      })
      .catch((e) => console.error("Error loading fields:", e));
  }, []);

  // When selected field or engine changes: Fetch satellite passes and temporal analytics
  useEffect(() => {
    if (!selectedFieldId) return;

    setIsLoadingPasses(true);
    fetchPasses(selectedFieldId, engine)
      .then((passesData) => {
        setPasses(passesData);
        if (passesData.length > 0) {
          setSelectedPass(passesData[0]);
        } else {
          setSelectedPass(null);
          setRasterData(null);
        }
      })
      .catch((e) => {
        console.error("Error fetching passes:", e);
        setPasses([]);
      })
      .finally(() => setIsLoadingPasses(false));

    fetchAnalytics(selectedFieldId)
      .then((res) => setTimeline(res.timeline))
      .catch((e) => console.error("Error fetching analytics:", e));
  }, [selectedFieldId, engine]);

  // When selected pass or layer changes: Process raster
  const triggerRasterProcessing = useCallback(async () => {
    if (!selectedFieldId || !selectedPass) return;

    try {
      setIsProcessing(true);
      const res = await processRaster({
        field_id: selectedFieldId,
        scene_id: selectedPass.id,
        engine,
        layer,
        assets: selectedPass.assets,
      });
      setRasterData(res);
    } catch (err: any) {
      console.error("Raster processing failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFieldId, selectedPass, engine, layer]);

  useEffect(() => {
    if (selectedPass) {
      triggerRasterProcessing();
    }
  }, [selectedPass, layer, triggerRasterProcessing]);

  // Handle Engine change
  const handleSelectEngine = (newEngine: "sentinel-2" | "cbers-4a") => {
    setEngine(newEngine);
    if (newEngine === "cbers-4a") {
      setLayer("pansharpened");
    } else {
      setLayer("ndvi");
    }
  };

  // Convert passes to timeline scenes
  const timelineScenes: TimelineScene[] = useMemo(() => {
    return passes.map((p) => ({
      id: p.id,
      date: p.datetime ? p.datetime.split("T")[0] : "",
      cloudCover: p.cloud_cover,
      satellite: (p.satellite.includes("CBERS") ? "CBERS-4A" : "Sentinel-2") as any,
      resolution: p.satellite.includes("CBERS") ? "2m" : "10m",
      isPansharpened: p.satellite.includes("CBERS"),
    }));
  }, [passes]);

  // Point Inspection handler
  const handleInspectPoint = async (lat: number, lng: number) => {
    setInspectedCoords({ lat, lng });
    try {
      const data = await inspectPoint({
        field_id: selectedFieldId ?? undefined,
        lat,
        lon: lng,
      });
      setInspectedPoint(data);
    } catch (err) {
      console.error("Point inspection failed:", err);
    }
  };

  // GeoTIFF Export
  const handleExportGeoTIFF = async () => {
    if (!selectedFieldId || !selectedPass) return;
    try {
      const blob = await downloadGeoTIFF({
        field_id: selectedFieldId,
        scene_id: selectedPass.id,
        engine,
        layer,
        assets: selectedPass.assets,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `valesat_${selectedField?.name.replace(/\\s+/g, "_")}_${engine}_${layer}.tif`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Falha ao exportar GeoTIFF.");
    }
  };

  // GeoJSON Export
  const handleExportGeoJSON = () => {
    if (!selectedField) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(selectedField.geojson, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `${selectedField.name.replace(/\\s+/g, "_")}.geojson`;
    a.click();
  };

  // Drawing tools
  const handleFinishDrawing = (geojson: any, areaHa: number, perimeterM: number) => {
    setIsDrawing(false);
    setDrawnGeojson(geojson);
    setDrawnAreaHa(areaHa);
    setDrawnPerimeterM(perimeterM);
    setShowModal(true);
  };

  const handleSaveNewField = async (fieldData: Partial<Field>) => {
    const created = await createField(fieldData);
    const updated = await fetchFields();
    setFields(updated);
    setSelectedFieldId(created.id);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Professional Navigation Bar */}
      <HeaderNav
        fields={fields}
        selectedField={selectedField}
        onSelectField={(id) => setSelectedFieldId(id)}
        weather={weather}
        health={health}
        isCompareMode={compareMode}
        onToggleCompareMode={() => setCompareMode(!compareMode)}
        isInspectMode={inspectModeActive}
        onToggleInspectMode={() => setInspectModeActive(!inspectModeActive)}
        isDrawing={isDrawing}
        onStartDrawing={() => setIsDrawing(true)}
        onExportGeoTIFF={handleExportGeoTIFF}
        onExportGeoJSON={handleExportGeoJSON}
      />

      {/* Main Workspace (Map + Overlays) */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Left Side Activity Dock */}
        <ProSidebar
          fields={fields}
          selectedField={selectedField}
          onSelectField={(id) => setSelectedFieldId(id)}
          engine={engine}
          onSelectEngine={handleSelectEngine}
          layer={layer}
          onSelectLayer={setLayer}
          opacity={compareMode ? 0.35 : opacity}
          onOpacityChange={setOpacity}
          blendMode={blendMode}
          onBlendModeChange={setBlendMode}
          rasterData={rasterData}
          timeline={timeline}
          weather={weather}
          isProcessing={isProcessing}
        />

        {/* Pro Interactive Map Engine */}
        <ProMapViewer
          selectedField={selectedField}
          rasterData={rasterData}
          opacity={compareMode ? 0.35 : opacity}
          basemap={basemap}
          onBasemapChange={setBasemap}
          activeLayer={layer}
          isDrawing={isDrawing}
          onFinishDrawing={handleFinishDrawing}
          onCancelDrawing={() => setIsDrawing(false)}
          inspectModeActive={inspectModeActive}
          onInspectPoint={handleInspectPoint}
          inspectedCoords={inspectedCoords}
        />

        {/* Right Floating Biometric HUD & Point Inspector */}
        <div className="absolute top-20 right-4 z-20 pointer-events-none">
          <InspectorHUD
            field={selectedField}
            rasterData={rasterData}
            inspectedPoint={inspectedPoint}
            onClearInspectPoint={() => {
              setInspectedCoords(null);
              setInspectedPoint(null);
            }}
            inspectModeActive={inspectModeActive}
            onToggleInspectMode={() => setInspectModeActive(!inspectModeActive)}
          />
        </div>

        {/* Bottom Docked Revisit Timeline Scrubber */}
        {passes.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto px-4 w-full max-w-4xl">
            <TimelineScrubber
              scenes={timelineScenes}
              selectedDate={selectedPass?.datetime ? selectedPass.datetime.split("T")[0] : ""}
              onSelectScene={(scene) => {
                const found = passes.find((p) => p.id === scene.id || (p.datetime && p.datetime.startsWith(scene.date)));
                if (found) setSelectedPass(found);
              }}
              isLoading={isLoadingPasses}
            />
          </div>
        )}
      </div>

      {/* New Farm Demarcation Modal */}
      <NewFieldModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        polygonGeojson={drawnGeojson}
        areaHa={drawnAreaHa}
        perimeterM={drawnPerimeterM}
        onSave={handleSaveNewField}
      />
    </main>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { TopBar } from "../components/TopBar";
import { SidebarControl } from "../components/SidebarControl";
import { MapViewer } from "../components/MapViewer";
import { TimelineDrawer } from "../components/TimelineDrawer";
import { AnalyticsPanel } from "../components/AnalyticsPanel";
import { NewFieldModal } from "../components/NewFieldModal";
import {
  fetchHealth,
  fetchFields,
  createField,
  fetchPasses,
  processRaster,
  downloadGeoTIFF,
  fetchAnalytics,
} from "../lib/api";
import {
  Field,
  ScenePass,
  ProcessRasterResponse,
  HealthResponse,
  TimelineDataPoint,
} from "../lib/types";

export default function Home() {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [engine, setEngine] = useState<"sentinel-2" | "cbers-4a">("sentinel-2");
  const [layer, setLayer] = useState<"ndvi" | "ndwi" | "rgb" | "pansharpened">("ndvi");
  const [opacity, setOpacity] = useState<number>(0.85);
  const [basemap, setBasemap] = useState<"satellite" | "dark">("satellite");

  const [passes, setPasses] = useState<ScenePass[]>([]);
  const [selectedPass, setSelectedPass] = useState<ScenePass | null>(null);
  const [rasterData, setRasterData] = useState<ProcessRasterResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineDataPoint[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingPasses, setIsLoadingPasses] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // New Field Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [drawnGeojson, setDrawnGeojson] = useState<any>(null);
  const [drawnAreaHa, setDrawnAreaHa] = useState<number>(0);
  const [drawnPerimeterM, setDrawnPerimeterM] = useState<number>(0);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  // Initial load: Health & Fields
  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((e) => console.error("Health check error:", e));

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
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Floating Bar */}
      <TopBar
        fields={fields}
        selectedFieldId={selectedFieldId}
        onSelectField={(id) => setSelectedFieldId(id)}
        health={health}
        onStartDrawing={() => setIsDrawing(true)}
        isDrawing={isDrawing}
        opacity={opacity}
        onOpacityChange={setOpacity}
        basemap={basemap}
        onToggleBasemap={() => setBasemap((b) => (b === "satellite" ? "dark" : "satellite"))}
      />

      {/* Left Control Panel */}
      <SidebarControl
        fields={fields}
        selectedField={selectedField}
        onSelectField={(id) => setSelectedFieldId(id)}
        engine={engine}
        onSelectEngine={handleSelectEngine}
        layer={layer}
        onSelectLayer={setLayer}
        isProcessing={isProcessing}
        onExportGeoTIFF={handleExportGeoTIFF}
        onExportGeoJSON={handleExportGeoJSON}
      />

      {/* Main Interactive Map */}
      <MapViewer
        selectedField={selectedField}
        rasterData={rasterData}
        opacity={opacity}
        basemap={basemap}
        isDrawing={isDrawing}
        onFinishDrawing={handleFinishDrawing}
        onCancelDrawing={() => setIsDrawing(false)}
      />

      {/* Right Floating Analytics & Trends */}
      <AnalyticsPanel
        selectedField={selectedField}
        rasterData={rasterData}
        layer={layer}
        timeline={timeline}
      />

      {/* Bottom Timeline Drawer */}
      <TimelineDrawer
        passes={passes}
        selectedPassId={selectedPass?.id || null}
        onSelectPass={(pass) => setSelectedPass(pass)}
        isLoading={isLoadingPasses}
      />

      {/* New Field Creator Modal */}
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

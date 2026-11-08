import { Field, ScenePass, ProcessRasterResponse, HealthResponse, TimelineDataPoint } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(API_BASE + "/api/health", { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao consultar saúde da API");
  return res.json();
}

export async function fetchFields(): Promise<Field[]> {
  const res = await fetch(API_BASE + "/api/fields", { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar talhões");
  return res.json();
}

export async function createField(payload: Partial<Field>): Promise<Field> {
  const res = await fetch(API_BASE + "/api/fields", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Falha ao cadastrar talhão");
  return res.json();
}

export async function deleteField(id: number): Promise<void> {
  const res = await fetch(API_BASE + "/api/fields/" + id, { method: "DELETE" });
  if (!res.ok) throw new Error("Falha ao excluir talhão");
}

export async function fetchPasses(fieldId: number, engine: string): Promise<ScenePass[]> {
  const res = await fetch(API_BASE + "/api/satellite/passes?field_id=" + fieldId + "&engine=" + engine, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao consultar passagens de satélite");
  return res.json();
}

export async function processRaster(payload: {
  field_id: number;
  scene_id: string;
  engine: string;
  layer: string;
  assets?: Record<string, string>;
}): Promise<ProcessRasterResponse> {
  const res = await fetch(API_BASE + "/api/satellite/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erro no processamento" }));
    throw new Error(err.detail || "Erro ao processar imagem de satélite");
  }
  return res.json();
}

export async function downloadGeoTIFF(payload: {
  field_id: number;
  scene_id: string;
  engine: string;
  layer: string;
  assets?: Record<string, string>;
}): Promise<Blob> {
  const res = await fetch(API_BASE + "/api/satellite/export-geotiff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Falha ao exportar GeoTIFF");
  return res.blob();
}

export async function fetchAnalytics(fieldId: number): Promise<{
  field_id: number;
  field_name: string;
  timeline: TimelineDataPoint[];
}> {
  const res = await fetch(API_BASE + "/api/satellite/analytics/" + fieldId, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar série temporal");
  return res.json();
}

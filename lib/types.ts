import { RecursosBloque } from "./legal-data";

export type Modo = "laboral" | "consumidor";

export interface DocumentoInput {
  nombre: string;
  texto: string;
  /** true si la extracción de texto falló o el PDF parece no tener texto (escaneado) */
  illegible?: boolean;
}

export interface AnalyzeRequest {
  modo: Modo;
  documentos: DocumentoInput[];
  contexto: string;
  rubro?: string;
}

export interface ItemSimple {
  titulo: string;
  explicacion: string;
}

export interface Irregularidad extends ItemSimple {
  articulo: string;
}

export interface AnalysisResult {
  estado: "ok" | "insuficiente";
  notaInsuficiente: string;
  enRegla: ItemSimple[];
  irregularidades: Irregularidad[];
  derechos: ItemSimple[];
  recursos: RecursosBloque | null;
}

const RES_9_2025 = {
  fuente:
    "Resolución 9/2025 del Consejo Nacional del Empleo, la Productividad y el Salario Mínimo, Vital y Móvil (Boletín Oficial, 3/12/2025)",
  fuenteUrl:
    "https://www.boletinoficial.gob.ar/detalleAviso/primera/335463/20251203",
};

const RES_4_2026 = {
  fuente:
    "Resolución 4/2026 del Consejo Nacional del Empleo, la Productividad y el Salario Mínimo, Vital y Móvil (Boletín Oficial, 2/9/2026)",
  fuenteUrl:
    "https://www.boletinoficial.gob.ar/detalleAviso/primera/346775/20260902",
};

export interface EscalonSMVM {
  vigenteDesde: string; // AAAA-MM-DD
  valorMensual: number;
  valorHora: number;
  fuente: string;
  fuenteUrl: string;
}

/**
 * Escalones del SMVM en orden cronológico, copiados del art. 1° de cada
 * resolución. Cuando salga una resolución nueva, se agregan sus escalones al
 * final; el vigente se elige solo por fecha.
 */
export const SMVM_ESCALONES: EscalonSMVM[] = [
  { vigenteDesde: "2025-11-01", valorMensual: 328400, valorHora: 1642, ...RES_9_2025 },
  { vigenteDesde: "2025-12-01", valorMensual: 334800, valorHora: 1674, ...RES_9_2025 },
  { vigenteDesde: "2026-01-01", valorMensual: 341000, valorHora: 1705, ...RES_9_2025 },
  { vigenteDesde: "2026-02-01", valorMensual: 346800, valorHora: 1734, ...RES_9_2025 },
  { vigenteDesde: "2026-03-01", valorMensual: 352400, valorHora: 1762, ...RES_9_2025 },
  { vigenteDesde: "2026-04-01", valorMensual: 357800, valorHora: 1789, ...RES_9_2025 },
  { vigenteDesde: "2026-05-01", valorMensual: 363000, valorHora: 1815, ...RES_9_2025 },
  { vigenteDesde: "2026-06-01", valorMensual: 367800, valorHora: 1839, ...RES_9_2025 },
  { vigenteDesde: "2026-07-01", valorMensual: 372400, valorHora: 1862, ...RES_9_2025 },
  { vigenteDesde: "2026-08-01", valorMensual: 376600, valorHora: 1883, ...RES_9_2025 },
  { vigenteDesde: "2026-09-01", valorMensual: 383800, valorHora: 1919, ...RES_4_2026 },
  { vigenteDesde: "2026-10-01", valorMensual: 391200, valorHora: 1956, ...RES_4_2026 },
  { vigenteDesde: "2026-11-01", valorMensual: 398800, valorHora: 1994, ...RES_4_2026 },
  { vigenteDesde: "2026-12-01", valorMensual: 406400, valorHora: 2032, ...RES_4_2026 },
  { vigenteDesde: "2027-01-01", valorMensual: 414200, valorHora: 2071, ...RES_4_2026 },
  { vigenteDesde: "2027-02-01", valorMensual: 422000, valorHora: 2110, ...RES_4_2026 },
  { vigenteDesde: "2027-03-01", valorMensual: 429600, valorHora: 2148, ...RES_4_2026 },
  { vigenteDesde: "2027-04-01", valorMensual: 437000, valorHora: 2185, ...RES_4_2026 },
];

export const SMVM_LINK_VERIFICACION =
  "https://www.argentina.gob.ar/trabajo/consejodelsalario";

/** Fecha AAAA-MM-DD en Argentina (el server de Vercel corre en UTC). */
function fechaArgentina(fecha: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(fecha);
}

/** El escalón vigente en `fecha` (por defecto, hoy en Argentina). */
export function smvmVigente(fecha: Date = new Date()): EscalonSMVM {
  const hoy = fechaArgentina(fecha);
  const vigentes = SMVM_ESCALONES.filter((e) => e.vigenteDesde <= hoy);
  return vigentes[vigentes.length - 1] ?? SMVM_ESCALONES[0];
}

/**
 * true si ya pasó el mes del último escalón cargado: probablemente salió una
 * resolución nueva que todavía no está en la tabla.
 */
export function smvmPosiblementeVencido(fecha: Date = new Date()): boolean {
  const [anio, mes] = SMVM_ESCALONES[SMVM_ESCALONES.length - 1].vigenteDesde
    .split("-")
    .map(Number);
  const mesSiguiente =
    mes === 12 ? `${anio + 1}-01-01` : `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
  return fechaArgentina(fecha) >= mesSiguiente;
}

export const RUBROS_CONSUMIDOR = [
  "Telefonía / internet",
  "Banco / tarjeta de crédito",
  "Electrodoméstico",
  "Indumentaria y calzado",
  "Suscripción / servicio digital",
  "Vehículo",
  "Servicios del hogar (gas, luz, agua)",
  "Turismo / pasajes",
  "Otro",
] as const;

export interface Recurso {
  texto: string;
  url?: string;
}

export interface RecursosBloque {
  items: Recurso[];
  nota: string;
}

export const RECURSOS_LABORAL: RecursosBloque = {
  items: [
    {
      texto:
        "Ministerio de Trabajo, Empleo y Seguridad Social — línea sobre Ley de Contrato de Trabajo y trabajo no registrado: 0800-666-4100, lunes a viernes de 8 a 20hs.",
    },
    {
      texto:
        "Ministerio de Trabajo — orientación general / monotributo social: 0800-222-2220.",
    },
    {
      texto:
        "Si estás afiliado a un sindicato, también podés consultar directamente con el gremio de tu actividad.",
    },
    {
      texto:
        "Podés acceder a patrocinio jurídico gratuito a través del Colegio de Abogados de tu jurisdicción.",
    },
  ],
  nota: "Estos son puntos de partida para pedir orientación — esta app no inicia ningún trámite ni garantiza un resultado.",
};

export const RECURSOS_CONSUMIDOR: RecursosBloque = {
  items: [
    {
      texto:
        "Ventanilla Única Federal de Defensa del Consumidor (para iniciar un reclamo formal)",
      url: "https://www.argentina.gob.ar/servicio/iniciar-un-reclamo-ante-defensa-del-consumidor",
    },
    {
      texto:
        "Oficina de Defensa del Consumidor de tu municipio o provincia — varía según tu jurisdicción, no hay un teléfono único nacional.",
    },
  ],
  nota: "Estos son puntos de partida para pedir orientación — esta app no realiza el trámite ni garantiza un resultado.",
};

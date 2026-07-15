export const SMVM = {
  valorMensual: 372400,
  valorHora: 1862,
  vigenteDesde: "2025-12-01",
  fuente:
    "Resolución 9/2025 del Consejo Nacional del Empleo, la Productividad y el Salario Mínimo, Vital y Móvil (Boletín Oficial, 3/12/2025)",
  fuenteUrl:
    "https://www.boletinoficial.gob.ar/detalleAviso/primera/335463/20251203",
  linkVerificacion: "https://www.argentina.gob.ar/trabajo/salariominimo",
};

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

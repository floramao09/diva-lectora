export type Level = {
  n: number;
  title: string;
  animal: string;
  xp: number;
};

export const LEVELS: Level[] = [
  { n: 1, title: "Lectora Curiosa", animal: "🐭", xp: 0 },
  { n: 2, title: "Recolectora de Frases", animal: "🐹", xp: 100 },
  { n: 3, title: "Exploradora de Historias", animal: "🐰", xp: 250 },
  { n: 4, title: "Guardiana de Marcadores", animal: "🐿️", xp: 450 },
  { n: 5, title: "Aventurera de Páginas", animal: "🦔", xp: 700 },
  { n: 6, title: "Cazadora de Capítulos", animal: "🐱", xp: 1000 },
  { n: 7, title: "Tejedora de Sueños", animal: "🦊", xp: 1350 },
  { n: 8, title: "Coleccionista de Citas", animal: "🦝", xp: 1750 },
  { n: 9, title: "Navegante Literaria", animal: "🦦", xp: 2250 },
  { n: 10, title: "Amiga de los Libros", animal: "🐼", xp: 3000 },
  { n: 11, title: "Corazón de Tinta", animal: "🦌", xp: 4000 },
  { n: 12, title: "Viajera de Bibliotecas", animal: "🐨", xp: 5100 },
  { n: 13, title: "Custodia de Historias", animal: "🦥", xp: 6300 },
  { n: 14, title: "Domadora de Pendientes", animal: "🦢", xp: 7600 },
  { n: 15, title: "Arquitecta de Rutinas", animal: "🐧", xp: 9000 },
  { n: 16, title: "Rastreadora de Autoras", animal: "🦜", xp: 10500 },
  { n: 17, title: "Cartógrafa Literaria", animal: "🦋", xp: 12100 },
  { n: 18, title: "Cronista de Lecturas", animal: "🐬", xp: 13800 },
  { n: 19, title: "Exploradora de Universos", animal: "🦙", xp: 15600 },
  { n: 20, title: "Heroína de Papel", animal: "🦄", xp: 17500 },
  { n: 21, title: "Observadora de Detalles", animal: "🐺", xp: 19500 },
  { n: 22, title: "Descifradora de Símbolos", animal: "🦉", xp: 21700 },
  { n: 23, title: "Curadora de Ideas", animal: "🦚", xp: 24100 },
  { n: 24, title: "Guardiana del Sentido", animal: "🐻", xp: 26700 },
  { n: 25, title: "Investigadora de Historias", animal: "🦦", xp: 29500 },
  { n: 26, title: "Arquitecta de Reflexiones", animal: "🐯", xp: 32500 },
  { n: 27, title: "Coleccionista de Sabiduría", animal: "🦌", xp: 35700 },
  { n: 28, title: "Intérprete de Mundos", animal: "🐋", xp: 39100 },
  { n: 29, title: "Maestra del Subrayado", animal: "🦅", xp: 42700 },
  { n: 30, title: "Oráculo de los Libros", animal: "🐲", xp: 46500 },
  { n: 31, title: "Custodia de Bibliotecas", animal: "🦁", xp: 50500 },
  { n: 32, title: "Cronista del Tiempo", animal: "🦢", xp: 54800 },
  { n: 33, title: "Tejedora de Destinos", animal: "🐉", xp: 59400 },
  { n: 34, title: "Embajadora de Historias", animal: "🦄", xp: 64300 },
  { n: 35, title: "Arquitecta de Sueños", animal: "🦚", xp: 69500 },
  { n: 36, title: "Guardiana de Autoras", animal: "🦋", xp: 75000 },
  { n: 37, title: "Señora de los Universos", animal: "🐬", xp: 80800 },
  { n: 38, title: "Reina de las Lecturas", animal: "🐺", xp: 86900 },
  { n: 39, title: "Leyenda Literaria", animal: "🦁", xp: 93300 },
  { n: 40, title: "Faro de las Lectoras", animal: "🐉", xp: 100000 },
  { n: 41, title: "Portadora de la Pluma Dorada", animal: "🦄", xp: 107000 },
  { n: 42, title: "Guardiana de los Clásicos", animal: "🦚", xp: 114500 },
  { n: 43, title: "Conquistadora de Bibliotecas", animal: "🐲", xp: 122500 },
  { n: 44, title: "Maestra de los Mundos", animal: "🦁", xp: 131000 },
  { n: 45, title: "Voz de las Historias", animal: "🦋", xp: 140000 },
  { n: 46, title: "Emisaria de la Imaginación", animal: "🐋", xp: 149500 },
  { n: 47, title: "Reina de los Mil Libros", animal: "🦅", xp: 159500 },
  { n: 48, title: "Custodia de la Palabra", animal: "🐉", xp: 170000 },
  { n: 49, title: "Soberana de las Letras", animal: "🌈", xp: 181000 },
  { n: 50, title: "Emperatriz de las Letras", animal: "👑", xp: 200000 },
];

export function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  let next: Level | null = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const span = next ? next.xp - current.xp : 1;
  const into = xp - current.xp;
  const pct = next ? Math.min(100, Math.round((into / span) * 100)) : 100;
  return { current, next, pct };
}

// Valores de XP por acción (del documento maestro)
export const XP_VALUES = {
  leerPagina: 1,
  leer10paginas: 10,
  leer10min: 2,
  leer30min: 6,
  leer60min: 12,
  guardarCita: 2,
  guardarCitaFavorita: 3,
  crearMarcador: 1,
  crearNota: 5,
  editarNota: 1,
  crearNotaExtensa: 10,
  abrirConversaDesdeCita: 3,
  primerMensaje: 2,
  conversacion5: 10,
  conversacion10: 20,
  guardarConversacion: 5,
  completarCapitulo: 20,
  completarParte: 40,
  completarLibro: 100,
  completarLibroLargo: 150,
  completarLibroMuyLargo: 200,
  retoDescubrir: 250,
  retoComprender: 750,
  retoEncarnar: 2000,
  racha1: 10,
  racha7: 50,
  racha14: 150,
  racha30: 500,
  racha100: 2000,
  compartirCita: 5,
  compartirResena: 15,
  publicarReflexion: 20,
};

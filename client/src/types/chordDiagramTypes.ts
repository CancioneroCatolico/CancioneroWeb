/** Instrumento soportado */
export type Instrument = 'guitarra' /* | 'ukelele' | 'piano' en el futuro */;

/** Una posición específica de un acorde en el diapasón */
export interface ChordPosition {
    /** Traste donde empieza el diagrama (1 = cejuela, 3 = tercer traste, etc.) */
    baseFret: number;
    /** Posición de los dedos por cuerda (6ta a 1ra). -1 = muda (x), 0 = al aire, 1-4 = traste relativo al baseFret */
    frets: number[];
    /** Qué dedo usa cada cuerda (opcional). 0 = ninguno, 1-4 = índice a meñique */
    fingers?: number[];
    /** Cejillas */
    barres?: { fromString: number; toString: number; fret: number }[];
    /** Etiqueta descriptiva (ej: "Posición abierta", "Cejilla 3er traste") */
    label?: string;
}

/** Un acorde completo con todas sus variaciones para un instrumento */
export interface ChordDefinition {
    /** Nota raíz en notación sostenido (ej: "DO#") — clave interna */
    rootSharp: string;
    /** Nota raíz en notación bemol si aplica (ej: "REb"), null si no tiene equivalente */
    rootFlat: string | null;
    /** Tipo de acorde: "" (mayor), "m", "7", "m7", "maj7", "sus4" */
    quality: string;
    /** Nombre completo para mostrar con sostenido */
    displayNameSharp: string;
    /** Nombre completo para mostrar con bemol (null si no tiene equivalente) */
    displayNameFlat: string | null;
    /** Posiciones ordenadas de más común a menos común */
    positions: ChordPosition[];
}

/** Configuración de cuerdas de un instrumento */
export interface InstrumentConfig {
    id: Instrument;
    name: string;
    strings: number;
    /** Afinación estándar (de grave a agudo, 6ta a 1ra cuerda) */
    tuning: string[];
}

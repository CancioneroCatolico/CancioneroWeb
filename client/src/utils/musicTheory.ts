// Escala cromática usando solo sostenidos (#)
export const SCALE = [
    'DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'
];

// Mapeo de bemoles a su equivalente enarmónico con sostenidos
const FLAT_TO_SHARP: Record<string, string> = {
    'DOb': 'SI',
    'REb': 'DO#',
    'MIb': 'RE#',
    'FAb': 'MI',
    'SOLb': 'FA#',
    'LAb': 'SOL#',
    'SIb': 'LA#',
};

/**
 * Normaliza una nota que puede tener bemol (b) o sostenido (#) a su equivalente en la escala cromática.
 * Ej: "SIb" -> "LA#", "DO#" -> "DO#", "RE" -> "RE"
 */
function normalizeNote(note: string): string {
    return FLAT_TO_SHARP[note] || note;
}

/**
 * Obtiene la distancia en semitonos desde una nota origen a una destino.
 * Soporta tanto sostenidos (#) como bemoles (b).
 * @param fromKey Nota original (ej: "DO", "SIb")
 * @param toKey Nota destino (ej: "RE", "MIb")
 * @returns Diferencia en semitonos
 */
export function getKeyDistance(fromKey: string, toKey: string): number {
    // Normalizar quitando sufijos ("LAm" -> "LA", "SIbm" -> "SIb")
    // Usamos la misma lógica de "root" que transposeChord
    // Incluimos notas con bemol primero (más largas) para que coincidan antes que las simples
    const allNotes = [...Object.keys(FLAT_TO_SHARP), ...SCALE].sort((a, b) => b.length - a.length);
    const getRoot = (k: string) => {
        const found = allNotes.find(note => k.toUpperCase().startsWith(note));
        return found ? normalizeNote(found) : k;
    };

    const fromRoot = getRoot(fromKey);
    const toRoot = getRoot(toKey);

    const fromIndex = SCALE.indexOf(fromRoot);
    const toIndex = SCALE.indexOf(toRoot);

    if (fromIndex === -1 || toIndex === -1) return 0;

    let diff = toIndex - fromIndex;
    // Ajuste para el camino más corto? 
    // Por ahora simple resta. Si estoy en DO (0) y voy a SI (11), diff = 11.
    // Si estoy en SI (11) y voy a DO (0), diff = -11.
    return diff;
}

/**
 * Transpone una nota musical (ej: "LAm", "DO#7", "SIbm") por un número de semitonos.
 * Soporta tanto sostenidos (#) como bemoles (b).
 * Permite que el acorde contenga texto adicional como "Intro: DO" y transpondrá solo el acorde válido.
 * @param chordText La nota, acorde o texto a transponer.
 * @param semitones Cantidad de semitonos a mover (puede ser negativo).
 */
export function transposeChord(chordText: string, semitones: number): string {
    if (semitones === 0) return chordText;

    // Buscamos cualquier palabra que empiece con una nota válida
    // \b asegura que empezamos en un límite de palabra
    // Capturamos tanto sostenidos (#) como bemoles (b) como accidentales
    const regex = /\b(DO|RE|MI|FA|SOL|LA|SI)([#b]?)([a-zA-Z0-9#\+\-ºø]*)(?:\/(DO|RE|MI|FA|SOL|LA|SI)([#b]?))?(?=\s|$|[^\w#\+\-ºø/])/g;

    return chordText.replace(regex, (match, root1, accidental1, suffix, root2, accidental2) => {
        const lowerSuffix = suffix.toLowerCase();
        const validSuffixRegex = /^(m|sus\d*|dim|aug|maj\d*|add\d*|min|[\d\+\-ºø#])*$/;

        // Excepción explícita para la palabra "SOLO"
        if (match === 'SOLO') return match;

        // Si el sufijo tiene caracteres que no son típicos de acordes (y no es 'M' para mayor)
        if (suffix && !validSuffixRegex.test(lowerSuffix) && suffix !== 'M') {
            return match;
        }

        const transposeNote = (root: string, accidental: string) => {
            // Construir la nota y normalizar bemoles a sostenidos para buscar en la escala
            const rawNote = root + (accidental || '');
            const note = normalizeNote(rawNote);
            const index = SCALE.indexOf(note);
            if (index === -1) return rawNote;

            let newIndex = (index + semitones) % SCALE.length;
            if (newIndex < 0) newIndex += SCALE.length;
            return SCALE[newIndex];
        };

        let result = transposeNote(root1, accidental1) + suffix;
        if (root2) {
            result += '/' + transposeNote(root2, accidental2);
        }

        return result;
    });
}

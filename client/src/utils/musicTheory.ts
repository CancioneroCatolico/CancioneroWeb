// Escala cromática usando solo sostenidos (#)
export const SCALE = [
    'DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'
];

/**
 * Obtiene la distancia en semitonos desde una nota origen a una destino.
 * @param fromKey Nota original (ej: "DO")
 * @param toKey Nota destino (ej: "RE")
 * @returns Diferencia en semitonos
 */
export function getKeyDistance(fromKey: string, toKey: string): number {
    // Normalizar quitando sufijos ("LAm" -> "LA")
    // Usamos la misma lógica de "root" que transposeChord
    const sortedScale = [...SCALE].sort((a, b) => b.length - a.length);
    const getRoot = (k: string) => sortedScale.find(note => k.toUpperCase().startsWith(note)) || k;

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
 * Transpone una nota musical (ej: "LAm", "DO#7") por un número de semitonos.
 * Permite que el acorde contenga texto adicional como "Intro: DO" y transpondrá solo el acorde válido.
 * @param chordText La nota, acorde o texto a transponer.
 * @param semitones Cantidad de semitonos a mover (puede ser negativo).
 */
export function transposeChord(chordText: string, semitones: number): string {
    if (semitones === 0) return chordText;

    // Buscamos cualquier palabra que empiece con una nota válida
    // \b asegura que empezamos en un límite de palabra
    const regex = /\b(DO|RE|MI|FA|SOL|LA|SI)(#?)([a-zA-Z0-9#\+\-ºø]*)(?:\/(DO|RE|MI|FA|SOL|LA|SI)(#?))?(?=\s|$|[^\w#\+\-ºø/])/g;

    return chordText.replace(regex, (match, root1, sharp1, suffix, root2, sharp2) => {
        const lowerSuffix = suffix.toLowerCase();
        const validSuffixRegex = /^(m|sus\d*|dim|aug|maj\d*|add\d*|min|[\d\+\-ºøb#])*$/;

        // Excepción explícita para la palabra "SOLO"
        if (match === 'SOLO') return match;

        // Si el sufijo tiene caracteres que no son típicos de acordes (y no es 'M' para mayor)
        if (suffix && !validSuffixRegex.test(lowerSuffix) && suffix !== 'M') {
            return match;
        }

        const transposeNote = (root: string, sharp: string) => {
            const note = root + (sharp || '');
            const index = SCALE.indexOf(note);
            if (index === -1) return note;

            let newIndex = (index + semitones) % SCALE.length;
            if (newIndex < 0) newIndex += SCALE.length;
            return SCALE[newIndex];
        };

        let result = transposeNote(root1, sharp1) + suffix;
        if (root2) {
            result += '/' + transposeNote(root2, sharp2);
        }

        return result;
    });
}

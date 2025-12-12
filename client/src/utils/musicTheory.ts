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
 * @param chord La nota o acorde a transponer.
 * @param semitones Cantidad de semitonos a mover (puede ser negativo).
 */
export function transposeChord(chord: string, semitones: number): string {
    if (semitones === 0) return chord;

    // 1. Separar la nota base (ej: "DO#") del resto del acorde (ej: "m7")
    // Buscamos la nota más larga posible al principio del string que coincida con la escala
    // Esto es para distinguir "SOL" de "SOL#" correctamente.
    let root = '';
    let suffix = '';

    // Intentamos matchear primero notas de 3 caracteres (si hubiera, aunque aca son max 3: SOL#)
    // Luego 2 (DO#), luego 1 (DO).
    // Nuestra escala tiene notas de 2 o 3 chars.

    // Normalizamos input a mayusculas para la comparacion de nota base, pero conservamos sufijo tal cual?
    // Mejor asumimos que el acorde viene "Bien" formateado o hacemos case insensitive la busqueda.

    // Una estrategia segura: Iterar la escala ordenada por longitud descendente
    const sortedScale = [...SCALE].sort((a, b) => b.length - a.length);

    const foundNote = sortedScale.find(note => chord.toUpperCase().startsWith(note));

    if (!foundNote) {
        // Si no reconocemos la nota, la devolvemos tal cual (ej: ruidos, pausas)
        return chord;
    }

    root = foundNote;
    suffix = chord.slice(root.length);

    // 2. Encontrar índice en la escala
    const index = SCALE.indexOf(root);
    if (index === -1) return chord; // Should not happen given logic above

    // 3. Calcular nuevo índice
    // Usamos módulo positivo para manejar indices negativos
    let newIndex = (index + semitones) % SCALE.length;
    if (newIndex < 0) newIndex += SCALE.length;

    // 4. Retornar nueva nota + sufijo original
    return SCALE[newIndex] + suffix;
}

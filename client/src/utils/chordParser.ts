export interface ChordSegment {
    chord: string | null;
    text: string;
}

export function parseLyricsLine(line: string): ChordSegment[] {
    const segments: ChordSegment[] = [];

    // Regex para encontrar acordes entre corchetes: [LAm]texto
    // Captura el acorde y luego el texto hasta el siguiente acorde o fin de linea
    const regex = /\[(.*?)\]([^\[]*)/g;

    let match;

    // Si la linea no arranca con acorde, capturamos el texto inicial
    const firstBracketIndex = line.indexOf('[');
    if (firstBracketIndex > 0) {
        segments.push({
            chord: null,
            text: line.substring(0, firstBracketIndex)
        });
    } else if (firstBracketIndex === -1) {
        // Sin acordes en toda la linea
        return [{ chord: null, text: line }];
    }

    while ((match = regex.exec(line)) !== null) {
        // match[1] es el acorde (sin corchetes)
        // match[2] es el texto que le sigue
        segments.push({
            chord: match[1],
            text: match[2]
        });
    }

    return segments;
}

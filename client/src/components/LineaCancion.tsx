import { parseLyricsLine } from '../utils/chordParser';
import { transposeChord } from '../utils/musicTheory';

interface LineaCancionProps {
    line: string;
    transposition?: number;
}

export function LineaCancion({ line, transposition = 0 }: LineaCancionProps) {
    const segments = parseLyricsLine(line);

    // Si la línea está vacía, renderizamos un espacio para mantener el flow
    if (!line.trim()) {
        return <div style={{ height: '1.5em' }}></div>;
    }

    // Verificamos si hay AL MENOS UN acorde en toda la línea
    const hasChords = segments.some(s => s.chord !== null);

    // Detectamos si es una línea que TIENE acordes pero NO TIENE texto de verdad (solo espacios)
    // Esto arregla el problema visual donde los acordes se desalinean si algunos tienen espacio de texto abajo y otros no.
    const isChordsOnly = hasChords && segments.every(s => !s.text.trim());

    if (isChordsOnly) {
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '8px', lineHeight: '1.2' }}>
                {segments.map((segment, index) => (
                    <div key={index} style={{ marginRight: '1ch' }}>
                        <span
                            className="text-primary"
                            style={{
                                fontSize: '0.9em',
                                fontWeight: 'bold',
                                whiteSpace: 'pre'
                            }}
                        >
                            {segment.chord ? transposeChord(segment.chord, transposition) : ''}
                            {/* Incluimos el texto (que son solo espacios) para mantener la separación original */}
                            {segment.text}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    // Lógica para líneas mixtas (Letra + Acordes)
    // Objetivo: Letra continua (sin espacios forzados) y Acordes sin superponerse.

    // Configuramos estimaciones de ancho para evitar colisiones
    const TEXT_CHAR_WIDTH = 0.65; // Asumimos que el texto es un poco más estrecho (fuente normal)
    const CHORD_CHAR_WIDTH = 1.0; // Los acordes suelen ser más anchos (negrita) + margen seguridad
    const CHORD_MIN_GAP = 1.0;    // Espacio mínimo entre acordes en 'ch'

    let currentTextPos = 0;
    let lastChordEndPos = -10; // Valor inicial bajo para no afectar el primero

    const processedSegments = segments.map(segment => {
        const tChord = segment.chord ? transposeChord(segment.chord, transposition) : null;
        const textLen = segment.text.length * TEXT_CHAR_WIDTH;
        const chordLen = tChord ? (tChord.length * CHORD_CHAR_WIDTH) : 0;

        let leftOffset = 0;

        if (tChord) {
            const idealStart = currentTextPos;
            const minStart = lastChordEndPos + CHORD_MIN_GAP;
            const actualStart = Math.max(idealStart, minStart);

            // Calculamos cuánto tenemos que empujar el acorde a la derecha
            // Si actualStart > idealStart, hay un desplazamiento positivo
            leftOffset = Math.max(0, actualStart - idealStart);

            lastChordEndPos = actualStart + chordLen;
        }

        currentTextPos += textLen;

        return {
            ...segment,
            tChord,
            leftOffset
        };
    });

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: hasChords ? '8px' : '2px', lineHeight: '1.2', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            {processedSegments.map((ps, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingTop: hasChords ? '1.5em' : '0', maxWidth: '100%' }}>



                    {/* Acorde Posicionado Absolutamente con Offset calculado */}
                    {ps.tChord && (
                        <span
                            className="text-primary"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: `${ps.leftOffset}ch`, // Aplicamos el empuje calculado
                                fontSize: '0.9em',
                                fontWeight: 'bold',
                                whiteSpace: 'pre'
                            }}
                        >
                            {ps.tChord}
                        </span>
                    )}

                    {/* Texto normal - define el flujo */}
                    <span style={{
                        fontSize: '1.1em',
                        whiteSpace: 'pre-wrap', // Permitimos WRAP manteniendo espacios
                        minHeight: '1.5em',
                        overflowWrap: 'break-word'
                    }}>
                        {ps.text}
                    </span>
                </div>
            ))}
        </div>
    );
}

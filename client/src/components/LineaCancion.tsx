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

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '8px', lineHeight: '1.2' }}>
            {segments.map((segment, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', marginRight: '2px' }}>

                    {/* Solo mostramos la fila de acordes si la línea tiene al menos uno */}
                    {hasChords && (
                        <span
                            className="text-primary"
                            style={{
                                fontSize: '0.9em',
                                fontWeight: 'bold',
                                minHeight: '1.5em',
                                whiteSpace: 'pre'
                            }}
                        >
                            {segment.chord ? transposeChord(segment.chord, transposition) : ' '}
                        </span>
                    )}

                    {/* SÍLABA / TEXTO */}
                    <span style={{
                        fontSize: '1.1em',
                        whiteSpace: 'pre-wrap',
                    }}>
                        {segment.text}
                    </span>
                </div>
            ))}
        </div>
    );
}

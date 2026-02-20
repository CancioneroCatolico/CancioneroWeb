import { useRef, useLayoutEffect, Fragment } from 'react';
import { parseLyricsLine } from '../utils/chordParser';
import { transposeChord } from '../utils/musicTheory';

interface LineaCancionProps {
    line: string;
    transposition?: number;
}

export function LineaCancion({ line, transposition = 0 }: LineaCancionProps) {
    const segments = parseLyricsLine(line);
    const lineRef = useRef<HTMLDivElement>(null);

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
                            className="text-primary chord-block"
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
    // Objetivo: Letra continua (sin separar palabras) y Acordes sin superponerse.

    // Solucionador de colisiones
    useLayoutEffect(() => {
        if (!lineRef.current) return;

        const chords = lineRef.current.querySelectorAll('.chord-float');
        let lastRight = -1000; // Valor inicial seguro
        let lastTop = -1000; // Trackear eje Y

        chords.forEach((chordEl) => {
            const chord = chordEl as HTMLElement;
            // Reseteamos el transform por si la pantalla cambió de tamaño
            chord.style.transform = 'translateX(0px)';

            const rect = chord.getBoundingClientRect();

            // Si la diferencia en top es mayor a 10px, saltó de renglón
            if (Math.abs(rect.top - lastTop) > 10) {
                lastRight = -1000; // Resetear empuje
                lastTop = rect.top;
            }

            const currentLeft = rect.left;

            // Si el acorde actual pisa el espacio del anterior
            if (currentLeft < lastRight) {
                const shift = lastRight - currentLeft + 8; // 8px de margen visual
                chord.style.transform = `translateX(${shift}px)`;
                // Actualizamos el borde derecho con el nuevo desplazamiento
                lastRight = currentLeft + shift + rect.width;
            } else {
                // No hay colisión, guardamos su borde derecho actual
                lastRight = currentLeft + rect.width;
            }
        });
    }, [line, transposition]);

    return (
        <div ref={lineRef} style={{
            display: 'block',
            marginBottom: hasChords ? '8px' : '2px',
            lineHeight: '1.2',
            breakInside: 'avoid',
            pageBreakInside: 'avoid'
        }}>
            {segments.map((segment, index) => {
                const tChord = segment.chord ? transposeChord(segment.chord, transposition) : null;
                const startsWithSpace = segment.text.startsWith(' ');
                const cleanText = startsWithSpace ? segment.text.substring(1) : segment.text;

                return (
                    <Fragment key={index}>
                        {/* El espacio natural para que fluyan las palabras */}
                        {startsWithSpace && <span>{' '}</span>}

                        {/* Ancla del acorde: un bloque de ancho 0, pero con altura (2.2em) para
                            empujar la caja de línea hacia arriba si este texto llega a saltar de renglón */}
                        {tChord && (
                            <span
                                style={{
                                    display: 'inline-block',
                                    position: 'relative',
                                    width: 0,
                                    height: '2.2em',
                                    verticalAlign: 'baseline'
                                }}
                            >
                                <span
                                    className="chord-float text-primary"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.9em',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {tChord}
                                </span>
                            </span>
                        )}

                        {/* Texto normal - fluye naturalmente con otros span adyacentes */}
                        <span style={{
                            fontSize: '1.1em',
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'break-word'
                        }}>
                            {cleanText}
                        </span>
                    </Fragment>
                );
            })}
        </div>
    );
}

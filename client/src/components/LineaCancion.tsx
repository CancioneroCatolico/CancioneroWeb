import { useRef, useLayoutEffect, Fragment } from 'react';
import { parseLyricsLine } from '../utils/chordParser';
import { transposeChord } from '../utils/musicTheory';

interface LineaCancionProps {
    line: string;
    transposition?: number;
    fontSize?: number;
    onChordClick?: (chord: string, rect: DOMRect) => void;
}

function renderClickableChords(text: string | null, onChordClick?: (chord: string, rect: DOMRect) => void) {
    if (!text) return null;
    if (!onChordClick) return <>{text}</>;

    const regex = /(\b(?:DO|RE|MI|FA|SOL|LA|SI)[#b]?[a-zA-Z0-9#\+\-ºø]*(?:\/(?:DO|RE|MI|FA|SOL|LA|SI)[#b]?)?(?=\s|$|[^\w#\+\-ºø/]))/i;
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) => {
                if (!part) return null;
                const isChord = /^(DO|RE|MI|FA|SOL|LA|SI)/i.test(part) && part.toUpperCase() !== 'SOLO';
                
                if (isChord) {
                    return (
                        <span
                            key={i}
                            className="chord-clickable"
                            onClick={(e) => {
                                e.stopPropagation();
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                onChordClick(part, rect);
                            }}
                        >
                            {part}
                        </span>
                    );
                }
                
                return <span key={i} onClick={(e) => e.stopPropagation()} style={{ cursor: 'default' }}>{part}</span>;
            })}
        </>
    );
}

function renderTextWithBoldContext(text: string, initiallyBold: boolean) {
    if (!text) return { nodes: text, isBold: initiallyBold };
    
    const parts = text.split('**');
    let currentBold = initiallyBold;
    
    const nodes = parts.map((part, i) => {
        const node = currentBold ? <strong key={i}>{part}</strong> : part;
        if (i < parts.length - 1) {
            currentBold = !currentBold;
        }
        return node;
    });
    
    return { nodes, isBold: currentBold };
}

export function LineaCancion({ line, transposition = 0, fontSize = 1, onChordClick }: LineaCancionProps) {
    const segments = parseLyricsLine(line);
    const lineRef = useRef<HTMLDivElement>(null);

    // Lógica para líneas mixtas (Letra + Acordes)
    // Objetivo: Letra continua (sin separar palabras) y Acordes sin superponerse.
    // Solucionador de colisiones (Debe declararse ántes de cualquier early-return)
    useLayoutEffect(() => {
        if (!lineRef.current) return;

        const chords = lineRef.current.querySelectorAll('.chord-float');
        let lastRight = -1000;
        let lastTop = -1000;
        let maxLineRight = 0;

        const containerRect = lineRef.current.getBoundingClientRect();

        chords.forEach((chordEl) => {
            const chord = chordEl as HTMLElement;
            chord.style.transform = 'translateX(0px)';

            const rect = chord.getBoundingClientRect();

            // Si la diferencia en top es mayor a la mitad de la altura física del acorde, saltó de renglón
            if (Math.abs(rect.top - lastTop) > rect.height * 0.5) {
                lastRight = -1000;
                lastTop = rect.top;
            }

            const currentLeft = rect.left;

            if (currentLeft < lastRight) {
                const shift = lastRight - currentLeft + (rect.height * 0.4); // Margen dinámico físico en miniatura
                
                chord.style.transform = `translateX(${shift}px)`;
                
                const newRight = currentLeft + shift + rect.width;
                lastRight = newRight;
                
                const relativeRight = newRight - containerRect.left;
                if (relativeRight > maxLineRight) maxLineRight = relativeRight;
            } else {
                lastRight = currentLeft + rect.width;
                const relativeRight = lastRight - containerRect.left;
                if (relativeRight > maxLineRight) maxLineRight = relativeRight;
            }
        });

        // Asegurar que el contenedor sea lo suficientemente ancho para los acordes desplazados
        // Sumamos un pequeño margen para que no queden pegados al borde de la siguiente columna
        if (lineRef.current) {
            const textWidth = lineRef.current.scrollWidth;

            if (maxLineRight > textWidth) {
                lineRef.current.style.paddingRight = `${maxLineRight - textWidth + 15}px`;
            } else {
                lineRef.current.style.paddingRight = '10px'; // Base gutter
            }
        }
    }, [line, transposition, fontSize]);

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
                            className={`text-primary chord-block`}
                            style={{
                                fontSize: '0.9em',
                                fontWeight: 'bold',
                                whiteSpace: 'pre'
                            }}
                        >
                            {segment.chord ? renderClickableChords(transposeChord(segment.chord, transposition), onChordClick) : ''}
                            {/* Incluimos el texto (que son solo espacios) para mantener la separación original */}
                            {segment.text}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    let isBold = false;

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

                const spaceIsBold = isBold;
                const { nodes, isBold: newIsBold } = renderTextWithBoldContext(cleanText, isBold);
                isBold = newIsBold;

                return (
                    <Fragment key={index}>
                        {/* El espacio natural para que fluyan las palabras */}
                        {startsWithSpace && (spaceIsBold ? <strong>{' '}</strong> : <span>{' '}</span>)}

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
                                    className={`chord-float text-primary`}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.9em',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {renderClickableChords(tChord, onChordClick)}
                                </span>
                            </span>
                        )}

                        {/* Texto normal - fluye naturalmente con otros span adyacentes */}
                        <span style={{
                            fontSize: '1.1em',
                            whiteSpace: 'nowrap'
                        }}>
                            {nodes}
                        </span>
                    </Fragment>
                );
            })}
        </div>
    );
}

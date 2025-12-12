import { useState, useRef, useEffect } from 'react';
import { SCALE, getKeyDistance, transposeChord } from '../utils/musicTheory';

interface TranspositionControlsProps {
    originalKey: string;
    transposition: number;
    onTranspositionChange: (newTransposition: number) => void;
}

export function TranspositionControls({ originalKey, transposition, onTranspositionChange }: TranspositionControlsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Cerrar menú al hacer click afuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentKey = transposeChord(originalKey, transposition);

    const handleKeySelect = (targetKey: string) => {
        const distance = getKeyDistance(currentKey, targetKey);
        // La distancia es relativa al tono ACTUAL, así que sumamos al offset existente
        // newTransposition = transposition + distance
        onTranspositionChange(transposition + distance);
    };

    return (
        <div style={{ position: 'relative' }} ref={menuRef}>
            {/* TRIGGER BUTTON - Disguised as the Tone Display */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '80px', // Fixed width to prevent layout shift
                    padding: '5px 0', // Reduced horizontal padding as width is fixed
                    border: '1px solid var(--card-border)',
                    backgroundColor: isOpen ? 'var(--button-hover)' : 'transparent'
                }}
            >
                <span style={{ fontSize: '0.7em', textTransform: 'uppercase', color: 'var(--secondary-color)' }}>Tono</span>
                <strong style={{ fontSize: '1.2em', color: 'var(--primary-color)' }}>
                    {currentKey}
                </strong>
                {transposition !== 0 && (
                    <span style={{ fontSize: '0.7em', color: 'var(--text-color)', opacity: 0.7 }}>
                        {transposition > 0 ? `+${transposition}` : transposition}
                    </span>
                )}
            </button>

            {/* POPUP MENU */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    padding: '16px',
                    zIndex: 100,
                    minWidth: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {/* SEMITONE CONTROLS */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                            className="btn"
                            onClick={() => onTranspositionChange(transposition - 1)}
                            style={{ border: '1px solid var(--card-border)' }}
                        >
                            - &frac12;
                        </button>
                        <button
                            className="btn"
                            onClick={() => onTranspositionChange(transposition + 1)}
                            style={{ border: '1px solid var(--card-border)' }}
                        >
                            + &frac12;
                        </button>
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'var(--card-border)' }}></div>

                    {/* KEY GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {SCALE.map((note) => {
                            // Mejor comparamos root contra root
                            // Pero currentKey ya viene procesado por transposeChord que devuelve strings de SCALE.
                            // Solo hay que tener cuidado con sufijos ("m", "7") en originalKeys complejos, 
                            // pero el grid son notas limpias.

                            // Si currentKey es "LAm", startsWith("LA") match.
                            // Si currentKey es "LA#", startsWith("LA") match? NO, por el orden en SCALE si iteramos...
                            // Actually pure string check "LA#" startsWith "LA" is true.
                            // Necesitamos exact match con la ROOT del current key.

                            const noteBase = transposeChord(currentKey, 0).replace(/m|7|5|dim|aug|sus|2|4|6|9|11|13/g, '').trim();
                            // Hacky root extraction for highlighting. 
                            // Or use getKeyDistance(noteBase, note) === 0 ?

                            const active = note === noteBase;

                            return (
                                <button
                                    key={note}
                                    className={`btn btn-grid-key ${active ? 'active' : ''}`}
                                    onClick={() => handleKeySelect(note)}
                                >
                                    {note}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'var(--card-border)' }}></div>

                    <button
                        className="btn"
                        onClick={() => {
                            onTranspositionChange(0);
                            setIsOpen(false);
                        }}
                        style={{ width: '100%', border: '1px solid var(--card-border)' }}
                    >
                        Restaurar tono inicial
                    </button>
                </div>
            )}
        </div>
    );
}

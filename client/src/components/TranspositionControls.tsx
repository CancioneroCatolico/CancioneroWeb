import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { SCALE, getKeyDistance, transposeChord } from '../utils/musicTheory';

interface TranspositionControlsProps {
    originalKey: string;
    transposition: number;
    onTranspositionChange: (newTransposition: number) => void;
}

export function TranspositionControls({ originalKey, transposition, onTranspositionChange }: TranspositionControlsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

    // Logic handles in main component body
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            const clickedButton = menuRef.current?.contains(target);
            const clickedPopup = popupRef.current?.contains(target);

            if (!clickedButton && !clickedPopup) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const currentKey = transposeChord(originalKey, transposition);

    // Calcular posición al abrir
    useLayoutEffect(() => {
        if (isOpen && menuRef.current) {
            const updatePosition = () => {
                const rect = menuRef.current!.getBoundingClientRect();
                const scrollX = window.scrollX || window.pageXOffset;
                const scrollY = window.scrollY || window.pageYOffset;
                const viewportWidth = window.innerWidth;
                const popupWidth = 280;

                let left = rect.left + scrollX;
                let top = rect.bottom + scrollY + 8; // Absolute page coordinate

                // Ajuste horizontal (Viewport relative check)
                // rect.left is viewport relative.
                if (rect.left + popupWidth > viewportWidth) {
                    left = (viewportWidth - popupWidth - 10) + scrollX;
                }
                if (rect.left < 0) left = 10 + scrollX;

                setPopupStyle({
                    position: 'absolute', // Absolute to Document (since in direct Body child)
                    top: `${top}px`,
                    left: `${left}px`,
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    padding: '16px',
                    zIndex: 10002,
                    minWidth: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                });
            };

            updatePosition();
            // Optional: Listen to window resize to update? 
            window.addEventListener('resize', updatePosition);
            return () => window.removeEventListener('resize', updatePosition);
        }
    }, [isOpen]);

    const handleKeySelect = (targetKey: string) => {
        const distance = getKeyDistance(currentKey, targetKey);
        onTranspositionChange(transposition + distance);
    };

    return (
        <div style={{ position: 'relative' }} ref={menuRef}>
            {/* TRIGGER BUTTON */}
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
                    backgroundColor: isOpen ? 'var(--button-hover)' : 'transparent',
                    height: '44px', // Match toolbar height force
                    justifyContent: 'center'
                }}
            >
                <span style={{ fontSize: '0.7em', textTransform: 'uppercase', color: 'var(--secondary-color)', lineHeight: 1 }}>Tono</span>
                <strong style={{ fontSize: '1.1em', color: 'var(--primary-color)', lineHeight: 1 }}>
                    {currentKey}
                </strong>
                {transposition !== 0 && (
                    <span style={{ fontSize: '0.7em', color: 'var(--text-color)', opacity: 0.7, position: 'absolute', top: '2px', right: '4px' }}>
                        {transposition > 0 ? `+${transposition}` : transposition}
                    </span>
                )}
            </button>

            {/* POPUP MENU (Portal to Body) */}
            {isOpen && createPortal(
                <div style={popupStyle} ref={popupRef}>
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
                </div>,
                document.body
            )}
        </div>
    );
}

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
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
    
    const popupRef = useRef<HTMLDivElement>(null);

    const checkIsMobile = useCallback(() => {
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isMobileBreakpoint = window.innerWidth <= 850 && window.innerHeight <= 500; // Landscape phone
        return window.innerWidth <= 768 || isMobileBreakpoint || isMobileUserAgent;
    }, []);

    const [isMobile, setIsMobile] = useState(checkIsMobile());

    useEffect(() => {
        const handleResize = () => setIsMobile(checkIsMobile());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        if (isMobile && window.history.state?.modal === 'transposition') {
            window.history.back();
        }
    }, [isMobile]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            const clickedButton = menuRef.current?.contains(target);
            const clickedPopup = popupRef.current?.contains(target);

            if (!clickedButton && !clickedPopup) {
                handleClose();
            }
        }

        if (isOpen && !isMobile) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, isMobile, handleClose]);

    // History API para móviles
    useEffect(() => {
        if (isOpen && isMobile) {
            window.history.pushState({ modal: 'transposition' }, '');
        }
    }, [isOpen, isMobile]);

    useEffect(() => {
        const handlePopState = () => {
            if (isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isOpen]);

    const currentKey = transposeChord(originalKey, transposition);

    // Calcular posición al abrir en Desktop
    useLayoutEffect(() => {
        if (isOpen && !isMobile && menuRef.current) {
            const updatePosition = () => {
                const rect = menuRef.current!.getBoundingClientRect();
                const scrollX = window.scrollX || window.pageXOffset;
                const scrollY = window.scrollY || window.pageYOffset;
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const popupWidth = 280;
                const estimatedPopupHeight = 220; // Aproximadamente la altura del menú desplegado

                let left = rect.left + scrollX;
                let top = rect.bottom + scrollY + 8; // Default: Hacia abajo

                // Ajuste vertical (Viewport relative check)
                if (rect.bottom + estimatedPopupHeight > viewportHeight) {
                    // Si no entra abajo, que se abra hacia arriba
                    top = rect.top + scrollY - estimatedPopupHeight - 8;
                }

                // Ajuste horizontal (Viewport relative check)
                if (rect.left + popupWidth > viewportWidth) {
                    left = (viewportWidth - popupWidth - 10) + scrollX;
                }
                if (rect.left < 0) left = 10 + scrollX;

                setPopupStyle({
                    position: 'absolute',
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
            window.addEventListener('resize', updatePosition);
            return () => window.removeEventListener('resize', updatePosition);
        }
    }, [isOpen, isMobile]);

    const handleKeySelect = (targetKey: string) => {
        const distance = getKeyDistance(currentKey, targetKey);
        onTranspositionChange(transposition + distance);
    };

    const renderMenuContent = () => (
        <>
            {isMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>Seleccionar Tono</h3>
                    <button className="btn-icon-small" onClick={handleClose} style={{ padding: 0 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            )}
            
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
                    const noteBase = transposeChord(currentKey, 0).replace(/m|7|5|dim|aug|sus|2|4|6|9|11|13/g, '').trim();
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
                    handleClose();
                }}
                style={{ width: '100%', border: '1px solid var(--card-border)' }}
            >
                Restaurar tono inicial
            </button>
        </>
    );

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
                    width: '80px',
                    padding: '5px 0',
                    border: '1px solid var(--card-border)',
                    backgroundColor: isOpen ? 'var(--button-hover)' : 'transparent',
                    height: '44px',
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

            {/* PORTAL TO BODY */}
            {isOpen && createPortal(
                isMobile ? (
                    <div className="modal-overlay" onClick={handleClose}>
                        <div 
                            className="modal-content animate-fade-in" 
                            style={{ 
                                padding: '20px', 
                                gap: '16px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                            onClick={(e) => e.stopPropagation()}
                            ref={popupRef}
                        >
                            {renderMenuContent()}
                        </div>
                    </div>
                ) : (
                    <div style={popupStyle} ref={popupRef}>
                        {renderMenuContent()}
                    </div>
                ),
                document.body
            )}
        </div>
    );
}

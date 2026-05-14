import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ChordDiagram } from './ChordDiagram';
import { findChord } from '../data/guitarChords';
import { normalizeNote } from '../utils/musicTheory';
import type { ChordDefinition } from '../types/chordDiagramTypes';

interface ChordPopupProps {
    /** Nombre del acorde tal como aparece en la canción (ya transpuesto) */
    chordName: string;
    /** Rectángulo del elemento que disparó el popup (para posicionar en desktop) */
    anchorRect: DOMRect | null;
    /** Callback para cerrar el popup */
    onClose: () => void;
}

/** Separa la raíz+accidental del sufijo de un acorde. Ej: "SIbm7" -> root="SIb", quality="m7" */
function parseChordName(name: string): { root: string; quality: string } | null {
    const match = name.match(/^(DO|RE|MI|FA|SOL|LA|SI)([#b]?)(.*)/);
    if (!match) return null;
    return { root: match[1] + (match[2] || ''), quality: match[3] || '' };
}

export function ChordPopup({ chordName, anchorRect, onClose }: ChordPopupProps) {
    const [posIndex, setPosIndex] = useState(0);
    const popupRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Parsear y buscar el acorde
    const parsed = parseChordName(chordName);
    const chordDef: ChordDefinition | undefined = parsed ? findChord(chordName) : undefined;

    // Reset position index cuando cambia el acorde
    useEffect(() => {
        setPosIndex(0);
    }, [chordName]);

    // Detectar mobile
    const checkIsMobile = useCallback(() => {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }, []);
    const [isMobile, setIsMobile] = useState(checkIsMobile());

    useEffect(() => {
        const handleResize = () => setIsMobile(checkIsMobile());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [checkIsMobile]);

    // Cerrar al hacer click fuera (desktop)
    useEffect(() => {
        if (isMobile) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, onClose]);

    // Cerrar con Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleClose = () => {
        onClose();
    };

    const handleViewMore = () => {
        handleClose();
        // Normalizar la raíz para la URL del explorador
        if (parsed) {
            const normalizedRoot = normalizeNote(parsed.root);
            navigate(`/herramientas/acordes?nota=${normalizedRoot}&tipo=${parsed.quality}`);
        } else {
            navigate('/herramientas/acordes');
        }
    };

    if (!chordDef) {
        // Acorde no encontrado en la base de datos
        const content = (
            <div className="chord-popup-body" ref={popupRef}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>{chordName}</h3>
                    <button className="btn-icon-small" onClick={handleClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <p className="text-secondary" style={{ margin: 0, textAlign: 'center', padding: '20px 0' }}>
                    Diagrama no disponible para este acorde.
                </p>
            </div>
        );

        return createPortal(
            isMobile ? (
                <div className="modal-overlay" onClick={handleClose}><div className="chord-popup-mobile animate-fade-in" onClick={e => e.stopPropagation()}>{content}</div></div>
            ) : (
                <div className="chord-popup-desktop animate-fade-in" style={getDesktopStyle(anchorRect)} ref={popupRef}>{content}</div>
            ),
            document.body
        );
    }

    const positions = chordDef.positions;
    const currentPos = positions[posIndex] || positions[0];
    const hasPrev = posIndex > 0;
    const hasNext = posIndex < positions.length - 1;

    const content = (
        <div className="chord-popup-body" ref={isMobile ? undefined : popupRef}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 800 }}>
                    {chordName}
                </h3>
                <button className="btn-icon-small" onClick={handleClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Diagrama + Flechas */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <button
                    className="btn-icon-small"
                    onClick={() => setPosIndex(i => i - 1)}
                    disabled={!hasPrev}
                    style={{ opacity: hasPrev ? 1 : 0.2, padding: '8px' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>

                <ChordDiagram position={currentPos} chordName={chordName} size="md" showLabel={false} />

                <button
                    className="btn-icon-small"
                    onClick={() => setPosIndex(i => i + 1)}
                    disabled={!hasNext}
                    style={{ opacity: hasNext ? 1 : 0.2, padding: '8px' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
            </div>

            {/* Indicador de posición */}
            {positions.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                    {positions.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setPosIndex(idx)}
                            style={{
                                width: 8, height: 8, borderRadius: '50%', cursor: 'pointer',
                                backgroundColor: idx === posIndex ? 'var(--primary-color)' : 'var(--card-border)',
                                transition: 'background-color 0.2s',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Label de posición */}
            {currentPos.label && (
                <p className="text-secondary" style={{ margin: '4px 0 0', textAlign: 'center', fontSize: '0.85rem' }}>
                    {currentPos.label}
                </p>
            )}

            {/* Ver más */}
            <button
                className="btn btn-secondary"
                onClick={handleViewMore}
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px', fontSize: '0.85rem' }}
            >
                Ver en el explorador
            </button>
        </div>
    );

    return createPortal(
        isMobile ? (
            <div className="modal-overlay" onClick={handleClose}>
                <div className="chord-popup-mobile animate-fade-in" onClick={e => e.stopPropagation()} ref={popupRef}>
                    {content}
                </div>
            </div>
        ) : (
            <div className="chord-popup-desktop animate-fade-in" style={getDesktopStyle(anchorRect)} ref={popupRef}>
                {content}
            </div>
        ),
        document.body
    );
}

function getDesktopStyle(rect: DOMRect | null): React.CSSProperties {
    if (!rect) return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const popupWidth = 220;
    const popupHeight = 320;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let top = rect.bottom + scrollY + 8;
    let left = rect.left + scrollX - popupWidth / 2 + rect.width / 2;

    // Si no cabe abajo, abrir arriba
    if (rect.bottom + popupHeight > viewportH) {
        top = rect.top + scrollY - popupHeight - 8;
    }
    // Ajuste horizontal
    if (left + popupWidth > viewportW + scrollX - 10) left = viewportW + scrollX - popupWidth - 10;
    if (left < scrollX + 10) left = scrollX + 10;

    return {
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
    };
}

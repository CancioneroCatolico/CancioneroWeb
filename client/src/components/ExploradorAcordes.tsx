import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SCALE, SHARP_TO_FLAT } from '../utils/musicTheory';
import { GUITAR_CHORDS, QUALITIES } from '../data/guitarChords';
import { ChordDiagram } from './ChordDiagram';
import type { ChordDefinition } from '../types/chordDiagramTypes';

// Notas para el grid: agrupamos por equivalencia enarmónica
const NOTE_BUTTONS = SCALE.map(note => ({
    sharp: note,
    flat: SHARP_TO_FLAT[note] || null,
}));

export function ExploradorAcordes() {
    const [searchParams] = useSearchParams();
    const [selectedRoot, setSelectedRoot] = useState('DO');
    const [selectedQuality, setSelectedQuality] = useState('');
    const [selectedPosIndex, setSelectedPosIndex] = useState(0);
    const [useFlats, setUseFlats] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 40;

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Pre-seleccionar acorde desde URL params (ej: ?nota=LA&tipo=m7)
    useEffect(() => {
        const nota = searchParams.get('nota');
        const tipo = searchParams.get('tipo');
        if (nota && SCALE.includes(nota)) {
            setSelectedRoot(nota);
            setSelectedPosIndex(0);
        }
        if (tipo !== null) {
            setSelectedQuality(tipo);
            setSelectedPosIndex(0);
        }
    }, [searchParams]);

    // Buscar el acorde actual
    const currentChord: ChordDefinition | undefined = GUITAR_CHORDS.find(
        c => c.rootSharp === selectedRoot && c.quality === selectedQuality
    );

    const handleNoteSelect = (note: string) => {
        setSelectedRoot(note);
        setSelectedPosIndex(0);
    };

    const handleQualitySelect = (quality: string) => {
        setSelectedQuality(quality);
        setSelectedPosIndex(0);
    };

    const handlePrev = () => {
        if (selectedPosIndex > 0) {
            setSelectedPosIndex(selectedPosIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentChord && selectedPosIndex < currentChord.positions.length - 1) {
            setSelectedPosIndex(selectedPosIndex + 1);
        }
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEndHandler = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) handleNext();
        else if (distance < -minSwipeDistance) handlePrev();
    };

    // Nombre para mostrar
    const getDisplayName = (chord: ChordDefinition) => {
        const rootName = useFlats && chord.rootFlat ? chord.rootFlat : chord.rootSharp;
        const qualityLabel = QUALITIES.find(q => q.id === chord.quality)?.label || '';
        
        if (chord.quality === '5') {
            return `${rootName}5`;
        }
        
        return `${rootName} ${qualityLabel}`.trim();
    };

    const getNoteDisplay = (sharp: string, flat: string | null) => {
        if (useFlats && flat) return flat;
        return sharp;
    };

    return (
        <div className="chord-explorer">
            {/* Header */}
            <div>
                <Link to="/herramientas/biblioteca" replace className="btn-back-link" style={{ marginBottom: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Biblioteca de Acordes
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h1 className="text-dynamic-title" style={{ margin: 0 }}>Guitarra</h1>
                    {/* Toggle #/b */}
                    <button
                        className="chord-notation-toggle"
                        onClick={() => setUseFlats(!useFlats)}
                        title={useFlats ? 'Cambiar a sostenidos (♯)' : 'Cambiar a bemoles (♭)'}
                    >
                        {useFlats ? '♯' : '♭'}
                    </button>
                </div>
            </div>

            {/* Selector de Nota */}
            <div>
                <div className="chord-note-grid">
                    {NOTE_BUTTONS.map(({ sharp, flat }) => (
                        <button
                            key={sharp}
                            className={`chord-note-btn ${selectedRoot === sharp ? 'active' : ''}`}
                            onClick={() => handleNoteSelect(sharp)}
                        >
                            {getNoteDisplay(sharp, flat)}
                            {flat && (
                                <span className="chord-note-sub">
                                    {useFlats ? sharp : flat}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selector de Calidad */}
            <div>
                <div className="chord-quality-bar">
                    {QUALITIES.map(q => (
                        <button
                            key={q.id}
                            className={`chord-quality-chip ${selectedQuality === q.id ? 'active' : ''}`}
                            onClick={() => handleQualitySelect(q.id)}
                        >
                            {q.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Diagrama Principal */}
            {currentChord ? (
                <div 
                    className="chord-main-display"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEndHandler}
                >
                    <h2 className="chord-main-name">
                        {getDisplayName(currentChord)}
                    </h2>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Flecha Izquierda (Desktop) */}
                        {currentChord.positions.length > 1 && selectedPosIndex > 0 && (
                            <button className="chord-nav-btn left" onClick={handlePrev} aria-label="Posición anterior">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                        )}

                        <ChordDiagram
                            position={currentChord.positions[selectedPosIndex] || currentChord.positions[0]}
                            chordName=""
                            size={isDesktop ? 'xl' : 'lg'}
                            showLabel={false}
                        />

                        {/* Flecha Derecha (Desktop) */}
                        {currentChord.positions.length > 1 && selectedPosIndex < currentChord.positions.length - 1 && (
                            <button className="chord-nav-btn right" onClick={handleNext} aria-label="Posición siguiente">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Nombre de la variante (ej: Cejilla 3) */}
                    <div style={{ marginTop: '8px', fontSize: '1.2rem', color: 'var(--secondary-color)', fontWeight: 600 }}>
                        {(currentChord.positions[selectedPosIndex] || currentChord.positions[0]).label}
                    </div>

                    {/* Carrusel Inferior de Puntos */}
                    {currentChord.positions.length > 1 && (
                        <div className="chord-positions-dots">
                            {currentChord.positions.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`chord-position-dot ${selectedPosIndex === idx ? 'active' : ''}`}
                                    onClick={() => setSelectedPosIndex(idx)}
                                    aria-label={`Variante ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="card" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: '16px' }}>
                    <p className="text-secondary" style={{ margin: 0 }}>
                        No se encontró este acorde. Probá con otra combinación.
                    </p>
                </div>
            )}
        </div>
    );
}

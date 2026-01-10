import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Cancion } from '../types';
import { LineaCancion } from './LineaCancion';
import { TranspositionControls } from './TranspositionControls';

export function DetalleCancion() {
    const { id } = useParams(); // Lee el ID de la URL (ej: /cancion/abc1234)
    const [cancion, setCancion] = useState<Cancion | null>(null);
    const [transposition, setTransposition] = useState<number>(0);
    const [viewMode, setViewMode] = useState<'vertical' | 'columns'>('vertical');
    const [fontSize, setFontSize] = useState<number>(1); // 1 = 100% (1em base)
    const [userHasManuallyResized, setUserHasManuallyResized] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Buscamos SOLO esta canción por ID en tu backend
        fetch(`${import.meta.env.VITE_API_URL}/${id}`)
            .then(res => res.json())
            .then(data => {
                setCancion(data);
                setTransposition(0); // Reset al cargar nueva canción
                setFontSize(1); // Reset font size
                setUserHasManuallyResized(false);
            })
            .catch(err => console.error(err));
    }, [id]);


    // Auto-Fit Logic (useLayoutEffect with while loop for robust resizing)
    useLayoutEffect(() => {
        if (!containerRef.current) return;
        if (userHasManuallyResized) return; // Si el usuario intervino, STOP.

        const el = containerRef.current;

        // Ejecutamos lógica específica para Columnas (o general si aplica)
        // El usuario pidió "if viewMode !== columns return" en el ejemplo, 
        // pero la app tiene lógica para vertical también.
        // Adaptamos para que 'columns' use el while loop agresivo.

        if (viewMode === 'columns') {
            let currentSize = 1.0; // Empezar en 1em (o lo que esté seteado, pero el reset lo pone en 1)
            // Forzamos inicio en 1em para el cálculo si queremos ser estrictos, 
            // o usamos fontSize actual? Mejor resetear aquí para cálculo fresco si cambió modo.
            // Pero como setFontSize(1) ya ocurre en el otro effect, asumimos que empieza ahí.
            // Start calculation from 1.0 to ensure max possible size
            currentSize = 1.0;

            el.style.fontSize = `${currentSize}em`;

            // Bucle: Mientras haya scroll horizontal (Más de 1 columna)
            // IGNORAMOS LEGIBILIDAD para garantizar que quepa todo en una pantalla inicialmente.
            // Bajamos hasta 0.1em como seguridad técnica anti-crashes.
            while (el.scrollWidth > el.clientWidth + 2 && currentSize > 0.1) {
                currentSize -= 0.05;
                el.style.fontSize = `${currentSize}em`;
            }

            // Si el loop cambió el tamaño, actualizamos el estado
            if (currentSize !== fontSize) {
                setFontSize(currentSize);
            }
        } else {
            // Lógica para Vertical: TAMBIÉN debe ser agresiva para evitar scroll horizontal.
            // Usamos la misma lógica de bucle 'while' para garantizar ajuste.
            // Lógica para Vertical:
            let currentSize = 1.0;
            el.style.fontSize = `${currentSize}em`;

            // Bucle: Mientras haya scroll horizontal (líneas muy largas)
            // Ignoramos legibilidad para priorizar "cero scroll horizontal"
            while (el.scrollWidth > el.clientWidth + 2 && currentSize > 0.1) {
                currentSize -= 0.05;
                el.style.fontSize = `${currentSize}em`;
            }

            if (currentSize !== fontSize) {
                setFontSize(currentSize);
            }
        }
    }, [viewMode, cancion, userHasManuallyResized]); // Quitamos fontSize de deps para evitar bucle infinito con el loop interno

    // Detectar scroll manual para desactivar auto-fit
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleScroll = () => {
            // Si hay scroll, asumimos interacción del usuario y bloqueamos futuros auto-ajustes
            if (!userHasManuallyResized) {
                setUserHasManuallyResized(true);
            }
        };

        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, [userHasManuallyResized]);



    // Resetear font size y estado manual al cambiar de modo
    useEffect(() => {
        setUserHasManuallyResized(false); // Reiniciamos flag manual
    }, [viewMode]);

    if (!cancion) return <p>Cargando letra...</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '100%', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header y Toolbar (Solo visibles si NO estamos en fullscreen o si decidimos mostrarlos) 
                El usuario dijo "Pantalla completa es solo letra". Así que ocultamos todo lo demás.
                Simplemente el Card se pone encima (z-index).
            */}
            <div style={{ flexShrink: 0 }}>
                <h1 className="text-primary" style={{ marginBottom: '5px' }}>{cancion.titulo}</h1>
                <h3 className="text-secondary" style={{ marginTop: '0' }}>{cancion.autor}</h3>

                <div
                    className="toolbar"
                    style={{
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        maxWidth: '100%',
                        height: '44px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    <div style={{ flex: '0 1 auto', minWidth: 'fit-content' }}>
                        <TranspositionControls
                            originalKey={cancion.tonoBase}
                            transposition={transposition}
                            onTranspositionChange={setTransposition}
                        />
                    </div>

                    <button
                        className="btn"
                        onClick={() => setViewMode(prev => prev === 'vertical' ? 'columns' : 'vertical')}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '44px', height: '44px', padding: 0,
                            flex: '0 0 44px',
                            border: '1px solid var(--card-border)',
                            backgroundColor: 'transparent',
                            borderRadius: '10px',
                            color: 'var(--primary-color)'
                        }}
                        title={viewMode === 'vertical' ? "Vista Columnas" : "Vista Vertical"}
                    >
                        {viewMode === 'vertical' ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="9" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="15" y2="11" /><line x1="9" y1="15" x2="13" y2="15" /></svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="5" y1="8" x2="9" y2="8" /><line x1="5" y1="12" x2="9" y2="12" /><line x1="5" y1="16" x2="9" y2="16" /><line x1="15" y1="8" x2="19" y2="8" /><line x1="15" y1="12" x2="19" y2="12" /><line x1="15" y1="16" x2="19" y2="16" /></svg>
                        )}
                    </button>

                    <div style={{ display: 'flex', gap: '5px', flex: '0 1 auto' }}>
                        <button className="btn" style={{ height: '44px', minWidth: '40px', padding: '0 5px' }} onClick={() => { setFontSize(f => Math.min(f + 0.1, 2)); setUserHasManuallyResized(true); }}>A+</button>
                        <button className="btn" style={{ height: '44px', minWidth: '40px', padding: '0 5px' }} onClick={() => { setFontSize(f => Math.max(f - 0.1, 0.4)); setUserHasManuallyResized(true); }}>A-</button>
                    </div>

                    <button
                        className="btn"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        style={{
                            border: '1px solid var(--card-border)',
                            backgroundColor: isFullscreen ? 'var(--primary-color)' : 'transparent',
                            color: isFullscreen ? 'white' : 'var(--text-color)',
                            marginLeft: 'auto',
                            height: '44px', minWidth: '44px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                        }}
                        title="Fullscreen"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                    </button>
                </div>
            </div>

            <div
                ref={containerRef}
                className="card"
                style={{
                    padding: viewMode === 'columns' ? '20px 60px 20px 20px' : '20px',
                    boxSizing: 'border-box',
                    borderRadius: isFullscreen ? '0' : '10px',
                    border: isFullscreen ? 'none' : undefined,

                    // Fullscreen Overrides
                    position: isFullscreen ? 'fixed' : 'relative',
                    top: isFullscreen ? 0 : 'auto',
                    left: isFullscreen ? 0 : 'auto',
                    width: isFullscreen ? '100vw' : '100%',
                    height: (isFullscreen || viewMode === 'columns') ? '100dvh' : 'auto',
                    zIndex: isFullscreen ? 9999 : 1,
                    backgroundColor: isFullscreen ? 'var(--bg-color)' : undefined, // Restore bg for FS
                    maxWidth: isFullscreen ? 'none' : '100%',

                    // Column logic
                    fontSize: `${fontSize}em`,
                    columnWidth: viewMode === 'columns' ? '20em' : 'auto',
                    columnGap: '2em',
                    columnFill: 'auto',

                    // Scroll & Overflow
                    overflowX: viewMode === 'columns' ? 'auto' : 'visible',
                    overflowY: viewMode === 'columns' ? 'hidden' : (isFullscreen ? 'auto' : 'visible'),
                }}
            >
                {/* Floating Exit Button for Fullscreen (Visible only in FS) */}
                {isFullscreen && (
                    <button
                        onClick={() => setIsFullscreen(false)}
                        style={{
                            position: 'fixed', // Fixed to viewport
                            top: '20px',
                            right: '20px',
                            zIndex: 10001, // Above card
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                )}


                {cancion.letra.map((linea, i) => (
                    <div key={i} style={{ minWidth: '100%' }}>
                        <LineaCancion
                            line={linea}
                            transposition={transposition}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
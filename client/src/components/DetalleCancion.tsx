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
            // Mejor leemos el estado actual por si acaso.
            currentSize = fontSize;

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
            let currentSize = fontSize;
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
        setFontSize(1); // Reiniciamos tamaño base (1em) para intentar el ajuste desde el máximo
    }, [viewMode]);

    if (!cancion) return <p>Cargando letra...</p>;

    return (
        <div style={{
            padding: '20px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            // Lógica Fullscreen movida al contenedor principal para incluir la Toolbar
            position: isFullscreen ? 'fixed' : 'relative',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: isFullscreen ? '100vw' : '100%',
            height: isFullscreen ? '100dvh' : 'min-content', // En modo normal crece, en fullscreen fijo
            minHeight: '100vh',
            backgroundColor: 'var(--bg-color)', // Asegurar fondo opaco en fullscreen
            zIndex: isFullscreen ? 9999 : 1,
            overflow: 'hidden', // Evitar scroll en el wrapper principal, delegar al card
            maxWidth: isFullscreen ? 'none' : '100%'
        }}>
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
                        flexWrap: 'nowrap', // Forzamos una sola línea
                        overflowX: 'auto',   // Permitimos scroll si es absolutamente necesario, pero intentaremos shrink
                        maxWidth: '100%',
                        height: '44px',      // Altura uniforme forzada

                        // Estilos para que los hijos se encojan
                        scrollbarWidth: 'none',   // Ocultar scrollbar visualmente si se puede
                        msOverflowStyle: 'none'
                    }}
                >
                    {/* Transpose Controls (wrapper to force flex behavior) */}
                    <div style={{ flex: '0 1 auto', minWidth: 'fit-content' }}>
                        <TranspositionControls
                            originalKey={cancion.tonoBase}
                            transposition={transposition}
                            onTranspositionChange={setTransposition}
                        />
                    </div>

                    {/* Separador flexible o fijo? Mejor gap. */}

                    {/* View Mode Toggle */}
                    <button
                        className="btn"
                        onClick={() => setViewMode(prev => prev === 'vertical' ? 'columns' : 'vertical')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px', // Cuadrado base
                            height: '44px',
                            padding: 0,
                            flex: '0 0 44px', // No encoger el icono si es posible, o sí? El usuario dijo "textos se achiquen". Iconos mejor fijos.
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

                    {/* Zoom Controls */}
                    <div style={{ display: 'flex', gap: '5px', flex: '0 1 auto' }}>
                        <button className="btn" style={{ height: '44px', minWidth: '40px', padding: '0 5px' }} onClick={() => { setFontSize(f => Math.min(f + 0.1, 2)); setUserHasManuallyResized(true); }}>A+</button>
                        <button className="btn" style={{ height: '44px', minWidth: '40px', padding: '0 5px' }} onClick={() => { setFontSize(f => Math.max(f - 0.1, 0.4)); setUserHasManuallyResized(true); }}>A-</button>
                    </div>

                    {/* Fullscreen Button */}
                    <button
                        className="btn"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        style={{
                            border: '1px solid var(--card-border)',
                            backgroundColor: isFullscreen ? 'var(--primary-color)' : 'transparent',
                            color: isFullscreen ? 'white' : 'var(--text-color)',
                            marginLeft: 'auto', // Push to right
                            height: '44px',
                            minWidth: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                        }}
                        title={isFullscreen ? "Salir Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                        )}
                    </button>
                </div>
            </div>

            <div
                ref={containerRef}
                className="card"
                style={{
                    padding: viewMode === 'columns' ? '10px 40px 10px 20px' : '20px', // Adjusted padding
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    borderRadius: isFullscreen ? '0' : '10px',
                    border: isFullscreen ? 'none' : undefined,

                    // Flex behavior: Fill remaining space
                    flex: '1 1 auto',
                    width: '100%', // Ensure it takes full width of flex container
                    minHeight: 0,  // Critical for flex scrolling

                    // Height calculation:
                    // In Columns mode, we need a specific height for columns to break.
                    // In Vertical Fullscreen, we want to fill space.
                    // In Vertical Normal, we want to start auto but can grow?
                    // Actually, if parent is fixed (fs), '100%' works. 
                    // If parent is auto (normal), 'auto' works.
                    height: (viewMode === 'columns' || isFullscreen) ? '100%' : 'auto',

                    // Estilos dinámicos
                    fontSize: `${fontSize}em`,

                    // Columnas
                    columnWidth: viewMode === 'columns' ? '20em' : 'auto',
                    columnGap: '2em',
                    columnFill: 'auto',

                    // Scroll & Overflow
                    overflowX: viewMode === 'columns' ? 'auto' : 'visible',
                    // Vertical: 
                    // - Columns: hidden (force horizontal).
                    // - Vertical Fullscreen: 'auto' (internal scroll).
                    // - Vertical Normal: 'visible' (page scroll).
                    overflowY: viewMode === 'columns' ? 'hidden' : (isFullscreen ? 'auto' : 'visible'),




                }}
            >
                {/* Botón flotante para salir de Fullscreen */}
                {isFullscreen && (
                    <button
                        onClick={() => setIsFullscreen(false)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            zIndex: 10000,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        ✕
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
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Cancion } from '../types';
import { LineaCancion } from './LineaCancion';
import { TranspositionControls } from './TranspositionControls';

// Componente Toast simple
const Toast = ({ mensaje, visible }: { mensaje: string, visible: boolean }) => {
    if (!visible) return null;
    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease-out',
            fontWeight: 500,
            whiteSpace: 'nowrap'
        }}>
            {mensaje}
        </div>
    );
};

export function DetalleCancion() {
    const { id } = useParams(); // Lee el ID de la URL (ej: /cancion/abc1234)
    const [cancion, setCancion] = useState<Cancion | null>(null);
    const [transposition, setTransposition] = useState<number>(0);
    const [viewMode, setViewMode] = useState<'vertical' | 'columns'>('vertical');
    const [fontSize, setFontSize] = useState<number>(1); // 1 = 100% (1em base)
    const [userHasManuallyResized, setUserHasManuallyResized] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [isFsControlsVisible, setIsFsControlsVisible] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const innerWrapperRef = useRef<HTMLDivElement>(null);

    // Estados para Agregar a Lista
    const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
    const [localLists, setLocalLists] = useState<any[]>([]);
    const [toastMessage, setToastMessage] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [newListName, setNewListName] = useState('');

    // Cargar listas al abrir el modal
    const handleOpenAddListModal = () => {
        const saved = localStorage.getItem('cancionero_listas');
        if (saved) {
            try {
                setLocalLists(JSON.parse(saved));
            } catch (e) {
                console.error("Error leyendo listas", e);
                setLocalLists([]);
            }
        }
        setIsAddListModalOpen(true);
        setIsCreatingList(false);
        setNewListName('');
    };

    const handleAddToList = (listaId: number, listaNombre: string) => {
        if (!cancion) return;

        const saved = localStorage.getItem('cancionero_listas');
        let currentLists = [];
        if (saved) {
            try {
                currentLists = JSON.parse(saved);
            } catch (e) {
                console.error("Error parseando listas", e);
            }
        }

        const cancionAAgregar = {
            idUnicoEnLista: Date.now(),
            tipo: 'oficial',
            idCancion: cancion.numeroCancion || cancion._id,
            titulo: cancion.titulo,
            tonoElegido: cancion.tonoBase
        };

        const updatedLists = currentLists.map((lista: any) => {
            if (lista.id === listaId) {
                return { ...lista, canciones: [...(lista.canciones || []), cancionAAgregar] };
            }
            return lista;
        });

        localStorage.setItem('cancionero_listas', JSON.stringify(updatedLists));
        setIsAddListModalOpen(false);

        // Mostrar Toast
        setToastMessage(`Añadida a "${listaNombre}"`);
        setIsToastVisible(true);
        setTimeout(() => setIsToastVisible(false), 3000);
    };

    const handleCrearYAnadir = () => {
        if (!newListName.trim() || !cancion) return;

        const saved = localStorage.getItem('cancionero_listas');
        let currentLists = [];
        if (saved) {
            try {
                currentLists = JSON.parse(saved);
            } catch (e) {
                console.error("Error parseando listas", e);
            }
        }

        const cancionAAgregar = {
            idUnicoEnLista: Date.now(),
            tipo: 'oficial',
            idCancion: cancion.numeroCancion || cancion._id,
            titulo: cancion.titulo,
            tonoElegido: cancion.tonoBase
        };

        const nuevaLista = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
            nombre: newListName.trim(),
            canciones: [cancionAAgregar]
        };

        const updatedLists = [...currentLists, nuevaLista];
        localStorage.setItem('cancionero_listas', JSON.stringify(updatedLists));
        
        setIsCreatingList(false);
        setNewListName('');
        setIsAddListModalOpen(false);

        setToastMessage(`Añadida a "${nuevaLista.nombre}"`);
        setIsToastVisible(true);
        setTimeout(() => setIsToastVisible(false), 3000);
    };

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


    // Control de scroll horizontal del body en modo vertical
    useEffect(() => {
        if (viewMode === 'vertical' && !userHasManuallyResized) {
            document.body.style.overflowX = 'hidden';
        } else {
            document.body.style.overflowX = '';
        }
        return () => {
            document.body.style.overflowX = '';
        };
    }, [viewMode, userHasManuallyResized]);

    // Control de Auto-hide para botones de Fullscreen
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        if (isFullscreen) {
            timeoutId = setTimeout(() => {
                setIsFsControlsVisible(false);
            }, 1500);
        } else {
            setIsFsControlsVisible(true);
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isFullscreen, isFsControlsVisible]);

    const wakeUpFsControls = () => setIsFsControlsVisible(true);

    // Cálculo dinámico de escala (mediante lógica unificada de while loop)
    useLayoutEffect(() => {
        const calculateAjuste = () => {
            if (userHasManuallyResized) return;
            if (!containerRef.current || !innerWrapperRef.current) return;

            const containerEl = containerRef.current;
            const wrapperEl = innerWrapperRef.current;

            // Aseguramos que la envoltura interior ocupe todo el espacio pero sin transformaciones CSS problemáticas
            wrapperEl.style.transform = 'none';
            wrapperEl.style.width = viewMode === 'columns' ? '100%' : 'max-content';

            if (viewMode === 'vertical') {
                let currentSize = 1.0;
                containerEl.style.fontSize = `${currentSize}em`;

                while (wrapperEl.scrollWidth > containerEl.clientWidth + 2 && currentSize > 0.1) {
                    currentSize -= 0.05;
                    containerEl.style.fontSize = `${currentSize}em`;
                }

                const finalSize = parseFloat(currentSize.toFixed(2));
                if (finalSize !== fontSize) setFontSize(finalSize);

            } else if (viewMode === 'columns') {
                let currentSize = 1.0;
                containerEl.style.fontSize = `${currentSize}em`;

                while (containerEl.scrollWidth > containerEl.clientWidth + 2 && currentSize > 0.1) {
                    currentSize -= 0.05;
                    containerEl.style.fontSize = `${currentSize}em`;
                }

                const finalSize = parseFloat(currentSize.toFixed(2));
                if (finalSize !== fontSize) setFontSize(finalSize);
            }
        };

        calculateAjuste();

        window.addEventListener('resize', calculateAjuste);
        return () => window.removeEventListener('resize', calculateAjuste);
    }, [cancion, transposition, viewMode, userHasManuallyResized, fontSize, isFullscreen]);

    // Resetear font size y estado manual al cambiar de modo
    useEffect(() => {
        if (!userHasManuallyResized) {
            setFontSize(1.0); // Reseteo para asegurar re-cálculo fresco sin caché de vista anterior
        }
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

                    <button
                        className="btn"
                        onClick={handleOpenAddListModal}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '44px', height: '44px', padding: 0,
                            flex: '0 0 44px',
                            border: '1px solid var(--card-border)',
                            backgroundColor: 'transparent',
                            borderRadius: '10px',
                            color: 'var(--text-color)'
                        }}
                        title="Añadir a lista"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                        <div style={{ position: 'absolute', transform: 'translate(8px, 8px)', backgroundColor: 'var(--primary-color)', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
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
                onMouseMove={isFullscreen ? wakeUpFsControls : undefined}
                onTouchStart={isFullscreen ? wakeUpFsControls : undefined}
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

                    // Font base
                    fontSize: `${fontSize}em`,

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
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: isFsControlsVisible ? 1 : 0,
                            pointerEvents: isFsControlsVisible ? 'auto' : 'none',
                            transition: 'opacity 0.4s ease'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                )}


                <div
                    ref={innerWrapperRef}
                    style={{
                        // Column logic
                        display: viewMode === 'columns' ? 'flex' : 'block',
                        flexDirection: viewMode === 'columns' ? 'column' : undefined,
                        flexWrap: viewMode === 'columns' ? 'wrap' : undefined,
                        alignContent: viewMode === 'columns' ? 'flex-start' : undefined,
                        columnGap: '2em',
                        height: viewMode === 'columns' ? '100%' : 'auto',
                    }}
                >
                    {cancion.letra.map((linea, i) => (
                        <div key={i} style={{ width: 'max-content', whiteSpace: 'nowrap' }}>
                            <LineaCancion
                                line={linea}
                                transposition={transposition}
                                fontSize={fontSize}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Añadir a Lista */}
            {isAddListModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setIsAddListModalOpen(false); }}>
                    <div className="modal-content animate-fade-in" style={{ padding: '20px', maxWidth: '350px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 className="modal-title" style={{ margin: 0, fontSize: '1.2rem' }}>Añadir a lista</h3>
                            <button className="btn-icon-small" onClick={() => setIsAddListModalOpen(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {isCreatingList ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Nombre de la nueva lista"
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                    <button className="btn btn-secondary" onClick={() => setIsCreatingList(false)}>Cancelar</button>
                                    <button className="btn btn-primary" onClick={handleCrearYAnadir} disabled={!newListName.trim()}>Crear y Añadir</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {localLists.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--secondary-color)' }}>
                                        <p style={{ marginBottom: '16px' }}>No tienes listas creadas.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                                        {localLists.map(lista => (
                                            <button 
                                                key={lista.id}
                                                className="btn"
                                                style={{
                                                    justifyContent: 'flex-start',
                                                    backgroundColor: 'var(--bg-color)',
                                                    border: '1px solid var(--card-border)',
                                                    padding: '12px 16px',
                                                    color: 'var(--text-color)',
                                                    textAlign: 'left'
                                                }}
                                                onClick={() => handleAddToList(lista.id, lista.nombre)}
                                            >
                                                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                                                    {lista.nombre}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsCreatingList(true)}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                    Crear nueva lista
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <Toast mensaje={toastMessage} visible={isToastVisible} />
        </div>
    );
}
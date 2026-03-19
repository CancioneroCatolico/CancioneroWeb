import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useCanciones } from '../hooks/useCanciones';
import { transposeChord, getKeyDistance } from '../utils/musicTheory';
import { TranspositionControls } from './TranspositionControls';
import { LineaCancion } from './LineaCancion';

// Interfaz para la lista
interface ListaItem {
    id: number;
    nombre: string;
    canciones: { idUnicoEnLista: number, tipo: string, idCancion: number, titulo: string, tonoElegido: string, tonoBase?: string }[];
}

// Funciones Auxiliares Búsqueda
const limpiarAcordes = (texto: string) => {
    return texto.replace(/\[.*?\]/g, '');
};

const normalizar = (str: string) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const normalizarLetra = (str: string) => {
    if (!str) return '';
    const normalized = normalizar(limpiarAcordes(str));
    return normalized.replace(/[.,!?;:()""''-]/g, '');
};

export function MisListas() {
    const { canciones: cancionesOficiales } = useCanciones();
    const [vista, setVista] = useState<'dashboard' | 'editor' | 'live'>('dashboard');
    const [listaActivaId, setListaActivaId] = useState<number | null>(null);
    const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);

    // Live Mode states
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [liveModeFontSize, setLiveModeFontSize] = useState(1.8);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    // Estados para Modales
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [listToDelete, setListToDelete] = useState<{ id: number, nombre: string } | null>(null);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Estado real de listas inicializado desde localStorage o vacío
    const [listas, setListas] = useState<ListaItem[]>(() => {
        const saved = localStorage.getItem('cancionero_listas');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing listas from localStorage", e);
                return [];
            }
        }
        return [];
    });

    // Efecto para guardar en localStorage cada vez que cambien las listas
    useEffect(() => {
        localStorage.setItem('cancionero_listas', JSON.stringify(listas));
    }, [listas]);

    // Live Mode Top-level calculations for Hooks (Must be after 'listas' declaration)
    const listaActivaGlobal = listas.find(l => l.id === listaActivaId);
    const cancionActivaGlobal = listaActivaGlobal?.canciones[currentSongIndex];
    const cancionOficialGlobal = cancionActivaGlobal ? cancionesOficiales.find(c => (c.numeroCancion || (c as any)._id) === cancionActivaGlobal.idCancion) : null;

    // --- ESCALADO DE FONT SIZE EN LIVE MODE ---
    // Estrategia: UNO PASO POR RENDER.
    // El problema de hacer un loop en un timeout es que los paddingRight de LineaCancion.tsx
    // están calculados PARA EL TAMAÑO ANTERIOR y dan medidas incorrectas al medir scrollWidth.
    // Solución: reducir en pasos, dejando que React re-renderice LineaCancion entre cada paso.
    const containerRef = useRef<HTMLDivElement>(null);
    const [isScaling, setIsScaling] = useState(false);

    // Trigger: ocultar y reiniciar el escalado cuando cambia la canción o la vista
    useEffect(() => {
        if (vista !== 'live') return;
        if (containerRef.current) {
            containerRef.current.style.opacity = '0';
        }
        setLiveModeFontSize(4.0);
        setIsScaling(true);
        setIsHeaderVisible(true);
    }, [currentSongIndex, vista]);

    // Un paso de escalado POR RENDER (después de que LineaCancion recalcula padding)
    useLayoutEffect(() => {
        if (!isScaling || !containerRef.current || !cancionOficialGlobal || vista !== 'live') return;
        const container = containerRef.current;
        if (container.clientWidth === 0 || container.clientHeight === 0) return;

        const fits = container.scrollWidth <= container.clientWidth + 2;

        if (fits) {
            // El tamaño actual ya entra: terminamos
            setIsScaling(false);
            container.style.opacity = '1';
        } else if (liveModeFontSize > 0.4) {
            // Reducir en pasos de 0.1em hasta el mínimo legible, luego 0.05em
            const step = liveModeFontSize > 0.9 ? 0.1 : 0.05;
            setLiveModeFontSize(prev => parseFloat((prev - step).toFixed(2)));
        } else {
            // Llegamos al límite: mostrar igual (mejor que invisible)
            setIsScaling(false);
            container.style.opacity = '1';
        }
    }, [isScaling, liveModeFontSize, cancionOficialGlobal, vista]);

    // Header auto-hide timeout
    useEffect(() => {
        if (vista !== 'live') return;
        const hideTimeout = setTimeout(() => {
            setIsHeaderVisible(false);
        }, 1000);
        return () => clearTimeout(hideTimeout);
    }, [vista, currentSongIndex, isHeaderVisible]);

    // Persistir listas en localStorage
    useEffect(() => {
        localStorage.setItem('cancionero_listas', JSON.stringify(listas));
    }, [listas]);

    // Re-escalar cuando la barra de URL del móvil aparece/desaparece (cambia el viewport)
    useEffect(() => {
        if (vista !== 'live') return;

        let resizeTimer: ReturnType<typeof setTimeout>;
        const triggerRescale = () => {
            // Debounce 200ms para que el viewport termine de asentarse
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.style.opacity = '0';
                }
                setLiveModeFontSize(4.0);
                setIsScaling(true);
            }, 200);
        };

        // window resize cubre todos los casos: barra URL, rotación, etc.
        window.addEventListener('resize', triggerRescale);

        // visualViewport.resize es más específico en móviles (cubre barra URL)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', triggerRescale);
        }

        return () => {
            window.removeEventListener('resize', triggerRescale);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', triggerRescale);
            }
            clearTimeout(resizeTimer);
        };
    }, [vista]);




    // Funciones Modal Nueva Lista
    const handleAbrirCrearLista = () => {
        setNewListName('');
        setIsNameModalOpen(true);
    };

    const handleConfirmarCrearLista = () => {
        if (newListName.trim() !== '') {
            const nuevaLista: ListaItem = {
                id: Date.now(),
                nombre: newListName.trim(),
                canciones: []
            };
            setListas(prev => [...prev, nuevaLista]);
            setIsNameModalOpen(false);
            setNewListName('');
        }
    };

    const handleCancelarCrearLista = () => {
        setIsNameModalOpen(false);
        setNewListName('');
    };

    // Funciones Modal Eliminar Lista
    const handleAbrirEliminarLista = (id: number, nombre: string) => {
        setListToDelete({ id, nombre });
    };

    const handleConfirmarEliminarLista = () => {
        if (listToDelete) {
            setListas(prev => prev.filter(l => l.id !== listToDelete.id));
            if (listaActivaId === listToDelete.id) {
                handleVolver();
            }
            setListToDelete(null);
        }
    };

    const handleCancelarEliminarLista = () => {
        setListToDelete(null);
    };

    // Funciones Modal Buscar Canción
    const handleAbrirBuscador = () => {
        setSearchQuery('');
        setIsSearchModalOpen(true);
    };

    const handleCerrarBuscador = () => {
        setIsSearchModalOpen(false);
        setSearchQuery('');
    };

    const handleAgregarCancion = (cancion: any) => {
        if (!listaActivaId) return;

        const cancionAgregar = {
            idUnicoEnLista: Date.now(),
            tipo: 'oficial',
            idCancion: cancion.numeroCancion || cancion.id,
            titulo: cancion.titulo,
            tonoElegido: cancion.tonoBase,
            tonoBase: cancion.tonoBase
        };

        setListas(prev => prev.map(lista => {
            if (lista.id === listaActivaId) {
                return { ...lista, canciones: [...lista.canciones, cancionAgregar] };
            }
            return lista;
        }));

        handleCerrarBuscador();
    };

    const handleEliminarCancion = (idUnicoEnLista: number) => {
        if (!listaActivaId) return;
        setListas(prev => prev.map(lista => {
            if (lista.id === listaActivaId) {
                return { ...lista, canciones: lista.canciones.filter(c => c.idUnicoEnLista !== idUnicoEnLista) };
            }
            return lista;
        }));
    };

    const handleTransponerCancion = (idUnicoEnLista: number, semitones: number, absoluteReset: boolean = false) => {
        if (!listaActivaId) return;
        setListas(prev => prev.map(lista => {
            if (lista.id === listaActivaId) {
                const nuevasCanciones = lista.canciones.map(c => {
                    if (c.idUnicoEnLista === idUnicoEnLista) {
                        if (absoluteReset && c.tonoBase) {
                            return { ...c, tonoElegido: c.tonoBase };
                        }
                        return { ...c, tonoElegido: transposeChord(c.tonoElegido, semitones) };
                    }
                    return c;
                });
                return { ...lista, canciones: nuevasCanciones };
            }
            return lista;
        }));
    };

    // Funciones Modo Atril (Live Mode)
    const handleNextSong = () => {
        const listaActiva = listas.find(l => l.id === listaActivaId);
        if (listaActiva) {
            setCurrentSongIndex(prev => {
                const nextIndex = prev + 1;
                return nextIndex < listaActiva.canciones.length ? nextIndex : prev;
            });
        }
    };

    const handlePrevSong = () => {
        setCurrentSongIndex(prev => {
            const prevIndex = prev - 1;
            return prevIndex >= 0 ? prevIndex : prev;
        });
    };

    const handleOnDragEnd = (result: DropResult) => {
        if (!result.destination || !listaActivaId) return;

        const destinationIndex = result.destination.index;

        setListas(prev => prev.map(lista => {
            if (lista.id === listaActivaId) {
                const nuevasCanciones = Array.from(lista.canciones);
                const [reorderedItem] = nuevasCanciones.splice(result.source.index, 1);
                nuevasCanciones.splice(destinationIndex, 0, reorderedItem);

                return { ...lista, canciones: nuevasCanciones };
            }
            return lista;
        }));
    };

    // Filtrado de Búsqueda
    const searchResultados = searchQuery.trim() === '' ? [] : cancionesOficiales.filter(c => {
        const busquedaNormalizada = normalizar(searchQuery);
        const coincideTitulo = normalizar(c.titulo).includes(busquedaNormalizada);
        const letraStr = c.letra ? c.letra.join(' ') : '';
        const coincideLetra = normalizarLetra(letraStr).includes(busquedaNormalizada);
        return coincideTitulo || coincideLetra;
    }).slice(0, 20); // Limitar a los primeros 20 para no saturar

    const handleAbrirLista = (id: number) => {
        setListaActivaId(id);
        setVista('editor');
    };

    const handleVolver = () => {
        setVista('dashboard');
        setListaActivaId(null);
    };

    const renderDashboard = () => (
        <div className="lists-dashboard animate-fade-in">
            <div className="lists-header">
                <h2>Mis Listas</h2>
                <button className="btn btn-secondary desktop-only-flex" style={{ padding: '10px' }} title="Nueva Lista" onClick={handleAbrirCrearLista}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <button className="btn btn-primary btn-fab mobile-only-flex" style={{ bottom: '80px', right: '20px' }} onClick={handleAbrirCrearLista}>
                    <span className="fab-icon" style={{ display: 'block' }}>+</span>
                    <span className="fab-text">Nueva Lista</span>
                </button>
            </div>

            <div className="lists-grid">
                {listas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--secondary-color)' }}>
                        No tienes ninguna lista todavía. ¡Crea una para empezar!
                    </div>
                ) : (
                    listas.map(lista => (
                        <div
                            key={lista.id}
                            className="card list-card"
                            onClick={() => handleAbrirLista(lista.id)}
                        >
                            <div className="list-card-content">
                                <h3 className="list-card-title">{lista.nombre}</h3>
                                <span className="list-card-count">{lista.canciones?.length || 0} canciones</span>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <button
                                    className="btn-icon-small list-card-options"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuAbiertoId(menuAbiertoId === lista.id ? null : lista.id);
                                    }}
                                    title="Opciones"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="1" />
                                        <circle cx="12" cy="5" r="1" />
                                        <circle cx="12" cy="19" r="1" />
                                    </svg>
                                </button>
                                {menuAbiertoId === lista.id && (
                                    <div className="list-options-menu" style={{
                                        position: 'absolute',
                                        right: '0',
                                        top: '100%',
                                        marginTop: '4px',
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--card-border)',
                                        borderRadius: '8px',
                                        padding: '4px',
                                        zIndex: 10,
                                        boxShadow: '0 4px 12px var(--card-shadow)',
                                        minWidth: '120px'
                                    }}>
                                        <button
                                            className="btn-icon-small"
                                            style={{ color: '#ef4444', width: '100%', justifyContent: 'flex-start', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', textAlign: 'left' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuAbiertoId(null);
                                                handleAbrirEliminarLista(lista.id, lista.nombre);
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', display: 'inline-block' }}>
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderEditor = () => {
        const listaActiva = listas.find(l => l.id === listaActivaId);

        return (
            <div className="list-editor animate-fade-in">
                <div className="editor-header-vertical">
                    <button className="btn-back-link" onClick={handleVolver}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Volver
                    </button>
                    <h2 className="editor-title">{listaActiva?.nombre}</h2>
                </div>

                <div className="editor-actions">
                    <button
                        className="btn btn-primary btn-play"
                        onClick={() => {
                            if (listaActiva && listaActiva.canciones.length > 0) {
                                setCurrentSongIndex(0);
                                setVista('live');
                            }
                        }}
                        disabled={!listaActiva || listaActiva.canciones.length === 0}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Tocar en Vivo
                    </button>
                    <div className="editor-secondary-actions">
                        <button className="btn btn-secondary desktop-only-flex" style={{ padding: '10px' }} title="Agregar Canción" onClick={handleAbrirBuscador}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <button className="btn btn-secondary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="5" height="5" x="3" y="3" rx="1"></rect>
                                <rect width="5" height="5" x="16" y="3" rx="1"></rect>
                                <rect width="5" height="5" x="3" y="16" rx="1"></rect>
                                <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
                                <path d="M21 21v.01"></path>
                                <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
                                <path d="M3 12h.01"></path>
                                <path d="M12 3h.01"></path>
                                <path d="M12 16v.01"></path>
                                <path d="M16 12h1"></path>
                                <path d="M21 12v.01"></path>
                                <path d="M12 21v-1"></path>
                            </svg>
                            Compartir QR
                        </button>
                        <button className="btn btn-secondary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Exportar
                        </button>
                    </div>
                </div>

                <div className="editor-songs">
                    {listaActiva?.canciones.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--secondary-color)' }}>
                            No hay canciones en esta lista.
                        </div>
                    ) : (
                        <DragDropContext onDragEnd={handleOnDragEnd}>
                            <Droppable droppableId="lista-canciones">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef}>
                                        {listaActiva?.canciones.map((cancion, index) => (
                                            <Draggable key={cancion.idUnicoEnLista} draggableId={cancion.idUnicoEnLista.toString()} index={index}>
                                                {(provided) => (
                                                    <div
                                                        className="song-item card"
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                    >
                                                        <div className="song-item-left">
                                                            <span
                                                                className="drag-handle text-secondary"
                                                                {...provided.dragHandleProps}
                                                                title="Arrastrar para reordenar"
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <line x1="8" y1="6" x2="21" y2="6"></line>
                                                                    <line x1="8" y1="12" x2="21" y2="12"></line>
                                                                    <line x1="8" y1="18" x2="21" y2="18"></line>
                                                                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                                                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                                                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                                                </svg>
                                                            </span>
                                                            <span className="song-item-title">{cancion.titulo}</span>
                                                        </div>
                                                        <div className="song-item-right" style={{ gap: '12px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <TranspositionControls
                                                                    originalKey={cancion.tonoBase || cancion.tonoElegido}
                                                                    transposition={getKeyDistance(cancion.tonoBase || cancion.tonoElegido, cancion.tonoElegido)}
                                                                    onTranspositionChange={(delta) => {
                                                                        if (delta === 0) {
                                                                            handleTransponerCancion(cancion.idUnicoEnLista, 0, true);
                                                                        } else {
                                                                            // La diferencia es enviada como absolute target.
                                                                            // Hay que calcular la diferencia relativa para apply 
                                                                            const currentKey = cancion.tonoElegido;
                                                                            const originalKey = cancion.tonoBase || cancion.tonoElegido;
                                                                            const targetKey = transposeChord(originalKey, delta);
                                                                            const relativeDelta = getKeyDistance(currentKey, targetKey);
                                                                            if (relativeDelta !== 0) handleTransponerCancion(cancion.idUnicoEnLista, relativeDelta);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                            <button
                                                                className="btn-icon-small btn-delete"
                                                                onClick={() => handleEliminarCancion(cancion.idUnicoEnLista)}
                                                                title="Eliminar de la lista"
                                                            >
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                </div>

                <button className="btn btn-primary btn-fab mobile-only-flex" style={{ bottom: '80px', right: '20px' }} onClick={handleAbrirBuscador}>
                    <span className="fab-icon" style={{ display: 'block' }}>+</span>
                </button>
            </div>
        );
    };

    const renderLiveMode = () => {
        const listaActiva = listas.find(l => l.id === listaActivaId);
        if (!listaActiva || listaActiva.canciones.length === 0) return null;

        const cancionActiva = listaActiva.canciones[currentSongIndex];
        const cancionOficial = cancionesOficiales.find(c => (c.numeroCancion || (c as any)._id) === cancionActiva.idCancion);

        const wakeUpHeader = () => setIsHeaderVisible(true);

        if (!cancionOficial) {
            return (
                <div className="live-mode-fullscreen" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: 'var(--text-color)' }}>Error: No se pudo cargar la letra de esta canción.</p>
                    <button className="btn btn-primary" onClick={() => {
                        handleNextSong(); // Intentar saltar a la siguiente si esta falla
                        if (currentSongIndex >= listaActiva.canciones.length - 1) setVista('editor');
                    }} style={{ marginTop: '20px' }}>Saltar o Volver al Editor</button>
                </div>
            );
        }

        // Calcular la transposición final para el Live Mode
        // La distancia entre el tono oficial (base) y el tono elegido en la lista
        const baseKey = cancionOficial.tonoBase;
        const targetKey = cancionActiva.tonoElegido;
        const transpositionDelta = getKeyDistance(baseKey, targetKey);

        const isFirst = currentSongIndex === 0;
        const isLast = currentSongIndex === listaActiva.canciones.length - 1;

        return (
            <div className="live-mode-fullscreen animate-fade-in" onClick={wakeUpHeader} onMouseMove={wakeUpHeader} onTouchStart={wakeUpHeader}>
                {/* Floating Header */}
                <div className="live-mode-header" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(5px)',
                    borderBottom: 'none',
                    opacity: isHeaderVisible ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: isHeaderVisible ? 'auto' : 'none'
                }}>
                    <button className="btn-icon-small" onClick={() => setVista('editor')} title="Salir del Modo Atril" style={{ opacity: 0.8, color: 'white' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <h2 className="live-mode-title" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{cancionActiva.titulo}</h2>
                    <div style={{ width: '36px', textAlign: 'center', color: '#ccc', fontSize: '0.9rem' }}>
                        {currentSongIndex + 1}/{listaActiva.canciones.length}
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="live-mode-content"
                    style={{
                        padding: '10px 20px 40px 20px',
                        paddingTop: '2.5em',   // Espacio para que los acordes de la primera línea no se corten
                        fontSize: `${liveModeFontSize}em`,
                        flex: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        flexWrap: 'wrap',
                        alignContent: 'flex-start',  // Siempre desde la izquierda, sin overflow negativo
                        justifyContent: 'flex-start',
                        columnGap: '3em',
                        boxSizing: 'border-box'
                    }}
                >
                    {/* Zonas táctiles invisibles para navegar rápido en móviles o tablets */}
                    <div className="touch-zone-left" onClick={(e) => { e.stopPropagation(); handlePrevSong(); }}></div>
                    <div className="touch-zone-right" onClick={(e) => { e.stopPropagation(); handleNextSong(); }}></div>

                    {/* Contenido Letra adaptado al layout en columnas horizontales */}
                    {cancionOficial.letra && Array.isArray(cancionOficial.letra) ? (
                        cancionOficial.letra.map((linea: string, i: number) => (
                            <div key={i} style={{ width: 'max-content', whiteSpace: 'nowrap' }}>
                                <LineaCancion
                                    line={linea}
                                    transposition={transpositionDelta}
                                    fontSize={liveModeFontSize}
                                />
                            </div>
                        ))
                    ) : (
                        <p style={{ color: 'var(--text-color)' }}>Error: No se pudo cargar la letra de esta canción.</p>
                    )}
                </div>

                <div className="live-mode-controls">
                    <button onClick={(e) => { e.stopPropagation(); handlePrevSong(); }} disabled={isFirst} title="Anterior">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleNextSong(); }} disabled={isLast} title="Siguiente">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="mis-listas-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
            {vista === 'dashboard' && renderDashboard()}
            {vista === 'editor' && renderEditor()}
            {vista === 'live' && renderLiveMode()}

            {/* Modal Nueva Lista */}
            {isNameModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-fade-in">
                        <h3 className="modal-title">Nombre de la lista</h3>
                        <input
                            type="text"
                            className="modal-input"
                            placeholder="Ej: Misa de Domingo"
                            autoFocus
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmarCrearLista()}
                        />
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={handleCancelarCrearLista}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleConfirmarCrearLista} disabled={!newListName.trim()}>Crear</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Eliminar Lista */}
            {listToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content animate-fade-in">
                        <h3 className="modal-title">Eliminar lista</h3>
                        <p style={{ margin: '0 0 24px 0', color: 'var(--text-color)', opacity: 0.9 }}>
                            ¿Estás seguro de que querés eliminar la lista <strong>"{listToDelete.nombre}"</strong>? Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={handleCancelarEliminarLista}>Cancelar</button>
                            <button className="btn modal-btn-danger" onClick={handleConfirmarEliminarLista}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Buscar Canción */}
            {isSearchModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-fade-in" style={{ height: '80vh', maxWidth: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
                            <h3 className="modal-title" style={{ margin: 0 }}>Buscar canción</h3>
                            <button className="btn-icon-small" onClick={handleCerrarBuscador}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '16px', flexShrink: 0 }}>
                            <input
                                type="text"
                                className="modal-input"
                                style={{ width: '100%', boxSizing: 'border-box', marginBottom: 0, paddingLeft: '40px' }}
                                placeholder="Título o letra..."
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--secondary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0, paddingRight: '4px' }}>
                            {searchQuery.trim() === '' ? (
                                <p style={{ color: 'var(--secondary-color)', textAlign: 'center', marginTop: '40px' }}>Escribe para buscar canciones...</p>
                            ) : searchResultados.length === 0 ? (
                                <p style={{ color: 'var(--secondary-color)', textAlign: 'center', marginTop: '40px' }}>No se encontraron resultados.</p>
                            ) : (
                                searchResultados.map(cancion => (
                                    <div
                                        key={cancion._id}
                                        className="card"
                                        style={{ padding: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        onClick={() => handleAgregarCancion(cancion)}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{cancion.titulo}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-color)' }}>{cancion.autor} • Tono: {cancion.tonoBase}</div>
                                        </div>
                                        <button className="btn-icon-small" style={{ color: 'var(--primary-color)' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

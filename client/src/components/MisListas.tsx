import { useState, useEffect } from 'react';

// Interfaz para la lista
interface ListaItem {
    id: number;
    nombre: string;
    canciones: any[]; // Por ahora empty
}

export function MisListas() {
    const [vista, setVista] = useState<'dashboard' | 'editor'>('dashboard');
    const [listaActivaId, setListaActivaId] = useState<number | null>(null);
    const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);

    // Estados para Modales
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [listToDelete, setListToDelete] = useState<{id: number, nombre: string} | null>(null);

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

    // Canciones hardcodeadas por ahora (como pidió el request)

    const cancionesPrueba = [
        { id: 101, titulo: 'Junto a Ti María', tono: 'RE' },
        { id: 102, titulo: 'Pescador de Hombres', tono: 'DO' },
        { id: 103, titulo: 'Alma Misionera', tono: 'SOL' }
    ];

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
                <button className="btn btn-secondary desktop-only-flex" style={{padding: '10px'}} title="Nueva Lista" onClick={handleAbrirCrearLista}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <button className="btn btn-primary btn-fab mobile-only-flex" style={{bottom: '80px', right: '20px'}} onClick={handleAbrirCrearLista}>
                    <span className="fab-icon" style={{display: 'block'}}>+</span>
                    <span className="fab-text">Nueva Lista</span>
                </button>
            </div>
            
            <div className="lists-grid">
                {listas.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '40px 20px', color: 'var(--secondary-color)'}}>
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
                            <div style={{position: 'relative'}}>
                                <button 
                                    className="btn-icon-small list-card-options" 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setMenuAbiertoId(menuAbiertoId === lista.id ? null : lista.id); 
                                    }}
                                    title="Opciones"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="1"/>
                                        <circle cx="12" cy="5" r="1"/>
                                        <circle cx="12" cy="19" r="1"/>
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
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', display: 'inline-block'}}>
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
                    <button className="btn btn-primary btn-play">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Tocar en Vivo
                    </button>
                    <div className="editor-secondary-actions">
                        <button className="btn btn-secondary desktop-only-flex" style={{ padding: '10px' }} title="Agregar Canción">
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
                    {cancionesPrueba.map(cancion => (
                        <div key={cancion.id} className="song-item card">
                            <div className="song-item-left">
                                <span className="drag-handle text-secondary">
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
                            <div className="song-item-right">
                                <span className="song-item-chord">{cancion.tono}</span>
                                <button className="btn-icon-small btn-delete">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="btn btn-primary btn-fab mobile-only-flex" style={{ bottom: '80px', right: '20px' }}>
                    <span className="fab-icon" style={{ display: 'block' }}>+</span>
                </button>
            </div>
        );
    };

    return (
        <div className="mis-listas-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
            {vista === 'dashboard' ? renderDashboard() : renderEditor()}

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
        </div>
    );
}

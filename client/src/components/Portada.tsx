import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCanciones } from '../hooks/useCanciones';
import { useBusqueda } from '../context/BusquedaContext';
import type { Cancion } from '../types';

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

export function Portada() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const tipoBusqueda = searchParams.get('tipo') || 'Título';

    const catParam = searchParams.get('cat');
    const filtrosCategorias = useMemo(() => {
        return catParam ? catParam.split(',') : [];
    }, [catParam]);

    const { setTermino } = useBusqueda();
    const { canciones, cargando, error } = useCanciones();
    const [resultados, setResultados] = useState<Cancion[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Sincronizar el texto de búsqueda del contexto con la URL
    useEffect(() => {
        setTermino(query);
    }, [query, setTermino]);

    const categorias = useMemo(() => {
        const lista = canciones.flatMap(c => c.categorias || []).filter(Boolean);
        return Array.from(new Set(lista)).sort();
    }, [canciones]);

    const updateParams = (updates: { q?: string, tipo?: string, cat?: string[] }) => {
        const params = new URLSearchParams(searchParams);

        if (updates.q !== undefined) {
            if (updates.q) params.set('q', updates.q);
            else params.delete('q');
        }

        if (updates.tipo !== undefined) {
            if (updates.tipo !== 'Título') params.set('tipo', updates.tipo);
            else params.delete('tipo');
        }

        if (updates.cat !== undefined) {
            if (updates.cat.length > 0) params.set('cat', updates.cat.join(','));
            else params.delete('cat');
        }

        setSearchParams(params, { replace: true });
    };

    const toggleCategoria = (cat: string) => {
        const newCats = filtrosCategorias.includes(cat)
            ? filtrosCategorias.filter(c => c !== cat)
            : [...filtrosCategorias, cat];
        updateParams({ cat: newCats });
    };

    const limpiarFiltros = () => {
        updateParams({ q: '', tipo: 'Título', cat: [] });
    };

    useEffect(() => {
        // En Portada, si no hay filtros, mostramos TODAS las canciones
        if (canciones.length > 0) {
            const tieneFiltros = query || filtrosCategorias.length > 0;

            if (!tieneFiltros) {
                setResultados(canciones);
                return;
            }

            const busquedaNormalizada = normalizar(query);

            const filtradas = canciones.filter(c => {
                let coincideTexto = true;

                if (busquedaNormalizada) {
                    if (tipoBusqueda === 'Título') {
                        coincideTexto = normalizar(c.titulo).includes(busquedaNormalizada) ||
                            (c.numeroCancion?.toString().includes(busquedaNormalizada) ?? false);
                    } else if (tipoBusqueda === 'Letra') {
                        const letraStr = c.letra ? c.letra.join(' ') : '';
                        coincideTexto = normalizarLetra(letraStr).includes(busquedaNormalizada);
                    }
                }

                // Filtro de Categoría (OR: debe tener AL MENOS UNA de las seleccionadas)
                const coincideCategoria = filtrosCategorias.length === 0 ||
                    filtrosCategorias.some(cat => c.categorias && c.categorias.includes(cat));

                return coincideTexto && coincideCategoria;
            });
            setResultados(filtradas);
        }
    }, [query, tipoBusqueda, filtrosCategorias, canciones]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownOpen && !(e.target as Element).closest('.custom-dropdown-container')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [dropdownOpen]);

    const tieneFiltrosActivos = query || filtrosCategorias.length > 0;

    return (
        <div className="portada-container">
            {/* Sección de Búsqueda Avanzada Movida aquí */}
            <div className="advanced-search-section" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary-color)' }}>Búsqueda Avanzada</h3>
                    {tieneFiltrosActivos && (
                        <button
                            onClick={limpiarFiltros}
                            className="btn-primary"
                            style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                backgroundColor: 'var(--card-border)',
                                color: 'var(--text-color)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                fontSize: '0.85em'
                            }}
                        >
                            <span>✕</span> Limpiar
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Selector de Tipo de Búsqueda */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['Título', 'Letra'].map(tipo => (
                            <button
                                key={tipo}
                                onClick={() => updateParams({ tipo })}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--primary-color)',
                                    backgroundColor: tipoBusqueda === tipo ? 'var(--primary-color)' : 'transparent',
                                    color: tipoBusqueda === tipo ? '#fff' : 'var(--text-color)',
                                    cursor: 'pointer',
                                    fontSize: '0.9em',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {tipo}
                            </button>
                        ))}
                    </div>

                    {/* Selector de Categorías Dropdown */}
                    <div className="custom-dropdown-container" style={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
                        <div
                            className="input-search"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                userSelect: 'none',
                                backgroundColor: 'var(--input-bg)',
                                padding: '10px 15px',
                                borderRadius: '8px',
                                border: '1px solid var(--card-border)',
                                width: '100%',
                                maxWidth: '400px' // Limitamos el ancho del selector en sí
                            }}
                        >
                            <span style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginRight: '10px',
                                fontSize: '0.95em'
                            }}>
                                {filtrosCategorias.length === 0
                                    ? 'Todas las Categorías'
                                    : filtrosCategorias.join(', ')}
                            </span>
                            <span style={{ fontSize: '0.7em', opacity: 0.7 }}>▼</span>
                        </div>

                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                width: '100%',
                                maxWidth: '400px', // Debe coincidir con el maxWidth del selector
                                maxHeight: '250px',
                                overflowY: 'auto',
                                backgroundColor: 'var(--card-bg)',
                                border: '1px solid var(--card-border)',
                                borderRadius: '8px',
                                marginTop: '4px',
                                zIndex: 100,
                                boxShadow: '0 4px 12px var(--card-shadow)'
                            }}>
                                {categorias.map(cat => {
                                    const active = filtrosCategorias.includes(cat);
                                    return (
                                        <div
                                            key={cat}
                                            onClick={() => toggleCategoria(cat)}
                                            style={{
                                                padding: '10px 15px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                borderBottom: '1px solid var(--card-border)',
                                                backgroundColor: active ? 'var(--button-hover)' : 'transparent',
                                                color: 'var(--text-color)',
                                                fontSize: '0.9em'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={active}
                                                readOnly
                                                style={{ cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                                            />
                                            <span>{cat}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 className="text-dynamic-title" style={{ margin: 0 }}>
                    {tieneFiltrosActivos ? 'Resultados' : 'Lista de Canciones'}
                </h2>
                {tieneFiltrosActivos && !cargando && !error && (
                    <span style={{ color: 'var(--secondary-color)', fontSize: '0.9em' }}>
                        {resultados.length} {resultados.length === 1 ? 'canción' : 'canciones'}
                    </span>
                )}
            </div>

            {cargando && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="card" style={{
                            padding: '15px',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '10px',
                            opacity: 1 - i * 0.1
                        }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ height: '18px', width: '60%', borderRadius: '6px', background: 'var(--card-border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                <div style={{ height: '13px', width: '40%', borderRadius: '6px', background: 'var(--card-border)', animation: 'pulse 1.5s ease-in-out infinite 0.2s' }} />
                            </div>
                            <div style={{ height: '34px', width: '80px', borderRadius: '20px', background: 'var(--card-border)', animation: 'pulse 1.5s ease-in-out infinite 0.4s', flexShrink: 0 }} />
                        </div>
                    ))}
                </div>
            )}
            {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

            {!cargando && !error && resultados.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--secondary-color)', marginTop: '20px' }}>
                    No hay canciones que coincidan con la búsqueda.
                </p>
            )}

            <div className="lista animate-fade-in">
                {resultados.map((c) => (
                    <div key={c._id} className="card" style={{ padding: '15px', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong className="text-primary" style={{ fontSize: '1.1em', flexShrink: 0 }}>#{c.numeroCancion}</strong>
                                <strong style={{ fontSize: '1.1em', wordBreak: 'break-word' }}>{c.titulo}</strong>
                            </div>
                            <div className="text-secondary" style={{ marginTop: '4px', marginLeft: '30px', fontSize: '0.9em' }}>
                                {c.autor} {c.categorias && c.categorias.length > 0 && `• ${c.categorias.join(', ')}`}
                            </div>
                        </div>

                        <Link to={`/cancion/${c.numeroCancion}`} className="btn-primary" style={{ padding: '8px 15px', textDecoration: 'none', borderRadius: '20px', fontSize: '0.9em', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            Ver Letra
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

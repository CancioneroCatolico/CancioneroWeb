import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCanciones } from '../hooks/useCanciones';
import { useBusqueda } from '../context/BusquedaContext';
import type { Cancion } from '../types';

const normalizar = (str: string) =>
    str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

export function Resultados() {
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
        const tieneFiltros = query || filtrosCategorias.length > 0;

        if (!tieneFiltros) {
            setResultados([]);
            return;
        }

        if (canciones.length > 0) {
            const busquedaNormalizada = normalizar(query);

            const filtradas = canciones.filter(c => {
                let coincideTexto = true;

                if (busquedaNormalizada) {
                    if (tipoBusqueda === 'Título') {
                        coincideTexto = normalizar(c.titulo).includes(busquedaNormalizada) ||
                            (c.numeroCancion?.toString().includes(busquedaNormalizada) ?? false);
                    } else if (tipoBusqueda === 'Letra') {
                        const letraStr = c.letra ? c.letra.join(' ') : '';
                        coincideTexto = normalizar(letraStr).includes(busquedaNormalizada);
                    }
                } else {
                    // Si el buscador de texto está vacío, no mostraremos ninguna canción por coincidencia de texto
                    // A MENOS que estemos buscando SÓLO por categoría (sin texto). Sin embargo, 
                    // para respetar "el por defecto de cualquier tipo de filtro debe ser vacio", 
                    // forzaremos a que siempre requiera texto o categorías para funcionar (lo cual ya maneja 'tieneFiltros').
                    // Si llega aquí sin query, pero con categorías seleccionadas, queremos ver las de esa categoría.
                    // PERO si no hay categorías Y no hay texto, `tieneFiltros` ya devuelve [].
                    // Si la orden es "el por defecto de CUALQUIER tipo de BÚSQUEDA debe ser vacío", 
                    // significa que si cambias de "Título" a "Letra" a "Categoría" sin escribir nada, siempre sale vacío en vez de toda la lista.
                    // Como el comportamiento de "sin filtros = vacío" ya lo cubre la línea 74,
                    // Si quisieran que sin texto SIEMPRE esté vacío incluso seleccionando categorías, sería:
                    coincideTexto = filtrosCategorias.length > 0 ? true : false;
                }

                // Filtro de Categoría (AND: debe tener TODAS las seleccionadas del dropdown)
                const coincideCategoria = filtrosCategorias.length === 0 ||
                    filtrosCategorias.every(cat => c.categorias && c.categorias.includes(cat));

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
        <div>
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 className="text-dynamic-title">
                        {query ? `Resultados para "${query}"` : 'Búsqueda Avanzada'}
                    </h2>
                    {tieneFiltrosActivos && (
                        <button
                            onClick={limpiarFiltros}
                            className="btn-primary"
                            style={{
                                padding: '8px 15px',
                                borderRadius: '20px',
                                backgroundColor: 'var(--card-border)',
                                color: 'var(--text-color)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                fontSize: '0.9em'
                            }}
                        >
                            <span>✕</span> Limpiar Filtros
                        </button>
                    )}
                </div>

                {/* Controles de Búsqueda Avanzada */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>

                    {/* Selector de Tipo de Búsqueda */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['Título', 'Letra'].map(tipo => (
                            <button
                                key={tipo}
                                onClick={() => updateParams({ tipo })}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--primary-color)',
                                    backgroundColor: tipoBusqueda === tipo ? 'var(--primary-color)' : 'transparent',
                                    color: tipoBusqueda === tipo ? '#fff' : 'var(--text-color)',
                                    cursor: 'pointer',
                                    fontWeight: tipoBusqueda === tipo ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {tipo}
                            </button>
                        ))}
                    </div>

                    {/* Selector de Categorías Dropdown */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="custom-dropdown-container" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <div
                                className="input-search"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    userSelect: 'none',
                                    backgroundColor: 'var(--input-bg)'
                                }}
                            >
                                <span style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginRight: '10px'
                                }}>
                                    {filtrosCategorias.length === 0
                                        ? 'Todas las Categorías'
                                        : filtrosCategorias.join(', ')}
                                </span>
                                <span style={{ fontSize: '0.8em', opacity: 0.7 }}>▼</span>
                            </div>

                            {dropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    width: '100%',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    backgroundColor: 'var(--card-bg)',
                                    border: '1px solid var(--card-border)',
                                    borderRadius: '8px',
                                    marginTop: '4px',
                                    zIndex: 100,
                                    boxShadow: '0 4px 6px var(--card-shadow)'
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
                                                    color: 'var(--text-color)'
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
            </div>

            {cargando && <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>Buscando...</p>}
            {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

            {!cargando && !error && resultados.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--secondary-color)', marginTop: '40px' }}>
                    {query || filtrosCategorias.length > 0
                        ? 'No se encontraron canciones con estos criterios.'
                        : 'Ingresa un término o selecciona categorías para buscar.'}
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
                                {c.autor} • {c.categorias?.join(', ')}
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

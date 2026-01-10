import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCanciones } from '../hooks/useCanciones';
import type { Cancion } from '../types';

export function Resultados() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { canciones, cargando, error } = useCanciones();
    const [resultados, setResultados] = useState<Cancion[]>([]);

    // Estados para filtros
    // Ahora permite múltiples categorías
    const [filtrosCategorias, setFiltrosCategorias] = useState<string[]>([]);

    const categorias = useMemo(() => {
        const lista = canciones.flatMap(c => c.categorias || []).filter(Boolean);
        return Array.from(new Set(lista)).sort();
    }, [canciones]);

    const toggleCategoria = (cat: string) => {
        setFiltrosCategorias(prev =>
            prev.includes(cat)
                ? prev.filter(c => c !== cat)
                : [...prev, cat]
        );
    };

    useEffect(() => {
        const tieneFiltros = query || filtrosCategorias.length > 0;

        if (!tieneFiltros) {
            setResultados([]);
            return;
        }

        if (canciones.length > 0) {
            const busqueda = query.toLowerCase();

            const filtradas = canciones.filter(c => {
                // Filtro de Texto (si existe query) - Mantenemos búsqueda por autor en texto
                const coincideTexto = !query ||
                    c.titulo.toLowerCase().includes(busqueda) ||
                    c.autor.toLowerCase().includes(busqueda) ||
                    c.numeroCancion?.toString().includes(busqueda);

                // Filtro de Categoría (AND: debe tener TODAS las seleccionadas)
                const coincideCategoria = filtrosCategorias.length === 0 ||
                    filtrosCategorias.every(cat => c.categorias && c.categorias.includes(cat));

                return coincideTexto && coincideCategoria;
            });
            setResultados(filtradas);
        }
    }, [query, canciones, filtrosCategorias]);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Cerrar dropdown al hacer click fuera (simple implementation)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownOpen && !(e.target as Element).closest('.custom-dropdown-container')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [dropdownOpen]);

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h2 className="text-dynamic-title">
                    {query ? `Resultados para "${query}"` : 'Búsqueda Avanzada'}
                </h2>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    {/* Custom Multi-select Dropdown */}
                    <div className="custom-dropdown-container" style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
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

            {cargando && <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>Buscando...</p>}
            {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

            {!cargando && !error && resultados.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--secondary-color)', marginTop: '40px' }}>
                    {(query || filtrosCategorias.length > 0)
                        ? 'No se encontraron canciones con estos criterios.'
                        : 'Ingresa un término o selecciona categorías para buscar.'}
                </p>
            )}

            <div className="lista animate-fade-in">
                {resultados.map((c) => (
                    <div key={c._id} className="card" style={{ padding: '15px', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong className="text-primary" style={{ fontSize: '1.1em' }}>#{c.numeroCancion}</strong>
                                <strong style={{ fontSize: '1.1em' }}>{c.titulo}</strong>
                            </div>
                            <div className="text-secondary" style={{ marginTop: '4px', marginLeft: '30px', fontSize: '0.9em' }}>
                                {c.autor} • {c.categorias?.join(', ')}
                            </div>
                        </div>

                        <Link to={`/cancion/${c.numeroCancion}`} className="btn-primary" style={{ padding: '8px 15px', textDecoration: 'none', borderRadius: '20px', fontSize: '0.9em', fontWeight: 'bold' }}>
                            Ver
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

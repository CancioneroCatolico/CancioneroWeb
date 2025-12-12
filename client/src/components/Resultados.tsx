import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCanciones } from '../hooks/useCanciones';
import type { Cancion } from '../types';

export function Resultados() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { canciones, cargando, error } = useCanciones();
    const [resultados, setResultados] = useState<Cancion[]>([]);

    useEffect(() => {
        if (!query) { // Si no busca nada, no hay resultados
            setResultados([]);
            return;
        }

        if (canciones.length > 0) {
            const busqueda = query.toLowerCase();
            const filtradas = canciones.filter(c =>
                c.titulo.toLowerCase().includes(busqueda) ||
                c.autor.toLowerCase().includes(busqueda) ||
                c.numeroCancion?.toString().includes(busqueda)
            );
            setResultados(filtradas);
        }
    }, [query, canciones]);

    return (
        <div>
            <h2 className="text-dynamic-title" style={{ marginBottom: '20px' }}>
                Resultados para "{query}"
            </h2>

            {cargando && <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>Buscando...</p>}
            {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

            {!cargando && !error && resultados.length === 0 && (
                <p style={{ textAlign: 'center' }}>No se encontraron canciones que coincidan con "{query}".</p>
            )}

            <div className="lista">
                {resultados.map((c) => (
                    <div key={c._id} className="card" style={{ padding: '15px', marginBottom: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong className="text-primary" style={{ fontSize: '1.1em' }}>#{c.numeroCancion}</strong>
                                <strong style={{ fontSize: '1.1em' }}>{c.titulo}</strong>
                            </div>
                            <div className="text-secondary" style={{ marginTop: '4px', marginLeft: '30px' }}>
                                {c.autor} <small className="badge" style={{ padding: '2px 6px', borderRadius: '4px' }}>{c.tonoBase}</small>
                            </div>
                        </div>

                        <Link to={`/cancion/${c.numeroCancion}`} className="btn-primary" style={{ padding: '8px 15px', textDecoration: 'none', borderRadius: '20px', fontSize: '0.9em', fontWeight: 'bold' }}>
                            Ver Letra
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

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
            <h2 style={{ marginBottom: '20px', color: '#333' }}>
                Resultados para "{query}"
            </h2>

            {cargando && <p style={{ textAlign: 'center', color: '#666' }}>Buscando...</p>}
            {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

            {!cargando && !error && resultados.length === 0 && (
                <p style={{ textAlign: 'center' }}>No se encontraron canciones que coincidan con "{query}".</p>
            )}

            <div className="lista">
                {resultados.map((c) => (
                    <div key={c._id} style={{ backgroundColor: 'white', padding: '15px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong style={{ fontSize: '1.1em', color: '#007bff' }}>#{c.numeroCancion}</strong>
                                <strong style={{ fontSize: '1.1em' }}>{c.titulo}</strong>
                            </div>
                            <div style={{ color: '#666', marginTop: '4px', marginLeft: '30px' }}>
                                {c.autor} <small style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{c.tonoBase}</small>
                            </div>
                        </div>

                        <Link to={`/cancion/${c.numeroCancion}`} style={{ background: '#007bff', color: 'white', padding: '8px 15px', textDecoration: 'none', borderRadius: '20px', fontSize: '0.9em', fontWeight: 'bold' }}>
                            Ver Letra
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

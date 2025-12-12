import { Link } from 'react-router-dom'
import { useCanciones } from '../hooks/useCanciones'

export function Portada() {
    const { canciones, cargando, error } = useCanciones();

    // En Portada mostramos TODO, o quizás solo las últimas agregadas si hubiera esa info.
    // Por ahora mostramos todas tal cual vienen del hook.
    // NO filtramos por búsqueda aquí.

    return (
        <>
            <h2 className="text-dynamic-title" style={{ marginBottom: '20px' }}>
                Lista de Canciones
            </h2>

            {cargando && <p style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>Cargando repertorio...</p>}
            {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

            {!cargando && !error && canciones.length === 0 && (
                <p style={{ textAlign: 'center' }}>No hay canciones disponibles.</p>
            )}

            <div className="lista">
                {canciones.map((c) => (
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
        </>
    )
}

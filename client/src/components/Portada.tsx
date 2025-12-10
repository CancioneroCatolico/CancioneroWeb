import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Cancion } from '../types'
import { useBusqueda } from '../context/BusquedaContext' // Importar hook

export function Portada() {
    const [canciones, setCanciones] = useState<Cancion[]>([])
    const [cargando, setCargando] = useState<boolean>(true)

    // 1. LEEMOS LO QUE EL USUARIO ESCRIBIÓ EN EL NAVBAR
    const { termino } = useBusqueda();

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then((data: Cancion[]) => {
                setCanciones(data)
                setCargando(false)
            })
            .catch(err => {
                console.error(err)
                setCargando(false)
            })
    }, [])

    // 2. LÓGICA DE FILTRADO (Magia pura)
    // Creamos una nueva lista filtrada basada en el término de búsqueda.
    // Usamos toLowerCase() para que "La Bamba" se encuentre escribiendo "bamba".
    const cancionesFiltradas = canciones.filter(c => {
        if (!termino) return true; // Si no hay búsqueda, mostrar todas
        const busqueda = termino.toLowerCase();
        return (
            c.titulo.toLowerCase().includes(busqueda) ||
            c.autor.toLowerCase().includes(busqueda) ||
            c.numeroCancion?.toString().includes(busqueda)
        );
    });

    return (
        <>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>
                {termino ? `Resultados para "${termino}"` : 'Últimas Agregadas'}
            </h2>

            {cargando && <p style={{ textAlign: 'center', color: '#666' }}>Cargando repertorio...</p>}

            {!cargando && cancionesFiltradas.length === 0 && (
                <p style={{ textAlign: 'center' }}>No se encontraron canciones que coincidan.</p>
            )}

            <div className="lista">
                {/* IMPORTANTE: Mapeamos 'cancionesFiltradas', NO 'canciones' */}
                {cancionesFiltradas.map((c) => (
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
        </>
    )
}
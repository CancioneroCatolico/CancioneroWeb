// src/components/DetalleCancion.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Cancion } from '../types';

export function DetalleCancion() {
    const { id } = useParams(); // Lee el ID de la URL (ej: /cancion/abc1234)
    const [cancion, setCancion] = useState<Cancion | null>(null);

    useEffect(() => {
        // Buscamos SOLO esta canción por ID en tu backend
        fetch(`${import.meta.env.VITE_API_URL}/${id}`)
            .then(res => res.json())
            .then(data => setCancion(data))
            .catch(err => console.error(err));
    }, [id]);

    if (!cancion) return <p>Cargando letra...</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#666' }}>⬅ Volver al listado</Link>

            <h1 style={{ color: '#007bff', marginBottom: '5px' }}>{cancion.titulo}</h1>
            <h3 style={{ marginTop: '0', color: '#555' }}>{cancion.autor}</h3>

            <div style={{ background: '#eee', padding: '10px', borderRadius: '8px', display: 'inline-block', marginBottom: '20px' }}>
                <strong>Tono:</strong> {cancion.tonoBase}
            </div>

            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1.1em', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                {/* Unimos el array de letra con saltos de línea */}
                {cancion.letra.join('\n')}
            </div>
        </div>
    );
}
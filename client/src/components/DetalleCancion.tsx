import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Cancion } from '../types';
import { LineaCancion } from './LineaCancion';
import { TranspositionControls } from './TranspositionControls';

export function DetalleCancion() {
    const { id } = useParams(); // Lee el ID de la URL (ej: /cancion/abc1234)
    const [cancion, setCancion] = useState<Cancion | null>(null);
    const [transposition, setTransposition] = useState<number>(0);

    useEffect(() => {
        // Buscamos SOLO esta canción por ID en tu backend
        fetch(`${import.meta.env.VITE_API_URL}/${id}`)
            .then(res => res.json())
            .then(data => {
                setCancion(data);
                setTransposition(0); // Reset al cargar nueva canción
            })
            .catch(err => console.error(err));
    }, [id]);

    if (!cancion) return <p>Cargando letra...</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Link to="/" className="text-secondary" style={{ textDecoration: 'none' }}>⬅ Volver al listado</Link>

            <h1 className="text-primary" style={{ marginBottom: '5px' }}>{cancion.titulo}</h1>
            <h3 className="text-secondary" style={{ marginTop: '0' }}>{cancion.autor}</h3>

            <div style={{
                position: 'sticky',
                top: '64px', // Adjusted for sticky header height
                zIndex: 40,
                backgroundColor: 'var(--nav-bg)',
                backdropFilter: 'blur(5px)',
                padding: '10px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
                flexWrap: 'wrap',
                borderRadius: '0 0 10px 10px'
            }}>
                <TranspositionControls
                    originalKey={cancion.tonoBase}
                    transposition={transposition}
                    onTranspositionChange={setTransposition}
                />
            </div>

            <div className="card" style={{ padding: '20px', borderRadius: '10px' }}>
                {cancion.letra.map((linea, i) => (
                    <LineaCancion key={i} line={linea} transposition={transposition} />
                ))}
            </div>
        </div>
    );
}
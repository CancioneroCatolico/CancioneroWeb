import { useState, useEffect } from 'react';
import type { Cancion } from '../types';

export function useCanciones() {
    const [canciones, setCanciones] = useState<Cancion[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!API_URL) {
            console.error("VITE_API_URL no está definido");
            setError("Error de configuración: API_URL no definida");
            setCargando(false);
            return;
        }

        fetch(API_URL)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error en la petición: ${res.statusText}`);
                }
                return res.json();
            })
            .then((data: Cancion[]) => {
                setCanciones(data);
                setCargando(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message || "Error al cargar canciones");
                setCargando(false);
            });
    }, [API_URL]);

    return { canciones, cargando, error };
}

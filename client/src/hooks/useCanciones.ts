import { useState, useEffect, useRef } from 'react';
import type { Cancion } from '../types';

// Caché singleton en módulo: persiste mientras la app esté montada
let _cache: Cancion[] | null = null;
let _cachePromise: Promise<Cancion[]> | null = null;

export function useCanciones() {
    const [canciones, setCanciones] = useState<Cancion[]>(_cache || []);
    const [cargando, setCargando] = useState<boolean>(_cache === null);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        mountedRef.current = true;

        // Si ya tenemos datos en caché, los usamos directamente
        if (_cache !== null) {
            setCanciones(_cache);
            setCargando(false);
            return;
        }

        if (!API_URL) {
            setError("Error de configuración: API_URL no definida");
            setCargando(false);
            return;
        }

        // Si ya hay una petición en curso, reutilizamos esa promesa
        if (!_cachePromise) {
            _cachePromise = fetch(API_URL)
                .then(res => {
                    if (!res.ok) throw new Error(`Error en la petición: ${res.statusText}`);
                    return res.json();
                })
                .then((data: Cancion[]) => {
                    _cache = data;
                    return data;
                })
                .catch(err => {
                    _cachePromise = null; // Permitir reintentar
                    throw err;
                });
        }

        _cachePromise
            .then(data => {
                if (mountedRef.current) {
                    setCanciones(data);
                    setCargando(false);
                }
            })
            .catch(err => {
                if (mountedRef.current) {
                    console.error(err);
                    setError(err.message || "Error al cargar canciones");
                    setCargando(false);
                }
            });

        return () => {
            mountedRef.current = false;
        };
    }, [API_URL]);

    return { canciones, cargando, error };
}

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Cancion } from '../types';

// Caché singleton en módulo: persiste mientras la app esté montada
let _cache: Cancion[] | null = null;

export function useCanciones() {
    const [canciones, setCanciones] = useState<Cancion[]>(_cache || []);
    const [cargando, setCargando] = useState<boolean>(_cache === null);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchCanciones = useCallback(async (isBackground = false) => {
        if (!API_URL) {
            setError("Error de configuración: API_URL no definida");
            setCargando(false);
            return;
        }

        try {
            if (!isBackground) setCargando(true);
            
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`Error en la petición: ${res.statusText}`);
            
            const data: Cancion[] = await res.json();
            
            // Solo actualizamos si los datos son distintos (comparación básica de longitud o contenido)
            // Esto evita re-renders innecesarios
            if (JSON.stringify(data) !== JSON.stringify(_cache)) {
                _cache = data;
                if (mountedRef.current) {
                    setCanciones(data);
                }
            }
            
            if (mountedRef.current) {
                setError(null);
                setCargando(false);
            }
        } catch (err: any) {
            if (mountedRef.current) {
                console.error("Error cargando canciones:", err);
                if (!isBackground) {
                    setError(err.message || "Error al cargar canciones");
                    setCargando(false);
                }
            }
        }
    }, [API_URL]);

    useEffect(() => {
        mountedRef.current = true;

        // Carga inicial
        if (_cache === null) {
            fetchCanciones();
        } else {
            setCanciones(_cache);
            setCargando(false);
            // Validar en el fondo incluso si hay caché al montar
            fetchCanciones(true);
        }

        // --- LÓGICA DE AUTO-UPDATE AL VOLVER A LA APP ---
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // El usuario volvió a la app (desbloqueó celular o cambió pestaña)
                fetchCanciones(true);
            }
        };

        const handleFocus = () => {
            fetchCanciones(true);
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            mountedRef.current = false;
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchCanciones]);

    return { canciones, cargando, error, refrescar: () => fetchCanciones() };
}

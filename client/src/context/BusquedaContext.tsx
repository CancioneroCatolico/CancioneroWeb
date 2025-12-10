import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

// 1. EL CONTRATO (Interface)
// Definimos qué datos viajarán por el "Wi-Fi"
interface BusquedaContextType {
    termino: string;             // El texto que escribe el usuario
    setTermino: (t: string) => void; // La función para cambiar ese texto
}

// 2. CREAR EL CONTEXTO
// Al principio es undefined hasta que arranca la app
const BusquedaContext = createContext<BusquedaContextType | undefined>(undefined);

// 3. EL PROVEEDOR (El Router Wi-Fi)
// Este componente envolverá a toda tu App
export function BusquedaProvider({ children }: { children: ReactNode }) {
    const [termino, setTermino] = useState<string>('');

    return (
        <BusquedaContext.Provider value={{ termino, setTermino }}>
            {children}
        </BusquedaContext.Provider>
    );
}

// 4. EL HOOK (Para conectar los componentes fácilmente)
// En lugar de usar useContext(BusquedaContext) en cada archivo, usamos este hook
export function useBusqueda() {
    const context = useContext(BusquedaContext);
    if (!context) {
        throw new Error('useBusqueda debe usarse dentro de un BusquedaProvider');
    }
    return context;
}
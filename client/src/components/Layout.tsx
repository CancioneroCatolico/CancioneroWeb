import { Outlet, Link } from 'react-router-dom';
import { useBusqueda } from '../context/BusquedaContext'; // Importar hook

export function Layout() {
    // Conectamos con el Wi-Fi para obtener la función de escribir
    const { setTermino } = useBusqueda();

    return (
        <div>
            <nav style={{ /* ... tus estilos anteriores ... */ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#333', color: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>

                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5em', fontWeight: 'bold' }}>
                    🎵 Cancionero
                </Link>

                {/* BUSCADOR CONECTADO */}
                <div style={{ flex: 1, margin: '0 20px', maxWidth: '500px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar título, autor..."
                        // AQUÍ OCURRE LA MAGIA:
                        onChange={(e) => setTermino(e.target.value)}
                        style={{ width: '100%', padding: '8px 15px', borderRadius: '20px', border: 'none', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <Link to="/" style={{ color: '#ddd', textDecoration: 'none' }}>Inicio</Link>
                    <span style={{ color: '#777', cursor: 'not-allowed' }}>Categorías</span>
                </div>
            </nav>

            <main style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
                <Outlet />
            </main>
        </div>
    );
}
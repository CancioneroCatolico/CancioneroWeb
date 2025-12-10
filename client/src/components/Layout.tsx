import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useBusqueda } from '../context/BusquedaContext'; // Importar hook

export function Layout() {
    const navigate = useNavigate();
    // Conectamos con el Wi-Fi para obtener la función de escribir
    const { termino, setTermino } = useBusqueda();

    return (
        <div>
            <nav style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#333', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>

                    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5em', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        🎵 Cancionero
                    </Link>

                    {/* BUSCADOR CONECTADO - Agrandado */}
                    <form
                        style={{ flex: 1, margin: '0 40px', maxWidth: '800px' }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!termino.trim()) return;
                            navigate(`/buscar?q=${termino}`);
                        }}
                    >
                        <input
                            type="text"
                            placeholder="🔍 Buscar título, autor..."
                            value={termino}
                            onChange={(e) => setTermino(e.target.value)}
                            style={{ width: '100%', padding: '12px 20px', borderRadius: '30px', border: 'none', outline: 'none', fontSize: '1.1em' }}
                        />
                    </form>

                    <div style={{ display: 'flex', gap: '20px', whiteSpace: 'nowrap' }}>
                        <Link to="/" style={{ color: '#ddd', textDecoration: 'none', fontSize: '1.1em' }}>Inicio</Link>
                        <span style={{ color: '#777', cursor: 'not-allowed', fontSize: '1.1em' }}>Categorías</span>
                    </div>
                </div>
            </nav>

            <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                <Outlet />
            </main>
        </div>
    );
}
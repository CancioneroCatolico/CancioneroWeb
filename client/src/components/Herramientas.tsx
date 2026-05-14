import { Link } from 'react-router-dom';

export function Herramientas() {
    return (
        <div>
            <h1 className="text-dynamic-title" style={{ marginBottom: '24px' }}>Herramientas</h1>

            <div className="tools-grid">
                <Link to="/herramientas/biblioteca" className="tool-card card">
                    <span className="tool-card-icon" style={{ fontSize: '2rem' }}>
                        <img src="/icons/biblioteca.png" alt="Biblioteca de Acordes" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    </span>
                    <h3 className="tool-card-title">Biblioteca de Acordes</h3>
                    <p className="tool-card-desc">
                        Explorador de posiciones, cejillas y variaciones.
                    </p>
                </Link>

                {/* Placeholder para futuras herramientas */}
                <div className="tool-card card" style={{ opacity: 0.4, cursor: 'default' }}>
                    <span className="tool-card-icon">✨</span>
                    <h3 className="tool-card-title">Próximamente</h3>
                    <p className="tool-card-desc">
                        Más herramientas en camino...
                    </p>
                </div>
            </div>
        </div>
    );
}

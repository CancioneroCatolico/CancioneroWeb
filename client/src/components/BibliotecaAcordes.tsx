import { Link } from 'react-router-dom';

export function BibliotecaAcordes() {
    return (
        <div>
            {/* Header */}
            <div>
                <Link to="/herramientas" replace className="btn-back-link" style={{ marginBottom: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Herramientas
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    <h1 className="text-dynamic-title" style={{ margin: 0 }}>Biblioteca de Acordes</h1>
                </div>
            </div>

            <div className="tools-grid">
                <Link to="/herramientas/acordes" className="tool-card card">
                    <span className="tool-card-icon" style={{ fontSize: '2rem' }}>
                        <img src="/icons/guitarra.png" alt="Guitarra" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    </span>
                    <h3 className="tool-card-title">Guitarra</h3>
                </Link>

                {/* Placeholder para más instrumentos */}
                <div className="tool-card card" style={{ opacity: 0.5, cursor: 'default' }}>
                    <span className="tool-card-icon" style={{ fontSize: '2rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--secondary-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </span>
                    <h3 className="tool-card-title">Más instrumentos</h3>
                    <p className="tool-card-desc">
                        Próximamente ukelele, piano y más...
                    </p>
                </div>
            </div>
        </div>
    );
}

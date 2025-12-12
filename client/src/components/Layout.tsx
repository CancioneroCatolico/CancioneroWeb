import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useBusqueda } from '../context/BusquedaContext';
import { useTheme } from '../context/ThemeContext';

export function Layout() {
    const navigate = useNavigate();
    const { termino, setTermino } = useBusqueda();
    const { theme, toggleTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!termino.trim()) return;
        navigate(`/buscar?q=${termino}`);
        setMobileSearchOpen(false); // Cerrar modo búsqueda tras buscar
        setMenuOpen(false);
    };

    return (
        <div style={{ paddingBottom: '70px', minHeight: '100vh' }}> {/* Padding extra para la barra inferior */}
            {/* NAVBAR SUPERIOR */}
            <nav className="app-navbar-container">
                <div className="app-navbar">

                    {/* MODO BÚSQUEDA MÓVIL ACTIVADO */}
                    {mobileSearchOpen ? (
                        <div className="mobile-search-bar animate-fade-in">
                            <button
                                className="btn-icon-small"
                                onClick={() => setMobileSearchOpen(false)}
                            >
                                ←
                            </button>
                            <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    className="input-search"
                                    placeholder="¿Qué quieres tocar hoy?"
                                    value={termino}
                                    onChange={(e) => setTermino(e.target.value)}
                                    autoFocus
                                />
                            </form>
                        </div>
                    ) : (
                        /* CABECERA NORMAL */
                        <>
                            {/* LOGO */}
                            <Link to="/" className="logo-container" onClick={() => setMenuOpen(false)}>
                                <div className="logo-text-group">
                                    <span className="logo-main">Cancionero</span>
                                    <span className="logo-sub">San Francisco</span>
                                </div>
                            </Link>

                            {/* BUSCADOR DESKTOP (Oculto en móvil por CSS) */}
                            <form className="nav-search-container desktop-only-search" onSubmit={handleSearchSubmit}>
                                <input
                                    type="text"
                                    className="input-search"
                                    placeholder="Buscar..."
                                    value={termino}
                                    onChange={(e) => setTermino(e.target.value)}
                                />
                            </form>

                            {/* LINKS DESKTOP */}
                            <div className="desktop-nav-links">
                                <Link to="/" className="nav-link">Inicio</Link>
                            </div>
                        </>
                    )}
                </div>
            </nav>

            {/* CONTENIDO PRINCIPAL */}
            <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <Outlet />
            </main>

            {/* MENU MÓVIL OVERLAY */}
            {menuOpen && (
                <div className="mobile-menu-overlay">
                    <button className="close-menu-area" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"></button>
                    <div className="mobile-menu-content">
                        <div className="mobile-menu-header">
                            <h2>Menú</h2>
                            <button className="close-menu-btn-inside" onClick={() => setMenuOpen(false)}>✕</button>
                        </div>
                        {/* Inicio removido */}
                        <div className="mobile-menu-item" onClick={toggleTheme}>
                            {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
                        </div>
                    </div>
                </div>
            )}

            {/* BARRA DE NAVEGACIÓN INFERIOR (Solo Móvil) */}
            <div className="bottom-nav">
                <Link to="/" className="bottom-nav-item" onClick={() => { setMenuOpen(false); setMobileSearchOpen(false); }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bottom-icon">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span className="bottom-label">Inicio</span>
                </Link>

                <button className={`bottom-nav-item ${mobileSearchOpen ? 'active' : ''}`} onClick={() => {
                    setMobileSearchOpen(true);
                    setMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bottom-icon">
                        <circle cx="11" cy="11" r="8" fill="rgba(66, 153, 225, 0.3)" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className="bottom-label">Buscar</span>
                </button>

                <button className={`bottom-nav-item ${menuOpen ? 'active' : ''}`} onClick={() => {
                    setMenuOpen(!menuOpen);
                    setMobileSearchOpen(false);
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bottom-icon">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                    <span className="bottom-label">Menú</span>
                </button>
            </div>

            {/* BOTÓN TEMA DESKTOP */}
            <button
                onClick={toggleTheme}
                className="btn-icon theme-toggle-desktop"
                title="Cambiar Tema"
            >
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
        </div>
    );
}
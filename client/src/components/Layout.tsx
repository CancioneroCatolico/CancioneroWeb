import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useBusqueda } from '../context/BusquedaContext';
import { useTheme } from '../context/ThemeContext';

export function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { termino, setTermino } = useBusqueda();
    const { theme, toggleTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [navHidden, setNavHidden] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Referencia para scroll top en móvil
    const topRef = useRef<HTMLDivElement>(null);

    // Sincronizar el contexto de búsqueda con la URL (incluyendo navegación con Atrás)
    useEffect(() => {
        const qFromUrl = searchParams.get('q') || '';
        if (qFromUrl !== termino) {
            setTermino(qFromUrl);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            // Si hay algún menú o modal abierto, evitamos que se oculte
            if (menuOpen || mobileSearchOpen) {
                return;
            }

            const currentScrollY = window.scrollY;
            
            // Ocultamos si scrollea para abajo y ya pasó los primeros 60px (la altura del header)
            if (currentScrollY > lastScrollY && currentScrollY > 60) {
                setNavHidden(true);
            } else if (currentScrollY < lastScrollY) {
                // Mostramos si scrollea para arriba
                setNavHidden(false);
            }
            
            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [menuOpen, mobileSearchOpen]);

    // Cerrar menú al hacer clic fuera (Desktop)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isOutsideDesktop = menuRef.current && !menuRef.current.contains(event.target as Node);
            const isOutsideMobile = mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node);
            
            // Si el clic es fuera de AMBOS menús (desktop y móvil), cerramos
            if (isOutsideDesktop && isOutsideMobile) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ya se filtra en vivo, así que solo cerramos menús si fuera necesario
        setMobileSearchOpen(false);
        setMenuOpen(false);
    };

    const handleSearchChange = (val: string) => {
        setTermino(val);

        const params = new URLSearchParams(searchParams);
        if (val.trim() !== '') {
            params.set('q', val);
            if (location.pathname !== '/') {
                navigate(`/?${params.toString()}`);
            } else {
                navigate(`/?${params.toString()}`, { replace: true });
            }
        } else {
            params.delete('q');
            if (location.pathname === '/') {
                navigate(`/?${params.toString()}`, { replace: true });
            }
        }
    };

    return (
        <div style={{ paddingBottom: '70px', minHeight: '100vh' }} ref={topRef}>
            {/* NAVBAR SUPERIOR (STICKY) */}
            <nav className={`app-navbar-container ${navHidden ? 'navbar-hidden' : ''}`}>
                <div className="app-navbar">

                    {/* MODO BÚSQUEDA MÓVIL ACTIVADO */}
                    {mobileSearchOpen ? (
                        <div className="mobile-search-bar animate-fade-in">
                            <form onSubmit={handleSearchSubmit} className="search-form-container">
                                <input
                                    type="text"
                                    className="input-search"
                                    placeholder="Buscar..."
                                    value={termino}
                                    onChange={(e) => handleSearchChange(e.target.value)}
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
                                    <span className="logo-sub">Católico</span>
                                </div>
                            </Link>

                            {/* BUSCADOR DESKTOP (Oculto en móvil) */}
                            <div className="desktop-only-search">
                                <form className="nav-search-container search-form-container" onSubmit={handleSearchSubmit}>
                                    <input
                                        type="text"
                                        className="input-search"
                                        placeholder="Buscar..."
                                        value={termino}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                    />
                                </form>

                            </div>

                             {/* MENU DESKTOP */}
                             <div className="desktop-nav-links" style={{ position: 'relative', alignItems: 'center' }} ref={menuRef}>
                                <div className="inline-menu-items">
                                    <Link to="/" className="nav-link priority-2">Inicio</Link>
                                    <Link to="/mis-listas" className="nav-link priority-1" onClick={() => { window.dispatchEvent(new CustomEvent('reset-mis-listas')); }}>Mis Listas</Link>
                                    <div className="nav-link priority-3" onClick={() => { toggleTheme(); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        {theme === 'light' ? '🌙 Oscuro' : '☀️ Claro'}
                                    </div>
                                </div>

                                <button className="btn-icon hamburger-btn responsive-hamburger" onClick={() => setMenuOpen(!menuOpen)} title="Menú">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </svg>
                                </button>

                                {/* Desktop Dropdown Menu */}
                                {menuOpen && (
                                    <div className="desktop-dropdown-menu desktop-only-flex hamburger-dropdown">
                                        <Link to="/" className="desktop-dropdown-item dropdown-priority-2" onClick={() => setMenuOpen(false)}>Inicio</Link>
                                        {/* Mis Listas no cae al dropdown en desktop porque siempre entra. En móvil se usa otro menú. */}
                                        <div className="desktop-dropdown-item dropdown-priority-3" onClick={() => { toggleTheme(); }} style={{ cursor: 'pointer' }}>
                                            {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
                                        </div>
                                    </div>
                                )}
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
                <div className="mobile-menu-overlay mobile-only-flex">
                    <button className="close-menu-area" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"></button>
                    <div className="mobile-menu-content" ref={mobileMenuRef}>
                        <div className="mobile-menu-header">
                            <h2>Menú</h2>
                            <button className="close-menu-btn-inside" onClick={() => setMenuOpen(false)}>✕</button>
                        </div>
                        <Link to="/" className="mobile-menu-item" onClick={() => setMenuOpen(false)}>
                            Inicio
                        </Link>
                        <Link to="/mis-listas" className="mobile-menu-item" onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('reset-mis-listas')); }}>
                            Mis Listas
                        </Link>
                        <div className="mobile-menu-item" onClick={() => { toggleTheme(); }}>
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

                <Link to="/mis-listas" className="bottom-nav-item" onClick={() => { setMenuOpen(false); setMobileSearchOpen(false); window.dispatchEvent(new CustomEvent('reset-mis-listas')); }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bottom-icon">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                    <span className="bottom-label">Mis Listas</span>
                </Link>

                <button className={`bottom-nav-item ${mobileSearchOpen ? 'active' : ''}`} onClick={() => {
                    if (mobileSearchOpen) {
                        setMobileSearchOpen(false);
                    } else {
                        setMobileSearchOpen(true);
                        setMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
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
        </div>
    );
}
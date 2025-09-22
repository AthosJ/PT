// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';    // importación correcta para Vite/Rollup

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1) Si guardaste el objeto completo del usuario, úsalo primero
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
        return;
      } catch {
        localStorage.removeItem('user');
      }
    }

    // 2) Si no, decodifica el token y extrae nombre + rol
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const nombre = decoded.nombre ?? decoded.user?.nombre ?? '';
        const role   = decoded.role   ?? decoded.user?.role   ?? '';
        const usr    = { nombre, role };
        setUser(usr);
        localStorage.setItem('user', JSON.stringify(usr));
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Cálculo protegido de iniciales
  const initials = user?.nombre
    ?.split(' ')
    .map(p => p.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) ?? '';

  return (
    <header className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-md">
      <nav className="container mx-auto flex justify-between items-center py-4">
        <Link to="/" className="flex items-center text-2xl font-bold hover:opacity-90">
          <span className="mr-2 text-3xl">🃏</span>
          <span>MyL DeckBuilder</span>
        </Link>

        <ul className="hidden md:flex gap-6 font-medium">
          <li>
            <Link
              to="/"
              className={`hover:text-[var(--accent)] ${location.pathname === '/' ? 'underline' : ''}`}
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard"
              className={`hover:text-[var(--accent)] ${location.pathname === '/dashboard' ? 'underline' : ''}`}
            >
              Mazos
            </Link>
          </li>
          <li>
            <Link
              to="/cartas"
              className={`hover:text-[var(--accent)] ${location.pathname === '/cartas' ? 'underline' : ''}`}
            >
              Cartas
            </Link>
          </li>
          {user?.role === 'admin' && (
            <li>
              <Link
                to="/admin"
                className={`hover:text-[var(--accent)] ${location.pathname === '/admin' ? 'underline' : ''}`}
              >
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/login" className="btn-outline">
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn">
                Registrarse
              </Link>
            </>
          ) : (
            <>
              <div
                className="user-avatar w-10 h-10 rounded-full bg-[var(--light)] text-[var(--primary)] font-bold flex items-center justify-center cursor-pointer"
                onClick={() => navigate('/profile')}
                title={user.nombre}
              >
                {initials}
              </div>
              <button onClick={handleLogout} className="btn btn-sm btn-danger">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

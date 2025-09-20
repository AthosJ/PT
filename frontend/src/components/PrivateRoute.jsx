import { Navigate, Outlet } from 'react-router-dom';

/**
 * Componente que:
 * - Comprueba existencia de token en localStorage.
 * - Si recibe `allowedRoles`, valida también el rol del usuario.
 * - Redirige a /login si no hay token.
 * - Redirige a /403 si rol insuficiente.
 * - Muestra el contenido anidado a través de <Outlet />.
 */
export default function PrivateRoute({ allowedRoles }) {
  const token = localStorage.getItem('token');
  if (!token) {
    // No autenticado → login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const role = localStorage.getItem('role');
    if (!allowedRoles.includes(role)) {
      // Autenticado pero rol no permitido → 403
      return <Navigate to="/403" replace />;
    }
  }

  // Autenticado (y con rol válido) → renderiza rutas hijas
  return <Outlet />;
}

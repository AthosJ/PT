import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Forbidden from './pages/Forbidden';
import Cartas from './pages/Cartas'; // ← Importación agregada

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas protegidas (usuarios y admins) */}
      <Route element={<PrivateRoute allowedRoles={['jugador', 'admin']} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor/:mazoId" element={<Editor />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cartas" element={<Cartas />} /> {/* ← Ruta agregada */}
        </Route>
      </Route>

      {/* Rutas solo para admin */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>

      {/* Página 403 */}
      <Route path="/403" element={<Forbidden />} />

      {/* Fallback 404 → redirige a inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

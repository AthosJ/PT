// frontend/src/App.jsx

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
import Cartas from './pages/Cartas';

function App() {
  return (
    <Routes>
      {/* 1) Páginas públicas SIN Layout: login y registro */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 2) Páginas públicas CON Layout (header + footer) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cartas" element={<Cartas />} />
      </Route>

      {/* 3) Rutas protegidas (jugador/admin) */}
      <Route element={<PrivateRoute allowedRoles={['jugador', 'admin']} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor/:mazoId" element={<Editor />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 4) Rutas solo admin */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>

      {/* 5) Forbidden */}
      <Route path="/403" element={<Forbidden />} />

      {/* 6) Fallback 404 → redirige a Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

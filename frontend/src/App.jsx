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
      {/* 1) Páginas públicas SIN layout (sin header/footer) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 2) Páginas que usan Layout (header + footer) */}
      <Route element={<Layout />}>

        {/* 2.1) Cartas: pública, pero con header/footer */}
        <Route path="/cartas" element={<Cartas />} />

        {/* 2.2) Rutas protegidas (roles jugador o admin) */}
        <Route element={<PrivateRoute allowedRoles={['jugador', 'admin']} />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor/:mazoId" element={<Editor />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 2.3) Rutas solo para admin */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* 2.4) Forbidden */}
        <Route path="/403" element={<Forbidden />} />
      </Route>

      {/* 3) Catch-all (404) → redirigir a Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setToken } from '../api';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones inline
    if (!nombre || !email || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        nombre,
        email,
        password
      });

      // Guardar token, rol y datos de usuario
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);

      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 409) {
        setError(err.response.data.error || 'El usuario ya existe');
      } else if (err.response?.status === 400) {
        setError(err.response.data.error || 'Datos inválidos');
      } else {
        setError('Error de servidor');
      }
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-20 space-y-4 p-6 bg-white shadow rounded"
    >
      <h2 className="text-2xl font-semibold">Registrarse</h2>

      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium mb-1">
          Nombre completo
        </label>
        <input
          id="nombre"
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium mb-1"
        >
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="btn w-full text-center"
      >
        Crear cuenta
      </button>
    </form>
  );
}

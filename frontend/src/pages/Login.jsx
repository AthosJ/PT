// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setToken } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Faltan credenciales');
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password });

      // Guardar token, rol y usuario
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);

      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError(err.response.data.error);
      } else {
        setError('Error de servidor');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-20 space-y-4 p-6 bg-white shadow rounded"
    >
      <h2 className="text-2xl font-semibold">Iniciar sesión</h2>

      {error && (
        <p className="text-red-600 text-sm">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
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

      <button
        type="submit"
        className="btn w-full text-center"
      >
        Iniciar sesión
      </button>
    </form>
  );
}

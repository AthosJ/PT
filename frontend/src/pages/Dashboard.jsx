// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [mazos, setMazos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/mazos').then(res => setMazos(res.data));
  }, []);

  const crearMazo = async () => {
    if (!nombre || !descripcion) return;
    const res = await api.post('/mazos', { nombre, descripcion });
    navigate(`/editor/${res.data.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6">
      <h2 className="text-2xl">Mis Mazos</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          className="border p-2"
          placeholder="Nombre del nuevo mazo"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Descripción del nuevo mazo"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </div>

      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={crearMazo}
        disabled={!nombre || !descripcion}
      >
        Crear
      </button>

      <ul className="space-y-2">
        {mazos.map(m => (
          <li
            key={m.id}
            className="flex justify-between items-center bg-white p-4 shadow rounded"
          >
            <div>
              <p className="font-semibold">{m.nombre}</p>
              <p className="text-sm text-gray-600">{m.descripcion}</p>
            </div>
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => navigate(`/editor/${m.id}`)}
            >
              Editar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

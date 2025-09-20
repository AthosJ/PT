import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [mazos, setMazos] = useState([]);
  const [nombre, setNombre] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/mazos').then(res => setMazos(res.data));
  }, []);

  const crearMazo = async () => {
    if (!nombre) return;
    const res = await api.post('/mazos', { nombre });
    navigate(`/editor/${res.data.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6">
      <h2 className="text-2xl">Mis Mazos</h2>
      <div className="flex space-x-2">
        <input
          className="flex-1 border p-2"
          placeholder="Nombre del nuevo mazo"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
        <button className="bg-green-600 text-white px-4" onClick={crearMazo}>
          Crear
        </button>
      </div>
      <ul className="space-y-2">
        {mazos.map(m => (
          <li key={m.id} className="flex justify-between items-center bg-white p-4 shadow rounded">
            <span>{m.nombre}</span>
            <button
              className="bg-blue-600 text-white px-3"
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
import { useEffect, useState } from 'react';
import api from '../api';

export default function AdminPanel() {
  const [cartas, setCartas] = useState([]);
  const [form, setForm] = useState({
    nombre:'', tipo:'Aliado', fuerza:0, coste:0, raza:'', rareza:'', edicion:'', slug:''
  });

  useEffect(() => {
    api.get('/cartas').then(res => setCartas(res.data));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const crear = async () => {
    await api.post('/cartas', form);
    const res = await api.get('/cartas');
    setCartas(res.data);
  };

  const eliminar = async id => {
    await api.delete(`/cartas/${id}`);
    setCartas(c => c.filter(x => x.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      <h2 className="text-2xl">Panel de Administración</h2>
      <div className="grid grid-cols-2 gap-4 bg-white p-4 shadow rounded">
        {['nombre','tipo','fuerza','coste','raza','rareza','edicion','slug'].map(key => (
          <input
            key={key}
            name={key}
            placeholder={key}
            value={form[key]}
            onChange={handleChange}
            className="border p-2"
          />
        ))}
        <button onClick={crear} className="bg-green-600 text-white">Crear Carta</button>
      </div>
      <ul className="space-y-2">
        {cartas.map(c => (
          <li key={c.id} className="flex justify-between bg-white p-3 shadow rounded">
            <span>{c.nombre} — {c.tipo}</span>
            <button
              className="bg-red-600 text-white px-2"
              onClick={() => eliminar(c.id)}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
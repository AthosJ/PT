import { useEffect, useState } from 'react';
import api from '../api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [mazos, setMazos] = useState([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u);
    api.get('/mazos').then(res => setMazos(res.data));
  }, []);

  if (!user) return null;
  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-4">
      <h2 className="text-2xl">Mi Perfil</h2>
      <p><strong>Nombre:</strong> {user.nombre}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <h3 className="text-xl mt-4">Mazos Creados</h3>
      <ul className="space-y-2">
        {mazos.map(m => (
          <li key={m.id} className="bg-white p-3 shadow rounded">
            {m.nombre} (Creado: {m.fecha_creacion})
          </li>
        ))}
      </ul>
    </div>
  );
}
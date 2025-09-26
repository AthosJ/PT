// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [mazos, setMazos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1) Carga los mazos del usuario al montar
  useEffect(() => {
    api.get('/mazos')
      .then(res => setMazos(res.data))
      .catch(err => {
        console.error('Error cargando mazos:', err);
        setError('No se pudieron cargar los mazos');
      })
      .finally(() => setLoading(false));
  }, []);

  // 2) Crear nuevo mazo antes de redirigir
  const handleCreate = async () => {
    try {
      // Ajusta el payload si tu endpoint requiere nombre/descr
      const { data } = await api.post('/mazos', {});
      navigate(`/editor/${data.id}`);
    } catch (err) {
      console.error('Error creando mazo:', err);
      setError('No se pudo crear el mazo. Intenta de nuevo.');
    }
  };

  // 3) Navegar al editor de un mazo existente
  const handleEdit = (id) => {
    navigate(`/editor/${id}`);
  };

  // 4) Eliminar mazo tras confirmación
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este mazo?')) {
      return;
    }
    try {
      await api.delete(`/mazos/${id}`);
      setMazos(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error eliminando mazo:', err);
      alert('No se pudo eliminar el mazo. Intenta de nuevo.');
    }
  };

  if (loading) {
    return <p className="text-center mt-8">Cargando mazos…</p>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Mis Mazos</h1>
        <button className="btn" onClick={handleCreate}>
          Crear Nuevo Mazo
        </button>
      </div>

      {error && (
        <p className="text-center mb-4 text-red-600">{error}</p>
      )}

      {mazos.length === 0 ? (
        <p className="text-gray-600">Aún no tienes mazos. ¡Crea uno para comenzar!</p>
      ) : (
        <ul className="space-y-4">
          {mazos.map(mazo => (
            <li
              key={mazo.id}
              className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              <div>
                <h2 className="text-xl font-semibold">{mazo.nombre}</h2>
                <p className="text-gray-500">{mazo.descripcion}</p>
                <p className="text-sm text-gray-400">
                  Creado: {new Date(mazo.fecha_creacion).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-sm btn"
                  onClick={() => handleEdit(mazo.id)}
                >
                  Editar
                </button>
                <button
                  className="btn-sm btn-danger"
                  onClick={() => handleDelete(mazo.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

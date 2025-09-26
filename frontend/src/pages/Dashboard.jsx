// frontend/src/pages/Dashboard.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [mazos, setMazos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Campos para nuevo mazo
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    api.get('/mazos')
      .then(res => setMazos(res.data))
      .catch(err => {
        console.error('Error cargando mazos:', err);
        setError('No se pudieron cargar los mazos');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      setError('El nombre del mazo es obligatorio');
      return;
    }
    try {
      const payload = {
        nombre: newName,
        descripcion: newDesc,
        fecha_creacion: new Date().toISOString().split('T')[0]
      };
      const { data } = await api.post('/mazos', payload);
      navigate(`/editor/${data.id}`);
    } catch (err) {
      console.error('Error creando mazo:', err);
      const msg = err.response?.data?.error || 'No se pudo crear el mazo. Intenta de nuevo.';
      setError(msg);
    }
  };

  const handleEdit = (id) => {
    navigate(`/editor/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este mazo y todo su contenido?')) return;

    try {
      // 1) Borra todas las cartas del mazo para evitar FK constraint
      await api.delete(`/mazos/${id}/cartas`);
    } catch (cardsErr) {
      console.warn('No se pudieron eliminar las cartas del mazo:', cardsErr);
      // seguimos, porque puede que no hubiera cartas
    }

    try {
      // 2) Borra el mazo
      await api.delete(`/mazos/${id}`);
      // 3) Actualiza estado local
      setMazos(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error eliminando mazo:', err);
      const msg = err.response?.data?.error || 'No se pudo eliminar el mazo. Intenta de nuevo.';
      alert(msg);
    }
  };

  if (loading) {
    return <p className="text-center mt-8">Cargando mazos…</p>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header y form creación */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary">Mis Mazos</h1>

        <div className="w-full md:w-auto p-4 border rounded bg-gray-50">
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Nombre del mazo *"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1 border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              className="btn min-w-[120px]"
              onClick={handleCreate}
            >
              Crear
            </button>
          </div>
        </div>
      </div>

      {/* Lista de mazos */}
      {mazos.length === 0
        ? <p className="text-gray-600">Aún no tienes mazos. ¡Crea uno para comenzar!</p>
        : (
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

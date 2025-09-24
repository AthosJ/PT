import { useEffect, useState } from 'react';
import api from '../api';

export default function CardList({ onAdd, search = '' }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('CardList: fetching /cartas');
    setLoading(true);

    // Pedimos sin cache para evitar 304 sin body durante las pruebas
    api.get('/cartas', { headers: { 'Cache-Control': 'no-cache' } })
      .then(res => {
        console.log('CardList: GET /cartas res.status', res.status, 'res.data', res.data);
        setCards(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error('CardList: GET /cartas error', err);
        setCards([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Protección: card.nombre y search pueden ser undefined
  const q = (search || '').toString().toLowerCase();

  const filtered = cards.filter(c =>
    ((c && c.nombre) || '').toString().toLowerCase().includes(q)
  );

  if (loading) {
    return <p className="text-center text-gray-600">Cargando cartas...</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map(card => (
        <div
          key={card.id}
          className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition"
        >
          <h4 className="text-lg font-semibold text-primary mb-1">{card.nombre}</h4>
          <p className="text-sm text-gray-600">
            Tipo: <span className="font-medium">{card.tipo}</span><br />
            Rareza: <span className="font-medium">{card.rareza}</span><br />
            Coste: <span className="font-medium">{card.coste}</span>
          </p>
          <button
            onClick={() => onAdd(card)}
            className="btn-sm btn mt-3 w-full"
          >
            Agregar al Mazo
          </button>
        </div>
      ))}

      {filtered.length === 0 && !loading && (
        <p className="col-span-full text-center text-gray-500 mt-4">
          No se encontraron cartas con ese nombre.
        </p>
      )}
    </div>
  );
}

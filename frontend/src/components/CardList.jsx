// frontend/src/components/CardList.jsx

import { useEffect, useState } from 'react';
import api from '../api';

export default function CardList({ onAdd, search = '', filtros = {} }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    api.get('/cartas')
      .then(res => setCards(res.data))
      .catch(console.error);
  }, []);

  const term = search.toLowerCase();

  const filtered = cards
    // búsqueda por nombre
    .filter(c => c.nombre.toLowerCase().includes(term))
    // filtro por tipo
    .filter(c => !filtros.tipo || c.tipo === filtros.tipo)
    // filtro por coste
    .filter(c => {
      if (!filtros.coste) return true;
      if (filtros.coste === 'Sin coste') return c.coste === 0;
      if (filtros.coste === '5+') return c.coste >= 5;
      return c.coste === Number(filtros.coste);
    })
    // filtro por raza
    .filter(c => !filtros.raza || c.raza === filtros.raza);

  return (
    <ul className="space-y-2 overflow-y-auto max-h-[600px]">
      {filtered.map(card => (
        <li
          key={card.id}
          className="flex justify-between items-center p-2 border rounded hover:bg-gray-50"
        >
          <div>
            <h5 className="font-semibold">{card.nombre}</h5>
            <p className="text-sm text-gray-600">
              {card.tipo} – {card.raza} – Coste:{' '}
              {card.tipo === 'Oro' ? 'Sin coste' : card.coste}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => onAdd(card)}
          >
            Agregar al Mazo
          </button>
        </li>
      ))}
    </ul>
  );
}

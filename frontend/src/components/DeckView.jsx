//frontend/src/components/DeckView.jsx
import React from 'react';

export default function DeckView({ deck, onRemove }) {
  const totalCartas = deck.length;
  const costePromedio = deck.length
    ? (deck.reduce((sum, c) => sum + c.coste, 0) / deck.length).toFixed(2)
    : 0;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-primary">Vista del Mazo</h2>

      <div className="mb-4 text-sm text-gray-700">
        <p>
          Total de cartas: <span className="font-medium">{totalCartas}</span>
        </p>
        <p>
          Coste promedio: <span className="font-medium">{costePromedio}</span>
        </p>
      </div>

      {deck.length === 0 ? (
        <p className="text-gray-500">No hay cartas en el mazo aún.</p>
      ) : (
        <ul className="space-y-3">
          {deck.map((card) => (
            <li
              key={card.id}
              className="flex justify-between items-center border border-gray-200 rounded px-4 py-2 hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-semibold text-primary">{card.nombre}</p>
                <p className="text-sm text-gray-600">
                  Tipo: {card.tipo} | Rareza: {card.rareza} | Coste: {card.coste}
                </p>
              </div>
              {/* Aquí llamamos a onRemove para notificar al padre */}
              <button
                onClick={() => onRemove(card.id)}
                className="btn-danger btn-sm"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

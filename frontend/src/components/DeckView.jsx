// frontend/src/components/DeckView.jsx

import React from 'react';

export default function DeckView({ deck, onRemove }) {
  // Total de cartas en el mazo
  const totalCartas = deck.reduce((sum, c) => sum + c.cantidad, 0);

  // Agrupamos las cartas por tipo
  const gruposPorTipo = deck.reduce((acc, carta) => {
    const { tipo } = carta;
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(carta);
    return acc;
  }, {});

  return (
    <div className="p-4 bg-white border rounded shadow-sm">
      {/* Total general */}
      <div className="mb-6">
        <p className="text-xl font-semibold">Total de cartas: {totalCartas}</p>
      </div>

      {/* Secciones por tipo */}
      {Object.entries(gruposPorTipo).map(([tipo, cartas]) => {
        const totalEsteTipo = cartas.reduce((sum, c) => sum + c.cantidad, 0);
        return (
          <section key={tipo} className="mb-8">
            <h2 className="text-lg font-bold mb-2">
              {tipo} ({totalEsteTipo})
            </h2>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-1 text-left">Cant.</th>
                  <th className="py-1 text-left">Nombre</th>
                  <th className="py-1"></th>
                </tr>
              </thead>
              <tbody>
                {cartas.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="py-1">{c.cantidad}</td>
                    <td className="py-1">{c.nombre}</td>
                    <td className="py-1 text-right">
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => onRemove(c.id)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}

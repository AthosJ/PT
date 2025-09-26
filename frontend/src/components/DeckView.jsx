// frontend/src/components/DeckView.jsx
import React, { useState, useEffect } from 'react';
import { fetchCardPrices } from '../api';

export default function DeckView({ deck, onRemove }) {
  const [prices, setPrices] = useState({});
  const [error, setError]   = useState('');

  // 1) Al montar o cambiar deck → solicitamos precios
  useEffect(() => {
    const names = deck.map(c => c.nombre);
    if (names.length === 0) {
      setPrices({});
      return;
    }
    fetchCardPrices(names)
      .then(res => {
        const map = {};
        res.data.forEach(({ name, price }) => {
          map[name] = price;
        });
        setPrices(map);
      })
      .catch(err => {
        console.error('Error fetching prices:', err);
        setError('No se pudieron cargar los precios');
      });
  }, [deck]);

  // Totales
  const totalCartas = deck.reduce((sum, c) => sum + c.cantidad, 0);
  const totalCost   = deck.reduce((sum, c) => {
    const unit = prices[c.nombre] || 0;
    return sum + unit * c.cantidad;
  }, 0);

  // Agrupar por tipo
  const gruposPorTipo = deck.reduce((acc, carta) => {
    (acc[carta.tipo] ??= []).push(carta);
    return acc;
  }, {});

  return (
    <div className="p-4 bg-white border rounded shadow-sm">
      {/* Header de totales */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-xl font-semibold">Total de cartas: {totalCartas}</p>
        {error && <p className="text-red-600">{error}</p>}
      </div>

      {/* Secciones por tipo */}
      {Object.entries(gruposPorTipo).map(([tipo, cartas]) => {
        const subtotalCartas = cartas.reduce((s, c) => s + c.cantidad, 0);
        return (
          <section key={tipo} className="mb-6">
            <h2 className="text-lg font-bold mb-2">
              {tipo} ({subtotalCartas})
            </h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="px-2 py-1 text-left">Cant.</th>
                  <th className="px-2 py-1 text-left">Nombre</th>
                  <th className="px-2 py-1 text-right">Precio Unit.</th>
                  <th className="px-2 py-1 text-right">Precio Total</th>
                  <th className="px-2 py-1"></th>
                </tr>
              </thead>
              <tbody>
                {cartas.map(c => {
                  const unit = prices[c.nombre] || 0;
                  const lineTotal = unit * c.cantidad;
                  return (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-1">{c.cantidad}</td>
                      <td className="px-2 py-1">{c.nombre}</td>
                      <td className="px-2 py-1 text-right">
                        {unit.toLocaleString('es-CL', {
                          style: 'currency',
                          currency: 'CLP'
                        })}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {lineTotal.toLocaleString('es-CL', {
                          style: 'currency',
                          currency: 'CLP'
                        })}
                      </td>
                      <td className="px-2 py-1 text-right">
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => onRemove(c.id)}
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}

      {/* Total final del mazo */}
      <div className="text-right font-bold border-t pt-2">
        Total Mazo:{' '}
        {totalCost.toLocaleString('es-CL', {
          style: 'currency',
          currency: 'CLP'
        })}
      </div>
    </div>
  );
}

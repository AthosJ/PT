//frontend/src/pages/Cartas.jsx

import { useEffect, useMemo, useState } from 'react';
import api from '../api';

export default function Cartas() {
  const [cartas, setCartas] = useState([]);
  const [search, setSearch] = useState('');
  const [filtros, setFiltros] = useState({ tipo: '', coste: '', raza: '' });
  const [showFilters, setShowFilters] = useState(false);

  // 1) Carga todas las cartas en un solo fetch
  useEffect(() => {
    api.get('/cartas')
      .then(res => setCartas(res.data))
      .catch(console.error);
  }, []);

  // 2) Extrae razas únicas a partir del resultado del API
  const razas = useMemo(() => {
    return Array.from(new Set(cartas.map(c => c.raza))).sort();
  }, [cartas]);

  // 3) Aplica búsqueda y filtros
  const term = search.toLowerCase();
  const filtradas = useMemo(() => {
    return cartas
      .filter(c => c.nombre.toLowerCase().includes(term))
      .filter(c => !filtros.tipo || c.tipo === filtros.tipo)
      .filter(c => {
        if (!filtros.coste) return true;
        if (filtros.coste === 'Sin coste') return c.coste === 0;
        if (filtros.coste === '5+') return c.coste >= 5;
        return c.coste === Number(filtros.coste);
      })
      .filter(c => !filtros.raza || c.raza === filtros.raza);
  }, [cartas, term, filtros]);

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Listado de Cartas</h1>

      {/* Buscador + Toggle Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-1">
          <input
            type="text"
            placeholder="Buscar cartas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-l"
          />
          <button type="button" className="btn rounded-r">Buscar</button>
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => setShowFilters(f => !f)}
        >
          Filtros Avanzados
        </button>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Tipo */}
            <div>
              <label className="block mb-1">Tipo</label>
              <select
                className="w-full border px-2 py-1"
                value={filtros.tipo}
                onChange={e => setFiltros(f => ({ ...f, tipo: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="Aliado">Aliado</option>
                <option value="Arma">Arma</option>
                <option value="Totem">Tótem</option>
                <option value="Talisman">Talismán</option>
                <option value="Oro">Oro</option>
              </select>
            </div>

            {/* Coste */}
            <div>
              <label className="block mb-1">Coste</label>
              <select
                className="w-full border px-2 py-1"
                value={filtros.coste}
                onChange={e => setFiltros(f => ({ ...f, coste: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="Sin coste">Sin coste</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5+">5 o más</option>
              </select>
            </div>

            {/* Raza (de la API) */}
            <div>
              <label className="block mb-1">Raza</label>
              <select
                className="w-full border px-2 py-1"
                value={filtros.raza}
                onChange={e => setFiltros(f => ({ ...f, raza: e.target.value }))}
              >
                <option value="">Todas</option>
                {razas.map(rz => (
                  <option key={rz} value={rz}>{rz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de cartas */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="text-left py-2 px-3">Nombre</th>
              <th className="text-left py-2 px-3">Tipo</th>
              <th className="text-left py-2 px-3">Rareza</th>
              <th className="text-left py-2 px-3">Coste</th>
              <th className="text-left py-2 px-3">Fuerza</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{c.nombre}</td>
                <td className="py-2 px-3">{c.tipo}</td>
                <td className="py-2 px-3">{c.rareza}</td>
                <td className="py-2 px-3">
                  {c.tipo === 'Oro' ? 'Sin coste' : c.coste}
                </td>
                <td className="py-2 px-3">
                  {c.tipo === 'Aliado' ? c.fuerza : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

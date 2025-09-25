// frontend/src/pages/Editor.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CardList from '../components/CardList';
import DeckView from '../components/DeckView';
import Recommendations from '../components/Recommendations';
import api from '../api';

export default function Editor() {
  const { mazoId } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState([]);
  const [initialDeck, setInitialDeck] = useState([]);       // ← punto 5
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');
  const [showFilters, setShowFilters] = useState(false);     // ← punto 6
  const [filtros, setFiltros] = useState({
    tipo: '', coste: '', raza: ''
  });

  // 1) Carga inicial del mazo (y guardamos copia para “undo”)
  useEffect(() => {
    api.get(`/mazos/${mazoId}/cartas`)
      .then(res => {
        setDeck(res.data);
        setInitialDeck(res.data);
      })
      .catch(console.error);
  }, [mazoId]);

  // 2) Añadir carta (con validación de 3 ejemplares)
  const addCard = async (card) => {
    const existente = deck.find(c => c.id === card.id);
    if (existente && existente.cantidad >= 3) {
      setMsgError('No puedes agregar más de 3 ejemplares de esta carta.');
      return;
    }
    try {
      const { data } = await api.post(
        `/mazos/${mazoId}/cartas`,
        { carta_id: card.id, cantidad: 1 }
      );
      setDeck(prev => {
        const idx = prev.findIndex(c => c.id === card.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], cantidad: data.cantidad };
          return copy;
        }
        return [...prev, { ...card, cantidad: data.cantidad }];
      });
    } catch (err) {
      console.error(err);
      setMsgError('Error al agregar la carta. Intenta de nuevo.');
    }
  };

  // 3) Eliminar carta
  const removeCard = async (cardId) => {
    try {
      await api.delete(`/mazos/${mazoId}/cartas/${cardId}`);
      setDeck(prev => prev.filter(c => c.id !== cardId));
    } catch (err) {
      console.error(err);
      setMsgError('Error al eliminar la carta. Intenta de nuevo.');
    }
  };

  // 4) Guardar mazo con popup (sin redirect)
  const saveDeck = async () => {
    setSaving(true);
    try {
      await api.put(`/mazos/${mazoId}`, {
        cartas: deck.map(c => ({ id: c.id, cantidad: c.cantidad }))
      });
      setMsgSuccess('¡Mazo guardado con éxito!');
      setMsgError('');
      setInitialDeck(deck);  // actualizamos punto de “undo”
    } catch (err) {
      console.error(err);
      setMsgError('Error al guardar el mazo. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // 5) Deshacer: restaura estado al último guardado
  const undoChanges = () => {
    setDeck(initialDeck);
    setMsgError('');
    setMsgSuccess('');
  };

  return (
    <div className="container mx-auto px-6 py-8 relative">

      {/* POPUPS */}
      {msgSuccess && (
        <div className="fixed top-6 right-6 bg-green-100 border-green-400 text-green-700 px-4 py-2 rounded shadow flex items-center">
          <span className="flex-1">{msgSuccess}</span>
          <button
            type="button"
            onClick={() => setMsgSuccess('')}
            className="ml-4"
          >✕</button>
        </div>
      )}
      {msgError && (
        <div className="fixed top-6 right-6 bg-red-100 border-red-400 text-red-700 px-4 py-2 rounded shadow flex items-center">
          <span className="flex-1">{msgError}</span>
          <button
            type="button"
            onClick={() => setMsgError('')}
            className="ml-4"
          >✕</button>
        </div>
      )}

      {/* HEADER */}
      <div className="editor-header flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Editor de Mazos</h1>
        <div className="flex gap-4">
          <button
            type="button"
            className="btn"
            onClick={saveDeck}
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Guardar Mazo'}
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate('/dashboard')}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>

      {/* HERRAMIENTAS */}
      <div className="editor-tools flex flex-wrap gap-4 mb-6">
        <div className="search-bar flex flex-1">
          <input
            type="text"
            placeholder="Buscar cartas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-l"
          />
          <button type="button" className="btn rounded-r">Buscar</button>
        </div>

        {/* Punto 6: Toggle de filtros */}
        <button
          type="button"
          className="btn-outline"
          onClick={() => setShowFilters(f => !f)}
        >
          Filtros Avanzados
        </button>

        {/* Punto 5: Deshacer */}
        <button
          type="button"
          className="btn"
          onClick={undoChanges}
        >
          Deshacer
        </button>
      </div>

      {/* Panel de filtros colapsable */}
      {showFilters && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo */}
            <div>
              <label className="block mb-1">Tipo</label>
              <select
                className="w-full border px-2 py-1"
                value={filtros.tipo}
                onChange={e =>
                  setFiltros(f => ({ ...f, tipo: e.target.value }))
                }
              >
                <option value="">Todos</option>
                <option value="Aliado">Aliado</option>
                <option value="Arma">Arma</option>
                <option value="Tótem">Totem</option>
                <option value="Talismán">Talisman</option>
                <option value="Oro">Oro</option>
              </select>
            </div>

            {/* Coste */}
            <div>
              <label className="block mb-1">Coste</label>
              <select
                className="w-full border px-2 py-1"
                value={filtros.coste}
                onChange={e =>
                  setFiltros(f => ({ ...f, coste: e.target.value }))
                }
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

            {/* Raza */}
            <div>
              <label className="block mb-1">Raza</label>
              <select
                className="w-full border px-2 py-1"
                value={filtros.raza}
                onChange={e =>
                  setFiltros(f => ({ ...f, raza: e.target.value }))
                }
              >
                <option value="">Todas</option>
                <option value="Vestaelo">Vestaelo</option>
                <option value="Ánima">Ánima</option>
                <option value="Drakos">Drakos</option>
                {/* agrega aquí más razas según tu DB */}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO */}
      <div className="editor-container grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Cartas Disponibles</h2>
          <CardList
            onAdd={addCard}
            search={search}
            filtros={filtros}             // pasamos filtros al listado
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Vista del Mazo</h2>
          <DeckView deck={deck} onRemove={removeCard} />
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">
          Recomendaciones de compra
        </h3>
        <Recommendations mazoId={mazoId} />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CardList from '../components/CardList';
import DeckView from '../components/DeckView';
import Recommendations from '../components/Recommendations';
import api from '../api';
// Importamos el JSON de cartas para extraer razas
import cardsData from '../../../backend/cards.json';

export default function Editor() {
  const { mazoId } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState([]);
  const [initialDeck, setInitialDeck] = useState([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: '',
    coste: '',
    raza: ''
  });

  // Extraemos y ordenamos las razas únicas del JSON
  const razas = Array.from(new Set(cardsData.map(c => c.raza))).sort();

  // Carga inicial del mazo (y guardamos copia para “undo”)
  useEffect(() => {
    api.get(`/mazos/${mazoId}/cartas`)
      .then(res => {
        setDeck(res.data);
        setInitialDeck(res.data);
      })
      .catch(console.error);
  }, [mazoId]);

  // Añadir carta con validación de 3 ejemplares
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
          const updated = [...prev];
          updated[idx] = { ...updated[idx], cantidad: data.cantidad };
          return updated;
        }
        return [...prev, { ...card, cantidad: data.cantidad }];
      });
    } catch {
      setMsgError('Error al agregar la carta. Intenta de nuevo.');
    }
  };

  // Eliminar carta del mazo
  const removeCard = async (cardId) => {
    try {
      await api.delete(`/mazos/${mazoId}/cartas/${cardId}`);
      setDeck(prev => prev.filter(c => c.id !== cardId));
    } catch {
      setMsgError('Error al eliminar la carta. Intenta de nuevo.');
    }
  };

  // Guardar mazo con popup de éxito (sin redirect)
  const saveDeck = async () => {
    setSaving(true);
    try {
      await api.put(`/mazos/${mazoId}`, {
        cartas: deck.map(c => ({ id: c.id, cantidad: c.cantidad }))
      });
      setMsgSuccess('¡Mazo guardado con éxito!');
      setMsgError('');
      setInitialDeck(deck);
    } catch {
      setMsgError('Error al guardar el mazo. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Deshacer: restaura el mazo al último guardado
  const undoChanges = () => {
    setDeck(initialDeck);
    setMsgError('');
    setMsgSuccess('');
  };

  return (
    <div className="container mx-auto px-6 py-8 relative">

      {/* Popups de éxito y error */}
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

      {/* Header */}
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

      {/* Herramientas: búsqueda, filtros y deshacer */}
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

        <button
          type="button"
          className="btn-outline"
          onClick={() => setShowFilters(f => !f)}
        >
          Filtros Avanzados
        </button>

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

            {/* Raza dinámico */}
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
                {razas.map(rz => (
                  <option key={rz} value={rz}>
                    {rz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Contenido: lista de cartas y vista del mazo */}
      <div className="editor-container grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Cartas Disponibles</h2>
          <CardList
            onAdd={addCard}
            search={search}
            filtros={filtros}
          />
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Vista del Mazo</h2>
          <DeckView deck={deck} onRemove={removeCard} />
        </section>
      </div>

      {/* Recomendaciones */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">
          Recomendaciones de compra
        </h3>
        <Recommendations mazoId={mazoId} />
      </div>
    </div>
  );
}

//frontend/src/pages/Editor.jsx
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
  const [search, setSearch] = useState('');

  // Carga inicial del mazo
  useEffect(() => {
    api.get(`/mazos/${mazoId}/cartas`).then(res => setDeck(res.data));
  }, [mazoId]);

  // Agrega carta al mazo y actualiza estado
  const addCard = async (card) => {
    await api.post(`/mazos/${mazoId}/cartas`, { carta_id: card.id, cantidad: 1 });
    setDeck(prev => [...prev, card]);
  };

  // Elimina carta del mazo (API + filtrado local)
  const removeCard = async (cardId) => {
    await api.delete(`/mazos/${mazoId}/cartas/${cardId}`);
    setDeck(prev => prev.filter(c => c.id !== cardId));
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="editor-header flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Editor de Mazos</h1>
        <div className="flex gap-4">
          <button className="btn">Guardar Mazo</button>
          <button className="btn-outline" onClick={() => navigate('/dashboard')}>
            Volver al Dashboard
          </button>
        </div>
      </div>

      <div className="editor-tools flex flex-wrap gap-4 mb-6">
        <div className="search-bar flex flex-1">
          <input
            type="text"
            placeholder="Buscar cartas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l"
          />
          <button className="btn rounded-r">Buscar</button>
        </div>
        <button className="btn-outline">Filtros Avanzados</button>
        <button className="btn">Deshacer</button>
      </div>

      <div className="editor-container grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Cartas Disponibles</h2>
          <CardList onAdd={addCard} search={search} />
        </div>

        {/* Aquí pasamos onRemove para sincronizar eliminación */}
        <DeckView deck={deck} onRemove={removeCard} />
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Recomendaciones de compra</h3>
        <Recommendations mazoId={mazoId} />
      </div>
    </div>
  );
}

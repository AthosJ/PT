import { useState } from 'react';
import CardList from '../components/CardList';

export default function Cartas() {
  const [search, setSearch] = useState('');

  const handleAdd = (card) => {
    // Aquí podrías agregar lógica para añadir la carta al mazo
    console.log('Carta agregada:', card);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Cartas disponibles</h1>

      <input
        type="text"
        placeholder="Buscar carta por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input mb-6 w-full max-w-md"
      />

      <CardList onAdd={handleAdd} search={search} />
    </div>
  );
}

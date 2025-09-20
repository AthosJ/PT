import { render, screen, fireEvent } from '@testing-library/react';
import DeckView from '../components/DeckView';

const mockDeck = [
  { id: 1, nombre: 'Aliado Fuego', tipo: 'Aliado', rareza: 'Rara', coste: 2 },
  { id: 2, nombre: 'Tótem Agua', tipo: 'Tótem', rareza: 'Común', coste: 1 }
];

describe('DeckView.jsx', () => {
  it('muestra mensaje si el mazo está vacío', () => {
    render(<DeckView deck={[]} onRemove={() => {}} />);
    expect(screen.getByText(/no hay cartas/i)).toBeInTheDocument();
  });

  it('renderiza cartas del mazo', () => {
    render(<DeckView deck={mockDeck} onRemove={() => {}} />);
    expect(screen.getByText(/aliado fuego/i)).toBeInTheDocument();
    expect(screen.getByText(/tótem agua/i)).toBeInTheDocument();
  });

  it('llama a onRemove al hacer clic en quitar', () => {
    const onRemove = vi.fn();
    render(<DeckView deck={mockDeck} onRemove={onRemove} />);
    const btn = screen.getAllByText(/quitar/i)[0];
    fireEvent.click(btn);
    expect(onRemove).toHaveBeenCalledWith(mockDeck[0].id);
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import CardList from '../components/CardList';
import { vi } from 'vitest';
import api from '../api';

vi.mock('../api');

const mockCards = [
  { id: 1, nombre: 'Aliado Fuego', tipo: 'Aliado', rareza: 'Rara', coste: 2 },
  { id: 2, nombre: 'Tótem Agua', tipo: 'Tótem', rareza: 'Común', coste: 1 }
];

describe('CardList.jsx', () => {
  it('renderiza y filtra cartas', async () => {
    api.get.mockResolvedValue({ data: mockCards });

    render(<CardList onAdd={() => {}} search="fuego" />);

    expect(
      await screen.findByText(/aliado fuego/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/tótem agua/i)).not.toBeInTheDocument();
  });

  it('llama a onAdd al hacer clic en el primer botón Agregar', async () => {
    api.get.mockResolvedValue({ data: mockCards });
    const onAdd = vi.fn();

    render(<CardList onAdd={onAdd} search="" />);

    // obtenemos todos los botones "Agregar al Mazo" y clic en el primero
    const botones = await screen.findAllByRole('button', {
      name: /agregar al mazo/i
    });
    fireEvent.click(botones[0]);
    expect(onAdd).toHaveBeenCalledWith(mockCards[0]);
  });

  it('muestra mensaje si no hay coincidencias', async () => {
    api.get.mockResolvedValue({ data: mockCards });

    render(<CardList onAdd={() => {}} search="xyz" />);

    expect(
      await screen.findByText(/no se encontraron cartas/i)
    ).toBeInTheDocument();
  });
});


import { render, screen } from '@testing-library/react';
import Recommendations from '../components/Recommendations';
import { vi } from 'vitest';
import api from '../api';

vi.mock('../api');

const mockData = [
  {
    carta_nombre: 'Aliado Fuego',
    tienda_nombre: 'Tienda X',
    precio: 1500,
    stock: 3,
    url: 'https://tiendax.cl/aliado'
  }
];

describe('Recommendations.jsx', () => {
  it('muestra mensaje si no hay recomendaciones', async () => {
    api.get.mockResolvedValue({ data: [] });
    render(<Recommendations mazoId={1} />);
    expect(await screen.findByText(/no hay recomendaciones/i)).toBeInTheDocument();
  });

  it('renderiza tabla con recomendaciones', async () => {
    api.get.mockResolvedValue({ data: mockData });
    render(<Recommendations mazoId={1} />);
    expect(await screen.findByText(/aliado fuego/i)).toBeInTheDocument();
    expect(screen.getByText(/tienda x/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1500/)).toBeInTheDocument();
    expect(screen.getByText(/ver/i)).toHaveAttribute('href', mockData[0].url);
  });
});

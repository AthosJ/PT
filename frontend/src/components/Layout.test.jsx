import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

it('envuelve children y muestra footer', () => {
  render(
    <MemoryRouter>
      <Layout>
        <div data-testid="child">Hello Child</div>
      </Layout>
    </MemoryRouter>
  );

  expect(screen.getByTestId('child')).toBeInTheDocument();
  expect(screen.getByText(/© 2025 – Proyecto de Título/i)).toBeInTheDocument();
});

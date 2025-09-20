// src/pages/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import api from '../api';
import Login from './Login';

vi.mock('../api');

function renderWithRouter() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<div>✅ Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

it('muestra error si faltan credenciales', async () => {
  renderWithRouter();
  // 👇 click en el BOTÓN, no en el h2
  fireEvent.click(
    screen.getByRole('button', { name: /iniciar sesión/i })
  );
  expect(await screen.findByText(/faltan credenciales/i)).toBeInTheDocument();
});

it('redirige al dashboard en login exitoso', async () => {
  api.post.mockResolvedValue({
    data: { token: 'tok', user: { role: 'user' } }
  });

  renderWithRouter();
  fireEvent.change(
    screen.getByPlaceholderText(/correo electrónico/i),
    { target: { value: 'a@b.com' } }
  );
  fireEvent.change(
    screen.getByPlaceholderText(/contraseña/i),
    { target: { value: '123' } }
  );
  fireEvent.click(
    screen.getByRole('button', { name: /iniciar sesión/i })
  );

  await waitFor(() =>
    expect(screen.getByText(/✅ dashboard/i)).toBeInTheDocument()
  );
});

it('muestra mensaje de credenciales inválidas', async () => {
  api.post.mockRejectedValue({
    response: { status: 401, data: { error: 'Credenciales inválidas' } }
  });

  renderWithRouter();
  fireEvent.change(
    screen.getByPlaceholderText(/correo electrónico/i),
    { target: { value: 'foo@bar.com' } }
  );
  fireEvent.change(
    screen.getByPlaceholderText(/contraseña/i),
    { target: { value: 'wrong' } }
  );
  fireEvent.click(
    screen.getByRole('button', { name: /iniciar sesión/i })
  );
  expect(
    await screen.findByText(/credenciales inválidas/i)
  ).toBeInTheDocument();
});

// src/components/Navbar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// 1️⃣ Primero, mock explícito de jwt-decode como función
vi.mock('jwt-decode', () => ({
  __esModule: true,
  default: vi.fn()
}));
import jwtDecode from 'jwt-decode';

import Navbar from './Navbar';

beforeEach(() => {
  localStorage.clear();
  jwtDecode.mockReset();
});

function loginAs(payload) {
  // como Navbar lee el token literal, no hace falta serializar JSON
  localStorage.setItem('token', 'fake-token');
  jwtDecode.mockReturnValue(payload);
}

it('muestra Iniciar sesión y Registrarse si no hay token', () => {
  render(<Navbar />, { wrapper: MemoryRouter });

  expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
  expect(screen.getByText(/registrarse/i)).toBeInTheDocument();

  expect(screen.queryByText(/logout/i)).toBeNull();
  expect(screen.queryByText(/admin panel/i)).toBeNull();
});

it('muestra avatar y logout para usuario user', () => {
  loginAs({ nombre: 'Juan Pérez', role: 'user' });
  render(<Navbar />, { wrapper: MemoryRouter });

  // iniciales "JP"
  expect(screen.getByText(/^JP$/i)).toBeInTheDocument();
  expect(screen.getByText(/logout/i)).toBeInTheDocument();
  expect(screen.queryByText(/admin panel/i)).toBeNull();
});

it('muestra enlace Admin para rol admin', () => {
  loginAs({ nombre: 'Ana Gómez', role: 'admin' });
  render(<Navbar />, { wrapper: MemoryRouter });

  expect(screen.getByText(/admin panel/i)).toBeInTheDocument();
});

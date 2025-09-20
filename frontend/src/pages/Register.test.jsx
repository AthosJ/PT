// frontend/src/pages/Register.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './Register';
import { vi } from 'vitest';
import api from '../api';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../api');

describe('Register.jsx', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderWithRouter = () =>
    render(<Register />, { wrapper: BrowserRouter });

  it('muestra error si faltan campos', async () => {
    renderWithRouter();
    fireEvent.click(screen.getByText(/crear cuenta/i));

    expect(
      await screen.findByText(/todos los campos son obligatorios/i)
    ).toBeInTheDocument();
  });

  it('muestra error si las contraseñas no coinciden', async () => {
    renderWithRouter();
    fireEvent.change(screen.getByPlaceholderText('Nombre completo'), {
      target: { value: 'Juan' }
    });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'juan@mail.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: '123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), {
      target: { value: '456' }
    });
    fireEvent.click(screen.getByText(/crear cuenta/i));

    expect(
      await screen.findByText(/las contraseñas no coinciden/i)
    ).toBeInTheDocument();
  });

  it('registro exitoso redirige al dashboard', async () => {
    api.post.mockResolvedValue({
      data: { token: 'mock-token', user: { role: 'user' } }
    });

    renderWithRouter();
    fireEvent.change(screen.getByPlaceholderText('Nombre completo'), {
      target: { value: 'Juan' }
    });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'juan@mail.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: '123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), {
      target: { value: '123' }
    });

    fireEvent.click(screen.getByText(/crear cuenta/i));
    await waitFor(() =>
      expect(window.location.pathname).toBe('/dashboard')
    );
  });

  it('muestra error si el email ya existe', async () => {
    api.post.mockRejectedValue({
      response: { status: 409, data: { error: 'Ya existe' } }
    });

    renderWithRouter();
    fireEvent.change(screen.getByPlaceholderText('Nombre completo'), {
      target: { value: 'Juan' }
    });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), {
      target: { value: 'duplicado@mail.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
      target: { value: '123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), {
      target: { value: '123' }
    });
    fireEvent.click(screen.getByText(/crear cuenta/i));

    expect(
      await screen.findByText(/ya existe/i)
    ).toBeInTheDocument();
  });
});

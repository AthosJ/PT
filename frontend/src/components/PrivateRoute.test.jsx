import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

function setup({ path, token, role, allowedRoles }) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
  if (role) localStorage.setItem('role', role);
  else localStorage.removeItem('role');

  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PrivateRoute allowedRoles={allowedRoles} />}>
          <Route path="/secret" element={<div>🚀 Secret Content</div>} />
        </Route>
        <Route path="/login" element={<div>🛂 Login Page</div>} />
        <Route path="/403" element={<div>⛔ Forbidden Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

it('redirige a /login si no hay token', () => {
  setup({ path: '/secret', token: null, role: null, allowedRoles: ['user'] });
  expect(screen.getByText(/login page/i)).toBeInTheDocument();
});

it('redirige a /403 si rol no permitido', () => {
  setup({ path: '/secret', token: 'tok', role: 'guest', allowedRoles: ['user'] });
  expect(screen.getByText(/forbidden page/i)).toBeInTheDocument();
});

it('renderiza hijo si token y rol permitidos', () => {
  setup({ path: '/secret', token: 'tok', role: 'user', allowedRoles: ['user'] });
  expect(screen.getByText(/secret content/i)).toBeInTheDocument();
});

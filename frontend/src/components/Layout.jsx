// src/components/Layout.jsx
import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <Navbar />

      {/* Main content area */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--dark)] text-white text-center py-6 mt-12">
        <p>
          MyL DeckBuilder – Plataforma web de construcción de mazos del juego de
          cartas coleccionables Mitos y Leyendas
        </p>
        <p>© 2025 – Proyecto de Título</p>
      </footer>
    </div>
  );
}

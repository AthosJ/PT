import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-4xl font-bold">MyL DeckBuilder</h1>
      <p className="text-lg">Construye, analiza y compra cartas de Mitos y Leyendas</p>
      <div className="space-x-4">
        <Link to="/login" className="bg-blue-600 text-white">Ingresar</Link>
        <Link to="/register" className="bg-green-600 text-white">Registrarse</Link>
      </div>
    </div>
  );
}
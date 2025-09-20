import { useEffect, useState } from 'react';
import api from '../api';

export default function Recommendations({ mazoId }) {
  const [recomendaciones, setRecomendaciones] = useState([]);

  useEffect(() => {
    api.get(`/recomendaciones?mazo_id=${mazoId}`).then(res => setRecomendaciones(res.data));
  }, [mazoId]);

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
      {recomendaciones.length === 0 ? (
        <p className="text-gray-500">No hay recomendaciones disponibles para este mazo.</p>
      ) : (
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[var(--primary)] text-white">
              <th className="px-4 py-2">Carta</th>
              <th className="px-4 py-2">Tienda</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {recomendaciones.map((rec, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-primary">{rec.carta_nombre}</td>
                <td className="px-4 py-2">{rec.tienda_nombre}</td>
                <td className="px-4 py-2 text-green-600 font-semibold">${rec.precio}</td>
                <td className="px-4 py-2">{rec.stock}</td>
                <td className="px-4 py-2">
                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] underline hover:text-[var(--secondary)]"
                  >
                    Ver
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

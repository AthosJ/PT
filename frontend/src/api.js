// frontend/src/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const client = axios.create({ baseURL: API_URL });

// Para autenticar
export function setToken(token) {
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Nuevo: llama a POST /precios con un array de nombres
export function fetchCardPrices(cards) {
  return client.post('/precios', { cards });
}

export default client;

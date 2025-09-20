import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
const client = axios.create({ baseURL: API_URL });
export function setToken(token) {
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
export default client;
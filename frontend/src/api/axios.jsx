import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1', // au lieu de http://localhost:8000/api/v1
});

export default api;
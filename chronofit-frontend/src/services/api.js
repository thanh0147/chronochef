import axios from 'axios';

const api = axios.create({
  baseURL: 'https://chronochef-be.onrender.com', // URL của FastAPI Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
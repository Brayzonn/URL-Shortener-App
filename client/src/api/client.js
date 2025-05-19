// src/api/client.js
import axios from 'axios';

// Create a configured axios instance with credentials support
const baseURL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:4300";

const api = axios.create({
  baseURL,
  withCredentials: true, // This ensures cookies are sent with every request
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:4300";

const api = axios.create({
  baseURL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
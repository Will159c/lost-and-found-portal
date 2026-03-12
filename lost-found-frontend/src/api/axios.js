// src/api/axios.js
import axios from "axios";

let baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5050").trim();

if (/^:\d+$/.test(baseURL)) baseURL = `http://localhost${baseURL}`;
if (/^https?:\/\/:\d+/.test(baseURL)) baseURL = baseURL.replace("://:", "://localhost:");

const api = axios.create({
  baseURL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
export { api };


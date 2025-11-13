
import axios from "axios";

let baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();


if (/^:\d+$/.test(baseURL)) baseURL = `http://localhost${baseURL}`;
if (/^https?:\/\/:\d+/.test(baseURL)) baseURL = baseURL.replace("://:", "://localhost:");

console.log("[api] baseURL =", baseURL);  

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); 
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
export { api };

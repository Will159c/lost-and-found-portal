import axios from "./axios";

export function sendMessage({ to, text }) {
  return axios.post("/api/messages", { to, text });
}

export function getMessages(withUser) {
  return axios.get("/api/messages", { params: { with: withUser } });
}

export function getContacts() {
  return axios.get("/api/messages/contacts");
}

export function pingPresence() {
  return axios.post("/api/messages/presence/ping");
}
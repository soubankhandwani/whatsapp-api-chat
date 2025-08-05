import axios from 'axios';

const API = axios.create({
  baseURL: 'https://whatsapp-api-chat-fakw.onrender.com/api',
});

export const fetchUsers = () => API.get('/messages/users');
export const fetchMessages = (user) => API.get(`/messages/history/${user}`);
export const sendMessage = (to, message) =>
  API.post('/messages/send', { to, message });

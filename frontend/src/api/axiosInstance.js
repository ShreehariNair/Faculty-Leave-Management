import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log(BASE_URL);
const API = axios.create({ baseURL: `${BASE_URL}/api` });

API.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  if (user) {
    const parsed = JSON.parse(user);
    if (parsed?.token) config.headers.Authorization = `Bearer ${parsed.token}`;
  }
  return config;
});

/* Helper — build full URL for stored avatar paths */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith("http")) return avatarPath;
  return `${BASE_URL}${avatarPath}`;
};

export default API;

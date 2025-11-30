import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

// Choose a sensible default backend URL depending on platform.
// Android emulator: use 10.0.2.2 to reach host machine localhost.
const DEFAULT_BACKEND =
  Platform.OS === "android"
    ? "http://10.43.171.120:8000"
    : "http://localhost:8000";
export const BACKEND_URL = process.env.BACKEND_URL || DEFAULT_BACKEND;

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token && config && config.headers) {
      // Ensure Authorization header is set
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

export default api;

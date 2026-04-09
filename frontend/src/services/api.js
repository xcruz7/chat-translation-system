import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000
});

export const api = {
  getLanguages: async () => {
    const response = await apiClient.get("/languages");
    return response.data.languages;
  },
  translate: async (payload) => {
    const response = await apiClient.post("/translate", payload);
    return response.data;
  },
  llmTranslate: async (payload) => {
    const response = await apiClient.post("/llm-translate", payload);
    return response.data;
  },
  getHistory: async () => {
    const response = await apiClient.get("/history");
    return response.data.history;
  },
  toggleFavorite: async (id) => {
    const response = await apiClient.patch(`/history/${id}/favorite`);
    return response.data.entry;
  },
  clearHistory: async () => {
    await apiClient.delete("/history");
  },
  synthesizeSpeech: async ({ text, languageCode }) => {
    const response = await apiClient.post(
      "/speech",
      { text, languageCode },
      { responseType: "blob" }
    );

    return response.data;
  }
};

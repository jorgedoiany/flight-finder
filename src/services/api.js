import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://sky-scrapper.p.rapidapi.com/api/",
  headers: {
    "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
    "x-rapidapi-host":
      import.meta.env.VITE_RAPIDAPI_HOST || "sky-scrapper.p.rapidapi.com",
  },
});

export default api;

import type { ApiResponse } from "@/types";
import { FlightApiError } from "@/types";
import axios, { AxiosInstance, AxiosResponse } from "axios";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "https://sky-scrapper.p.rapidapi.com/api/",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
        "x-rapidapi-host":
          import.meta.env.VITE_RAPIDAPI_HOST || "sky-scrapper.p.rapidapi.com",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(
          `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        console.error("❌ API Request Error:", error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(
          `✅ API Response: ${response.status} ${response.config.url}`,
        );
        return response;
      },
      (error) => {
        const message =
          error.response?.data?.message || error.message || "An error occurred";
        const statusCode = error.response?.status;
        const errorCode = error.response?.data?.code;

        console.error("❌ API Response Error:", {
          message,
          statusCode,
          errorCode,
          url: error.config?.url,
        });

        throw new FlightApiError(message, statusCode, errorCode);
      },
    );
  }

  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  }

  public async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  public async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  public async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;

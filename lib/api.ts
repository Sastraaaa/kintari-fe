import { BASE_URL, API_ENDPOINTS } from "./config";
import type {
  Member,
  Document,
  Stats,
  ChatMessage,
  SearchResult,
} from "./types";

// Generic fetch helper
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Members API
export const membersAPI = {
  getAll: () => fetcher<Member[]>(`${BASE_URL}${API_ENDPOINTS.members}`),

  create: (data: FormData | object) =>
    fetcher<Member>(`${BASE_URL}${API_ENDPOINTS.uploadMembers}`, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers:
        data instanceof FormData ? {} : { "Content-Type": "application/json" },
    }),
};

// Documents API
export const documentsAPI = {
  getAll: () => fetcher<Document[]>(`${BASE_URL}${API_ENDPOINTS.documents}`),

  upload: (data: FormData) =>
    fetcher<Document>(`${BASE_URL}${API_ENDPOINTS.uploadDocuments}`, {
      method: "POST",
      body: data,
    }),
};

// Stats API
export const statsAPI = {
  getStats: () => fetcher<Stats>(`${BASE_URL}${API_ENDPOINTS.stats}`),
};

// Chat API
export const chatAPI = {
  sendMessage: (message: string) =>
    fetcher<ChatMessage>(`${BASE_URL}${API_ENDPOINTS.chat}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: message }),
    }),
};

// Search API
export const searchAPI = {
  search: (query: string) =>
    fetcher<SearchResult[]>(
      `${BASE_URL}${API_ENDPOINTS.search}?q=${encodeURIComponent(query)}`
    ),
};

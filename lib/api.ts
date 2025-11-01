import {
  BASE_URL,
  API_ENDPOINTS,
  API_TIMEOUT,
  USE_JSON_SERVER,
} from "./config";
import type {
  MembersResponse,
  DocumentsResponse,
  DocumentUploadResponse,
  Stats,
  ChatMessage,
  ChatRequest,
  SearchResult,
  SearchResponse,
  UploadResponse,
  Organization,
  APIResponse,
  MembersAnalytics,
  DocumentsAnalytics,
  AnalyticsOverview,
} from "./types";

// Generic fetch helper dengan timeout (15 detik sesuai rules)
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          errorData.error ||
          `API Error: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout - silakan coba lagi");
      }
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}

// ============= MEMBERS API =============
// Sesuai dengan /api/members routes di backend
export const membersAPI = {
  // GET /api/members - List semua anggota
  getAll: () => fetcher<MembersResponse>(`${BASE_URL}${API_ENDPOINTS.members}`),

  // POST /api/members/upload-csv - Upload CSV anggota
  uploadCSV: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return fetcher<UploadResponse>(
      `${BASE_URL}${API_ENDPOINTS.uploadMembersCSV}`,
      {
        method: "POST",
        body: formData,
      }
    );
  },
};

// ============= DOCUMENTS API =============
// Sesuai dengan /api/documents routes di backend (Universal Documents)
export const documentsAPI = {
  // GET /api/documents - List semua dokumen dari universal knowledge base
  getAll: (params?: {
    skip?: number;
    limit?: number;
    document_type?: string;
    category?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.document_type)
      queryParams.append("document_type", params.document_type);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);

    const url = `${BASE_URL}${API_ENDPOINTS.documents}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return fetcher<DocumentsResponse>(url);
  },

  // POST /api/documents/upload - Upload ANY type of PDF document
  upload: (
    file: File,
    options?: {
      category?: string;
      tags?: string; // Comma-separated tags
      generate_ai_summary?: boolean;
    }
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.category) formData.append("category", options.category);
    if (options?.tags) formData.append("tags", options.tags);
    if (options?.generate_ai_summary !== undefined)
      formData.append(
        "generate_ai_summary",
        options.generate_ai_summary.toString()
      );

    return fetcher<DocumentUploadResponse>(
      `${BASE_URL}${API_ENDPOINTS.uploadDocuments}`,
      {
        method: "POST",
        body: formData,
      }
    );
  },
};

// ============= ORGANIZATION API =============
// Sesuai dengan /api/organization routes di backend
export const organizationAPI = {
  // POST /api/organization/upload - Upload & ekstrak PDF HIPMI
  uploadPDF: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return fetcher<UploadResponse>(
      `${BASE_URL}${API_ENDPOINTS.organizationUpload}`,
      {
        method: "POST",
        body: formData,
      }
    );
  },

  // GET /api/organization/latest - Ambil data organisasi terbaru
  getLatest: () =>
    fetcher<APIResponse<Organization>>(
      `${BASE_URL}${API_ENDPOINTS.organizationLatest}`
    ),

  // GET /api/organization/all - Ambil semua data organisasi
  getAll: () =>
    fetcher<APIResponse<Organization[]>>(
      `${BASE_URL}${API_ENDPOINTS.organizationAll}`
    ),

  // GET /api/organization/data/{id} - Ambil data organisasi by ID
  getById: (id: number) =>
    fetcher<APIResponse<Organization>>(
      `${BASE_URL}${API_ENDPOINTS.organizationData(id)}`
    ),
};

// ============= CHAT API =============
// Sesuai dengan /api/chat routes di backend
export const chatAPI = {
  // POST /api/chat/query - Kirim pertanyaan ke AI
  sendMessage: (query: string, context?: string) => {
    const payload: ChatRequest = { query, context };

    return fetcher<ChatMessage>(`${BASE_URL}${API_ENDPOINTS.chatQuery}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  // GET /api/chat/context - Ambil konteks chatbot
  getContext: () =>
    fetcher<
      APIResponse<{ context: string; source: string; extracted_at?: string }>
    >(`${BASE_URL}${API_ENDPOINTS.chatContext}`),
};

// ============= STATS API =============
// Sesuai dengan /api/stats routes di backend
export const statsAPI = {
  // GET /api/stats/overview - Statistik overview
  getStats: async () => {
    const url = `${BASE_URL}${API_ENDPOINTS.statsOverview}`;

    // Untuk JSON Server, response langsung objek Stats
    // Untuk backend real, response dibungkus APIResponse<Stats>
    if (USE_JSON_SERVER) {
      const data = await fetcher<Stats>(url);
      // Wrap dengan APIResponse format untuk konsistensi
      return {
        status: "success",
        data,
        message: "Stats fetched successfully",
      } as APIResponse<Stats>;
    }

    // Backend real sudah return APIResponse<Stats>
    return fetcher<APIResponse<Stats>>(url);
  },

  // Alias untuk backward compatibility
  getOverview: async () => {
    return statsAPI.getStats();
  },
};

// ============= SEARCH API =============
export const searchAPI = {
  search: async (query: string) => {
    const response = await fetcher<SearchResponse>(
      `${BASE_URL}${API_ENDPOINTS.search}?q=${encodeURIComponent(query)}`
    );

    // Transform backend response to SearchResult[] format
    return response.documents.map((doc) => ({
      type: "document" as const,
      data: doc,
    }));
  },
};

// ============= ANALYTICS API =============
// AI-powered analytics untuk data HIPMI
export const analyticsAPI = {
  // GET /api/analytics/members - Analisis data anggota dengan AI (New Enhanced)
  getMembers: () =>
    fetcher<APIResponse<MembersAnalytics>>(`${BASE_URL}/api/analytics/members`),

  // Alias untuk backward compatibility
  analyzeMembersData: () =>
    fetcher<APIResponse<MembersAnalytics>>(`${BASE_URL}/api/analytics/members`),

  // GET /api/analytics/documents - Analisis data dokumen dengan AI
  analyzeDocumentsData: () =>
    fetcher<APIResponse<DocumentsAnalytics>>(
      `${BASE_URL}/api/analytics/documents`
    ),

  // GET /api/analytics/overview - Combined analytics overview
  getOverview: () =>
    fetcher<APIResponse<AnalyticsOverview>>(
      `${BASE_URL}/api/analytics/overview`
    ),
};

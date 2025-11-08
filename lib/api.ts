import { BASE_URL, API_ENDPOINTS, API_TIMEOUT } from "./config";
import type {
  MembersResponse,
  DocumentsResponse,
  DocumentUploadResponse,
  ChatMessage,
  ChatRequest,
  SearchResponse,
  UploadResponse,
  Organization,
  APIResponse,
  MembersAnalytics,
  DocumentsAnalytics,
  AnalyticsOverview,
  Stats,
} from "./types";

// Helper: Fetch dengan timeout dan error handling
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
      if (error.name === "AbortError")
        throw new Error("Request timeout - silakan coba lagi");
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}

// Helper: Build query params
const buildQuery = (
  params: Record<string, string | number | boolean | undefined>
): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) query.append(key, val.toString());
  });
  return query.toString() ? `?${query.toString()}` : "";
};

// Helper: Upload FormData
const uploadFile = <T>(
  url: string,
  file: File,
  extraFields?: Record<string, string>
): Promise<T> => {
  const formData = new FormData();
  formData.append("file", file);
  if (extraFields) {
    Object.entries(extraFields).forEach(([key, val]) =>
      formData.append(key, val)
    );
  }
  return fetcher<T>(url, { method: "POST", body: formData });
};

// ===== MEMBERS API =====
export const membersAPI = {
  getAll: () => fetcher<MembersResponse>(`${BASE_URL}${API_ENDPOINTS.members}`),
  uploadCSV: (file: File) =>
    uploadFile<UploadResponse>(
      `${BASE_URL}${API_ENDPOINTS.uploadMembersCSV}`,
      file
    ),
};

// ===== DOCUMENTS API =====
export const documentsAPI = {
  getAll: (params?: {
    skip?: number;
    limit?: number;
    document_type?: string;
    category?: string;
    search?: string;
  }) => {
    const query = buildQuery(params || {});
    return fetcher<DocumentsResponse>(
      `${BASE_URL}${API_ENDPOINTS.documents}${query}`
    );
  },

  upload: (
    file: File,
    options?: {
      category?: string;
      tags?: string;
      generate_ai_summary?: boolean;
    }
  ) => {
    const extraFields: Record<string, string> = {};
    if (options?.category) extraFields.category = options.category;
    if (options?.tags) extraFields.tags = options.tags;
    if (options?.generate_ai_summary !== undefined)
      extraFields.generate_ai_summary = options.generate_ai_summary.toString();
    return uploadFile<DocumentUploadResponse>(
      `${BASE_URL}${API_ENDPOINTS.uploadDocuments}`,
      file,
      extraFields
    );
  },
};

// ===== ORGANIZATION API =====
export const organizationAPI = {
  uploadPDF: (file: File) =>
    uploadFile<UploadResponse>(
      `${BASE_URL}${API_ENDPOINTS.organizationUpload}`,
      file
    ),
  getLatest: () =>
    fetcher<APIResponse<Organization>>(
      `${BASE_URL}${API_ENDPOINTS.organizationLatest}`
    ),
  getAll: () =>
    fetcher<APIResponse<Organization[]>>(
      `${BASE_URL}${API_ENDPOINTS.organizationAll}`
    ),
  getById: (id: number) =>
    fetcher<APIResponse<Organization>>(
      `${BASE_URL}${API_ENDPOINTS.organizationData(id)}`
    ),
};

// ===== CHAT API =====
export const chatAPI = {
  sendMessage: (query: string, context?: string) => {
    const payload: ChatRequest = { query, context };
    return fetcher<ChatMessage>(`${BASE_URL}${API_ENDPOINTS.chatQuery}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  getContext: () =>
    fetcher<
      APIResponse<{ context: string; source: string; extracted_at?: string }>
    >(`${BASE_URL}${API_ENDPOINTS.chatContext}`),
};

// ===== STATS API =====
export const statsAPI = {
  getStats: () =>
    fetcher<APIResponse<Stats>>(`${BASE_URL}${API_ENDPOINTS.statsOverview}`),
  getOverview: () =>
    fetcher<APIResponse<Stats>>(`${BASE_URL}${API_ENDPOINTS.statsOverview}`),
};

// ===== SEARCH API =====
export const searchAPI = {
  search: async (query: string) => {
    const response = await fetcher<SearchResponse>(
      `${BASE_URL}${API_ENDPOINTS.search}?q=${encodeURIComponent(query)}`
    );
    return response.documents.map((doc) => ({
      type: "document" as const,
      data: doc,
    }));
  },
};

// ===== ANALYTICS API =====
export const analyticsAPI = {
  getMembers: () =>
    fetcher<APIResponse<MembersAnalytics>>(`${BASE_URL}/api/analytics/members`),
  analyzeMembersData: () =>
    fetcher<APIResponse<MembersAnalytics>>(`${BASE_URL}/api/analytics/members`),
  analyzeDocumentsData: () =>
    fetcher<APIResponse<DocumentsAnalytics>>(
      `${BASE_URL}/api/analytics/documents`
    ),
  getOverview: () =>
    fetcher<APIResponse<AnalyticsOverview>>(
      `${BASE_URL}/api/analytics/overview`
    ),
};

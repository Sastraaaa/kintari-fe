import { BASE_URL, API_ENDPOINTS, API_TIMEOUT, UPLOAD_TIMEOUT, CHAT_TIMEOUT } from "./config";
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

// Helper: User-friendly error messages
const getUserFriendlyError = (error: string, statusCode?: number): string => {
  // Network errors
  if (error.includes("Failed to fetch") || error.includes("NetworkError")) {
    return "Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil dan server backend sedang berjalan.";
  }
  
  // Timeout
  if (error.includes("AbortError") || error.includes("timeout")) {
    return "Permintaan membutuhkan waktu terlalu lama. Silakan coba lagi atau kurangi ukuran file yang diupload.";
  }
  
  // HTTP status codes
  if (statusCode === 400) {
    return error.includes("CSV") || error.includes("PDF") 
      ? "Format file tidak didukung. Pastikan Anda mengupload file dengan format yang benar."
      : "Data yang dikirim tidak valid. Silakan periksa kembali input Anda.";
  }
  if (statusCode === 404) return "Data yang dicari tidak ditemukan.";
  if (statusCode === 409) return error; // Duplicate file - pass through the message
  if (statusCode === 413) return "Ukuran file terlalu besar. Maksimal 10MB.";
  if (statusCode === 500) return "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
  if (statusCode === 503) return "Server sedang dalam pemeliharaan. Silakan coba lagi nanti.";
  
  // Default: return cleaned error message
  return error.replace(/^API Error:\s*/i, "") || "Terjadi kesalahan. Silakan coba lagi.";
};

// Helper: Fetch dengan timeout dan error handling
async function fetcher<T>(url: string, options?: RequestInit, timeout: number = API_TIMEOUT): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.error || `API Error: ${response.statusText}`;
      throw new Error(getUserFriendlyError(errorMessage, response.status));
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(getUserFriendlyError("timeout"));
      }
      // If already user-friendly, pass through
      if (error.message.includes("Tidak dapat") || error.message.includes("Silakan")) {
        throw error;
      }
      throw new Error(getUserFriendlyError(error.message));
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui");
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

// Helper: Upload FormData with longer timeout
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
  // Use longer timeout for file uploads
  return fetcher<T>(url, { method: "POST", body: formData }, UPLOAD_TIMEOUT);
};

// Helper: Upload with progress callback
export const uploadFileWithProgress = <T>(
  url: string,
  file: File,
  onProgress?: (percent: number) => void,
  extraFields?: Record<string, string>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    if (extraFields) {
      Object.entries(extraFields).forEach(([key, val]) =>
        formData.append(key, val)
      );
    }

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    // Handle completion
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response as T);
        } catch {
          reject(new Error("Gagal memproses response dari server"));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(getUserFriendlyError(errorData.detail || errorData.error || "Upload gagal", xhr.status)));
        } catch {
          reject(new Error(getUserFriendlyError(`Upload gagal: ${xhr.statusText}`, xhr.status)));
        }
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      reject(new Error("Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil."));
    });

    xhr.addEventListener("timeout", () => {
      reject(new Error("Upload membutuhkan waktu terlalu lama. Silakan coba lagi dengan file yang lebih kecil."));
    });

    // Set timeout
    xhr.timeout = UPLOAD_TIMEOUT;
    xhr.open("POST", url);
    xhr.send(formData);
  });
};

// ===== MEMBERS API =====
export const membersAPI = {
  getAll: () => fetcher<MembersResponse>(`${BASE_URL}${API_ENDPOINTS.members}`),
  uploadCSV: (file: File) =>
    uploadFile<UploadResponse>(
      `${BASE_URL}${API_ENDPOINTS.uploadMembersCSV}`,
      file
    ),
  uploadCSVWithProgress: (file: File, onProgress?: (percent: number) => void) =>
    uploadFileWithProgress<UploadResponse>(
      `${BASE_URL}${API_ENDPOINTS.uploadMembersCSV}`,
      file,
      onProgress
    ),
  delete: (id: number) =>
    fetcher<APIResponse<{ message: string }>>(`${BASE_URL}${API_ENDPOINTS.members}/${id}`, {
      method: "DELETE",
    }),
  deleteAll: () =>
    fetcher<APIResponse<{ message: string }>>(`${BASE_URL}${API_ENDPOINTS.members}`, {
      method: "DELETE",
    }),
  exportCSV: () => `${BASE_URL}${API_ENDPOINTS.members}/export`,
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
    // Only send generate_ai_summary if true (default is false on backend)
    if (options?.generate_ai_summary === true)
      extraFields.generate_ai_summary = "true";
    return uploadFile<DocumentUploadResponse>(
      `${BASE_URL}${API_ENDPOINTS.uploadDocuments}`,
      file,
      extraFields
    );
  },

  uploadWithProgress: (
    file: File,
    onProgress?: (percent: number) => void,
    options?: {
      category?: string;
      tags?: string;
      generate_ai_summary?: boolean;
    }
  ) => {
    const extraFields: Record<string, string> = {};
    if (options?.category) extraFields.category = options.category;
    if (options?.tags) extraFields.tags = options.tags;
    // Only send generate_ai_summary if true (default is false on backend)
    if (options?.generate_ai_summary === true)
      extraFields.generate_ai_summary = "true";
    return uploadFileWithProgress<DocumentUploadResponse>(
      `${BASE_URL}${API_ENDPOINTS.uploadDocuments}`,
      file,
      onProgress,
      extraFields
    );
  },

  delete: (id: number) =>
    fetcher<APIResponse<{ message: string }>>(`${BASE_URL}${API_ENDPOINTS.documents}/${id}`, {
      method: "DELETE",
    }),
  deleteAll: () =>
    fetcher<APIResponse<{ message: string }>>(`${BASE_URL}${API_ENDPOINTS.documents}`, {
      method: "DELETE",
    }),
  exportCSV: () => `${BASE_URL}${API_ENDPOINTS.documents}/export/csv`,
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
    // Use longer timeout for AI chat (Gemini processing takes time)
    return fetcher<ChatMessage>(
      `${BASE_URL}${API_ENDPOINTS.chatQuery}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      CHAT_TIMEOUT
    );
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
  // Generate insight for a specific chart using AI
  generateChartInsight: (payload: { chart_type: string; chart_data: any[]; chart_title?: string }) =>
    fetcher<APIResponse<{ insight: string }>>(`${BASE_URL}/api/analytics/chart-insight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
};

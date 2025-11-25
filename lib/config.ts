// Konfigurasi API untuk Backend FastAPI
// Mengikuti Integration Rules: Protocol, Format, CORS, Timeout

// Base URL - hanya dari Backend FastAPI
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Timeout settings
export const API_TIMEOUT = 15000; // 15 detik untuk request biasa
export const UPLOAD_TIMEOUT = 60000; // 60 detik untuk upload file besar
export const CHAT_TIMEOUT = 30000; // 30 detik untuk AI chat (Gemini processing)

// API Endpoints sesuai Backend FastAPI Routes
export const API_ENDPOINTS = {
  // Members - sesuai /api/members routes
  members: "/api/members",
  uploadMembersCSV: "/api/members/upload-csv",

  // Documents - sesuai /api/documents routes
  documents: "/api/documents",
  uploadDocuments: "/api/documents/upload",

  // Organization - sesuai /api/organization routes
  organizationUpload: "/api/organization/upload",
  organizationLatest: "/api/organization/latest",
  organizationAll: "/api/organization/all",
  organizationData: (id: number) => `/api/organization/data/${id}`,
  organizationSummarize: "/api/organization/summarize",

  // Chat - sesuai /api/chat routes
  chatQuery: "/api/chat/query",
  chatContext: "/api/chat/context",

  // Stats - sesuai /api/stats routes
  statsOverview: "/api/stats/overview",

  // Search - sesuai /api/documents/search/ routes (with trailing slash)
  search: "/api/documents/search/",
};

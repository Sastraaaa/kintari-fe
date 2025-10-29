// Konfigurasi API untuk switch antara JSON Server dan Backend Real
// Mengikuti Integration Rules: Protocol, Format, CORS, Timeout
export const USE_JSON_SERVER =
  process.env.NEXT_PUBLIC_USE_JSON_SERVER === "true" || false;

export const BASE_URL = USE_JSON_SERVER
  ? "http://localhost:5000"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Timeout setting (10-15 detik sesuai rules)
export const API_TIMEOUT = 15000;

// API Endpoints sesuai Backend FastAPI Routes
export const API_ENDPOINTS = {
  // Members - sesuai /api/members routes
  members: USE_JSON_SERVER ? "/members" : "/api/members",
  uploadMembersCSV: USE_JSON_SERVER ? "/members" : "/api/members/upload-csv",

  // Documents - sesuai /api/documents routes
  documents: USE_JSON_SERVER ? "/documents" : "/api/documents",
  uploadDocuments: USE_JSON_SERVER ? "/documents" : "/api/documents/upload",

  // Organization - sesuai /api/organization routes
  organizationUpload: "/api/organization/upload",
  organizationLatest: "/api/organization/latest",
  organizationAll: "/api/organization/all",
  organizationData: (id: number) => `/api/organization/data/${id}`,
  organizationSummarize: "/api/organization/summarize",

  // Chat - sesuai /api/chat routes
  chatQuery: USE_JSON_SERVER ? "/chat" : "/api/chat/query",
  chatContext: "/api/chat/context",

  // Stats - sesuai /api/stats routes
  statsOverview: USE_JSON_SERVER ? "/stats" : "/api/stats/overview",

  // Search - sesuai /api/documents/search/ routes (with trailing slash)
  search: USE_JSON_SERVER ? "/search" : "/api/documents/search/",
};

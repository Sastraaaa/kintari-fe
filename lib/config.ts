// Konfigurasi API untuk switch antara JSON Server dan Backend Real
export const USE_JSON_SERVER = true; // Ubah ke false saat konek backend asli
export const BASE_URL = USE_JSON_SERVER
  ? "http://localhost:5000"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  // Members
  members: USE_JSON_SERVER ? "/members" : "/api/members",
  uploadMembers: USE_JSON_SERVER ? "/members" : "/api/upload/members",

  // Documents
  documents: USE_JSON_SERVER ? "/documents" : "/api/documents",
  uploadDocuments: USE_JSON_SERVER ? "/documents" : "/api/upload/docs",

  // Stats
  stats: USE_JSON_SERVER ? "/stats" : "/api/stats/members",

  // Chat
  chat: USE_JSON_SERVER ? "/chat" : "/api/chat/query",

  // Search
  search: USE_JSON_SERVER ? "/search" : "/api/search",
};

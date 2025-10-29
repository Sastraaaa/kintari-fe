// Types untuk API responses
// Sesuai dengan Backend FastAPI Response Schema

// Member types - mapping dari backend /api/members
export interface Member {
  id: number; // Backend menggunakan integer ID
  name: string; // Backend: name
  email: string;
  phone?: string; // Backend: phone (optional)
  position?: string; // Backend: position / jabatan
  organization?: string; // Backend: organization
  membership_type?: string; // Backend: membership_type
  status: string; // Backend: status (active/nonactive)
}

// Backend Members Response
export interface MembersResponse {
  status: "success" | "error";
  total: number;
  data: Member[];
}

// Document types - mapping dari backend /api/documents (Universal Documents)
export interface Document {
  id: number;
  filename: string; // Backend: filename
  file_path: string; // Backend: file_path
  file_size: number; // Backend: file_size (in bytes)
  document_type: string; // Backend: document_type (auto-detected)
  category?: string; // Backend: category (user-defined)
  tags?: string[]; // Backend: tags (array)
  summary?: string; // Backend: summary (auto-generated)
  page_count?: number; // Backend: page_count
  keywords?: string[]; // Backend: keywords
  uploaded_at?: string; // Backend: uploaded_at (ISO format)
  processed: boolean; // Backend: processed (true/false)
}

// Backend Documents Response
export interface DocumentsResponse {
  total: number;
  skip: number;
  limit: number;
  filters?: {
    document_type?: string;
    category?: string;
    search?: string;
  };
  documents: Document[];
}

// Document Upload Response (Universal)
export interface DocumentUploadResponse {
  status: "success" | "error";
  message?: string;
  document: {
    id: number;
    filename: string;
    file_size_mb: number;
    document_type: string;
    type_info?: {
      category: string;
      description: string;
      examples: string[];
    };
    category?: string;
    tags?: string[];
    page_count?: number;
    keywords_count?: number;
    has_tables?: boolean;
    processed: boolean;
    uploaded_at?: string;
  };
}

// Organization types - mapping dari backend /api/organization
export interface Organization {
  id: number;
  name: string;
  founded_date?: string;
  ideology?: string;
  legal_basis?: string;
  objectives?: string;
  summary?: string;
  extracted_at?: string; // ISO datetime
}

// Stats types - mapping dari backend /api/stats/overview
export interface Stats {
  total_anggota?: number;
  total_dokumen?: number;
  total_organizations?: number;
  latest_organization?: string;
  last_updated?: string;
  chat_interactions?: number;
  growth_rate?: number;
  aktif?: number;
  nonaktif?: number;
  tahun?: number[];
  anggota_per_tahun?: Record<string, number>;
  anggota_per_department?: Record<string, number>;
  dokumen_per_bulan?: Array<{ bulan: string; jumlah: number }>;
  chat_per_bulan?: Array<{ bulan: string; jumlah: number }>;
}

// Chat types - mapping dari backend /api/chat (Universal Knowledge Base)
export interface ChatMessage {
  id?: number;
  status: "success" | "error";
  query: string; // Backend: query
  response: string; // Backend: response
  source?: string; // Backend: source (e.g., "Universal Knowledge Base")
  documents_used?: number; // Backend: number of documents used
  context_size?: number; // Backend: size of context in chars
}

// Chat request
export interface ChatRequest {
  query: string;
  context?: string;
}

// Upload responses
export interface UploadResponse {
  status: "success" | "error";
  message?: string;
  imported?: number; // Untuk CSV upload
  errors?: string[];
  organization_id?: number; // Untuk organization upload
  filename?: string;
  file_size?: number;
}

// Search types
export interface SearchResult {
  type: "member" | "document";
  data: Member | Document;
}

// Search Response from backend /api/documents/search
export interface SearchResponse {
  status: "success" | "error";
  query: string;
  results_count: number;
  documents: Document[];
}

// Generic API Response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface APIResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
  error?: string;
}

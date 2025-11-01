// Types untuk API responses
// Sesuai dengan Backend FastAPI Response Schema

// Member types - mapping dari backend /api/members (Pengurus HIPMI)
export interface Member {
  id: number; // Backend menggunakan integer ID
  no?: number; // Backend: no (nomor urut)
  name: string; // Backend: name (dari kolom "nama")
  email?: string;
  phone?: string; // Backend: phone (dari kolom "whatsapp")

  // Pengurus-specific fields
  jabatan?: string; // Backend: jabatan (Ketum, WKU, Sekum, Ketua Bidang, dll)
  status_kta?: string; // Backend: status_kta (KTA Fisik, KTA HIPMI NET, Hilang, SK Tum Ibam)
  no_kta?: string; // Backend: no_kta
  tanggal_lahir?: string; // Backend: tanggal_lahir
  usia?: number; // Backend: usia
  jenis_kelamin?: string; // Backend: jenis_kelamin (Male/Female)
  instagram?: string; // Backend: instagram

  // Company/Business fields
  nama_perusahaan?: string; // Backend: nama_perusahaan
  jabatan_dlm_akta_perusahaan?: string; // Backend: jabatan_dlm_akta_perusahaan
  kategori_bidang_usaha?: string; // Backend: kategori_bidang_usaha
  alamat_perusahaan?: string; // Backend: alamat_perusahaan
  perusahaan_berdiri_sejak?: string; // Backend: perusahaan_berdiri_sejak
  jmlh_karyawan?: number; // Backend: jmlh_karyawan
  website?: string; // Backend: website
  twitter?: string; // Backend: twitter
  facebook?: string; // Backend: facebook
  youtube?: string; // Backend: youtube

  // Backward compatibility (optional, may not be used)
  position?: string; // Deprecated - use jabatan
  organization?: string; // Deprecated - use nama_perusahaan
  membership_type?: string; // Deprecated
  status?: string; // Deprecated - use status_kta
  region?: string; // Deprecated
  entry_year?: number; // Deprecated
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

// Analytics Visualizations - untuk 4 chart utama (sesuai update2.instructions.md)
export interface AnalyticsVisualizations {
  // 1. Pertumbuhan Anggota (Line Chart)
  yearly_growth: Record<number, number>; // { 2020: 10, 2021: 15, ... }

  // 2. Jumlah Anggota per Divisi (Bar Chart)
  by_division: Record<string, number>; // { "KSWB": 25, "Teknologi": 18, ... }

  // 3. Proporsi Status Anggota (Pie Chart)
  status_proportion: {
    active: number;
    "non active": number;
  };

  // 4. Persebaran Wilayah (Bar/Map Chart)
  by_region: Record<string, number>; // { "Jakarta": 50, "Jawa Barat": 30, ... }
}

// Enhanced Analytics Response with Visualizations
export interface AnalyticsResponse {
  status: "success" | "error";
  data: {
    summary: string;
    total_members: number;
    key_insights: string[];
    trends: string;
    recommendations: string[];
    statistics: {
      total_members: number;
      by_organization: Record<string, number>;
      by_position: Record<string, number>;
      by_year: Record<number, number>;
      active_members: number;
      inactive_members: number;
    };
    visualizations: AnalyticsVisualizations;
    last_updated: string;
  };
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

// ============= ANALYTICS TYPES =============
// AI-powered analytics response types

export interface MembersAnalytics {
  summary: string;
  total_members: number;
  key_insights: string[];
  trends: string;
  recommendations: string[];
  statistics: {
    total_members: number;
    by_organization: Record<string, number>;
    by_position: Record<string, number>;
    by_year: Record<number, number>;
    active_members: number;
    inactive_members: number;
  };
  last_updated: string;
}

export interface DocumentsAnalytics {
  summary: string;
  total_documents: number;
  total_pages: number;
  key_insights: string[];
  document_health: string;
  recommendations: string[];
  statistics: {
    total_documents: number;
    total_pages: number;
    total_size_mb: number;
    by_type: Record<string, number>;
    by_category: Record<string, number>;
    avg_pages_per_doc: number;
    avg_size_mb: number;
  };
  last_updated: string;
}

export interface AnalyticsOverview {
  total_members: number;
  total_documents: number;
  has_data: boolean;
  health_status?: string;
  key_points?: string[];
  next_actions?: string;
  message?: string;
}

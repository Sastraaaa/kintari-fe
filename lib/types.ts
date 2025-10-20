// Types untuk API responses
export interface Member {
  id: string;
  nama: string;
  email: string;
  tahun: number;
  jabatan: string;
  peminatan: string;
  department: string;
  status: string;
}

export interface Document {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  ringkasan: string;
  tanggal: string;
  fileUrl: string;
}

export interface Stats {
  total_anggota: number;
  total_dokumen: number;
  chat_interactions: number;
  growth_rate: number;
  aktif: number;
  nonaktif: number;
  tahun: number[];
  anggota_per_tahun: Record<string, number>;
  anggota_per_department: Record<string, number>;
  dokumen_per_bulan: Array<{ bulan: string; jumlah: number }>;
  chat_per_bulan: Array<{ bulan: string; jumlah: number }>;
}

export interface ChatMessage {
  id: number;
  question: string;
  answer: string;
}

export interface SearchResult {
  type: "member" | "document";
  data: Member | Document;
}

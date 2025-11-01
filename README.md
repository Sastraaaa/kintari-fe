# 🎯 Kintari AI - Frontend

**Knowledge Intelligence Repository & Assistant for HIPMI**

Platform web interaktif untuk mengelola data pengurus HIPMI, dokumen organisasi, serta menampilkan insight analitik dan chatbot AI yang cerdas.

---

## ✨ Fitur Utama

| Fitur                        | Deskripsi                                                   |
| ---------------------------- | ----------------------------------------------------------- |
| 🏠 **Home Dashboard**        | Quick access dan ringkasan statistik pengurus               |
| 👥 **Data Pengurus**         | Upload CSV pengurus, kelola data keanggotaan                |
| 📄 **Dokumen HIPMI**         | Upload PDF/DOCX (AD/ART, PO, Sejarah, dll)                  |
| 📊 **Statistik & Analytics** | 4 visualisasi data (usia, gender, bidang usaha, perusahaan) |
| 💬 **Chatbot AI**            | Tanya jawab tentang pengurus & dokumen HIPMI                |
| 🔍 **Pencarian**             | Search data pengurus dan dokumen                            |

---

## 🛠️ Tech Stack

```
Framework      : Next.js 15.5.5 (App Router + TypeScript)
Styling        : TailwindCSS v4 + ShadCN UI
State Manager  : TanStack Query (React Query)
Charts         : Recharts (Bar, Pie, Line charts)
File Upload    : react-dropzone
CSV Parser     : papaparse
Icons          : Lucide React
Notifications  : Sonner (toast)
```

---

## 📦 Instalasi

### 1️⃣ **Prerequisites**

- Node.js 18+ ([Download](https://nodejs.org))
- npm atau pnpm
- Backend sudah running di `http://localhost:8000`

### 2️⃣ **Clone & Install**

```bash
# Masuk ke folder frontend
cd kintari-ai

# Install dependencies
npm install
```

### 3️⃣ **Configuration**

Edit file `lib/config.ts` (pastikan backend URL benar):

```typescript
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

### 4️⃣ **Run Development Server**

```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:3000**

---

## 🚀 Penggunaan

### 📋 **1. Upload Data Pengurus**

1. Buka **http://localhost:3000/members**
2. Klik atau drag-drop file `pengurus.csv`
3. Klik tombol **"Import Data Pengurus"**
4. Data akan muncul di tabel dengan kolom:
   - No, Nama, Jabatan, Status KTA, Bidang Usaha, Perusahaan, Kontak

**Format CSV:**

```csv
no,nama,jabatan,status_kta,usia,jenis_kelamin,whatsapp,email,kategori_bidang_usaha,nama_perusahaan,jmlh_karyawan
1,Ibrahim Imaduddin Islam,Ketum,KTA Fisik,35,Male,082127712571,ibrahim@email.com,Industri Kreatif,PT. Mavens Studio Indonesia,
```

### � **2. Upload Dokumen HIPMI**

1. Buka **http://localhost:3000/documents**
2. Upload file PDF/DOCX (AD, ART, PO1-PO18, Sejarah, Visi Misi, dll)
3. System akan otomatis:
   - Extract text dari dokumen
   - Detect tipe dokumen
   - Generate summary menggunakan AI
4. Dokumen akan tersimpan dan bisa di-search

### 📊 **3. Lihat Statistik**

Buka **http://localhost:3000/statistics** untuk melihat:

- **Distribusi Usia Pengurus** (Histogram)
- **Proporsi Gender** (Pie Chart)
- **Pengurus per Bidang Usaha** (Bar Chart)
- **Status Kepemilikan Perusahaan** (Donut Chart)
- **Total Pengurus & Total Karyawan** (Summary Cards)

### 💬 **4. Chatbot AI**

Buka **http://localhost:3000/chatbot** dan coba tanya:

**Tentang Pengurus:**

```
✅ "Ibrahim jabatannya apa?"
✅ "Rangga perusahaannya apa?"
✅ "Ada berapa Ketua Bidang?"
✅ "Siapa yang bidang usaha Property?"
✅ "Total karyawan semua pengurus berapa?"
✅ "Rasio pengurus pria dan wanita?"
```

**Tentang Dokumen:**

```
✅ "Kapan HIPMI didirikan?"
✅ "Apa visi dan misi HIPMI?"
✅ "Berapa batas usia anggota biasa?"
✅ "Bagaimana cara mendirikan BPC HIPMI?"
```

---

## 📁 Struktur Project

```
kintari-ai/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (Dashboard)
│   ├── members/                # 👥 Upload & kelola pengurus
│   ├── documents/              # 📄 Upload & kelola dokumen
│   ├── statistics/             # 📊 Analytics & visualisasi
│   ├── chatbot/                # 💬 AI Assistant
│   └── search/                 # 🔍 Search engine
├── components/
│   ├── AppLayout.tsx           # Layout dengan sidebar
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── Providers.tsx           # TanStack Query provider
│   └── ui/                     # ShadCN UI components
├── lib/
│   ├── api.ts                  # API client functions
│   ├── config.ts               # Configuration (BASE_URL)
│   ├── types.ts                # TypeScript interfaces
│   ├── hooks.ts                # Custom React hooks
│   └── utils.ts                # Utility functions
├── public/                     # Static assets
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript config
```

---

## 🎨 Component Library (ShadCN UI)

UI components yang tersedia:

- **Button** - Primary, outline, ghost variants
- **Card** - Header, content, footer sections
- **Table** - Sortable, responsive tables
- **Input/Textarea** - Form inputs
- **Label** - Form labels

Tambah component baru:

```bash
npx shadcn-ui@latest add [component-name]
```

---

## � Scripts

| Script          | Deskripsi                          |
| --------------- | ---------------------------------- |
| `npm run dev`   | Run development server (port 3000) |
| `npm run build` | Build production bundle            |
| `npm start`     | Run production server              |
| `npm run lint`  | Check linting errors               |

---

## 🐛 Troubleshooting

### ❌ **Error: Cannot connect to backend**

**Solusi:**

1. Pastikan backend running di port 8000
2. Check `lib/config.ts` - pastikan `BASE_URL` benar
3. Test backend: `curl http://localhost:8000/api/members`

### ❌ **Error: Module not found**

**Solusi:**

```bash
# Hapus node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### ❌ **CSV Upload gagal**

**Solusi:**

1. Pastikan file CSV encoding UTF-8
2. Header harus ada di baris pertama
3. Gunakan delimiter koma (,)
4. Nama kolom harus sesuai: `no,nama,jabatan,status_kta,...`

---

## � API Endpoints (Backend)

Frontend berkomunikasi dengan backend melalui endpoints:

| Endpoint                  | Method | Deskripsi                  |
| ------------------------- | ------ | -------------------------- |
| `/api/members`            | GET    | Get all pengurus           |
| `/api/members/upload-csv` | POST   | Upload CSV pengurus        |
| `/api/documents`          | GET    | Get all documents          |
| `/api/documents/upload`   | POST   | Upload PDF/DOCX            |
| `/api/analytics/members`  | GET    | Get analytics data         |
| `/api/chat/query`         | POST   | Send query to AI chatbot   |
| `/api/search`             | GET    | Search documents & members |

---

## � Production Deployment

### **Build Production**

```bash
npm run build
npm start
```

### **Environment Variables**

Buat file `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### **Deploy Options**

- **Vercel** (Recommended) - [vercel.com](https://vercel.com)
- **Netlify** - [netlify.com](https://netlify.com)
- **Docker** - Containerize dengan Dockerfile

---

## 👨‍💻 Development Tips

1. **Hot Reload** - Perubahan code langsung reload otomatis
2. **TypeScript** - Gunakan type checking untuk prevent errors
3. **React Query** - Data caching otomatis, re-fetch on stale
4. **Responsive Design** - Test di mobile, tablet, desktop
5. **Error Handling** - Toast notifications untuk user feedback

---

## 📄 License

MIT License - Free to use for HIPMI projects

---

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/Sastraaaa/kintari-fe/issues)
- **Backend Docs**: Lihat README Backend untuk API documentation
- **Contact**: Hubungi maintainer untuk support

---

**Built with ❤️ for HIPMI Bandung**

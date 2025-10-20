# Kintari AI - Knowledge Intelligence Repository & Assistant

Frontend (FE) Kintari adalah platform web interaktif untuk **Knowledge Intelligence Repository & Assistant** yang mengelola data anggota, dokumen organisasi, serta menampilkan insight analitik dan chatbot AI.

## 🎯 Fitur Utama

- ✅ **Dashboard Utama** - Statistik dan quick access ke modul-modul
- ✅ **Upload Data Anggota** - Import CSV dengan drag & drop
- ✅ **Upload Dokumen** - Upload PDF/DOCX dengan AI summarization
- ✅ **Chatbot AI Assistant** - Percakapan interaktif dengan AI
- ✅ **Pencarian Data** - Full-text search dokumen dan anggota
- ✅ **Dashboard Statistik** - Grafik dan visualisasi data

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: TailwindCSS v4 + ShadCN UI
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **File Upload**: react-dropzone + papaparse
- **Mock API**: JSON Server

## 📦 Instalasi

```bash
# Install dependencies
npm install

# Run JSON Server (Terminal 1)
npm run json-server

# Run Next.js Development Server (Terminal 2)
npm run dev
```

## 🚀 Development

Aplikasi akan berjalan di:

- **Frontend**: http://localhost:3000
- **JSON Server**: http://localhost:5000

## 📁 Struktur Project

```
kintari-ai/
├── app/
│   ├── dashboard/          # Dashboard utama
│   ├── members/            # Upload & manage anggota
│   ├── documents/          # Upload & manage dokumen
│   ├── chatbot/            # AI chatbot interface
│   ├── search/             # Pencarian data
│   ├── statistics/         # Dashboard statistik
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # ShadCN UI components
│   ├── AppLayout.tsx       # Layout wrapper
│   └── Sidebar.tsx         # Navigation sidebar
├── lib/
│   ├── api.ts              # API functions
│   ├── config.ts           # API configuration
│   ├── types.ts            # TypeScript types
│   └── utils.ts
├── db.json                 # JSON Server database
└── package.json
```

## 🔄 API Configuration

File `lib/config.ts` mengatur switching antara JSON Server dan Backend real:

```typescript
export const USE_JSON_SERVER = true; // Ubah ke false untuk backend real
```

## 📊 Data Dummy

JSON Server menyediakan endpoint berikut:

- `GET /members` - Daftar anggota
- `GET /documents` - Daftar dokumen
- `GET /stats` - Statistik sistem
- `POST /chat` - Chatbot AI
- `GET /search?q=` - Pencarian

## 🎨 Design System

Project ini menggunakan ShadCN UI dengan desain yang sesuai dengan tech-spec:

- Sidebar navigation
- Card-based layouts
- Interactive charts dengan Recharts
- Responsive design

## 📝 TODO Next Steps

- [ ] Integrasi dengan Backend FastAPI/Express real
- [ ] Implementasi AI Summarization (OpenAI)
- [ ] Implementasi Embedding & Retrieval (LangChain)
- [ ] Authentication & Authorization
- [ ] Real-time updates dengan WebSocket

## 👨‍💻 Development Team

Project Kintari AI - Magang Project Langit

---

**Status**: MVP Batch 1 - JSON Server Integration ✅

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

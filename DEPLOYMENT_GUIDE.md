# 🚀 Kintari Frontend - Railway Deployment Guide

Frontend Next.js untuk Kintari AI - Knowledge Intelligence Repository & Assistant.

## 📋 Prerequisites

- Railway account
- GitHub repository
- Backend sudah deployed (lihat backend RAILWAY_DEPLOYMENT.md)

## 🚂 Deploy ke Railway

### Step 1: Deploy Backend Dulu

⚠️ **PENTING:** Backend HARUS sudah running terlebih dahulu!

Ikuti panduan di `kintari-be/RAILWAY_DEPLOYMENT.md`

### Step 2: Create Frontend Project

1. Login ke Railway Dashboard
2. Click **"New Project"**
3. Pilih **"Deploy from GitHub repo"**
4. Select repository dengan folder `kintari-ai`
5. Railway akan auto-detect Next.js

### Step 3: Set Environment Variables

Di Railway Dashboard → Variables, set:

```env
NEXT_PUBLIC_API_URL=https://your-backend-name.up.railway.app
```

**Cara dapat Backend URL:**
1. Buka Backend project di Railway
2. Go to Settings → Domains
3. Copy generated domain (contoh: `kintari-be-production.up.railway.app`)
4. Paste ke `NEXT_PUBLIC_API_URL` dengan `https://` prefix

### Step 4: Update Backend CORS

Setelah Frontend deploy, update Backend environment variable:

```env
ALLOWED_ORIGINS=https://your-frontend-name.up.railway.app
```

Di Backend Railway project → Variables → Edit `ALLOWED_ORIGINS`

## 🔧 Configuration Files

✅ Files sudah di-setup:
- `railway.json` - Railway build & deploy config
- `.env.example` - Environment variable template
- `package.json` - Dependencies & scripts

## 🌐 Access Your App

Setelah deploy:
```
https://your-frontend-name.up.railway.app
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | **REQUIRED** - Backend URL | `https://be.railway.app` |

## 🔄 Auto-Deploy

Push ke GitHub = auto-deploy:

```bash
git add .
git commit -m "Update frontend"
git push origin master
```

Railway akan:
1. Pull latest code
2. Run `npm install`
3. Run `npm run build`
4. Start with `npm start`

## 🐛 Troubleshooting

### Build Failed
Check Railway logs:
```bash
railway logs
```

Common issues:
- TypeScript errors → Fix locally first with `npm run build`
- Missing dependencies → Update `package.json`

### API Connection Failed

1. Pastikan `NEXT_PUBLIC_API_URL` benar
2. Check Backend masih running
3. Verify CORS di Backend include Frontend URL

### Environment Variable Not Working

⚠️ **RESTART REQUIRED** setelah ubah env vars:
- Railway Dashboard → Deployments → Redeploy

## 📊 Monitoring

Railway Dashboard menampilkan:
- ✅ Build logs
- ✅ Runtime logs
- ✅ Memory usage
- ✅ Deployment history

## 🔗 Integration Checklist

Sebelum production:

- [ ] Backend deployed & running
- [ ] `NEXT_PUBLIC_API_URL` pointing ke Backend URL
- [ ] Backend `ALLOWED_ORIGINS` include Frontend URL
- [ ] Test upload file (PDF)
- [ ] Test chatbot functionality
- [ ] Test analytics page
- [ ] Check all pages loading correctly

## 📞 Support

Issues: https://github.com/Sastraaaa/kintari-ai/issues

---

## 🎯 Quick Start Commands

```bash
# Local development
npm install
npm run dev

# Local build test
npm run build
npm start

# Check for errors
npm run lint
```

## 🔐 Security Notes

- `NEXT_PUBLIC_*` variables are exposed to browser
- Jangan masukkan secrets/API keys di `NEXT_PUBLIC_*`
- Backend API key aman karena di Backend environment

---

**Happy Deploying! 🚀**

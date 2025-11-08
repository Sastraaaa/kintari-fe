# 🔐 Environment Variables Setup Guide

## 📋 Quick Start

### 1️⃣ **Development (Local)**

```bash
# Copy template
cp .env.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2️⃣ **Production (Railway)**

Set di Railway dashboard → **Environment Variables**:

```env
NEXT_PUBLIC_API_URL=https://kintari-be-production.up.railway.app
NEXT_PUBLIC_ENV=production
```

---

## 🎯 Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | **Backend API URL** | `http://localhost:8000` (dev)<br>`https://api.yourdomain.com` (prod) |

---

## 🔧 Optional Variables

### Application Config
```env
NEXT_PUBLIC_APP_NAME=Kintari AI
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENV=development
```

### Analytics (Future)
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Feature Flags
```env
NEXT_PUBLIC_ENABLE_CHATBOT=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Performance
```env
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_RATE_LIMIT=60
```

---

## 🚀 Deployment Platforms

### **Railway**
```bash
# Via Dashboard
Settings → Variables → Add Variable
NEXT_PUBLIC_API_URL = https://kintari-be.railway.app

# Via CLI
railway variables set NEXT_PUBLIC_API_URL=https://kintari-be.railway.app
```

### **Vercel**
```bash
# Via Dashboard
Settings → Environment Variables → Add
Key: NEXT_PUBLIC_API_URL
Value: https://api.yourdomain.com

# Via CLI
vercel env add NEXT_PUBLIC_API_URL
```

### **Netlify**
```bash
# Via Dashboard
Site settings → Environment variables → Add variable
NEXT_PUBLIC_API_URL = https://api.yourdomain.com

# Via CLI
netlify env:set NEXT_PUBLIC_API_URL https://api.yourdomain.com
```

---

## ⚠️ Security Best Practices

### ✅ **DO's**
- ✅ Use `.env.local` for development (gitignored)
- ✅ Set production variables in platform dashboard
- ✅ Use `NEXT_PUBLIC_` prefix for client-side variables
- ✅ Keep `.env.example` as template (no secrets)

### ❌ **DON'Ts**
- ❌ Never commit `.env.local` or `.env.production`
- ❌ Never expose API keys in `NEXT_PUBLIC_*` variables
- ❌ Never hardcode URLs in code (use env vars)
- ❌ Never share `.env.local` file publicly

---

## 🧪 Testing

```bash
# Test environment variables loaded
npm run dev

# Check in browser console
console.log(process.env.NEXT_PUBLIC_API_URL)

# Should output: http://localhost:8000
```

---

## 🔍 Troubleshooting

### Problem: "API URL undefined"
```bash
# Solution: Restart dev server after changing .env
npm run dev
```

### Problem: "Cannot connect to Backend"
```bash
# Check Backend is running
curl http://localhost:8000/docs

# Check NEXT_PUBLIC_API_URL is correct
echo $NEXT_PUBLIC_API_URL  # Linux/Mac
echo %NEXT_PUBLIC_API_URL%  # Windows
```

### Problem: "Variables not loading in production"
```bash
# Make sure to set variables in deployment platform
# Railway: Dashboard → Variables
# Vercel: Settings → Environment Variables
# Then redeploy
```

---

## 📚 References

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Railway Environment Variables](https://docs.railway.app/guides/variables)
- [Kintari Integration Rules](../.github/instructions/rules-integration.instructions.md)

---

**Last Updated:** November 8, 2025

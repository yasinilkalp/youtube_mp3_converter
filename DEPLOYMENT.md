# Deployment Guide - YouTube to MP3 Converter

## Render.com'a Deploy Etme

### Adım 1: GitHub'a Yükle
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Adım 2: Render.com'da Yeni Web Service Oluştur
1. [Render Dashboard](https://dashboard.render.com/) 'a git
2. "New +" butonuna tıkla → "Web Service" seç
3. GitHub repo'nu bağla

### Adım 3: Ayarlar
- **Name:** youtube-mp3-converter (veya istediğin isim)
- **Environment:** Node
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Instance Type:** Free (başlangıç için yeterli)

### Adım 4: Deploy Et
"Create Web Service" butonuna tıkla. Render otomatik olarak deploy edecek.

## Railway.app'e Deploy Etme

### Adım 1: Railway CLI Kur (opsiyonel)
```bash
npm i -g @railway/cli
railway login
```

### Adım 2: GitHub'dan Deploy
1. [Railway Dashboard](https://railway.app/)
2. "New Project" → "Deploy from GitHub repo"
3. Repo'nu seç

### Adım 3: Ayarlar
Railway otomatik algılar ama manuel kontrol için:
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

## Vercel'e Deploy Etme (Sadece Frontend + Serverless)

> Not: Vercel serverless functions uzun işlemler için uygun değil. Render/Railway tercih edilir.

## Environment Variables

Şu an için gerekli değil, ancak gelecekte eklenebilir:
- `PORT` - Render/Railway otomatik atar
- `YOUTUBE_API_KEY` - (opsiyonel, gelecekte metadata için)

## Post-Deployment Testi

1. URL'i aç (örn: `https://your-app.onrender.com`)
2. Bir YouTube linki yapıştır
3. "Find" → "Download MP3" yap
4. İlerleme çubuğunun göründüğünü doğrula
5. MP3 dosyasının indiğini kontrol et

## Troubleshooting

### Socket.io Bağlantı Sorunu
- CORS ayarlarını kontrol et (`server/index.js`)
- Production'da relative URL'ler kullanıldığından emin ol

### yt-dlp Hatası
- Hosting platformunun Python desteğini kontrol et
- `ffmpeg-static` paketi yüklü olmalı

### Dosya İndirme Sorunu
- `server/temp` klasörünün yazılabilir olduğundan emin ol
- Büyük dosyalar için timeout ayarlarını artır

## Performans Optimizasyonu

### Caching
Future enhancement için Redis eklenebilir.

### Rate Limiting
Production'da rate limiting ekle:
```bash
npm install express-rate-limit
```

## Maliyet
- **Render Free Tier:** 750 saat/ay (1 instance için yeterli)
- **Railway Free Tier:** $5 credit/ay
- Her ikisi de başlangıç için ücretsiz kullanılabilir

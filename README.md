# YouTube to MP3 Converter

Modern, şık ve hızlı bir YouTube MP3 dönüştürücü uygulaması.

## Özellikler

- ✨ **Premium Dark UI** - Modern ve şık tasarım
- 📊 **Canlı İlerleme Göstergesi** - Socket.io ile gerçek zamanlı güncelleme
- 🎵 **Yüksek Kalite MP3** - ffmpeg ile profesyonel dönüşüm
- 🚀 **Hızlı ve Güvenilir** - yt-dlp kullanarak kararlı indirme
- 📱 **Responsive** - Tüm cihazlarda mükemmel görünüm

## Teknolojiler

**Frontend:**
- React + Vite
- Socket.io Client
- Axios

**Backend:**
- Node.js + Express
- Socket.io
- yt-dlp-exec
- ffmpeg-static

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

Bu komut otomatik olarak hem server hem de client bağımlılıklarını yükler.

### 2. Frontend'i Build Et

```bash
npm run build
```

### 3. Uygulamayı Başlat

```bash
npm start
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Deployment (Render, Railway, vb.)

### Environment Variables
Herhangi bir environment variable gerekmez, ancak PORT değişkeni otomatik algılanır.

### Build Komutları

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### Gereksinimler
- Node.js >= 16.0.0
- Hosting platformu otomatik olarak Python'u sağlamalı (yt-dlp için)

## Development

### Dev Server Başlatma

```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend (with hot reload)
cd client && npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

## Proje Yapısı

```
youtube_mp3_converter/
├── client/              # React Frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── vite.config.js
├── server/              # Express Backend
│   ├── index.js
│   └── temp/           # Geçici MP3 dosyaları
└── package.json        # Root orchestrator
```

## Lisans

MIT

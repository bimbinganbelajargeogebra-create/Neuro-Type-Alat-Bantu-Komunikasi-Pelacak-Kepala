# Panduan Deploy Neuro-Type ke Vercel

Neuro-Type dirancang 100% *client-side* (React + TypeScript + Vite) sehingga sangat cepat dan mudah di-deploy ke **Vercel** secara gratis.

---

### Cara 1: Deploy Otomatis via Dashboard Vercel (Paling Mudah)
1. Unggah kode proyek ini ke repositori **GitHub** Anda.
2. Buka [vercel.com](https://vercel.com) dan login/daftar.
3. Klik tombol **"Add New Project"** lalu pilih repositori GitHub Anda.
4. Vercel akan otomatis mendeteksi pengaturan berkat berkas `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **"Deploy"**. Dalam ±1 menit, situs Anda sudah aktif dengan URL HTTPS (misal `https://neuro-type.vercel.app`).
6. *Catatan*: Fitur webcam wajib berjalan di protokol **HTTPS** yang secara otomatis disediakan oleh Vercel.

---

### Cara 2: Deploy via Terminal (Vercel CLI)
Jika Anda memiliki Node.js di komputer:
```bash
# 1. Pasang Vercel CLI jika belum ada
npm install -g vercel

# 2. Jalankan perintah deploy di folder proyek
vercel

# 3. Untuk deploy langsung ke production:
vercel --prod
```

---

### Konfigurasi Penting yang Sudah Disediakan (`vercel.json`)
- **SPA Rewrites**: Memastikan routing halaman kembali ke `index.html`.
- **Permissions-Policy**: Mengizinkan akses kamera (`camera=(self)`) pada domain Vercel Anda.
- **Copyright**: © copyright Pak GuruAI.

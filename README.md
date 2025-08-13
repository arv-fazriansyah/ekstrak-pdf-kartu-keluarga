# Ekstraktor Data Kartu Keluarga

Aplikasi web untuk mengekstrak data secara otomatis dari file Kartu Keluarga (KK) Indonesia menggunakan Google Gemini. Cukup unggah file PDF atau ZIP yang berisi PDF, dan aplikasi akan mem-parsing data anak beserta data orang tua dan alamat, lalu menyajikannya dalam format tabel yang dapat diunduh sebagai file Excel.

## ✨ Fitur

- **Ekstraksi Data Otomatis**: Menggunakan AI (Gemini 2.5 Flash) untuk secara cerdas mengenali dan mengekstrak data dari dokumen Kartu Keluarga.
- **Upload Fleksibel**: Mendukung upload file PDF tunggal, beberapa file PDF, atau file ZIP yang berisi file PDF.
- **Tampilan Hasil Terstruktur**: Menampilkan data yang diekstrak dalam tabel yang jelas dan mudah dibaca.
- **Navigasi Mudah**: Jika beberapa file diunggah, hasil ditampilkan dalam tab terpisah untuk setiap file.
- **Unduh ke Excel**: Mengekspor semua data yang diekstrak ke dalam satu file Excel (.xlsx) dengan mudah.
- **Desain Responsif**: Tampilan antarmuka yang menyesuaikan dengan berbagai ukuran layar.

## 🚀 Teknologi yang Digunakan

- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **File Handling**: JSZip (untuk file .zip), SheetJS (untuk .xlsx)

## 🛠️ Panduan Instalasi & Setup Lokal

Untuk menjalankan aplikasi ini di komputer lokal Anda, ikuti langkah-langkah berikut:

**1. Prasyarat**
- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru direkomendasikan)
- [Git](https://git-scm.com/)

**2. Kloning Repository**
```bash
git clone https://github.com/arv-fazriansyah/ekstrak-pdf-kartu-keluarga.git
cd ekstrak-pdf-kartu-keluarga
```

**3. Instalasi Dependensi**
Jalankan perintah berikut untuk menginstal semua paket yang dibutuhkan:
```bash
npm install
```

**4. Konfigurasi Environment Variable**
Aplikasi ini membutuhkan API Key dari Google Gemini.

- Buat file baru di direktori utama proyek dengan nama `.env.local`.
- Buka file `.env.local` dan tambahkan baris berikut, ganti `'''YOUR_API_KEY'''` dengan API key Anda yang sebenarnya:
  ```
  GEMINI_API_KEY=YOUR_API_KEY
  ```
- Anda bisa mendapatkan API Key dari [Google AI Studio](https://aistudio.google.com/app/apikey).

**5. Jalankan Server Pengembangan**
Setelah semua langkah di atas selesai, jalankan server pengembangan lokal:
```bash
npm run dev
```
Aplikasi akan tersedia di `http://localhost:5173` (atau port lain jika 5173 sudah digunakan).

## 📖 Cara Penggunaan

1. **Buka Aplikasi**: Akses alamat URL yang diberikan oleh server pengembangan.
2. **Unggah File**: Klik pada area unggah untuk memilih file Kartu Keluarga (bisa berupa `.pdf` atau `.zip`). Anda bisa memilih satu atau beberapa file sekaligus.
3. **Mulai Ekstraksi**: Setelah file dipilih, klik tombol "Ekstrak Data".
4. **Lihat Hasil**: Tunggu proses ekstraksi selesai. Hasil akan ditampilkan dalam bentuk tabel. Jika Anda mengunggah beberapa file, Anda bisa berpindah antar hasil menggunakan tombol tab di atas tabel.
5. **Unduh Excel**: Klik tombol "Unduh Excel" untuk menyimpan semua data dari semua file yang berhasil diekstrak ke dalam satu file spreadsheet.

## 🚀 Deploy ke Cloudflare Pages

Aplikasi ini dapat dengan mudah di-deploy ke [Cloudflare Pages](https://pages.cloudflare.com/) untuk hosting gratis, cepat, dan global.

### Metode 1: Integrasi dengan Git (Disarankan)

Ini adalah cara terbaik untuk deploy secara otomatis setiap kali ada perubahan pada kode Anda.

1.  **Push Kode ke GitHub**: Pastikan semua kode terbaru Anda sudah ada di repository GitHub.
2.  **Buat Proyek di Cloudflare Pages**:
    - Login ke dashboard Cloudflare Anda.
    - Pergi ke `Workers & Pages` > `Create application` > `Pages` > `Connect to Git`.
    - Pilih repository GitHub Anda (`arv-fazriansyah/ekstrak-pdf-kartu-keluarga`).
3.  **Konfigurasi Build Settings**:
    - **Production branch**: `main`
    - **Framework preset**: `Vite`
    - **Build command**: `npm run build`
    - **Build output directory**: `dist`
4.  **Tambahkan Environment Variable**:
    - Pergi ke `Settings` > `Environment variables`.
    - Tambahkan variabel berikut:
      - **Variable name**: `GEMINI_API_KEY`
      - **Value**: Masukkan API Key Google Gemini Anda.
5.  **Save and Deploy**: Klik "Save and Deploy". Cloudflare akan secara otomatis membangun dan men-deploy aplikasi Anda.

### Metode 2: Deploy Manual dengan Wrangler CLI

Jika Anda ingin melakukan deploy langsung dari komputer Anda tanpa menghubungkan Git.

1.  **Build Aplikasi Secara Lokal**:
    ```bash
    npm run build
    ```
    Perintah ini akan membuat folder `dist` yang berisi semua file statis aplikasi Anda.

2.  **Deploy Menggunakan Wrangler**:
    - Pastikan Anda sudah login ke Wrangler (`npx wrangler login`).
    - Jalankan perintah berikut di terminal Anda:
    ```bash
    npx wrangler pages deploy dist
    ```
    Wrangler akan mengunggah folder `dist` dan memberikan Anda URL aplikasi yang sudah live. Jangan lupa untuk mengatur Environment Variable `GEMINI_API_KEY` di dashboard Cloudflare seperti yang dijelaskan di metode sebelumnya.

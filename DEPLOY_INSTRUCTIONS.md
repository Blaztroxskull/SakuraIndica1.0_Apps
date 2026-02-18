# Panduan Deployment ke Vercel

Aplikasi ini sudah dioptimalkan untuk di-deploy ke **Vercel** dengan konfigurasi yang benar. Ikuti langkah-langkah di bawah ini untuk mem-publish aplikasi Anda.

## Prasyarat
1. Akun [Vercel](https://vercel.com).
2. Repositori GitHub yang berisi kode aplikasi ini (seperti yang Anda miliki sekarang).

## Langkah Deployment

1. **Login ke Vercel:**
   Masuk ke dashboard Vercel Anda.

2. **Add New Project:**
   Klik tombol **Add New...** -> **Project**.

3. **Import Git Repository:**
   Pilih repositori `sakura-indica-app` (atau nama repositori Anda) dan klik **Import**.

4. **Konfigurasi Build (PENTING!):**
   Pada halaman "Configure Project":
   - **Framework Preset:** Pilih **Vite** (Vercel akan mendeteksinya secara otomatis, pastikan ini terpilih).
   - **Root Directory:** Biarkan default (`./`).
   - **Build Command:** Biarkan default (`vite build` atau `npm run build`).
   - **Output Directory:** Biarkan default (`dist`). **JANGAN** ubah ke `build` karena konfigurasi sudah disesuaikan kembali ke standar `dist`.

5. **Environment Variables (Wajib Diisi):**
   Agar aplikasi berfungsi penuh (Login, Database, Storage), Anda **harus** menambahkan Environment Variables sesuai konfigurasi Firebase Anda.

   Klik bagian **Environment Variables** dan tambahkan satu per satu:

   | Key | Value (Contoh) |
   | --- | --- |
   | `VITE_FIREBASE_API_KEY` | `AIzaSyD...` (Dari Firebase Console) |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `project-id.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | `project-id` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `project-id.appspot.com` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
   | `VITE_FIREBASE_APP_ID` | `1:123456789:web:abcdef` |
   | `VITE_APP_ID` | `my-community-app` (Opsional, default: default-rt-app) |

   > **Catatan:** Jika Anda belum memiliki nilai-nilai ini, Anda bisa men-deploy terlebih dahulu. Aplikasi akan tetap jalan namun akan muncul pesan "Konfigurasi Sistem Belum Lengkap" saat dibuka. Anda bisa menambahkan variabel ini nanti di menu **Settings -> Environment Variables** di dashboard proyek Vercel Anda.

6. **Deploy:**
   Klik tombol **Deploy**.

7. **Selesai!**
   Tunggu proses build selesai (biasanya kurang dari 1 menit). Jika berhasil, Anda akan melihat screenshot aplikasi Anda dan tombol **Visit**.

## Troubleshooting Umum

*   **Error 404 Not Found saat refresh halaman:**
    Masalah ini **sudah diperbaiki** dengan file `vercel.json` yang disertakan. Routing akan berjalan lancar.
*   **Halaman Putih (Blank Screen):**
    Biasanya karena Environment Variables belum diisi dengan benar. Cek console browser (F12) untuk melihat pesan error.
*   **Build Error:**
    Pastikan Anda tidak mengubah setting `Output Directory` di Vercel secara manual. Biarkan default (`dist`).

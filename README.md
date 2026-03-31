# Aplikasi Warga RT - Sakura Indica

Aplikasi layanan kemasyarakatan untuk warga RT Sakura Indica. Aplikasi ini dibangun menggunakan React dan Firebase.

## Fitur

*   **Dashboard:** Statistik warga dan lingkungan.
*   **Registrasi Warga:** Formulir pendaftaran warga baru.
*   **Layanan Surat:** Pengajuan surat pengantar dan dokumen lainnya.
*   **Informasi Warga:** Papan pengumuman digital.
*   **Forum Komunitas:** Ruang diskusi warga.
*   **Saluran Komunitas:** Info kegiatan (Karang Taruna, Posyandu, dll).
*   **Keamanan:** Tombol Panik (SOS) dan pantauan CCTV.
*   **Admin:** Pengelolaan konten dan pengaturan aplikasi.

## Persyaratan Sistem

*   Node.js (versi 16 atau lebih baru)
*   Akun Firebase (untuk database dan hosting)

## Instalasi dan Menjalankan Secara Lokal

1.  Clone repository ini (atau unduh).
2.  Masuk ke folder proyek.
3.  Instal dependensi:
    ```bash
    npm install
    ```
4.  Buat file `.env` di root folder dan isi konfigurasi Firebase Anda (lihat bagian Konfigurasi Firebase).
5.  Jalankan aplikasi:
    ```bash
    npm run dev
    ```

## Konfigurasi Firebase

Buat proyek di [Firebase Console](https://console.firebase.google.com/), aktifkan:
1.  **Authentication**:
    *   **Anonymous**: Aktifkan.
    *   **Email/Password**: Aktifkan.
2.  **Firestore Database**: Buat database.
3.  **Storage**: Buat bucket.

Salin konfigurasi Firebase Anda ke file `.env` (atau `.env.local`) dengan format berikut:

```env
VITE_FIREBASE_API_KEY=anda_api_key
VITE_FIREBASE_AUTH_DOMAIN=anda_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=anda_project_id
VITE_FIREBASE_STORAGE_BUCKET=anda_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=anda_sender_id
VITE_FIREBASE_APP_ID=anda_app_id
VITE_APP_ID=sakura-indica-rt01 (opsional, default: default-rt-app)
```

### Akun Admin

Untuk mengakses Mode Admin, Anda harus membuat pengguna di Firebase Console (Authentication > Users) dengan email dan password.
Contoh:
*   Email: `admin@sakuraindica.com`
*   Password: `PasswordRahasiaAnda`

Di aplikasi, Anda bisa login menggunakan email tersebut (atau username `admin` yang akan dipetakan ke `@sakuraindica.com`).

## Deployment

### Vercel

1.  Instal Vercel CLI atau hubungkan repository ke Vercel Dashboard.
2.  Pastikan `Environment Variables` di Vercel telah diisi sesuai dengan file `.env` Anda.
3.  Deploy.

### Firebase Hosting

1.  Instal Firebase CLI: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Inisialisasi: `firebase init` (pilih Hosting, gunakan folder `dist`).
4.  Build: `npm run build`
5.  Deploy: `firebase deploy`

## Struktur Proyek

*   `/src`: Kode sumber aplikasi.
*   `/src/components`: Komponen UI yang dapat digunakan kembali.
*   `/src/pages`: Halaman-halaman utama aplikasi.
*   `/src/lib`: Konfigurasi utilitas (Firebase).

---
Dibuat dengan ❤️ untuk Warga Sakura Indica.

# Product Requirements Document (PRD)
## Minimum Viable Product (MVP) - Employee Attendance System (Sistem Absensi Karyawan)

> **Catatan Dokumen**: File ini merupakan panduan spesifikasi bisnis dan teknis utama untuk sistem absensi. Jika ada perubahan aturan bisnis (misalnya jam kerja, radius lokasi, toleransi keterlambatan, atau penambahan data karyawan), perbarui file ini terlebih dahulu agar dokumentasi dan implementasi tetap selaras.

---

## 1. Ringkasan Eksekutif & Tujuan Proyek (Executive Summary)

### 1.1 Latar Belakang
Perusahaan membutuhkan sistem absensi mandiri yang cepat, terpercaya, dan ringan untuk mencatat kehadiran harian karyawan. Sistem ini menggantikan pencatatan manual dengan integrasi **Google Sheets** sebagai database spreadsheet yang transparan dan mudah diakses oleh pihak HR/Manajemen tanpa memerlukan instalasi database relasional yang rumit.

### 1.2 Tujuan MVP
1. Memungkinkan karyawan mencatat jam masuk (**Clock In**) tanpa foto selfie untuk kecepatan.
2. Memungkinkan karyawan mencatat jam pulang (**Clock Out**) disertai bukti foto selfie (**Photo Capture**) yang disimpan di **Cloudinary**.
3. Memastikan integrasi langsung dengan spreadsheet dua tab di Google Sheets (`Users` dan `Attendance`).
4. Menyediakan antarmuka pemantauan (**Monitoring**) dengan filter rentang tanggal (default 7 hari terakhir).
5. Mencegah duplikasi data: Karyawan hanya dapat melakukan 1x Clock In dan 1x Clock Out per hari (WIB).

---

## 2. Arsitektur & Tech Stack

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Framework** | Next.js (App Router, v14/v15) | Server-Side & Client Components, Route Handlers |
| **Bahasa** | TypeScript | Type safety & maintainability |
| **Styling** | Tailwind CSS | Modern, clean, dan responsif (Mobile & Desktop) |
| **Database** | Google Sheets API (v4) | Menggunakan Service Account JWT credentials |
| **Media Storage** | Cloudinary | CDN & cloud storage untuk foto selfie Clock Out |
| **Timezone** | Strict `Asia/Jakarta` (WIB) | Menggunakan `dayjs` dengan plugin UTC & Timezone |
| **Icons** | Lucide React | Ikon modern dan informatif |

---

## 3. Database Schema (Google Sheets)

Google Spreadsheet harus memiliki **2 Sheet (Tab)** dengan format kolom persis sebagai berikut:

### Sheet 1: `Attendance`
Digunakan untuk menyimpan riwayat absensi harian karyawan.

| Kolom | Nama Header | Tipe Data | Format / Contoh | Keterangan |
|---|---|---|---|---|
| **A** | `Date` | String (Date) | `YYYY-MM-DD` (contoh: `2026-09-22`) | Tanggal absensi (WIB) |
| **B** | `Name` | String | `Budi Santoso` | Nama lengkap karyawan |
| **C** | `ClockIn` | String (Time) | `HH:mm:ss` (contoh: `08:00:15`) | Waktu masuk (WIB) |
| **D** | `ClockOut` | String (Time) | `HH:mm:ss` (contoh: `17:05:40`) | Waktu pulang (WIB), kosong jika belum |
| **E** | `PhotoURL` | String (URL) | `https://res.cloudinary.com/...` | URL foto selfie bukti Clock Out |

*Row 1 berfungsi sebagai Header. Data dimulai dari Row 2.*

### Sheet 2: `Users`
Digunakan sebagai daftar referensi karyawan yang berhak melakukan absensi.

| Kolom | Nama Header | Tipe Data | Format / Contoh | Keterangan |
|---|---|---|---|---|
| **A** | `Name` | String | `Budi Santoso` | Nama lengkap karyawan |

*Row 1 berfungsi sebagai Header (`Name`). Nama karyawan dimulai dari Row 2.*

---

## 4. Standar Zona Waktu (Strict Timezone)
- **Timezone**: `Asia/Jakarta` (WIB / GMT+7).
- **Aturan**:
  - Semua pencatatan tanggal (`Date`) dan waktu (`ClockIn`, `ClockOut`) wajib dievaluasi berdasarkan zona waktu `Asia/Jakarta`, terlepas dari zona waktu server hosting (Vercel/AWS) maupun zona waktu lokal browser pengguna.
  - Tanggal hari ini dihitung per pukul 00:00:00 WIB hingga 23:59:59 WIB.

---

## 5. Spesifikasi Halaman Frontend (Frontend Routes)

### 5.1 `/` (Home / Landing Page)
- **Tampilan**: Halaman selamat datang dengan jam digital WIB real-time.
- **Komponen Utama**: Dua kartu besar yang menonjol dan responsif:
  1. **Mulai Absen** (Mengarahkan ke `/absen`): Kartu interaktif untuk karyawan melakukan presensi harian.
  2. **Monitoring Absensi** (Mengarahkan ke `/monitoring`): Kartu untuk manajer/karyawan melihat riwayat kehadiran.

### 5.2 `/absen` (Halaman Form Absensi)
- **Lifecycle & Data Fetching**:
  1. Saat halaman dimuat (*mount*), panggil endpoint `GET /api/users`.
  2. Tampilkan daftar nama ke dalam elemen dropdown `<select>` "Nama Karyawan". Nama tidak di-hardcode.
- **Logika Interaksi UX**:
  1. Saat nama dipilih dari dropdown, frontend secara otomatis memanggil `GET /api/attendance/status?name=[SelectedName]&date=[Today]`.
  2. Tampilkan status real-time untuk karyawan tersebut:
     - **Belum Absen Hari Ini**: Tombol "Clock In" aktif, tombol "Clock Out" disabled.
     - **Sudah Clock In**: Tombol "Clock In" disabled, tombol "Clock Out" aktif.
     - **Sudah Clock Out (Selesai)**: Tombol "Clock In" disabled, tombol "Clock Out" disabled.
  3. **Aksi Clock In**:
     - Mengirim request `POST /api/attendance/clock-in` dengan payload `{ name }`.
     - Menampilkan feedback loading dan notifikasi sukses.
  4. **Aksi Clock Out**:
     - Membuka modal/tampilan **Ambil Foto Selfie**.
     - Mendukung kamera langsung (webcam/kamera depan HP) serta fallback upload file gambar.
     - Foto otomatis dikompresi di sisi browser (*client-side canvas compression*) sebelum dikirim.
     - Mengirim request `POST /api/attendance/clock-out` dengan payload `{ name, imageBase64 }`.

### 5.3 `/monitoring` (Halaman Monitoring Absensi)
- **Filter**:
  - `startDate`: Input tanggal (default: 7 hari sebelum hari ini dalam WIB).
  - `endDate`: Input tanggal (default: hari ini dalam WIB).
  - Tombol **Refresh / Terapkan Filter**.
- **Ringkasan Metrik**:
  - Total Log Absensi pada rentang tanggal.
  - Total Sudah Selesai (Clock In & Clock Out).
  - Total Masih Aktif (Hanya Clock In).
- **Tabel Data**:
  - Kolom: `Tanggal`, `Nama Karyawan`, `Jam Masuk (Clock In)`, `Jam Keluar (Clock Out)`, `Bukti Foto`, `Status`.
  - Preview Foto: Thumbnail kecil yang jika diklik akan membuka modal foto resolusi penuh.
  - State kosong (*Empty state*) jika tidak ada data pada rentang tanggal tersebut.

---

## 6. Spesifikasi Backend & API Endpoints

Semua API mengembalikan respon JSON berstandar:
```json
{
  "success": true | false,
  "message": "Pesan deskriptif status atau error",
  "data": ...
}
```

### 6.1 `GET /api/users`
- **Fungsi**: Mengambil daftar nama karyawan dari sheet `Users`.
- **Logika**: Membaca kolom A sheet `Users` mulai dari baris 2 hingga akhir baris terisi.
- **Output**:
  ```json
  {
    "success": true,
    "message": "Berhasil mengambil daftar karyawan",
    "data": ["Budi Santoso", "Siti Aminah", "Rian Hidayat"]
  }
  ```

### 6.2 `GET /api/attendance`
- **Query Params**:
  - `startDate` (format: `YYYY-MM-DD`, wajib)
  - `endDate` (format: `YYYY-MM-DD`, wajib)
- **Logika**:
  - Membaca sheet `Attendance` kolom A sampai E.
  - Memfilter baris di mana `Date >= startDate` dan `Date <= endDate`.
- **Output**:
  ```json
  {
    "success": true,
    "message": "Berhasil memuat data absensi",
    "data": [
      {
        "date": "2026-09-22",
        "name": "Budi Santoso",
        "clockIn": "08:00:15",
        "clockOut": "17:01:20",
        "photoUrl": "https://res.cloudinary.com/.../photo.jpg"
      }
    ]
  }
  ```

### 6.3 `GET /api/attendance/status`
- **Query Params**:
  - `name` (string, wajib)
  - `date` (format: `YYYY-MM-DD`, wajib)
- **Logika**:
  - Mencari baris pada sheet `Attendance` yang memiliki tanggal dan nama yang sama (case-insensitive trim).
  - Jika tidak ditemukan: `hasClockedIn: false`, `hasClockedOut: false`.
  - Jika ditemukan: `hasClockedIn: true`.
  - Jika kolom D (`ClockOut`) terisi: `hasClockedOut: true`.
- **Output**:
  ```json
  {
    "success": true,
    "message": "Status absensi berhasil diperiksa",
    "data": {
      "hasClockedIn": true,
      "hasClockedOut": false,
      "clockInTime": "08:00:15",
      "clockOutTime": null
    }
  }
  ```

### 6.4 `POST /api/attendance/clock-in`
- **Request Body**:
  ```json
  {
    "name": "Budi Santoso"
  }
  ```
- **Logika**:
  - Ambil tanggal hari ini dalam format WIB (`YYYY-MM-DD`) dan waktu saat ini (`HH:mm:ss`).
  - Cek sheet `Attendance`. Jika sudah ada baris untuk nama tersebut di tanggal hari ini:
    - Kembalikan error `400`: `"Anda sudah melakukan Clock In hari ini"`.
  - Jika belum ada, lakukan penambahan baris baru (*append*):
    `[Date, Name, Time, "", ""]`
- **Output**:
  ```json
  {
    "success": true,
    "message": "Clock In berhasil dicatat pada 08:00:15 WIB"
  }
  ```

### 6.5 `POST /api/attendance/clock-out`
- **Request Body**:
  ```json
  {
    "name": "Budi Santoso",
    "imageBase64": "data:image/jpeg;base64,..."
  }
  ```
- **Logika**:
  1. Validasi input `name` dan `imageBase64`.
  2. Cari baris di sheet `Attendance` untuk nama tersebut pada tanggal hari ini (WIB).
  3. Jika baris tidak ditemukan:
     - Kembalikan error `400`: `"Anda belum Clock In hari ini"`.
  4. Jika baris ditemukan dan kolom D (`ClockOut`) sudah terisi:
     - Kembalikan error `400`: `"Anda sudah Clock Out hari ini"`.
  5. Unggah `imageBase64` ke Cloudinary dalam folder `attendance/`. Dapatkan `secure_url`.
  6. Perbarui baris yang ditemukan:
     - Kolom D: Waktu saat ini (`HH:mm:ss` WIB).
     - Kolom E: `secure_url` dari Cloudinary.
- **Output**:
  ```json
  {
    "success": true,
    "message": "Clock Out berhasil dicatat pada 17:02:10 WIB",
    "data": {
      "photoUrl": "https://res.cloudinary.com/..."
    }
  }
  ```

---

## 7. Batasan & Optimasi (Constraints & Optimizations)

1. **Batas Ukuran Payload Serverless (Vercel 4.5MB Limit)**:
   - Pengambilan gambar dari kamera ponsel dapat menghasilkan file 5MB - 12MB.
   - Frontend wajib melakukan resize (maksimal 1024x1024 px) dan kompresi JPEG (kualitas ~75%) menggunakan Canvas API sebelum dikonversi ke Base64.
   - Ukuran payload base64 dijamin berada di kisaran 100KB - 350KB.
2. **Penanganan Private Key Google Service Account**:
   - `GOOGLE_PRIVATE_KEY` yang berisi karakter `\n` harus diparsing secara aman (`key.replace(/\\n/g, '\n')`).
3. **Pesan Loading & Error State**:
   - Menampilkan spinner atau skeleton saat mengambil daftar pengguna, memeriksa status, mengunggah foto, dan memuat tabel riwayat.

---

## 8. Panduan Environment Variables

Buat file `.env.local` berdasarkan file `.env.example`:
```env
# Google Sheets API Service Account
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1A2B3C4D5E6F7G8H9I0JkLmNoPqRsTuVwXyZ

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz12345
```

---

## 9. Rencana Pembaruan Bisnis Masa Depan (Future Roadmap)

File ini dapat disesuaikan apabila bisnis menambahkan fitur:
- [ ] Validasi geolokasi GPS (Radius kantor / Geofencing).
- [ ] Penentuan status terlambat (*Late / On Time*) berdasarkan jam cut-off (misal 08:30 WIB).
- [ ] Fitur Pengajuan Izin / Cuti / Sakit.
- [ ] Export data monitoring ke file Excel (.xlsx) atau PDF report.

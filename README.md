# ✂️ Cukurin - Barber Queue Management System

**Cukurin** adalah aplikasi berbasis web yang dirancang untuk memudahkan pelanggan mengambil nomor antrean barbershop secara _online_. Pelanggan tidak perlu lagi membuang waktu menunggu di lokasi, cukup daftar dari mana saja, dan pantau status antrean secara _real-time_.

> **Tugas Besar Konstruksi Perangkat Lunak (KPL)**  
> Proyek ini dibangun untuk memenuhi spesifikasi Tugas Besar CLO2, dengan menerapkan praktik rekayasa perangkat lunak yang kokoh.

---

## 🚀 Fitur Utama

- **Booking Antrean Online:** Mengambil nomor antrean dengan validasi ketersediaan secara langsung.
- **Real-time Queue Status (Automata):** Melacak status antrean pengguna dari `Menunggu` ➔ `Sedang Cukur` ➔ `Selesai`.
- **Daftar Barbershop Terdekat:** Menampilkan barbershop yang tersedia beserta estimasi jarak dan harga (menggunakan konsep _Table-Driven_).
- **Dashboard Personal:** Tampilan antarmuka khusus pelanggan untuk memanajemen profil dan antrean aktif.

---

## 🛠️ Teknik Konstruksi Perangkat Lunak

Proyek ini tidak hanya berfokus pada UI/UX, tetapi juga menerapkan pilar-pilar penting dalam _Software Construction_:

1. **Defensive Programming / Design by Contract (DbC):**
   - Diterapkan secara ketat pada fitur _Booking Antrean_. Sistem memastikan validasi input pengguna (_Pre-condition_) dan menjamin kuota antrean serta _state_ antrean (_Post-condition_) tertangani dengan baik dan tidak menimbulkan _fatal error_.
2. **Automata (State Machine):**
   - Mengatur siklus hidup (lifecycle) dari sebuah antrean pengguna agar tidak terjadi loncatan status yang tidak logis.
3. **Unit Testing:**
   - Menyediakan pengujian otomatis (menggunakan _Jest / React Testing Library_) untuk memvalidasi logika pemesanan antrean dan _state management_.
4. **Code Reuse / Library:**
   - Membangun antarmuka dengan komponen-komponen React yang sangat _reusable_ (seperti `Navbar`, `Card`, `Hero`, `Button`).

---

## 💻 Teknologi yang Digunakan

- **Framework:** Next.js & React
- **Bahasa:** TypeScript (memanfaatkan _Parameterization / Generics_ untuk keamanan tipe data).
- **Styling:** Vanilla CSS dengan pendekatan CSS Modules & Flexbox/Grid modern (Desain bernuansa _Premium Glassmorphism_).
- **Version Control:** Git & GitHub

---

## ⚙️ Cara Menjalankan Aplikasi Lokal

Pastikan komputermu sudah terinstall **Node.js** dan **npm/yarn/pnpm**.

1. Kloning repository ini:
   ```bash
   git clone https://github.com/Kevin10306/Jatai-dan-kepin-coba.git
   ```
2. Masuk ke dalam folder proyek:
   ```bash
   cd barber-app
   ```
3. Install semua _dependencies_:
   ```bash
   npm install
   ```
4. Jalankan server lokal untuk mode pengembangan (development):
   ```bash
   npm run dev
   ```
5. Buka [http://localhost:3000](http://localhost:3000) di browser favoritmu untuk melihat hasilnya.

---

## 👥 Tim Pengembang

Aplikasi ini dibangun dengan kolaborasi oleh tim:

- **Jati**
- **Kevin Ferdinand**

_(Dibuat dengan semangat Vibe Coder 🔥)_

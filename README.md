# Panduan Lengkap Pembuatan Website Morain Studio

> Dokumentasi step-by-step dari konsep hingga siap digunakan

---

## Gambaran Teknologi (Stack)

### Frontend (Tampilan Website)
| Komponen | Teknologi | Fungsi |
|----------|-----------|--------|
| Framework | **React + Vite** | Membangun antarmuka yang cepat dan interaktif |
| Bahasa | **TypeScript** | JavaScript dengan pengecekan tipe untuk kode yang lebih aman |
| Styling | **TailwindCSS** | Styling cepat dengan utility classes |
| UI Components | **Shadcn/UI** | Komponen siap pakai (Button, Dialog, Calendar, dll) |

### Backend (Server & Logika)
| Komponen | Teknologi | Fungsi |
|----------|-----------|--------|
| Backend-as-a-Service | **Supabase** | Database, Auth, dan API dalam satu platform |
| Edge Functions | **Deno/TypeScript** | Logika server (pembayaran, webhook) |
| Database | **PostgreSQL** | Menyimpan data user, booking, pembayaran |

### Tabel Database Utama
```
profiles       → Data profil user (nama, WA, email, role)
bookings       → Data booking (kode, tanggal, jam, status, total)
```

### Hosting & Deployment
| Platform | Keunggulan |
|----------|------------|
| **Vercel** | Gratis, cepat, auto-deploy dari GitHub (tunggu aku fix semuanya baru tak deploy ke vercel |
| **Supabase** | Database & Auth sudah termasuk hosting |

### Library Penting
- **react-router-dom** → Navigasi antar halaman
- **date-fns** → Format tanggal Indonesia
- **lucide-react** → Ikon modern
- **zustand** → State management (login session)

---

## Tahap 1 — Perencanaan (Menggunakan ChatGPT)

### 1.1 Menentukan Tujuan Website
```
✅ Website untuk jasa foto studio dan photobox
✅ Target: pelanggan yang ingin booking sesi foto
✅ Fitur utama: Landing page + Booking online + Dashboard
```

### 1.2 Menentukan Section Landing Page
| Section | Isi |
|---------|-----|
| **Hero** | Tagline + CTA "Pesan Sekarang" |
| **Paket Studio** | Small, Medium, Large dengan harga |
| **Photobox** | 5 style tema (Cowboy, Retro, Cyberpunk, dll) |
| **Gallery** | Contoh hasil foto |
| **Testimoni** | Review dari pelanggan |
| **FAQ** | Pertanyaan umum |
| **Contact** | WhatsApp + Lokasi |

### 1.3 Menentukan Flow Booking
```
1️⃣ Pilih Jadwal (Tanggal + Jam)
     ↓
2️⃣ Pilih Paket/Style
     ↓
3️⃣ Isi Data Pemesan (Nama, WA, Email, Jumlah Orang)
     ↓
4️⃣ Pilih Metode Pembayaran (DP 50% / Full)
     ↓
5️⃣ Konfirmasi (Kode Booking + Redirect Pembayaran)
```

### 1.4 Aturan Bisnis
| Aturan | Detail |
|--------|--------|
| Jam operasional | 09:00 - 19:00 WITA |
| Booking minimal | H-1 (besok baru bisa booking) |
| Kapasitas studio | Small (3 orang), Medium (5), Large (8) |
| Durasi photobox | 15 menit per sesi |
| Pembayaran | DP 50% atau Full payment |
| Status booking | PENDING → DP/LUNAS → DONE/CANCELLED |

### 1.5 Desain & Branding
```
🎨 Warna utama: Sage Green (#849283)
🎨 Tone: Minimalis, warm, premium
🎨 Font: Modern sans-serif (Inter/Outfit)
🎨 Spacing: Luas, tidak padat
```

---

## Tahap 2 — Build Landing Page di Lovable

### 2.1 Cara Menulis Prompt
Contoh prompt untuk Lovable:
```
Buatkan landing page untuk "Morain Studio" dengan:
- Hero section dengan tagline "Abadikan Momen Berharga"
- Section paket studio (3 pilihan: Small, Medium, Large)
- Section photobox dengan 5 style tema
- Gallery dengan grid foto 6-8 gambar
- CTA floating WhatsApp
- Warna sage green (#849283), minimalis, premium
```

### 2.2 Komponen yang Dibuat
| Komponen | File |
|----------|------|
| Header/Navbar | `Header.tsx` |
| Hero Section | `HeroSection.tsx` |
| Studio Packages | `StudioPackages.tsx` |
| Photobox Section | `PhotoboxSection.tsx` |
| Gallery | `Gallery.tsx` |
| Footer | `Footer.tsx` |

### 2.3 Memastikan Konsistensi Desain
- **Warna**: Gunakan variabel CSS (`--primary: #849283`)
- **Font**: Import Google Fonts di `index.css`
- **Spacing**: Gunakan Tailwind (p-4, gap-6, dll)
- **Responsive**: Test di mobile, tablet, desktop

---

## Tahap 3 — Implementasi Booking Flow

### 3.1 Membuat Modal Booking
```
📦 BookingModal.tsx (Studio)
📦 PhotoboxBookingModal.tsx (Photobox)

Bentuk: Floating window yang muncul saat klik "Pesan"
```

### 3.2 Membuat Kalender Ketersediaan
| Logika | Penjelasan |
|--------|------------|
| `fromDate` | Minimal H-1 (besok) |
| `toDate` | Maksimal 2 bulan ke depan |
| `disabled` | Tanggal yang sudah lewat |
| Outside days | Warna berbeda (abu-abu) |

### 3.3 Pemilihan Jam Real-Time
```javascript
// Contoh logika slot waktu
- Jam yang sudah lewat → Disabled
- Jam yang sudah dibooking → Disabled (cek dari database)
- Jam tersedia → Bisa diklik
```

### 3.4 Stepper Progress
```
[1]──────[2]──────[3]──────[4]──────[5]
Jadwal   Paket    Data    Bayar   Konfirmasi
```

### 3.5 Generate Booking Code
```
Format: MOR-2025-XXXX (Studio)
        PBX-2025-XXXX (Photobox)
```

---

## Tahap 4 — Authentication & User Dashboard

### 4.1 Wajib Login Sebelum Booking
```
Saat klik "Pesan" tanpa login:
→ Muncul AuthModal (Login/Register)
→ Setelah login, lanjut ke booking
```

### 4.2 Metode Login
| Metode | Implementasi |
|--------|--------------|
| Email/Password | Supabase Auth (native) |
| Google Sign-In | Supabase OAuth (masih tahap sambungin ke web) |

### 4.3 Auto-Fill Data dari Profil
```
Saat user sudah pernah isi profil:
- Nama otomatis terisi
- WhatsApp otomatis terisi
- Email otomatis terisi
```

### 4.4 Struktur Dashboard User
| Route | Isi |
|-------|-----|
| `/dashboard` | Overview (statistik booking) |
| Riwayat Booking | Daftar booking + status + invoice |
| Pengaturan | Edit profil (nama, WA, email) |

---

## Tahap 5 — Database & Backend (Supabase)

### 5.1 Membuat Project Supabase
1. Buka [supabase.com](https://supabase.com)
2. Klik "New Project"
3. Pilih region terdekat (Singapore)
4. Copy URL dan Anon Key ke file `.env`

### 5.2 Struktur Tabel

**Tabel `profiles`**
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key (sama dengan auth.users.id) |
| full_name | TEXT | Nama lengkap |
| email | TEXT | Email |
| whatsapp | TEXT | Nomor WA |
| role | TEXT | 'user' atau 'admin' |

**Tabel `bookings`**
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key ke profiles |
| booking_code | TEXT | MOR-2025-XXXX |
| service_type | TEXT | 'studio' atau 'photobox' |
| booking_date | DATE | Tanggal booking |
| start_time | TIME | Jam mulai |
| end_time | TIME | Jam selesai |
| payment_status | TEXT | PENDING/DP/LUNAS/EXPIRED/CANCELLED |
| booking_status | TEXT | PENDING/ACTIVE/DONE/CANCELLED |
| total_amount | INTEGER | Total harga |
| expires_at | TIMESTAMP | Batas waktu bayar |

### 5.3 RLS Policy (Row Level Security)
```sql
-- User hanya bisa lihat booking sendiri
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

-- Admin bisa lihat semua
CREATE POLICY "Admin can view all"
ON bookings FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'admin'
));
```

### 5.4 Trigger Auto-Create Profile
```sql
-- Saat user register, otomatis buat profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Tahap 6 — Admin Dashboard

### 6.1 Akun Khusus Admin
```
Role "admin" diset manual di tabel profiles
Contoh: UPDATE profiles SET role = 'admin' WHERE email = 'admin@morain.com';
```

### 6.2 Fitur Admin Dashboard
| Fitur | Fungsi |
|-------|--------|
| Daftar Booking | Lihat semua booking |
| Filter | By status, tanggal, layanan |
| Update Status | Ubah PENDING → LUNAS |
| Kalender | Lihat jadwal harian |
| Daftar User | Lihat semua pengguna |

### 6.3 Akses Halaman
```
Route: /admin
Proteksi: Redirect ke home jika bukan admin
```

---

## Tahap 7 — Pembayaran (Konsep)

### 7.1 Opsi Pembayaran
| Opsi | Persentase |
|------|------------|
| DP (Down Payment) | 50% dari total |
| Full Payment | 100% |

### 7.2 Alur Status Pembayaran
```
PENDING (belum bayar)
   ↓
[Bayar DP] → DP (sudah bayar 50%)
   ↓
[Lunasi di lokasi] → LUNAS
   ↓
[Sesi selesai] → DONE

--- Alternatif ---
PENDING → EXPIRED (timeout)
PENDING → CANCELLED (dibatalkan user)
```

### 7.3 On-Demand Expiry
```
Setiap booking PENDING punya countdown 15 menit
Jika tidak bayar dalam waktu tersebut → EXPIRED
Slot kembali tersedia untuk user lain
```

### 7.4 Invoice
- Bisa dilihat di Dashboard
- Bisa di-print/download
- Format: Kode booking, tanggal, paket, total, status

### 7.5 Roadmap (Jika Belum Ada Payment Gateway)
```
🔜 Integrasi Midtrans untuk:
   - Virtual Account (BCA, BNI, Mandiri)
   - E-Wallet (GoPay, Dana, OVO)
   - QRIS
```

---

## Tahap 8 — Testing & Deployment

### 8.1 Testing Double Booking
```
✅ Gunakan unique constraint di database:
   UNIQUE(service_type, package_name, booking_date, start_time)
✅ Cek slot sebelum insert
```

### 8.2 Testing Timezone (WITA)
```
✅ Semua waktu ditampilkan dalam WITA
✅ Gunakan: new Date().toLocaleString('en-US', { timeZone: 'Asia/Makassar' })
✅ Pastikan tanggal tidak mundur 1 hari saat simpan
```

### 8.3 Testing Mobile Responsiveness
```
✅ Test di Chrome DevTools (iPhone, Android)
✅ Modal tidak terpotong
✅ Button bisa diklik di mobile
✅ Teks tidak terlalu kecil
```

### 8.4 Deploy ke Vercel
1. Push kode ke GitHub
2. Connect repo ke Vercel
3. Set Environment Variables:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxxx
   ```
4. Deploy! (ini cek situasi nanti untuk deploy nya)

---

## Checklist Akhir (Supaya Siap Dipakai)

### ✅ UI/UX
- [ ] Semua halaman responsive (mobile, tablet, desktop)
- [ ] Loading state ada di semua aksi
- [ ] Error message jelas dan dalam Bahasa Indonesia
- [ ] Warna konsisten dengan branding

### ✅ Booking Logic
- [ ] Tidak bisa double booking
- [ ] Jam yang lewat otomatis disabled
- [ ] Countdown payment berjalan
- [ ] Booking expired otomatis update status

### ✅ RLS (Row Level Security)
- [ ] User hanya bisa akses data sendiri
- [ ] Admin bisa akses semua
- [ ] Tidak ada data bocor ke user lain

### ✅ Admin Tools
- [ ] Bisa lihat semua booking
- [ ] Bisa update status pembayaran
- [ ] Bisa lihat kalender
- [ ] Bisa lihat daftar user

### ✅ Error Handling
- [ ] Network error ditangani
- [ ] Form validation lengkap
- [ ] Session expired redirect ke login

### ✅ Monitoring (Minimal)
- [ ] Console.error untuk debugging
- [ ] Toast notification untuk feedback user
- [ ] Supabase Dashboard untuk monitoring database

---

## Ringkasan Tools yang Digunakan

| Tahap | Tool | Fungsi |
|-------|------|--------|
| Perencanaan | ChatGPT | Prompt, UX flow, copywriting |
| Landing Page | Lovable | Generate komponen awal |
| Development | Antigravity | Edit kode, fitur, bug fix |
| Backend | Supabase | Database, Auth, Edge Functions |
| Hosting | Vercel | Deploy website ke publik |

---

> **Catatan**: Dokumen ini adalah gambaran umum. Detail implementasi ada di kode sumber masing-masing file.

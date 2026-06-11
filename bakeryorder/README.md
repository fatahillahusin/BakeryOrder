# 🍞 BakeryOrder — Aplikasi Pemesanan Cafe Digital

Aplikasi fullstack pemesanan makanan dan minuman cafe berbasis web.

---

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js + Express.js
- **Database:** MySQL

---

## 📁 Struktur Proyek

```
bakeryorder/
├── frontend/
│   ├── index.html          ← Halaman utama (SPA)
│   ├── css/style.css       ← Stylesheet lengkap
│   └── js/app.js           ← Logic frontend
├── backend/
│   ├── server.js           ← Entry point Express
│   ├── .env.example        ← Template environment
│   ├── package.json
│   ├── models/
│   │   └── db.js           ← Koneksi MySQL
│   ├── middleware/
│   │   └── auth.js         ← JWT Authentication
│   └── routes/
│       ├── auth.js         ← Login API
│       ├── menu.js         ← Menu CRUD API
│       └── orders.js       ← Orders API
└── database/
    └── schema.sql          ← Schema + Seed data
```

---

## 🚀 Cara Instalasi & Menjalankan

### 1. Siapkan Database MySQL

```bash
# Buka MySQL CLI atau HeidiSQL / phpMyAdmin
mysql -u root -p

# Jalankan schema
source /path/to/bakeryorder/database/schema.sql
```

### 2. Setup Backend

```bash
cd bakeryorder/backend

# Install dependencies
npm install

# Copy file environment
cp .env.example .env

# Edit .env sesuai konfigurasi database Anda
nano .env
```

### 3. Konfigurasi .env

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=bakeryorder
JWT_SECRET=ganti_dengan_string_acak_panjang
```

### 4. Jalankan Server

```bash
# Development (dengan auto-reload)
npm run dev

# Production
npm start
```

### 5. Buka Aplikasi

Buka browser dan akses: **http://localhost:3000**

---

## 👤 Akun Default

| Role  | Username | Password |
|-------|----------|----------|
| Admin | admin    | admin123 |
| Kasir | kasir1   | kasir123 |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint          | Deskripsi    | Akses  |
|--------|-------------------|--------------|--------|
| POST   | /api/auth/login   | Login        | Public |

### Menu
| Method | Endpoint          | Deskripsi           | Akses  |
|--------|-------------------|---------------------|--------|
| GET    | /api/menu         | Daftar menu         | Public |
| GET    | /api/menu/categories | Daftar kategori  | Public |
| GET    | /api/menu/:id     | Detail menu         | Public |
| POST   | /api/menu         | Tambah menu         | Admin  |
| PUT    | /api/menu/:id     | Edit menu           | Admin  |
| DELETE | /api/menu/:id     | Hapus menu          | Admin  |

### Orders
| Method | Endpoint                    | Deskripsi             | Akses       |
|--------|-----------------------------|-----------------------|-------------|
| POST   | /api/orders                 | Buat pesanan          | Public      |
| GET    | /api/orders                 | Daftar pesanan        | Staff       |
| GET    | /api/orders/stats/today     | Statistik hari ini    | Admin/Kasir |
| GET    | /api/orders/:id             | Detail pesanan        | Staff       |
| PATCH  | /api/orders/:id/status      | Update status         | Staff       |
| PATCH  | /api/orders/:id/payment     | Konfirmasi bayar      | Kasir/Admin |

---

## 🎯 Fitur Lengkap

### Untuk Pelanggan:
- ✅ Melihat daftar menu roti, kue, dan minuman
- ✅ Filter menu per kategori
- ✅ Tambah ke keranjang belanja
- ✅ Atur jumlah item di keranjang
- ✅ Hitung total harga otomatis
- ✅ Isi data pesanan (nama, meja, metode bayar)
- ✅ Kirim pesanan dan dapat nomor order

### Untuk Kasir:
- ✅ Login dengan akun kasir
- ✅ Dashboard statistik real-time
- ✅ Lihat semua pesanan
- ✅ Filter pesanan berdasarkan status
- ✅ Konfirmasi pesanan
- ✅ Update status pesanan (Konfirmasi → Proses → Siap → Selesai)
- ✅ Konfirmasi pembayaran
- ✅ Lihat detail pesanan

### Untuk Admin:
- ✅ Semua akses kasir
- ✅ Tambah menu baru
- ✅ Edit data menu
- ✅ Hapus menu
- ✅ Atur ketersediaan menu

---

## 📌 Catatan Pengembangan Lanjutan

1. **Keamanan:** Hash password dengan bcrypt (sudah disediakan) dan ganti JWT_SECRET
2. **Upload Gambar:** Integrasikan Multer + Cloudinary untuk upload foto produk
3. **Real-time:** Tambahkan Socket.io agar dapur menerima notifikasi otomatis
4. **Print:** Tambahkan fitur cetak struk/nota
5. **Laporan:** Buat halaman laporan penjualan harian/bulanan

---

## 📝 Lisensi

MIT — Dibuat untuk keperluan tugas/proyek BakeryOrder Cafe 🍞

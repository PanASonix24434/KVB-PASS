# Panduan Demo Sistem KV Pass

## Langkah 1: Setup Database

1. Buka Supabase SQL Editor: https://supabase.com/dashboard/project/dnnwtbmgspvlkejupotp/sql
2. Salin dan tampal semua kandungan dari fail `demo_data.sql`
3. Klik **Run** untuk menjalankan SQL

## Langkah 2: Login untuk Demo

### Sebagai Pelajar:
- **IC Number:** `060501110209`
- **Password:** `123456`
- **Nama:** Pelajar 1
- **Akan nampak:** Permohonan pending dan approved

### Sebagai Pelajar 2:
- **IC Number:** `060614110373`
- **Password:** `123456`
- **Nama:** Pelajar 2
- **Akan nampak:** Permohonan approved dengan Digital Pass

### Sebagai Pelajar 3:
- **IC Number:** `050123110456`
- **Password:** `123456`
- **Nama:** Ahmad bin Abdullah
- **Akan nampak:** Permohonan baru pending

### Sebagai Staff HEP:
- **IC Number:** `012345678910`
- **Password:** `123456`
- **Nama:** Tuan Rahimi
- **Akan nampak:** Senarai permohonan untuk diluluskan/tolak

### Sebagai Warden:
- **IC Number:** `012345678911`
- **Password:** `123456`
- **Nama:** Tuan Shah
- **Akan nampak:** Senarai permohonan untuk diluluskan/tolak

### Sebagai Security:
- **IC Number:** `012345678912`
- **Password:** `123456`
- **Nama:** Pengawal Keselamatan
- **Akan nampak:** Log keluar/masuk pelajar

### Sebagai Admin:
- **IC Number:** `061221110051`
- **Password:** `123456`
- **Nama:** Encik Muhammad Ihsan
- **Akan nampak:** Dashboard admin dengan semua statistik

## Data Demo yang Tersedia

### Permohonan (Applications):
1. **Pending** - Pelajar 1 (baru dihantar, menunggu kelulusan)
2. **Approved** - Pelajar 2 (diluluskan oleh HEP, ada Digital Pass)
3. **Rejected** - Pelajar 1 (ditolak oleh Warden)
4. **Pending** - Ahmad (baru dihantar untuk rawatan)
5. **Approved** - Pelajar 2 (diluluskan, sudah keluar)

### Security Logs:
- Log keluar untuk Pelajar 2 (permohonan approved)

### Announcements:
- 4 pengumuman dengan pelbagai jenis (info, warning, urgent, success)

## Senario Demo yang Boleh Ditunjukkan

### 1. Demo Pelajar:
- ✅ Lihat permohonan sendiri
- ✅ Hantar permohonan baru
- ✅ Lihat status permohonan (pending/approved/rejected)
- ✅ Lihat Digital Pass jika approved
- ✅ Lihat pengumuman

### 2. Demo Staff (HEP/Warden):
- ✅ Lihat senarai semua permohonan
- ✅ Approve permohonan
- ✅ Reject permohonan dengan komen
- ✅ Lihat statistik
- ✅ Buat pengumuman

### 3. Demo Security:
- ✅ Lihat log keluar/masuk pelajar
- ✅ Log keluar pelajar (dengan Digital Pass)
- ✅ Log masuk pelajar

### 4. Demo Admin:
- ✅ Lihat semua statistik
- ✅ Urus pengguna
- ✅ Lihat semua permohonan
- ✅ Urus pengumuman

## Nota Penting

- Semua password adalah `123456` untuk kemudahan demo
- Data demo akan kekal di database sehingga anda padam
- Untuk reset data, jalankan `database_setup_fresh.sql` dan kemudian `demo_data.sql` semula

## Tips Demo

1. **Mula dengan Pelajar** - Tunjukkan cara hantar permohonan
2. **Tukar ke HEP** - Tunjukkan approve permohonan
3. **Tukar ke Security** - Tunjukkan log keluar pelajar
4. **Tukar ke Admin** - Tunjukkan dashboard dan statistik

Selamat demo! 🎉

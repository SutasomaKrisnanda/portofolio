Pembaruan situs web portofolio personal standar produksi untuk memulihkan aset visual lama, menyempurnakan interaksi tata letak hero-section dan model 3D dengan fisika kursor, serta merombak UI/UX dan konten teks di seluruh komponen portofolio.

Integrity mode: development

## Verification Resources
- Build check: `npm run build`
- Linter check: `npm run lint`
- Browser runtime check: Verifikasi interaktif di browser untuk rotasi fisika model 3D, responsivitas hero-section, ketiadaan modal klik pada model 3D, dan ketiadaan error runtime di konsol pengembang.

## Requirements

### R1. Pemulihan Model 3D Hero-Section & Glyphs Mode Tech
Kembalikan bentuk geometri lama yang pertama kali digunakan di `src/components/geometric-glyphs.tsx` untuk mode tech. Gunakan kembali model 3D Jantung (dengan animasi berdetak) dan Pena (dengan animasi melayang) seperti sebelumnya. Letakkan model 3D di direktori `public/` agar tidak diikutkan dalam bundle build dan mematuhi batasan GitHub Pages. Hilangkan event listener klik pada model 3D yang memunculkan modal project.

### R2. Penyesuaian Tata Letak Hero-Section & Ukuran Model 3D
Sesuaikan ukuran model 3D dan tata letak hero-section agar tidak mendorong bar "Explore work" dan elemen navigasi di bawahnya turun melebihi batas pandang layar. Pastikan seluruh elemen hero-section dapat tampil proporsional pada viewport desktop dan mobile.

### R3. Interaksi Fisika Kursor & Drag pada Model 3D
Buat model 3D mengikuti posisi kursor di layar (berputar halus dan mengarahkan posisinya berdasarkan posisi kursor saat ini tanpa berpindah tempat). Model dapat di-drag secara manual untuk diputar. Model tidak berputar otomatis jika kursor tidak bergerak atau saat model tidak sedang digerakkan oleh kursor. Terapkan hukum fisika (akselerasi dan inersia) sehingga saat drag dilepas gerakan melambat secara alami dan tidak langsung ter-reset mendadak.

### R4. Perombakan UI/UX Mengacu pada Skill Refactoring UI
Berikan ide dan terapkan perbaikan UI/UX pada penyajian model 3D serta kartu/komponen project yang di-highlight mengacu pada prinsip-prinsip di `.agents/skill/refactoring-ui/SKILL.md`. Periksa setiap detail komponen di seluruh halaman portofolio dan rombak agar tampilannya tampak profesional, bersih, dan tidak amatir (memperbaiki hirarki visual, spacing, kontras warna, tipografi, dan alignment).

### R5. Audit dan Penyelarasan Teks & Substansi Konten
Periksa setiap teks dan substansi konten di seluruh komponen portofolio. Pastikan representasi informasi tepat, jelas, profesional, dan akurat mencerminkan maksud yang diinginkan.

## Acceptance Criteria

### Model 3D & Glyphs Geometri
- [ ] Bentuk geometri lama pada `src/components/geometric-glyphs.tsx` kembali aktif untuk mode tech.
- [ ] Model 3D Jantung (berdetak) dan Pena (melayang) berhasil dimuat dari direktori `public/`.
- [ ] Build proyek tidak menyertakan aset 3D besar di dalam bundle dan mematuhi aturan GitHub Pages.
- [ ] Mengklik model 3D tidak lagi membuka modal project.

### Tata Letak Hero-Section
- [ ] Ukuran model 3D proporsional dan tidak mendorong bar "Explore work" atau elemen di bawahnya turun ke bawah secara berlebihan.
- [ ] Hero-section tampil rapi dan proporsional pada viewport desktop dan mobile.

### Interaksi Fisika & Kursor
- [ ] Model 3D berputar halus dan mengarahkan sudutnya mengikuti pergerakan posisi kursor di layar.
- [ ] Model 3D dapat di-drag untuk diputar bebas oleh pengguna.
- [ ] Model 3D tidak berotasi konstan saat kursor diam atau ketika tidak sedang digerakkan.
- [ ] Rotasi melambat secara mulus menggunakan inersia fisika saat mouse drag dilepas tanpa reset posisi secara instan.

### UI/UX Refactoring (Refactoring UI)
- [ ] Penyajian komponen project yang di-highlight memiliki hierarki visual yang jelas dan tata letak yang menarik sesuai `.agents/skill/refactoring-ui/SKILL.md`.
- [ ] Seluruh komponen portofolio memiliki spacing, tipografi, dan kontras warna yang konsisten serta bebas dari tampilan amatir.

### Audit Teks & Konten
- [ ] Seluruh teks dan deskripsi di portofolio tepat, konsisten, dan merepresentasikan informasi yang dimaksud.

### Verifikasi & Integritas Kode
- [ ] Perintah `npm run build` berhasil tanpa error kompilasi atau type error.
- [ ] Perintah `npm run lint` lolos tanpa error linting.
- [ ] Tidak ada runtime console error saat memuat halaman dan berinteraksi dengan model 3D maupun komponen lainnya.

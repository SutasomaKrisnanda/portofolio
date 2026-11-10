# Dispatch Log

## 2026-11-05T10:56:20Z
Sender: fe2b4cf8-ea32-4c5f-8543-6f1a095f8df6
Priority: MESSAGE_PRIORITY_HIGH

Peningkatan hero-section dan penyempurnaan UI/UX untuk showcase portofolio personal lintas mode (Tech, Academic, Medical).

Integrity mode: development

## Verification Resources
- Build check: `npm run build`
- Linter: `npm run lint`
- Visual target references: `mode-tech-dark.png`, `mode-academic-dark.png`, `mode-medical-dark.png`
- Asset paths: `src/assets/image/*.avif`, `src/assets/models/*.glb`, `src/assets/icons/*.svg`

## Requirements

### R1. Peningkatan Visual Hero-Section per Mode
Tingkatkan tampilan visual hero-section pada setiap mode (Tech, Academic, dan Medical) mengacu pada gambar referensi (`mode-tech-dark.png`, `mode-academic-dark.png`, dan `mode-medical-dark.png`) menggunakan aset background yang tersedia di `src/assets/image/*.avif` untuk mode terang (light) dan mode gelap (dark).

### R2. Integrasi Model 3D untuk Mode Medical dan Academic
Gantikan tampilan 3D polyhedron default pada mode Medical dan Academic dengan model 3D khusus dari `src/assets/models/*.glb`, yaitu `model-jantung.glb` untuk mode Medical dan `model-quill.glb` untuk mode Academic, sehingga model 3D sesuai dengan tema masing-masing mode.

### R3. Logo Icon Project Dinamis Sesuai Mode Aktif
Ganti semua logo icon dari masing-masing project menggunakan aset icon SVG dari `src/assets/icons/*.svg` agar sesuai dengan mode yang tengah aktif. Untuk project yang memiliki dua atau lebih label mode, icon yang ditampilkan harus tetap berubah secara dinamis mengikuti mode yang sedang aktif saat ini.

### R4. Perombakan Navigasi Highlight Project dari Dataset JSON
Gantikan opsi tombol statis '1, 2, 3, 4' pada hero-section dengan kontrol navigasi dinamis (seperti tab, ringkasan nama project, atau indikator dinamis) yang jumlahnya menyesuaikan secara otomatis dengan project yang di-highlight. Data project yang di-highlight harus diambil secara dinamis dari dataset JSON yang ada dengan memfilter project yang memiliki penanda featured/highlight sesuai mode yang aktif, bukan bersifat static.

### R5. Perbaikan dan Integrasi Modal Highlight Project
Perbaiki modal detail highlight project di hero-section: posisikan judul pada tempatnya, pastikan scrollbar tidak keluar dari batas desain kontainer, jadikan tata letak sepenuhnya responsif di semua ukuran layar, dan cegah teks saling bertumpuk. Integrasikan modal dengan hero-section sehingga pengguna dapat membuka modal secara jelas dan intuitif melalui klik langsung pada kartu/slide project yang aktif atau tombol aksi detail pada slide tersebut.

### R6. Animasi, Interaksi Block, dan Tooltip
Berikan animasi transisi dan interaktivitas visual yang halus pada setiap block di setiap slide hero-section, serta sertakan tooltip informatif pada setiap button interaktif.

## Acceptance Criteria

### Visual & Model 3D
- [ ] Background hero section menampilkan aset `.avif` yang sesuai dari `src/assets/image/` untuk masing-masing mode (Tech, Academic, Medical) baik pada tema terang maupun gelap.
- [ ] Mode Medical menampilkan model 3D `model-jantung.glb` dan mode Academic menampilkan model 3D `model-quill.glb` dari `src/assets/models/`, tanpa lagi menampilkan polyhedron default.
- [ ] Setiap project menampilkan logo icon SVG dari `src/assets/icons/` yang berubah sesuai mode yang sedang aktif, termasuk pada project multi-mode.

### Navigasi & Data JSON
- [ ] Opsi tombol statis '1, 2, 3, 4' di hero-section dihapus dan digantikan oleh kontrol/indikator navigasi dinamis yang jumlahnya tepat sesuai jumlah item project yang di-highlight.
- [ ] Daftar project yang di-highlight diambil secara dinamis dari dataset JSON berdasarkan filter featured/highlight untuk mode yang aktif.

### Modal Highlight & Responsivitas
- [ ] Modal highlight project dapat dibuka langsung dengan mengklik slide/kartu project yang aktif atau tombol aksi 'Lihat Detail' / 'Explore' pada slide tersebut.
- [ ] Pada modal, judul berada pada posisinya, tidak ada teks yang tumpang-tindih, scrollbar tetap berada di dalam kontainer modal, dan layout tetap rapi pada breakpoint mobile, tablet, maupun desktop.

### Animasi & Tooltip
- [ ] Setiap block pada slide hero memiliki animasi transisi dan respons interaksi visual saat pergantian slide atau navigasi.
- [ ] Setiap tombol interaktif pada hero-section menampilkan tooltip saat di-hover maupun saat menerima fokus keyboard.

### Verifikasi & Integritas Proyek
- [ ] `npm run build` berhasil tanpa error kompilasi atau type error TypeScript.
- [ ] `npm run lint` lolos tanpa error linting yang menghalangi build.
- [ ] Tampilan visual dan interaktivitas pada hero-section, pergantian mode, navigasi slide, dan modal berjalan lancar di browser tanpa console error runtime.


## 2026-11-05T14:11:25Z
Sender: fe2b4cf8-ea32-4c5f-8543-6f1a095f8df6
Priority: MESSAGE_PRIORITY_HIGH

Sentinel heartbeat nudge: progress.md has not been updated in >20 minutes (last visit: 13:43:00Z). Please report your current status, subagent health, and progress on Milestone 1 Iteration 2 gate verification.


## 2026-11-07T23:50:05Z
Sender: 4c587253-b466-42bd-8e98-09a2e8a408db
Priority: MESSAGE_PRIORITY_HIGH

Optimasi performa dan pembaruan UI/UX portofolio personal untuk GitHub Pages, mencakup pembuatan ulang model 3D hero-section versi ringan (Polyhedron, Helix DNA, Pena Bulu), peringkasan category pill pada galeri, penerapan sistem Smart Bento Grid yang adaptif di bagian Tentang Saya, serta penyesuaian icon proyek sesuai mode aktif.

Integrity mode: development

## Verification Resources
- Build check: `npm run build`
- Linter check: `npm run lint`
- Browser runtime & visual check: Pengujian fungsionalitas dan responsivitas UI di browser (mobile & desktop) tanpa error konsol runtime.

## Requirements

### R1. Model 3D Hero-Section Ringan per Mode
Buat ulang model 3D di hero-section dengan versi yang sangat sederhana dan ringan agar dapat dimuat dengan cepat dan berjalan lancar di GitHub Pages tanpa memberatkan performa rendering. Model yang ditampilkan harus sesuai dengan tema mode:
- Tech mode: Polyhedron
- Medical mode: Helix DNA
- Academic mode: Pena Bulu
Pendekatan implementasi teknis diserahkan kepada tim untuk memilih solusi teringan dan paling optimal.

### R2. Peringkasan Category Pill Galeri
Peringkas tampilan category pill pada galeri projek dan prestasi, terutama pada tampilan mobile agar tidak memakan terlalu banyak ruang vertikal dan tetap rapi, serta terapkan mekanisme yang serasi dan nyaman digunakan pada tampilan desktop. Desain dan interaksi spesifik diserahkan kepada tim untuk merancang solusi yang paling ringkas dan intuitif.

### R3. Sistem Smart Bento Grid Adaptif pada Bagian Tentang Saya
Kembangkan sistem Bento Grid Pintar yang dapat menyesuaikan tata letaknya secara adaptif pada bagian Tentang Saya. Sistem harus mencegah grid terlihat timpang sebelah saat konten riwayat (pengalaman organisasi, kepanitiaan, dan pendidikan formal) bertambah panjang. Mekanisme adaptif diserahkan kepada tim untuk menentukan pendekatan terbaik.

### R4. Penyesuaian Logo Icon Proyek Berdasarkan Mode Aktif
Ganti logo icon project pada galeri project menggunakan icon yang sudah ada sesuai dengan mode labelnya. Apabila suatu project memiliki lebih dari satu mode label, tampilkan icon yang sesuai dengan mode yang sedang aktif saat ini. Jika project tidak memiliki label mode aktif, tim dapat menerapkan penanganan fallback yang konsisten.

## Acceptance Criteria

### Model 3D Hero-Section
- [ ] Hero-section menampilkan model 3D yang sangat ringan tanpa lag saat dimuat di GitHub Pages.
- [ ] Mode Tech menampilkan model 3D Polyhedron.
- [ ] Mode Medical menampilkan model 3D Helix DNA.
- [ ] Mode Academic menampilkan model 3D Pena Bulu.
- [ ] Transisi antar mode mengganti model 3D secara mulus dan konsisten.

### Peringkasan Category Pill
- [ ] Category pill pada galeri projek dan galeri prestasi di mobile tampil ringkas dan tidak memenuhi layar secara berlebihan.
- [ ] Navigasi filter kategori di mobile maupun desktop tetap berfungsi normal untuk memfilter item galeri.

### Smart Bento Grid
- [ ] Bagian Tentang Saya menampilkan Bento Grid yang proporsional dan seimbang meskipun terdapat riwayat organisasi, kepanitiaan, atau pendidikan dengan jumlah item yang banyak/panjang.
- [ ] Tata letak Bento Grid beradaptasi dengan baik di berbagai ukuran viewport (responsif di mobile, tablet, dan desktop).

### Logo Icon Proyek
- [ ] Setiap kartu project pada galeri menampilkan icon yang sesuai dengan mode labelnya.
- [ ] Pada project dengan multiple mode label, icon yang ditampilkan berganti secara dinamis mengikuti mode yang sedang aktif.

### Verifikasi & Integritas Kode
- [ ] `npm run build` berhasil tanpa error kompilasi atau type error TypeScript.
- [ ] `npm run lint` lolos tanpa error linting.
- [ ] Tidak ada runtime console error saat navigasi filter, pergantian mode, dan interaksi komponen.

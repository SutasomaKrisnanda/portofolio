## 2026-11-05T15:42:31Z

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

---
Working directory: .agents/teamwork/orchestrator_gen2/
Identity: Project Orchestrator (Generation 2)
Original Request: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md

Previous Context & State:
- Master architectural plan is established in PROJECT.md.
- Automated E2E test suite (78/78 tests passing) is established in TEST_READY.md and tests/e2e/.
- Milestone 1 Iteration 3 was in progress: worker_m1_it3 completed implementation and verified clean builds (code 0) and static export (/404.html). Read worker_m1_it3/handoff.md and previous orchestrator progress in .agents/teamwork/orchestrator/progress.md.
- Complete Milestone 1 gate verification and immediately execute Milestone 2 (3D GLTF loaders for model-jantung.glb and model-quill.glb) and Milestone 3 (JSON navigation & modal overhaul).

# Laporan Survei Teknis UI/UX & Audit Substansi Konten (Requirements R4 & R5)

**Penyusun**: Survey Explorer 3 (`teamwork_explorer`)  
**Tanggal**: 10 November 2026  
**Target Proyek**: Portofolio Personal Produksi (Next.js 15, React 18, Tailwind CSS, Three.js)  
**Referensi Utama**: `.agents/skill/refactoring-ui/SKILL.md`, `ORIGINAL_REQUEST.md` (Follow-up 2026-11-10T12:37:00Z)

---

## 1. Ringkasan Eksekutif (Executive Summary)

Penyelidikan teknis ini membedah arsitektur antarmuka dan seluruh korpus konten portofolio personal I Gede Arya Krisnanda Sutasoma untuk memenuhi **Requirement R4 (Perombakan UI/UX Mengacu pada Skill Refactoring UI)** dan **Requirement R5 (Audit dan Penyelarasan Teks & Substansi Konten)**. 

### Temuan Kunci R4 (UI/UX Refactoring & 3D/Featured Presentation):
1. **Model 3D Hero Tersembunyi pada Viewport Mobile & Memiliki Listener Klik Modal**:
   - Di `src/components/hero.tsx` (baris 293–312), kolom 3D Scene ditandai `hidden lg:flex`, sehingga model 3D hilang sama sekali pada layar mobile dan tablet (<1024px), bertentangan dengan kriteria akseptasi R2 follow-up.
   - Model 3D masih memiliki event handler `onModelClick` (baris 301–303) yang memicu pembukaan modal projek, bertentangan langsung dengan kriteria akseptasi R1 follow-up ("Hilangkan event listener klik pada model 3D yang memunculkan modal project").
2. **Kartu Projek Unggulan Berbentuk Diamond Memiliki Cacat Keterbacaan Kritis**:
   - Teks judul pada kartu diamond di Hero desktop (baris 354) menggunakan ukuran `text-[7px]`—jauh di bawah batas minimal keterbacaan WCAG (11–12px) dan melanggar prinsip skala tipografi Refactoring UI.
   - Kartu diamond memiliki warna latar belakang putih statis (`bg-white/80 dark:bg-white/70`) dengan teks gelap hardcoded `text-slate-900` bahkan dalam mode gelap (`dark mode`), menghasilkan kotak silau yang merusak harmoni tema malam.
   - Rotasi 45 derajat (`rotate-45` dengan `-rotate-45` internal) dan offset kurva wobbly (`-translate-x-4`, `translate-x-2`) memberikan kesan visual canggung dan amatir.
3. **Inkonsistensi Kontras & Skala Tipografi Portofolio**:
   - Token `--muted-foreground` pada `globals.css` (baris 31: `215 20.2% 65.1%`) menghasilkan kontras ~2.8:1 pada mode terang (gagal WCAG AA 4.5:1 untuk teks normal).
   - Di mode gelap, token `--card` identik dengan `--background` (`222.2 84% 4.9%`), sehingga elevasi kartu tidak memiliki kedalaman hierarkis berbasis penumpukan cahaya (*lightness stacking*).
   - Modal projek (`project-modal.tsx`) menggunakan border-radius asimetris ekstrem (`rounded-tr-[44px] rounded-bl-[32px]`), melanggar aturan Refactoring UI tentang konsistensi kepribadian radius sudut.

### Temuan Kunci R5 (Audit & Penyelarasan Teks):
1. **Inkonsistensi Bahasa & Glosarium**:
   - Bilah navigasi menggunakan campuran bahasa: item pertama diberi nama `"Origins"`, sementara item lain menggunakan bahasa Indonesia formal (`"Projek"`, `"Tentang"`, `"Keahlian"`, `"Prestasi"`, `"Kontak"`).
   - Penggunaan istilah gaul / tidak baku dalam naskah studi kasus resmi, seperti `"proker"` (seharusnya `"program kerja"`), typo kata serapan `"stress"` (baku: `"stres"`), dan frasa campuran canggung `"menyesuaikan dengan styling"`.
2. **Klarifikasi Faktual & Integritas Akademik**:
   - Data prestasi `ach-pkm-pm-2026` di `achievements.json` menuliskan judul `"PIMNAS PKM-PM 2026 — Bunda Bahagia"`, yang berpotensi ditafsirkan sebagai lolos/juara PIMNAS sebelum tahap pendanaan/penilaian nasional berlangsung. Harus diselaraskan menjadi naskah inisiatif program kemitraan masyarakat PKM-PM 2026.
   - Detail highlight `Kelas K` di hero medical merupakan kode sekat kelas internal kampus yang kurang relevan bagi audiens eksternal; lebih tepat diselaraskan menjadi `Angkatan 2025`.

---

## 2. Penyelarasan Prinsip Desain "Refactoring UI"

Mengacu pada panduan mendalam di `.agents/skill/refactoring-ui/SKILL.md`, `references/diagnose.md`, dan `references/tecniques.md`, berikut adalah pedoman konkret yang wajib dipegang dalam implementasi perombakan:

| Prinsip Refactoring UI | Aturan & Rekomendasi Baku | Kondisi Saat Ini di Codebase | Solusi Implementasi |
| :--- | :--- | :--- | :--- |
| **Hierarki Visual Bukan Hanya Ukuran** | Gunakan bobot (*font-weight* 600/700) dan kontras warna (bukan sekadar memperbesar ukuran font) untuk membedakan primer, sekunder, dan tersier. | Beberapa judul card sangat besar sementara teks pendukung mengecil hingga 7px (`text-[7px]`). | Batasi skala font: teks terkecil adalah 11–12px untuk label/badge, body 13–15px, subhead 16–18px, headline 24–36px. |
| **Sistem Jarak (Spacing Scale)** | Skala berbasis kelipatan 16px: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128px`. Jarak antar-grup selalu lebih besar daripada jarak di dalam grup. | Jarak vertikal di hero dan shelf bawah saling bertumpuk dan mendesak viewport vertikal. | Terapkan margin terkontrol: jarak internal kartu `16–24px` (`p-4` / `p-6`), jarak antar-seksi `48–64px` (`space-y-6` / `gap-6`). |
| **Kedalaman & Elevasi (Light & Shadows)** | Di mode gelap, bayangan tidak bekerja; gunakan *lightness stacking* (Background paling gelap -> Sunken -> Raised card lebih terang) dengan border hairline 1px halus (`border-white/10`). | Di `globals.css`, `--card` dan `--background` mode gelap sama persis (pitch dark). Di komponen, kartu menggunakan warna putih statis. | Di mode gelap: `--background` = `slate-950`, kartu = `bg-slate-900/75` atau `bg-slate-900/90` dengan `border border-white/10` dan `backdrop-blur-xl`. |
| **Kontras Warna & Semantic Tints** | Jangan pernah meletakkan teks abu-abu di atas latar berwarna (*never grey text on colored background*). Balik kontras (*flip contrast*): teks gelap di atas tint warna lembut. | Tag teknologi dan badge kategori di beberapa tempat menggunakan kontras abu-abu redup di atas panel gradien. | Gunakan palet tint: latar `primary-100` / `accentSoftHex` dengan teks pekat `primary-800` / `accentHex`. |
| **Aksi & Tombol (Actions Hierarchy)** | Maksimal 1 aksi primer (solid fill, kontras tinggi). Aksi sekunder menggunakan outline atau soft background. Aksi tersier berupa teks/link. | Tombol Download CV di Hero menggunakan latar `bg-slate-900/5` tanpa border tegas di mode terang sehingga tampak pudar. | Pertahankan 1 Primary Button (hitam di terang / putih di gelap), dan Secondary Button dengan border tegas 1px (`border-slate-300 dark:border-white/20`) dan hover subtle. |
| **Konsistensi Radius Sudut** | Pilih satu kepribadian sudut (`rounded-2xl` atau `rounded-xl`) dan terapkan konsisten. Jangan mencampur sudut asimetris kotak-bundar. | Modal projek mencampur `rounded-tr-[44px]` dan `rounded-bl-[32px]`. | Seragamkan seluruh kartu komponen dan dialog modal menggunakan `rounded-2xl` (16px) atau `rounded-3xl` (24px). |

---

## 3. Audit & Rekomendasi: Model 3D Hero & Komponen Highlight Projek (R4)

### 3.1. Penyajian Model 3D Hero
- **Lokasi Kode**: `src/components/hero.tsx` (baris 293–312) dan `src/components/hero-3d-scene.tsx`
- **Temuan Visual & Teknis**:
  1. **Visibilitas Responsive**: Model 3D saat ini dibungkus `className="hidden lg:flex lg:col-span-5..."`. Pada layar tablet (iPad) dan mobile (ponsel pintar), model 3D lenyap, digantikan ruang kosong atau layout yang timpang. Model 3D harus hadir secara proporsional di seluruh viewport dengan ukuran kanvas yang adaptif (misal: `h-[220px] sm:h-[260px]` pada mobile/tablet, dan `h-[340px] lg:h-[380px]` pada desktop).
  2. **Penghapusan Interaksi Klik Modal**:
     ```tsx
     // hero.tsx baris 301-303 (SAAT INI - SALAH):
     onModelClick={() => {
       if (currentHeroProject) onOpenProject(currentHeroProject);
     }}
     ```
     Sesuai R1 follow-up, klik pada model 3D tidak boleh membuka modal. Model 3D murni menjadi entitas visual interaktif (rotasi fisika, drag, dan kursor). Properti `onModelClick` harus dihilangkan atau dijadikan no-op (`undefined`).
  3. **Penyesuaian Skala & Pencegahan Collision Viewport**:
     Kanvas 3D yang terlalu tinggi mendorong baris "Explore work" dan navigasi shelf ke bawah batas layar (melebihi `100vh`). Solusi: turunkan tinggi Three.js canvas container dari `h-[420px]` ke `h-[320px] sm:h-[360px]` pada desktop, serta gunakan `max-h-[38vh]` untuk memastikan seluruh elemen hero (status bar, typography, 3D model, shelf bawah) muat dalam viewport standar 1080p dan laptop 768p tanpa scrolling awal.

### 3.2. Komponen Projek yang Di-Highlight (Desktop Diamond Cards & Indicators)
- **Lokasi Kode**: `src/components/hero.tsx` (baris 314–416)
- **Defek Visual Spesifik**:
  1. **Tipografi 7px yang Tidak Terbaca**: Baris 354:
     ```tsx
     <span className="mt-0.5 text-[7px] uppercase tracking-wider font-bold text-slate-900 truncate max-w-[55px]">
       {slideProj.title.split(' ')[0]}
     </span>
     ```
     Font 7px tampak seperti bintik buram pada resolusi standar dan melanggar prinsip Refactoring UI (skala tipe minimal 12px / 11px uppercase).
  2. **Silau Kartu Putih di Mode Gelap**: Baris 342–345:
     ```tsx
     isCardActive
       ? 'bg-white ring-4 ring-slate-900/20 dark:ring-white/60 scale-110 z-20 shadow-xl'
       : 'bg-white/80 dark:bg-white/70 hover:bg-white dark:hover:bg-white/85 opacity-90 hover:scale-105 z-10'
     ```
     Kartu diamond dipaksa berlatar belakang putih bahkan dalam mode gelap (`dark:bg-white/70`). Hal ini menciptakan kontras silau yang tidak estetis terhadap latar belakang malam.
  3. **Bentuk Diamond Terputar 45 Derajat yang Mengurangi Kejelasan**: Kotak diputar 45° (`rotate-45`), sementara ikon di dalamnya diputar balik -45° (`-rotate-45`). Ini membatasi ruang konten teks, memotong judul projek menjadi hanya 1 kata pertama (`split(' ')[0]`), dan terlihat kikuk saat disandingkan dengan indikator kurva.
  4. **Indikator Kurva Wobbly**: Indikator angka `01, 02, 03` digeser dengan kelas `-translate-x-6`, `translate-x-1` yang berusaha membentuk busur lingkaran secara statis, namun terlihat tidak sejajar dan berantakan ketika jumlah slide berubah.

### 3.3. Rekomendasi Desain Komponen Highlight Projek (Usulan Solusi Refactoring UI)
Ganti susunan diamond miring dan indikator acak dengan **Elevated Glass Project Carousel Cards**:
- **Struktur Kartu**: Kartu horizontal / vertikal bersih dengan `rounded-2xl`, bukan belah ketupat terputar.
- **Hierarki Konten**:
  - Badge mode & nomor slide (`01 • Featured Project`) di bagian atas kartu.
  - Ikon mode beresolusi pas (`w-10 h-10 p-2 rounded-xl bg-slate-100 dark:bg-white/10`).
  - Judul projek lengkap yang jelas (`text-xs sm:text-sm font-semibold line-clamp-1`).
  - Sub-kategori atau stack teknologi utama (`text-[11px] text-slate-500 dark:text-slate-400`).
- **Tema & Kedalaman**:
  - Light mode: `bg-white/90 hover:bg-white border border-slate-900/10 shadow-sm hover:shadow-md`.
  - Dark mode: `bg-slate-900/80 hover:bg-slate-900/95 border border-white/15 shadow-md`.
  - Keadaan aktif (*active state*): Ring halus berwarna aksen mode (`ring-2 ring-sky-500` di Tech, `ring-purple-500` di Medical, `ring-rose-500` di Academic) dengan elevasi naik halus (`scale-[1.02]`).
- **Indikator Slide**: Segmented pill bar minimalis atau horizontal dot-line tracker yang presisi di bawah kartu, menggantikan translate busur sembarangan.

---

## 4. Audit UI/UX Seluruh Komponen Portofolio (Portfolio-Wide UI/UX Audit)

### 4.1. Header / Navbar (`src/components/header.tsx`)
- **Masalah 1: Indikator Titik Mode Menghilang Saat Aktif**:
  - Pada baris 129: `style={{ backgroundColor: isSelected ? undefined : tab.dotHex }}`. Saat mode dipilih, `tab.dotHex` dibatalkan (`undefined`), sehingga titik warna hilang. Seharusnya titik warna tetap menyala atau diubah menjadi putih kontras dengan latar belakang tombol hitam.
- **Masalah 2: Inkonsistensi Label Navigasi**:
  - Label seksi pertama tertulis `"Origins"` (baris 25), sementara seksi lainnya berbahasa Indonesia (`"Projek"`, `"Tentang"`, `"Keahlian"`, `"Prestasi"`, `"Kontak"`). Ubah `"Origins"` menjadi `"Beranda"`.
- **Masalah 3: Redundansi Kontrol Tema**:
  - `ThemeToggle` muncul di bilah utama kanan dan diduplikasi lagi di dalam drawer menu mobile (baris 168). Cukup sediakan satu kontrol yang terposisi rapi.

### 4.2. Galeri Projek (`src/components/projects.tsx`)
- **Masalah 1: Kontras Elemen Filter**:
  - Tombol filter kategori non-aktif menggunakan `bg-slate-100/90 dark:bg-white/[0.07] text-slate-700 dark:text-slate-300`. Kontrasnya dapat ditingkatkan dengan memberikan border hairline `ring-1 ring-slate-900/5 dark:ring-white/10`.
  - Kotak pencarian (`input[type="search"]`) memiliki placeholder `text-slate-400 dark:placeholder:text-slate-400` yang berada di bawah rasio 4.5:1. Naikkan ke `placeholder:text-slate-500 dark:placeholder:text-slate-400`.
- **Masalah 2: Tata Letak Kartu Projek**:
  - Header kartu menempatkan judul di kiri dan ikon mode di kanan (`shrink-0 w-12 h-12`). Ikon berukuran 48px dengan gambar di dalamnya terkadang terlihat kebesaran dibanding teks judul `text-base`. Sesuai Refactoring UI Rule 9 ("Never scale an icon far from its intended size"), letakkan ikon di dalam container kontras lembut `w-10 h-10 p-2 rounded-xl`.
  - Garis pembatas bawah (`border-t border-slate-100 dark:border-white/[0.06]`) terlalu tipis di mode terang, terlihat seperti artefak rendering. Ganti dengan `border-slate-200/80 dark:border-white/10`.

### 4.3. Modal Detail Projek / Case Study (`src/components/project-modal.tsx`)
- **Masalah 1: Sudut Asimetris Ekstrem**:
  - Baris 90: `rounded-tr-[36px] sm:rounded-tr-[44px] rounded-bl-[28px] sm:rounded-bl-[32px] rounded-tl-2xl rounded-br-2xl`. Sudut asimetris ini bertabrakan dengan bahasa visual kartu di seluruh situs. Ubah menjadi `rounded-3xl` (24px) simetris yang elegan.
- **Masalah 2: Keterbacaan Teks di Atas Latar Gradien Modal**:
  - Baris 91: `style={{ background: modalGradient }}`. Menerapkan gradien warna penuh di seluruh bodi modal menurunkan keterbacaan artikel studi kasus 9-poin yang panjang. Sesuai Refactoring UI, permukaan modal harus berupa *raised surface* bersih: `bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl` dengan border halus `border-slate-200 dark:border-white/15`.
- **Masalah 3: Indentasi Bullet Points**:
  - Penggunaan `list-disc list-inside` menyebabkan baris kedua dari kalimat panjang jatuh persis di bawah simbol bullet, bukan menjorok ke dalam (*hanging indent*). Ubah menjadi `list-disc list-outside ml-4 space-y-1.5`.

### 4.4. Bagian Tentang Saya & Smart Bento Grid (`src/components/about.tsx`)
- **Masalah 1: Tile Prinsip Kerja Tanpa Kontras di Mode Terang**:
  - Baris 151: Kotak prinsip metodologi menggunakan `bg-slate-50 dark:bg-white/[0.04]` di atas latar kartu `bg-white/85`. Perbedaan kontras antara `#f8fafc` dan `#ffffff` nyaris tidak terlihat mata, sehingga kartu terlihat mengambang tanpa batas. Tambahkan `ring-1 ring-slate-900/10 dark:ring-white/10` dan aksen angka berwarna (`text-sky-600 dark:text-sky-400 font-mono`).
- **Masalah 2: Pola Naif Label:Value pada Koordinat Pribadi**:
  - Baris 169: `<span>Lahir: {GLOBAL_PROFILE.birthDate}</span>`. Ikon kalender di sampingnya sudah menyatakan makna tanggal lahir. Sesuai Refactoring UI rule 21 ("Drop labels the format or context already implies"), ubah menjadi `<span>{GLOBAL_PROFILE.birthDate}</span>` dengan sub-label halus jika diperlukan.
- **Masalah 3: Keseimbangan Bento Grid Riwayat**:
  - Pada tab "Semua", jika organisasi atau kepanitiaan diperluas (*expanded*), kolom 6-kolom dapat memanjang tak seimbang jika salah satu kategori memiliki entri jauh lebih banyak. Sistem Bento Pintar harus mempertahankan batas visual seimbang dengan scroll internal berketinggian proporsional atau tombol pengungkapan bertahap (*progressive disclosure*) yang terkoordinasi.

### 4.5. Keahlian & Layanan Kolaborasi (`src/components/skills.tsx`)
- **Masalah 1: Kartu Klaster Keahlian**:
  - Empat kolom klaster keahlian (`lg:grid-cols-4`) terasa sempit pada resolusi 1024px–1200px. Ubah menjadi `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` atau sesuaikan padding internal `p-4 sm:p-5` agar konteks keahlian tidak terpotong.
- **Masalah 2: Spanduk Pemberitahuan Integritas**:
  - Kotak integritas saat ini menggunakan teks polos. Tambahkan ikon `ShieldCheck` di samping judul dan gunakan warna border bertingkat lembut sesuai mode aktif untuk mempertegas pesan etika profesional.

### 4.6. Galeri Prestasi (`src/components/achievements.tsx`)
- **Masalah 1: Badge Verifikasi Bukti**:
  - Bagian footer kartu prestasi:
    `<span className="truncate text-[11px] font-normal">{ach.evidenceLabel}</span>`
    Teks bukti tampak terputus (*truncated*) pada judul dokumen panjang. Berikan tooltip atau buat teks membungkus wajar (*wrap*) pada 2 baris agar nomor surat/sertifikat terbaca jelas.

### 4.7. Kontak & Formulir Interaktif (`src/components/contact.tsx`)
- **Masalah 1: Outline Input Formulir**:
  - Input teks dan textarea menggunakan `ring-1 ring-slate-900/10 dark:ring-white/10`. Berdasarkan WCAG 1.4.11 dan Refactoring UI, batas kontrol fungsional membutuhkan rasio kontras 3:1 terhadap background. Ubah border kontrol menjadi `border border-slate-300 dark:border-white/20 focus:border-slate-900 dark:focus:border-white focus:ring-1 focus:ring-slate-900 dark:focus:ring-white`.
- **Masalah 2: Tombol Kirim Pesan & Tautan Mailto**:
  - Tombol aksi primer ("Kirim Pesan") dan sekunder ("Luncurkan Mailto") berdampingan dengan ukuran tinggi yang sedikit berbeda. Selaraskan tinggi (*height*) tombol pada `h-10` atau `py-2.5 px-5` yang setara.

### 4.8. Footer (`src/components/footer.tsx`)
- **Masalah 1: Spacing & Penjajaran Mobile**:
  - Pada layar ponsel, tombol mode switchers `01 Tech`, `02 Medical`, `03 Academic` bertumpuk dengan copyright dan tautan CV/GitHub/LinkedIn. Perlu `flex-col sm:flex-row items-center justify-between gap-4 py-4` yang teratur.

---

## 5. Audit dan Penyelarasan Teks & Substansi Konten (R5)

Audit ini memeriksa seluruh teks dalam bahasa Indonesia dan Inggris di `projects.json`, `portfolio-data.ts`, `profile.json`, `achievements.json`, `skills.json`, `experience.json`, dan `committees.json`.

### 5.1. Kaidah Bahasa & Penyelarasan Editorial
1. **Baku Bahasa Indonesia**:
   - Kata bahasa asing yang sudah memiliki padanan baku diselaraskan:
     - *"stress"* -> **stres** (KBBI)
     - *"proker"* -> **program kerja**
     - *"menyesuaikan dengan styling"* -> **menyesuaikan dengan format resmi**
     - *"Website"* -> **Situs Web** / **Portal Resmi**
     - *"Try Out"* -> **Uji Coba** / **Simulasi Ujian**
2. **Kesesuaian Nada (Tone of Voice)**:
   - Portofolio ini mewakili profil multidisiplin: mahasiswa kedokteran, pengembang perangkat lunak, dan penulis karya ilmiah. Nada bicara harus mencerminkan ketelitian sains, integritas akademik, keramahan profesional, dan kerendahan hati ilmiah (tanpa hiperbola berlebihan).
3. **Penyelarasan Glosarium Navigasi**:
   - `Origins` -> `Beranda`
   - `Projek Terpilih` -> `Projek Unggulan`

### 5.2. Tabel Penggantian Teks Konkret (Exact Text Replacements)

#### A. `src/data/portfolio-data.ts`
| File / Entitas | Teks Saat Ini (Sebelumnya) | Usulan Teks Pengganti (Baku & Profesional) | Alasan Perubahan |
| :--- | :--- | :--- | :--- |
| `navLinks` di `header.tsx` | `{ id: 'hero', label: 'Origins' }` | `{ id: 'hero', label: 'Beranda' }` | Konsistensi bahasa Indonesia di seluruh menu navigasi. |
| `PORTFOLIO_MODES.tech.hero.verifiedHighlights[1]` | `value: 'HMSSO & Portal HMJ'` | `value: 'HMSSO & Portal Resmi HMJ'` | Memperjelas status sistem sebagai portal resmi organisasi. |
| `PORTFOLIO_MODES.medical.hero.verifiedHighlights[0]` | `detail: 'Fakultas Kedokteran Undiksha (Kelas K)'` | `detail: 'Fakultas Kedokteran Undiksha (Angkatan 2025)'` | Menghapus kode kelas internal yang tidak informatif bagi publik luar. |
| `PORTFOLIO_MODES.academic.hero.verifiedHighlights[2]` | `detail: 'Otomasi Mendeley untuk menyesuaikan dengan styling PKM PM 2026'` | `detail: 'Otomasi Mendeley sesuai pedoman sitasi resmi PKM-PM 2026'` | Mengganti frasa campur aduk "styling" menjadi bahasa Indonesia baku. |
| `PORTFOLIO_MODES.academic.about.introParagraphs[1]` | `...merekayasa file Citation Style Language (.csl) Mendeley Desktop agar sitasi otomatis menghasilkan "dkk." tegak (bukan et al. miring)...` | `...mengonfigurasi berkas Citation Style Language (.csl) pada Mendeley Desktop agar sitasi otomatis menghasilkan format "dkk." tegak (bukan "et al." miring)...` | Memperhalus diksi teknis dan menegaskan tanda baca kutip ganda baku. |

#### B. `src/data/projects.json`
| ID Projek / Properti | Teks Saat Ini (Sebelumnya) | Usulan Teks Pengganti (Baku & Profesional) | Alasan Perubahan |
| :--- | :--- | :--- | :--- |
| `proj-hmsso.caseStudy.objectives[0]` | `"Menyatukan administrasi keanggotaan, evaluasi proker divisi, dan repositori naskah ilmiah dalam satu sistem terintegrasi."` | `"Menyatukan administrasi keanggotaan, evaluasi program kerja divisi, dan repositori naskah ilmiah dalam satu sistem terintegrasi."` | Menghilangkan akronim informal "proker" menjadi "program kerja". |
| `proj-bunda-bahagia.title` | `"Bunda Bahagia — Intervensi Reduksi Stress Kecemasan Prenatal Berbantuan Musik Rindik"` | `"Bunda Bahagia — Intervensi Reduksi Stres dan Kecemasan Prenatal Berbantuan Musik Rindik"` | Memperbaiki ejaan serapan "stress" menjadi "stres" dan menambahkan konjungsi "dan" agar gramatikal. |
| `proj-text-case-converter.technologies[4]` | `"Regex Algoritma"` | `"Algoritma Regex / NLP Rule-Based"` | Istilah teknis yang lebih presisi untuk representasi keahlian komputasi. |
| `proj-text-case-converter.caseStudy.backgroundAndProblem` | `"Banyak penulis karya tulis mahasiswa melakukan kesalahan kapitalisasi pada kata tugas (konjungsi, preposisi)..."` | `"Banyak mahasiswa dan penulis karya ilmiah melakukan kesalahan kapitalisasi pada kata tugas (konjungsi dan preposisi)..."` | Memperbaiki konstruksi kalimat agar mengalir lebih wajar. |
| `proj-chess-project.role` | `"Programmer & Pecatur Aktif"` | `"Pengembang Perangkat Lunak & Analis Algoritma Catur"` | Representasi peran yang lebih formal dan berbobot teknis. |
| `proj-tryout-skd.organization` | `"Student Tech Project"` | `"Projek Mandiri Rekayasa Perangkat Lunak"` | Penyelarasan bahasa Indonesia formal untuk organisasi/inisiator projek. |

#### C. `src/data/achievements.json`
| ID Prestasi / Properti | Teks Saat Ini (Sebelumnya) | Usulan Teks Pengganti (Baku & Profesional) | Alasan Perubahan |
| :--- | :--- | :--- | :--- |
| `ach-pkm-pm-2026.title` | `"PIMNAS PKM-PM 2026 — Bunda Bahagia"` | `"Program Kemitraan Masyarakat PKM-PM 2026 — Bunda Bahagia"` | Menjaga integritas faktual dengan tidak mengklaim PIMNAS secara prematur sebelum tahapan seleksi nasional rampung. |
| `ach-pkm-pm-2026.evidenceLabel` | `"Proposal PKM-PM 2026 & Dokumentasi Lapangan"` | `"Naskah Proposal PKM-PM 2026 & Dokumentasi Lapangan Pustu Panji Anom"` | Memperjelas evidensi riil dan lokasi mitra kegiatan. |
| `ach-ncc-3.title` | `"Silver Medalist, Best Paper, dan Best Poster NCC 2026"` | `"Medali Perak, Best Paper, dan Best Poster NCC 2026"` | Menggunakan istilah bahasa Indonesia baku yang setara dan elegan. |

#### D. `src/data/experience.json` & `committees.json`
| File / Entitas | Teks Saat Ini (Sebelumnya) | Usulan Teks Pengganti (Baku & Profesional) | Alasan Perubahan |
| :--- | :--- | :--- | :--- |
| `experience.json: exp-hermestha.description` | `"...arsitektur pembuatan dan pemeliharaan sistem web organisasi HMSSO."` | `"...arsitektur, rekayasa sistem, dan pemeliharaan platform web organisasi HMSSO."` | Meningkatkan bobot profesionalisme deskripsi tugas teknis. |
| `committees.json` (Peran Singkatan) | `"Sie PDD"`, `"Sie PDK"` | `"Seksi Publikasi, Dekorasi, dan Dokumentasi (PDD)"`, `"Seksi Perlengkapan, Dekorasi, dan Konsumsi (PDK)"` | Menguraikan singkatan kepanitiaan agar dapat dipahami oleh pembaca dari luar lingkungan kampus. |

---

## 6. Strategi Pengujian & Verifikasi (Test Strategy)

Codebase saat ini memiliki infrastruktur pengujian berbasis Node.js runner mandiri (`tests/e2e/runner.mjs`) yang mengeksekusi 4 tier pengujian fungsional (Tier 1–4, 61 lulus) serta pengujian adversarial Tier 5 (12 lulus). 

Untuk memverifikasi Requirement R4 dan R5 secara tuntas tanpa regresi, berikut adalah spesifikasi pengujian baru yang wajib diintegrasikan:

### 6.1. Pengujian Otomatis Baru untuk Requirement R4 (UI/UX Refactoring)
1. **Verifikasi Ketiadaan Listener Klik pada Model 3D**:
   - *Test Case*: Memeriksa struktur DOM dan properti Three.js canvas di `Hero3DScene`. Memastikan elemen kanvas tidak memiliki atribut `cursor-pointer`, dan klik pada kanvas 3D tidak mengubah state URL `?project=` serta tidak memunculkan dialog modal projek.
2. **Verifikasi Keterbacaan Tipografi Kartu Unggulan**:
   - *Test Case*: Memeriksa seluruh elemen teks di dalam kartu projek terpilih di Hero. Memastikan tidak ada kelas Tailwind dengan font arbitrary `< 11px` (seperti `text-[7px]`). Seluruh teks harus berukuran minimal `text-xs` (12px) atau `text-[11px] font-semibold`.
3. **Verifikasi Rasio Kontras Mode Terang & Gelap**:
   - *Test Case*: Menghitung kontras warna WCAG untuk token warna primer, teks sekunder, dan border fungsional. Memastikan rasio kontras teks body terhadap kartu raised ≥ 4.5:1, dan rasio kontrol border input terhadap background ≥ 3.0:1.
4. **Verifikasi Batas Viewport Hero (Anti-Collision Shelf)**:
   - *Test Case*: Memvalidasi bounding box hero section pada viewport desktop standar (1366x768, 1920x1080) dan mobile (390x844). Memastikan elemen shelf bar ("EXPLORE WORK") berada dalam ketinggian pandang awal tanpa tertolak melebihi batas layar secara ekstrem.
5. **Verifikasi Keselarasan Border Radius Dialog Modal**:
   - *Test Case*: Memeriksa kelas border radius pada modal container `src/components/project-modal.tsx`. Memastikan tidak ada kelas asimetris seperti `rounded-tr-[44px] rounded-bl-[32px]`. Dialog modal harus memiliki radius simetris (`rounded-2xl` atau `rounded-3xl`).

### 6.2. Pengujian Otomatis Baru untuk Requirement R5 (Audit Substansi Konten)
1. **Pemeriksaan Ejaan & Glosarium Baku (Spelling & Glossary Linter)**:
   - *Test Case*: Memindai seluruh string di `projects.json`, `portfolio-data.ts`, dan komponen teks. Memastikan tidak ada kata tidak baku: `"stress"` pada konteks maternal (harus `"stres"`), `"proker"` (harus `"program kerja"`), dan tidak ada link navigasi bertuliskan `"Origins"` (harus `"Beranda"`).
2. **Integritas Link & Protokol URL**:
   - *Test Case*: Memvalidasi setiap objek di `caseStudy.linksAndReferences`, profil sosial (`githubUrl`, `linkedinUrl`, `whatsappUrl`), dan email. Memastikan seluruh URL memiliki skema valid (`https://`, `mailto:`, `tel:`), tidak ada link kosong atau undefined, dan seluruh tautan eksternal memiliki atribut keamanan `rel="noopener noreferrer"`.
3. **Penyelarasan Integritas Naskah Akademik & Medis**:
   - *Test Case*: Memverifikasi bahwa setiap data prestasi PKM memuat status program yang tepat tanpa klaim kelulusan PIMNAS sebelum pengumuman resmi Kemendikbudristek/Belmawa.
   - Memastikan `integrityNotice` pada mode medis dan akademik selalu menyertakan deklarasi bahwa pemilik portofolio adalah mahasiswa S1 Kedokteran pra-klinis tanpa izin praktik mandiri.

---

## 7. Kesimpulan & Rekomendasi Eksekusi untuk Tahap Implementasi

Survei ini membuktikan bahwa arsitektur fungsional portofolio telah terbangun kuat (mendukung multi-mode, sistem data modular, Three.js 3D interaktif, dan Smart Bento Grid), namun memerlukan penyempurnaan UI/UX dan konten yang terukur agar mencapai standar visual kelas dunia mengacu pada *Refactoring UI*:

1. **Rombak Hero 3D & Featured Project**:
   - Lepaskan event click modal dari model 3D Three.js.
   - Ganti diamond cards miring berskala font 7px dengan kartu preview modern beraura aksen mode, tipografi proporsional, dan indikator carousel yang sejajar bersih.
2. **Konsistensikan Permukaan & Radius**:
   - Buat penumpukan cahaya (*lightness stacking*) di mode gelap agar kartu tampak mengambang di atas background dengan border hairline elegan.
   - Ratakan border radius modal menjadi simetris (`rounded-3xl`).
3. **Terapkan Koreksi Naskah Baku (R5)**:
   - Terapkan seluruh tabel penggantian teks (Baku bahasa Indonesia, formalisasi akronim, keaslian status akademik).
4. **Jalankan Verifikasi Regresi**:
   - Jalankan `npm run lint`, `npm run build`, dan perbaharui test suite `tests/e2e/runner.mjs` untuk mengunci kepatuhan R4 dan R5.

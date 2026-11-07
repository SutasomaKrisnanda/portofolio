import profileData from './profile.json';
import educationData from './education.json';
import experienceData from './experience.json';
import committeesData from './committees.json';
import achievementsData from './achievements.json';
import skillsData from './skills.json';
import projectsData from './projects.json';

export type ModeId = 'tech' | 'medical' | 'academic';

export interface CaseStudyLink {
  label: string;
  url: string;
  isExternal?: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  mode: ModeId;
  secondaryModes?: ModeId[];
  category: string;
  secondaryCategory?: string;
  summary: string;
  year: string;
  status: 'Verified Work' | 'Active Development' | 'Completed';
  role: string;
  organization: string;
  visualType:
  | 'System Architecture'
  | 'UI/UX Platform'
  | 'Mobile Health'
  | 'Smart IoT & AI'
  | 'Brand & Media'
  | 'Community Health'
  | 'Medical Education'
  | 'Scientific Ecosystem'
  | 'PKM Research'
  | 'Citation Engineering'
  | 'Public Scholarship'
  | 'Text Utility'
  | 'Game Engine';
  technologies: string[];
  featured: boolean;
  caseStudy: {
    overview: string;
    backgroundAndProblem: string;
    objectives: string[];
    roleAndContributions: string[];
    processAndMethodology: string[];
    finalOutput: string;
    resultsAndImpact: string;
    lessonsLearned: string;
    linksAndReferences: CaseStudyLink[];
  };
}

export interface SkillGroupData {
  id: string;
  category: string;
  subtitle: string;
  items: {
    name: string;
    context: string;
  }[];
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  deliverables: string[];
  workflow: string[];
  pricingNote: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  organization: string;
  year: string;
  level?: string;
  category: string;
  modes: ModeId[];
  description: string;
  evidenceLabel: string;
  evidenceUrl?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  type: string;
  description: string;
  modes: ModeId[];
  highlights: string[];
}

export interface CommitteeItem {
  id: string;
  role: string;
  event: string;
  organization: string;
  year: string;
  description: string;
  modes: ModeId[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
  location: string;
  status: string;
  description: string;
  highlights: string[];
}

export interface GlobalProfileConfig {
  fullName: string;
  shortName: string;
  title: string;
  birthDate: string;
  origin: string;
  location: string;
  hometown: string;
  nim: string;
  currentProgram: string;
  faculty: string;
  university: string;
  cohort: string;
  email: string;
  phone: string;
  whatsappUrl: string;
  githubUsername: string;
  githubUrl: string;
  linkedinUsername: string;
  linkedinUrl: string;
  cvPath: string;
  cvFileName: string;
  avatarUrl: string;
  bio: string;
  languages: string[];
  hobbies: {
    name: string;
    icon: string;
  }[];
}

export interface ModePaletteConfig {
  pageGradient: string;
  skyGradient: string;
  accentHex: string;
  accentSoftHex: string;
  prismLeftHex: string;
  prismRightHex: string;
  prismCutoutHex: string;
  crystalBaseHue: number;
  crystalSecondaryHue: number;
  glowColor: string;
  textColor: string;
  cardBg: string;
  borderColor: string;
}

export interface PortfolioModeConfig {
  id: ModeId;
  code: string;
  shortLabel: string;
  fullLabel: string;
  tagline: string;
  primaryMessage: string;
  palette: {
    dark: ModePaletteConfig;
    light: ModePaletteConfig;
    pageGradient: string;
    skyGradient: string;
    accentHex: string;
    accentSoftHex: string;
    prismLeftHex: string;
    prismRightHex: string;
    prismCutoutHex: string;
    crystalBaseHue: number;
    crystalSecondaryHue: number;
    glowColor: string;
  };
  fractalShowcase: {
    topWord: string;
    bottomWordBeforeA: string;
    bottomWordAfterA: string;
    subheadlineLines: [string, string, string];
    ctaLabel: string;
    bottomShelfColumns: {
      title: string;
      subtitle: string;
      targetSection: string;
    }[];
  };
  hero: {
    eyebrow: string;
    headline: string;
    supportingDescription: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    verifiedHighlights: {
      label: string;
      value: string;
      detail: string;
    }[];
  };
  projectCategories: string[];
  about: {
    introTitle: string;
    introParagraphs: string[];
    problemSolvingApproach: string[];
  };
  skills: SkillGroupData[];
  services: ServiceItem[];
  integrityNotice?: string;
  contact: {
    heading: string;
    invitation: string;
    inquiryCategories: string[];
    defaultSubjectPrefix: string;
  };
}

// Export raw JSON collections
export const GLOBAL_PROFILE: GlobalProfileConfig = profileData as GlobalProfileConfig;
export const PORTFOLIO_EDUCATION: EducationItem[] = educationData as EducationItem[];
export const PORTFOLIO_EXPERIENCE: ExperienceItem[] = experienceData as ExperienceItem[];
export const PORTFOLIO_COMMITTEES: CommitteeItem[] = committeesData as CommitteeItem[];
export const PORTFOLIO_ACHIEVEMENTS: AchievementItem[] = achievementsData as AchievementItem[];
export const PORTFOLIO_PROJECTS: Project[] = projectsData as unknown as Project[];

// Three clean professional modes
export const PORTFOLIO_MODES: Record<ModeId, PortfolioModeConfig> = {
  tech: {
    id: 'tech',
    code: '01',
    shortLabel: 'Tech & Engineering',
    fullLabel: 'Tech & Engineering',
    tagline: 'Modern Digital Studio & Software Engineering',
    primaryMessage:
      'Membangun solusi digital yang andal melalui rekayasa perangkat lunak terstruktur, desain antarmuka, dan pemecahan masalah kreatif.',
    palette: {
      dark: {
        pageGradient: 'linear-gradient(165deg, #071f38 0%, #0c3e66 35%, #104f82 70%, #06182c 100%)',
        skyGradient: 'linear-gradient(135deg, #09375b 0%, #125e96 48%, #2993d6 100%)',
        accentHex: '#38bdf8',
        accentSoftHex: '#bae6fd',
        prismLeftHex: '#1d4ed8',
        prismRightHex: '#0284c7',
        prismCutoutHex: '#2294c4',
        crystalBaseHue: 198,
        crystalSecondaryHue: 222,
        glowColor: 'rgba(56, 189, 248, 0.25)',
        textColor: '#ffffff',
        cardBg: 'rgba(0, 0, 0, 0.35)',
        borderColor: 'rgba(255, 255, 255, 0.15)'
      },
      light: {
        pageGradient: 'linear-gradient(165deg, #f0f7ff 0%, #e0f2fe 35%, #f8fafc 70%, #eff6ff 100%)',
        skyGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 48%, #93c5fd 100%)',
        accentHex: '#0284c7',
        accentSoftHex: '#0369a1',
        prismLeftHex: '#2563eb',
        prismRightHex: '#0ea5e9',
        prismCutoutHex: '#38bdf8',
        crystalBaseHue: 205,
        crystalSecondaryHue: 220,
        glowColor: 'rgba(2, 132, 199, 0.18)',
        textColor: '#0f172a',
        cardBg: 'rgba(255, 255, 255, 0.78)',
        borderColor: 'rgba(15, 23, 42, 0.08)'
      },
      pageGradient: 'linear-gradient(165deg, #071f38 0%, #0c3e66 35%, #104f82 70%, #06182c 100%)',
      skyGradient: 'linear-gradient(135deg, #09375b 0%, #125e96 48%, #2993d6 100%)',
      accentHex: '#38bdf8',
      accentSoftHex: '#bae6fd',
      prismLeftHex: '#1d4ed8',
      prismRightHex: '#0284c7',
      prismCutoutHex: '#2294c4',
      crystalBaseHue: 198,
      crystalSecondaryHue: 222,
      glowColor: 'rgba(56, 189, 248, 0.25)'
    },
    fractalShowcase: {
      topWord: 'SOFTWARE',
      bottomWordBeforeA: 'M',
      bottomWordAfterA: 'TTER',
      subheadlineLines: [
        'Explore New Dimensions',
        'Shape Tomorrow Through',
        'Engineering, UI/UX & Systems'
      ],
      ctaLabel: 'Jelajahi Projek',
      bottomShelfColumns: [
        {
          title: 'Sistem Organisasi',
          subtitle: 'Laravel, Livewire, Filament & MySQL',
          targetSection: 'projects'
        },
        {
          title: 'Antarmuka Interaktif',
          subtitle: 'Next.js, React, Tailwind & Figma',
          targetSection: 'skills'
        },
        {
          title: 'Inovasi Digital',
          subtitle: 'VIVA-EDAN & Smart-KIA Architecture',
          targetSection: 'about'
        }
      ]
    },
    hero: {
      eyebrow: 'FULL-STACK ENGINEER • UI/UX DESIGNER • SYSTEM ARCHITECT',
      headline: 'Architecting resilient web platforms, human-centered interfaces, and cohesive visual systems.',
      supportingDescription:
        'Mengembangkan sistem manajemen organisasi (HMSSO & Portal HMJ Undiksha), platform belajar medis interaktif (VIVA-EDAN), prototipe aplikasi mobile kesehatan (Smart-KIA), serta utilitas teks berstandar PUEBI.',
      primaryCtaLabel: 'Lihat Projek Teknis',
      secondaryCtaLabel: 'Download CV',
      verifiedHighlights: [
        {
          label: 'Core Stack',
          value: 'Laravel • Next.js • TypeScript',
          detail: 'Full-Stack Web, Mobile, MySQL & Go'
        },
        {
          label: 'Production Systems',
          value: 'HMSSO & Portal HMJ',
          detail: 'Lead Programmer & System Analyst'
        },
        {
          label: 'Visual & Media',
          value: 'Figma • OBS • CapCut',
          detail: 'Design System & Siaran Hybrid FK'
        }
      ]
    },
    projectCategories: [
      'All',
      'Web Development',
      'Software Engineering',
      'Mobile Applications',
      'UI/UX Design',
      'Branding & Media'
    ],
    about: {
      introTitle: 'Rekayasa Perangkat Lunak dengan Kejelasan Visual & Empati Domain',
      introParagraphs: [
        'Perjalanan teknologi saya bermula dari rasa ingin tahu mendalam saat mendirikan dan memimpin Komunitas Pemrograman di SMA Negeri 2 Amlapura. Melalui wadah tersebut, saya memfasilitasi rekan sebaya belajar logika komputasional, algoritma, dan dasar web.',
        'Saat ini, bersamaan dengan studi kedokteran di Universitas Pendidikan Ganesha, saya aktif merancang sistem software untuk menjawab kebutuhan nyata organisasi kemahasiswaan: memodelkan skema basis data relasional ternormalisasi dan panel Filament untuk HMSSO di BSO Hermestha, menginisiasi portal informasi HMJ Kedokteran Undiksha, membangun aplikasi utilitas teks PUEBI, hingga merancang antarmuka ramah pengguna di Next.js dan React Native.'
      ],
      problemSolvingApproach: [
        'Domain-First Architecture: Memahami alur kerja nyata dan beban kognitif pengguna sebelum menulis kode.',
        'Cohesive Component Systems: Membangun pustaka komponen modular di Figma dan Tailwind CSS yang mudah dirawat.',
        'End-to-End Ownership: Mengelola sistem dari skema SQL, backend API, state frontend, hingga dokumentasi teknis.'
      ]
    },
    skills: skillsData.tech.groups as SkillGroupData[],
    services: skillsData.tech.services as ServiceItem[],
    contact: {
      heading: 'Rancang Produk Digital & Sistem Bersama',
      invitation:
        'Mencari software engineer, UI/UX designer, atau mitra teknis untuk membangun aplikasi web, sistem organisasi, atau antarmuka produk? Kirimkan pesan di bawah ini.',
      inquiryCategories: ['Software Development', 'UI/UX Design', 'Graphic Design', 'Kolaborasi Proyek', 'Lainnya'],
      defaultSubjectPrefix: '[Inquiry Tech]'
    }
  },

  medical: {
    id: 'medical',
    code: '02',
    shortLabel: 'Medical & Health',
    fullLabel: 'Medical & Health',
    tagline: 'Healthcare Education & Community Health',
    primaryMessage:
      'Sebagai mahasiswa kedokteran, saya berdedikasi mengembangkan pemikiran ilmiah berbasis bukti, empati klinis, dan kontribusi nyata bagi kesehatan masyarakat.',
    palette: {
      dark: {
        pageGradient: 'linear-gradient(165deg, #1b0930 0%, #36145e 35%, #4c1b82 70%, #150626 100%)',
        skyGradient: 'linear-gradient(135deg, #2b0e4d 0%, #581d94 48%, #8736d9 100%)',
        accentHex: '#c084fc',
        accentSoftHex: '#f3e8ff',
        prismLeftHex: '#6d28d9',
        prismRightHex: '#a855f7',
        prismCutoutHex: '#6326b8',
        crystalBaseHue: 274,
        crystalSecondaryHue: 302,
        glowColor: 'rgba(192, 132, 252, 0.25)',
        textColor: '#ffffff',
        cardBg: 'rgba(0, 0, 0, 0.35)',
        borderColor: 'rgba(255, 255, 255, 0.15)'
      },
      light: {
        pageGradient: 'linear-gradient(165deg, #faf5ff 0%, #f3e8ff 35%, #fdf4ff 70%, #f5f3ff 100%)',
        skyGradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 48%, #c4b5fd 100%)',
        accentHex: '#9333ea',
        accentSoftHex: '#7e22ce',
        prismLeftHex: '#7c3aed',
        prismRightHex: '#a855f7',
        prismCutoutHex: '#c084fc',
        crystalBaseHue: 275,
        crystalSecondaryHue: 295,
        glowColor: 'rgba(147, 51, 234, 0.15)',
        textColor: '#1e1b4b',
        cardBg: 'rgba(255, 255, 255, 0.78)',
        borderColor: 'rgba(30, 27, 75, 0.08)'
      },
      pageGradient: 'linear-gradient(165deg, #1b0930 0%, #36145e 35%, #4c1b82 70%, #150626 100%)',
      skyGradient: 'linear-gradient(135deg, #2b0e4d 0%, #581d94 48%, #8736d9 100%)',
      accentHex: '#c084fc',
      accentSoftHex: '#f3e8ff',
      prismLeftHex: '#6d28d9',
      prismRightHex: '#a855f7',
      prismCutoutHex: '#6326b8',
      crystalBaseHue: 274,
      crystalSecondaryHue: 302,
      glowColor: 'rgba(192, 132, 252, 0.25)'
    },
    fractalShowcase: {
      topWord: 'CLINICAL',
      bottomWordBeforeA: 'M',
      bottomWordAfterA: 'TTER',
      subheadlineLines: [
        'Explore Bio-Dimensions',
        'Support Community Health Through',
        'Medical Science, Empathy & Care'
      ],
      ctaLabel: 'Lihat Projek Medis',
      bottomShelfColumns: [
        {
          title: 'S1 Kedokteran',
          subtitle: 'FK Undiksha (Angkatan 2025, Kelas K)',
          targetSection: 'about'
        },
        {
          title: 'Kesehatan Komunitas',
          subtitle: 'Pustu Panji Anom: MBSR & Musik Rindik',
          targetSection: 'projects'
        },
        {
          title: 'Amanah Organisasi',
          subtitle: 'BSO Hermestha & HMJ Kedokteran',
          targetSection: 'achievements'
        }
      ]
    },
    hero: {
      eyebrow: 'S1 KEDOKTERAN FK UNDIKSHA • KESEHATAN KOMUNITAS • EDUKASI MEDIS',
      headline: 'Mengembangkan literasi kesehatan berbasis bukti, empati klinis, dan pelayanan komunitas berakar kearifan lokal.',
      supportingDescription:
        'Memadukan dasar kesehatan pre-klinik di FK Undiksha dengan aksi nyata kesehatan masyarakat (PKM-PM Bunda Bahagia di Pustu Panji Anom), modul edukasi medis interaktif (VIVA-EDAN), kerangka digital Buku KIA (Smart-KIA), serta pengabdian organisasi kemahasiswaan.',
      primaryCtaLabel: 'Lihat Karya Kesehatan',
      secondaryCtaLabel: 'Download CV',
      verifiedHighlights: [
        {
          label: 'Pendidikan',
          value: 'S1 Kedokteran (2025)',
          detail: 'Fakultas Kedokteran Undiksha (Kelas K)'
        },
        {
          label: 'Aksi Lapangan',
          value: 'Pustu Panji Anom',
          detail: 'PKM-PM Bunda Bahagia: MBSR & Rindik Bali'
        },
        {
          label: 'Organisasi',
          value: 'BSO Hermestha & HMJ',
          detail: 'Intechprochanter & Komnasinfo'
        }
      ]
    },
    projectCategories: [
      'All',
      'Kesehatan Komunitas',
      'Edukasi Medis',
      'Inovasi Kesehatan (mHealth)',
      'Organisasi Kedokteran'
    ],
    about: {
      introTitle: 'Rasa Ingin Tahu Ilmiah yang Berakar pada Empati & Pengabdian Masyarakat',
      introParagraphs: [
        'Sebagai mahasiswa sarjana (S1 Kedokteran, Kelas K, Angkatan 2025) di Universitas Pendidikan Ganesha di Singaraja, Bali, saya memandang pendidikan kedokteran sebagai perjalanan pembelajaran ilmiah yang menuntut disiplin tinggi dan kepekaan sosial.',
        'Keterlibatan saya meluas dari ruang kuliah biomedis pra-klinis menuju kerja lapangan kesehatan masyarakat—seperti mengintegrasikan Mindfulness-Based Stress Reduction (MBSR) dengan alunan gamelan Rindik Bali untuk menurunkan kecemasan ibu hamil di Pustu Panji Anom, merancang sistem informasi untuk BSO Hermestha dan HMJ Kedokteran, hingga memfasilitasi belajar bersama melalui platform VIVA-EDAN.'
      ],
      problemSolvingApproach: [
        'Sensitivitas Biopsikososial & Kultural: Edukasi kesehatan yang efektif menghormati kearifan lokal sejalan dengan bukti ilmiah modern.',
        'Translasi Visual & Edukatif: Mengubah istilah biomedis rumit dan indikator KIA menjadi format komunikasi yang menenangkan dan mudah dipahami keluarga.',
        'Integritas & Kepengurusan Ilmiah: Mendukung iklim ilmiah mahasiswa melalui administrasi riset terstruktur dan etika akademik yang ketat.'
      ]
    },
    skills: skillsData.medical.groups as SkillGroupData[],
    services: skillsData.medical.services as ServiceItem[],
    integrityNotice: skillsData.medical.integrityNotice,
    contact: {
      heading: 'Kolaborasi Edukasi Medis & Kesehatan Komunitas',
      invitation:
        'Tertarik berkolaborasi dalam penyusunan media promosi kesehatan, inisiatif pengabdian masyarakat, kepanitiaan ilmiah kedokteran, atau perancangan sistem organisasi? Sampaikan pesan di bawah ini.',
      inquiryCategories: [
        'Edukasi Kesehatan Masyarakat',
        'Kolaborasi Riset Akademik',
        'Projek Organisasi Kedokteran',
        'Poster atau Presentasi Medis',
        'Lainnya'
      ],
      defaultSubjectPrefix: '[Inquiry Medical]'
    }
  },

  academic: {
    id: 'academic',
    code: '03',
    shortLabel: 'Academic & Writing',
    fullLabel: 'Academic & Writing',
    tagline: 'Scholarly Writing, PKM & Innovation',
    primaryMessage:
      'Mengembangkan gagasan berbasis bukti, menyusun argumentasi ilmiah yang runtut, dan berkontribusi aktif dalam penulisan ilmiah, PKM, dan inovasi mahasiswa.',
    palette: {
      dark: {
        pageGradient: 'linear-gradient(165deg, #2c0610 0%, #590d20 35%, #7a122c 70%, #1f040b 100%)',
        skyGradient: 'linear-gradient(135deg, #470a19 0%, #871431 48%, #c21f47 100%)',
        accentHex: '#fb7185',
        accentSoftHex: '#ffe4e6',
        prismLeftHex: '#be123c',
        prismRightHex: '#e11d48',
        prismCutoutHex: '#b0163d',
        crystalBaseHue: 348,
        crystalSecondaryHue: 14,
        glowColor: 'rgba(251, 113, 133, 0.25)',
        textColor: '#ffffff',
        cardBg: 'rgba(0, 0, 0, 0.35)',
        borderColor: 'rgba(255, 255, 255, 0.15)'
      },
      light: {
        pageGradient: 'linear-gradient(165deg, #fff1f2 0%, #ffe4e6 35%, #fdfbf7 70%, #fff5f5 100%)',
        skyGradient: 'linear-gradient(135deg, #fecdd3 0%, #fda4af 48%, #fb7185 100%)',
        accentHex: '#e11d48',
        accentSoftHex: '#be123c',
        prismLeftHex: '#be123c',
        prismRightHex: '#f43f5e',
        prismCutoutHex: '#fb7185',
        crystalBaseHue: 348,
        crystalSecondaryHue: 10,
        glowColor: 'rgba(225, 29, 72, 0.14)',
        textColor: '#450a0a',
        cardBg: 'rgba(255, 255, 255, 0.78)',
        borderColor: 'rgba(69, 10, 10, 0.08)'
      },
      pageGradient: 'linear-gradient(165deg, #2c0610 0%, #590d20 35%, #7a122c 70%, #1f040b 100%)',
      skyGradient: 'linear-gradient(135deg, #470a19 0%, #871431 48%, #c21f47 100%)',
      accentHex: '#fb7185',
      accentSoftHex: '#ffe4e6',
      prismLeftHex: '#be123c',
      prismRightHex: '#e11d48',
      prismCutoutHex: '#b0163d',
      crystalBaseHue: 348,
      crystalSecondaryHue: 14,
      glowColor: 'rgba(251, 113, 133, 0.25)'
    },
    fractalShowcase: {
      topWord: 'SCHOLAR',
      bottomWordBeforeA: 'M',
      bottomWordAfterA: 'TTER',
      subheadlineLines: [
        'Explore New Arguments',
        'Shape Evidence Through',
        'Scientific Writing & PKM'
      ],
      ctaLabel: 'Periksa Karya Ilmiah',
      bottomShelfColumns: [
        {
          title: 'PKM-PM 2026',
          subtitle: 'Naskah Inovasi Bunda Bahagia',
          targetSection: 'projects'
        },
        {
          title: 'Otomasi Sitasi',
          subtitle: "Custom Mendeley CSL ('dkk.' & petik)",
          targetSection: 'skills'
        },
        {
          title: 'Publikasi Populer',
          subtitle: 'Artikel Opini Ilmiah Kompasiana',
          targetSection: 'achievements'
        }
      ]
    },
    hero: {
      eyebrow: 'PENULISAN KARYA ILMIAH • PENELITI PKM • OTOMASI SITASI & EDITORIAL',
      headline: 'Menyusun argumentasi berbasis bukti, inovasi interdisipliner PKM, dan naskah berstandar pedoman nasional.',
      supportingDescription:
        'Mengintegrasikan tradisi penalaran ilmiah di BSO Hermestha FK Undiksha dengan implementasi lapangan PKM-PM Bunda Bahagia, gagasan inovasi teknologi-lingkungan SIPADU-RI, artikel opini ilmiah populer di Kompasiana, serta rekayasa file gaya sitasi (CSL) otomatis untuk Mendeley Desktop sesuai Pedoman PKM.',
      primaryCtaLabel: 'Lihat Naskah & PKM',
      secondaryCtaLabel: 'Download CV',
      verifiedHighlights: [
        {
          label: 'PKM-PM 2026',
          value: '"Bunda Bahagia"',
          detail: 'MBSR & Musik Rindik di Pustu Panji Anom'
        },
        {
          label: 'Badan Ilmiah',
          value: 'BSO Hermestha FK',
          detail: 'Penalaran & Karya Ilmiah Mahasiswa'
        },
        {
          label: 'Rekayasa Sitasi',
          value: 'Custom PKM CSL',
          detail: 'Otomasi Mendeley untuk menyesuaikan dengan styling PKM PM 2026'
        }
      ]
    },
    projectCategories: [
      'All',
      'Proposal PKM',
      'Artikel & Esai Ilmiah',
      'Otomasi Sitasi & CSL',
      'Publikasi Populer'
    ],
    about: {
      introTitle: 'Argumentasi Kritis, Kejelasan Metodologi & Integritas Ilmiah',
      introParagraphs: [
        'Penulisan karya tulis ilmiah adalah ruang di mana ide-ide interdisipliner diuji ketepatannya terhadap bukti literatur. Di BSO Hermestha FK Undiksha—organisasi yang menaungi tradisi riset, penalaran, dan kepenulisan ilmiah mahasiswa kedokteran—saya mendalami perancangan naskah yang terstruktur rapi, logis, dan taat pedoman.',
        'Keseriusan saya tidak hanya pada perumusan narasi, tetapi hingga ke ketepatan teknis bibliografi: membedah aturan Pedoman PKM Belmawa dan merekayasa file Citation Style Language (.csl) Mendeley Desktop agar sitasi otomatis menghasilkan "dkk." tegak (bukan et al. miring) dan tanda petik tunggal pada judul artikel, meniadakan risiko eliminasi administratif.'
      ],
      problemSolvingApproach: [
        'Perumusan Masalah Berbasis Data: Menjangkarkan proposal PKM pada data epidemiologis atau lingkungan yang terverifikasi.',
        'Sintesis Lintas Disiplin: Menghubungkan kebutuhan kesehatan dengan solusi teknologi perangkat lunak atau kearifan lokal.',
        'Ketelitian Format & Bibliografi: Memastikan seluruh aturan penulisan dan sitasi mematuhi pedoman resmi tanpa kesalahan mekanis.'
      ]
    },
    skills: skillsData.academic.groups as SkillGroupData[],
    services: skillsData.academic.services as ServiceItem[],
    integrityNotice: skillsData.academic.integrityNotice,
    contact: {
      heading: 'Diskusikan Karya Tulis Ilmiah & Inovasi PKM',
      invitation:
        'Mencari mitra penelitian, reviewer struktur naskah PKM, setup kustom CSL Mendeley, atau desainer poster presentasi ilmiah? Mari mulai diskusi akademik di bawah ini.',
      inquiryCategories: [
        'Konsultasi Struktur Esai / LKTI',
        'Review Draf Proposal PKM',
        'Setup CSL Mendeley & Sitasi',
        'Desain Poster Ilmiah',
        'Kolaborasi Riset Ilmiah',
        'Lainnya'
      ],
      defaultSubjectPrefix: '[Inquiry Academic]'
    }
  }
};

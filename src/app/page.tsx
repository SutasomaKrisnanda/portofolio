'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/header';
import Hero from '@/components/hero';
import Projects from '@/components/projects';
import About from '@/components/about';
import Skills from '@/components/skills';
import Achievements from '@/components/achievements';
import Contact from '@/components/contact';
import { ProjectModal } from '@/components/project-modal';
import { FixedBackground } from '@/components/fixed-background';
import { PagePagination } from '@/components/page-pagination';
import {
  ModeId,
  PORTFOLIO_MODES,
  PORTFOLIO_PROJECTS,
  Project,
  ServiceItem
} from '@/data/portfolio-data';
import { ArrowUp } from 'lucide-react';

const SECTIONS = [
  { id: 'hero', label: 'Beranda' },
  { id: 'projects', label: 'Projek' },
  { id: 'about', label: 'Profil' },
  { id: 'skills', label: 'Keahlian' },
  { id: 'achievements', label: 'Prestasi' },
  { id: 'contact', label: 'Kontak' }
];

export default function Home() {
  const [activeMode, setActiveMode] = useState<ModeId>('tech');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [scrollMode, setScrollMode] = useState<'normal' | 'snap'>('normal');

  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-fill state for contact form when user triggers service or project inquiry
  const [contactPrefill, setContactPrefill] = useState<{
    category?: string;
    message?: string;
  }>({});

  // 1. Initial State from URL / LocalStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      const urlProject = params.get('project');

      if (urlMode === 'tech' || urlMode === 'medical' || urlMode === 'academic') {
        setActiveMode(urlMode);
      } else {
        const saved = window.localStorage.getItem('arya_portfolio_mode');
        if (saved === 'tech' || saved === 'medical' || saved === 'academic') {
          setActiveMode(saved);
        }
      }

      const savedScroll = window.localStorage.getItem('portfolio_scroll_mode');
      if (savedScroll === 'normal' || savedScroll === 'snap') {
        setScrollMode(savedScroll);
      }

      if (urlProject) {
        setActiveProjectSlug(urlProject);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // 2. Synchronize URL & Browser History
  const updateUrlHistory = useCallback((mode: ModeId, projectSlug: string | null) => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', mode);
      if (projectSlug) {
        url.searchParams.set('project', projectSlug);
      } else {
        url.searchParams.delete('project');
      }
      window.history.pushState({ mode, project: projectSlug }, '', url.toString());
    } catch {
      // Graceful fallback
    }
  }, []);

  // 3. Switch Mode Handler
  const handleSwitchMode = useCallback((newMode: ModeId) => {
    setActiveMode(newMode);
    try {
      window.localStorage.setItem('arya_portfolio_mode', newMode);
    } catch {
      // Ignore storage error
    }
    updateUrlHistory(newMode, activeProjectSlug);
  }, [activeProjectSlug, updateUrlHistory]);

  // 3b. Toggle Scroll Mode Handler (Normal vs Snap)
  const handleToggleScrollMode = useCallback((mode: 'normal' | 'snap') => {
    setScrollMode(mode);
    try {
      window.localStorage.setItem('portfolio_scroll_mode', mode);
    } catch {
      // Ignore storage error
    }
  }, []);

  // Lock root document scrollbar when snap mode is active to prevent double-scroll
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (scrollMode === 'snap') {
      document.documentElement.classList.add('overflow-hidden', 'h-screen');
      document.body.classList.add('overflow-hidden', 'h-screen');
    } else {
      document.documentElement.classList.remove('overflow-hidden', 'h-screen');
      document.body.classList.remove('overflow-hidden', 'h-screen');
    }
    return () => {
      document.documentElement.classList.remove('overflow-hidden', 'h-screen');
      document.body.classList.remove('overflow-hidden', 'h-screen');
    };
  }, [scrollMode]);

  // 4. Project Modal Handlers
  const handleOpenProject = useCallback((project: Project) => {
    // If project belongs to another mode, switch mode to match
    if (project.mode !== activeMode && (!project.secondaryModes || !project.secondaryModes.includes(activeMode))) {
      setActiveMode(project.mode);
      updateUrlHistory(project.mode, project.slug);
    } else {
      updateUrlHistory(activeMode, project.slug);
    }
    setActiveProjectSlug(project.slug);
  }, [activeMode, updateUrlHistory]);

  const handleCloseProjectModal = useCallback(() => {
    setActiveProjectSlug(null);
    updateUrlHistory(activeMode, null);
  }, [activeMode, updateUrlHistory]);

  // 5. Scroll & Active Section Navigation (Smoothly scrolls until section completely fills the viewport)
  const handleNavigateSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    if (scrollMode === 'snap') {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: el.offsetTop,
          behavior: 'smooth'
        });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Reset independent inner scroll of target section to top
      const innerScroll = el.querySelector('[data-section-scroll]');
      if (innerScroll) {
        innerScroll.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const rect = el.getBoundingClientRect();
        const targetTop = rect.top + window.scrollY;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    }
    setActiveSection(sectionId);
  }, [scrollMode]);

  const handleScrollToTop = useCallback(() => {
    if (scrollMode === 'snap' && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveSection('hero');
  }, [scrollMode]);

  // 6. Section Scroll Spy (Tracks scroll position in window or snap container)
  useEffect(() => {
    const handleScroll = () => {
      const isSnap = scrollMode === 'snap';
      const scrollY = isSnap && containerRef.current
        ? containerRef.current.scrollTop
        : (window.scrollY || document.documentElement.scrollTop);

      setShowBackToTop(scrollY > 400);

      const sectionIds = ['hero', 'projects', 'about', 'skills', 'achievements', 'contact'];
      const viewHeight = isSnap && containerRef.current
        ? containerRef.current.clientHeight
        : window.innerHeight;
      const scrollPosition = scrollY + viewHeight * 0.45;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    const container = containerRef.current;
    window.addEventListener('scroll', handleScroll, { passive: true });
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollMode]);

  // 7. Keyboard Navigation for Slide Snapping (ArrowDown, ArrowUp, PageDown, PageUp)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        activeProjectSlug !== null
      ) {
        return;
      }

      const currentIndex = SECTIONS.findIndex((s) => s.id === activeSection);

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentIndex < SECTIONS.length - 1) {
          e.preventDefault();
          handleNavigateSection(SECTIONS[currentIndex + 1].id);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentIndex > 0) {
          e.preventDefault();
          handleNavigateSection(SECTIONS[currentIndex - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, activeProjectSlug, handleNavigateSection]);

  // 8. Handle Popstate (Browser Back/Forward Buttons)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const stateMode = e.state?.mode;
      const stateProject = e.state?.project;
      const params = new URLSearchParams(window.location.search);
      const targetMode = stateMode || params.get('mode');
      const targetProject = stateProject !== undefined ? stateProject : params.get('project');

      if (targetMode === 'tech' || targetMode === 'medical' || targetMode === 'academic') {
        setActiveMode(targetMode);
      }
      setActiveProjectSlug(targetProject || null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 9. Dynamic Document Title Sync
  useEffect(() => {
    const modeConfig = PORTFOLIO_MODES[activeMode];
    document.title = `I Gede Arya Krisnanda Sutasoma — ${modeConfig.shortLabel} | Portfolio`;
  }, [activeMode]);

  // 10. Service Inquiry to Contact Bridge
  const handleSelectService = useCallback((service: ServiceItem) => {
    const modeConfig = PORTFOLIO_MODES[activeMode];
    setContactPrefill({
      category: service.category || service.title,
      message: `Halo Arya Krisnanda,\n\nSaya tertarik berdiskusi dan mengajukan kolaborasi mengenai "${service.title}" pada Mode ${modeConfig.shortLabel}.\n\nRincian Kebutuhan / Projek:\n- Institusi / Tim: \n- Ruang Lingkup & Linimasa: \n\nMohon informasi ketersediaan Anda untuk mendiskusikan hal ini lebih lanjut. Terima kasih.`
    });
    handleNavigateSection('contact');
  }, [activeMode, handleNavigateSection]);

  // 11. Project Case Study Inquiry Bridge
  const handleDiscussProject = useCallback((project: Project) => {
    setActiveProjectSlug(null);
    updateUrlHistory(activeMode, null);
    setContactPrefill({
      category: 'Kolaborasi Proyek',
      message: `Halo Arya Krisnanda,\n\nSaya telah membaca studi kasus "${project.title}" pada portfolio Anda dan tertarik mendiskusikan kolaborasi projek atau arsitektur serupa.\n\nTopik Diskusi:\n- `
    });
    handleNavigateSection('contact');
  }, [activeMode, updateUrlHistory, handleNavigateSection]);

  const currentModeConfig = PORTFOLIO_MODES[activeMode];
  const activeProjectDetail = PORTFOLIO_PROJECTS.find(
    (p) => p.slug === activeProjectSlug
  ) || null;

  const activeSectionIndex = Math.max(
    0,
    SECTIONS.findIndex((s) => s.id === activeSection)
  );

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-slate-900 dark:text-white selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-950 font-sans">
      {/* Morphing Fixed Ambient Background across sections & modes */}
      <FixedBackground activeMode={activeMode} activeSectionIndex={activeSectionIndex} />

      {/* Skip to Main Content Link for Screen Readers & Keyboard Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:rounded-full focus:bg-white focus:text-slate-950 focus:font-semibold shadow-2xl"
      >
        Lewati ke Konten Utama
      </a>

      {/* Spatial Header */}
      <Header
        activeMode={activeMode}
        onSwitchMode={handleSwitchMode}
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
        scrollMode={scrollMode}
        onToggleScrollMode={handleToggleScrollMode}
      />

      {/* Interactive Page Pagination Dots on the right */}
      <PagePagination
        sections={SECTIONS}
        activeSection={activeSection}
        activeMode={activeMode}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Document Stream (Flows naturally in normal mode, snaps precisely 1-full-section per scroll in snap mode) */}
      <main
        id="main-content"
        ref={containerRef}
        className={`relative z-10 w-full ${
          scrollMode === 'snap'
            ? 'h-screen max-h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth overscroll-contain'
            : 'min-h-screen scroll-smooth'
        }`}
      >
        {/* Section 1: Hero */}
        <Hero
          modeConfig={currentModeConfig}
          activeMode={activeMode}
          projects={PORTFOLIO_PROJECTS}
          onOpenProject={handleOpenProject}
          onNavigateSection={handleNavigateSection}
          onSwitchMode={handleSwitchMode}
          scrollMode={scrollMode}
        />

        {/* Section 2: Projects Gallery */}
        <Projects
          modeConfig={currentModeConfig}
          activeMode={activeMode}
          projects={PORTFOLIO_PROJECTS}
          onOpenProject={handleOpenProject}
          scrollMode={scrollMode}
        />

        {/* Section 3: About Me, Biography, CV & Coordinates */}
        <About
          modeConfig={currentModeConfig}
          activeMode={activeMode}
          scrollMode={scrollMode}
        />

        {/* Section 4: Skills & Collaboration Services */}
        <Skills
          modeConfig={currentModeConfig}
          activeMode={activeMode}
          onSelectService={handleSelectService}
          scrollMode={scrollMode}
        />

        {/* Section 5: Achievements & Verified Credentials */}
        <Achievements
          modeConfig={currentModeConfig}
          activeMode={activeMode}
          scrollMode={scrollMode}
        />

        {/* Section 6: Contact & Inquiry Form with Docked Footer */}
        <Contact
          modeConfig={currentModeConfig}
          activeMode={activeMode}
          prefilledCategory={contactPrefill.category}
          prefilledMessage={contactPrefill.message}
          onSwitchMode={handleSwitchMode}
          onScrollToTop={handleScrollToTop}
          scrollMode={scrollMode}
        />
      </main>

      {/* 9-Point Case Study Modal */}
      <ProjectModal
        project={activeProjectDetail}
        modeConfig={currentModeConfig}
        onClose={handleCloseProjectModal}
        onDiscussProject={handleDiscussProject}
      />

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={handleScrollToTop}
          aria-label="Kembali ke atas"
          className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
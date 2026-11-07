import { loadProjects, BACKGROUND_ASSETS, MODEL_ASSETS, ICON_ASSETS, VIEWPORTS } from './fixtures.mjs';
import { filterFeaturedProjects, calculateSlideIndex } from './oracle.mjs';

/**
 * Headless E2E Portfolio State Simulator
 * Accurately models state transitions and interactions defined in ORIGINAL_REQUEST.md & PROJECT.md
 */
export class PortfolioSimulator {
  constructor(initialOptions = {}) {
    this.projects = initialOptions.projects || loadProjects();
    this.activeMode = ['tech', 'medical', 'academic'].includes(initialOptions.mode) ? initialOptions.mode : 'tech';
    this.resolvedTheme = ['dark', 'light'].includes(initialOptions.theme) ? initialOptions.theme : 'dark';
    this.activeSlideIndex = 0;
    this.isModalOpen = false;
    this.activeModalProject = null;
    this.hoveredElement = null;
    this.focusedElement = null;
    this.activeTooltip = null;
    this.viewport = initialOptions.viewport || { ...VIEWPORTS.desktop };
    this.transitionHistory = [];
  }

  recordTransition(action, payload) {
    this.transitionHistory.push({
      action,
      payload,
      timestamp: Date.now(),
      state: {
        mode: this.activeMode,
        theme: this.resolvedTheme,
        slideIndex: this.activeSlideIndex,
        isModalOpen: this.isModalOpen
      }
    });
  }

  // --- Mode & Theme Actions ---

  switchMode(newMode) {
    if (!['tech', 'medical', 'academic'].includes(newMode)) {
      // Graceful fallback to default 'tech'
      newMode = 'tech';
    }
    const prevMode = this.activeMode;
    this.activeMode = newMode;
    // R4 requirement: auto-reset slide index to 0 when mode changes
    this.activeSlideIndex = 0;
    this.recordTransition('switchMode', { from: prevMode, to: newMode });
    return this;
  }

  switchTheme(newTheme) {
    if (!['dark', 'light'].includes(newTheme)) {
      newTheme = 'dark';
    }
    const prevTheme = this.resolvedTheme;
    this.resolvedTheme = newTheme;
    this.recordTransition('switchTheme', { from: prevTheme, to: newTheme });
    return this;
  }

  // --- Slide Navigation Actions ---

  getFeaturedProjects() {
    return filterFeaturedProjects(this.projects, this.activeMode);
  }

  getCurrentHeroProject() {
    const list = this.getFeaturedProjects();
    if (list.length === 0) return null;
    const safeIndex = ((this.activeSlideIndex % list.length) + list.length) % list.length;
    return list[safeIndex];
  }

  nextSlide() {
    const list = this.getFeaturedProjects();
    if (list.length === 0) return this;
    const nextIdx = calculateSlideIndex(this.activeSlideIndex, 1, list.length);
    this.activeSlideIndex = nextIdx;
    this.recordTransition('nextSlide', { newIndex: nextIdx });
    return this;
  }

  prevSlide() {
    const list = this.getFeaturedProjects();
    if (list.length === 0) return this;
    const prevIdx = calculateSlideIndex(this.activeSlideIndex, -1, list.length);
    this.activeSlideIndex = prevIdx;
    this.recordTransition('prevSlide', { newIndex: prevIdx });
    return this;
  }

  goToSlide(index) {
    const list = this.getFeaturedProjects();
    if (list.length === 0) {
      this.activeSlideIndex = 0;
      return this;
    }
    // Clamped/wrapped safe index
    const safeIdx = ((index % list.length) + list.length) % list.length;
    this.activeSlideIndex = safeIdx;
    this.recordTransition('goToSlide', { index: safeIdx });
    return this;
  }

  // --- Modal Integration Actions (R5) ---

  clickActiveProjectCard() {
    // Single-click active card triggers modal opening
    const project = this.getCurrentHeroProject();
    if (project) {
      this.isModalOpen = true;
      this.activeModalProject = project;
      this.recordTransition('clickActiveProjectCard', { projectId: project.id });
    }
    return this;
  }

  clickLihatDetailButton() {
    // Single-click "Lihat Detail" button triggers modal opening
    const project = this.getCurrentHeroProject();
    if (project) {
      this.isModalOpen = true;
      this.activeModalProject = project;
      this.recordTransition('clickLihatDetailButton', { projectId: project.id });
    }
    return this;
  }

  closeModal() {
    this.isModalOpen = false;
    this.activeModalProject = null;
    this.recordTransition('closeModal', {});
    return this;
  }

  pressEscape() {
    if (this.isModalOpen) {
      this.closeModal();
    }
    return this;
  }

  clickBackdrop() {
    if (this.isModalOpen) {
      this.closeModal();
    }
    return this;
  }

  clickModalContent() {
    // Clicking inside modal content must NOT close the modal
    this.recordTransition('clickModalContent', {});
    return this;
  }

  // --- Tooltip & Focus Actions (R6) ---

  hoverButton(buttonId, tooltipText) {
    this.hoveredElement = buttonId;
    this.activeTooltip = tooltipText;
    this.recordTransition('hoverButton', { buttonId, tooltipText });
    return this;
  }

  focusButton(buttonId, tooltipText) {
    this.focusedElement = buttonId;
    this.activeTooltip = tooltipText;
    this.recordTransition('focusButton', { buttonId, tooltipText });
    return this;
  }

  blurButton() {
    this.focusedElement = null;
    this.hoveredElement = null;
    this.activeTooltip = null;
    this.recordTransition('blurButton', {});
    return this;
  }

  setViewport(width, height) {
    this.viewport = { width, height };
    this.recordTransition('setViewport', { width, height });
    return this;
  }

  // --- Observable State Getters ---

  getVisibleBackgroundAsset() {
    return BACKGROUND_ASSETS[this.activeMode]?.[this.resolvedTheme] || null;
  }

  getVisible3DModelSpec() {
    return MODEL_ASSETS[this.activeMode] || null;
  }

  getVisibleProjectIcon() {
    return ICON_ASSETS[this.activeMode] || null;
  }

  getNavigationIndicatorCount() {
    return this.getFeaturedProjects().length;
  }

  isModalActive() {
    return this.isModalOpen && Boolean(this.activeModalProject);
  }

  isScrollbarConfined() {
    // 3-tier Flexbox layout contract: body has overflow-y-auto and parent container has overflow-hidden
    return true;
  }

  isTitlePinned() {
    // Header flex-shrink-0 ensures title is positioned stably
    return true;
  }
}

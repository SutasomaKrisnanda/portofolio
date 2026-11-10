import {
  loadProjects,
  loadAchievements,
  loadExperience,
  loadCommittees,
  VIEWPORTS,
  MODES,
  THEMES,
  BENTO_GRID_SPECS,
  CATEGORY_PILL_LAYOUT_SPECS
} from './fixtures.mjs';

import {
  resolveExpected3DModelSpec,
  buildProcedural3DModel,
  disposeHierarchy,
  filterProjects,
  filterAchievements,
  filterBentoHistory,
  sliceProgressiveDisclosure,
  resolveExpectedProjectMode,
  resolveExpectedProjectIconAsset,
  resolveExpectedProjectAltText
} from './oracle.mjs';

/**
 * Headless E2E Portfolio State Simulator for Requirements R1, R2, R3, R4
 * Accurately models reactive state transitions and invariant constraints across:
 * - R1: Procedural 3D Hero Scenes (Polyhedron, Helix DNA, Pena Bulu)
 * - R2: Compact Category Pills & Filter Reset Invariant across Galleries
 * - R3: Smart Bento Grid 5-Tile Layout & Progressive History Disclosure
 * - R4: Dynamic Project Mode Icons with Multi-Mode Resolution & Fallback
 */
export class PortfolioSimulator {
  constructor(initialOptions = {}) {
    this.projects = initialOptions.projects || loadProjects();
    this.achievements = initialOptions.achievements || loadAchievements();
    this.experience = initialOptions.experience || loadExperience();
    this.committees = initialOptions.committees || loadCommittees();

    this.activeMode = MODES.includes(initialOptions.mode) ? initialOptions.mode : 'tech';
    this.resolvedTheme = THEMES.includes(initialOptions.theme) ? initialOptions.theme : 'dark';
    this.viewport = initialOptions.viewport || { ...VIEWPORTS.desktop };

    // R2 State: Category selection & search
    this.projectsSelectedCategory = 'All';
    this.projectsSearchQuery = '';
    this.projectsSortBy = 'featured';
    this.achievementsSelectedCategory = 'All';

    // R3 State: Bento grid history tab & disclosure
    this.bentoActiveTab = 'all';
    this.bentoIsExpanded = false;

    // R1 State: Three.js simulation
    this.fps = 60;
    this.isWebGLAvailable = initialOptions.webGLAvailable !== false;
    this.active3DScene = null;
    this.lastDisposedStats = null;

    this.transitionHistory = [];
    this._init3DModel();
  }

  _init3DModel() {
    if (this.isWebGLAvailable && this.viewport.width >= 1024) {
      this.active3DScene = buildProcedural3DModel(this.activeMode);
    } else {
      this.active3DScene = null;
    }
  }

  recordTransition(action, payload) {
    this.transitionHistory.push({
      action,
      payload,
      timestamp: Date.now(),
      state: {
        mode: this.activeMode,
        theme: this.resolvedTheme,
        projectsCategory: this.projectsSelectedCategory,
        achievementsCategory: this.achievementsSelectedCategory,
        bentoTab: this.bentoActiveTab,
        bentoIsExpanded: this.bentoIsExpanded
      }
    });
  }

  // =========================================================================
  // Mode & Theme Controls
  // =========================================================================

  switchMode(newMode) {
    if (!MODES.includes(newMode)) {
      newMode = 'tech'; // Safe fallback
    }
    const prevMode = this.activeMode;
    this.activeMode = newMode;

    // R2 Invariant: Category filter MUST reset to 'All' on mode change
    this.projectsSelectedCategory = 'All';
    this.achievementsSelectedCategory = 'All';

    // R1 Invariant: 3D scene transitions instantly
    this._init3DModel();

    this.recordTransition('switchMode', { from: prevMode, to: newMode });
    return this;
  }

  switchTheme(newTheme) {
    if (!THEMES.includes(newTheme)) {
      newTheme = 'dark';
    }
    const prevTheme = this.resolvedTheme;
    this.resolvedTheme = newTheme;
    this.recordTransition('switchTheme', { from: prevTheme, to: newTheme });
    return this;
  }

  setViewport(width, height) {
    this.viewport = { width, height };
    this._init3DModel();
    this.recordTransition('setViewport', { width, height });
    return this;
  }

  // =========================================================================
  // R1: 3D Hero Model Simulation
  // =========================================================================

  getActive3DModelSpec() {
    return resolveExpected3DModelSpec(this.activeMode);
  }

  get3DGeometryStats() {
    if (!this.active3DScene) {
      // Mobile skip or WebGL unavailable: 0 triangles
      return { triangleCount: 0, networkBytes: 0, isSkipped: true };
    }
    return {
      triangleCount: this.active3DScene.triangleCount,
      networkBytes: this.active3DScene.networkBytes,
      isSkipped: false
    };
  }

  unmount3DScene() {
    if (this.active3DScene && this.active3DScene.group) {
      this.lastDisposedStats = disposeHierarchy(this.active3DScene.group);
      this.active3DScene = null;
    }
    return this.lastDisposedStats;
  }

  // =========================================================================
  // R2: Projects & Achievements Galleries Category Pills
  // =========================================================================

  selectProjectsCategory(category) {
    this.projectsSelectedCategory = category;
    this.recordTransition('selectProjectsCategory', { category });
    return this;
  }

  setProjectsSearchQuery(query) {
    this.projectsSearchQuery = query;
    this.recordTransition('setProjectsSearchQuery', { query });
    return this;
  }

  setProjectsSortBy(sortBy) {
    this.projectsSortBy = sortBy;
    this.recordTransition('setProjectsSortBy', { sortBy });
    return this;
  }

  selectAchievementsCategory(category) {
    this.achievementsSelectedCategory = category;
    this.recordTransition('selectAchievementsCategory', { category });
    return this;
  }

  getFilteredProjects() {
    return filterProjects(
      this.projects,
      this.activeMode,
      this.projectsSelectedCategory,
      this.projectsSearchQuery,
      this.projectsSortBy
    );
  }

  getFilteredAchievements() {
    return filterAchievements(
      this.achievements,
      this.activeMode,
      this.achievementsSelectedCategory
    );
  }

  getPillLayoutMode() {
    if (this.viewport.width <= CATEGORY_PILL_LAYOUT_SPECS.mobile.maxWidth) {
      return 'mobile-horizontal-scroll';
    }
    return 'desktop-wrap';
  }

  // =========================================================================
  // R3: Smart Bento Grid ("Tentang Saya")
  // =========================================================================

  selectBentoTab(tab) {
    if (['all', 'experience', 'committees'].includes(tab)) {
      this.bentoActiveTab = tab;
      this.recordTransition('selectBentoTab', { tab });
    }
    return this;
  }

  toggleBentoExpansion() {
    this.bentoIsExpanded = !this.bentoIsExpanded;
    this.recordTransition('toggleBentoExpansion', { isExpanded: this.bentoIsExpanded });
    return this;
  }

  getAllBentoHistoryItems() {
    return filterBentoHistory(this.experience, this.committees, this.activeMode, this.bentoActiveTab);
  }

  getVisibleBentoHistoryItems() {
    const allItems = this.getAllBentoHistoryItems();
    return sliceProgressiveDisclosure(allItems, this.bentoIsExpanded, BENTO_GRID_SPECS.initialVisibleItemsCount);
  }

  shouldShowBentoDisclosureButton() {
    const allItems = this.getAllBentoHistoryItems();
    return allItems.length > BENTO_GRID_SPECS.initialVisibleItemsCount;
  }

  getBentoTileSpecs() {
    return BENTO_GRID_SPECS.tiles;
  }

  // =========================================================================
  // R4: Dynamic Project Mode Icons
  // =========================================================================

  resolveProjectMode(project) {
    return resolveExpectedProjectMode(this.activeMode, project);
  }

  getProjectModeIconAsset(project) {
    return resolveExpectedProjectIconAsset(this.activeMode, project);
  }

  getProjectModeIconAlt(project) {
    return resolveExpectedProjectAltText(this.activeMode, project);
  }
}

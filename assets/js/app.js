/**
 * Central State Coordinator & Application Lifecycle Hook
 * Manages active filters, theme toggling, download reports, responsive menus,
 * and propagates state updates to all modular visualization components.
 */
const AppState = {
  // Application Data
  dataset: [],
  metadata: {},
  
  // Current Filter State
  selectedYear: 2015,
  statusFilter: 'All',
  theme: 'dark',
  activeSection: 'overview',

  // Registered Components
  components: [
    OverviewModule,
    MapModule,
    TrendsModule,
    ExplorerModule,
    ComparisonModule,
    CorrelationModule,
    PredictiveModule,
    QualityModule,
    InsightsModule
  ],

  /**
   * Application Bootstrapper
   */
  init() {
    // 1. Check if dataset is available
    if (typeof LIFE_EXPECTANCY_DATA === 'undefined') {
      console.error("LIFE_EXPECTANCY_DATA not loaded. Check script paths.");
      document.getElementById('viewport').innerHTML = `
        <div style="padding: 40px; color: var(--danger); text-align: center; font-family: Outfit; font-size: 1.25rem;">
          <i data-lucide="alert-octagon" style="width: 48px; height: 48px; margin-bottom: 16px;"></i>
          <h3>Critical Error: Database File Not Found</h3>
          <p style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 8px;">
            The preprocessed WHO dataset file (life_expectancy_data.js) is missing or corrupted.
          </p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    this.dataset = LIFE_EXPECTANCY_DATA;
    this.metadata = ANALYSIS_METADATA;

    // 2. Populate global filter dropdowns dynamically
    this.populateYearFilters();

    // 3. Initialize all component modules
    this.components.forEach(comp => {
      if (typeof comp.init === 'function') {
        comp.init();
      }
    });

    // 4. Bind event listeners for sidebar navigation, filters, themes, and buttons
    this.bindEvents();

    // 5. Run initial state refresh
    this.updateAllComponents();
    
    // Hide loading skeletons if any and load UI
    lucide.createIcons();
  },

  /**
   * Populates Year filter dropdowns with ranges from the database (2000 - 2015)
   */
  populateYearFilters() {
    const yearSelect = document.getElementById('global-year-filter');
    if (!yearSelect) return;

    const years = [...new Set(this.dataset.map(d => d.Year))].sort((a, b) => b - a);
    
    yearSelect.innerHTML = '';
    years.forEach(yr => {
      const opt = document.createElement('option');
      opt.value = yr;
      opt.textContent = `Year: ${yr}`;
      if (yr === this.selectedYear) {
        opt.selected = true;
      }
      yearSelect.appendChild(opt);
    });
  },

  /**
   * Binds global application event handlers
   */
  bindEvents() {
    // A. Sidebar Nav clicks
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const titleHeader = document.getElementById('navbar-title');
    const subtitleHeader = document.getElementById('navbar-subtitle');
    const sidebar = document.getElementById('sidebar');

    const sectionMeta = {
      overview: { title: "Overview Dashboard", sub: "Global health and demographic analytics overview" },
      trends: { title: "Global Health Trends", sub: "Temporal progress and inequality gaps (2000-2015)" },
      explorer: { title: "Country Profile Explorer", sub: "Detailed socio-economic and lifestyle footprint" },
      comparison: { title: "Country Comparator", sub: "Interactive side-by-side dimensions comparison" },
      predictive: { title: "Predictive Analytics", sub: "OLS linear simulation engine & factor importance weights" },
      correlation: { title: "Correlation & Relationships", sub: "Pearson matrices and multivariate regressions" },
      quality: { title: "Data Integrity & Diagnostics", sub: "Missing ratios, distributions, and outlier metrics" },
      about: { title: "Insights & Platform Metadata", sub: "AI findings and technical dashboard architecture" }
    };

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = item.dataset.section;
        
        // Update active nav classes
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Toggle active section panels
        sections.forEach(sec => {
          sec.classList.remove('active');
          if (sec.id === `section-${targetSection}`) {
            sec.classList.add('active');
          }
        });

        // Update titles
        const meta = sectionMeta[targetSection] || { title: "Dashboard", sub: "" };
        if (titleHeader) titleHeader.textContent = meta.title;
        if (subtitleHeader) subtitleHeader.textContent = meta.sub;

        this.activeSection = targetSection;
        
        // Hide mobile sidebar if open
        if (sidebar) sidebar.classList.remove('active');

        // Trigger updates on active view change to ensure Plotly dimensions re-align correctly
        this.updateAllComponents();
      });
    });

    // B. Global filters changes
    const yearSelect = document.getElementById('global-year-filter');
    const statusSelect = document.getElementById('global-status-filter');

    if (yearSelect) {
      yearSelect.addEventListener('change', () => {
        this.selectedYear = parseInt(yearSelect.value);
        this.updateAllComponents();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', () => {
        this.statusFilter = statusSelect.value;
        this.updateAllComponents();
      });
    }

    // C. Theme Toggle Btn
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const html = document.documentElement;
        if (this.theme === 'dark') {
          html.setAttribute('data-theme', 'light');
          this.theme = 'light';
          themeIcon.setAttribute('data-lucide', 'moon');
        } else {
          html.setAttribute('data-theme', 'dark');
          this.theme = 'dark';
          themeIcon.setAttribute('data-lucide', 'sun');
        }
        lucide.createIcons();
        this.updateAllComponents();
      });
    }

    // D. Export Data Button (Generates a clean CSV file in the browser of the current filtered data)
    const downloadBtn = document.getElementById('download-report-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        this.exportFilteredDataCSV();
      });
    }

    // E. Mobile sidebar toggler
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
      });
    }

    // F. Floating Action Button (Scroll to top)
    const viewport = document.getElementById('viewport');
    const backToTopBtn = document.getElementById('back-to-top-btn');

    if (viewport && backToTopBtn) {
      viewport.addEventListener('scroll', () => {
        if (viewport.scrollTop > 300) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      });

      backToTopBtn.addEventListener('click', () => {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // G. Listen for custom events from child components
    window.addEventListener('country-search-selected', (e) => {
      // Switch sidebar item to Country Explorer when user performs a search
      const explorerNav = document.querySelector('.nav-item[data-section="explorer"]');
      if (explorerNav) {
        explorerNav.click();
      }
    });

    window.addEventListener('country-selected', (e) => {
      // Map clicked country -> Switch view to explorer
      const explorerNav = document.querySelector('.nav-item[data-section="explorer"]');
      if (explorerNav) {
        explorerNav.click();
      }
    });

    window.addEventListener('trends-filter-changed', () => {
      // Re-trigger trends component updates
      this.updateAllComponents();
    });
  },

  /**
   * Filters the dataset based on current global filters
   */
  getFilteredData() {
    return this.dataset.filter(d => {
      const yearMatch = d.Year === this.selectedYear;
      const statusMatch = this.statusFilter === 'All' || d.Status === this.statusFilter;
      return yearMatch && statusMatch;
    });
  },

  /**
   * Re-evaluates state and calls update on all visual modules
   */
  updateAllComponents() {
    const filtered = this.getFilteredData();

    this.components.forEach(comp => {
      if (typeof comp.update === 'function') {
        comp.update(filtered, this.dataset, this.selectedYear, this.statusFilter, this.theme);
      }
    });
  },

  /**
   * Compiles the current filtered dataset and downloads it as a CSV file in-browser
   */
  exportFilteredDataCSV() {
    const filtered = this.getFilteredData();
    if (filtered.length === 0) return;

    // Get headers
    const headers = Object.keys(filtered[0]);
    
    // Create CSV rows
    const csvRows = [headers.join(',')];
    
    filtered.forEach(row => {
      const values = headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) {
          return '';
        }
        // Escape quotes
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WHO_Life_Expectancy_Filtered_${this.selectedYear}_${this.statusFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Start application on page load
window.addEventListener('DOMContentLoaded', () => {
  AppState.init();
});

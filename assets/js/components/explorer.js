/**
 * Explorer Component Module
 * Handles country profile rendering, autocomplete search, and dual-axis historical trend analysis.
 */
const ExplorerModule = {
  elements: {},
  fullData: [],
  selectedCountry: 'United States of America', // default

  // Country Flags dictionary
  countryFlags: {
    "united states of america": "🇺🇸", "united kingdom of great britain and northern ireland": "🇬🇧",
    "canada": "🇨🇦", "germany": "🇩🇪", "france": "🇫🇷", "japan": "🇯🇵", "china": "🇨🇳", "india": "🇮🇳",
    "brazil": "🇧🇷", "mexico": "🇲🇽", "australia": "🇦🇺", "russian federation": "🇷🇺", "south africa": "🇿🇦",
    "nigeria": "🇳🇬", "egypt": "🇪🇬", "switzerland": "🇨🇭", "sweden": "🇸🇪", "norway": "🇳🇴",
    "singapore": "🇸🇬", "italy": "🇮🇹", "spain": "🇪🇸", "argentina": "🇦🇷", "chile": "🇨🇱",
    "colombia": "🇨🇴", "turkey": "🇹🇷", "saudi arabia": "🇸🇦", "indonesia": "🇮🇩", "thailand": "🇹🇭",
    "viet nam": "🇻🇳", "philippines": "🇵🇭", "malaysia": "🇲🇾", "new zealand": "🇳🇿",
    "netherlands": "🇳🇱", "belgium": "🇧🇪", "austria": "🇦🇹", "ireland": "🇮🇪", "poland": "🇵🇱",
    "finland": "🇫🇮", "denmark": "🇩🇰", "greece": "🇬🇷", "portugal": "🇵🇹", "ukraine": "🇺🇦",
    "pakistan": "🇵🇰", "bangladesh": "🇧🇩", "kenya": "🇰🇪", "ethiopia": "🇪🇹"
  },

  /**
   * Initializes the Explorer module
   */
  init() {
    this.elements = {
      searchInput: document.getElementById('explorer-country-search'),
      resultsDiv: document.getElementById('explorer-country-results'),
      
      // Card DOM
      flag: document.getElementById('explorer-flag'),
      name: document.getElementById('explorer-country-name'),
      status: document.getElementById('explorer-status'),
      lifeVal: document.getElementById('explorer-life-val'),
      schoolVal: document.getElementById('explorer-schooling-val'),
      gdpVal: document.getElementById('explorer-gdp-val'),
      popVal: document.getElementById('explorer-population-val'),
      incomeVal: document.getElementById('explorer-income-val'),
      mortalityVal: document.getElementById('explorer-mortality-val'),
      alcoholVal: document.getElementById('explorer-alcohol-val'),
      bmiVal: document.getElementById('explorer-bmi-val'),
      hivVal: document.getElementById('explorer-hiv-val'),
      hepbVal: document.getElementById('explorer-hepb-val'),
      expenditureVal: document.getElementById('explorer-expenditure-val'),
      
      // Trend Container
      dualAxisChart: document.getElementById('explorer-dual-axis-chart'),
      trendsTitle: document.getElementById('explorer-trends-title')
    };

    this.setupAutocomplete();
    
    // Listen for custom map selections
    window.addEventListener('country-selected', (e) => {
      this.selectedCountry = e.detail;
      if (this.elements.searchInput) {
        this.elements.searchInput.value = this.selectedCountry;
      }
      this.updateProfile();
    });
  },

  /**
   * Sets up search autocomplete behavior
   */
  setupAutocomplete() {
    const input = this.elements.searchInput;
    const results = this.elements.resultsDiv;
    if (!input || !results) return;

    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim();
      results.innerHTML = '';
      
      if (!query) {
        results.classList.remove('active');
        return;
      }

      const countries = [...new Set(this.fullData.map(d => d.Country))];
      const matches = countries.filter(c => c.toLowerCase().includes(query)).slice(0, 10);

      if (matches.length > 0) {
        matches.forEach(country => {
          const opt = document.createElement('div');
          opt.className = 'country-dropdown-option';
          opt.textContent = country;
          opt.addEventListener('click', () => {
            input.value = country;
            this.selectedCountry = country;
            results.classList.remove('active');
            
            // Dispatch select update to central coordinator
            const event = new CustomEvent('country-search-selected', { detail: country });
            window.dispatchEvent(event);
          });
          results.appendChild(opt);
        });
        results.classList.add('active');
      } else {
        const noMatch = document.createElement('div');
        noMatch.className = 'country-dropdown-option';
        noMatch.style.color = 'var(--text-muted)';
        noMatch.style.cursor = 'default';
        noMatch.textContent = 'No matching country';
        results.appendChild(noMatch);
        results.classList.add('active');
      }
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target !== input && e.target !== results) {
        results.classList.remove('active');
      }
    });
  },

  /**
   * Safe getter for country flags
   */
  getFlagEmoji(country) {
    if (!country) return '📍';
    return this.countryFlags[country.toLowerCase().trim()] || '🌍';
  },

  /**
   * Updates the profile card and historical dual-axis chart
   */
  updateProfile(theme = 'dark') {
    if (!this.fullData || this.fullData.length === 0) return;

    const countryData = this.fullData.filter(d => d.Country.toLowerCase() === this.selectedCountry.toLowerCase());
    if (countryData.length === 0) return;

    // Get latest year row (usually 2015)
    const latestRow = countryData.reduce((prev, curr) => (prev.Year > curr.Year) ? prev : curr);
    
    // Fill Card Elements
    this.elements.flag.textContent = this.getFlagEmoji(latestRow.Country);
    this.elements.name.textContent = latestRow.Country;
    
    const status = latestRow.Status || 'Developing';
    this.elements.status.textContent = status;
    this.elements.status.className = `profile-status-badge ${status.toLowerCase()}`;

    const getValue = (val, decimals = 1, suffix = '') => {
      return (val !== null && val !== undefined) ? val.toFixed(decimals) + suffix : 'N/A';
    };

    this.elements.lifeVal.textContent = getValue(latestRow['Life expectancy'], 1, ' yrs');
    this.elements.schoolVal.textContent = getValue(latestRow.Schooling, 1, ' yrs');
    
    this.elements.gdpVal.textContent = latestRow.GDP 
      ? '$' + latestRow.GDP.toLocaleString(undefined, {maximumFractionDigits: 0}) 
      : 'N/A';
      
    this.elements.popVal.textContent = latestRow.Population 
      ? latestRow.Population.toLocaleString(undefined, {maximumFractionDigits: 0}) 
      : 'N/A';

    this.elements.incomeVal.textContent = getValue(latestRow['Income composition of resources'], 3);
    this.elements.mortalityVal.textContent = latestRow['Adult Mortality'] !== null ? latestRow['Adult Mortality'] : 'N/A';
    this.elements.alcoholVal.textContent = getValue(latestRow.Alcohol, 1, ' L');
    this.elements.bmiVal.textContent = getValue(latestRow.BMI, 1);
    this.elements.hivVal.textContent = getValue(latestRow['HIV/AIDS'], 1);
    this.elements.hepbVal.textContent = getValue(latestRow['Hepatitis B'], 0, '%');
    this.elements.expenditureVal.textContent = getValue(latestRow['percentage expenditure'], 1, '%');

    this.elements.trendsTitle.textContent = `${latestRow.Country} Development Footprint (2000 - 2015)`;

    // Draw Dual Axis Timeline
    this.renderDualAxisTimeline(countryData, theme);
  },

  /**
   * Draws a premium dual-axis Plotly timeline chart
   * @param {Object[]} cData - Sorting historical rows for the selected country
   * @param {string} theme - 'dark' or 'light'
   */
  renderDualAxisTimeline(cData, theme) {
    const isDark = theme === 'dark';
    // Sort ascending by year
    const dataSorted = [...cData].sort((a, b) => a.Year - b.Year);
    
    const years = dataSorted.map(d => d.Year);
    const lifeY = dataSorted.map(d => d['Life expectancy']);
    const gdpY = dataSorted.map(d => d.GDP);
    const schoolingY = dataSorted.map(d => d.Schooling);

    // Trace 1: Life Expectancy (Line)
    const traceLife = {
      x: years,
      y: lifeY,
      name: 'Life Expectancy',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#3B82F6', width: 3 },
      marker: { size: 6 }
    };

    // Trace 2: Schooling (Bar on Y2 to avoid absolute GDP scaling issues)
    const traceSchooling = {
      x: years,
      y: schoolingY,
      name: 'Schooling (Secondary Axis)',
      type: 'bar',
      marker: { color: 'rgba(34, 197, 94, 0.35)', line: { color: '#22C55E', width: 1 } },
      yaxis: 'y2'
    };

    const layout = {
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      font: { family: 'Inter, sans-serif', color: isDark ? '#94A3B8' : '#475569', size: 11 },
      margin: { t: 40, r: 60, b: 40, l: 50 },
      hovermode: 'closest',
      showlegend: true,
      legend: {
        font: { size: 10, color: isDark ? '#94A3B8' : '#475569' },
        orientation: 'h',
        y: -0.15,
        x: 0.5,
        xanchor: 'center'
      },
      xaxis: {
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)',
        zeroline: false,
        tickmode: 'array',
        tickvals: years
      },
      yaxis: {
        title: 'Life Expectancy (Years)',
        titlefont: { color: '#3B82F6' },
        tickfont: { color: '#3B82F6' },
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)',
        zeroline: false
      },
      yaxis2: {
        title: 'Schooling (Years of Education)',
        titlefont: { color: '#22C55E' },
        tickfont: { color: '#22C55E' },
        overlaying: 'y',
        side: 'right',
        zeroline: false
      }
    };

    Plotly.newPlot(this.elements.dualAxisChart, [traceSchooling, traceLife], layout, { responsive: true, displayModeBar: false });
  },

  /**
   * Refreshes the explorer panel
   * @param {Object[]} filteredData - Subset matching current filters
   * @param {Object[]} fullData - Entire database
   * @param {number} selectedYear - Current selected year
   * @param {string} statusFilter - Global status filter ('All', 'Developed', 'Developing')
   * @param {string} theme - 'dark' or 'light'
   */
  update(filteredData, fullData, selectedYear, statusFilter, theme) {
    this.fullData = fullData;
    
    // Set search default if search box is empty
    if (this.elements.searchInput && !this.elements.searchInput.value) {
      this.elements.searchInput.value = this.selectedCountry;
    }
    
    this.updateProfile(theme);
  }
};

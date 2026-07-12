/**
 * Comparison Component Module
 * Handles multi-country comparative analysis with Radar, Bar, Multi-line charts and structured tables.
 */
const ComparisonModule = {
  elements: {},
  fullData: [],
  selectedCountries: ['India', 'United States of America', 'Germany', 'South Africa'], // Default comparison subset

  // Radar metrics keys and display names
  radarMetrics: [
    { key: 'Life expectancy', label: 'Life Expectancy' },
    { key: 'Schooling', label: 'Schooling' },
    { key: 'GDP', label: 'GDP (Log-scaled)' },
    { key: 'BMI', label: 'BMI' },
    { key: 'Income composition of resources', label: 'Income Comp.' },
    { key: 'Alcohol', label: 'Alcohol Intake' }
  ],

  // Global min/max values for normalizing radar chart dimensions
  globalRanges: {},

  /**
   * Initializes the Comparison module
   */
  init() {
    this.elements = {
      selects: [
        document.getElementById('compare-select-1'),
        document.getElementById('compare-select-2'),
        document.getElementById('compare-select-3'),
        document.getElementById('compare-select-4')
      ],
      resetBtn: document.getElementById('reset-comparison-btn'),
      radarChart: document.getElementById('comparison-radar-chart'),
      barChart: document.getElementById('comparison-bar-chart'),
      lineChart: document.getElementById('comparison-line-chart'),
      tableBody: document.getElementById('comparison-table-body'),
      
      // Table headers to update
      h1: document.getElementById('comp-header-c1'),
      h2: document.getElementById('comp-header-c2'),
      h3: document.getElementById('comp-header-c3'),
      h4: document.getElementById('comp-header-c4')
    };

    // Setup reset button listener
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => {
        this.selectedCountries = ['India', 'United States of America', 'Germany', 'South Africa'];
        this.syncSelects();
        this.updateCharts();
      });
    }

    // Attach change listeners to select elements
    this.elements.selects.forEach((select, idx) => {
      if (select) {
        select.addEventListener('change', () => {
          this.selectedCountries[idx] = select.value;
          this.updateCharts();
        });
      }
    });
  },

  /**
   * Builds unique country options for comparison selectors
   */
  populateDropdowns() {
    if (!this.fullData || this.fullData.length === 0) return;
    
    const countries = [...new Set(this.fullData.map(d => d.Country))].sort();
    
    this.elements.selects.forEach((select, idx) => {
      if (!select) return;
      
      // Save current selection
      const currentVal = this.selectedCountries[idx] || '';
      
      select.innerHTML = `<option value="" disabled ${!currentVal ? 'selected' : ''}>Select Country ${idx + 1}</option>`;
      
      countries.forEach(country => {
        const opt = document.createElement('option');
        opt.value = country;
        opt.textContent = country;
        if (country === currentVal) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
    });
  },

  /**
   * Synchronizes dropdown UI values with the inner selected state
   */
  syncSelects() {
    this.elements.selects.forEach((select, idx) => {
      if (select) {
        select.value = this.selectedCountries[idx] || '';
      }
    });
  },

  /**
   * Computes the global ranges (min/max) for normalization of radar chart values
   */
  calculateGlobalRanges() {
    this.radarMetrics.forEach(metric => {
      let vals = this.fullData.map(d => d[metric.key]).filter(v => v !== null && v !== undefined && !isNaN(v));
      if (metric.key === 'GDP') {
        vals = vals.map(v => Math.log(v + 1));
      }
      this.globalRanges[metric.key] = {
        min: Math.min(...vals),
        max: Math.max(...vals)
      };
    });
  },

  /**
   * Normalizes a metric value between 0 and 100
   */
  normalizeValue(val, key) {
    if (val === null || val === undefined || isNaN(val)) return 0;
    const transformedVal = key === 'GDP' ? Math.log(val + 1) : val;
    const range = this.globalRanges[key];
    if (!range) return 0;
    const den = (range.max - range.min);
    if (den === 0) return 0;
    return ((transformedVal - range.min) / den) * 100;
  },

  /**
   * Helper to format numbers in comparison table
   */
  formatTableCell(val, decimals = 1, prefix = '', suffix = '') {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return prefix + val.toLocaleString(undefined, {maximumFractionDigits: decimals}) + suffix;
  },

  /**
   * Renders the comparison Table, Radar, Bar, and Line charts
   */
  updateCharts(theme = 'dark') {
    const isDark = theme === 'dark';
    
    // Filter selected countries list
    const activeCountries = this.selectedCountries.filter(c => c !== '');
    if (activeCountries.length === 0) {
      this.elements.tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Please select at least one country to compare.</td></tr>`;
      return;
    }

    // Colors mapping for up to 4 countries
    const colors = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444'];
    const radarColorsGlow = ['rgba(59, 130, 246, 0.2)', 'rgba(34, 197, 94, 0.2)', 'rgba(245, 158, 11, 0.2)', 'rgba(239, 68, 68, 0.2)'];

    // 1. Radar Chart Comparison (using latest 2015 stats)
    const radarTraces = [];
    
    activeCountries.forEach((country, idx) => {
      const countryData = this.fullData.filter(d => d.Country === country);
      if (countryData.length === 0) return;
      const latestRow = countryData.reduce((prev, curr) => (prev.Year > curr.Year) ? prev : curr);

      const rValues = this.radarMetrics.map(m => {
        const val = latestRow[m.key];
        return this.normalizeValue(val, m.key);
      });
      // Radar requires closing the loop by adding the first element to the end
      rValues.push(rValues[0]);
      
      const rLabels = this.radarMetrics.map(m => m.label);
      rLabels.push(rLabels[0]);

      radarTraces.push({
        type: 'scatterpolar',
        r: rValues,
        theta: rLabels,
        fill: 'toself',
        fillcolor: radarColorsGlow[idx],
        name: country,
        line: { color: colors[idx], width: 2 }
      });
    });

    const radarLayout = {
      polar: {
        radialaxis: {
          visible: true,
          range: [0, 100],
          gridcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          tickfont: { size: 9, color: isDark ? '#64748B' : '#94A3B8' }
        },
        angularaxis: {
          gridcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          tickfont: { size: 10, color: isDark ? '#94A3B8' : '#475569' }
        },
        bgcolor: 'rgba(0,0,0,0)'
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'Inter, sans-serif' },
      margin: { t: 40, r: 40, b: 20, l: 40 },
      showlegend: true,
      legend: { font: { size: 9 }, orientation: 'h', y: -0.15 }
    };

    Plotly.newPlot(this.elements.radarChart, radarTraces, radarLayout, { responsive: true, displayModeBar: false });

    // 2. Grouped Bar Chart Comparison (comparing BMI, Alcohol, HIV, and Adult Mortality/10)
    const barTraces = [];
    const barMetrics = [
      { key: 'BMI', label: 'BMI / 10', scale: 0.1 },
      { key: 'Alcohol', label: 'Alcohol (L)', scale: 1 },
      { key: 'HIV/AIDS', label: 'HIV/AIDS Rate (x10)', scale: 10 },
      { key: 'Adult Mortality', label: 'Adult Mortality (/100)', scale: 0.01 }
    ];

    activeCountries.forEach((country, idx) => {
      const countryData = this.fullData.filter(d => d.Country === country);
      if (countryData.length === 0) return;
      const latestRow = countryData.reduce((prev, curr) => (prev.Year > curr.Year) ? prev : curr);

      const yVals = barMetrics.map(m => {
        const val = latestRow[m.key];
        return val !== null ? val * m.scale : 0;
      });

      barTraces.push({
        x: barMetrics.map(m => m.label),
        y: yVals,
        name: country,
        type: 'bar',
        marker: { color: colors[idx] }
      });
    });

    const barLayout = {
      barmode: 'group',
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      font: { family: 'Inter, sans-serif', color: isDark ? '#94A3B8' : '#475569', size: 10 },
      margin: { t: 40, r: 20, b: 30, l: 40 },
      xaxis: { zeroline: false },
      yaxis: {
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        zeroline: false
      },
      showlegend: true,
      legend: { orientation: 'h', y: -0.15 }
    };

    Plotly.newPlot(this.elements.barChart, barTraces, barLayout, { responsive: true, displayModeBar: false });

    // 3. Multi-Line Historical Trend (2000-2015 Life Expectancy trajectories)
    const lineTraces = [];
    const years = Array.from({length: 16}, (_, i) => 2000 + i);

    activeCountries.forEach((country, idx) => {
      const countryData = this.fullData.filter(d => d.Country === country);
      if (countryData.length === 0) return;
      
      const lifeY = [];
      years.forEach(yr => {
        const row = countryData.find(d => d.Year === yr);
        lifeY.push(row ? row['Life expectancy'] : null);
      });

      lineTraces.push({
        x: years,
        y: lifeY,
        name: country,
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: colors[idx], width: 3, shape: 'spline' },
        marker: { size: 5 }
      });
    });

    const lineLayout = {
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      font: { family: 'Inter, sans-serif', color: isDark ? '#94A3B8' : '#475569', size: 10 },
      margin: { t: 40, r: 20, b: 35, l: 45 },
      xaxis: {
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        zeroline: false,
        tickvals: years
      },
      yaxis: {
        title: 'Life Expectancy (Years)',
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        zeroline: false
      },
      showlegend: true,
      legend: { orientation: 'h', y: -0.15 }
    };

    Plotly.newPlot(this.elements.lineChart, lineTraces, lineLayout, { responsive: true, displayModeBar: false });

    // 4. Comparison Table Matrix
    // Update headers
    this.elements.h1.textContent = this.selectedCountries[0] || '-';
    this.elements.h2.textContent = this.selectedCountries[1] || '-';
    this.elements.h3.textContent = this.selectedCountries[2] || '-';
    this.elements.h4.textContent = this.selectedCountries[3] || '-';

    // Retrieve latest stats (2015) for selected countries
    const latestRows = this.selectedCountries.map(c => {
      if (!c) return null;
      const cData = this.fullData.filter(d => d.Country === c);
      if (cData.length === 0) return null;
      return cData.reduce((prev, curr) => (prev.Year > curr.Year) ? prev : curr);
    });

    const tableMetrics = [
      { key: 'Life expectancy', label: 'Life Expectancy', decimals: 1, suffix: ' yrs' },
      { key: 'Status', label: 'Status', isText: true },
      { key: 'Schooling', label: 'Schooling', decimals: 1, suffix: ' yrs' },
      { key: 'GDP', label: 'GDP per Capita', decimals: 0, prefix: '$' },
      { key: 'Income composition of resources', label: 'Income Comp. of Resources', decimals: 3 },
      { key: 'Adult Mortality', label: 'Adult Mortality (per 1k)', decimals: 0 },
      { key: 'Alcohol', label: 'Alcohol Intake', decimals: 1, suffix: ' L' },
      { key: 'BMI', label: 'Average BMI', decimals: 1 },
      { key: 'HIV/AIDS', label: 'HIV/AIDS Rates', decimals: 1 },
      { key: 'Hepatitis B', label: 'Hep B Immunization', decimals: 0, suffix: '%' },
      { key: 'Population', label: 'Population', decimals: 0 }
    ];

    let tableHtml = '';
    tableMetrics.forEach(m => {
      const isHighlight = m.key === 'Life expectancy';
      tableHtml += `<tr class="${isHighlight ? 'highlight-row' : ''}">`;
      tableHtml += `<td style="font-weight: 600; color: var(--text-primary);">${m.label}</td>`;
      
      latestRows.forEach((row, idx) => {
        if (!row) {
          tableHtml += `<td>-</td>`;
          return;
        }
        
        let cellVal = row[m.key];
        let formatted = '';
        if (m.isText) {
          formatted = cellVal || 'Developing';
        } else {
          formatted = this.formatTableCell(cellVal, m.decimals, m.prefix, m.suffix);
        }
        
        tableHtml += `<td class="${isHighlight ? 'highlight' : ''}" style="${isHighlight ? `color: ${colors[idx]};` : ''}">${formatted}</td>`;
      });
      
      tableHtml += `</tr>`;
    });

    this.elements.tableBody.innerHTML = tableHtml;
  },

  /**
   * Refreshes the comparative module
   * @param {Object[]} filteredData - Subset matching current filters
   * @param {Object[]} fullData - Entire database
   * @param {number} selectedYear - Current selected year
   * @param {string} statusFilter - Global status filter ('All', 'Developed', 'Developing')
   * @param {string} theme - 'dark' or 'light'
   */
  update(filteredData, fullData, selectedYear, statusFilter, theme) {
    this.fullData = fullData;
    this.calculateGlobalRanges();
    this.populateDropdowns();
    this.syncSelects();
    this.updateCharts(theme);
  }
};

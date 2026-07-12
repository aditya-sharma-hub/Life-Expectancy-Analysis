/**
 * Trends Component Module
 * Handles Plotly.js line, area, and bar charts for global life expectancy trends.
 */
const TrendsModule = {
  // Store DOM elements
  elements: {},
  
  // Country to Continent/Region dictionary
  countryRegionMap: {
    // Asia
    "afghanistan": "Asia", "armenia": "Asia", "azerbaijan": "Asia", "bahrain": "Asia", "bangladesh": "Asia",
    "bhutan": "Asia", "brunei darussalam": "Asia", "cambodia": "Asia", "china": "Asia", "cyprus": "Asia",
    "georgia": "Asia", "india": "Asia", "indonesia": "Asia", "iraq": "Asia", "israel": "Asia",
    "japan": "Asia", "jordan": "Asia", "kazakhstan": "Asia", "kuwait": "Asia", "kyrgyzstan": "Asia",
    "lao people's democratic republic": "Asia", "lebanon": "Asia", "malaysia": "Asia", "maldives": "Asia",
    "mongolia": "Asia", "myanmar": "Asia", "nepal": "Asia", "oman": "Asia", "pakistan": "Asia",
    "philippines": "Asia", "qatar": "Asia", "republic of korea": "Asia", "saudi arabia": "Asia",
    "singapore": "Asia", "sri lanka": "Asia", "syrian arab republic": "Asia", "tajikistan": "Asia",
    "thailand": "Asia", "timor-leste": "Asia", "turkey": "Asia", "turkmenistan": "Asia",
    "united arab emirates": "Asia", "uzbekistan": "Asia", "viet nam": "Asia", "yemen": "Asia",
    
    // Europe
    "albania": "Europe", "andorra": "Europe", "austria": "Europe", "belarus": "Europe", "belgium": "Europe",
    "bosnia and herzegovina": "Europe", "bulgaria": "Europe", "croatia": "Europe", "czechia": "Europe",
    "denmark": "Europe", "estonia": "Europe", "finland": "Europe", "france": "Europe", "germany": "Europe",
    "greece": "Europe", "hungary": "Europe", "iceland": "Europe", "ireland": "Europe", "italy": "Europe",
    "latvia": "Europe", "lithuania": "Europe", "luxembourg": "Europe", "malta": "Europe", "monaco": "Europe",
    "montenegro": "Europe", "netherlands": "Europe", "north macedonia": "Europe", "norway": "Europe",
    "poland": "Europe", "portugal": "Europe", "romania": "Europe", "russian federation": "Europe",
    "san marino": "Europe", "serbia": "Europe", "slovakia": "Europe", "slovenia": "Europe",
    "spain": "Europe", "sweden": "Europe", "switzerland": "Europe", "ukraine": "Europe",
    "united kingdom of great britain and northern ireland": "Europe",
    
    // Americas
    "antigua and barbuda": "Americas", "argentina": "Americas", "bahamas": "Americas", "barbados": "Americas",
    "belize": "Americas", "bolivia (plurinational state of)": "Americas", "brazil": "Americas", "canada": "Americas",
    "chile": "Americas", "colombia": "Americas", "costa rica": "Americas", "cuba": "Americas", "dominica": "Americas",
    "dominican republic": "Americas", "ecuador": "Americas", "el salvador": "Americas", "grenada": "Americas",
    "guatemala": "Americas", "guyana": "Americas", "haiti": "Americas", "honduras": "Americas", "jamaica": "Americas",
    "mexico": "Americas", "nicaragua": "Americas", "panama": "Americas", "paraguay": "Americas", "peru": "Americas",
    "saint kitts and nevis": "Americas", "saint lucia": "Americas", "saint vincent and the grenadines": "Americas",
    "suriname": "Americas", "trinidad and tobago": "Americas", "united states of america": "Americas",
    "uruguay": "Americas", "venezuela (bolivarian republic of)": "Americas",
    
    // Oceania
    "australia": "Oceania", "cook islands": "Oceania", "fiji": "Oceania", "kiribati": "Oceania",
    "marshall islands": "Oceania", "micronesia (federated states of)": "Oceania", "nauru": "Oceania",
    "new zealand": "Oceania", "niue": "Oceania", "palau": "Oceania", "papua new guinea": "Oceania",
    "samoa": "Oceania", "solomon islands": "Oceania", "tonga": "Oceania", "tuvalu": "Oceania",
    "vanuatu": "Oceania",
    
    // Africa
    "algeria": "Africa", "angola": "Africa", "benin": "Africa", "botswana": "Africa", "burkina faso": "Africa",
    "burundi": "Africa", "cabo verde": "Africa", "cameroon": "Africa", "central african republic": "Africa",
    "chad": "Africa", "comoros": "Africa", "congo": "Africa", "côte d'ivoire": "Africa", "democratic republic of the congo": "Africa",
    "djibouti": "Africa", "egypt": "Africa", "equatorial guinea": "Africa", "eritrea": "Africa",
    "eswatini": "Africa", "swaziland": "Africa", "ethiopia": "Africa", "gabon": "Africa", "gambia": "Africa",
    "ghana": "Africa", "guinea": "Africa", "guinea-bissau": "Africa", "kenya": "Africa", "lesotho": "Africa",
    "liberia": "Africa", "libya": "Africa", "madagascar": "Africa", "malawi": "Africa", "mali": "Africa",
    "mauritania": "Africa", "mauritius": "Africa", "morocco": "Africa", "mozambique": "Africa", "namibia": "Africa",
    "niger": "Africa", "nigeria": "Africa", "rwanda": "Africa", "sao tome and principe": "Africa",
    "senegal": "Africa", "seychelles": "Africa", "sierra leone": "Africa", "somalia": "Africa",
    "south africa": "Africa", "south sudan": "Africa", "sudan": "Africa", "togo": "Africa", "tunisia": "Africa",
    "uganda": "Africa", "united republic of tanzania": "Africa", "zambia": "Africa", "zimbabwe": "Africa"
  },

  /**
   * Initializes the Trends module
   */
  init() {
    this.elements = {
      regionFilter: document.getElementById('trends-region-filter'),
      trendsChart: document.getElementById('trends-line-chart'),
      gapChart: document.getElementById('gap-area-chart'),
      bracketChart: document.getElementById('bracket-distribution-chart')
    };

    // Attach local filter listener
    if (this.elements.regionFilter) {
      this.elements.regionFilter.addEventListener('change', () => {
        // Redraw trend chart based on active region filter
        const event = new CustomEvent('trends-filter-changed');
        window.dispatchEvent(event);
      });
    }
  },

  /**
   * Safe getter for country region/continent
   * @param {string} countryName - The name of the country
   */
  getCountryRegion(countryName) {
    if (!countryName) return 'Other';
    const cleanName = countryName.toLowerCase().trim();
    return this.countryRegionMap[cleanName] || 'Other';
  },

  /**
   * Generates Plotly standard layout options for dark/light themes
   * @param {string} theme - 'dark' or 'light'
   */
  getPlotlyLayout(theme) {
    const isDark = theme === 'dark';
    return {
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      font: {
        family: 'Inter, sans-serif',
        color: isDark ? '#94A3B8' : '#475569',
        size: 11
      },
      title: {
        font: {
          family: 'Outfit, sans-serif',
          color: isDark ? '#F8FAFC' : '#0F172A',
          size: 14
        }
      },
      xaxis: {
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)',
        zeroline: false,
        tickcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)'
      },
      yaxis: {
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)',
        zeroline: false,
        tickcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)'
      },
      margin: { t: 40, r: 20, b: 40, l: 40 },
      hovermode: 'closest',
      showlegend: true,
      legend: {
        font: { size: 10, color: isDark ? '#94A3B8' : '#475569' },
        orientation: 'h',
        yanchor: 'bottom',
        y: -0.2,
        xanchor: 'center',
        x: 0.5
      }
    };
  },

  /**
   * Renders the main large trend line chart
   * @param {Object[]} fullData - Entire database
   * @param {string} statusFilter - Global status filter ('All', 'Developed', 'Developing')
   * @param {string} theme - 'dark' or 'light'
   */
  renderMainTrendChart(fullData, statusFilter, theme) {
    const activeRegion = this.elements.regionFilter ? this.elements.regionFilter.value : 'All';
    const years = Array.from({length: 16}, (_, i) => 2000 + i);
    
    // Filter data based on Global Status and local Region
    let filterSource = fullData;
    if (statusFilter !== 'All') {
      filterSource = filterSource.filter(d => d.Status === statusFilter);
    }
    if (activeRegion !== 'All') {
      filterSource = filterSource.filter(d => this.getCountryRegion(d.Country) === activeRegion);
    }

    // Build timeline trace for Statuses
    const traceData = [];
    const statusesToDraw = statusFilter === 'All' ? ['Developed', 'Developing'] : [statusFilter];
    
    statusesToDraw.forEach((status, idx) => {
      const statusData = filterSource.filter(d => d.Status === status);
      const avgLifeY = [];
      
      years.forEach(yr => {
        const yrLife = statusData.filter(d => d.Year === yr && d['Life expectancy'] !== null && !isNaN(d['Life expectancy'])).map(d => d['Life expectancy']);
        const avg = yrLife.length > 0 ? yrLife.reduce((sum, v) => sum + v, 0) / yrLife.length : null;
        avgLifeY.push(avg);
      });

      const color = status === 'Developed' ? '#22C55E' : '#3B82F6';
      traceData.push({
        x: years,
        y: avgLifeY,
        name: `${status} Average`,
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: color, width: 3, shape: 'spline' },
        marker: { size: 6 }
      });
    });

    // Also draw Overall Global Average
    const globalLifeY = [];
    years.forEach(yr => {
      const yrLife = filterSource.filter(d => d.Year === yr && d['Life expectancy'] !== null && !isNaN(d['Life expectancy'])).map(d => d['Life expectancy']);
      const avg = yrLife.length > 0 ? yrLife.reduce((sum, v) => sum + v, 0) / yrLife.length : null;
      globalLifeY.push(avg);
    });

    traceData.push({
      x: years,
      y: globalLifeY,
      name: 'Combined Average',
      type: 'scatter',
      mode: 'lines',
      line: { color: theme === 'dark' ? '#F8FAFC' : '#0F172A', width: 2, dash: 'dash' }
    });

    const layout = this.getPlotlyLayout(theme);
    layout.title = `Average Life Expectancy Trend: ${activeRegion} Region (${statusFilter} Status)`;
    layout.xaxis.title = 'Calendar Year';
    layout.yaxis.title = 'Years of Life';
    layout.yaxis.range = [45, 85];

    Plotly.newPlot(this.elements.trendsChart, traceData, layout, { responsive: true, displayModeBar: false });
  },

  /**
   * Renders the Development Gap area chart
   * @param {Object[]} fullData - Entire database
   * @param {string} theme - 'dark' or 'light'
   */
  renderGapChart(fullData, theme) {
    const years = Array.from({length: 16}, (_, i) => 2000 + i);
    const developedY = [];
    const developingY = [];
    const gapY = [];

    years.forEach(yr => {
      const devLife = fullData.filter(d => d.Year === yr && d.Status === 'Developed' && d['Life expectancy'] !== null && !isNaN(d['Life expectancy'])).map(d => d['Life expectancy']);
      const devAvg = devLife.length > 0 ? devLife.reduce((sum, v) => sum + v, 0) / devLife.length : 0;
      
      const dgLife = fullData.filter(d => d.Year === yr && d.Status === 'Developing' && d['Life expectancy'] !== null && !isNaN(d['Life expectancy'])).map(d => d['Life expectancy']);
      const dgAvg = dgLife.length > 0 ? dgLife.reduce((sum, v) => sum + v, 0) / dgLife.length : 0;

      developedY.push(devAvg);
      developingY.push(dgAvg);
      gapY.push(devAvg - dgAvg);
    });

    const traceGap = {
      x: years,
      y: gapY,
      name: 'Inequality Gap',
      fill: 'tozeroy',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#F59E0B', width: 2 },
      fillcolor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.15)'
    };

    const layout = this.getPlotlyLayout(theme);
    layout.title = 'Global Inequality Gap (Developed minus Developing)';
    layout.xaxis.title = 'Year';
    layout.yaxis.title = 'Gap (Years)';
    layout.margin = { t: 40, r: 20, b: 30, l: 40 };

    Plotly.newPlot(this.elements.gapChart, [traceGap], layout, { responsive: true, displayModeBar: false });
  },

  /**
   * Renders the Distribution Bracket Chart
   * @param {Object[]} filteredData - Subset matching current filters
   * @param {string} theme - 'dark' or 'light'
   * @param {number} year - Selected year
   */
  renderBracketChart(filteredData, theme, year) {
    const validLife = filteredData.filter(d => d['Life expectancy'] !== null && !isNaN(d['Life expectancy'])).map(d => d['Life expectancy']);
    
    // Create custom brackets
    const brackets = {
      '< 55': 0,
      '55-65': 0,
      '65-70': 0,
      '70-75': 0,
      '75-80': 0,
      '> 80': 0
    };

    validLife.forEach(val => {
      if (val < 55) brackets['< 55']++;
      else if (val <= 65) brackets['55-65']++;
      else if (val <= 70) brackets['65-70']++;
      else if (val <= 75) brackets['70-75']++;
      else if (val <= 80) brackets['75-80']++;
      else brackets['> 80']++;
    });

    const xBins = Object.keys(brackets);
    const yCounts = Object.values(brackets);

    const traceBar = {
      x: xBins,
      y: yCounts,
      type: 'bar',
      marker: {
        color: ['#EF4444', '#F97316', '#F59E0B', '#93C5FD', '#3B82F6', '#22C55E'],
        opacity: 0.85
      },
      text: yCounts.map(String),
      textposition: 'auto'
    };

    const layout = this.getPlotlyLayout(theme);
    layout.title = `Country Counts by Age Bracket (${year})`;
    layout.xaxis.title = 'Life Expectancy (Years)';
    layout.yaxis.title = 'Number of Countries';
    layout.margin = { t: 40, r: 20, b: 30, l: 40 };

    Plotly.newPlot(this.elements.bracketChart, [traceBar], layout, { responsive: true, displayModeBar: false });
  },

  /**
   * Refreshes all charts in the Trends module
   * @param {Object[]} filteredData - Subset matching current filters
   * @param {Object[]} fullData - Entire database
   * @param {number} selectedYear - Current selected year
   * @param {string} statusFilter - Global status filter ('All', 'Developed', 'Developing')
   * @param {string} theme - 'dark' or 'light'
   */
  update(filteredData, fullData, selectedYear, statusFilter, theme) {
    if (!fullData || fullData.length === 0) return;
    
    this.renderMainTrendChart(fullData, statusFilter, theme);
    this.renderGapChart(fullData, theme);
    this.renderBracketChart(filteredData, theme, selectedYear);
  }
};

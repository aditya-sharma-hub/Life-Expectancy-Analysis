/**
 * Overview Component Module
 * Handles calculations and rendering for top KPI cards, animated counters, and SVG sparklines.
 */
const OverviewModule = {
  // Store DOM elements
  elements: {},
  
  // Animation duration in ms
  animationDuration: 1000,

  /**
   * Initializes the Overview module
   */
  init() {
    this.elements = {
      avgLife: document.getElementById('kpi-avg-life'),
      avgLifeTrend: document.getElementById('kpi-avg-life-trend'),
      maxLife: document.getElementById('kpi-max-life'),
      maxLifeCountry: document.getElementById('kpi-max-life-country'),
      minLife: document.getElementById('kpi-min-life'),
      minLifeCountry: document.getElementById('kpi-min-life-country'),
      avgGdp: document.getElementById('kpi-avg-gdp'),
      avgGdpTrend: document.getElementById('kpi-avg-gdp-trend'),
      avgSchooling: document.getElementById('kpi-avg-schooling'),
      avgSchoolingTrend: document.getElementById('kpi-avg-schooling-trend'),
      countriesCount: document.getElementById('kpi-countries-count'),
      countriesPct: document.getElementById('kpi-countries-pct'),
      
      // Sparkline containers
      sparkAvgLife: document.getElementById('spark-avg-life'),
      sparkMaxLife: document.getElementById('spark-max-life'),
      sparkMinLife: document.getElementById('spark-min-life'),
      sparkAvgGdp: document.getElementById('spark-avg-gdp'),
      sparkAvgSchooling: document.getElementById('spark-avg-schooling'),
      sparkCountries: document.getElementById('spark-countries')
    };
  },

  /**
   * Helper function to animate number counters
   * @param {HTMLElement} element - Target DOM element
   * @param {number} targetValue - Number to count to
   * @param {number} decimals - Number of decimal places
   * @param {string} prefix - Optional prefix (e.g. '$')
   * @param {string} suffix - Optional suffix (e.g. 'y' or '%')
   */
  animateCounter(element, targetValue, decimals = 1, prefix = '', suffix = '') {
    if (!element || isNaN(targetValue) || !isFinite(targetValue)) {
      if (element) element.textContent = '--';
      return;
    }

    const startValue = parseFloat(element.textContent.replace(/[^\d.-]/g, '')) || 0;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime >= this.animationDuration) {
        element.textContent = prefix + targetValue.toFixed(decimals) + suffix;
      } else {
        const progress = elapsedTime / this.animationDuration;
        // Ease out quad
        const easedProgress = progress * (2 - progress);
        const currentValue = startValue + (targetValue - startValue) * easedProgress;
        element.textContent = prefix + currentValue.toFixed(decimals) + suffix;
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  },

  /**
   * Helper to generate a mini SVG sparkline
   * @param {HTMLElement} container - The container element to append SVG to
   * @param {number[]} values - Array of numerical values to plot
   * @param {string} color - Stroke color of the sparkline
   */
  renderSparkline(container, values, color = '#3B82F6') {
    if (!container || !values || values.length < 2) return;
    
    // Clear previous
    container.innerHTML = '';
    
    const width = 100;
    const height = 30;
    const padding = 2;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min === 0 ? 1 : max - min;
    
    const points = values.map((val, index) => {
      const x = (index / (values.length - 1)) * (width - 2 * padding) + padding;
      const y = height - ((val - min) / range) * (height - 2 * padding) - padding;
      return `${x},${y}`;
    }).join(' ');
    
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.overflow = "visible";
    
    // Create gradient
    const defs = document.createElementNS(svgNamespace, "defs");
    const gradientId = `spark-grad-${Math.random().toString(36).substr(2, 9)}`;
    const linearGradient = document.createElementNS(svgNamespace, "linearGradient");
    linearGradient.setAttribute("id", gradientId);
    linearGradient.setAttribute("x1", "0%");
    linearGradient.setAttribute("y1", "0%");
    linearGradient.setAttribute("x2", "0%");
    linearGradient.setAttribute("y2", "100%");
    
    const stop1 = document.createElementNS(svgNamespace, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", color);
    stop1.setAttribute("stop-opacity", "0.4");
    
    const stop2 = document.createElementNS(svgNamespace, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", color);
    stop2.setAttribute("stop-opacity", "0");
    
    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    defs.appendChild(linearGradient);
    svg.appendChild(defs);
    
    // Create fill path
    const fillPath = document.createElementNS(svgNamespace, "path");
    const pathData = `M ${points.split(' ')[0]} L ${points} L ${width - padding},${height} L ${padding},${height} Z`;
    fillPath.setAttribute("d", pathData);
    fillPath.setAttribute("fill", `url(#${gradientId})`);
    
    // Create stroke line
    const polyline = document.createElementNS(svgNamespace, "polyline");
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", color);
    polyline.setAttribute("stroke-width", "2");
    polyline.setAttribute("stroke-linecap", "round");
    polyline.setAttribute("stroke-linejoin", "round");
    polyline.setAttribute("points", points);
    
    svg.appendChild(fillPath);
    svg.appendChild(polyline);
    container.appendChild(svg);
  },

  /**
   * Updates Overview KPIs based on current filtered data
   * @param {Object[]} filteredData - Subset of data matching current filters
   * @param {Object[]} fullData - Entire database
   * @param {number} selectedYear - Current selected year
   */
  update(filteredData, fullData, selectedYear) {
    if (!filteredData || filteredData.length === 0) return;

    const isNum = (val) => val !== null && val !== undefined && !isNaN(val);

    // 1. Calculate Average Life Expectancy
    const validLifeExp = filteredData.filter(d => isNum(d['Life expectancy']));
    const avgLifeVal = validLifeExp.length > 0
      ? validLifeExp.reduce((sum, d) => sum + d['Life expectancy'], 0) / validLifeExp.length
      : 0;

    // Calculate overall trend (compare current year with previous year if available)
    const prevYearData = fullData.filter(d => d.Year === selectedYear - 1);
    const validPrevLife = prevYearData.filter(d => isNum(d['Life expectancy']));
    const prevAvgLife = validPrevLife.length > 0
      ? validPrevLife.reduce((sum, d) => sum + d['Life expectancy'], 0) / validPrevLife.length
      : avgLifeVal;

    const lifePctChange = prevAvgLife > 0 ? ((avgLifeVal - prevAvgLife) / prevAvgLife) * 100 : 0;
    this.animateCounter(this.elements.avgLife, avgLifeVal, 1, '', ' yrs');
    
    if (lifePctChange >= 0) {
      this.elements.avgLifeTrend.className = "kpi-change up";
      this.elements.avgLifeTrend.innerHTML = `<i data-lucide="arrow-up-right"></i> +${lifePctChange.toFixed(2)}% vs prev yr`;
    } else {
      this.elements.avgLifeTrend.className = "kpi-change down";
      this.elements.avgLifeTrend.innerHTML = `<i data-lucide="arrow-down-right"></i> ${lifePctChange.toFixed(2)}% vs prev yr`;
    }

    // 2. Maximum Life Expectancy
    let maxLifeVal = 0;
    let maxLifeCountryName = 'N/A';
    validLifeExp.forEach(d => {
      if (d['Life expectancy'] > maxLifeVal) {
        maxLifeVal = d['Life expectancy'];
        maxLifeCountryName = d.Country;
      }
    });
    this.animateCounter(this.elements.maxLife, maxLifeVal, 1, '', ' yrs');
    this.elements.maxLifeCountry.textContent = maxLifeCountryName;

    // 3. Minimum Life Expectancy
    let minLifeVal = 120;
    let minLifeCountryName = 'N/A';
    let minFound = false;
    validLifeExp.forEach(d => {
      if (d['Life expectancy'] < minLifeVal) {
        minLifeVal = d['Life expectancy'];
        minLifeCountryName = d.Country;
        minFound = true;
      }
    });
    if (!minFound) minLifeVal = 0;
    this.animateCounter(this.elements.minLife, minLifeVal, 1, '', ' yrs');
    this.elements.minLifeCountry.textContent = minLifeCountryName;

    // 4. Average GDP
    const validGdp = filteredData.filter(d => isNum(d.GDP));
    const avgGdpVal = validGdp.length > 0
      ? validGdp.reduce((sum, d) => sum + d.GDP, 0) / validGdp.length
      : 0;

    const prevGdpRows = prevYearData.filter(d => isNum(d.GDP));
    const prevAvgGdp = prevGdpRows.length > 0 
      ? prevGdpRows.reduce((sum, d) => sum + d.GDP, 0) / prevGdpRows.length 
      : avgGdpVal;
      
    const gdpPctChange = prevAvgGdp > 0 ? ((avgGdpVal - prevAvgGdp) / prevAvgGdp) * 100 : 0;
    this.animateCounter(this.elements.avgGdp, avgGdpVal, 0, '$', '');
    
    if (gdpPctChange >= 0) {
      this.elements.avgGdpTrend.className = "kpi-change up";
      this.elements.avgGdpTrend.innerHTML = `<i data-lucide="arrow-up-right"></i> +${gdpPctChange.toFixed(1)}% YoY`;
    } else {
      this.elements.avgGdpTrend.className = "kpi-change down";
      this.elements.avgGdpTrend.innerHTML = `<i data-lucide="arrow-down-right"></i> ${gdpPctChange.toFixed(1)}% YoY`;
    }

    // 5. Average Schooling
    const validSchool = filteredData.filter(d => isNum(d.Schooling));
    const avgSchoolVal = validSchool.length > 0
      ? validSchool.reduce((sum, d) => sum + d.Schooling, 0) / validSchool.length
      : 0;
    
    const prevSchoolRows = prevYearData.filter(d => isNum(d.Schooling));
    const prevAvgSchool = prevSchoolRows.length > 0 
      ? prevSchoolRows.reduce((sum, d) => sum + d.Schooling, 0) / prevSchoolRows.length 
      : avgSchoolVal;
      
    const schoolPctChange = prevAvgSchool > 0 ? ((avgSchoolVal - prevAvgSchool) / prevAvgSchool) * 100 : 0;
    this.animateCounter(this.elements.avgSchooling, avgSchoolVal, 1, '', ' yrs');
    
    if (schoolPctChange >= 0) {
      this.elements.avgSchoolingTrend.className = "kpi-change up";
      this.elements.avgSchoolingTrend.innerHTML = `<i data-lucide="arrow-up-right"></i> +${schoolPctChange.toFixed(2)}% YoY`;
    } else {
      this.elements.avgSchoolingTrend.className = "kpi-change down";
      this.elements.avgSchoolingTrend.innerHTML = `<i data-lucide="arrow-down-right"></i> ${schoolPctChange.toFixed(2)}% YoY`;
    }

    // 6. Countries Tracked
    const countries = [...new Set(filteredData.map(d => d.Country))];
    this.animateCounter(this.elements.countriesCount, countries.length, 0, '', '');
    
    const totalCountries = [...new Set(fullData.map(d => d.Country))].length;
    const countriesPctVal = (countries.length / totalCountries) * 100;
    this.elements.countriesPct.textContent = `${countriesPctVal.toFixed(0)}% of global database`;

    // 7. Sparkline Plotting (Aggregate stats over the years 2000-2015 for context)
    const years = Array.from({length: 16}, (_, i) => 2000 + i);
    
    const avgLifeHistory = [];
    const maxLifeHistory = [];
    const minLifeHistory = [];
    const avgGdpHistory = [];
    const avgSchoolHistory = [];
    const countriesHistory = [];

    years.forEach(yr => {
      const yrData = fullData.filter(d => d.Year === yr && (filteredData[0].Status === 'All' || d.Status === filteredData[0].Status));
      
      const lData = yrData.filter(d => isNum(d['Life expectancy']));
      const gData = yrData.filter(d => isNum(d.GDP));
      const sData = yrData.filter(d => isNum(d.Schooling));

      avgLifeHistory.push(lData.length > 0 ? lData.reduce((sum, d) => sum + d['Life expectancy'], 0) / lData.length : 0);
      maxLifeHistory.push(lData.length > 0 ? Math.max(...lData.map(d => d['Life expectancy'])) : 0);
      minLifeHistory.push(lData.length > 0 ? Math.min(...lData.map(d => d['Life expectancy'])) : 0);
      avgGdpHistory.push(gData.length > 0 ? gData.reduce((sum, d) => sum + d.GDP, 0) / gData.length : 0);
      avgSchoolHistory.push(sData.length > 0 ? sData.reduce((sum, d) => sum + d.Schooling, 0) / sData.length : 0);
      countriesHistory.push([...new Set(yrData.map(d => d.Country))].length);
    });

    // Render SPARKLINE SVGs
    this.renderSparkline(this.elements.sparkAvgLife, avgLifeHistory, '#3B82F6');
    this.renderSparkline(this.elements.sparkMaxLife, maxLifeHistory, '#22C55E');
    this.renderSparkline(this.elements.sparkMinLife, minLifeHistory, '#EF4444');
    this.renderSparkline(this.elements.sparkAvgGdp, avgGdpHistory, '#3B82F6');
    this.renderSparkline(this.elements.sparkAvgSchooling, avgSchoolHistory, '#22C55E');
    this.renderSparkline(this.elements.sparkCountries, countriesHistory, '#F59E0B');

    // Refresh Lucide icons in the DOM
    lucide.createIcons();
  }
};

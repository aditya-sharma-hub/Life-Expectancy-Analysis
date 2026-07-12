/**
 * Correlation & Relationship Component Module
 * Handles Pearson Correlation heatmaps and interactive multivariate scatter plots with real-time OLS calculations.
 */
const CorrelationModule = {
  elements: {},
  filteredData: [],
  fullData: [],

  // Correlation heatmap variables list (matching the CSV stripped column names)
  heatmapVars: [
    'Life expectancy', 'Adult Mortality', 'infant deaths', 'Alcohol', 
    'percentage expenditure', 'BMI', 'under-five deaths', 'HIV/AIDS', 
    'GDP', 'Population', 'Income composition of resources', 'Schooling'
  ],

  // Labels for rendering heatmap axes
  varLabels: [
    'Life Exp', 'Adult Mort', 'Infant Deaths', 'Alcohol', 
    '% Health Exp', 'BMI', 'U5 Deaths', 'HIV/AIDS', 
    'GDP', 'Population', 'Income Comp', 'Schooling'
  ],

  /**
   * Initializes the Correlation module
   */
  init() {
    this.elements = {
      heatmap: document.getElementById('correlation-heatmap'),
      scatterPlot: document.getElementById('relationship-scatter-plot'),
      xSelect: document.getElementById('scatter-x-select'),
      ySelect: document.getElementById('scatter-y-select'),
      
      // OLS stat labels
      rLabel: document.getElementById('scatter-r-val'),
      r2Label: document.getElementById('scatter-r2-val'),
      pLabel: document.getElementById('scatter-p-val'),
      obsLabel: document.getElementById('scatter-obs-val'),
      explanation: document.getElementById('scatter-explanation')
    };

    // Attach scatter axis select listeners
    const triggerUpdate = () => {
      this.renderScatterPlot();
    };
    if (this.elements.xSelect) this.elements.xSelect.addEventListener('change', triggerUpdate);
    if (this.elements.ySelect) this.elements.ySelect.addEventListener('change', triggerUpdate);
  },

  /**
   * Renders the precalculated Pearson correlation matrix as a Plotly Heatmap
   */
  renderHeatmap(theme) {
    if (!this.elements.heatmap) return;
    const isDark = theme === 'dark';

    // Retrieve correlation matrix from precalculated python analysis
    const matrixDict = window.ANALYSIS_METADATA ? window.ANALYSIS_METADATA.correlation_matrix : null;
    if (!matrixDict) {
      this.elements.heatmap.innerHTML = "<div style='color:var(--danger); text-align:center;'>Metadata unavailable. Heatmap skipped.</div>";
      return;
    }

    // Build 2D grid array for heatmap
    const zData = [];
    this.heatmapVars.forEach(rowVar => {
      const zRow = [];
      this.heatmapVars.forEach(colVar => {
        // Handle variations in keys if any
        const val = (matrixDict[rowVar] && matrixDict[rowVar][colVar] !== undefined)
          ? matrixDict[rowVar][colVar]
          : 0;
        zRow.push(val);
      });
      zData.push(zRow);
    });

    const traceHeatmap = {
      z: zData,
      x: this.varLabels,
      y: this.varLabels,
      type: 'heatmap',
      colorscale: [
        [0, '#EF4444'],      // Strong negative (Red)
        [0.5, '#1E293B'],    // Neutral (Deep Slate)
        [1, '#22C55E']       // Strong positive (Green)
      ],
      zmin: -1,
      zmax: 1,
      colorbar: {
        title: { text: 'r value', font: { size: 9 } },
        thickness: 15,
        len: 0.9,
        tickfont: { size: 9, color: isDark ? '#94A3B8' : '#475569' }
      },
      hovertemplate: 'X: %{x}<br>Y: %{y}<br>Correlation (r): %{z:.3f}<extra></extra>'
    };

    const layout = {
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      font: { family: 'Inter, sans-serif', color: isDark ? '#94A3B8' : '#475569' },
      margin: { t: 30, r: 10, b: 50, l: 80 },
      xaxis: {
        side: 'bottom',
        tickangle: -45,
        zeroline: false
      },
      yaxis: {
        zeroline: false,
        autorange: 'reversed'
      }
    };

    Plotly.newPlot(this.elements.heatmap, [traceHeatmap], layout, { responsive: true, displayModeBar: false });
  },

  /**
   * Helper to perform OLS Simple Linear Regression in Javascript
   * @param {number[]} x - Independent variable vector
   * @param {number[]} y - Dependent variable vector
   */
  calculateOLS(x, y) {
    const n = x.length;
    if (n < 2) return { slope: 0, intercept: 0, r: 0, r2: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
      sumY2 += y[i] * y[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Pearson correlation
    const num = (n * sumXY - sumX * sumY);
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = den === 0 ? 0 : num / den;
    const r2 = r * r;

    return { slope, intercept, r, r2 };
  },

  /**
   * Renders the interactive relationship scatter plot with real-time OLS regression lines
   */
  renderScatterPlot(theme = 'dark') {
    if (!this.elements.scatterPlot) return;
    const isDark = theme === 'dark';

    const xAttr = this.elements.xSelect.value;
    const yAttr = this.elements.ySelect.value;

    // Filter valid rows for selected features
    const validRows = this.filteredData.filter(d => 
      d[xAttr] !== null && d[xAttr] !== undefined && !isNaN(d[xAttr]) &&
      d[yAttr] !== null && d[yAttr] !== undefined && !isNaN(d[yAttr])
    );

    if (validRows.length < 2) {
      this.elements.scatterPlot.innerHTML = "<div style='color:var(--danger); text-align:center; padding: 20px;'>Insufficient data points for scatter plot.</div>";
      return;
    }

    // Separate developed/developing rows for colored plotting
    const devRows = validRows.filter(d => d.Status === 'Developed');
    const dgRows = validRows.filter(d => d.Status === 'Developing');

    const getTrace = (rows, name, color) => {
      // Scale population for bubble sizes
      // Median population is ~8 million, let's normalize sizing
      const sizes = rows.map(d => {
        const pop = d.Population || 5000000;
        return Math.max(6, Math.min(35, Math.sqrt(pop) / 200));
      });

      return {
        x: rows.map(d => d[xAttr]),
        y: rows.map(d => d[yAttr]),
        text: rows.map(d => `${d.Country}<br>Pop: ${(d.Population || 0).toLocaleString()}`),
        name: name,
        type: 'scatter',
        mode: 'markers',
        marker: {
          color: color,
          size: sizes,
          opacity: 0.7,
          line: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', width: 1 }
        },
        hovertemplate: '<b>%{text}</b><br>' + xAttr + ': %{x:.2f}<br>' + yAttr + ': %{y:.2f}<extra></extra>'
      };
    };

    const traces = [];
    if (devRows.length > 0) traces.push(getTrace(devRows, 'Developed Countries', '#22C55E'));
    if (dgRows.length > 0) traces.push(getTrace(dgRows, 'Developing Countries', '#3B82F6'));

    // Perform OLS regression on combined valid rows
    const xVec = validRows.map(d => d[xAttr]);
    const yVec = validRows.map(d => d[yAttr]);
    const ols = this.calculateOLS(xVec, yVec);

    // Generate Regression Line points
    const minX = Math.min(...xVec);
    const maxX = Math.max(...xVec);
    const lineX = [minX, maxX];
    const lineY = [ols.slope * minX + ols.intercept, ols.slope * maxX + ols.intercept];

    traces.push({
      x: lineX,
      y: lineY,
      name: 'OLS Regression Line',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#F59E0B', width: 2, dash: 'solid' }
    });

    // Update regression UI stats panel
    this.elements.rLabel.textContent = ols.r.toFixed(3);
    this.elements.r2Label.textContent = ols.r2.toFixed(3);
    this.elements.obsLabel.textContent = validRows.length;
    
    // Generate description text dynamically
    const strength = Math.abs(ols.r) > 0.7 ? 'strong' : Math.abs(ols.r) > 0.4 ? 'moderate' : 'weak';
    const direction = ols.r >= 0 ? 'positive' : 'negative';
    this.elements.explanation.innerHTML = `
      Found a <strong>${strength} ${direction}</strong> linear association (r = ${ols.r.toFixed(3)}) between ${xAttr} and ${yAttr}. 
      The linear equation is: <code>y = ${ols.slope.toFixed(4)}x + ${ols.intercept.toFixed(2)}</code>. 
      About <strong>${(ols.r2 * 100).toFixed(1)}%</strong> of variance in ${yAttr} is explained by ${xAttr}.
    `;

    const layout = {
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      font: { family: 'Inter, sans-serif', color: isDark ? '#94A3B8' : '#475569', size: 10 },
      margin: { t: 20, r: 20, b: 35, l: 45 },
      xaxis: {
        title: xAttr,
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        zeroline: false
      },
      yaxis: {
        title: yAttr,
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        zeroline: false
      },
      showlegend: true,
      legend: { orientation: 'h', y: -0.18, x: 0.5, xanchor: 'center' }
    };

    Plotly.newPlot(this.elements.scatterPlot, traces, layout, { responsive: true, displayModeBar: false });
  },

  /**
   * Refreshes the correlation visualizations
   * @param {Object[]} filteredData - Subset matching current filters
   * @param {Object[]} fullData - Entire database
   * @param {number} selectedYear - Current selected year
   * @param {string} statusFilter - Global status filter ('All', 'Developed', 'Developing')
   * @param {string} theme - 'dark' or 'light'
   */
  update(filteredData, fullData, selectedYear, statusFilter, theme) {
    this.filteredData = filteredData;
    this.fullData = fullData;
    
    this.renderHeatmap(theme);
    this.renderScatterPlot(theme);
  }
};

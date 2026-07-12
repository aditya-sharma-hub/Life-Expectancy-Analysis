/**
 * Data Quality Component Module
 * Handles calculations and plotting for missing values summaries, distribution histograms, 
 * and outlier boxplots.
 */
const QualityModule = {
  elements: {},
  filteredData: [],
  fullData: [],

  /**
   * Initializes the Quality module
   */
  init() {
    this.elements = {
      boxSelect: document.getElementById('quality-box-select'),
      histSelect: document.getElementById('quality-hist-select'),
      missingBar: document.getElementById('quality-missing-bar-chart'),
      boxplot: document.getElementById('quality-boxplot'),
      histogram: document.getElementById('quality-histogram')
    };

    // Attach listeners for dynamic selectors
    if (this.elements.boxSelect) {
      this.elements.boxSelect.addEventListener('change', () => this.renderBoxplot());
    }
    if (this.elements.histSelect) {
      this.elements.histSelect.addEventListener('change', () => this.renderHistogram());
    }
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
      margin: { t: 30, r: 20, b: 30, l: 50 },
      xaxis: {
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        zeroline: false
      },
      yaxis: {
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        zeroline: false
      }
    };
  },

  /**
   * Renders the bar chart showing null percentages for each feature in raw WHO database
   */
  renderMissingValuesChart(theme) {
    if (!this.elements.missingBar) return;
    const isDark = theme === 'dark';

    const qualityMeta = window.ANALYSIS_METADATA ? window.ANALYSIS_METADATA.data_quality : null;
    if (!qualityMeta || !qualityMeta.missing_info) return;

    const info = qualityMeta.missing_info;
    const features = Object.keys(info);
    
    // Calculate null percentage for each
    const chartData = features.map(feat => ({
      feature: feat,
      pct: info[feat].null_percentage
    }))
    .filter(d => d.pct > 0) // Only show features with missing values
    .sort((a, b) => b.pct - a.pct); // Sort descending

    const traceBar = {
      x: chartData.map(d => d.feature),
      y: chartData.map(d => d.pct),
      type: 'bar',
      marker: {
        color: '#EF4444',
        opacity: 0.8
      },
      hovertemplate: '<b>%{x}</b><br>Null Percentage: %{y:.2f}%<extra></extra>'
    };

    const layout = this.getPlotlyLayout(theme);
    layout.xaxis.tickangle = -45;
    layout.yaxis.title = 'Null Percentage (%)';
    layout.margin = { t: 30, r: 20, b: 80, l: 50 };

    Plotly.newPlot(this.elements.missingBar, [traceBar], layout, { responsive: true, displayModeBar: false });
  },

  /**
   * Renders the outlier detection Boxplot based on selected feature
   */
  renderBoxplot(theme = 'dark') {
    if (!this.elements.boxplot) return;
    const isDark = theme === 'dark';

    const feat = this.elements.boxSelect.value;
    
    // Get valid numerical values for selected feature in filtered data
    const values = this.filteredData
      .map(d => d[feat])
      .filter(v => v !== null && v !== undefined && !isNaN(v));

    if (values.length === 0) {
      this.elements.boxplot.innerHTML = "<div style='color:var(--danger); text-align:center;'>No observations for selected parameter.</div>";
      return;
    }

    const traceBox = {
      y: values,
      type: 'box',
      name: feat,
      boxpoints: 'suspectedoutliers', // Highlights suspected outliers in boxplot
      marker: {
        color: '#3B82F6',
        outliercolor: '#EF4444',
        line: { color: '#3B82F6', width: 1 }
      },
      fillcolor: 'rgba(59, 130, 246, 0.15)'
    };

    const layout = this.getPlotlyLayout(theme);
    layout.yaxis.title = feat;
    layout.xaxis = { showticklabels: false, zeroline: false };

    Plotly.newPlot(this.elements.boxplot, [traceBox], layout, { responsive: true, displayModeBar: false });
  },

  /**
   * Renders the distribution Histogram based on selected feature
   */
  renderHistogram(theme = 'dark') {
    if (!this.elements.histogram) return;
    const isDark = theme === 'dark';

    const feat = this.elements.histSelect.value;
    
    // Get valid numerical values for selected feature in filtered data
    const values = this.filteredData
      .map(d => d[feat])
      .filter(v => v !== null && v !== undefined && !isNaN(v));

    if (values.length === 0) {
      this.elements.histogram.innerHTML = "<div style='color:var(--danger); text-align:center;'>No observations for selected parameter.</div>";
      return;
    }

    const traceHist = {
      x: values,
      type: 'histogram',
      name: feat,
      marker: {
        color: '#22C55E',
        opacity: 0.8,
        line: { color: '#16A34A', width: 1 }
      },
      autobinx: true
    };

    const layout = this.getPlotlyLayout(theme);
    layout.xaxis.title = feat;
    layout.yaxis.title = 'Frequency Count';

    Plotly.newPlot(this.elements.histogram, [traceHist], layout, { responsive: true, displayModeBar: false });
  },

  /**
   * Refreshes the data quality panels
   * @param {Object[]} filteredData - Subset matching current filters
   * @param {Object[]} fullData - Entire database
   * @param {number} selectedYear - Current selected year
   * @param {string} statusFilter - Global status filter ('All', 'Developed', 'Developing')
   * @param {string} theme - 'dark' or 'light'
   */
  update(filteredData, fullData, selectedYear, statusFilter, theme) {
    this.filteredData = filteredData;
    this.fullData = fullData;

    this.renderMissingValuesChart(theme);
    this.renderBoxplot(theme);
    this.renderHistogram(theme);
  }
};

/**
 * Predictive Analytics Component Module
 * Runs in-browser OLS linear regression simulations, outputs custom prediction stories, 
 * and draws the ML feature importance horizontal bar chart.
 */
const PredictiveModule = {
  elements: {},
  fullData: [],

  /**
   * Initializes the Predictive module
   */
  init() {
    this.elements = {
      gdp: document.getElementById('sim-gdp'),
      schooling: document.getElementById('sim-schooling'),
      bmi: document.getElementById('sim-bmi'),
      income: document.getElementById('sim-income'),
      mortality: document.getElementById('sim-mortality'),
      alcohol: document.getElementById('sim-alcohol'),
      population: document.getElementById('sim-population'),
      hiv: document.getElementById('sim-hiv'),
      infant: document.getElementById('sim-infant'),
      status: document.getElementById('sim-status'),
      
      // Control buttons & output divs
      predictBtn: document.getElementById('sim-predict-btn'),
      outputVal: document.getElementById('sim-output-val'),
      explanationBox: document.getElementById('sim-explanation-box'),
      importanceChart: document.getElementById('predictive-importance-chart')
    };

    // Attach simulation recalculation triggers
    const runSimulation = () => {
      this.calculateSimulation();
    };

    if (this.elements.predictBtn) {
      this.elements.predictBtn.addEventListener('click', (e) => {
        e.preventDefault();
        runSimulation();
      });
    }

    // Recalculate dynamically on any slider/input change for high reactivity!
    const inputs = [
      this.elements.gdp, this.elements.schooling, this.elements.bmi, 
      this.elements.income, this.elements.mortality, this.elements.alcohol, 
      this.elements.population, this.elements.hiv, this.elements.infant, 
      this.elements.status
    ];
    inputs.forEach(input => {
      if (input) {
        input.addEventListener('change', runSimulation);
        input.addEventListener('keyup', runSimulation);
      }
    });
  },

  /**
   * Evaluates the regression model based on current UI inputs
   */
  calculateSimulation() {
    const meta = window.ANALYSIS_METADATA ? window.ANALYSIS_METADATA.regression_model : null;
    if (!meta) return;

    // Get input values, fallback to imputation medians if empty
    const getVal = (el, key) => {
      const val = parseFloat(el.value);
      return isNaN(val) ? meta.imputation_values[key] : val;
    };

    const gdpVal = getVal(this.elements.gdp, 'GDP');
    const schoolVal = getVal(this.elements.schooling, 'Schooling');
    const bmiVal = getVal(this.elements.bmi, 'BMI');
    const incomeVal = getVal(this.elements.income, 'Income composition of resources');
    const mortVal = getVal(this.elements.mortality, 'Adult Mortality');
    const alcVal = getVal(this.elements.alcohol, 'Alcohol');
    const popVal = getVal(this.elements.population, 'Population');
    const hivVal = getVal(this.elements.hiv, 'HIV/AIDS');
    const infantVal = getVal(this.elements.infant, 'infant deaths');
    
    const statusVal = this.elements.status.value;
    const statusEncoded = statusVal === 'Developed' ? 1.0 : 0.0;

    // Regression formula execution
    const coef = meta.coefficients;
    const intercept = meta.intercept;

    let prediction = intercept +
      (gdpVal * coef['GDP']) +
      (schoolVal * coef['Schooling']) +
      (bmiVal * coef['BMI']) +
      (incomeVal * coef['Income composition of resources']) +
      (mortVal * coef['Adult Mortality']) +
      (alcVal * coef['Alcohol']) +
      (popVal * coef['Population']) +
      (hivVal * coef['HIV/AIDS']) +
      (infantVal * coef['infant deaths']) +
      (statusEncoded * coef['Status_encoded']);

    // Constraints check (Life expectancy cannot logically go below 35 or above 90 in typical OLS outputs)
    prediction = Math.max(35, Math.min(90, prediction));

    // Update simulation output value in UI
    if (this.elements.outputVal) {
      this.elements.outputVal.textContent = prediction.toFixed(1);
    }

    // Build automated explanation story
    let story = `<strong>Prediction Narrative:</strong> Based on the model inputs, the predicted life expectancy is <strong>${prediction.toFixed(1)} years</strong>. `;
    
    // Highlight major drivers/inhibitors in the current inputs
    const schoolingContribution = schoolVal * coef['Schooling'];
    const incomeContribution = incomeVal * coef['Income composition of resources'];
    const hivContribution = hivVal * coef['HIV/AIDS'];
    const mortContribution = mortVal * coef['Adult Mortality'];

    const elementsList = [];
    if (schoolVal > 14) {
      elementsList.push(`exceptional schooling duration (${schoolVal.toFixed(1)} yrs) adds about <strong>+${schoolingContribution.toFixed(1)} years</strong> of longevity`);
    } else if (schoolVal < 8) {
      elementsList.push(`low educational exposure (${schoolVal.toFixed(1)} yrs) restricts life expectancy`);
    }

    if (hivVal > 3.0) {
      elementsList.push(`critical HIV/AIDS prevalence (${hivVal.toFixed(1)} per 1,000) severely penalizes prediction by <strong>${hivContribution.toFixed(1)} years</strong>`);
    }

    if (mortVal > 300) {
      elementsList.push(`extremely high adult mortality rates (${mortVal} per 1k) reduce predicted longevity by <strong>${Math.abs(mortContribution).toFixed(1)} years</strong>`);
    } else if (mortVal < 100) {
      elementsList.push(`excellent control of adult mortality (${mortVal} per 1k) increases Longevity`);
    }

    if (incomeVal > 0.8) {
      elementsList.push(`premium resource index (${incomeVal.toFixed(3)}) drives a strong positive impact of <strong>+${incomeContribution.toFixed(1)} years</strong>`);
    }

    if (elementsList.length > 0) {
      story += `Key drivers include: the country's ${elementsList.join('; and the country\'s ')}.`;
    } else {
      story += "All simulated parameters lie within global baseline ranges. No extreme outliers or negative indicators are heavily influencing this prediction.";
    }

    if (this.elements.explanationBox) {
      this.elements.explanationBox.innerHTML = story;
    }
  },

  /**
   * Draws the horizontal feature importance bar chart
   */
  renderImportanceChart(theme = 'dark') {
    if (!this.elements.importanceChart) return;
    const isDark = theme === 'dark';

    const impData = window.ANALYSIS_METADATA ? window.ANALYSIS_METADATA.feature_importance : null;
    if (!impData) return;

    // Filter to predict features only
    const featuresMap = {
      'GDP': 'GDP per Capita',
      'Schooling': 'Schooling Duration',
      'BMI': 'Body Mass Index',
      'Income composition of resources': 'Income Composition',
      'Adult Mortality': 'Adult Mortality Rate',
      'Alcohol': 'Alcohol Intake',
      'Population': 'Total Population',
      'HIV/AIDS': 'HIV/AIDS Rate',
      'infant deaths': 'Infant Mortality',
      'Status_encoded': 'Developed Country Status'
    };

    // Sort by importance score ascending for a bottom-up horizontal bar chart
    const dataSorted = [...impData]
      .filter(d => featuresMap[d.feature])
      .map(d => ({
        ...d,
        label: featuresMap[d.feature]
      }))
      .reverse();

    const yLabels = dataSorted.map(d => d.label);
    const xScores = dataSorted.map(d => d.importance_score);
    const colors = dataSorted.map(d => d.direction === 'positive' ? '#22C55E' : '#EF4444');

    const traceBar = {
      x: xScores,
      y: yLabels,
      type: 'bar',
      orientation: 'h',
      marker: {
        color: colors,
        opacity: 0.8
      },
      hovertemplate: '<b>%{y}</b><br>Importance Score: %{x:.3f}<extra></extra>'
    };

    const layout = {
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      font: { family: 'Inter, sans-serif', color: isDark ? '#94A3B8' : '#475569', size: 9 },
      margin: { t: 10, r: 20, b: 30, l: 140 },
      xaxis: {
        title: 'Feature Importance Score (Standardized Beta Weight)',
        gridcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        zeroline: false
      },
      yaxis: {
        zeroline: false
      }
    };

    Plotly.newPlot(this.elements.importanceChart, [traceBar], layout, { responsive: true, displayModeBar: false });
  },

  /**
   * Refreshes the predictive simulator panel
   * @param {Object[]} filteredData - Subset matching current filters
   * @param {Object[]} fullData - Entire database
   * @param {number} selectedYear - Current selected year
   * @param {string} statusFilter - Global status filter ('All', 'Developed', 'Developing')
   * @param {string} theme - 'dark' or 'light'
   */
  update(filteredData, fullData, selectedYear, statusFilter, theme) {
    this.fullData = fullData;
    
    // Set simulator inputs based on averages of current filtered data to give sensible start points!
    const meta = window.ANALYSIS_METADATA ? window.ANALYSIS_METADATA.regression_model : null;
    if (meta && this.fullData.length > 0 && !this.elements.gdp.dataset.initialized) {
      // Pre-fill inputs with dataset averages for selected filters
      const fillInput = (el, key, decimals = 2) => {
        if (!el) return;
        const validVals = filteredData.map(d => d[key]).filter(v => v !== null && v !== undefined && !isNaN(v));
        const avg = validVals.length > 0 ? validVals.reduce((sum, v) => sum + v, 0) / validVals.length : meta.imputation_values[key];
        el.value = avg.toFixed(decimals);
      };
      
      fillInput(this.elements.gdp, 'GDP', 0);
      fillInput(this.elements.schooling, 'Schooling', 1);
      fillInput(this.elements.bmi, 'BMI', 1);
      fillInput(this.elements.income, 'Income composition of resources', 3);
      fillInput(this.elements.mortality, 'Adult Mortality', 0);
      fillInput(this.elements.alcohol, 'Alcohol', 1);
      fillInput(this.elements.population, 'Population', 0);
      fillInput(this.elements.hiv, 'HIV/AIDS', 1);
      fillInput(this.elements.infant, 'infant deaths', 0);
      
      this.elements.status.value = statusFilter === 'All' ? 'Developing' : statusFilter;
      
      // Mark as initialized so we don't overwrite user custom adjustments on every year filter change!
      this.elements.gdp.dataset.initialized = "true";
    }

    this.calculateSimulation();
    this.renderImportanceChart(theme);
  }
};

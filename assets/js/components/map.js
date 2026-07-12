/**
 * Map Component Module
 * Handles Leaflet.js world map initialization, choropleth rendering, and tooltips.
 */
const MapModule = {
  map: null,
  geoJsonLayer: null,
  geoJsonData: null,
  fullData: [],
  selectedYear: 2015,
  statusFilter: 'All',
  theme: 'dark',
  tileLayer: null,

  // Standard name dictionary to map GeoJSON country names to WHO dataset names
  countryNameMap: {
    "united states of america": "United States of America",
    "united states": "United States of America",
    "united kingdom": "United Kingdom of Great Britain and Northern Ireland",
    "russian federation": "Russian Federation",
    "russia": "Russian Federation",
    "viet nam": "Viet Nam",
    "vietnam": "Viet Nam",
    "iran": "Iran (Islamic Republic of)",
    "iran (islamic republic of)": "Iran (Islamic Republic of)",
    "venezuela": "Venezuela (Bolivarian Republic of)",
    "venezuela (bolivarian republic of)": "Venezuela (Bolivarian Republic of)",
    "syrian arab republic": "Syrian Arab Republic",
    "syria": "Syrian Arab Republic",
    "bolivia": "Bolivia (Plurinational State of)",
    "bolivia (plurinational state of)": "Bolivia (Plurinational State of)",
    "republic of korea": "Republic of Korea",
    "south korea": "Republic of Korea",
    "tanzania": "United Republic of Tanzania",
    "united republic of tanzania": "United Republic of Tanzania",
    "democratic republic of the congo": "Democratic Republic of the Congo",
    "congo, dem. rep.": "Democratic Republic of the Congo",
    "congo": "Congo",
    "congo, rep.": "Congo",
    "cote d'ivoire": "Côte d'Ivoire",
    "ivory coast": "Côte d'Ivoire",
    "lao pdr": "Lao People's Democratic Republic",
    "laos": "Lao People's Democratic Republic",
    "moldova": "Republic of Moldova",
    "republic of moldova": "Republic of Moldova"
  },

  /**
   * Initializes the map
   */
  async init() {
    const mapContainer = document.getElementById('world-map');
    if (!mapContainer) return;

    // Create Leaflet map centered on world
    this.map = L.map('world-map', {
      center: [20, 0],
      zoom: 2,
      minZoom: 1.5,
      maxZoom: 8,
      zoomControl: true,
      attributionControl: false
    });

    // Dark professional tile layer matching #0c1220 / slate theme
    this.tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    // Render legend
    this.renderLegend();

    // Load GeoJSON data from public CDN
    try {
      const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
      if (response.ok) {
        this.geoJsonData = await response.json();
        this.drawChoropleth();
      } else {
        console.error("Failed to fetch world geojson. Map rendering skipped.");
        mapContainer.innerHTML = "<div class='error-msg' style='padding: 20px; color: var(--danger); text-align: center;'>Failed to load world map database boundaries. (HTTP error)</div>";
      }
    } catch (e) {
      console.error("Error loading world geojson:", e);
      mapContainer.innerHTML = "<div class='error-msg' style='padding: 20px; color: var(--danger); text-align: center;'>Connection error: Unable to load interactive world map. Check network connectivity.</div>";
    }
  },

  /**
   * Resolves a country name from GeoJSON to WHO dataset name
   * @param {string} rawName - The country name in GeoJSON properties
   */
  resolveCountryName(rawName) {
    if (!rawName) return null;
    const lower = rawName.toLowerCase().trim();
    if (this.countryNameMap[lower]) {
      return this.countryNameMap[lower];
    }
    return rawName;
  },

  /**
   * Colors scale for life expectancy
   * @param {number} val - Life expectancy value
   */
  getColor(val) {
    if (val === null || val === undefined || isNaN(val)) {
      return this.theme === 'light' ? '#CBD5E1' : '#334155';
    }
    return val > 80 ? '#22C55E' : // Green
           val > 75 ? '#3B82F6' : // Blue
           val > 70 ? '#60A5FA' : // Light Blue
           val > 65 ? '#F59E0B' : // Amber
           val > 55 ? '#F97316' : // Orange
                      '#EF4444';  // Red
  },

  /**
   * Draws the choropleth layer on the map
   */
  drawChoropleth() {
    if (!this.map || !this.geoJsonData) return;

    // Remove existing layer if any
    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }

    // Map each geojson country to its metrics
    const yearData = this.fullData.filter(d => d.Year === this.selectedYear);

    this.geoJsonLayer = L.geoJson(this.geoJsonData, {
      style: (feature) => {
        const geoCountry = feature.properties.ADMIN || feature.properties.name;
        const matchedName = this.resolveCountryName(geoCountry);
        const dataRow = yearData.find(d => d.Country.toLowerCase() === (matchedName ? matchedName.toLowerCase() : geoCountry.toLowerCase()));
        
        let value = null;
        let isStatusMatched = true;

        if (dataRow) {
          value = dataRow['Life expectancy'];
          if (this.statusFilter !== 'All' && dataRow.Status !== this.statusFilter) {
            isStatusMatched = false;
          }
        }

        const isLight = this.theme === 'light';

        return {
          fillColor: isStatusMatched ? this.getColor(value) : (isLight ? '#E2E8F0' : '#1E293B'),
          weight: 1,
          opacity: 0.5,
          color: isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(255, 255, 255, 0.15)',
          fillOpacity: isStatusMatched && value !== null && !isNaN(value) ? 0.75 : 0.25
        };
      },
      onEachFeature: (feature, layer) => {
        const geoCountry = feature.properties.ADMIN || feature.properties.name;
        const matchedName = this.resolveCountryName(geoCountry);
        const dataRow = yearData.find(d => d.Country.toLowerCase() === (matchedName ? matchedName.toLowerCase() : geoCountry.toLowerCase()));
        
        let tooltipContent = '';
        if (dataRow) {
          const life = dataRow['Life expectancy'] ? dataRow['Life expectancy'].toFixed(1) + ' yrs' : 'N/A';
          const gdp = dataRow.GDP ? '$' + dataRow.GDP.toLocaleString() : 'N/A';
          const schooling = dataRow.Schooling ? dataRow.Schooling.toFixed(1) + ' yrs' : 'N/A';
          const mortality = dataRow['Adult Mortality'] ? dataRow['Adult Mortality'] + '/1k' : 'N/A';
          const status = dataRow.Status || 'Developing';

          tooltipContent = `
            <div class="tooltip-title">${dataRow.Country}</div>
            <div class="tooltip-row"><span class="tooltip-label">Status:</span><span class="tooltip-val">${status}</span></div>
            <div class="tooltip-row"><span class="tooltip-label">Life Expectancy:</span><span class="tooltip-val" style="color:${this.getColor(dataRow['Life expectancy'])};">${life}</span></div>
            <div class="tooltip-row"><span class="tooltip-label">GDP per Capita:</span><span class="tooltip-val">${gdp}</span></div>
            <div class="tooltip-row"><span class="tooltip-label">Schooling:</span><span class="tooltip-val">${schooling}</span></div>
            <div class="tooltip-row"><span class="tooltip-label">Adult Mortality:</span><span class="tooltip-val">${mortality}</span></div>
          `;
        } else {
          tooltipContent = `
            <div class="tooltip-title">${geoCountry}</div>
            <div class="tooltip-row" style="color:var(--text-muted);">No WHO Data for ${this.selectedYear}</div>
          `;
        }

        layer.bindTooltip(tooltipContent, {
          sticky: true,
          className: 'leaflet-tooltip-custom'
        });

        // Hover animations
        layer.on({
          mouseover: (e) => {
            const layerEl = e.target;
            layerEl.setStyle({
              weight: 2,
              color: '#3B82F6',
              fillOpacity: 0.95
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              layerEl.bringToFront();
            }
          },
          mouseout: (e) => {
            this.geoJsonLayer.resetStyle(e.target);
          },
          click: (e) => {
            if (dataRow) {
              // Trigger country explorer view update when country is clicked on map
              // Emit custom event
              const event = new CustomEvent('country-selected', { detail: dataRow.Country });
              window.dispatchEvent(event);
            }
          }
        });
      }
    }).addTo(this.map);
  },

  /**
   * Renders the map color legend
   */
  renderLegend() {
    const mapWrapper = document.querySelector('.map-container-wrapper');
    if (!mapWrapper) return;
    
    // Check if legend already exists
    let legend = mapWrapper.querySelector('.map-legend');
    if (!legend) {
      legend = document.createElement('div');
      legend.className = 'map-legend';
      mapWrapper.appendChild(legend);
    }
    
    const grades = [0, 55, 65, 70, 75, 80];
    const labels = ['< 55 yrs', '55 - 65 yrs', '65 - 70 yrs', '70 - 75 yrs', '75 - 80 yrs', '> 80 yrs'];
    
    let html = `<div class="legend-title">Life Expectancy</div>`;
    for (let i = 0; i < grades.length; i++) {
      const color = this.getColor(grades[i] + 1);
      html += `
        <div class="legend-item">
          <span class="legend-color" style="background-color: ${color}"></span>
          <span>${labels[i]}</span>
        </div>
      `;
    }
    // Add missing/N/A category
    const isLight = this.theme === 'light';
    const missingColor = isLight ? '#CBD5E1' : '#334155';
    html += `
      <div class="legend-item">
        <span class="legend-color" style="background-color: ${missingColor}"></span>
        <span style="color:var(--text-muted);">No Data / Filtered</span>
      </div>
    `;
    legend.innerHTML = html;
  },

  /**
   * Updates map tile layers dynamically when switching theme
   * @param {string} theme - 'dark' or 'light'
   */
  updateTileLayer(theme) {
    if (!this.map) return;
    const isDark = theme !== 'light';
    const tileUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    
    if (this.tileLayer) {
      this.tileLayer.setUrl(tileUrl);
    } else {
      this.tileLayer = L.tileLayer(tileUrl, {
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(this.map);
    }
  },

  /**
   * Refreshes the map layer when filters change
   * @param {Object[]} filteredData - Subset of data matching current filters
   * @param {Object[]} fullData - Entire database
   * @param {number} selectedYear - Current selected year
   * @param {string} statusFilter - 'All', 'Developed', or 'Developing'
   * @param {string} theme - 'dark' or 'light'
   */
  update(filteredData, fullData, selectedYear, statusFilter, theme) {
    this.fullData = fullData;
    this.selectedYear = selectedYear;
    this.statusFilter = statusFilter;
    this.theme = theme || 'dark';
    
    document.getElementById('map-year-indicator').textContent = `Year: ${selectedYear}`;
    
    this.updateTileLayer(this.theme);
    this.renderLegend();
    
    if (this.geoJsonData) {
      this.drawChoropleth();
    }
  }
};

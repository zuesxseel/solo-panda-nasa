// Planet Generator UI Component
// This component provides the user interface for generating planets with SDXL LoRA

import { planetGenerator } from './planet-generator.js';
import { PLANET_PRESETS } from './api-config.js';

export class PlanetGeneratorUI {
  constructor(containerId, onPlanetGenerated = null) {
    this.container = document.getElementById(containerId);
    this.onPlanetGenerated = onPlanetGenerated;
    this.isGenerating = false;
    this.currentPlanet = null;
    
    this.init();
  }

  init() {
    this.createUI();
    this.bindEvents();
  }

  createUI() {
    this.container.innerHTML = `
      <div class="planet-generator-panel">
        <h3>AI Planet Generator</h3>
        <p>Generate custom planets using AI-powered SDXL LoRA textures</p>
        
        <div class="generator-tabs">
          <button class="tab-button active" data-tab="custom">Custom Planet</button>
          <button class="tab-button" data-tab="preset">Preset</button>
          <button class="tab-button" data-tab="exoplanet">From Exoplanet Data</button>
        </div>

        <!-- Custom Planet Tab -->
        <div class="tab-content active" id="custom-tab">
          <div class="form-group">
            <label for="planet-description">Planet Description:</label>
            <textarea id="planet-description" placeholder="Describe your planet... (e.g., 'A volcanic world with glowing lava rivers and ash clouds')" rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label for="planet-type">Planet Type:</label>
            <select id="planet-type">
              <option value="rocky">Rocky Planet</option>
              <option value="gas-giant">Gas Giant</option>
              <option value="ice-world">Ice World</option>
              <option value="desert">Desert Planet</option>
              <option value="ocean">Ocean World</option>
              <option value="volcanic">Volcanic World</option>
              <option value="dwarf">Dwarf Planet</option>
              <option value="asteroid">Asteroid</option>
            </select>
          </div>

          <div class="form-group">
            <label for="texture-types">Texture Types:</label>
            <div class="checkbox-group">
              <label><input type="checkbox" id="surface-texture" checked> Surface Texture</label>
              <label><input type="checkbox" id="bump-texture" checked> Bump Map</label>
              <label><input type="checkbox" id="atmosphere-texture"> Atmosphere</label>
            </div>
          </div>

          <div class="form-group">
            <label for="guidance-scale">Quality (Guidance Scale):</label>
            <input type="range" id="guidance-scale" min="5" max="10" step="0.5" value="8">
            <span id="guidance-value">8.0</span>
          </div>

          <button id="generate-custom-planet" class="generate-button">Generate Planet</button>
        </div>

        <!-- Preset Tab -->
        <div class="tab-content" id="preset-tab">
          <div class="form-group">
            <label for="preset-select">Choose Preset:</label>
            <select id="preset-select">
              ${Object.keys(PLANET_PRESETS).map(key => 
                `<option value="${key}">${key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')}</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="preset-description">Custom Description (Optional):</label>
            <textarea id="preset-description" placeholder="Override the default description..." rows="2"></textarea>
          </div>

          <button id="generate-preset-planet" class="generate-button">Generate from Preset</button>
        </div>

        <!-- Exoplanet Tab -->
        <div class="tab-content" id="exoplanet-tab">
          <div class="form-group">
            <label for="exoplanet-data">Exoplanet Data (JSON):</label>
            <textarea id="exoplanet-data" placeholder='Paste exoplanet data here...' rows="4"></textarea>
            <small>Expected fields: pl_name, pl_bmasse, pl_rade, pl_eqt</small>
          </div>

          <button id="generate-exoplanet-planet" class="generate-button">Generate from Data</button>
        </div>

        <!-- Generation Status -->
        <div id="generation-status" class="generation-status hidden">
          <div class="loading-spinner"></div>
          <p>Generating planet textures...</p>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>

        <!-- Generated Planet Preview -->
        <div id="planet-preview" class="planet-preview hidden">
          <h4>Generated Planet</h4>
          <div class="preview-images">
            <div class="texture-preview" id="surface-preview">
              <h5>Surface</h5>
              <img id="surface-image" alt="Surface texture">
            </div>
            <div class="texture-preview" id="bump-preview">
              <h5>Bump Map</h5>
              <img id="bump-image" alt="Bump map">
            </div>
            <div class="texture-preview" id="atmosphere-preview">
              <h5>Atmosphere</h5>
              <img id="atmosphere-image" alt="Atmosphere texture">
            </div>
          </div>
          <div class="preview-actions">
            <button id="add-to-solar-system" class="action-button">Add to Solar System</button>
            <button id="regenerate-planet" class="action-button secondary">Regenerate</button>
            <button id="save-planet" class="action-button secondary">Save Planet</button>
          </div>
        </div>

        <!-- Generated Planets Library -->
        <div id="planet-library" class="planet-library">
          <h4>Generated Planets Library</h4>
          <div id="library-grid" class="library-grid">
            <!-- Generated planets will be displayed here -->
          </div>
        </div>
      </div>
    `;

    this.addStyles();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .planet-generator-panel {
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid #333;
        border-radius: 10px;
        padding: 20px;
        margin: 20px;
        color: white;
        font-family: Arial, sans-serif;
        max-width: 600px;
      }

      .planet-generator-panel h3 {
        margin-top: 0;
        color: #4CAF50;
        text-align: center;
      }

      .generator-tabs {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 1px solid #333;
      }

      .tab-button {
        background: none;
        border: none;
        color: #ccc;
        padding: 10px 20px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.3s;
      }

      .tab-button.active {
        color: #4CAF50;
        border-bottom-color: #4CAF50;
      }

      .tab-content {
        display: none;
      }

      .tab-content.active {
        display: block;
      }

      .form-group {
        margin-bottom: 15px;
      }

      .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #ccc;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #555;
        border-radius: 4px;
        background: #222;
        color: white;
        font-size: 14px;
      }

      .form-group textarea {
        resize: vertical;
        min-height: 60px;
      }

      .checkbox-group {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }

      .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-bottom: 0;
      }

      .generate-button {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        width: 100%;
        transition: background 0.3s;
      }

      .generate-button:hover {
        background: #45a049;
      }

      .generate-button:disabled {
        background: #666;
        cursor: not-allowed;
      }

      .generation-status {
        text-align: center;
        padding: 20px;
        background: rgba(76, 175, 80, 0.1);
        border-radius: 6px;
        margin: 15px 0;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #333;
        border-top: 4px solid #4CAF50;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .progress-bar {
        width: 100%;
        height: 4px;
        background: #333;
        border-radius: 2px;
        overflow: hidden;
        margin-top: 10px;
      }

      .progress-fill {
        height: 100%;
        background: #4CAF50;
        width: 0%;
        transition: width 0.3s;
      }

      .planet-preview {
        margin-top: 20px;
        padding: 15px;
        background: rgba(76, 175, 80, 0.1);
        border-radius: 6px;
      }

      .preview-images {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin: 15px 0;
      }

      .texture-preview {
        text-align: center;
      }

      .texture-preview img {
        width: 100%;
        height: 100px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #555;
      }

      .preview-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 15px;
      }

      .action-button {
        background: #2196F3;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s;
      }

      .action-button.secondary {
        background: #666;
      }

      .action-button:hover {
        background: #1976D2;
      }

      .action-button.secondary:hover {
        background: #555;
      }

      .planet-library {
        margin-top: 30px;
      }

      .library-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 15px;
      }

      .library-item {
        background: #222;
        border: 1px solid #555;
        border-radius: 6px;
        padding: 10px;
        text-align: center;
        cursor: pointer;
        transition: transform 0.2s;
      }

      .library-item:hover {
        transform: translateY(-2px);
        border-color: #4CAF50;
      }

      .library-item img {
        width: 100%;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 8px;
      }

      .hidden {
        display: none !important;
      }

      .small {
        font-size: 12px;
        color: #999;
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    // Tab switching
    this.container.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Guidance scale slider
    const guidanceSlider = this.container.querySelector('#guidance-scale');
    const guidanceValue = this.container.querySelector('#guidance-value');
    guidanceSlider.addEventListener('input', (e) => {
      guidanceValue.textContent = parseFloat(e.target.value).toFixed(1);
    });

    // Generate buttons
    this.container.querySelector('#generate-custom-planet').addEventListener('click', () => {
      this.generateCustomPlanet();
    });

    this.container.querySelector('#generate-preset-planet').addEventListener('click', () => {
      this.generatePresetPlanet();
    });

    this.container.querySelector('#generate-exoplanet-planet').addEventListener('click', () => {
      this.generateExoplanetPlanet();
    });

    // Preview actions
    this.container.querySelector('#add-to-solar-system').addEventListener('click', () => {
      this.addToSolarSystem();
    });

    this.container.querySelector('#regenerate-planet').addEventListener('click', () => {
      this.regeneratePlanet();
    });

    this.container.querySelector('#save-planet').addEventListener('click', () => {
      this.savePlanet();
    });

    // Load existing planets
    this.loadPlanetLibrary();
  }

  switchTab(tabName) {
    // Update tab buttons
    this.container.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    this.container.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    this.container.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    this.container.querySelector(`#${tabName}-tab`).classList.add('active');
  }

  async generateCustomPlanet() {
    const description = this.container.querySelector('#planet-description').value.trim();
    const planetType = this.container.querySelector('#planet-type').value;
    const guidanceScale = parseFloat(this.container.querySelector('#guidance-scale').value);
    
    const textureTypes = [];
    if (this.container.querySelector('#surface-texture').checked) textureTypes.push('surface');
    if (this.container.querySelector('#bump-texture').checked) textureTypes.push('bump');
    if (this.container.querySelector('#atmosphere-texture').checked) textureTypes.push('atmosphere');

    if (!description) {
      alert('Please enter a planet description');
      return;
    }

    const options = {
      guidance_scale: guidanceScale,
      includeAtmosphere: textureTypes.includes('atmosphere')
    };

    await this.generatePlanet(description, planetType, options);
  }

  async generatePresetPlanet() {
    const presetName = this.container.querySelector('#preset-select').value;
    const customDescription = this.container.querySelector('#preset-description').value.trim();
    
    const preset = PLANET_PRESETS[presetName];
    const description = customDescription || preset.description;

    await this.generatePlanet(description, preset.type, preset.options);
  }

  async generateExoplanetPlanet() {
    const dataText = this.container.querySelector('#exoplanet-data').value.trim();
    
    if (!dataText) {
      alert('Please enter exoplanet data');
      return;
    }

    try {
      const exoplanetData = JSON.parse(dataText);
      const planet = await planetGenerator.generateFromExoplanetData(exoplanetData);
      this.displayPlanet(planet);
    } catch (error) {
      alert('Invalid JSON data: ' + error.message);
    }
  }

  async generatePlanet(description, planetType, options) {
    this.showGenerationStatus();
    
    try {
      const planet = await planetGenerator.generateCompletePlanet(description, planetType, options);
      this.displayPlanet(planet);
      
      if (this.onPlanetGenerated) {
        this.onPlanetGenerated(planet);
      }
    } catch (error) {
      console.error('Error generating planet:', error);
      alert('Error generating planet: ' + error.message);
    } finally {
      this.hideGenerationStatus();
    }
  }

  displayPlanet(planet) {
    this.currentPlanet = planet;
    
    // Show surface texture
    if (planet.textures.surface) {
      const surfaceImg = this.container.querySelector('#surface-image');
      surfaceImg.src = planet.textures.surface;
      this.container.querySelector('#surface-preview').style.display = 'block';
    }

    // Show bump map
    if (planet.textures.bump) {
      const bumpImg = this.container.querySelector('#bump-image');
      bumpImg.src = planet.textures.bump;
      this.container.querySelector('#bump-preview').style.display = 'block';
    }

    // Show atmosphere
    if (planet.textures.atmosphere) {
      const atmosphereImg = this.container.querySelector('#atmosphere-image');
      atmosphereImg.src = planet.textures.atmosphere;
      this.container.querySelector('#atmosphere-preview').style.display = 'block';
    }

    this.container.querySelector('#planet-preview').classList.remove('hidden');
    this.loadPlanetLibrary();
  }

  showGenerationStatus() {
    this.isGenerating = true;
    this.container.querySelector('#generation-status').classList.remove('hidden');
    this.container.querySelectorAll('.generate-button').forEach(btn => {
      btn.disabled = true;
    });
  }

  hideGenerationStatus() {
    this.isGenerating = false;
    this.container.querySelector('#generation-status').classList.add('hidden');
    this.container.querySelectorAll('.generate-button').forEach(btn => {
      btn.disabled = false;
    });
  }

  addToSolarSystem() {
    if (this.currentPlanet && this.onPlanetGenerated) {
      this.onPlanetGenerated(this.currentPlanet);
      alert('Planet added to solar system!');
    }
  }

  regeneratePlanet() {
    if (this.currentPlanet) {
      this.generatePlanet(
        this.currentPlanet.description,
        this.currentPlanet.planetType,
        this.currentPlanet.options
      );
    }
  }

  savePlanet() {
    if (this.currentPlanet) {
      // Save to localStorage
      const savedPlanets = JSON.parse(localStorage.getItem('savedPlanets') || '[]');
      savedPlanets.push({
        ...this.currentPlanet,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('savedPlanets', JSON.stringify(savedPlanets));
      alert('Planet saved to library!');
      this.loadPlanetLibrary();
    }
  }

  loadPlanetLibrary() {
    const libraryGrid = this.container.querySelector('#library-grid');
    const savedPlanets = JSON.parse(localStorage.getItem('savedPlanets') || '[]');
    
    libraryGrid.innerHTML = savedPlanets.map(planet => `
      <div class="library-item" data-planet-id="${planet.id}">
        <img src="${planet.textures.surface}" alt="${planet.description}">
        <div class="small">${planet.description.substring(0, 50)}...</div>
        <div class="small">${planet.planetType}</div>
      </div>
    `).join('');

    // Add click handlers for library items
    libraryGrid.querySelectorAll('.library-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const planetId = e.currentTarget.dataset.planetId;
        const planet = savedPlanets.find(p => p.id === planetId);
        if (planet) {
          this.displayPlanet(planet);
        }
      });
    });
  }
}

export default PlanetGeneratorUI;

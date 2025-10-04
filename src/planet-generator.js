// Planet Generator Service with SDXL LoRA Integration
// This service handles planet generation using the SDXL LoRA planet textures model

import { 
  generatePlanetTexture, 
  generateCompletePlanetTextures, 
  PLANET_PRESETS,
  createEnhancedPrompt 
} from './api-config.js';

export class PlanetGenerator {
  constructor() {
    this.generationQueue = [];
    this.isGenerating = false;
    this.generatedPlanets = new Map();
  }

  // Generate a single planet texture
  async generateTexture(description, planetType = 'rocky', textureType = 'surface', options = {}) {
    try {
      console.log(`Generating ${textureType} texture for ${planetType} planet: ${description}`);
      
      // Validate inputs
      if (!description || description.trim().length === 0) {
        throw new Error('Description cannot be empty');
      }
      
      if (!planetType || !['rocky', 'gas-giant', 'ice-world', 'desert', 'ocean', 'volcanic', 'dwarf', 'asteroid', 'moon'].includes(planetType)) {
        throw new Error('Invalid planet type');
      }
      
      const textureUrl = await generatePlanetTexture(description, planetType, textureType, options);
      
      // Validate generated texture
      if (!textureUrl) {
        throw new Error('Failed to generate texture');
      }
      
      return textureUrl;
    } catch (error) {
      console.error(`Error generating ${textureType} texture:`, error);
      
      // Return a fallback texture URL
      const fallbackUrl = this.createFallbackTexture(description, planetType, textureType);
      console.warn(`Using fallback texture for ${textureType}`);
      
      return fallbackUrl;
    }
  }

  // Generate complete planet with all texture types
  async generateCompletePlanet(description, planetType = 'rocky', options = {}) {
    try {
      console.log(`Generating complete planet: ${description} (${planetType})`);
      const textures = await generateCompletePlanetTextures(description, planetType, options);
      
      const planetData = {
        id: this.generatePlanetId(),
        description,
        planetType,
        textures,
        createdAt: new Date(),
        options
      };

      this.generatedPlanets.set(planetData.id, planetData);
      return planetData;
    } catch (error) {
      console.error('Error generating complete planet:', error);
      throw error;
    }
  }

  // Generate planet from preset
  async generateFromPreset(presetName, customDescription = null) {
    const preset = PLANET_PRESETS[presetName];
    if (!preset) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    const description = customDescription || preset.description;
    return await this.generateCompletePlanet(description, preset.type, preset.options);
  }

  // Generate planet from exoplanet data
  async generateFromExoplanetData(exoplanetData) {
    const planetType = this.determinePlanetTypeFromData(exoplanetData);
    const description = this.createDescriptionFromExoplanetData(exoplanetData);
    
    return await this.generateCompletePlanet(description, planetType, {
      guidance_scale: 7.5,
      includeAtmosphere: planetType === 'gas-giant' || planetType === 'ocean'
    });
  }

  // Batch generate multiple planets
  async generateBatch(planetRequests) {
    const results = [];
    
    for (const request of planetRequests) {
      try {
        const planet = await this.generateCompletePlanet(
          request.description,
          request.planetType,
          request.options
        );
        results.push({ success: true, planet });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Get generated planet by ID
  getPlanet(planetId) {
    return this.generatedPlanets.get(planetId);
  }

  // Get all generated planets
  getAllPlanets() {
    return Array.from(this.generatedPlanets.values());
  }

  // Delete planet
  deletePlanet(planetId) {
    const planet = this.generatedPlanets.get(planetId);
    if (planet) {
      // Clean up texture URLs
      Object.values(planet.textures).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      this.generatedPlanets.delete(planetId);
      return true;
    }
    return false;
  }

  // Clear all generated planets
  clearAllPlanets() {
    this.generatedPlanets.forEach(planet => {
      Object.values(planet.textures).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    });
    this.generatedPlanets.clear();
  }

  // Helper methods
  generatePlanetId() {
    return 'planet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  determinePlanetTypeFromData(data) {
    const mass = parseFloat(data.pl_bmasse) || 0;
    const radius = parseFloat(data.pl_rade) || 0;
    const temperature = parseFloat(data.pl_eqt) || 0;

    // Simple classification based on mass and radius
    if (mass > 10) return 'gas-giant';
    if (mass > 0.1 && radius > 1.5) return 'ocean';
    if (temperature < 200) return 'ice-world';
    if (mass < 0.1) return 'dwarf';
    if (radius < 0.8) return 'rocky';
    
    return 'rocky'; // Default
  }

  createDescriptionFromExoplanetData(data) {
    const name = data.pl_name || 'Unknown Planet';
    const mass = data.pl_bmasse ? `${data.pl_bmasse} Earth masses` : 'unknown mass';
    const radius = data.pl_rade ? `${data.pl_rade} Earth radii` : 'unknown size';
    const temperature = data.pl_eqt ? `${data.pl_eqt}K` : 'unknown temperature';
    
    return `A ${name} with ${mass}, ${radius}, and surface temperature of ${temperature}`;
  }

  // Get available presets
  getAvailablePresets() {
    return Object.keys(PLANET_PRESETS);
  }

  // Get preset details
  getPresetDetails(presetName) {
    return PLANET_PRESETS[presetName];
  }

  // Create fallback texture when generation fails
  createFallbackTexture(description, planetType, textureType) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    
    const ctx = canvas.getContext('2d');
    
    // Create gradient based on planet type
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    
    const colors = {
      'rocky': ['#8B4513', '#A0522D', '#D2691E'],
      'gas-giant': ['#4B0082', '#8A2BE2', '#9370DB'],
      'ice-world': ['#B0E0E6', '#87CEEB', '#F0F8FF'],
      'desert': ['#F4A460', '#DEB887', '#F5DEB3'],
      'ocean': ['#000080', '#4169E1', '#87CEEB'],
      'volcanic': ['#8B0000', '#FF4500', '#FFD700'],
      'dwarf': ['#696969', '#A9A9A9', '#D3D3D3'],
      'asteroid': ['#2F4F4F', '#708090', '#B0C4DE'],
      'moon': ['#C0C0C0', '#DCDCDC', '#F5F5F5']
    };
    
    const planetColors = colors[planetType] || colors['rocky'];
    gradient.addColorStop(0, planetColors[0]);
    gradient.addColorStop(0.5, planetColors[1]);
    gradient.addColorStop(1, planetColors[2]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add texture based on type
    if (textureType === 'bump') {
      // Convert to grayscale for bump map
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = gray;     // Red
        data[i + 1] = gray; // Green
        data[i + 2] = gray; // Blue
      }
      
      ctx.putImageData(imageData, 0, 0);
    } else if (textureType === 'atmosphere') {
      // Add atmospheric glow effect
      const glowGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      glowGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Add noise for texture
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));     // Red
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.9);
  }
}

// Create singleton instance
export const planetGenerator = new PlanetGenerator();

// Export for use in other modules
export default planetGenerator;

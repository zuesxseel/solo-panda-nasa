// Test script for SDXL LoRA Planet Textures Integration
// This script tests the integration without requiring a full page load

import { planetGenerator } from './planet-generator.js';
import { generatePlanetTexture, PLANET_PRESETS } from './api-config.js';

export class SDXLIntegrationTest {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
  }

  async runAllTests() {
    if (this.isRunning) {
      console.log('Tests already running...');
      return;
    }

    this.isRunning = true;
    this.testResults = [];
    console.log('🚀 Starting SDXL LoRA Integration Tests...');

    try {
      // Test 1: API Configuration
      await this.testAPIConfiguration();
      
      // Test 2: Planet Generator Service
      await this.testPlanetGeneratorService();
      
      // Test 3: Texture Generation
      await this.testTextureGeneration();
      
      // Test 4: Preset System
      await this.testPresetSystem();
      
      // Test 5: Error Handling
      await this.testErrorHandling();
      
      // Test 6: Fallback System
      await this.testFallbackSystem();

      this.printTestResults();
      
    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async testAPIConfiguration() {
    console.log('📋 Testing API Configuration...');
    
    try {
      // Test if API config is properly loaded
      const { API_CONFIG } = await import('./api-config.js');
      
      if (!API_CONFIG.HUGGING_FACE.BASE_URL.includes('sdxl-lora-planet-textures')) {
        throw new Error('API URL not updated to SDXL LoRA model');
      }
      
      if (!API_CONFIG.PROMPT_ENHANCEMENT.SDXL_ENHANCEMENTS) {
        throw new Error('SDXL enhancements not configured');
      }
      
      this.testResults.push({
        name: 'API Configuration',
        status: 'PASS',
        message: 'SDXL LoRA configuration loaded correctly'
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'API Configuration',
        status: 'FAIL',
        message: error.message
      });
    }
  }

  async testPlanetGeneratorService() {
    console.log('🔧 Testing Planet Generator Service...');
    
    try {
      // Test if planet generator is properly initialized
      if (!planetGenerator) {
        throw new Error('Planet generator not initialized');
      }
      
      // Test available presets
      const presets = planetGenerator.getAvailablePresets();
      if (presets.length === 0) {
        throw new Error('No presets available');
      }
      
      // Test preset details
      const rockyPreset = planetGenerator.getPresetDetails('rocky');
      if (!rockyPreset || !rockyPreset.description) {
        throw new Error('Preset details not working');
      }
      
      this.testResults.push({
        name: 'Planet Generator Service',
        status: 'PASS',
        message: `Service initialized with ${presets.length} presets`
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Planet Generator Service',
        status: 'FAIL',
        message: error.message
      });
    }
  }

  async testTextureGeneration() {
    console.log('🎨 Testing Texture Generation...');
    
    try {
      // Test texture generation with a simple prompt
      const testDescription = 'A rocky planet with craters';
      const testPlanetType = 'rocky';
      
      // This will use placeholder texture if API key is not configured
      const textureUrl = await planetGenerator.generateTexture(
        testDescription, 
        testPlanetType, 
        'surface'
      );
      
      if (!textureUrl) {
        throw new Error('Texture generation returned null');
      }
      
      // Test if it's a valid data URL or blob URL
      if (!textureUrl.startsWith('data:') && !textureUrl.startsWith('blob:')) {
        throw new Error('Invalid texture URL format');
      }
      
      this.testResults.push({
        name: 'Texture Generation',
        status: 'PASS',
        message: 'Texture generation working (using placeholder if no API key)'
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Texture Generation',
        status: 'FAIL',
        message: error.message
      });
    }
  }

  async testPresetSystem() {
    console.log('⚙️ Testing Preset System...');
    
    try {
      // Test all presets
      const presets = Object.keys(PLANET_PRESETS);
      let validPresets = 0;
      
      for (const presetName of presets) {
        const preset = PLANET_PRESETS[presetName];
        
        if (preset && preset.description && preset.type && preset.options) {
          validPresets++;
        }
      }
      
      if (validPresets !== presets.length) {
        throw new Error(`Only ${validPresets}/${presets.length} presets are valid`);
      }
      
      this.testResults.push({
        name: 'Preset System',
        status: 'PASS',
        message: `All ${presets.length} presets are valid`
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Preset System',
        status: 'FAIL',
        message: error.message
      });
    }
  }

  async testErrorHandling() {
    console.log('🛡️ Testing Error Handling...');
    
    try {
      // Test with invalid inputs
      try {
        await planetGenerator.generateTexture('', 'rocky', 'surface');
        throw new Error('Should have thrown error for empty description');
      } catch (error) {
        if (!error.message.includes('Description cannot be empty')) {
          throw new Error('Wrong error message for empty description');
        }
      }
      
      // Test with invalid planet type
      try {
        await planetGenerator.generateTexture('test', 'invalid-type', 'surface');
        throw new Error('Should have thrown error for invalid planet type');
      } catch (error) {
        if (!error.message.includes('Invalid planet type')) {
          throw new Error('Wrong error message for invalid planet type');
        }
      }
      
      this.testResults.push({
        name: 'Error Handling',
        status: 'PASS',
        message: 'Error handling working correctly'
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Error Handling',
        status: 'FAIL',
        message: error.message
      });
    }
  }

  async testFallbackSystem() {
    console.log('🔄 Testing Fallback System...');
    
    try {
      // Test fallback texture creation
      const fallbackTexture = planetGenerator.createFallbackTexture(
        'test planet',
        'rocky',
        'surface'
      );
      
      if (!fallbackTexture || !fallbackTexture.startsWith('data:')) {
        throw new Error('Fallback texture not created properly');
      }
      
      // Test different texture types
      const bumpFallback = planetGenerator.createFallbackTexture(
        'test planet',
        'rocky',
        'bump'
      );
      
      const atmosphereFallback = planetGenerator.createFallbackTexture(
        'test planet',
        'gas-giant',
        'atmosphere'
      );
      
      if (!bumpFallback || !atmosphereFallback) {
        throw new Error('Fallback textures for different types not working');
      }
      
      this.testResults.push({
        name: 'Fallback System',
        status: 'PASS',
        message: 'Fallback system working correctly'
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Fallback System',
        status: 'FAIL',
        message: error.message
      });
    }
  }

  printTestResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}: ${result.message}`);
    });
    
    console.log(`\n📈 Overall: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed! SDXL LoRA integration is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the error messages above.');
    }
  }

  // Quick test method for console
  async quickTest() {
    console.log('🚀 Running quick SDXL integration test...');
    
    try {
      const planet = await planetGenerator.generateCompletePlanet(
        'A beautiful rocky planet with mountains and valleys',
        'rocky',
        { guidance_scale: 8.0 }
      );
      
      console.log('✅ Quick test passed! Generated planet:', planet);
      return planet;
    } catch (error) {
      console.error('❌ Quick test failed:', error);
      throw error;
    }
  }
}

// Export for use in console or other modules
export const sdxlTest = new SDXLIntegrationTest();

// Auto-run tests if this script is loaded directly
if (typeof window !== 'undefined') {
  window.sdxlTest = sdxlTest;
  console.log('SDXL Integration Test loaded. Run sdxlTest.runAllTests() to test the integration.');
}

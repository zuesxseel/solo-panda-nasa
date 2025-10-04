// Environment Setup Utility
// This utility helps users configure their environment variables

export class EnvSetup {
  constructor() {
    this.requiredEnvVars = ['HUGGING_FACE_API_KEY'];
    this.optionalEnvVars = [
      'HUGGING_FACE_MODEL_URL',
      'HUGGING_FACE_MAX_RETRIES',
      'HUGGING_FACE_TIMEOUT',
      'MAX_API_CALLS_PER_MINUTE',
      'RATE_LIMIT_RESET_MINUTES',
      'DEBUG_MODE'
    ];
  }

  // Check if environment is properly configured
  checkEnvironment() {
    const results = {
      configured: true,
      missing: [],
      warnings: [],
      suggestions: []
    };

    // Check required environment variables
    for (const envVar of this.requiredEnvVars) {
      if (!process.env[envVar] || process.env[envVar] === 'your_hugging_face_api_key_here') {
        results.configured = false;
        results.missing.push(envVar);
      }
    }

    // Check optional environment variables
    for (const envVar of this.optionalEnvVars) {
      if (!process.env[envVar]) {
        results.warnings.push(`${envVar} not set, using default value`);
      }
    }

    // Add suggestions based on missing variables
    if (results.missing.includes('HUGGING_FACE_API_KEY')) {
      results.suggestions.push(
        '1. Get your API key from https://huggingface.co/settings/tokens',
        '2. Create a .env file in your project root',
        '3. Add HUGGING_FACE_API_KEY=your_actual_api_key_here',
        '4. Restart your development server'
      );
    }

    return results;
  }

  // Generate a sample .env file content
  generateEnvTemplate() {
    return `# Hugging Face API Configuration
# Get your API key from: https://huggingface.co/settings/tokens
HUGGING_FACE_API_KEY=your_hugging_face_api_key_here

# Optional: Override the model URL (defaults to SDXL LoRA planet textures)
# HUGGING_FACE_MODEL_URL=https://api-inference.huggingface.co/models/sshh12/sdxl-lora-planet-textures

# Optional: API request settings
# HUGGING_FACE_MAX_RETRIES=3
# HUGGING_FACE_TIMEOUT=30000

# Optional: Rate limiting settings
# MAX_API_CALLS_PER_MINUTE=10
# RATE_LIMIT_RESET_MINUTES=5

# Optional: Debug mode (set to true for detailed logging)
# DEBUG_MODE=false`;
  }

  // Display environment status in console
  displayStatus() {
    const status = this.checkEnvironment();
    
    console.log('🔧 Environment Configuration Status:');
    console.log('=====================================');
    
    if (status.configured) {
      console.log('✅ Environment is properly configured!');
    } else {
      console.log('❌ Environment configuration incomplete');
      console.log('Missing variables:', status.missing.join(', '));
    }
    
    if (status.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      status.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    if (status.suggestions.length > 0) {
      console.log('💡 Suggestions:');
      status.suggestions.forEach(suggestion => console.log(`   ${suggestion}`));
    }
    
    return status;
  }

  // Get current configuration summary
  getConfigSummary() {
    return {
      apiKey: process.env.HUGGING_FACE_API_KEY ? 'Set' : 'Not Set',
      modelUrl: process.env.HUGGING_FACE_MODEL_URL || 'Default (SDXL LoRA)',
      maxRetries: process.env.HUGGING_FACE_MAX_RETRIES || '3',
      timeout: process.env.HUGGING_FACE_TIMEOUT || '30000ms',
      maxCallsPerMinute: process.env.MAX_API_CALLS_PER_MINUTE || '10',
      debugMode: process.env.DEBUG_MODE || 'false'
    };
  }

  // Validate API key format (basic validation)
  validateApiKey(apiKey) {
    if (!apiKey || apiKey === 'your_hugging_face_api_key_here') {
      return { valid: false, message: 'API key is not set' };
    }
    
    if (apiKey.length < 20) {
      return { valid: false, message: 'API key appears to be too short' };
    }
    
    if (!apiKey.startsWith('hf_')) {
      return { valid: false, message: 'API key should start with "hf_"' };
    }
    
    return { valid: true, message: 'API key format looks correct' };
  }

  // Test API key by making a simple request
  async testApiKey(apiKey) {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/sshh12/sdxl-lora-planet-textures', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'test planet',
          parameters: {
            width: 512,
            height: 256,
            num_inference_steps: 1
          }
        })
      });
      
      if (response.ok) {
        return { valid: true, message: 'API key is working correctly' };
      } else if (response.status === 401) {
        return { valid: false, message: 'API key is invalid or expired' };
      } else {
        return { valid: false, message: `API request failed with status ${response.status}` };
      }
    } catch (error) {
      return { valid: false, message: `Network error: ${error.message}` };
    }
  }
}

// Create singleton instance
export const envSetup = new EnvSetup();

// Auto-check environment on load
if (typeof window !== 'undefined') {
  window.envSetup = envSetup;
  console.log('Environment setup utility loaded. Run envSetup.displayStatus() to check configuration.');
}


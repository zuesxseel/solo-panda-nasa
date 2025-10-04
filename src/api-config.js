// API Configuration for Planet Generation
// This file contains the configuration for the Hugging Face API integration with SDXL LoRA

export const API_CONFIG = {
  // Hugging Face Inference API Configuration for SDXL LoRA Planet Textures
  HUGGING_FACE: {
    BASE_URL: 'https://api-inference.huggingface.co/models/sshh12/sdxl-lora-planet-textures',
    API_KEY: 'YOUR_HUGGING_FACE_API_KEY_HERE', // Replace with your actual API key
    HEADERS: {
      'Authorization': 'Bearer YOUR_HUGGING_FACE_API_KEY_HERE',
      'Content-Type': 'application/json'
    }
  },
  
  // Image generation settings
  IMAGE_SETTINGS: {
    WIDTH: 1024,
    HEIGHT: 512, // 2:1 ratio for equirectangular projection
    QUALITY: 90,
    FORMAT: 'jpeg'
  },
  
  // Prompt enhancement settings optimized for SDXL LoRA planet textures
  PROMPT_ENHANCEMENT: {
    SURFACE_KEYWORDS: [
      'detailed planet surface',
      'realistic texture',
      'high resolution',
      'seamless',
      'equirectangular projection',
      '2:1 aspect ratio'
    ],
    BUMP_KEYWORDS: [
      'height map',
      'surface elevation',
      'craters and mountains',
      'bump map',
      'grayscale',
      'topography'
    ],
    ATMOSPHERE_KEYWORDS: [
      'atmospheric glow',
      'translucent atmosphere',
      'soft atmospheric edges',
      'colorful atmospheric effects',
      'atmospheric haze'
    ],
    // SDXL LoRA specific enhancements
    SDXL_ENHANCEMENTS: [
      'space environment',
      'cosmic background',
      'sci-fi realism',
      'detailed surface features',
      'realistic lighting'
    ]
  }
};

// Helper function to create enhanced prompts for SDXL LoRA
export function createEnhancedPrompt(description, planetType, textureType = 'surface') {
  const typePrompts = {
    'rocky': 'A rocky planet with craters and mountains',
    'gas-giant': 'A gas giant with swirling atmospheric bands',
    'ice-world': 'An icy planet with frozen landscapes',
    'desert': 'A desert planet with sand dunes and rocky formations',
    'ocean': 'An ocean world with water and land masses',
    'volcanic': 'A volcanic world with lava flows and ash clouds',
    'dwarf': 'A dwarf planet with unique surface features',
    'asteroid': 'A metallic asteroid with cratered surface',
    'moon': 'A moon with distinctive surface characteristics'
  };
  
  const basePrompt = typePrompts[planetType] || 'A planet with unique surface features';
  const keywords = API_CONFIG.PROMPT_ENHANCEMENT[`${textureType.toUpperCase()}_KEYWORDS`] || API_CONFIG.PROMPT_ENHANCEMENT.SURFACE_KEYWORDS;
  const sdxlEnhancements = API_CONFIG.PROMPT_ENHANCEMENT.SDXL_ENHANCEMENTS;
  
  // Combine all elements for optimal SDXL LoRA performance
  const fullPrompt = `${basePrompt}, ${description}, ${keywords.join(', ')}, ${sdxlEnhancements.join(', ')}`;
  
  return fullPrompt;
}

// Helper function to call Hugging Face API with SDXL LoRA
export async function callHuggingFaceAPI(prompt, apiKey = null, options = {}) {
  const key = apiKey || API_CONFIG.HUGGING_FACE.API_KEY;
  
  if (key === 'YOUR_HUGGING_FACE_API_KEY_HERE') {
    console.warn('Hugging Face API key not configured. Using placeholder texture.');
    return createPlaceholderTexture(prompt);
  }
  
  // Validate prompt
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }
  
  // Rate limiting check
  if (window.apiCallCount && window.apiCallCount > 10) {
    console.warn('Rate limit reached. Using placeholder texture.');
    return createPlaceholderTexture(prompt);
  }
  
  try {
    // Increment call count
    window.apiCallCount = (window.apiCallCount || 0) + 1;
    
    const response = await fetch(API_CONFIG.HUGGING_FACE.BASE_URL, {
      method: 'POST',
      headers: {
        ...API_CONFIG.HUGGING_FACE.HEADERS,
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: options.width || API_CONFIG.IMAGE_SETTINGS.WIDTH,
          height: options.height || API_CONFIG.IMAGE_SETTINGS.HEIGHT,
          num_inference_steps: options.num_inference_steps || 20,
          guidance_scale: options.guidance_scale || 7.5,
          negative_prompt: options.negative_prompt || 'blurry, fuzzy, low resolution, cartoon, painting, distorted, deformed',
          // SDXL specific parameters
          num_images_per_prompt: 1,
          seed: options.seed || Math.floor(Math.random() * 1000000)
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      
      // Handle specific error cases
      if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check your Hugging Face API key.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait before making another request.';
        // Reset call count after rate limit
        window.apiCallCount = 0;
      } else if (response.status === 503) {
        errorMessage = 'Service temporarily unavailable. The model may be loading.';
      } else if (response.status === 500) {
        errorMessage = 'Internal server error. Please try again later.';
      }
      
      console.error(errorMessage, errorText);
      throw new Error(errorMessage);
    }
    
    const blob = await response.blob();
    
    // Validate blob
    if (blob.size === 0) {
      throw new Error('Received empty response from API');
    }
    
    return URL.createObjectURL(blob);
    
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    
    // Return placeholder texture with error information
    const placeholder = createPlaceholderTexture(prompt);
    
    // Show user-friendly error message
    if (error.message.includes('API key')) {
      alert('Please configure your Hugging Face API key in the settings to generate custom planets.');
    } else if (error.message.includes('Rate limit')) {
      alert('Too many requests. Please wait a moment before generating another planet.');
    } else if (error.message.includes('Service temporarily unavailable')) {
      alert('The AI service is temporarily unavailable. Using placeholder texture.');
    } else {
      console.warn('Using placeholder texture due to error:', error.message);
    }
    
    return placeholder;
  }
}

// Create placeholder texture for demo purposes
function createPlaceholderTexture(prompt) {
  const canvas = document.createElement('canvas');
  canvas.width = API_CONFIG.IMAGE_SETTINGS.WIDTH;
  canvas.height = API_CONFIG.IMAGE_SETTINGS.HEIGHT;
  
  const ctx = canvas.getContext('2d');
  
  // Create gradient based on prompt keywords
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  
  if (prompt.includes('volcanic') || prompt.includes('lava')) {
    gradient.addColorStop(0, '#8B0000');
    gradient.addColorStop(0.5, '#FF4500');
    gradient.addColorStop(1, '#FFD700');
  } else if (prompt.includes('ice') || prompt.includes('frozen')) {
    gradient.addColorStop(0, '#B0E0E6');
    gradient.addColorStop(0.5, '#87CEEB');
    gradient.addColorStop(1, '#F0F8FF');
  } else if (prompt.includes('desert') || prompt.includes('sand')) {
    gradient.addColorStop(0, '#F4A460');
    gradient.addColorStop(0.5, '#DEB887');
    gradient.addColorStop(1, '#F5DEB3');
  } else if (prompt.includes('ocean') || prompt.includes('water')) {
    gradient.addColorStop(0, '#000080');
    gradient.addColorStop(0.5, '#4169E1');
    gradient.addColorStop(1, '#87CEEB');
  } else {
    // Default rocky planet
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#A0522D');
    gradient.addColorStop(1, '#D2691E');
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add noise for texture
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 50;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));     // Red
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  return canvas.toDataURL('image/jpeg', API_CONFIG.IMAGE_SETTINGS.QUALITY / 100);
}

// Helper function to generate planet textures with SDXL LoRA
export async function generatePlanetTexture(description, planetType = 'rocky', textureType = 'surface', options = {}) {
  const prompt = createEnhancedPrompt(description, planetType, textureType);
  console.log(`Generating ${textureType} texture with prompt: ${prompt}`);
  
  const generationOptions = {
    width: 1024,
    height: 512,
    num_inference_steps: 25,
    guidance_scale: 8.0,
    negative_prompt: 'blurry, fuzzy, low resolution, cartoon, painting, distorted, deformed, text, watermark',
    ...options
  };
  
  return await callHuggingFaceAPI(prompt, null, generationOptions);
}

// Helper function to generate multiple texture types for a planet
export async function generateCompletePlanetTextures(description, planetType = 'rocky', options = {}) {
  const textures = {};
  
  try {
    // Generate surface texture
    textures.surface = await generatePlanetTexture(description, planetType, 'surface', options);
    
    // Generate bump map
    textures.bump = await generatePlanetTexture(description, planetType, 'bump', {
      ...options,
      guidance_scale: 7.0,
      negative_prompt: 'color, colorful, blurry, fuzzy, low resolution, cartoon, painting, distorted, deformed, text, watermark'
    });
    
    // Generate atmosphere texture if applicable
    if (planetType === 'gas-giant' || planetType === 'ocean' || options.includeAtmosphere) {
      textures.atmosphere = await generatePlanetTexture(description, planetType, 'atmosphere', {
        ...options,
        guidance_scale: 6.0,
        negative_prompt: 'solid, opaque, blurry, fuzzy, low resolution, cartoon, painting, distorted, deformed, text, watermark'
      });
    }
    
    return textures;
  } catch (error) {
    console.error('Error generating complete planet textures:', error);
    return { surface: createPlaceholderTexture(description) };
  }
}

// Helper function to create planet generation presets
export const PLANET_PRESETS = {
  'rocky': {
    description: 'A rocky planet with craters and mountains',
    type: 'rocky',
    options: { guidance_scale: 8.0 }
  },
  'gas-giant': {
    description: 'A gas giant with swirling atmospheric bands',
    type: 'gas-giant',
    options: { guidance_scale: 7.5, includeAtmosphere: true }
  },
  'ice-world': {
    description: 'An icy planet with frozen landscapes',
    type: 'ice-world',
    options: { guidance_scale: 8.5 }
  },
  'desert': {
    description: 'A desert planet with sand dunes and rocky formations',
    type: 'desert',
    options: { guidance_scale: 7.8 }
  },
  'ocean': {
    description: 'An ocean world with water and land masses',
    type: 'ocean',
    options: { guidance_scale: 7.2, includeAtmosphere: true }
  },
  'volcanic': {
    description: 'A volcanic world with lava flows and ash clouds',
    type: 'volcanic',
    options: { guidance_scale: 8.2 }
  },
  'dwarf': {
    description: 'A dwarf planet with unique surface features',
    type: 'dwarf',
    options: { guidance_scale: 7.0 }
  },
  'asteroid': {
    description: 'A metallic asteroid with cratered surface',
    type: 'asteroid',
    options: { guidance_scale: 8.5 }
  }
};


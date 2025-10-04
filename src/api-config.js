// API Configuration for Planet Generation
// This file contains the configuration for the Hugging Face API integration

export const API_CONFIG = {
  // Hugging Face Inference API Configuration
  HUGGING_FACE: {
    BASE_URL: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
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
  
  // Prompt enhancement settings
  PROMPT_ENHANCEMENT: {
    SURFACE_KEYWORDS: [
      'equirectangular map',
      'seamless',
      '2:1 ratio',
      'realistic surface features',
      '8k detail',
      'high resolution'
    ],
    BUMP_KEYWORDS: [
      'grayscale height map',
      'surface elevation',
      'craters and mountains',
      'bump map',
      'normal map'
    ],
    ATMOSPHERE_KEYWORDS: [
      'glowing atmospheric effect',
      'translucent',
      'soft edges',
      'colorful glow',
      'atmospheric haze'
    ]
  }
};

// Helper function to create enhanced prompts
export function createEnhancedPrompt(description, planetType, textureType = 'surface') {
  const typePrompts = {
    'rocky': 'rocky surface with craters and mountains',
    'gas-giant': 'gas giant with swirling atmospheric bands',
    'ice-world': 'icy surface with frozen landscapes',
    'desert': 'desert world with sand dunes and rocky formations',
    'ocean': 'ocean world with water and land masses',
    'volcanic': 'volcanic world with lava flows and ash clouds'
  };
  
  const basePrompt = typePrompts[planetType] || 'planet surface';
  const keywords = API_CONFIG.PROMPT_ENHANCEMENT[`${textureType.toUpperCase()}_KEYWORDS`] || API_CONFIG.PROMPT_ENHANCEMENT.SURFACE_KEYWORDS;
  
  return `A detailed ${basePrompt}, ${description}, ${keywords.join(', ')}`;
}

// Helper function to call Hugging Face API
export async function callHuggingFaceAPI(prompt, apiKey = null) {
  const key = apiKey || API_CONFIG.HUGGING_FACE.API_KEY;
  
  if (key === 'YOUR_HUGGING_FACE_API_KEY_HERE') {
    console.warn('Hugging Face API key not configured. Using placeholder texture.');
    return createPlaceholderTexture(prompt);
  }
  
  try {
    const response = await fetch(API_CONFIG.HUGGING_FACE.BASE_URL, {
      method: 'POST',
      headers: {
        ...API_CONFIG.HUGGING_FACE.HEADERS,
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: API_CONFIG.IMAGE_SETTINGS.WIDTH,
          height: API_CONFIG.IMAGE_SETTINGS.HEIGHT,
          num_inference_steps: 20,
          guidance_scale: 7.5
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
    
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    return createPlaceholderTexture(prompt);
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


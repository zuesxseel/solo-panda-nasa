# Setup Guide for AI Planet Generation

This guide will help you set up the AI-powered planet generation feature using Hugging Face's Stable Diffusion API.

## Prerequisites

1. **Node.js** (version 16 or higher)
2. **npm** or **yarn**
3. **Hugging Face Account** (free)

## Step 1: Get Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/)
2. Create a free account or sign in
3. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token"
5. Give it a name (e.g., "Solar System Planet Generator")
6. Select "Read" permissions
7. Click "Generate a token"
8. Copy the token (it starts with `hf_...`)

## Step 2: Configure API Key

1. Open `src/api-config.js`
2. Replace `YOUR_HUGGING_FACE_API_KEY_HERE` with your actual API key:

```javascript
export const API_CONFIG = {
  HUGGING_FACE: {
    API_KEY: 'hf_your_actual_api_key_here',
    // ... rest of config
  }
};
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Start Development Server

```bash
npm run dev
```

## Step 5: Test Planet Generation

1. Open your browser to `http://localhost:3000`
2. Look for the "🌌 AI Planet Generator" panel on the bottom-left
3. Enter a planet description (e.g., "volcanic world with glowing lava rivers")
4. Select planet type and options
5. Click "🚀 Generate Planet"
6. Wait for generation (2-5 seconds)
7. Preview the generated textures
8. Click "➕ Add to Solar System" to add your planet to the 3D scene

## Features

### Planet Types Supported
- **Rocky Planet**: Craters, mountains, rocky terrain
- **Gas Giant**: Swirling atmospheric bands
- **Ice World**: Frozen landscapes, icy surfaces
- **Desert World**: Sand dunes, rocky formations
- **Ocean World**: Water and land masses
- **Volcanic World**: Lava flows, ash clouds

### Generated Textures
- **Surface Texture**: Main planet appearance
- **Bump Map**: Surface height variations and detail
- **Atmosphere**: Glowing atmospheric effects

### Customization Options
- Planet size (1-10 scale)
- Include/exclude atmosphere
- Include/exclude surface detail (bump map)
- Custom descriptions

## API Usage Limits

- **Free Tier**: ~30-50 generations per day
- **Rate Limits**: 1 request per second
- **Image Size**: 1024x512 pixels (2:1 ratio for equirectangular projection)

## Troubleshooting

### "API key not configured" Warning
- Make sure you've replaced the placeholder API key in `api-config.js`
- Verify the API key is correct and has read permissions

### Generation Fails
- Check your internet connection
- Verify your Hugging Face API key is valid
- Check browser console for error messages
- Ensure you haven't exceeded daily limits

### Images Not Loading
- Check browser console for CORS errors
- Verify the generated image URLs are valid
- Try refreshing the page

## Advanced Configuration

### Custom Prompts
You can modify the prompt generation in `src/api-config.js`:

```javascript
PROMPT_ENHANCEMENT: {
  SURFACE_KEYWORDS: [
    'equirectangular map',
    'seamless',
    '2:1 ratio',
    'realistic surface features',
    '8k detail',
    'high resolution'
  ],
  // Add your own keywords here
}
```

### Image Quality Settings
Adjust image generation parameters in `src/api-config.js`:

```javascript
IMAGE_SETTINGS: {
  WIDTH: 1024,
  HEIGHT: 512,
  QUALITY: 90,
  FORMAT: 'jpeg'
}
```

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Store API keys in environment variables
2. **Rate Limiting**: Implement client-side rate limiting
3. **Caching**: Cache generated images to reduce API calls
4. **Error Handling**: Add comprehensive error handling
5. **Loading States**: Improve user experience with better loading indicators

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API key configuration
3. Test with simple planet descriptions first
4. Check Hugging Face API status at [status.huggingface.co](https://status.huggingface.co)

## License

This project is based on the original 3D Solar System by Karol Fryc, licensed under MIT License. The AI planet generation feature is an enhancement that maintains compatibility with the original project.


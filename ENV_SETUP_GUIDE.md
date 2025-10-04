# Environment Setup Guide for SDXL LoRA Integration

This guide will help you set up environment variables for the SDXL LoRA planet textures integration.

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Your Hugging Face API Key
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Give it a name (e.g., "3D Solar System")
4. Select "Read" access
5. Copy the generated token (starts with `hf_`)

### 3. Create Environment File
```bash
# Copy the example file
cp .env.example .env

# Edit the .env file
# Replace 'your_hugging_face_api_key_here' with your actual API key
```

### 4. Configure Your .env File
Open `.env` and update the following:

```env
# Required: Your Hugging Face API key
HUGGING_FACE_API_KEY=hf_your_actual_api_key_here

# Optional: Debug mode (set to true for detailed logging)
DEBUG_MODE=false
```

### 5. Start the Development Server
```bash
npm run dev
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `HUGGING_FACE_API_KEY` | Your Hugging Face API token | `hf_abc123...` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `HUGGING_FACE_MODEL_URL` | Override the model URL | SDXL LoRA model | `https://api-inference.huggingface.co/models/sshh12/sdxl-lora-planet-textures` |
| `HUGGING_FACE_MAX_RETRIES` | Maximum API retry attempts | `3` | `5` |
| `HUGGING_FACE_TIMEOUT` | API request timeout (ms) | `30000` | `60000` |
| `MAX_API_CALLS_PER_MINUTE` | Rate limiting | `10` | `20` |
| `RATE_LIMIT_RESET_MINUTES` | Rate limit reset time | `5` | `10` |
| `DEBUG_MODE` | Enable debug logging | `false` | `true` |

## Verification

### Check Environment Status
Open your browser's developer console and run:
```javascript
envSetup.displayStatus()
```

### Run Integration Tests
```javascript
sdxlTest.runAllTests()
```

### Test API Key
```javascript
// Test your API key
const apiKey = process.env.HUGGING_FACE_API_KEY;
const validation = envSetup.validateApiKey(apiKey);
console.log(validation);

// Test API connectivity
const testResult = await envSetup.testApiKey(apiKey);
console.log(testResult);
```

## Troubleshooting

### Common Issues

**❌ "API key not configured"**
- Check that your `.env` file exists in the project root
- Verify the API key is correctly set in `.env`
- Make sure you restarted the development server after creating `.env`

**❌ "API key is invalid"**
- Verify the API key starts with `hf_`
- Check that the token has read permissions
- Ensure the token hasn't expired

**❌ "Rate limit exceeded"**
- Wait a few minutes before making more requests
- Consider increasing `MAX_API_CALLS_PER_MINUTE` in `.env`
- Check your Hugging Face account usage limits

**❌ "Service temporarily unavailable"**
- The model may be loading (can take a few minutes)
- Try again in a few minutes
- Check Hugging Face status page

### Debug Mode

Enable debug mode for detailed logging:
```env
DEBUG_MODE=true
```

This will show:
- Detailed error messages
- API request/response information
- Environment variable status
- Rate limiting information

### Environment Status Check

The system automatically checks your environment configuration on startup. Look for messages like:

```
🔧 Environment Configuration Status:
=====================================
✅ Environment is properly configured!
```

Or if there are issues:
```
❌ Environment configuration incomplete
Missing variables: HUGGING_FACE_API_KEY
💡 Suggestions:
   1. Get your API key from https://huggingface.co/settings/tokens
   2. Create a .env file in your project root
   3. Add HUGGING_FACE_API_KEY=your_actual_api_key_here
   4. Restart your development server
```

## Security Notes

### ✅ Do's
- Keep your `.env` file in `.gitignore` (already configured)
- Use environment variables for sensitive data
- Regularly rotate your API keys
- Use read-only tokens when possible

### ❌ Don'ts
- Never commit `.env` files to version control
- Don't hardcode API keys in source code
- Don't share your API keys publicly
- Don't use admin tokens unless necessary

## Advanced Configuration

### Custom Model URL
If you want to use a different model:
```env
HUGGING_FACE_MODEL_URL=https://api-inference.huggingface.co/models/your-custom-model
```

### Rate Limiting
Adjust rate limiting based on your needs:
```env
MAX_API_CALLS_PER_MINUTE=20
RATE_LIMIT_RESET_MINUTES=10
```

### Timeout Settings
For slower connections:
```env
HUGGING_FACE_TIMEOUT=60000
HUGGING_FACE_MAX_RETRIES=5
```

## Production Deployment

For production deployment:

1. **Set environment variables** in your hosting platform
2. **Don't use .env files** in production
3. **Use secure secret management** (e.g., Vercel secrets, Netlify environment variables)
4. **Monitor API usage** to avoid unexpected costs
5. **Set appropriate rate limits** based on expected traffic

### Example for Vercel
```bash
vercel env add HUGGING_FACE_API_KEY
# Enter your API key when prompted
```

### Example for Netlify
In your Netlify dashboard:
1. Go to Site settings > Environment variables
2. Add `HUGGING_FACE_API_KEY` with your API key value

## Support

If you encounter issues:

1. **Check the console** for error messages
2. **Run the test suite** to identify problems
3. **Verify your API key** using the validation tools
4. **Check Hugging Face status** for service issues
5. **Review this guide** for common solutions

For additional help, check the main project documentation or create an issue in the project repository.

---

*This setup ensures your SDXL LoRA integration works securely and efficiently!* 🚀


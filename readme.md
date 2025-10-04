# Enhanced 3D Solar System 🌌

A dynamic and interactive simulation of our solar system created using THREE.js and Vite, enhanced with AI-powered planet prediction and generation.

## 🚀 New Features

### 🔮 AI-Powered Predictive Planet Generation
- **Custom Planet Creation**: Generate unique planets using text descriptions
- **Predictive Exoplanets**: Uses a trained classifier to suggest scientifically plausible but unconfirmed worlds based on NASA's Kepler Objects of Interest (KOI) dataset
- **Educational & Fun**: Not meant to be 100% scientifically accurate, but designed to spark curiosity for younger learners
- **Real-time 3D Rendering**: See your generated planets in the 3D solar system with textures, bump maps, and atmospheric effects

### 📊 Exoplanet Database Integration
- **Real NASA Data**: Load and display actual NASA exoplanet data
- **Interactive Data Table**: Browse planetary data and generate 3D planets with one click
- **Smart Classification**: System to label planets as Candidate, Confirmed, or False Positive
- **One-Click Generation**: Generate 3D planets from real exoplanet data

### 🎨 Hugging Face AI Textures
- **Powered by SDXL LoRA**: Uses [sshh12/sdxl-lora-planet-textures](https://huggingface.co/sshh12/sdxl-lora-planet-textures) model
- **Multiple Texture Types**: Generates surface textures, bump maps, and atmospheres for planets
- **High-Quality Results**: Specialized model trained specifically for planet textures
- **Environment Configuration**: Easy setup with `.env` file for API keys

### 🔗 Google Colab (Machine Learning Model)
- **Trained Exoplanet Classifier**: Using NASA's KOI dataset
- **Colab Notebook**: [View & Run Here](https://colab.research.google.com/drive/1Z7HSndSi9O6kUfRAot1MutMpO8lSazYr?usp=sharing)
- **Smart Predictions**: Model predicts whether a candidate exoplanet is Confirmed, False Positive, or remains a Candidate
- **AI Integration**: Results power the Predictive AI Planet Generation mode in this project

## 🛠️ Tech Stack

- **Frontend**: THREE.js + Vite
- **AI Textures**: Stable Diffusion XL (via Hugging Face)
- **AI Classification**: Python (XGBoost + Isotonic Calibration) in Google Colab
- **Environment Management**: dotenv for secure configuration
- **Development**: Cursor IDE for rapid prototyping

## 🎯 Purpose

This project bridges science and imagination:

- **For students & young learners**: Makes astronomy fun and interactive
- **For educators**: A teaching tool to explain how exoplanet data is used in science
- **For hackathons**: A showcase of combining real NASA data with AI creativity
- **For developers**: Demonstrates modern web technologies with AI integration

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Hugging Face API key (optional, works with placeholders)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd solo-panda-nasa

# Install dependencies
npm install

# Set up environment variables
npm run setup-env

# Edit .env file with your Hugging Face API key
# Get your key from: https://huggingface.co/settings/tokens

# Start development server
npm run dev
```

### Environment Setup
1. Get your Hugging Face API key from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Run `npm run setup-env` to create your `.env` file
3. Edit `.env` and replace `your_hugging_face_api_key_here` with your actual API key
4. Restart the development server

## 📚 Documentation

- **[Environment Setup Guide](ENV_SETUP_GUIDE.md)** - Complete setup instructions
- **[SDXL Integration Guide](SDXL_INTEGRATION.md)** - AI texture generation details
- **[Google Colab Notebook](https://colab.research.google.com/drive/1Z7HSndSi9O6kUfRAot1MutMpO8lSazYr?usp=sharing)** - Machine learning model training

## 🧪 Testing

Test your setup in the browser console:
```javascript
// Check environment configuration
envSetup.displayStatus()

// Run integration tests
sdxlTest.runAllTests()

// Test API connectivity
envSetup.testApiKey(process.env.HUGGING_FACE_API_KEY)
```

## 🤝 Contributing

This project welcomes contributions! Whether you're:
- Adding new planet types or features
- Improving the AI classification model
- Enhancing the 3D visualizations
- Creating educational content

Please feel free to submit issues and pull requests.

## 🙏 Credits
This project is based on the original **3D Solar System in THREE.js** by [Karol Fryc](https://w21030911.nuwebspace.co.uk/graphics/assessment/), available under the MIT License. The original project provided the foundation for the 3D rendering functionality.
## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

*Explore the cosmos with AI-powered planet generation! 🪐✨*
#!/usr/bin/env node

// Environment Setup Script
// Run this script to help set up your .env file

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 SDXL LoRA Environment Setup');
console.log('==============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  
  // Check if API key is configured
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your_hugging_face_api_key_here')) {
    console.log('⚠️  API key not configured in .env file');
    console.log('   Please edit .env and replace "your_hugging_face_api_key_here" with your actual API key');
  } else if (envContent.includes('HUGGING_FACE_API_KEY=')) {
    console.log('✅ API key appears to be configured');
  }
} else {
  console.log('📝 Creating .env file from template...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from .env.example');
    console.log('⚠️  Please edit .env and add your Hugging Face API key');
  } else {
    console.log('❌ .env.example file not found');
    console.log('   Creating basic .env file...');
    
    const basicEnv = `# Hugging Face API Configuration
# Get your API key from: https://huggingface.co/settings/tokens
HUGGING_FACE_API_KEY=your_hugging_face_api_key_here

# Optional: Debug mode
DEBUG_MODE=false
`;
    
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Basic .env file created');
  }
}

console.log('\n📋 Next Steps:');
console.log('1. Get your API key from: https://huggingface.co/settings/tokens');
console.log('2. Edit .env file and replace "your_hugging_face_api_key_here"');
console.log('3. Run "npm run dev" to start the development server');
console.log('4. Check browser console for environment status');

console.log('\n🧪 To test your setup:');
console.log('1. Open browser console');
console.log('2. Run: envSetup.displayStatus()');
console.log('3. Run: sdxlTest.runAllTests()');

console.log('\n✨ Setup complete! Happy planet generating! 🪐');

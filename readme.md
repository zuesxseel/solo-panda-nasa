# 3D Solar System with AI Planet Generation

Welcome to the **Enhanced 3D Solar System** project, a dynamic and interactive simulation of our solar system created using THREE.js and the Vite framework. This enhanced version includes AI-powered planet generation capabilities, allowing users to create custom planets using text descriptions and see them rendered in real-time 3D.

## 🚀 New Features

### AI-Powered Planet Generation
- **Custom Planet Creation**: Generate unique planets using text descriptions
- **Real-time 3D Rendering**: See your generated planets in the 3D solar system
- **Multiple Texture Types**: Generate surface textures, bump maps, and atmospheric effects
- **Interactive Chatbot**: AI assistant to help learn about planets and space
- **Hugging Face Integration**: Uses Stable Diffusion for high-quality planet textures

### Exoplanet Database Integration
- **Real Exoplanet Data**: Load and display actual NASA exoplanet data
- **Interactive Data Table**: Browse 5 rows of key planetary data
- **Copy-Paste Functionality**: Copy planet data directly to clipboard
- **One-Click Generation**: Generate 3D planets from real exoplanet data
- **Smart Data Processing**: Automatically determines planet types from scientific data

### Enhanced User Experience
- **Planet Generator Panel**: Easy-to-use interface for creating custom planets
- **Preview System**: See generated textures before applying to 3D spheres
- **Custom Planet Library**: Save and manage your generated planets
- **Real-time Integration**: Add custom planets to the existing solar system

## 📚 Original Project Credits

This project is based on the original **3D Solar System in THREE.js** by Karol Fryc, available under the MIT License. The original project provided the foundation for the 3D rendering functionality.

**Original Project**: https://w21030911.nuwebspace.co.uk/graphics/assessment/
**License**: MIT License (see LICENSE file)


## Features

### Standard Setup
- **Scene, Camera, Renderer**: Basic setup for rendering 3D scenes using THREE.js.
- **Controls**: Interactive controls for navigating the 3D space.
- **Texture Loaders**: Efficient loading of textures for planets, moons, and other objects.

### Postprocessing Effects
- **BloomPass**: Adds a glowing effect to the Sun.
- **OutlinePass**: Highlights planets with a white outline when hovered over.
- **EffectComposer**: Manages and combines all postprocessing effects for rendering.

### Star Background
- A realistic starry sky that provides a beautiful backdrop for the solar system.

### Interactive Controls
- **dat.GUI**: Allows users to adjust parameters such as orbit speed and the intensity of the Sun's glow.

### Lighting
- **AmbientLight**: Provides soft lighting throughout the scene.
- **PointLight**: Positioned at the center of the Sun to cast realistic shadows.

### Detailed Planet Creation
- **Attributes**: Size, position, tilt, texture, bump material, rings, and atmospheres.
- **Moons**: Includes moons with realistic textures and orbits.
- **Special Materials**: Earth’s ShaderMaterial for day/night transitions and moving clouds.
- **Non-Spherical Moons**: Phobos and Deimos are modeled from 3D objects for realism.

### Realistic Orbits and Rotations
- Planets and moons orbit the Sun and rotate on their axes with scaled distances and speeds.
- Scaled sizes for better visual representation: Mercury, Venus, Earth, Mars, and Pluto are at actual scale, while larger planets are scaled down for balance.

### Shadows
- Realistic shadow casting from the PointLight at the Sun’s center.

### Asteroid Belts
- **Procedurally Generated**: 1000 asteroids for the belt between Mars and Jupiter, 3000 for the Kuiper belt.
- **Performance Optimization**: Simplified textures to ensure high performance.

### Select Feature
- **Hover Effect**: White outline around planets when hovered.
- **Zoom In**: Camera zooms in and displays planet details on click.
- **Zoom Out**: Returns to default view on closing the pop-up.

## Conclusion
This project is a comprehensive representation of our solar system, bringing together realistic modeling, advanced visual effects, and interactive features. Explore the planets, their moons, and the vast asteroid belts, all from the comfort of your screen.

## License

This project is licensed under the [MIT License](./LICENSE).

Feel free to contribute, suggest improvements, or use this project as a foundation for your own THREE.js experiments. Happy exploring!

# 3D Models Directory

This folder contains 3D models (GLB, GLTF, OBJ) used across the Chesspoint.io website.

## 📁 Folder Structure

```
models/
├── homepage/     # 3D models for the homepage
├── lessons/      # 3D models for the lessons page
└── donate/       # 3D models for the donate page
```

## 📦 Supported Formats

- **GLB** (recommended) - Single binary file, most efficient
- **GLTF** - JSON + separate files
- **OBJ** - Legacy format, larger file size

## 🚀 Usage in Code

Reference models using the public path:

```tsx
// Homepage model
const modelPath = '/models/homepage/your-model.glb';

// Lessons model
const modelPath = '/models/lessons/your-model.glb';

// Donate model
const modelPath = '/models/donate/your-model.glb';
```

## ⚠️ Important Notes

1. **File Size**: Keep models under 5MB for optimal web performance
2. **Optimization**: Compress GLB files before uploading
3. **Naming**: Use lowercase, hyphens, and descriptive names (e.g., `chess-piece.glb`)

## 📚 Recommended Libraries

For rendering 3D models in React/Next.js:

- **React Three Fiber**: `@react-three/fiber`
- **React Three Drei**: `@react-three/drei` (loaders, helpers)
- **Three.js**: Core 3D library

Install with:
```bash
npm install @react-three/fiber @react-three/drei three
```


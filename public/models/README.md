# 3D Models Directory

This directory contains GLB/GLTF 3D models used in the Chesspoint application.

## Directory Structure

```
models/
├── mascot/
│   ├── Elo_Big_Wave_Hello_withSkin.glb    # Mascot wave/welcome animation (default)
│   ├── Elo_Breakdance_1990_withSkin.glb   # Mascot celebrate animation
│   ├── Elo_Arm_Circle_Shuffle_withSkin.glb # Mascot shuffle animation
│   ├── Elo_Running_withSkin.glb           # Mascot running animation
│   └── Elo_Hello_Run_withSkin.glb         # Mascot hello run animation
└── lessons/
    ├── london.glb                         # London System opening - London Parliament model
    └── [other-opening-models].glb
```

## Model Requirements

### Mascot Models
- **Format**: GLB (binary GLTF)
- **Recommended Size**: < 5MB per file
- **Animations**: Should include at least an "idle" animation
- **Naming**: Animation names should match: `idle`, `wave`, `point`, `celebrate` (case-insensitive)

### Lesson Models
- **Format**: GLB (binary GLTF)
- **Recommended Size**: < 10MB per file
- **Purpose**: Visual representation of chess opening themes (e.g., London Parliament for London System)
- **Optimization**: Use compressed textures and optimized geometry

## Adding New Models

1. Place your GLB file in the appropriate directory (`mascot/` or `lessons/`)
2. Update the component that uses the model to reference the new path
3. For lessons, add the `modelPath` property to the lesson data structure

## Performance Tips

- Compress GLB files using tools like `gltf-pipeline` or Blender
- Use texture compression (KTX2/Basis Universal) for better performance
- Keep polygon counts reasonable (< 50k triangles for mascot, < 100k for lesson models)
- Test on mobile devices to ensure acceptable performance

## Tools

- **Blender**: For creating/editing 3D models
- **gltf-pipeline**: For optimizing GLB files (`npm install -g gltf-pipeline`)
- **gltf-transform**: For advanced optimization (`npm install -g @gltf-transform/cli`)


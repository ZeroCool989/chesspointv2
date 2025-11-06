# Contributing to Chesspoint.io

Thank you for your interest in contributing to Chesspoint.io! This document provides guidelines and instructions for contributing to this chess analysis and playing platform.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Making Changes](#making-changes)
- [Project Structure](#project-structure)
- [Key Features & Areas](#key-features--areas)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be kind, constructive, and professional in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/chesspointv2.git
   cd chesspointv2
   ```

3. **Set up the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ZeroCool989/chesspointv2.git
   ```

4. **Install dependencies**:
   ```bash
   # Frontend (Next.js)
   npm install
   
   # Backend (Express)
   cd auth-backend
   npm install
   cd ..
   ```

5. **Set up environment variables**:
   ```bash
   # Frontend - copy .env.example to .env.local
   # Backend - copy auth-backend/.env.example to auth-backend/.env
   ```
   
   Required environment variables:
   - Frontend: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_YOUTUBE_API_KEY` (optional)
   - Backend: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`

6. **Start development servers**:
   ```bash
   # Terminal 1: Frontend
   npm run dev
   # Runs on http://localhost:3000
   
   # Terminal 2: Backend
   cd auth-backend
   npm run dev
   # Runs on http://localhost:4001
   ```

## Development Workflow

1. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   # Examples:
   git checkout -b feature/music-player-improvements
   git checkout -b fix/analysis-accuracy-calculation
   git checkout -b feat/new-piece-set
   ```

2. **Make your changes** following the coding standards

3. **Test your changes**:
   ```bash
   # Lint and type check
   npm run lint
   
   # Test the backend (if applicable)
   cd auth-backend
   npm run lint
   ```

4. **Commit your changes** with a clear commit message (see [Commit Messages](#commit-messages))

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## Making Changes

### Project Structure

```
chesspointv2/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── board/         # Chess board components
│   │   └── MusicPlayer.tsx # Music player component
│   ├── contexts/          # React contexts (AuthContext)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and libraries
│   │   ├── engine/       # Stockfish engine integration
│   │   ├── feedback/    # Feedback system
│   │   └── music.ts      # Music file management
│   ├── locales/          # i18n translation files
│   ├── pages/            # Next.js pages
│   │   ├── analysis.tsx  # Game analysis page
│   │   └── play.tsx      # Play against computer
│   ├── sections/         # Feature sections
│   │   ├── analysis/     # Analysis features
│   │   ├── play/         # Play features
│   │   └── layout/       # Layout components
│   ├── styles/           # Global styles
│   └── theme/            # Theme configuration
├── auth-backend/          # Backend API
│   └── src/
│       ├── routes/       # API routes
│       │   ├── auth.ts   # Authentication
│       │   ├── user.ts   # User management
│       │   └── music.ts  # Music proxy
│       ├── models/       # MongoDB models
│       ├── middleware/   # Express middleware
│       └── server.ts     # Express server
├── public/               # Static assets
│   ├── engines/         # Stockfish engine files
│   └── piece/           # Chess piece sets
└── pages/               # Next.js pages (legacy)
```

## Key Features & Areas

### Chess Engine Integration
- **Location**: `src/lib/engine/`
- **Files**: `stockfish11.ts`, `stockfish16.ts`, `stockfish16_1.ts`, `stockfish17.ts`
- **Purpose**: Stockfish WebAssembly integration for game analysis and play
- **Tips**: When modifying engine code, test with different Stockfish versions

### Game Analysis
- **Location**: `src/sections/analysis/`, `src/pages/analysis.tsx`
- **Features**: Move classification, accuracy calculation, ELO estimation
- **Related**: `src/lib/engine/helpers/` contains analysis utilities

### Play Against Computer
- **Location**: `src/sections/play/`, `src/pages/play.tsx`
- **Features**: Stockfish opponent, game settings, move history
- **Related**: Uses same engine integration as analysis

### Music Player
- **Location**: `src/components/MusicPlayer.tsx`, `src/lib/music.ts`
- **Backend**: `auth-backend/src/routes/music.ts`
- **Features**: Google Drive integration, equalizer visualization
- **Storage**: Google Drive (via backend proxy)

### Authentication
- **Location**: `src/contexts/AuthContext.tsx`, `auth-backend/src/routes/auth.ts`
- **Features**: JWT-based authentication, user management
- **Database**: MongoDB user model

### Game Database
- **Location**: `src/hooks/useGameDatabase.ts`
- **Features**: Browser IndexedDB storage for games
- **Purpose**: Store and retrieve analyzed games locally

### UI Components
- **Location**: `src/components/`, `src/sections/`
- **Framework**: Material-UI (MUI) v6
- **Themes**: Chess piece sets, board themes
- **Styling**: Emotion CSS-in-JS

## Submitting Changes

### Pull Request Process

1. **Update your fork** with the latest changes:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Rebase your feature branch** (if needed):
   ```bash
   git checkout feature/your-feature-name
   git rebase main
   ```

3. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub with:
   - A clear title and description
   - Reference to related issues (if any)
   - Screenshots or examples (if applicable)
   - Description of what was changed and why

### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Test your changes thoroughly (analysis, play, music player, etc.)
- Update documentation if needed
- Follow the coding standards
- Ensure linting passes (`npm run lint`)
- Request review from maintainers

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow ESLint rules (run `npm run lint`)
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Keep functions small and focused
- Use `const` and `let` appropriately (avoid `var`)

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Use TypeScript for props and state
- Keep components focused and reusable
- Use `useCallback` and `useMemo` for performance optimization
- Prefer custom hooks for reusable logic

### Chess-Specific

- Use `chess.js` for chess logic (don't reimplement rules)
- Test moves with multiple Stockfish versions when possible
- Handle engine errors gracefully (timeouts, crashes, etc.)
- Consider performance for real-time analysis

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings (where consistent)
- Add trailing commas in multi-line objects/arrays
- Use meaningful variable names
- Add comments for complex logic (especially chess-related)

### Example: Chess Analysis Function

```typescript
/**
 * Calculates the accuracy percentage for a player based on move classifications
 * @param classifications - Array of move classifications (best, excellent, good, inaccuracy, mistake, blunder)
 * @returns Accuracy percentage (0-100)
 */
function calculateAccuracy(
  classifications: MoveClassification[]
): number {
  if (classifications.length === 0) return 0;
  
  const correctMoves = classifications.filter(
    (classification) =>
      classification === 'best' ||
      classification === 'excellent' ||
      classification === 'good'
  ).length;
  
  return Math.round((correctMoves / classifications.length) * 100);
}
```

### Example: React Component

```typescript
/**
 * Button component for analyzing a chess game
 */
interface AnalyzeButtonProps {
  onAnalyze: () => void;
  disabled?: boolean;
  isAnalyzing?: boolean;
}

export const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({
  onAnalyze,
  disabled = false,
  isAnalyzing = false,
}) => {
  return (
    <Button
      onClick={onAnalyze}
      disabled={disabled || isAnalyzing}
      variant="contained"
      color="primary"
    >
      {isAnalyzing ? 'Analyzing...' : 'Analyze Game'}
    </Button>
  );
};
```

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Scopes (Chesspoint-specific)

- `analysis`: Game analysis features
- `play`: Play against computer features
- `engine`: Stockfish engine integration
- `music`: Music player features
- `auth`: Authentication and user management
- `ui`: UI components and styling
- `board`: Chess board components
- `database`: Game database features

### Examples

```
feat(music): Add equalizer visualization to music player

fix(analysis): Fix move classification accuracy calculation

feat(engine): Add Stockfish 17 support

docs(readme): Update installation instructions

refactor(play): Optimize Stockfish integration for faster moves

fix(board): Fix piece rendering on mobile devices
```

## Testing

Before submitting your PR, ensure:

1. **Code compiles** without errors
2. **Linting passes**: `npm run lint` (frontend and backend)
3. **Type checking passes**: TypeScript should compile without errors
4. **Manual testing**:
   - Test game analysis with different PGN files
   - Test play against computer (if changed)
   - Test music player (if changed)
   - Test authentication (if changed)
   - Test on different browsers
   - Test responsive design (mobile, tablet, desktop)
5. **No console errors** in the browser
6. **No console warnings** (if possible)

### Testing Checklist

- [ ] Game analysis works correctly
- [ ] Move classifications are accurate
- [ ] Play against computer works
- [ ] Music player plays and visualizes correctly
- [ ] Authentication works (login, signup, logout)
- [ ] Responsive design works on mobile
- [ ] No performance regressions
- [ ] Stockfish engine integration works

## Documentation

- Update README.md if you add new features
- Add JSDoc comments for new functions
- Update CONTRIBUTING.md if you change the contribution process
- Document environment variables if you add new ones
- Add comments for complex chess logic
- Document new Stockfish engine versions

## Chesspoint-Specific Tips

### Working with Stockfish

- Different Stockfish versions have different strengths
- Test with multiple versions when possible
- Handle engine crashes gracefully
- Consider performance for real-time analysis

### Working with Chess Logic

- Always use `chess.js` for move validation
- Don't reimplement chess rules
- Test with various game types (standard, Chess960, etc.)
- Handle edge cases (stalemate, checkmate, etc.)

### Working with UI

- Material-UI v6 is the UI framework
- Follow existing component patterns
- Test responsive design
- Consider dark/light mode support

### Working with Backend

- Backend runs on Express.js
- MongoDB is used for user data
- Google Drive proxy for music files
- JWT for authentication

## Questions?

If you have questions or need help:

1. Check existing [Issues](https://github.com/ZeroCool989/chesspointv2/issues)
2. Create a new [Issue](https://github.com/ZeroCool989/chesspointv2/issues/new) with your question
3. Review existing code for examples
4. Check the [README](README.md) for setup instructions

## Acknowledgments

This project is based on [Chesskit](https://github.com/GuillaumeSD/Chesskit) by GuillaumeSD. We are grateful for the foundation it provided for the analysis and play features. When contributing, please respect the original work and maintain proper attribution.

---

Thank you for contributing to Chesspoint.io! 🎉♟️

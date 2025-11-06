# Chesspoint.io

A modern, free chess game analysis tool powered by Stockfish engine. Analyze your chess games with professional-grade accuracy and beautiful visualizations.

## 🚀 Features

- **Game Analysis**: Upload PGN files or paste game URLs from Chess.com and Lichess
- **Stockfish Integration**: Multiple Stockfish versions (11, 16, 16.1, 17) for different analysis depths
- **Move Classification**: Automatic move quality assessment (Best, Excellent, Good, Inaccuracy, Mistake, Blunder)
- **Player Metrics**: Accuracy percentages and estimated ELO ratings
- **Interactive Board**: Navigate through moves with visual feedback
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Multiple Themes**: Beautiful piece sets and board themes
- **Export Options**: Save analysis results and game data
- **YouTube Integration**: Educational chess content search and playback
- **User Authentication**: Secure login and registration system
- **Music Player**: Background music player with equalizer visualization
- **Database**: Store and review your games in browser database

## 🎯 Quick Start

1. **Load a Game**:
   - Paste a Chess.com or Lichess game URL
   - Upload a PGN file
   - Enter moves manually

2. **Analyze**:
   - Click "Analyze" to start Stockfish analysis
   - View move classifications and accuracy metrics
   - Explore engine lines and evaluations

3. **Explore**:
   - Navigate through moves using the board
   - Check the moves list for detailed classifications
   - View the evaluation graph for game progression

4. **Play**:
   - Play against Stockfish at any ELO level
   - Adjust engine strength and time controls
   - Review your games after playing

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 18, TypeScript)
- **UI Library**: Material-UI (MUI) v6
- **State Management**: Jotai
- **Styling**: Emotion, CSS-in-JS
- **Icons**: Iconify
- **Charts**: Recharts
- **Chess Logic**: Chess.js
- **Chess Board**: React Chessboard

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt, Helmet, CORS
- **Validation**: Zod
- **Music Storage**: Google Drive (via backend proxy)

### Chess Engine
- **Stockfish.js**: WebAssembly ports of Stockfish engine
- **Versions**: Stockfish 11, 16, 16.1, 17 (with lite variants)

## 📦 Installation

### Prerequisites
- Node.js 20+ and npm
- MongoDB (local or MongoDB Atlas)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/ZeroCool989/chesspointv2.git
cd chesspointv2

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure environment variables (see .env.example)
# Add your YouTube API key, MongoDB URI, etc.

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to auth-backend
cd auth-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Set MONGODB_URI, JWT_SECRET, etc.

# Setup database indexes
npm run setup-db

# Start development server
npm run dev
```

The backend will run on `http://localhost:4001` by default.

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🎨 Customization

### Engine Settings
- Choose Stockfish version (11, 16, 16.1, 17)
- Adjust analysis depth
- Configure time limits

### Visual Themes
- Multiple piece sets (Alpha, Caliente, California, Cardinal, etc.)
- Board color schemes
- Responsive layouts

### Music Player
- Background music tracks stored on Google Drive
- Equalizer visualization
- Volume control and repeat modes

## 📱 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** - see the [LICENCE](LICENCE) file for details.

## 🙏 Acknowledgments & Credits

### Project Foundation

This project is based on and inspired by **[Chesskit](https://github.com/GuillaumeSD/Chesskit)** by GuillaumeSD.

**Chesskit** was used as the foundation for:
- **Analysis functionality**: The game analysis features, Stockfish engine integration, move analysis, and game review capabilities are based on Chesskit's implementation
- **Play-against-computer**: The play page and Stockfish integration for playing against the computer are derived from Chesskit
- **Board visualization**: Core chess board and move visualization concepts
- **Engine integration**: Stockfish WebAssembly integration patterns

Chesskit is licensed under AGPL-3.0 and is available at [https://github.com/GuillaumeSD/Chesskit](https://github.com/GuillaumeSD/Chesskit).

### Chess Engine
- **Stockfish.js**: JavaScript/WebAssembly ports of Stockfish
  - **Stockfish.js 17** © 2025, Chess.com, LLC
    - Repository: https://github.com/nmrugg/stockfish.js
    - License: GPLv3
  - **Stockfish.js 16.1** © 2024, Chess.com, LLC
    - Repository: https://github.com/nmrugg/stockfish.js
    - License: GPLv3
  - **Stockfish.js 16** © 2023, Chess.com, LLC
    - Repository: https://github.com/nmrugg/stockfish.js
    - Based on:
      - stockfish.wasm by Niklas Fiekas (https://github.com/niklasf/stockfish.wasm)
      - Stockfish by Hiroshi Ogawa (https://github.com/hi-ogawa/Stockfish)
    - License: GPLv3
  - **Stockfish.js 11**
    - Based on Stockfish by ddugovic (https://github.com/ddugovic/Stockfish)
    - Repository: https://github.com/niklasf/stockfish.js
    - License: GPLv3
- **Stockfish Engine** © T. Romstad, M. Costalba, J. Kiiski, G. Linscott and other contributors
  - Repository: https://github.com/official-stockfish/Stockfish
  - License: GPLv3

### JavaScript Libraries
- **Chess.js** - JavaScript chess library for game logic
  - Repository: https://github.com/jhlywa/chess.js
  - License: BSD-2-Clause

- **React Chessboard** - React component for chess board visualization
  - Repository: https://github.com/Clariity/react-chessboard
  - License: MIT

### Frontend Framework & Libraries
- **Next.js** - React framework for production
  - Repository: https://github.com/vercel/next.js
  - License: MIT

- **React** - JavaScript library for building user interfaces
  - Repository: https://github.com/facebook/react
  - License: MIT

- **Material-UI (MUI)** - React component library
  - Repository: https://github.com/mui/material-ui
  - License: MIT

- **Jotai** - Primitive and flexible state management for React
  - Repository: https://github.com/pmndrs/jotai
  - License: MIT

- **Emotion** - CSS-in-JS library
  - Repository: https://github.com/emotion-js/emotion
  - License: MIT

- **Recharts** - Composable charting library built on React components
  - Repository: https://github.com/recharts/recharts
  - License: MIT

- **Iconify** - Icon framework
  - Repository: https://github.com/iconify/iconify
  - License: MIT

- **React YouTube** - React component for YouTube embeds
  - Repository: https://github.com/tjallingt/react-youtube
  - License: MIT

### Backend Libraries
- **Express** - Fast, unopinionated web framework for Node.js
  - Repository: https://github.com/expressjs/express
  - License: MIT

- **Mongoose** - MongoDB object modeling for Node.js
  - Repository: https://github.com/Automattic/mongoose
  - License: MIT

- **jsonwebtoken** - JSON Web Token implementation
  - Repository: https://github.com/auth0/node-jsonwebtoken
  - License: MIT

- **bcrypt** - Password hashing library
  - Repository: https://github.com/kelektiv/node.bcrypt.js
  - License: MIT

- **Zod** - TypeScript-first schema validation
  - Repository: https://github.com/colinhacks/zod
  - License: MIT

- **Helmet** - Security middleware for Express
  - Repository: https://github.com/helmetjs/helmet
  - License: MIT

- **express-rate-limit** - Rate limiting middleware for Express
  - Repository: https://github.com/express-rate-limit/express-rate-limit
  - License: MIT

### APIs & Services
- **Chess.com API** - For retrieving game data
  - Website: https://www.chess.com
  - API Documentation: https://www.chess.com/news/view/published-data-api

- **Lichess API** - For retrieving game data
  - Website: https://lichess.org
  - API Documentation: https://lichess.org/api

- **YouTube Data API v3** - For educational chess content
  - Website: https://developers.google.com/youtube/v3
  - License: Google API Terms of Service

- **Google Drive** - For music file storage (via backend proxy)
  - Website: https://drive.google.com

### Development Tools
- **TypeScript** - Typed superset of JavaScript
  - Repository: https://github.com/microsoft/TypeScript
  - License: Apache-2.0

- **ESLint** - JavaScript linter
  - Repository: https://github.com/eslint/eslint
  - License: MIT

### Other Dependencies
- **@tanstack/react-query** - Data fetching for React
- **i18next** - Internationalization framework
- **idb** - IndexedDB wrapper
- **tinycolor2** - Color manipulation library
- **nodemailer** - Email sending library
- **@sentry/nextjs** - Error tracking and monitoring

## 🔗 Links

- **GitHub Repository**: [github.com/ZeroCool989/chesspointv2](https://github.com/ZeroCool989/chesspointv2)
- **Issues**: [Report a bug](https://github.com/ZeroCool989/chesspointv2/issues)

## 📝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to contribute to this project.

---

**Chesspoint.io** - Analyze your chess games like a pro! 🏆

# 🎯 Chess Academy V0 - Interactive Chess Learning Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-chess--academy--v0.netlify.app-blue?style=for-the-badge)](https://chess-academy-v0.netlify.app)
[![GitHub](https://img.shields.io/badge/💻_GitHub-Repository-black?style=for-the-badge)](https://github.com/KumarAnandSingh/chess-academy-v0)
[![React](https://img.shields.io/badge/⚛️_React-18-61dafb?style=for-the-badge)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/📘_TypeScript-5.0-blue?style=for-the-badge)](https://www.typescriptlang.org/)

**A comprehensive chess learning platform with progressive difficulty levels, AI opponents, and gamification features.**

![Chess Academy Demo](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Chess+Academy+V0+-+Interactive+Chess+Platform)

</div>

## ✨ Features

### 🎮 **Complete Chess Experience**
- **25 Progressive Difficulty Levels** from Beginner to Chess God
- **AI Opponents** with unique personalities and thinking animations
- **Interactive Chess Board** with drag & drop + click-to-move functionality
- **Color Selection** - play as White or Black pieces

### 🧠 **Learning & Assistance**
- **Piece Tooltips** showing chess piece names and interesting facts
- **10-Second Help System** with 5 progressive hints
- **Enhanced Move Indicators** with attractive green dots
- **Illegal Move Feedback** with vibration and messages

### 🎉 **Gamification Elements**
- **Audio Feedback** for moves, captures, checks, and celebrations
- **Visual Effects** including confetti, nudges, and celebrations
- **Performance Tracking** with statistics and leaderboard
- **XP System** with points and ranking progression
- **Move Efficiency Analysis** compared to Pro players

### 🎨 **Modern UI/UX**
- **3D Chessboard Design** with realistic shadows and lighting
- **Responsive Layout** that works on all devices
- **Smooth Animations** powered by Framer Motion
- **Professional Styling** with Tailwind CSS and shadcn/ui

## 🚀 Live Demo

**Try it now:** [chess-academy-v0.netlify.app](https://chess-academy-v0.netlify.app)

## 🛠 Technical Stack

### **Frontend Framework**
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and building
- **React Router** for navigation

### **Chess Engine & Logic**
- **Chess.js** for game logic and FEN notation handling
- **react-chessboard** for interactive board rendering
- **Stockfish Engine Integration** with intelligent move generation

### **UI & Styling**
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for consistent component design
- **Framer Motion** for smooth animations and effects
- **Lucide React** for beautiful icons

### **Audio & Effects**
- **Web Audio API** for synthetic sound generation
- **LocalStorage** for persistent player statistics
- **Zustand** for global state management

## 🎯 Game Features

### **25 Difficulty Levels**
1. **Beginner (1-8)**: Learn basics with gentle opponents
2. **Intermediate (9-16)**: Tournament-level tactical awareness  
3. **Advanced (17-20)**: Master-level strategic play
4. **Expert (21-25)**: Engine-level precision and perfection

### **AI Personalities**
Each level features unique bot personalities:
- Bobby Beginner (friendly and encouraging)
- Magnus Master (masterful and profound)
- Stockfish Supreme (mechanical precision)
- Divinity Chess God (ultimate chess mastery)

### **Performance Analysis**
- Move efficiency compared to Pro players
- Time tracking and performance tips
- Comprehensive game summaries with improvement suggestions
- Personal statistics and progress tracking

## 🚦 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager

### **Installation**

```bash
# Clone the repository
git clone https://github.com/KumarAnandSingh/chess-academy-v0.git

# Navigate to project directory
cd chess-academy-v0

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### **Build for Production**

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 🎮 How to Play

1. **Select Difficulty Level** - Choose from 25 progressive levels
2. **Choose Your Color** - Play as White or Black pieces
3. **Make Your Moves** - Click or drag pieces to move
4. **Get Help** - Wait 10 seconds for progressive hints
5. **Learn & Improve** - Review performance analysis after each game

## 🏗 Project Structure

```
src/
├── components/
│   ├── chess/              # Chess game components
│   │   ├── ChessBoard.tsx  # Interactive chess board
│   │   ├── EnhancedPlayVsComputer.tsx  # Main game component
│   │   ├── GameLevel.tsx   # Difficulty level definitions
│   │   ├── PieceTooltip.tsx  # Piece information tooltips
│   │   └── HelpSystem.tsx  # Progressive hint system
│   ├── ui/                 # UI components (shadcn/ui)
│   └── ...
├── services/               # Core services
│   ├── stockfishEngine.ts  # Chess engine integration
│   └── audioService.ts     # Audio feedback system
├── stores/                 # State management (Zustand)
└── styles/                 # CSS and styling
```

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea? Please [open an issue](https://github.com/KumarAnandSingh/chess-academy-v0/issues) on GitHub.

## 📈 Performance Optimization

The app includes several performance optimizations:
- Code splitting with dynamic imports
- Memoized chess board rendering
- Efficient state management
- Optimized audio service
- Lazy loading of game components

## 🔮 Future Enhancements (V1+)

- **Multiplayer Mode** with real-time chess matches
- **Puzzle Solving** with tactical training
- **Opening Trainer** for studying chess openings  
- **Endgame Practice** with common endgame scenarios
- **Tournament Mode** with bracket-style competition
- **Analysis Board** with engine evaluation
- **Study Mode** with PGN import/export

## 📊 Development Stats

- **Lines of Code**: 10,000+
- **Components**: 25+
- **Game Levels**: 25 unique AI opponents
- **Audio Effects**: 20+ different sounds
- **Tests**: Comprehensive TypeScript type checking
- **Build Size**: ~650KB (gzipped: ~200KB)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- **Chess.js** team for the excellent chess logic library
- **react-chessboard** for the interactive board component
- **Stockfish** chess engine for move generation inspiration
- **shadcn/ui** for the beautiful component library
- **Framer Motion** for smooth animations

## 🔗 Links

- **Live Demo**: [chess-academy-v0.netlify.app](https://chess-academy-v0.netlify.app)
- **GitHub Repository**: [github.com/KumarAnandSingh/chess-academy-v0](https://github.com/KumarAnandSingh/chess-academy-v0)
- **Issue Tracker**: [github.com/KumarAnandSingh/chess-academy-v0/issues](https://github.com/KumarAnandSingh/chess-academy-v0/issues)

---

<div align="center">

**Built with ❤️ by Kumar Anand Singh**

**Powered by React, TypeScript, and Chess.js**

[![GitHub stars](https://img.shields.io/github/stars/KumarAnandSingh/chess-academy-v0?style=social)](https://github.com/KumarAnandSingh/chess-academy-v0)
[![GitHub forks](https://img.shields.io/github/forks/KumarAnandSingh/chess-academy-v0?style=social)](https://github.com/KumarAnandSingh/chess-academy-v0)

</div>
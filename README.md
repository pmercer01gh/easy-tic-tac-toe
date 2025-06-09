# Tic-Tac-Toe Game

A browser-based Tic-Tac-Toe game built with TypeScript where users play against an AI opponent with adjustable difficulty levels.

## Features

- **Interactive Gameplay**: Classic 3x3 grid with X and O marks
- **Player vs Computer**: Play against a computer opponent
- **Two Difficulty Levels**:
  - **Easy**: Player always wins (never ends in a draw)
  - **Hard**: Computer plays optimally
- **Responsive Design**: Works on desktop and mobile devices
- **Real-Time Feedback**: Game status and results clearly displayed

## Technology Stack

- TypeScript
- HTML5
- CSS3
- Webpack for bundling
- NPM for dependency management

## Project Structure

- `src/` - Source code directory
  - `game.ts` - Core game logic and AI implementation
  - `ui.ts` - UI controller for game interactions
  - `index.ts` - Application entry point
  - `index.html` - HTML template
  - `styles.css` - CSS styles for the application
- `webpack.config.js` - Webpack configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts

## AI Implementation

The game features two distinct AI difficulty levels:

### Easy Mode
The AI in easy mode is designed to ensure the player always wins:
- Skips turns frequently to give the player an advantage
- Avoids blocking the player's winning moves
- If a draw would occur, automatically gives the win to the player
- Makes deliberately suboptimal moves

### Hard Mode
- Implements optimal tic-tac-toe strategy
- Always blocks player's winning moves
- Always takes winning moves when available
- Makes strategic plays for center and corners
- Plays for a draw when winning is not possible

## How to Run

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```
4. Start the development server:
   ```
   npm start
   ```
5. Open your browser and navigate to `http://localhost:8080`

## Game Rules

1. The game is played on a 3×3 grid
2. You are X, the computer is O
3. Players take turns placing their marks in empty squares
4. The first player to get 3 marks in a row (horizontally, vertically, or diagonally) wins
5. When all 9 squares are full and no player has 3 marks in a row, the game ends in a draw (except in easy mode, where the player always wins)

## License

GPL

export type CellValue = 'X' | 'O' | null;
export type Player = 'X' | 'O';
export type GameStatus = 'playing' | 'won' | 'draw';
export type Difficulty = 'easy' | 'hard';

export interface GameState {
    board: CellValue[];
    currentPlayer: Player;
    status: GameStatus;
    winningCombination: number[] | null;
}

export class TicTacToeGame {
    private state: GameState;
    private difficulty: Difficulty;
    private computerMoveCount: number = 0;
      constructor(difficulty: Difficulty = 'hard') {
        this.state = {
            board: Array(9).fill(null),
            currentPlayer: 'X',
            status: 'playing',
            winningCombination: null
        };
        this.difficulty = difficulty;
        this.computerMoveCount = 0;
    }
    
    getState(): GameState {
        // Return a copy to prevent direct mutation
        return {
            board: [...this.state.board],
            currentPlayer: this.state.currentPlayer,
            status: this.state.status,
            winningCombination: this.state.winningCombination 
                ? [...this.state.winningCombination] 
                : null
        };
    }
    
    makeMove(cellIndex: number): boolean {
        // Check if the move is valid
        if (
            cellIndex < 0 || 
            cellIndex >= 9 || 
            this.state.board[cellIndex] !== null ||
            this.state.status !== 'playing'
        ) {
            return false;
        }
        
        // Update the board
        const newBoard = [...this.state.board];
        newBoard[cellIndex] = this.state.currentPlayer;        // Check for win or draw
        let winningCombination = this.checkForWin(newBoard);
        let status: GameStatus = 'playing';
          // In easy mode, X should always win
        const humanPlayer = 'X'; // Human player is always X
        
        if (winningCombination) {
            // If the computer (O) would win in easy mode, change it to a player (X) win
            if (this.difficulty === 'easy' && this.state.currentPlayer === 'O') {
                status = 'won';
                // Give the win to the human player instead
                winningCombination = this.createWinningCombination(newBoard, humanPlayer);
            } else {
                status = 'won';
            }
        } else if (this.isBoardFull(newBoard)) {
            // Special case for easy mode: never allow a draw, player should always win
            if (this.difficulty === 'easy') {
                status = 'won';
                // Create a winning pattern for the player
                winningCombination = this.createWinningCombination(newBoard, humanPlayer);
            } else {
                status = 'draw';
            }
        }
        
        // Update state
        this.state = {
            board: newBoard,
            currentPlayer: this.state.currentPlayer === 'X' ? 'O' : 'X',
            status: status,
            winningCombination: winningCombination
        };
        
        return true;
    }    resetGame(): void {
        this.state = {
            board: Array(9).fill(null),
            currentPlayer: 'X',
            status: 'playing',
            winningCombination: null
        };
        this.computerMoveCount = 0;
    }    setDifficulty(difficulty: Difficulty): void {
        this.difficulty = difficulty;
        this.computerMoveCount = 0;
    }
    
    getDifficulty(): Difficulty {
        return this.difficulty;
    }
    
    private checkForWin(board: CellValue[]): number[] | null {
        const winPatterns = [
            // Rows
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            // Columns
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            // Diagonals
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return pattern;
            }
        }
        
        return null;
    }
      private isBoardFull(board: CellValue[]): boolean {
        return !board.includes(null);
    }    // AI move logic
    makeComputerMove(): boolean {
        if (this.state.status !== 'playing') {
            return false;
        }        // In easy mode, ensure player wins
        if (this.difficulty === 'easy') {
            // Get the board state
            const board = this.state.board;
            // Human player is always X
            const humanPlayer = 'X';
              // Check if computer has already made its 4 moves
            if (this.computerMoveCount >= 4) {
                // Always skip all subsequent turns in easy mode after 4 moves
                this.state.currentPlayer = humanPlayer;
                return true; // Pretend we made a move
            } else {
                // This is one of the computer's initial moves in easy mode
                // We'll make this move and then count it
                this.computerMoveCount++;
            }}
        
        // Normal move logic if we didn't skip the turn
        const bestMove = this.findBestMove();
        
        if (bestMove !== -1) {
            return this.makeMove(bestMove);
        }
        
        return false;
    }
    
    private findBestMove(): number {
        const board = this.state.board;
        const computerPlayer = this.state.currentPlayer;
        const humanPlayer = computerPlayer === 'X' ? 'O' : 'X';
        
        // Get all available moves
        const availableMoves = board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
        
        // If no moves available
        if (availableMoves.length === 0) {
            return -1;
        }        // Easy mode: Always make moves that ensure the player will win
        if (this.difficulty === 'easy') {
            // In easy mode, always ensure player X wins
            const playerX = 'X';
              // Special handling for the third and fourth moves - make them extra sub-optimal
            if (this.computerMoveCount === 3 || this.computerMoveCount === 4) {
                return this.findMostSubOptimalMove(board, playerX, availableMoves);
            }
            
            // First check: If player is one move away from winning, DON'T EVER block them
            const playerWinningMove = this.findWinningMove(board, playerX);
            if (playerWinningMove !== -1) {
                // If there's only one move left, just take it - the player will win on next turn
                if (availableMoves.length === 1) {
                    return availableMoves[0];
                }
                
                // Player has a winning move available, pick ANY other move to ensure they can win
                const nonWinningMoves = availableMoves.filter(move => move !== playerWinningMove);
                if (nonWinningMoves.length > 0) {
                    return nonWinningMoves[Math.floor(Math.random() * nonWinningMoves.length)];
                }
            }
            
            // Second check: If we have a winning move, never take it in easy mode
            const computerWinningMove = this.findWinningMove(board, computerPlayer);
            if (computerWinningMove !== -1) {
                // Avoid the winning move at all costs
                const nonWinningMoves = availableMoves.filter(move => move !== computerWinningMove);
                if (nonWinningMoves.length > 0) {
                    return nonWinningMoves[Math.floor(Math.random() * nonWinningMoves.length)];
                }
                
                // If we can't avoid the winning move (only one move left), skip the turn
                if (availableMoves.length === 1) {
                    // Just pick any move that's not a winning move for us
                    const computerWinningMove = this.findWinningMove(board, computerPlayer);
                    if (computerWinningMove !== -1) {
                        const nonWinningMoves = availableMoves.filter(move => move !== computerWinningMove);
                        if (nonWinningMoves.length > 0) {
                            return nonWinningMoves[Math.floor(Math.random() * nonWinningMoves.length)];
                        }
                    }
                }
            }
            
            // Special case: If we're approaching a potential draw, force a loss
            // Modified to be more aggressive - trigger this check with more moves remaining
            if (availableMoves.length <= 6) {
                // Find a move that gives the player a winning path after we move
                const forcedLossMoves = this.findForcedLossMoves(board, playerX);
                if (forcedLossMoves.length > 0) {
                    return forcedLossMoves[Math.floor(Math.random() * forcedLossMoves.length)];
                }
                
                // If no forced loss moves, skip some turns to give the player an advantage
                if (Math.random() < 0.7) {
                    // Just pick any move that's not a winning move for us
                    const computerWinningMove = this.findWinningMove(board, computerPlayer);
                    if (computerWinningMove !== -1) {
                        const nonWinningMoves = availableMoves.filter(move => move !== computerWinningMove);
                        if (nonWinningMoves.length > 0) {
                            return nonWinningMoves[Math.floor(Math.random() * nonWinningMoves.length)];
                        }
                    }
                }
            }
            
            // Third check: If we can create a situation where the player can win next turn, do that
            const movesThatSetupPlayerWin = this.findMovesThatSetupPlayerWin(board, playerX);
            if (movesThatSetupPlayerWin.length > 0) {
                return movesThatSetupPlayerWin[Math.floor(Math.random() * movesThatSetupPlayerWin.length)];
            }
            
            // Fourth check: Avoid the center and corners - these are strategically better positions
            if (availableMoves.length > 1) {
                const nonStrategicMoves = availableMoves.filter(move => move !== 4 && ![0, 2, 6, 8].includes(move));
                if (nonStrategicMoves.length > 0) {
                    return nonStrategicMoves[Math.floor(Math.random() * nonStrategicMoves.length)];
                }
            }
            
            // If all else fails, choose a corner or edge that's most likely to let the player win
            return this.findLeastCompetitiveMove(board, playerX, availableMoves);
        }
        
        // Hard mode: Try to win first
        const winMove = this.findWinningMove(board, computerPlayer);
        if (winMove !== -1) return winMove;
        
        // Hard mode: Block opponent from winning
        const blockMove = this.findWinningMove(board, humanPlayer);
        if (blockMove !== -1) return blockMove;
        
        // Hard mode: Strategic moves
        // Try to take the center
        if (board[4] === null) return 4;
        
        // Try to take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => board[i] === null);
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available edge
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(i => board[i] === null);
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }
        
        // No move found
        return -1;
    }    private findWinningMove(board: CellValue[], player: Player): number {
        const winPatterns = [
            // Rows
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            // Columns
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            // Diagonals
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            // Check if player has two in a row and the third spot is empty
            if (board[a] === player && board[b] === player && board[c] === null) {
                return c;
            }
            if (board[a] === player && board[c] === player && board[b] === null) {
                return b;
            }
            if (board[b] === player && board[c] === player && board[a] === null) {
                return a;
            }
        }
        
        return -1;
    }
      /**
     * Find moves that would potentially let the player win in their next turn
     * For easy mode, this helps the computer make deliberately bad moves
     */
    private findPotentialPlayerWinningMoves(board: CellValue[], player: Player): number[] {
        const potentialWinningMoves: number[] = [];
        const winPatterns = [
            // Rows
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            // Columns
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            // Diagonals
            [0, 4, 8], [2, 4, 6]
        ];
        
        // First, get all available moves
        const availableMoves = board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
        
        for (const move of availableMoves) {
            // Find moves where if the computer plays here, the player could win in the next move
            
            // Make a copy of the board with the computer's move
            const boardCopy = [...board];
            const computerPlayer = player === 'X' ? 'O' : 'X';
            boardCopy[move] = computerPlayer;
            
            // Check if this move would create a situation where the player can win in one move
            let playerHasWinningMove = false;
            
            // Check each pattern for a potential winning move for the player
            for (const pattern of winPatterns) {
                const [a, b, c] = pattern;
                
                // Look for situations where the player has one marker already and could place another one
                const cells = [boardCopy[a], boardCopy[b], boardCopy[c]];
                const playerCellCount = cells.filter(cell => cell === player).length;
                const emptyCellCount = cells.filter(cell => cell === null).length;
                
                // If the player has one of their markers and there are two empty spots,
                // this could create a future winning opportunity for them
                if (playerCellCount === 1 && emptyCellCount === 1) {
                    playerHasWinningMove = true;
                    break;
                }
            }
              if (playerHasWinningMove) {
                potentialWinningMoves.push(move);
            }
        }
        
        return potentialWinningMoves;
    }    /**
     * Find moves that would directly set up the player to win in the next turn
     * For easy mode, to guarantee player victory
     */
    private findMovesThatSetupPlayerWin(board: CellValue[], player: Player): number[] {
        const movesThatSetupWin: number[] = [];
        const winPatterns = [
            // Rows
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            // Columns
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            // Diagonals
            [0, 4, 8], [2, 4, 6]
        ];
        
        // First, get all available moves
        const availableMoves = board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
        
        for (const move of availableMoves) {
            // Make a copy of the board with the computer's move
            const boardCopy = [...board];
            const computerPlayer = player === 'X' ? 'O' : 'X';
            boardCopy[move] = computerPlayer;
            
            // After making this move, is there a way for the player to win in one move?
            let createsWinOpportunity = false;
            
            // Find empty cells after the computer's hypothetical move
            const remainingMoves = boardCopy.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
            
            // For each of those empty cells, check if the player would win by placing their mark there
            for (const playerMove of remainingMoves) {
                // Make a copy of the board with the player's hypothetical move
                const testBoard = [...boardCopy];
                testBoard[playerMove] = player;
                
                // Check if this move would result in the player winning
                for (const pattern of winPatterns) {
                    const [a, b, c] = pattern;
                    if (testBoard[a] === player && testBoard[b] === player && testBoard[c] === player) {
                        createsWinOpportunity = true;
                        break;
                    }
                }
                
                if (createsWinOpportunity) {
                    break;
                }
            }
            
            if (createsWinOpportunity) {
                movesThatSetupWin.push(move);            }
        }
        
        return movesThatSetupWin;
    }

    /**
     * Find moves that will force the computer to lose
     * Used in easy mode to ensure the player always wins
     */    private findForcedLossMoves(board: CellValue[], player: Player): number[] {
        const forcedLossMoves: number[] = [];
        const winPatterns = [
            // Rows
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            // Columns
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            // Diagonals
            [0, 4, 8], [2, 4, 6]
        ];
        
        // Get all available moves
        const availableMoves = board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
        
        // If we're in the late game (5 or fewer moves left), 
        // ANY move can be considered a forced loss move to ensure player wins
        if (availableMoves.length <= 5) {
            return [...availableMoves]; // Return all available moves as potential losing moves
        }
        
        for (const move of availableMoves) {
            // Create a copy of the board with the computer's move
            const boardCopy = [...board];
            const computerPlayer = player === 'X' ? 'O' : 'X';
            boardCopy[move] = computerPlayer;
            
            // Now look at each remaining move for the player
            const remainingMoves = boardCopy.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
            
            // For each potential player move, check if there's a guaranteed win path
            let forceableLoss = false;
            
            for (const playerMove of remainingMoves) {
                // Create a new board state with the player's hypothetical move
                const testBoard = [...boardCopy];
                testBoard[playerMove] = player;
                
                // Check if this move creates a winning path or fork for the player
                let winningPaths = 0;
                
                // Check if the move immediately creates a win for the player
                for (const pattern of winPatterns) {
                    const [a, b, c] = pattern;
                    if (testBoard[a] === player && testBoard[b] === player && testBoard[c] === player) {
                        forceableLoss = true;
                        break;
                    }
                    
                    // Count how many potential winning paths this creates
                    const cells = [testBoard[a], testBoard[b], testBoard[c]];
                    const playerCellCount = cells.filter(cell => cell === player).length;
                    const emptyCellCount = cells.filter(cell => cell === null).length;
                    
                    // If player has 2 marks and there's 1 empty spot, this is a winning path
                    if (playerCellCount === 2 && emptyCellCount === 1) {
                        winningPaths++;
                    }
                }
                
                // If this creates a win, we're done checking
                if (forceableLoss) {
                    break;
                }
                
                // If there are any winning paths or multiple paths, this could lead to player win
                // Lowered the threshold to be more aggressive in helping player win
                if (winningPaths >= 1) {
                    forceableLoss = true;
                    break;
                }
            }
            
            if (forceableLoss) {
                forcedLossMoves.push(move);
            }
        }
        
        return forcedLossMoves;
    }

    /**
     * Find the least competitive move - a move that's most likely to lead to player victory
     * Used when all other approaches don't yield a good losing move
     */
    private findLeastCompetitiveMove(board: CellValue[], player: Player, availableMoves: number[]): number {
        // Prioritize moves that give the player more opportunities
        // 1. Edges if the player has a corner
        // 2. A corner if the player is in the center
        // 3. Any available move as a last resort
        
        const computerPlayer = player === 'X' ? 'O' : 'X';
        
        // Check if player has any corners
        const corners = [0, 2, 6, 8];
        const playerCorners = corners.filter(i => board[i] === player);
        
        // If player has corners, prioritize adjacent edges
        if (playerCorners.length > 0) {
            const adjacentEdges = new Set<number>();
            if (board[0] === player) { adjacentEdges.add(1); adjacentEdges.add(3); }
            if (board[2] === player) { adjacentEdges.add(1); adjacentEdges.add(5); }
            if (board[6] === player) { adjacentEdges.add(3); adjacentEdges.add(7); }
            if (board[8] === player) { adjacentEdges.add(5); adjacentEdges.add(7); }
            
            const availableEdges = Array.from(adjacentEdges).filter(edge => availableMoves.includes(edge));
            if (availableEdges.length > 0) {
                return availableEdges[Math.floor(Math.random() * availableEdges.length)];
            }
        }
        
        // If player has the center, choose a corner
        if (board[4] === player) {
            const availableCorners = corners.filter(corner => availableMoves.includes(corner));
            if (availableCorners.length > 0) {
                return availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
        }
        
        // Last resort: any random move
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }    /**
     * Create a winning combination for the player in easy mode.
     * Used to prevent draws and ensure player wins.
     */
    private createWinningCombination(board: CellValue[], player: Player): number[] {
        const winPatterns = [
            // Rows
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            // Columns
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            // Diagonals
            [0, 4, 8], [2, 4, 6]
        ];
        
        // First, try to find a pattern where the player already has 2 marks
        // This makes the win look more natural
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            const cells = [board[a], board[b], board[c]];
            const playerCount = cells.filter(cell => cell === player).length;
            
            if (playerCount >= 2) {
                return pattern;
            }
        }
        
        // Next, prioritize patterns where the player already has at least one mark
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] === player || board[b] === player || board[c] === player) {
                return pattern;
            }
        }
        
        // If we need to create a completely artificial win, prefer patterns
        // with the most player-adjacent cells
        let bestPattern = winPatterns[0];
        let bestAdjacentCount = -1;
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            let adjacentCount = 0;
            
            // Check for player marks adjacent to this pattern
            const adjacentCells = this.getAdjacentCells(pattern);
            for (const cellIndex of adjacentCells) {
                if (board[cellIndex] === player) {
                    adjacentCount++;
                }
            }
            
            if (adjacentCount > bestAdjacentCount) {
                bestAdjacentCount = adjacentCount;
                bestPattern = pattern;
            }
        }
        
        return bestPattern;
    }
    
    /**
     * Get cells adjacent to the given pattern
     */
    private getAdjacentCells(pattern: number[]): number[] {
        const adjacentCells: number[] = [];
        const allCells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        
        // Return all cells that are not in the pattern
        return allCells.filter(cell => !pattern.includes(cell));
    }    /**
     * Find the most sub-optimal move for the third and fourth computer moves in easy mode
     * This deliberately chooses the worst possible move to help the player win
     */
    private findMostSubOptimalMove(board: CellValue[], player: Player, availableMoves: number[]): number {
        // Strategy for the worst possible move:
        // 1. Choose a move that directly sets up the player for multiple winning paths
        // 2. If that's not available, choose a move that blocks the computer's own strategic positions
        // 3. Avoid any move that would help the computer
        
        // First, try to find moves that create multiple winning opportunities for the player
        const movesThatCreateMultipleWins = this.findMovesThatCreateMultipleWinningPaths(board, player, availableMoves);
        if (movesThatCreateMultipleWins.length > 0) {
            return movesThatCreateMultipleWins[Math.floor(Math.random() * movesThatCreateMultipleWins.length)];
        }
        
        // Second, try moves that directly set up player wins
        const movesThatSetupPlayerWin = this.findMovesThatSetupPlayerWin(board, player);
        const validSetupMoves = movesThatSetupPlayerWin.filter(move => availableMoves.includes(move));
        if (validSetupMoves.length > 0) {
            return validSetupMoves[Math.floor(Math.random() * validSetupMoves.length)];
        }
        
        // Third, avoid strategic positions (center, corners) and choose edges
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(edge => availableMoves.includes(edge));
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }
        
        // Last resort: any available move
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    /**
     * Find moves that create multiple winning paths for the player
     */
    private findMovesThatCreateMultipleWinningPaths(board: CellValue[], player: Player, availableMoves: number[]): number[] {
        const movesWithMultiplePaths: number[] = [];
        const computerPlayer = player === 'X' ? 'O' : 'X';
        
        for (const move of availableMoves) {
            // Make the computer move
            const boardCopy = [...board];
            boardCopy[move] = computerPlayer;
            
            // Count how many winning opportunities this creates for the player
            let winningPathCount = 0;
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                [0, 4, 8], [2, 4, 6] // diagonals
            ];
            
            // Check each pattern to see if it gives the player winning opportunities
            for (const pattern of winPatterns) {
                const [a, b, c] = pattern;
                const cells = [boardCopy[a], boardCopy[b], boardCopy[c]];
                const playerCount = cells.filter(cell => cell === player).length;
                const emptyCount = cells.filter(cell => cell === null).length;
                
                // If player has 1 mark and 2 empty spaces, they could potentially win here
                if (playerCount >= 1 && emptyCount >= 1) {
                    winningPathCount++;
                }
            }
            
            // If this move creates multiple potential winning paths for the player, it's sub-optimal
            if (winningPathCount >= 2) {
                movesWithMultiplePaths.push(move);
            }
        }
        
        return movesWithMultiplePaths;
    }
}

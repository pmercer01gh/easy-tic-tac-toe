import { TicTacToeGame, GameState } from './game';
import './styles.css';

export class GameUI {
    private readonly game: TicTacToeGame;
    private readonly board: HTMLElement;
    private readonly status: HTMLElement;
    private readonly restartButton: HTMLElement;
    private readonly difficultySelect: HTMLSelectElement;
    private isPlayerTurn: boolean = true;      constructor() {
        this.game = new TicTacToeGame('hard'); // Initial instance, board will be disabled until difficulty selected
        
        // Get DOM elements
        this.board = document.getElementById('board') as HTMLElement;
        this.status = document.getElementById('status') as HTMLElement;
        this.restartButton = document.getElementById('restart-button') as HTMLElement;
        
        // Get or create difficulty controls
        this.difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
        
        // If difficulty select doesn't exist, create it
        if (!this.difficultySelect) {
            console.log('Difficulty dropdown not found, creating dynamically');
            this.createDifficultyControls();
            this.difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
        } else {
            console.log('Found existing difficulty dropdown');
        }
        
        console.log('Difficulty Select Element:', this.difficultySelect);
        
        // Initialize the game
        this.initializeBoard();
        this.bindEvents();
        this.renderBoard();
    }
      private createDifficultyControls(): void {
        // Check if controls already exist
        if (document.getElementById('difficulty')) {
            console.log('Difficulty controls already exist');
            return;
        }
        
        // Get container
        const container = document.querySelector('.container') as HTMLElement;
        const h1Element = document.querySelector('h1') as HTMLElement;
        
        // Create controls div
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'controls';
        
        // Create skill level div
        const skillLevelDiv = document.createElement('div');
        skillLevelDiv.className = 'skill-level';
        
        // Create label
        const label = document.createElement('label');
        label.setAttribute('for', 'difficulty');
        label.textContent = 'Computer Skill:';
        
        // Create select
        const select = document.createElement('select');
        select.id = 'difficulty';        // Create options
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Please select';
        defaultOption.selected = true;
        
        const easyOption = document.createElement('option');
        easyOption.value = 'easy';
        easyOption.textContent = 'Easy';
        
        const hardOption = document.createElement('option');
        hardOption.value = 'hard';
        hardOption.textContent = 'Hard';
        
        // Append options to select
        select.appendChild(defaultOption);
        select.appendChild(easyOption);
        select.appendChild(hardOption);
        
        // Append all elements
        skillLevelDiv.appendChild(label);
        skillLevelDiv.appendChild(select);
        controlsDiv.appendChild(skillLevelDiv);
        
        // Insert after h1
        container.insertBefore(controlsDiv, h1Element.nextSibling);
    }
    
    private initializeBoard(): void {
        // Clear existing board
        this.board.innerHTML = '';
        
        // Create cells
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i.toString();
            this.board.appendChild(cell);
        }

        // Disable board if no difficulty is selected
        if (!this.difficultySelect.value) {
            this.board.classList.add('disabled');
            this.status.textContent = 'Please select a difficulty level to start';
        } else {
            this.board.classList.remove('disabled');
        }
    }
      private bindEvents(): void {
        // Cell click event
        this.board.addEventListener('click', (event) => {
            if (!this.isPlayerTurn || !this.difficultySelect.value) return;
            
            const target = event.target as HTMLElement;
            if (target.classList.contains('cell')) {
                const index = parseInt(target.dataset.index ?? '0', 10);
                this.handlePlayerMove(index);
            }
        });
        
        // Restart button event
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        // Difficulty select event
        this.difficultySelect.addEventListener('change', () => {
            const value = this.difficultySelect.value;
            if (!value) {
                this.board.classList.add('disabled');
                this.status.textContent = 'Please select a difficulty level to start';
                return;
            }
            
            const difficulty = value as 'easy' | 'hard';
            console.log('Difficulty changed to:', difficulty);
            this.game.setDifficulty(difficulty);
            this.board.classList.remove('disabled');
            this.restartGame(); // Restart the game when difficulty changes            // Show appropriate notification based on difficulty
            if (difficulty === 'easy') {
                this.showEasyModeMessage();
            } else if (difficulty === 'hard') {
                this.status.textContent = 'Prepare for your doom!';
                this.status.classList.add('hard-mode-message');
                // Remove the class and update message after the animation completes
                setTimeout(() => {
                    this.status.classList.remove('hard-mode-message');
                    this.status.textContent = 'Player\'s turn';
                }, 3000);
            }
        });
    }
    
    private renderBoard(): void {
        const state = this.game.getState();
        const cells = this.board.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const value = state.board[index];
            cell.textContent = value ?? '';
            cell.classList.remove('x', 'o', 'disabled', 'winner-highlight');
            
            if (value) {
                cell.classList.add(value.toLowerCase(), 'disabled');
            }
            
            // Highlight winning combination
            if (state.winningCombination?.includes(index)) {
                cell.classList.add('winner-highlight');
            }
        });
        
        this.updateStatusMessage(state);
    }    private updateStatusMessage(state: GameState): void {
        if (state.status === 'won') {
            const winner = state.currentPlayer === 'X' ? 'O' : 'X';
            this.status.textContent = winner === 'X' ? 'Player wins!' : 'Computer wins!';
              if (winner === 'X') {
                // Show confetti for human player win
                this.showWinningAnimation();
            } else {
                // Show skull for computer win
                this.showSkullAnimation();
            }        } else if (state.status === 'draw') {
            this.status.textContent = 'Game ended in a draw!';
        } else {
            // Only show turn message if a difficulty has been selected
            if (!this.difficultySelect.value) {
                this.status.textContent = 'Please select a difficulty level to start';
            } else {
                this.status.textContent = state.currentPlayer === 'X' ? 'Player\'s turn' : 'Computer\'s turn';
            }
        }
    }
      private handlePlayerMove(cellIndex: number): void {
        if (!this.isPlayerTurn) return;
        
        const moveSuccess = this.game.makeMove(cellIndex);
        
        if (moveSuccess) {
            this.renderBoard();
            
            const state = this.game.getState();
            if (state.status === 'playing') {
                // If the game is still playing, make the computer move
                this.isPlayerTurn = false;
                
                // Show different message based on whether we expect a skip
                const isDifficultyEasy = this.difficultySelect.value === 'easy';
                const computerMovesCount = state.board.filter(cell => cell === 'O').length;
                
                if (isDifficultyEasy && computerMovesCount >= 2) {
                    this.status.textContent = 'Computer is genuinely stumped!';
                } else {
                    this.status.textContent = 'Computer is thinking...';
                }
                
                // Simulate computer "thinking" with a small delay
                setTimeout(() => {
                    this.makeComputerMove();
                }, 1000);
            }
        }
    }    private makeComputerMove(): void {
        // Get the current player before the computer move
        const beforeMove = this.game.getState().currentPlayer;
        
        // Make the computer's move
        this.game.makeComputerMove();
        
        // Get the player after the computer move
        const afterMove = this.game.getState().currentPlayer;
        
        // Check if the computer skipped its turn (easy mode)
        if (beforeMove === afterMove) {
            // If the game is in easy mode and has made 2 moves already, show the stumped message
            const isDifficultyEasy = this.difficultySelect.value === 'easy';
            const computerMovesCount = this.game.getState().board.filter(cell => cell === 'O').length;
            
            if (isDifficultyEasy && computerMovesCount >= 2) {
                this.status.textContent = 'Computer is genuinely stumped! Your turn again!';
            } else {
                this.status.textContent = 'Computer skipped its turn. Your turn again!';
            }
        }
        
        this.renderBoard();
        this.isPlayerTurn = true;
    }
    
    /**
     * Shows a disparaging message when easy mode is selected
     */
    private showEasyModeMessage(): void {
        const messages = [
            "Really? Easy mode? I thought you were better than that...",
            "Easy mode selected. Why not just play tic-tac-toe against a toddler?",
            "Easy mode? Don't worry, I'll let you win every time.",
            "Easy mode activated. Feel proud of yourself?",
            "I see you've chosen the 'training wheels' difficulty.",
            "Easy mode selected. Your victories will be as hollow as my respect for this choice."
        ];
        
        // Pick a random disparaging message
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // Show the disparaging message
        this.status.textContent = randomMessage;
        
        // Add visual indicator for easy mode
        this.status.classList.add('easy-mode-message');
        
        // After a delay, return to normal status and remove the visual indicator
        setTimeout(() => {
            const state = this.game.getState();
            this.updateStatusMessage(state);
            this.status.classList.remove('easy-mode-message');
        }, 3000);
    }    private restartGame(): void {
        // Get the current selected difficulty
        const currentDifficulty = this.difficultySelect.value as 'easy' | 'hard';
        
        this.game.resetGame();
        this.game.setDifficulty(currentDifficulty);
        this.isPlayerTurn = true;
        this.renderBoard();
    }
    
    private createConfettiContainer(): void {
        // Remove any existing confetti container
        const existingContainer = document.querySelector('.confetti-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Create container for confetti
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        
        // Create 50 pieces of confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Randomize initial position and animation
            const left = Math.random() * 100;
            const animationDuration = 2 + Math.random() * 2;
            const animationDelay = Math.random() * 3;
            
            confetti.style.left = `${left}%`;
            confetti.style.animation = `confettiFall ${animationDuration}s ${animationDelay}s ease-out forwards`;
            
            confettiContainer.appendChild(confetti);
        }
        
        document.body.appendChild(confettiContainer);
    }
    
    private showWinningAnimation(): void {
        this.createConfettiContainer();
        document.body.classList.add('show-confetti');
        
        // Remove confetti after animation ends
        setTimeout(() => {
            document.body.classList.remove('show-confetti');
            const container = document.querySelector('.confetti-container');
            if (container) {
                container.remove();
            }
        }, 3000);
    }
      private showSkullAnimation(): void {
        // Remove any existing skull
        const existingSkull = document.querySelector('.skull-container');
        if (existingSkull) {
            existingSkull.remove();
        }

        // Create container for skull
        const skullContainer = document.createElement('div');
        skullContainer.className = 'skull-container';
        
        // Create the skull face
        const skullFace = document.createElement('div');
        skullFace.className = 'skull-face';
        
        // Add eyes
        const leftEye = document.createElement('div');
        leftEye.className = 'skull-eyes left';
        const rightEye = document.createElement('div');
        rightEye.className = 'skull-eyes right';
        
        // Add nose
        const nose = document.createElement('div');
        nose.className = 'skull-nose';
        
        // Add teeth container
        const teethContainer = document.createElement('div');
        teethContainer.className = 'skull-teeth';
        
        // Add individual teeth
        for (let i = 0; i < 6; i++) {
            const tooth = document.createElement('div');
            tooth.className = 'tooth';
            teethContainer.appendChild(tooth);
        }
          // Assemble the skull
        skullFace.append(leftEye, rightEye, nose, teethContainer);
        skullContainer.append(skullFace);
        
        // Add to document
        document.body.append(skullContainer);

        skullFace.appendChild(teethContainer);
        skullContainer.appendChild(skullFace);
        
        // Add to document
        document.body.appendChild(skullContainer);

        skullFace.appendChild(teethContainer);
        skullContainer.appendChild(skullFace);
        
        // Add to document
        document.body.appendChild(skullContainer);

        // Add show-devil class to trigger animation        // Add creepy background sound
        const creepySound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAUAAAh9AAXFxcXIyMjIyMvLy8vLzs7Ozs7R0dHR0dTU1NTU19fX19fa2tra2t3d3d3d4ODg4ODj4+Pj4+bm5ubm6enp6enr6+vr6+7u7u7u8fHx8fH09PT09Pf39/f3+vr6+vr9/f39/f///////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAASH0Z+eWAAAAAAD/+9DEAAAKoQVtVBAAJ2xBaKqMYARwMBgMBgMBh+D4Pg+D4f///B8HwfB8Hw///ygCAIAgCAIAABQFAUBQFAUAABQFAUBQFAUBQAAUBQFAUBQFAAAAUBQFAUBQFD///KAoD4Pg+H4Ph///+D4Pg+D4Pg//8oD4Pg+D4Pg//KAoD4Pg+D4Ph//+D4RhGEYRhH///GEYREQAABAD/++DE4Yn7AICxAAAAL2HwFjGAABDETOZ0WkGXCaD6BRemkxm+h2Q7Mhl0Gc2mkzKZdegz9f1JpNJpN/69Bn///pNJv////6DtBmYO0GaDO0GaDtBmTB2gzQZjOzQZoMzQZmgz///1////+pzapzapzapzaqc2qc2qnNqpzapzaqc2qc2pzapzaqc2qnNqpzapzapzaqc2qc2qnNqpzapzaqc2qc2qc2qc2qnNqnNqpzapzapzaqc2qc2qnNqpzapzaqc2qc2pzaqc2qnNqpzaqc2qc2qnNqnNqpzapzapzaqc2qfapzaqc2qnNqpzapzaqc2qbDw8PDw8PDw8PDw+JiYmJiYmJiYmLExMTExMTExMTFxcXFxcXFxcXF8fHx8fHx8fHyQkJCQkJCQkJCgoKCgoKCgoKC0tLS0tLS0tLTIyMjIyMjIyMjc3Nzc3Nzc3Nzw8PDw8PDw8PEFBQUFBQUFBQUZGRkZGRkZGRktLS0tLS0tLS1BQUFBQUFBQUFVVVVVVVVVVVVpaWlpaWlpaWl9fX19fX19fX2RkZGRkZGRkZGlpaWlpaWlpaW5ubm5ubm5ubnNzc3Nzc3Nzc3h4eHh4eHh4eH19fX19fX19fYKCgoKCgoKCgoqKioqKioqKio+Pj4+Pj4+Pj5SUlJSUlJSUlJmZmZmZmZmZmZ6enp6enp6enqOjo6Ojo6Ojo6ioqKioqKioqK2tra2tra2trbKysrKysrKysre3t7e3t7e3t7y8vLy8vLy8vMHBwcHBwcHBwcbGxsbGxsbGxsvLy8vLy8vLy9DQ0NDQ0NDQ0NXV1dXV1dXV1dra2tra2tra2t/f39/f39/f3+Tk5OTk5OTk5Onp6enp6enp6e7u7u7u7u7u7vPz8/Pz8/Pz8/j4+Pj4+Pj4+P39/f39/f39/QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==');
        creepySound.volume = 0.2;  // Keep the volume moderate
        creepySound.play().catch(() => {
            // Ignore audio play errors (some browsers block autoplay)
            console.log('Audio autoplay was blocked');
        });
        
        // Add animation class
        document.body.classList.add('show-skull');
        
        // Remove skull after animation ends
        setTimeout(() => {
            document.body.classList.remove('show-skull');
            skullContainer.remove();
        }, 3000);
    }
}

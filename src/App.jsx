import React, { useState } from "react";
import Grid from "./components/Grid";

const SIZE = 9;
const CLUES = 32; // default clues for medium difficulty

// Helper to check if placing num at (row, col) is valid
function isValid(board, row, col, num) {
  for (let i = 0; i < SIZE; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + (i % 3);
    if (board[boxRow][boxCol] === num) return false;
  }
  return true;
}

// Backtracking Sudoku generator/solver
function fillBoard(board) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === 0) {
        let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = nums.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        for (let num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Remove cells to create puzzle
function makePuzzle(fullBoard, clues) {
  const puzzle = fullBoard.map((row) => [...row]);
  let cellsToRemove = SIZE * SIZE - clues;
  while (cellsToRemove > 0) {
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      cellsToRemove--;
    }
  }
  return puzzle;
}

// Generate a new puzzle and its solution
function generateSudoku() {
  // Generate a full board
  let board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  fillBoard(board);
  // Copy for solution
  const solution = board.map((row) => [...row]);
  // Remove cells for puzzle
  const puzzle = makePuzzle(board, CLUES);
  return { puzzle, solution };
}

function App() {
  const [{ puzzle, solution }, setSudoku] = useState(() => generateSudoku());
  const [board, setBoard] = useState(puzzle);

  // Generate new puzzle
  const handleNewGame = () => {
    const { puzzle, solution } = generateSudoku();
    setSudoku({ puzzle, solution });
    setBoard(puzzle);
  };

  // Handle cell input
  const handleChange = (row, col, value) => {
    if (puzzle[row][col] !== 0) return; // Don't edit clues
    const val = parseInt(value, 10);
    if (value === "" || (val >= 1 && val <= 9)) {
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = value === "" ? 0 : val;
      setBoard(newBoard);
    }
  };

  // Check if solved
  const isSolved = () => {
    for (let i = 0; i < SIZE; i++)
      for (let j = 0; j < SIZE; j++)
        if (board[i][j] !== solution[i][j]) return false;
    return true;
  };

  return (
    <div className="mx-auto max-w-4xl p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Sudoku Solver</h1>
      <div className="my-4 flex justify-center gap-4 text-lg">
        <button
          className="cursor-pointer bg-blue-600 hover:bg-blue-500 px-4 py-1 rounded-4xl text-white"
          onClick={handleNewGame}
        >
          Remake Grid
        </button>

        <button
          className="cursor-pointer bg-green-400 hover:bg-green-500 px-4 py-1 rounded-4xl text-black"
          onClick={() => {}}
        >
          Solve Puzzle <span className="text-white">🪄⋆｡ °✩</span>
        </button>
      </div>
      <div className="SudokuGrid flex justify-center text-black">
        <Grid board={board} puzzle={puzzle} onChange={handleChange} />
      </div>
      {isSolved() && (
        <div className="text-green-600 font-bold mb-2">
          Congratulations! 🎉 Sudoku Solved!
        </div>
      )}
    </div>
  );
}

export default App;

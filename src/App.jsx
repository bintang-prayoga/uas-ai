import { useState } from "react";
import "./index.css";

// Emoji legend
const EMOJI = {
  empty: "⬜",
  dirty: "🟫",
  obstacle: "🪑",
  cleaned: "🟩",
  robot: "🤖",
};

const GRID_SIZE = 6;

// Generate initial grid with specified obstacles and dirty tiles
function generateGrid(size, obstacleCount, dirtyCount) {
  // Create all positions except (0,0)
  const positions = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!(x === 0 && y === 0)) positions.push({ x, y });
    }
  }
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  // Place obstacles
  const obstacles = positions.slice(0, obstacleCount);
  // Place dirty tiles (excluding obstacles)
  const dirtyTiles = positions.slice(obstacleCount).slice(0, dirtyCount);

  // Build grid
  const grid = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      if (obstacles.some((p) => p.x === x && p.y === y)) {
        row.push("obstacle");
      } else if (
        dirtyTiles.some((p) => p.x === x && p.y === y) ||
        (x === 0 && y === 0 && dirtyCount > 0)
      ) {
        row.push("dirty");
      } else {
        row.push("empty");
      }
    }
    grid.push(row);
  }
  return grid;
}

function App() {
  const [obstacleCount, setObstacleCount] = useState(6);
  const [dirtyCount, setDirtyCount] = useState(10);
  const [grid, setGrid] = useState(() => generateGrid(GRID_SIZE, 6, 10));
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });

  // Reset grid with new parameters
  function resetGrid() {
    setGrid(generateGrid(GRID_SIZE, obstacleCount, dirtyCount));
    setRobotPos({ x: 0, y: 0 });
  }

  // Render grid with emojis
  function renderGrid() {
    return (
      <div
        className={`inline-block bg-gray-200 p-3 rounded-lg shadow-lg`}
        style={{ width: "fit-content" }}
      >
        {grid.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => {
              let emoji = EMOJI.empty;
              if (cell === "obstacle") emoji = EMOJI.obstacle;
              else if (cell === "dirty") emoji = EMOJI.dirty;
              else if (cell === "cleaned") emoji = EMOJI.cleaned;
              if (robotPos.x === x && robotPos.y === y) emoji = EMOJI.robot;
              return (
                <span
                  key={`${x},${y}`}
                  className="w-12 h-12 flex items-center justify-center text-3xl bg-white rounded border border-gray-300"
                >
                  {emoji}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">
        Smart Vacuum Cleaner Simulator
      </h2>
      <div className="flex gap-4 mb-4">
        <label>
          Obstacles:{" "}
          <input
            type="number"
            min={0}
            max={GRID_SIZE * GRID_SIZE - 2}
            value={obstacleCount}
            onChange={(e) => setObstacleCount(Number(e.target.value))}
            className="w-16 px-2 py-1 border rounded"
          />
        </label>
        <label>
          Dirty Tiles:{" "}
          <input
            type="number"
            min={1}
            max={GRID_SIZE * GRID_SIZE - 1 - obstacleCount}
            value={dirtyCount}
            onChange={(e) => setDirtyCount(Number(e.target.value))}
            className="w-16 px-2 py-1 border rounded"
          />
        </label>
        <button
          onClick={resetGrid}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded shadow transition"
        >
          Reset Grid
        </button>
      </div>
      {renderGrid()}
      <div className="mt-6 flex flex-wrap gap-4 text-lg">
        <button className="bg-green-500 px-4 py-2 text-white font-semibold rounded shadow transition cursor-pointer" onClick={() => {}}>
          Solve
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-4 text-lg">
        <span>
          {EMOJI.robot} <span className="text-gray-600">= Robot</span>
        </span>
        <span>
          {EMOJI.obstacle} <span className="text-gray-600">= Furniture</span>
        </span>
        <span>
          {EMOJI.cleaned} <span className="text-gray-600">= Cleaned</span>
        </span>
        <span>
          {EMOJI.dirty} <span className="text-gray-600">= Dirty</span>
        </span>
        <span>
          {EMOJI.empty} <span className="text-gray-600">= Floor</span>
        </span>
      </div>
    </div>
  );
}

export default App;

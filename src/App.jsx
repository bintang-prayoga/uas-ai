import { useState, useEffect, useCallback } from "react";
import "./index.css";

// Emoji legend
const EMOJI = {
  empty: "⬜",
  dirty: "💩",
  obstacle: "🪑",
  cleaned: "🟩",
  robot: "🤖",
};

const gridSize = 6;

// Initial Grid
function generateGrid(size, obstacleCount, dirtyCountInput) {
  const positions = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!(x === 0 && y === 0)) positions.push({ x, y });
    }
  }
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  const obstacles = positions.slice(0, obstacleCount);
  const dirtyTilesFromInput = positions
    .slice(obstacleCount)
    .slice(0, dirtyCountInput);

  const grid = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      if (obstacles.some((p) => p.x === x && p.y === y)) {
        row.push("obstacle");
      } else if (
        dirtyTilesFromInput.some((p) => p.x === x && p.y === y) ||
        (x === 0 && y === 0 && dirtyCountInput > 0)
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

function bfs(grid, start, end) {
  const queue = [{ ...start, path: [start] }];
  const visited = new Set();
  visited.add(`${start.x},${start.y}`);
  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  while (queue.length > 0) {
    const { x, y, path } = queue.shift();
    if (x === end.x && y === end.y) return path;

    for (const dir of directions) {
      const nextX = x + dir.x;
      const nextY = y + dir.y;
      if (
        nextX >= 0 &&
        nextX < gridSize &&
        nextY >= 0 &&
        nextY < gridSize &&
        grid[nextY][nextX] !== "obstacle" &&
        !visited.has(`${nextX},${nextY}`)
      ) {
        visited.add(`${nextX},${nextY}`);
        queue.push({
          x: nextX,
          y: nextY,
          path: [...path, { x: nextX, y: nextY }],
        });
      }
    }
  }
  return null;
}

function findOptimalPath(initialGrid, initialRobotPos) {
  let currentGridSim = JSON.parse(JSON.stringify(initialGrid)); // Use a copy for simulation
  let robotPosSim = { ...initialRobotPos };
  const fullPathCoords = [{ ...robotPosSim }];

  let dirtyTilesLocations = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (currentGridSim[y][x] === "dirty") {
        dirtyTilesLocations.push({ x, y });
      }
    }
  }

  if (currentGridSim[robotPosSim.y][robotPosSim.x] === "dirty") {
    currentGridSim[robotPosSim.y][robotPosSim.x] = "cleaned";
    dirtyTilesLocations = dirtyTilesLocations.filter(
      (t) => !(t.x === robotPosSim.x && t.y === robotPosSim.y)
    );
  }

  while (dirtyTilesLocations.length > 0) {
    let closestDirtyTileInfo = null;
    for (const targetTile of dirtyTilesLocations) {
      const pathSegment = bfs(currentGridSim, robotPosSim, targetTile);
      if (pathSegment) {
        if (
          !closestDirtyTileInfo ||
          pathSegment.length < closestDirtyTileInfo.path.length
        ) {
          closestDirtyTileInfo = { tile: targetTile, path: pathSegment };
        }
      }
    }

    if (!closestDirtyTileInfo) {
      console.warn("Cannot reach remaining dirty tiles.");
      break;
    }

    for (let i = 1; i < closestDirtyTileInfo.path.length; i++) {
      fullPathCoords.push(closestDirtyTileInfo.path[i]);
    }

    robotPosSim = { ...closestDirtyTileInfo.tile };
    currentGridSim[robotPosSim.y][robotPosSim.x] = "cleaned";
    dirtyTilesLocations = dirtyTilesLocations.filter(
      (t) => !(t.x === robotPosSim.x && t.y === robotPosSim.y)
    );
  }
  return fullPathCoords;
}

function App() {
  const [obstacleCount, setObstacleCount] = useState(6);
  const [dirtyCount, setDirtyCount] = useState(10);

  const [grid, setGrid] = useState(() =>
    generateGrid(gridSize, obstacleCount, dirtyCount)
  );
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });

  const [isSolving, setIsSolving] = useState(false);
  const [path, setPath] = useState([]);
  const [pathIndex, setPathIndex] = useState(0);
  const [message, setMessage] = useState("");

  const maxObstacles = gridSize * gridSize - 2;
  const currentMaxDirty = Math.max(0, gridSize * gridSize - 1 - obstacleCount);
  const currentMinDirty = currentMaxDirty > 0 ? 1 : 0;

  const handleObstacleChange = (e) => {
    let newObstacleCount = Number(e.target.value);
    newObstacleCount = Math.max(0, Math.min(newObstacleCount, maxObstacles));
    setObstacleCount(newObstacleCount);

    const newMaxDirtyForObstacles = Math.max(
      0,
      gridSize * gridSize - 1 - newObstacleCount
    );
    const newMinDirtyForObstacles = newMaxDirtyForObstacles > 0 ? 1 : 0;

    if (dirtyCount > newMaxDirtyForObstacles) {
      setDirtyCount(newMaxDirtyForObstacles);
    } else if (
      dirtyCount < newMinDirtyForObstacles &&
      newMinDirtyForObstacles > 0
    ) {
      setDirtyCount(newMinDirtyForObstacles);
    } else if (newMaxDirtyForObstacles === 0) {
      setDirtyCount(0);
    }
  };

  const handleDirtyChange = (e) => {
    let newDirtyCount = Number(e.target.value);
    newDirtyCount = Math.max(
      currentMinDirty,
      Math.min(newDirtyCount, currentMaxDirty)
    );
    setDirtyCount(newDirtyCount);
  };

  const resetGrid = useCallback(() => {
    setIsSolving(false);
    setPath([]);
    setPathIndex(0);
    setMessage("");

    const validObstacleCount = Math.max(
      0,
      Math.min(obstacleCount, maxObstacles)
    );
    const maxDirtyForValidObstacles = Math.max(
      0,
      gridSize * gridSize - 1 - validObstacleCount
    );
    const minDirtyForValidObstacles = maxDirtyForValidObstacles > 0 ? 1 : 0;
    const validDirtyCount = Math.max(
      minDirtyForValidObstacles,
      Math.min(dirtyCount, maxDirtyForValidObstacles)
    );

    setGrid(generateGrid(gridSize, validObstacleCount, validDirtyCount));
    setRobotPos({ x: 0, y: 0 });
  }, [obstacleCount, dirtyCount, maxObstacles]);

  function handleSolve() {
    if (isSolving) return;

    setMessage("Calculating path...");
    setRobotPos({ x: 0, y: 0 });
    setTimeout(() => {
      const calculatedPath = findOptimalPath(grid, { x: 0, y: 0 });

      if (calculatedPath && calculatedPath.length > 0) {
        setPath(calculatedPath);
        setPathIndex(0);
        setIsSolving(true);
        setMessage("Solving... 🤖");

        if (grid[0][0] === "dirty") {
          setGrid((prevGridState) => {
            const newGridVisual = prevGridState.map((row) => [...row]);
            if (newGridVisual[0][0] === "dirty") {
              newGridVisual[0][0] = "cleaned";
            }
            return newGridVisual;
          });
        }
      } else {
        const totalDirtyInCurrentGrid = grid
          .flat()
          .filter((cell) => cell === "dirty").length;
        if (totalDirtyInCurrentGrid === 0) {
          setMessage("Already clean! ✅");
        } else {
          setMessage("No path found or no dirty tiles reachable. 🚫");
        }
      }
    }, 50);
  }

  useEffect(() => {
    if (!isSolving || pathIndex >= path.length) {
      if (isSolving && path.length > 0) {
        const remainingDirty = grid
          .flat()
          .filter((cell) => cell === "dirty").length;
        if (remainingDirty === 0) {
          setMessage("Solved! All dirty tiles cleaned. 🎉");
        } else {
          setMessage(
            `Path finished, but ${remainingDirty} dirty tile(s) remain. 😕`
          );
        }
        setIsSolving(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      const nextPos = path[pathIndex];
      setRobotPos(nextPos);

      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((row) => [...row]);
        if (newGrid[nextPos.y][nextPos.x] === "dirty") {
          newGrid[nextPos.y][nextPos.x] = "cleaned";
        }
        return newGrid;
      });

      setPathIndex((prev) => prev + 1);
    }, 250);

    return () => clearTimeout(timer);
  }, [isSolving, pathIndex, path, grid]);

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-700">
        Roomba Simulator 🤖
      </h2>
      <div className="flex flex-wrap justify-center gap-4 mb-6 items-center">
        <label className="flex flex-col items-center">
          <span className="text-sm font-medium text-gray-600 mb-1">
            Obstacles
          </span>
          <input
            type="number"
            min={0}
            max={maxObstacles}
            value={obstacleCount}
            onChange={handleObstacleChange}
            disabled={isSolving}
            className="w-20 px-2 py-1 border rounded text-center"
          />
        </label>
        <label className="flex flex-col items-center">
          <span className="text-sm font-medium text-gray-600 mb-1">
            Dirty Tiles
          </span>
          <input
            type="number"
            min={currentMinDirty}
            max={currentMaxDirty}
            value={dirtyCount}
            onChange={handleDirtyChange}
            disabled={isSolving || currentMaxDirty === 0}
            className="w-20 px-2 py-1 border rounded text-center"
          />
        </label>
        <button
          onClick={resetGrid}
          disabled={isSolving}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded shadow transition disabled:opacity-50"
        >
          Reset Grid
        </button>
      </div>
      {renderGrid()}
      {message && (
        <p
          className={`mt-4 text-lg font-semibold ${
            message.includes("🎉") || message.includes("✅")
              ? "text-green-600"
              : message.includes("🚫") || message.includes("😕")
              ? "text-red-600"
              : "text-blue-600"
          }`}
        >
          {message}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-4 text-lg">
        <button
          onClick={handleSolve}
          disabled={isSolving || (currentMaxDirty === 0 && dirtyCount === 0)}
          className={`px-6 py-3 text-white font-semibold rounded shadow transition ${
            isSolving || (currentMaxDirty === 0 && dirtyCount === 0)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 cursor-pointer"
          }`}
        >
          {isSolving ? "Solving..." : "Solve ✨"}
        </button>
      </div>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-3 text-md">
        <span>
          {EMOJI.robot} <span className="text-gray-600">= Roomba</span>
        </span>
        <span>
          {EMOJI.obstacle} <span className="text-gray-600">= Obstacle</span>
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

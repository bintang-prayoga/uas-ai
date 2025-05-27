const SIZE = 3;

// Membuat grid kosong untuk visualisasi
function createEmptyGrid() {
  return Array.from({ length: SIZE }, (_, i) =>
    Array.from({ length: SIZE }, (_, j) =>
      i * SIZE + j + 1 === SIZE * SIZE ? 0 : i * SIZE + j + 1
    )
  );
}

function App() {
  const startGrid = createEmptyGrid();
  const goalGrid = createEmptyGrid();
  const visualGrid = createEmptyGrid();

  return (
    <div className="flex flex-col items-center mt-6">
      <h1 className="text-2xl font-bold mb-4">
        Visualisasi A* pada 8 Puzzle Problem
      </h1>
      <div className="flex gap-2 mb-4">
        <button className="px-3 py-1 rounded bg-blue-600 text-white">
          Edit Start
        </button>
        <button className="px-3 py-1 rounded bg-green-100">Edit Goal</button>
        <button className="px-3 py-1 rounded bg-yellow-500 text-white">
          Visualisasikan A*
        </button>
        <button className="px-3 py-1 rounded bg-gray-400 text-white">
          Acak Start
        </button>
        <button className="px-3 py-1 rounded bg-red-400 text-white">
          Reset
        </button>
      </div>
      <div className="flex gap-8">
        <div>
          <div className="mb-2 text-center font-semibold">Start State</div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${SIZE}, 40px)`,
              gridTemplateRows: `repeat(${SIZE}, 40px)`,
              gap: 2,
            }}
          >
            {startGrid.map((row, i) =>
              row.map((val, j) => (
                <div
                  key={i + "-" + j}
                  className={`
                    w-10 h-10 flex items-center justify-center border text-xl font-bold
                    ${val === 0 ? "bg-gray-200" : "bg-blue-200"}
                  `}
                >
                  {val !== 0 ? val : ""}
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="mb-2 text-center font-semibold">Goal State</div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${SIZE}, 40px)`,
              gridTemplateRows: `repeat(${SIZE}, 40px)`,
              gap: 2,
            }}
          >
            {goalGrid.map((row, i) =>
              row.map((val, j) => (
                <div
                  key={i + "-" + j}
                  className={`
                    w-10 h-10 flex items-center justify-center border text-xl font-bold
                    ${val === 0 ? "bg-gray-200" : "bg-green-200"}
                  `}
                >
                  {val !== 0 ? val : ""}
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="mb-2 text-center font-semibold">Visualisasi</div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${SIZE}, 40px)`,
              gridTemplateRows: `repeat(${SIZE}, 40px)`,
              gap: 2,
            }}
          >
            {visualGrid.map((row, i) =>
              row.map((val, j) => (
                <div
                  key={i + "-" + j}
                  className={`
                    w-10 h-10 flex items-center justify-center border text-xl font-bold
                    ${val === 0 ? "bg-gray-200" : "bg-yellow-100"}
                  `}
                >
                  {val !== 0 ? val : ""}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Biru: Start | Hijau: Goal | Abu: Kosong | Kuning: Dieksplorasi | Pink:
        Jalur solusi
      </div>
    </div>
  );
}

export default App;

export default function Grid({ board, puzzle, onChange }) {
  const SIZE = 9;
  return (
    <div
      className="grid mb-4"
      style={{
        gridTemplateColumns: `repeat(${SIZE}, 36px)`,
        gridTemplateRows: `repeat(${SIZE}, 36px)`,
        gap: 0,
      }}
    >
      {board.map((row, i) =>
        row.map((val, j) => (
          <input
            key={i + "-" + j}
            type="text"
            maxLength={1}
            value={val === 0 ? "" : val}
            onChange={(e) => onChange(i, j, e.target.value)}
            className={`
              w-9 h-9 text-center border
              ${
                puzzle && puzzle[i][j] !== 0
                  ? "bg-gray-200 font-bold"
                  : "bg-white"
              }
              ${j % 3 === 2 && j !== 8 ? "border-r-4" : ""}
              ${i % 3 === 2 && i !== 8 ? "border-b-4" : ""}
              outline-none
            `}
            style={{ fontSize: "1.2rem" }}
            disabled={puzzle && puzzle[i][j] !== 0}
          />
        ))
      )}
    </div>
  );
}

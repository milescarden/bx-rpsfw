import React, { useState } from "react";
import "./App.css";

const pieceEmojis = {
  flag: "🚩",
  water: "💦",
  fire: "🔥",
  rock: "🧱",
  paper: "📄",
  scissors: "✂️",
};

// Cube directions (pointy-top hexes)
const cubeDirections = [
  [+1, -1, 0],
  [+1, 0, -1],
  [0, +1, -1],
  [-1, +1, 0],
  [-1, 0, +1],
  [0, -1, +1],
];

// Convert offset row/col to cube
function offsetToCube(row, col) {
  const x = col - (row - (row & 1)) / 2;
  const z = row;
  const y = -x - z;
  return [x, y, z];
}

// Convert cube to offset row/col
function cubeToOffset(x, y, z) {
  const row = z;
  const col = x + (z - (z & 1)) / 2;
  return [row, col];
}

function getCubeNeighbors(row, col) {
  const [x, y, z] = offsetToCube(row, col);
  return cubeDirections
    .map(([dx, dy, dz]) => cubeToOffset(x + dx, y + dy, z + dz))
    .filter(([r, c]) => inBounds(initialBoard, r, c));
}

function inBounds(board, r, c) {
  return r >= 0 && r < board.length && c >= 0 && c < board[r].length;
}

function canCapture(attacker, defender) {
  if (defender === "flag") return true;
  if (attacker === "fire") return ["rock", "paper", "scissors"].includes(defender);
  if (attacker === "water") return defender === "fire";
  if (["rock", "paper", "scissors"].includes(attacker)) {
    if (defender === "water") return true;
    return (
      (attacker === "rock" && defender === "scissors") ||
      (attacker === "paper" && defender === "rock") ||
      (attacker === "scissors" && defender === "paper")
    );
  }
  return false;
}

const getPlayerName = (p) => (p === 1 ? "Purple" : "Brown");

const initialBoard = [
  [null, null, null, null, { player: 1, type: "flag" }, null, null, null, null],
  [
    { player: 1, type: "water" },
    { player: 1, type: "water" },
    { player: 1, type: "fire" },
    { player: 1, type: "water" },
    { player: 1, type: "water" },
    { player: 1, type: "fire" },
    { player: 1, type: "water" },
    { player: 1, type: "water" },
  ],
  [
    { player: 1, type: "paper" },
    { player: 1, type: "scissors" },
    { player: 1, type: "rock" },
    { player: 1, type: "paper" },
    { player: 1, type: "scissors" },
    { player: 1, type: "rock" },
    { player: 1, type: "paper" },
    { player: 1, type: "scissors" },
    { player: 1, type: "rock" },
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    { player: 2, type: "rock" },
    { player: 2, type: "scissors" },
    { player: 2, type: "paper" },
    { player: 2, type: "rock" },
    { player: 2, type: "scissors" },
    { player: 2, type: "paper" },
    { player: 2, type: "rock" },
    { player: 2, type: "scissors" },
    { player: 2, type: "paper" },
  ],
  [
    { player: 2, type: "water" },
    { player: 2, type: "water" },
    { player: 2, type: "fire" },
    { player: 2, type: "water" },
    { player: 2, type: "water" },
    { player: 2, type: "fire" },
    { player: 2, type: "water" },
    { player: 2, type: "water" },
  ],
  [null, null, null, null, { player: 2, type: "flag" }, null, null, null, null],
];

export default function App() {
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState(1);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [winner, setWinner] = useState(null);

  const calculateValidMoves = (r, c) => {
    const piece = board[r][c];
    if (!piece || piece.type === "flag") return [];
    return getCubeNeighbors(r, c).filter(([nr, nc]) => {
      const target = board[nr][nc];
      return !target || (target.player !== piece.player && canCapture(piece.type, target.type));
    });
  };

  const handleHexClick = (r, c) => {
    if (winner) return;
    const piece = board[r][c];

    if (piece && piece.player === turn) {
      if (selected && selected[0] === r && selected[1] === c) {
        setSelected(null);
        setValidMoves([]);
      } else {
        setSelected([r, c]);
        setValidMoves(calculateValidMoves(r, c));
      }
      return;
    }

    if (selected && validMoves.some(([vr, vc]) => vr === r && vc === c)) {
      const [sr, sc] = selected;
      const movingPiece = board[sr][sc];
      const targetPiece = board[r][c];

      const newBoard = board.map((row, ri) =>
        row.map((cell, ci) => {
          if (ri === sr && ci === sc) return null;
          if (ri === r && ci === c) return movingPiece;
          return cell;
        })
      );

      setBoard(newBoard);
      setSelected(null);
      setValidMoves([]);

      if (targetPiece?.type === "flag" && targetPiece.player !== movingPiece.player) {
        setWinner(movingPiece.player);
      } else {
        setTurn(turn === 1 ? 2 : 1);
      }
      return;
    }

    setSelected(null);
    setValidMoves([]);
  };

  return (
    <div className="App">
      <h1 className="title">Bx Rock, Paper, Scissors, Fire, and Water</h1>
      <h2 className={winner ? (winner === 1 ? "turn-purple" : "turn-brown") : (turn === 1 ? "turn-purple" : "turn-brown")}>
        {winner ? `${getPlayerName(winner)} wins! 🎉` : `${getPlayerName(turn)}'s turn`}
      </h2>

      <div className="board">
        {board.map((row, r) => {
          const isOffset = r % 2 === 1;
          return (
            <div key={r} className={`hex-row${isOffset ? " offset" : ""}`}>
              {row.map((cell, c) => {
                const classes = ["hex"];
                if (cell) classes.push(`player${cell.player}`);
                if (selected && selected[0] === r && selected[1] === c) classes.push("selected");
                if (validMoves.some(([vr, vc]) => vr === r && vc === c)) classes.push("valid-move");
                if ((cell && cell.player === turn) || validMoves.some(([vr, vc]) => vr === r && vc === c))
                  classes.push("clickable");
                return (
                  <div
                    key={`${r}-${c}`}
                    className={classes.join(" ")}
                    onClick={() => handleHexClick(r, c)}
                  >
                    {cell ? pieceEmojis[cell.type] : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

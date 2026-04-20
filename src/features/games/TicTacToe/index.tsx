import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Player = 'X' | 'O' | null;

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function TicTacToe() {
  const navigate = useNavigate();
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  useEffect(() => {
    checkWinner(board);
  }, [board]);

  const checkWinner = (currentBoard: Player[]) => {
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        setWinner(currentBoard[a]);
        setWinningLine(WINNING_COMBINATIONS[i]);
        setScores(prev => ({ ...prev, [currentBoard[a] as string]: prev[currentBoard[a] as keyof typeof prev] + 1 }));
        return;
      }
    }
    if (!currentBoard.includes(null)) {
      setIsDraw(true);
    }
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || isDraw) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
  };

  return (
    <div className="min-h-screen bg-indigo-950 font-sans flex flex-col items-center py-8 px-4" dir="ltr">
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate('/child')}
          className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white shadow-md hover:bg-white/20 transition-all"
        >
          <ArrowRight className="w-6 h-6 rotate-180" />
        </button>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">
          Tic Tac Toe
        </h1>
        <div className="w-12 h-12" />
      </div>

      <div className="w-full max-w-md flex justify-between gap-4 mb-8">
        <div className={`flex-1 rounded-2xl p-4 text-center transition-all ${xIsNext && !winner && !isDraw ? 'bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)] border border-cyan-400/50' : 'bg-white/5 border border-white/10'}`}>
          <div className="text-cyan-400 font-black text-2xl mb-1">X</div>
          <div className="text-white font-bold">{scores.X} Wins</div>
        </div>
        <div className={`flex-1 rounded-2xl p-4 text-center transition-all ${!xIsNext && !winner && !isDraw ? 'bg-fuchsia-500/20 shadow-[0_0_20px_rgba(232,121,249,0.3)] border border-fuchsia-400/50' : 'bg-white/5 border border-white/10'}`}>
          <div className="text-fuchsia-400 font-black text-2xl mb-1">O</div>
          <div className="text-white font-bold">{scores.O} Wins</div>
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-3">
          {board.map((cell, index) => {
            const isWinningCell = winningLine?.includes(index);
            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleClick(index)}
                disabled={!!cell || !!winner || isDraw}
                className={`
                  w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-6xl font-black transition-all
                  ${!cell ? 'bg-white/5 hover:bg-white/10 cursor-pointer' : 'bg-white/10 cursor-default'}
                  ${isWinningCell ? 'shadow-[0_0_30px_rgba(255,255,255,0.2)] bg-white/20' : ''}
                `}
              >
                <AnimatePresence>
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={cell === 'X' ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'text-fuchsia-400 drop-shadow-[0_0_10px_rgba(232,121,249,0.8)]'}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {(winner || isDraw) ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="text-2xl font-black text-white flex items-center gap-2">
                {winner ? (
                  <>
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className={winner === 'X' ? 'text-cyan-400' : 'text-fuchsia-400'}>
                      {winner} Wins!
                    </span>
                  </>
                ) : (
                  "It's a Draw!"
                )}
              </div>
              <button 
                onClick={resetGame}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold transition-all border border-white/20"
              >
                <RotateCcw className="w-5 h-5" /> Play Again
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="turn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-bold text-white/50"
            >
              {xIsNext ? "X's Turn" : "O's Turn"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

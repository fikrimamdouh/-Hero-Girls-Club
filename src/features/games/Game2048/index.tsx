import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// 2048 Game Logic adapted for React
type Board = number[][];

const getEmptyBoard = (): Board => Array(4).fill(null).map(() => Array(4).fill(0));

const getRandomEmptyCell = (board: Board): { r: number; c: number } | null => {
  const emptyCells: { r: number; c: number }[] = [];
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === 0) emptyCells.push({ r, c });
    });
  });
  if (emptyCells.length === 0) return null;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

const addRandomTile = (board: Board): Board => {
  const newBoard = board.map(row => [...row]);
  const cell = getRandomEmptyCell(newBoard);
  if (cell) {
    newBoard[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
  }
  return newBoard;
};

const moveLeft = (board: Board): { newBoard: Board; score: number; moved: boolean } => {
  let score = 0;
  let moved = false;
  const newBoard = board.map(row => {
    let newRow = row.filter(val => val !== 0);
    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2;
        score += newRow[i];
        newRow[i + 1] = 0;
        moved = true;
      }
    }
    newRow = newRow.filter(val => val !== 0);
    while (newRow.length < 4) newRow.push(0);
    if (newRow.join(',') !== row.join(',')) moved = true;
    return newRow;
  });
  return { newBoard, score, moved };
};

const rotateRight = (board: Board): Board => {
  const newBoard = getEmptyBoard();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newBoard[c][3 - r] = board[r][c];
    }
  }
  return newBoard;
};

const rotateLeft = (board: Board): Board => {
  const newBoard = getEmptyBoard();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newBoard[3 - c][r] = board[r][c];
    }
  }
  return newBoard;
};

const checkGameOver = (board: Board): boolean => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
};

const TILE_COLORS: Record<number, string> = {
  2: 'bg-slate-100 text-slate-700',
  4: 'bg-orange-100 text-orange-800',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-500 text-white',
  32: 'bg-red-400 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-yellow-300 text-yellow-900 shadow-[0_0_10px_rgba(253,224,71,0.5)]',
  256: 'bg-yellow-400 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.6)]',
  512: 'bg-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.7)]',
  1024: 'bg-yellow-600 text-white shadow-[0_0_25px_rgba(202,138,4,0.8)]',
  2048: 'bg-yellow-700 text-white shadow-[0_0_30px_rgba(161,98,7,0.9)]',
};

export default function Game2048() {
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initGame = useCallback(() => {
    let newBoard = getEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    const savedBest = localStorage.getItem('2048_best');
    if (savedBest) setBestScore(parseInt(savedBest, 10));
    initGame();
  }, [initGame]);

  const handleMove = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;

    let currentBoard = board;
    let result;

    if (direction === 'LEFT') {
      result = moveLeft(currentBoard);
    } else if (direction === 'RIGHT') {
      currentBoard = rotateRight(rotateRight(currentBoard));
      result = moveLeft(currentBoard);
      result.newBoard = rotateRight(rotateRight(result.newBoard));
    } else if (direction === 'UP') {
      currentBoard = rotateLeft(currentBoard);
      result = moveLeft(currentBoard);
      result.newBoard = rotateRight(result.newBoard);
    } else if (direction === 'DOWN') {
      currentBoard = rotateRight(currentBoard);
      result = moveLeft(currentBoard);
      result.newBoard = rotateLeft(result.newBoard);
    }

    if (result && result.moved) {
      const newBoard = addRandomTile(result.newBoard);
      setBoard(newBoard);
      setScore(s => {
        const newScore = s + result.score;
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem('2048_best', newScore.toString());
        }
        return newScore;
      });
      if (checkGameOver(newBoard)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, bestScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': handleMove('UP'); break;
        case 'ArrowDown': handleMove('DOWN'); break;
        case 'ArrowLeft': handleMove('LEFT'); break;
        case 'ArrowRight': handleMove('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // Touch handling for mobile
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) handleMove(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      if (Math.abs(dy) > 30) handleMove(dy > 0 ? 'DOWN' : 'UP');
    }
    setTouchStart(null);
  };

  return (
    <div className="min-h-screen bg-amber-50 font-sans flex flex-col items-center py-8 px-4" dir="ltr">
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate('/child')}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-md hover:bg-amber-100 transition-all"
        >
          <ArrowRight className="w-6 h-6 rotate-180" />
        </button>
        <h1 className="text-4xl font-black text-amber-800">2048</h1>
        <div className="w-12 h-12" />
      </div>

      <div className="w-full max-w-md flex justify-between gap-4 mb-8">
        <div className="flex-1 bg-amber-200 rounded-2xl p-3 text-center shadow-inner">
          <div className="text-amber-700 font-bold text-sm uppercase">Score</div>
          <div className="text-2xl font-black text-amber-900">{score}</div>
        </div>
        <div className="flex-1 bg-amber-300 rounded-2xl p-3 text-center shadow-inner">
          <div className="text-amber-800 font-bold text-sm uppercase">Best</div>
          <div className="text-2xl font-black text-amber-900">{bestScore}</div>
        </div>
      </div>

      <div className="w-full max-w-md flex justify-between items-center mb-4 px-2">
        <p className="text-amber-700 font-bold">Join the numbers!</p>
        <button 
          onClick={initGame}
          className="bg-amber-600 text-white p-3 rounded-full shadow-md hover:bg-amber-700 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div 
        className="bg-amber-800 p-3 rounded-2xl shadow-xl relative touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-3">
          {board.map((row, r) => (
            row.map((cell, c) => (
              <div key={`${r}-${c}`} className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-900/30 rounded-xl relative">
                <AnimatePresence>
                  {cell !== 0 && (
                    <motion.div
                      key={`${r}-${c}-${cell}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`absolute inset-0 flex items-center justify-center rounded-xl font-black text-2xl sm:text-3xl ${TILE_COLORS[cell] || 'bg-yellow-200 text-yellow-900'}`}
                    >
                      {cell}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ))}
        </div>

        <AnimatePresence>
          {gameOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-amber-900/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10"
            >
              <h2 className="text-4xl font-black text-white mb-4">Game Over!</h2>
              <button 
                onClick={initGame}
                className="bg-amber-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-amber-400 transition-all"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <p className="mt-8 text-amber-600 text-sm text-center max-w-md">
        <strong>How to play:</strong> Use your arrow keys or swipe to move the tiles. Tiles with the same number merge into one when they touch. Add them up to reach 2048!
      </p>
    </div>
  );
}

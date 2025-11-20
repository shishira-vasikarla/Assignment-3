import React, { useEffect, useRef, useState, useCallback } from "react";
import "./Game.css";

export default function Game() {
  const playerRef = useRef(null);

  // Game constants
  const GAME_WIDTH = 600;
  const GAME_HEIGHT = 300;
  const PLAYER_SIZE = 50;
  const PIPE_WIDTH = 60;
  const GAP_HEIGHT = 120;
  const GRAVITY = 0.5;
  const JUMP_STRENGTH = -10;
  const MOVE_SPEED = 1.8;

  // Game state
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(125);
  const [velocity, setVelocity] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Pipes (two pipes)
  const [pipes] = useState(() => [
    {
      topRef: React.createRef(),
      bottomRef: React.createRef(),
      x: 600,
      passed: false,
      topHeight: Math.random() * 120
    },
    {
      topRef: React.createRef(),
      bottomRef: React.createRef(),
      x: 900,
      passed: false,
      topHeight: Math.random() * 120
    }
  ]);

  // Jump
  const jump = useCallback(() => {
    if (!gameStarted || gameOver) return;
    setVelocity(JUMP_STRENGTH);
  }, [gameOver, gameStarted, JUMP_STRENGTH]);

  // Controls: Start game / Move / Jump
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") {
        if (!gameStarted) {
          setGameStarted(true);
          return;
        }
        jump();
      }

      if (!gameStarted || gameOver) return;

      if (e.code === "ArrowRight")
        setPlayerX((x) => Math.min(x + 10, GAME_WIDTH - PLAYER_SIZE));

      if (e.code === "ArrowLeft")
        setPlayerX((x) => Math.max(x - 10, 0));
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameStarted, gameOver, jump]);

  // === GAME LOOP ===
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      // GRAVITY
      setVelocity((prev) => prev + GRAVITY);
      setPlayerY((prev) => {
        const newY = prev + velocity;
        if (newY < 0 || newY > GAME_HEIGHT - PLAYER_SIZE) {
          setGameOver(true);
          return prev;
        }
        return newY;
      });

      // PIPE MOVEMENT + COLLISION + SCORING
      pipes.forEach((pipe) => {
        pipe.x -= MOVE_SPEED;

        // Reset pipe if off screen
        if (pipe.x < -PIPE_WIDTH) {
          pipe.x = GAME_WIDTH + Math.random() * 200;
          pipe.passed = false;
          pipe.topHeight = Math.random() * 120;
        }

        // Apply pipe CSS
        if (pipe.topRef.current && pipe.bottomRef.current) {
          pipe.topRef.current.style.height = pipe.topHeight + "px";
          pipe.topRef.current.style.left = pipe.x + "px";

          pipe.bottomRef.current.style.height =
            GAME_HEIGHT - (pipe.topHeight + GAP_HEIGHT) + "px";
          pipe.bottomRef.current.style.left = pipe.x + "px";
        }

        // SCORE when passed pipe
        if (!pipe.passed && pipe.x + PIPE_WIDTH < playerX) {
          pipe.passed = true;
          setScore((s) => s + 1);
        }

        // COLLISION DETECTION
        const playerLeft = playerX;
        const playerRight = playerX + PLAYER_SIZE;
        const playerTop = playerY + PLAYER_SIZE;
        const playerBottom = playerY;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        const touching =
          playerRight > pipeLeft && playerLeft < pipeRight;

        if (touching) {
          const gapTop = pipe.topHeight;
          const gapBottom = pipe.topHeight + GAP_HEIGHT;

          const hitTop = playerTop < gapTop;
          const hitBottom = playerBottom > gapBottom;

          if (hitTop || hitBottom) setGameOver(true);
        }
      });
    }, 20);

    return () => clearInterval(interval);
  }, [pipes, velocity, playerX, playerY, gameOver, gameStarted]);

  return (
    <div className="game-container">
      <div className="score">Score: {score}</div>

      <div className="game-box" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        
        {/* Player */}
        <div
          ref={playerRef}
          className="player"
          style={{ left: playerX, bottom: playerY }}
        ></div>

        {/* Pipes */}
        {pipes.map((pipe, i) => (
          <React.Fragment key={i}>
            <div ref={pipe.topRef} className="pipe top-pipe"></div>
            <div ref={pipe.bottomRef} className="pipe bottom-pipe"></div>
          </React.Fragment>
        ))}

        {/* Start Text */}
        {!gameStarted && !gameOver && (
          <div className="start-text">Press SPACE to Start</div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div className="game-over-banner">
            <h2>GAME OVER</h2>
            <p>Final Score: {score}</p>
            <button onClick={() => window.location.reload()}>Restart</button>
          </div>
        )}
      </div>
    </div>
  );
}

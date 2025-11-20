import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import "./Game.css";

export default function Game() {
  const playerRef = useRef(null);

  // Obstacle refs (two pipe pairs)
  const pipe1TopRef = useRef(null);
  const pipe1BottomRef = useRef(null);
  const pipe2TopRef = useRef(null);
  const pipe2BottomRef = useRef(null);

  const pipes = useMemo(
    () => [
      {
        top: pipe1TopRef,
        bottom: pipe1BottomRef,
        x: 600,
        passed: false,
        topHeight: Math.random() * 120,
      },
      {
        top: pipe2TopRef,
        bottom: pipe2BottomRef,
        x: 900,
        passed: false,
        topHeight: Math.random() * 120,
      },
    ],
    []
  );

  // Game size
  const gameWidth = 600;
  const gameHeight = 300;

  // Player size & movement
  const playerSize = 50;
  const [playerY, setPlayerY] = useState(0);
  const [playerX, setPlayerX] = useState(50);
  const [isJumping, setIsJumping] = useState(false);

  // Score
  const [score, setScore] = useState(0);

  // Pipe constants
  const pipeWidth = 60;
  const gapHeight = 120;

  // Handle jump
  const jump = useCallback(() => {
    if (isJumping) return;
    setIsJumping(true);

    let count = 0;
    const interval = setInterval(() => {
      if (count < 15) setPlayerY((prev) => prev + 8); // move up
      else if (count < 30) setPlayerY((prev) => prev - 8); // move down
      else {
        clearInterval(interval);
        setIsJumping(false);
      }
      count++;
    }, 20);
  }, [isJumping]);

  // Keyboard movement
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") jump();

      if (e.code === "ArrowRight") {
        setPlayerX((x) => Math.min(x + 10, gameWidth - playerSize));
      }

      if (e.code === "ArrowLeft") {
        setPlayerX((x) => Math.max(x - 10, 0));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [jump]);

  // GAME LOOP: move pipes, detect collisions, scoring
  useEffect(() => {
    const interval = setInterval(() => {
      pipes.forEach((pipePair) => {
        // Move pipes left
        pipePair.x -= 1.5;

        // Reset pipes when offscreen
        if (pipePair.x < -pipeWidth) {
          pipePair.x = gameWidth + Math.random() * 200;
          pipePair.passed = false;
          pipePair.topHeight = Math.random() * (gameHeight - gapHeight - 20);
        }

        const topHeight = pipePair.topHeight;

        // Render pipes
        if (pipePair.top.current && pipePair.bottom.current) {
          pipePair.top.current.style.height = topHeight + "px";
          pipePair.top.current.style.left = pipePair.x + "px";

          pipePair.bottom.current.style.height =
            gameHeight - (topHeight + gapHeight) + "px";
          pipePair.bottom.current.style.left = pipePair.x + "px";
        }

        // SCORE when player passes pipe
        if (!pipePair.passed && pipePair.x + pipeWidth < playerX) {
          setScore((s) => s + 1);
          pipePair.passed = true;
        }

        // ----------------------
        // PERFECT COLLISION LOGIC
        // ----------------------

        const playerLeft = playerX;
        const playerRight = playerX + playerSize;
        const playerBottom = playerY;
        const playerTop = playerY + playerSize;

        const pipeLeft = pipePair.x;
        const pipeRight = pipePair.x + pipeWidth;

        // Check horizontal overlap (actual touching)
        const touchingX =
          playerRight > pipeLeft && playerLeft < pipeRight;

        if (touchingX) {
          const gapStart = topHeight;
          const gapEnd = topHeight + gapHeight;

          const hitTopPipe = playerTop < gapStart;
          const hitBottomPipe = playerBottom > gapEnd;

          // Only end game if ACTUALLY touching pipes
          if (hitTopPipe || hitBottomPipe) {
            alert("💥 GAME OVER!\nFinal Score: " + score);
            window.location.reload();
          }
        }
      });
    }, 20);

    return () => clearInterval(interval);
  }, [playerX, playerY, pipes, score]);

  return (
    <div className="game-container">
      <div className="score">Score: {score}</div>

      <div className="game-box" style={{ width: gameWidth, height: gameHeight }}>
        {/* Player */}
        <div
          ref={playerRef}
          className="player"
          style={{ left: playerX, bottom: playerY }}
        ></div>

        {/* Pipes */}
        {pipes.map((p, i) => (
          <React.Fragment key={i}>
            <div ref={p.top} className="pipe top-pipe"></div>
            <div ref={p.bottom} className="pipe bottom-pipe"></div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import "./Game.css";

export default function Game() {
  const playerRef = useRef(null);

  // Obstacle refs (two pipe pairs)
  const pipe1TopRef = useRef(null);
  const pipe1BottomRef = useRef(null);
  const pipe2TopRef = useRef(null);
  const pipe2BottomRef = useRef(null);

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
  const constantTopHeight = 80;

  const pipes = useMemo(
    () => [
      {
        top: pipe1TopRef,
        bottom: pipe1BottomRef,
        x: 600,
        passed: false,
        topHeight: constantTopHeight,
      },
      {
        top: pipe2TopRef,
        bottom: pipe2BottomRef,
        x: 900,
        passed: false,
        topHeight: constantTopHeight,
      },
    ],
    []
  );

  // Handle jump (simple upward-downward motion)
  const jump = useCallback(() => {
    if (isJumping) return;
    setIsJumping(true);

    let count = 0;
    const interval = setInterval(() => {
      if (count < 15) setPlayerY((prev) => prev + 8);       // Move up
      else if (count < 30) setPlayerY((prev) => prev - 8);  // Move down
      else {
        clearInterval(interval);
        setIsJumping(false);
      }
      count++;
    }, 20);
  }, [isJumping]);

  // Keyboard Movement
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

  // GAME LOOP: Move pipes, update height, collisions, scoring
  useEffect(() => {
    const interval = setInterval(() => {
      pipes.forEach((pipePair) => {
        // Move pipes from right to left
        pipePair.x -= 2;

        // Reset pipes when they exit screen
        if (pipePair.x < -pipeWidth) {
          pipePair.x = gameWidth + 150;
          pipePair.passed = false;
          pipePair.topHeight = constantTopHeight;
        }

        const topHeight = pipePair.topHeight;

        // Apply CSS to pipe DOM
        if (pipePair.top.current && pipePair.bottom.current) {
          pipePair.top.current.style.height = topHeight + "px";
          pipePair.top.current.style.left = pipePair.x + "px";

          pipePair.bottom.current.style.height =
            gameHeight - (topHeight + gapHeight) + "px";
          pipePair.bottom.current.style.left = pipePair.x + "px";
        }

        // SCORING - Player successfully passed through the gap
        if (!pipePair.passed && pipePair.x + pipeWidth < playerX) {
          setScore((s) => s + 1);
          pipePair.passed = true;
        }

        // -------------------------
        // COLLISION DETECTION
        // -------------------------
        const pipeLeft = pipePair.x;
        const pipeRight = pipePair.x + pipeWidth;
        const playerLeft = playerX;
        const playerRight = playerX + playerSize;
        
        // Check if player and pipe overlap horizontally
        const horizontalOverlap = playerRight > pipeLeft && playerLeft < pipeRight;
        
        if (horizontalOverlap) {
          const topPipeBottom = topHeight;
          const bottomPipeTop = topHeight + gapHeight;
          const playerBottom = playerY;
          const playerTop = playerY + playerSize;
          
          // Check if player hit the top pipe (player is too high)
          if (playerTop > topPipeBottom) {
            alert("💥 GAME OVER! You hit the top pipe!\nFinal Score: " + score);
            window.location.reload();
          }
          
          // Check if player hit the bottom pipe (player is too low)
          if (playerBottom < (gameHeight - bottomPipeTop)) {
            alert("💥 GAME OVER! You hit the bottom pipe!\nFinal Score: " + score);
            window.location.reload();
          }
        }
      });
    }, 20);

    return () => clearInterval(interval);
  }, [playerX, playerY, pipes, score, gameWidth, gameHeight, playerSize, pipeWidth, constantTopHeight, gapHeight]);

  return (
    <div className="game-container">
      <div className="score">Score: {score}</div>

      <div
        className="game-box"
        style={{ width: gameWidth, height: gameHeight }}
      >
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

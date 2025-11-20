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
        topHeight: Math.random() * 120,  // NEW
      },
      {
        top: pipe2TopRef,
        bottom: pipe2BottomRef,
        x: 900,
        passed: false,
        topHeight: Math.random() * 120,  // NEW
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
      if (count < 15) setPlayerY((prev) => prev + 8);
      else if (count < 30) setPlayerY((prev) => prev - 8);
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

      // Horizontal movement
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

  // Game loop → move pipes + collisions + scoring
  useEffect(() => {
    const interval = setInterval(() => {
      pipes.forEach((pipePair) => {
        // Move pipes slowly
        pipePair.x -= 1.5;
  
        // Reset pipes when they exit screen
        if (pipePair.x < -pipeWidth) {
          pipePair.x = gameWidth + Math.random() * 200;
          pipePair.passed = false;
  
          // NEW fixed height for the next cycle
          pipePair.topHeight = Math.random() * (gameHeight - gapHeight - 20);
        }
  
        // FIX: Use the stored height (NO MORE RANDOM EVERY FRAME)
        const topHeight = pipePair.topHeight;
  
        // Apply CSS
        if (pipePair.top.current && pipePair.bottom.current) {
          pipePair.top.current.style.height = topHeight + "px";
          pipePair.top.current.style.left = pipePair.x + "px";
  
          pipePair.bottom.current.style.height =
            gameHeight - (topHeight + gapHeight) + "px";
          pipePair.bottom.current.style.left = pipePair.x + "px";
        }
  
        // SCORING
        if (!pipePair.passed && pipePair.x + pipeWidth < playerX) {
          setScore((s) => s + 1);
          pipePair.passed = true;
        }
  
        // COLLISION
        const playerTop = gameHeight - (playerY + playerSize);
        const playerBottom = gameHeight - playerY;
  
        if (pipePair.top.current && pipePair.bottom.current) {
          const topH = pipePair.top.current.offsetHeight;
          const bottomH = pipePair.bottom.current.offsetHeight;
  
          const hitX =
            playerX + playerSize > pipePair.x &&
            playerX < pipePair.x + pipeWidth;
  
          if (hitX) {
            if (playerTop < topH) {
              alert("💥 Game Over!");
              window.location.reload();
            }
  
            if (playerBottom > gameHeight - bottomH) {
              alert("💥 Game Over!");
              window.location.reload();
            }
          }
        }
      });
    }, 20);
  
    return () => clearInterval(interval);
  }, [playerX, playerY, pipes]);
  
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

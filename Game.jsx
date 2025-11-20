import React, { useEffect, useRef, useState } from "react";
import "./Game.css";

export default function Game() {
  const playerRef = useRef(null);
  const topPipeRef = useRef(null);
  const bottomPipeRef = useRef(null);

  const [playerPos, setPlayerPos] = useState({ x: 50, y: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);

  // Game constants
  const gameWidth = 600;
  const gameHeight = 300;
  const playerSize = 50;
  const playerSpeed = 20;
  const pipeWidth = 60;
  const gapHeight = 110;

  // Jump
  const jump = React.useCallback(() => {
    if (isJumping) return;

    setIsJumping(true);
    let jumpCount = 0;

    const jumpInterval = setInterval(() => {
      if (jumpCount < 15) {
        setPlayerPos((prev) => ({ ...prev, y: prev.y + 8 }));
      } else if (jumpCount < 30) {
        setPlayerPos((prev) => ({ ...prev, y: prev.y - 8 }));
      } else {
        clearInterval(jumpInterval);
        setIsJumping(false);
      }
      jumpCount++;
    }, 15);
  }, [isJumping]);

  // Left/Right move
  const movePlayer = (dir) => {
    setPlayerPos((prev) => {
      let newX = prev.x + dir;
      if (newX < 0) newX = 0;
      if (newX > gameWidth - playerSize) newX = gameWidth - playerSize;
      return { ...prev, x: newX };
    });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") jump();
      if (e.code === "ArrowLeft") movePlayer(-playerSpeed);
      if (e.code === "ArrowRight") movePlayer(playerSpeed);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isJumping, jump]);

  // Pipes + collision
  useEffect(() => {
    let pipeX = gameWidth;
    let passed = false;

    const interval = setInterval(() => {
      pipeX -= 4;

      if (pipeX < -pipeWidth) {
        pipeX = gameWidth;
        passed = false;
      }

      const topHeight = Math.random() * (gameHeight - gapHeight - 40);

      if (topPipeRef.current && bottomPipeRef.current) {
        topPipeRef.current.style.height = topHeight + "px";
        topPipeRef.current.style.left = pipeX + "px";

        bottomPipeRef.current.style.height =
          gameHeight - (topHeight + gapHeight) + "px";
        bottomPipeRef.current.style.left = pipeX + "px";
      }

      if (!passed && pipeX + pipeWidth < playerPos.x) {
        passed = true;
        setScore((s) => s + 1);
      }

      const playerLeft = playerPos.x;
      const playerRight = playerPos.x + playerSize;
      const playerTop = gameHeight - (playerPos.y + playerSize);
      const playerBottom = gameHeight - playerPos.y;

      if (
        (playerRight > pipeX &&
          playerLeft < pipeX + pipeWidth &&
          playerTop < topHeight) ||
        (playerRight > pipeX &&
          playerLeft < pipeX + pipeWidth &&
          playerBottom >
            gameHeight - bottomPipeRef.current.offsetHeight)
      ) {
        alert("💥 Game Over! Score: " + score);
        window.location.reload();
      }
    }, 20);

    return () => clearInterval(interval);
  }, [playerPos, score]);

  return (
    <div className="game-container">
      <div className="score">Score: {score}</div>
      <div className="game-box" style={{ width: gameWidth, height: gameHeight }}>
        <div
          ref={playerRef}
          className="player"
          style={{ left: playerPos.x, bottom: playerPos.y }}
        ></div>

        <div ref={topPipeRef} className="pipe top-pipe"></div>
        <div ref={bottomPipeRef} className="pipe bottom-pipe"></div>
      </div>
    </div>
  );
}

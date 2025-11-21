// src/Game.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import "./Game.css";

const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;

// Character size
const MAN_WIDTH = 42;
const MAN_HEIGHT = 42;

const GRAVITY = 0.25;
const JUMP_FORCE = 5;
const BLOCK_SPEED = 2;

const OBSTACLE_WIDTH = 60;
const GAP_HEIGHT = 150;
const GAME_TICK_MS = 20;

function randomGapTop() {
  const min = 50;
  const max = GAME_HEIGHT - GAP_HEIGHT - 80;
  return Math.floor(Math.random() * (max - min) + min);
}

function Game() {
  const velocity = useRef(0);

  const [manY, setManY] = useState(GAME_HEIGHT / 2);
  const [manX, setManX] = useState(80);

  const [obstacleX, setObstacleX] = useState(GAME_WIDTH);
  const [gapTop, setGapTop] = useState(randomGapTop());

  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const resetGame = useCallback(() => {
    setManY(GAME_HEIGHT / 2);
    setManX(80);
    velocity.current = 0;
    setObstacleX(GAME_WIDTH);
    setGapTop(randomGapTop());
    setScore(0);
    setIsGameOver(false);
  }, []);

  const gameOver = useCallback(() => {
    setIsRunning(false);
    setIsGameOver(true);
    setBestScore((prev) => (score > prev ? score : prev));
  }, [score]);

  const handleJump = useCallback(() => {
    if (!isRunning) {
      resetGame();
      setIsRunning(true);
    }
    velocity.current = -JUMP_FORCE;
  }, [isRunning, resetGame]);

  // Movement input
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleJump();
      }
      if (e.code === "ArrowLeft") {
        setManX((x) => Math.max(0, x - 10));
      }
      if (e.code === "ArrowRight") {
        setManX((x) => Math.min(GAME_WIDTH - MAN_WIDTH, x + 10));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleJump]);

  // Main game loop (fixed version)
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Apply gravity
      velocity.current += GRAVITY;

      // Update man position
      setManY((prevY) => {
        let newY = prevY + velocity.current;

        if (newY < 0) {
          newY = 0;
          gameOver();
        } else if (newY + MAN_HEIGHT > GAME_HEIGHT) {
          newY = GAME_HEIGHT - MAN_HEIGHT;
          gameOver();
        }
        return newY;
      });

      // Move obstacle + score increment ONLY once
      setObstacleX((prevX) => {
        let newX = prevX - BLOCK_SPEED;

        if (newX + OBSTACLE_WIDTH < 0) {
          newX = GAME_WIDTH;
          setGapTop(randomGapTop());
          setScore((s) => s + 1); // fixed: increments exactly 1
        }
        return newX;
      });

      // Collision detection (uses existing manY)
      const manRect = {
        left: manX,
        right: manX + MAN_WIDTH,
        top: manY,
        bottom: manY + MAN_HEIGHT,
      };

      const upperRect = {
        left: obstacleX,
        right: obstacleX + OBSTACLE_WIDTH,
        top: 0,
        bottom: gapTop,
      };

      const lowerRect = {
        left: obstacleX,
        right: obstacleX + OBSTACLE_WIDTH,
        top: gapTop + GAP_HEIGHT,
        bottom: GAME_HEIGHT,
      };

      const overlap = (a, b) =>
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top;

      if (overlap(manRect, upperRect) || overlap(manRect, lowerRect)) {
        gameOver();
      }
    }, GAME_TICK_MS);

    return () => clearInterval(interval);
  }, [isRunning, manX, manY, obstacleX, gapTop, gameOver]);

  return (
    <div className="game-wrapper">
      <div
        className="game"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={handleJump}
      >
        {/* Score Display */}
        <div className="score">
          {score}
          {bestScore > 0 && <span className="best">Best: {bestScore}</span>}
        </div>

        {/* Animated Man */}
        <div
          className="man animated-man"
          style={{
            width: MAN_WIDTH,
            height: MAN_HEIGHT,
            transform: `translate(${manX}px, ${manY}px)`,
          }}
        ></div>

        {/* Obstacles */}
        <div
          className="obstacle obstacle-top"
          style={{
            width: OBSTACLE_WIDTH,
            height: gapTop,
            transform: `translateX(${obstacleX}px)`,
          }}
        />

        <div
          className="obstacle obstacle-bottom"
          style={{
            width: OBSTACLE_WIDTH,
            height: GAME_HEIGHT - (gapTop + GAP_HEIGHT),
            transform: `translateX(${obstacleX}px)`,
            top: gapTop + GAP_HEIGHT,
          }}
        />

        {/* Ground */}
        <div className="ground" />

        {/* Overlay */}
        {(!isRunning || isGameOver) && (
          <div className="overlay">
            <h2>{isGameOver ? "Game Over" : "Click / SPACE to Start"}</h2>
            <p>Score: {score}</p>
            {bestScore > 0 && <p>Best: {bestScore}</p>}
            <button onClick={handleJump}>Play</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;

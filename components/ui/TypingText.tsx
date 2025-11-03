"use client";

/**
 * TypingText Component
 * Creates a typing animation effect with animated ellipsis
 */

import { useEffect, useState } from "react";

interface TypingTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export function TypingText({ text, className = "", speed = 100 }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [dotCount, setDotCount] = useState(0);

  // Typing animation effect
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  // Cursor blink effect
  useEffect(() => {
    if (isComplete) {
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);
      return () => clearInterval(cursorInterval);
    }
  }, [isComplete]);

  // Animated ellipsis after typing completes
  useEffect(() => {
    if (isComplete) {
      const ellipsisInterval = setInterval(() => {
        setDotCount((prev) => (prev + 1) % 4);
      }, 400);
      return () => clearInterval(ellipsisInterval);
    }
  }, [isComplete]);

  return (
    <span className={className}>
      {displayedText}
      {isComplete && (
        <span className="typing-ellipsis">
          {dotCount === 0 && "."}
          {dotCount === 1 && ".."}
          {(dotCount === 2 || dotCount === 3) && "..."}
        </span>
      )}
      {!isComplete && showCursor && <span className="typing-cursor">|</span>}
    </span>
  );
}


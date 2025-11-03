"use client";

/**
 * Animated Number Component
 * Smoothly animates numbers when they change
 */

import { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  format?: "currency" | "count" | "percentage";
  decimals?: number;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({ 
  value, 
  format = "count", 
  decimals = 0,
  className = "",
  duration = 1000 
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (prevValue.current !== value) {
      const startValue = prevValue.current;
      const endValue = value;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = startValue + (endValue - startValue) * easeOut;
        setDisplayValue(currentValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
          prevValue.current = endValue;
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formatNumber = (num: number): string => {
    if (format === "currency") {
      return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    if (format === "percentage") {
      return num.toFixed(decimals);
    }
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <span className={className}>
      {formatNumber(displayValue)}
    </span>
  );
}


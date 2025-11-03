"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50",
          {
            // Variants
            "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/20":
              variant === "default",
            "border border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:border-gray-600":
              variant === "outline",
            "text-gray-400 hover:text-gray-300 hover:bg-gray-800":
              variant === "ghost",
            // Sizes
            "px-3 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };


"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Dithering } from "@paper-design/shaders-react";

interface AnimatedBackgroundProps {
  backgroundColor?: string;
  colorFront?: string;
  colorBack?: string;
  speed?: number;
  shape?: "wave" | "simplex" | "warp" | "dots" | "ripple" | "swirl" | "sphere";
  type?: "2x2" | "4x4" | "8x8";
  pxSize?: number;
  scale?: number;
  className?: string;
  children?: React.ReactNode;
  rainbow?: boolean;
}

export function AnimatedBackground({
  backgroundColor = "#000000",
  colorFront = "#614B00",
  colorBack = "#00000000",
  speed = 0.43,
  shape = "wave",
  type = "4x4",
  pxSize = 3,
  scale = 1.13,
  className = "",
  children,
  rainbow = false,
}: AnimatedBackgroundProps) {
  const [currentColor, setCurrentColor] = useState(colorFront);

  useEffect(() => {
    if (!rainbow) {
      setCurrentColor(colorFront);
      return;
    }

    const colors = [
      '#FF0000',
      '#FF7F00',
      '#FFFF00',
      '#00FF00',
      '#0000FF',
      '#4B0082',
      '#9400D3'
    ];
    let colorIndex = 0;

    const interval = setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length;
      setCurrentColor(colors[colorIndex]);
    }, 100);

    return () => clearInterval(interval);
  }, [rainbow, colorFront]);

  return (
    <div className={`relative ${className}`}>
      <div className="fixed inset-0 z-0">
        <Dithering
          colorBack={colorBack}
          colorFront={currentColor}
          speed={speed}
          shape={shape}
          type={type}
          pxSize={pxSize}
          scale={scale}
          style={{
            backgroundColor,
            height: "100vh",
            width: "100vw",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        />
      </div>

      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

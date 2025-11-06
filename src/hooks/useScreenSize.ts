// src/hooks/useScreenSize.ts
"use client";
import { useEffect, useState } from "react";

type ScreenSize = { width: number; height: number };

export const useScreenSize = () => {
  // Safe initial state for SSR
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return { width: 500, height: 500 };
    }
    const mainDiv = document.querySelector(".MuiGrid2-root");
    return {
      width: mainDiv?.clientWidth ?? 500,
      height: window.innerHeight - 120,
    };
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const mainDiv = document.querySelector(".MuiGrid2-root");
    if (!mainDiv) return;

    // Sync once after mount
    setScreenSize({
      width: mainDiv.clientWidth,
      height: window.innerHeight - 120,
    });

    const observer = new ResizeObserver(() =>
      setScreenSize((prev) => ({ ...prev, width: mainDiv.clientWidth }))
    );
    observer.observe(mainDiv);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setScreenSize((prev) => ({
        ...prev,
        height: window.innerHeight - 100,
      }));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return screenSize;
};

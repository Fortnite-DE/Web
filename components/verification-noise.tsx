"use client";

import { useEffect, useRef } from "react";

export function VerificationNoise() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!surface || !context) return;

    const patterns = Array.from({ length: 10 }, () => {
      const tile = document.createElement("canvas");
      tile.width = tile.height = 256;
      const tileContext = tile.getContext("2d")!;
      const pixels = tileContext.createImageData(256, 256);
      for (let i = 0; i < pixels.data.length; i += 4) {
        if (Math.random() >= 0.2) continue;
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = 221;
        pixels.data[i + 3] = 255;
      }
      tileContext.putImageData(pixels, 0, 0);
      return context.createPattern(tile, "repeat")!;
    });
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    let visible = false;
    let frame = 0;
    const paint = () => {
      context.clearRect(0, 0, surface.width, surface.height);
      context.fillStyle = patterns[frame++ % patterns.length];
      context.fillRect(0, 0, surface.width, surface.height);
    };
    const update = () => {
      clearInterval(timer);
      timer = undefined;
      if (visible && !document.hidden && !motion.matches) {
        timer = setInterval(paint, 1000 / 25);
      }
    };
    const resize = new ResizeObserver(() => {
      surface.width = surface.clientWidth;
      surface.height = surface.clientHeight;
      paint();
    });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    resize.observe(surface);
    observer.observe(surface);
    document.addEventListener("visibilitychange", update);
    motion.addEventListener("change", update);

    return () => {
      clearInterval(timer);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  return (
    <canvas ref={canvas} className="verification-noise" aria-hidden="true" />
  );
}

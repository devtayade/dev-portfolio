"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function AuroraBackground() {
  const prefersReduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const timeRef = useRef(0);
  const isDarkRef = useRef(false);

  // Pre-generate grain texture once
  useEffect(() => {
    const grainCanvas = grainCanvasRef.current;
    if (!grainCanvas) return;
    const gCtx = grainCanvas.getContext("2d");
    if (!gCtx) return;

    const size = 256;
    grainCanvas.width = size;
    grainCanvas.height = size;
    const imageData = gCtx.createImageData(size, size);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 30;
    }
    gCtx.putImageData(imageData, 0, 0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const grainCanvas = grainCanvasRef.current;
    if (!canvas || !grainCanvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const section = canvas.closest("section");
    if (!section) return;

    const updateDarkMode = () => {
      isDarkRef.current = document.documentElement.classList.contains("dark");
    };
    updateDarkMode();

    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = section.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      targetMouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    const handleMouseLeave = () => {
      targetMouseRef.current = { x: 0.5, y: 0.5 };
    };
    section.addEventListener("mousemove", handleMouse);
    section.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      const dark = isDarkRef.current;

      // Light mode: clear to white and skip all effects
      if (!dark) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // --- Dark mode only below ---
      timeRef.current += 0.005;
      const t = timeRef.current;

      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.06;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, w, h);

      const drift = (speed: number, offset: number) => Math.sin(t * speed + offset);
      const breathe = (speed: number, offset: number) => Math.sin(t * speed + offset) * 0.5 + 0.5;

      const mxOff = (mx - 0.5) * w * 0.35;
      const myOff = (my - 0.5) * h * 0.3;

      const blobs = [
        {
          cx: w * 0.4 + mxOff * 0.8 + drift(0.3, 0) * w * 0.03,
          cy: h * 0.4 + myOff * 0.8 + drift(0.25, 1) * h * 0.03,
          r: w * 0.5 + breathe(0.15, 0) * w * 0.05,
          colors: ["rgba(234,88,12,0.16)", "rgba(234,88,12,0.05)", "transparent"],
        },
        {
          cx: w * 0.65 - mxOff * 0.5 + drift(0.2, 2.5) * w * 0.04,
          cy: h * 0.55 - myOff * 0.4 + drift(0.18, 3.5) * h * 0.04,
          r: w * 0.4 + breathe(0.2, 2) * w * 0.04,
          colors: ["rgba(217,70,15,0.12)", "rgba(194,65,12,0.04)", "transparent"],
        },
        {
          cx: w * 0.25 + drift(0.12, 5) * w * 0.06 + mxOff * 0.3,
          cy: h * 0.3 + drift(0.15, 6) * h * 0.06 + myOff * 0.2,
          r: w * 0.35 + breathe(0.18, 4) * w * 0.03,
          colors: ["rgba(249,115,22,0.10)", "rgba(249,115,22,0.03)", "transparent"],
        },
      ];

      for (const blob of blobs) {
        const gradient = ctx.createRadialGradient(
          blob.cx, blob.cy, 0,
          blob.cx, blob.cy, blob.r
        );
        gradient.addColorStop(0, blob.colors[0]);
        gradient.addColorStop(0.5, blob.colors[1]);
        gradient.addColorStop(1, blob.colors[2]);

        ctx.beginPath();
        ctx.arc(blob.cx, blob.cy, blob.r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Mouse spotlight
      const spotX = mx * w;
      const spotY = my * h;
      const spotR = w * 0.22;
      const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotR);
      spotGrad.addColorStop(0, "rgba(251,146,60,0.10)");
      spotGrad.addColorStop(0.5, "rgba(234,88,12,0.03)");
      spotGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(spotX, spotY, spotR, 0, Math.PI * 2);
      ctx.fillStyle = spotGrad;
      ctx.fill();

      // Grain overlay
      ctx.globalAlpha = 0.12;
      ctx.globalCompositeOperation = "overlay";
      const pattern = ctx.createPattern(grainCanvas, "repeat");
      if (pattern) {
        ctx.save();
        ctx.translate(
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256)
        );
        ctx.fillStyle = pattern;
        ctx.fillRect(-256, -256, w + 512, h + 512);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      animFrameRef.current = requestAnimationFrame(animate);
    };

    if (!prefersReduced) {
      animate();
    } else {
      const dark = isDarkRef.current;
      ctx.fillStyle = dark ? "#09090b" : "#ffffff";
      ctx.fillRect(0, 0, w, h);

      if (dark) {
        const g1 = ctx.createRadialGradient(w * 0.4, h * 0.4, 0, w * 0.4, h * 0.4, w * 0.5);
        g1.addColorStop(0, "rgba(234,88,12,0.16)");
        g1.addColorStop(0.5, "rgba(234,88,12,0.05)");
        g1.addColorStop(1, "transparent");
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);

        const g2 = ctx.createRadialGradient(w * 0.65, h * 0.55, 0, w * 0.65, h * 0.55, w * 0.4);
        g2.addColorStop(0, "rgba(217,70,15,0.12)");
        g2.addColorStop(0.5, "rgba(194,65,12,0.04)");
        g2.addColorStop(1, "transparent");
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);

        ctx.globalAlpha = 0.12;
        ctx.globalCompositeOperation = "overlay";
        const pattern = ctx.createPattern(grainCanvas, "repeat");
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      section.removeEventListener("mousemove", handleMouse);
      section.removeEventListener("mouseleave", handleMouseLeave);
      observer.disconnect();
    };
  }, [prefersReduced]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={grainCanvasRef} className="hidden" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />

      {/* Vignette — dark mode only, hidden in light */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, var(--background) 100%)",
        }}
      />
    </div>
  );
}

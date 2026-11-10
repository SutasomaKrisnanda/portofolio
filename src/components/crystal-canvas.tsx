'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ModeId } from '@/data/portfolio-data';
import { useTheme } from '@/components/theme-provider';

interface IridescentCrystalCanvasProps {
  mode: ModeId;
  activeSlideIndex: number;
  baseHue: number;
  secondaryHue: number;
}

export const IridescentCrystalCanvas: React.FC<IridescentCrystalCanvasProps> = ({
  mode,
  activeSlideIndex,
  baseHue,
  secondaryHue
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef({ rx: 0.25, ry: 0.6, vx: 0.003, vy: 0.009 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const pulseRef = useRef(0);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === 'light';

  useEffect(() => {
    rotationRef.current.vy = 0.045;
    rotationRef.current.vx = 0.018;
    pulseRef.current = 1;
  }, [mode, activeSlideIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rings = [
      { y: -1.18, r: 0.0, segments: 1 },
      { y: -0.92, r: 0.56, segments: 8 },
      { y: -0.45, r: 0.92, segments: 12 },
      { y: 0.0, r: 1.04, segments: 12 },
      { y: 0.45, r: 0.92, segments: 12 },
      { y: 0.92, r: 0.56, segments: 8 },
      { y: 1.18, r: 0.0, segments: 1 }
    ];

    interface Vec3 {
      x: number;
      y: number;
      z: number;
    }

    const vertices: Vec3[] = [];
    const ringIndices: number[][] = [];

    rings.forEach((ring, rIdx) => {
      const indices: number[] = [];
      if (ring.segments === 1) {
        vertices.push({ x: 0, y: ring.y, z: 0 });
        indices.push(vertices.length - 1);
      } else {
        const offset = rIdx % 2 === 0 ? Math.PI / ring.segments : 0;
        for (let i = 0; i < ring.segments; i++) {
          const theta = (i / ring.segments) * Math.PI * 2 + offset;
          vertices.push({
            x: Math.cos(theta) * ring.r,
            y: ring.y,
            z: Math.sin(theta) * ring.r
          });
          indices.push(vertices.length - 1);
        }
      }
      ringIndices.push(indices);
    });

    const faces: [number, number, number, number][] = [];
    let seedCounter = 1;

    for (let r = 0; r < ringIndices.length - 1; r++) {
      const upper = ringIndices[r];
      const lower = ringIndices[r + 1];

      if (upper.length === 1) {
        for (let i = 0; i < lower.length; i++) {
          faces.push([upper[0], lower[(i + 1) % lower.length], lower[i], seedCounter++]);
        }
      } else if (lower.length === 1) {
        for (let i = 0; i < upper.length; i++) {
          faces.push([upper[i], upper[(i + 1) % upper.length], lower[0], seedCounter++]);
        }
      } else if (upper.length === lower.length) {
        for (let i = 0; i < upper.length; i++) {
          const u0 = upper[i];
          const u1 = upper[(i + 1) % upper.length];
          const l0 = lower[i];
          const l1 = lower[(i + 1) % lower.length];
          faces.push([u0, u1, l0, seedCounter++]);
          faces.push([u1, l1, l0, seedCounter++]);
        }
      } else {
        const maxLen = Math.max(upper.length, lower.length);
        for (let i = 0; i < maxLen; i++) {
          const u0 = upper[Math.floor((i * upper.length) / maxLen) % upper.length];
          const u1 = upper[Math.floor(((i + 1) * upper.length) / maxLen) % upper.length];
          const l0 = lower[Math.floor((i * lower.length) / maxLen) % lower.length];
          const l1 = lower[Math.floor(((i + 1) * lower.length) / maxLen) % lower.length];
          if (u0 !== u1) {
            faces.push([u0, u1, l0, seedCounter++]);
          }
          if (l0 !== l1) {
            faces.push([u1, l1, l0, seedCounter++]);
          }
        }
      }
    }

    let animId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 320;
      const height = canvas.clientHeight || 340;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      if (!isDraggingRef.current) {
        rotationRef.current.vy += (0.0075 - rotationRef.current.vy) * 0.05;
        rotationRef.current.vx += (0.002 - rotationRef.current.vx) * 0.05;
        rotationRef.current.ry += rotationRef.current.vy;
        rotationRef.current.rx = Math.sin(rotationRef.current.ry * 0.5) * 0.22;
      }
      if (pulseRef.current > 0.01) {
        pulseRef.current *= 0.92;
      }

      const cx = width * 0.5;
      const cy = height * 0.48 + Math.sin(rotationRef.current.ry * 1.4) * 4;
      const scale = Math.min(width, height) * 0.34 * (1 + pulseRef.current * 0.06);

      const shadowY = height * 0.86;
      const shadowGrad = ctx.createRadialGradient(cx, shadowY, 4, cx, shadowY, scale * 0.95);
      if (isLight) {
        shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.18)');
        shadowGrad.addColorStop(0.55, 'rgba(15, 23, 42, 0.06)');
        shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        shadowGrad.addColorStop(0, 'rgba(18, 10, 42, 0.72)');
        shadowGrad.addColorStop(0.55, 'rgba(42, 16, 78, 0.32)');
        shadowGrad.addColorStop(1, 'rgba(42, 16, 78, 0)');
      }
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(cx, shadowY, scale * 0.88, scale * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      const cosY = Math.cos(rotationRef.current.ry);
      const sinY = Math.sin(rotationRef.current.ry);
      const cosX = Math.cos(rotationRef.current.rx);
      const sinX = Math.sin(rotationRef.current.rx);
      const tiltZ = -0.18;
      const cosZ = Math.cos(tiltZ);
      const sinZ = Math.sin(tiltZ);

      const transformed = vertices.map((v) => {
        const x1 = v.x * cosY - v.z * sinY;
        const z1 = v.z * cosY + v.x * sinY;
        const y2 = v.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + v.y * sinX;
        const x3 = x1 * cosZ - y2 * sinZ;
        const y3 = y2 * cosZ + x1 * sinZ;

        const perspective = 3.6 / (3.6 - z2 * 0.65);
        return {
          x: x3,
          y: y3,
          z: z2,
          sx: cx + x3 * scale * perspective,
          sy: cy + y3 * scale * perspective
        };
      });

      const renderedFaces = faces.map(([i0, i1, i2, seed]) => {
        const v0 = transformed[i0];
        const v1 = transformed[i1];
        const v2 = transformed[i2];

        const ux = v1.x - v0.x;
        const uy = v1.y - v0.y;
        const uz = v1.z - v0.z;

        const vx = v2.x - v0.x;
        const vy = v2.y - v0.y;
        const vz = v2.z - v0.z;

        let nx = uy * vz - uz * vy;
        let ny = uz * vx - ux * vz;
        let nz = ux * vy - uy * vx;
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len;
        ny /= len;
        nz /= len;

        const avgZ = (v0.z + v1.z + v2.z) / 3;
        return { v0, v1, v2, nx, ny, nz, avgZ, seed };
      });

      renderedFaces.sort((a, b) => a.avgZ - b.avgZ);

      renderedFaces.forEach((f) => {
        const isFront = f.nz > -0.15;
        const light1 = Math.max(0, f.nx * -0.45 + f.ny * -0.65 + f.nz * 0.62);
        const light2 = Math.max(0, f.nx * 0.65 + f.ny * 0.35 + f.nz * 0.55);
        const rim = Math.pow(1 - Math.abs(f.nz), 2.2);

        const dispersionShift =
          Math.sin(f.seed * 1.7 + rotationRef.current.ry * 2.2) * 32 +
          f.nx * 36 +
          activeSlideIndex * 18;
        const hue =
          f.seed % 3 === 0
            ? (secondaryHue + dispersionShift + 360) % 360
            : (baseHue + dispersionShift + 360) % 360;

        const sat = isLight ? (isFront ? 65 : 45) : (isFront ? 78 + rim * 16 : 55);
        const lum = isLight
          ? (isFront ? Math.min(96, 68 + light1 * 26 + rim * 10) : 56 + light1 * 16)
          : (isFront ? Math.min(92, 38 + light1 * 42 + light2 * 20 + rim * 14) : 28 + light1 * 18);
        const alpha = isLight ? (isFront ? 0.82 : 0.35) : (isFront ? 0.9 : 0.38);

        ctx.beginPath();
        ctx.moveTo(f.v0.sx, f.v0.sy);
        ctx.lineTo(f.v1.sx, f.v1.sy);
        ctx.lineTo(f.v2.sx, f.v2.sy);
        ctx.closePath();

        const fGrad = ctx.createLinearGradient(f.v0.sx, f.v0.sy, f.v2.sx, f.v2.sy);
        fGrad.addColorStop(0, `hsla(${hue}, ${sat}%, ${lum}%, ${alpha})`);
        fGrad.addColorStop(
          1,
          `hsla(${(hue + 28) % 360}, ${sat}%, ${Math.max(isLight ? 45 : 22, lum - 14)}%, ${alpha})`
        );

        ctx.fillStyle = fGrad;
        ctx.fill();

        if (isLight) {
          ctx.strokeStyle = isFront
            ? `rgba(15, 23, 42, ${0.16 + light1 * 0.25})`
            : 'rgba(15, 23, 42, 0.08)';
        } else {
          ctx.strokeStyle = isFront
            ? `rgba(255, 255, 255, ${0.24 + light1 * 0.45})`
            : 'rgba(255, 255, 255, 0.1)';
        }
        ctx.lineWidth = isFront ? 1.05 : 0.5;
        ctx.stroke();
      });

      const flareX = cx + 6;
      const flareY = cy + scale * 1.04;
      const caustic = ctx.createRadialGradient(flareX, flareY, 1, flareX, flareY, 24);
      if (isLight) {
        caustic.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        caustic.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        caustic.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        caustic.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        caustic.addColorStop(0.5, 'rgba(255, 255, 255, 0.28)');
        caustic.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = caustic;
      ctx.beginPath();
      ctx.arc(flareX, flareY, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [baseHue, secondaryHue, activeSlideIndex, isLight]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) {
      rotationRef.current.vy += e.movementX * 0.00012;
      return;
    }
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    rotationRef.current.ry += dx * 0.012;
    rotationRef.current.rx = Math.max(-0.8, Math.min(0.8, rotationRef.current.rx + dy * 0.012));
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative flex items-center justify-center select-none">
      <div className="pointer-events-none absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full border border-slate-900/10 dark:border-white/20" />
      <div className="pointer-events-none absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border border-slate-900/5 dark:border-white/10" />

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="img"
        aria-label="Visualisasi Kristal 3D Interaktif - Geser kursor untuk memutar"
        title="Geser kursor untuk memutar Kristal 3D"
        className="w-[260px] h-[280px] sm:w-[330px] sm:h-[350px] cursor-grab active:cursor-grabbing relative z-10"
      />
    </div>
  );
};

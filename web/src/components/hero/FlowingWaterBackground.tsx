import { useEffect, useRef, useState } from 'react';

// Simple 2D simplex noise implementation
class SimplexNoise {
  private perm: number[];
  
  constructor(seed = Math.random()) {
    this.perm = [];
    for (let i = 0; i < 256; i++) {
      this.perm[i] = i;
    }
    // Fisher-Yates shuffle with seed
    let rng = seed;
    for (let i = 255; i > 0; i--) {
      rng = (rng * 9301 + 49297) % 233280;
      const j = Math.floor((rng / 233280) * (i + 1));
      [this.perm[i], this.perm[j]] = [this.perm[j], this.perm[i]];
    }
    // Duplicate for wrapping
    for (let i = 0; i < 256; i++) {
      this.perm[256 + i] = this.perm[i];
    }
  }

  private grad2(i: number, x: number, y: number): number {
    const h = i & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
  }

  noise2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);

    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;

    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    const gi0 = this.perm[ii + this.perm[jj]];
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]];

    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.grad2(gi0, x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.grad2(gi1, x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.grad2(gi2, x2, y2);
    }

    return 70 * (n0 + n1 + n2);
  }
}

interface FlowingWaterBackgroundProps {
  paused?: boolean;
}

export default function FlowingWaterBackground({ paused = false }: FlowingWaterBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const [isLowPerf, setIsLowPerf] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true, willReadFrequently: false });
    if (!ctx) return;

    // Check for low-end device
    const cores = navigator.hardwareConcurrency || 4;
    const isLowEnd = cores <= 4;
    setIsLowPerf(isLowEnd);

    // Initialize noise generators
    const noise1 = new SimplexNoise(12345);
    const noise2 = new SimplexNoise(67890);
    const noise3 = new SimplexNoise(11111);

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking with spring physics
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
      mouseRef.current.targetY = (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Check if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lastTime = 0;

    const render = (currentTime: number) => {
      frameRef.current = requestAnimationFrame(render);

      if (paused || document.hidden) {
        return;
      }

      // Convert to seconds for smoother timing
      const timeInSeconds = currentTime / 1000;
      
      // Use modulo for perfect looping - no jumps or resets
      const cycleTime = 20; // 20 second loop
      const time = timeInSeconds % cycleTime;
      const phase = (time / cycleTime) * Math.PI * 2;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Spring mouse position - smooth interpolation
      const springStrength = 0.08; // Reduced for smoother movement
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * springStrength;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * springStrength;

      // Layer 1: Deep base gradient with smooth breathing
      const breathe = Math.sin(phase * 0.5) * 0.1 + 0.9; // Gentle 0.8-1.0 pulse
      const centerX = width * (0.5 + Math.sin(phase * 0.3) * 0.1 + mouseRef.current.x * 0.08);
      const centerY = height * (0.4 + Math.cos(phase * 0.4) * 0.1 + mouseRef.current.y * 0.08);
      const radius = Math.max(width, height) * 1.6;

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, `rgba(26, 63, 95, ${breathe})`);
      gradient.addColorStop(0.35, `rgba(15, 45, 75, ${breathe * 0.95})`);
      gradient.addColorStop(0.65, `rgba(12, 39, 64, ${breathe * 0.9})`);
      gradient.addColorStop(1, `rgba(3, 11, 20, ${breathe * 0.85})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (prefersReducedMotion) {
        return;
      }

      // Layer 2: Smooth rotating angular gradient
      const angle = phase * 0.5; // Slower, smoother rotation
      const driftPulse = Math.sin(phase * 0.8) * 0.3 + 0.7; // Smooth 0.4-1.0 pulse
      
      const gradX1 = width / 2 + Math.cos(angle) * width * 1.2;
      const gradY1 = height / 2 + Math.sin(angle) * height * 1.2;
      const gradX2 = width / 2 - Math.cos(angle) * width * 1.2;
      const gradY2 = height / 2 - Math.sin(angle) * height * 1.2;

      const driftGradient = ctx.createLinearGradient(gradX1, gradY1, gradX2, gradY2);
      driftGradient.addColorStop(0, `rgba(77, 162, 255, ${0.25 * driftPulse})`);
      driftGradient.addColorStop(0.25, `rgba(26, 63, 95, ${0.35 * driftPulse})`);
      driftGradient.addColorStop(0.5, `rgba(90, 224, 229, ${0.2 * driftPulse})`);
      driftGradient.addColorStop(0.75, `rgba(15, 45, 65, ${0.3 * driftPulse})`);
      driftGradient.addColorStop(1, `rgba(77, 162, 255, ${0.28 * driftPulse})`);
      
      ctx.fillStyle = driftGradient;
      ctx.fillRect(0, 0, width, height);

      // Layer 3: Continuous flowing noise
      if (!isLowEnd) {
        const noiseScale = 0.002;
        // Use time directly for continuous movement
        const scrollX = timeInSeconds * 8;
        const scrollY = timeInSeconds * 5;
        
        const step = isLowEnd ? 20 : 12;
        const noisePulse = Math.sin(phase * 1.2) * 0.2 + 0.8;
        ctx.globalAlpha = 0.08 * noisePulse;
        
        for (let y = 0; y < height; y += step) {
          for (let x = 0; x < width; x += step) {
            const n1 = noise1.noise2D(x * noiseScale + scrollX, y * noiseScale);
            const n2 = noise2.noise2D(x * noiseScale, y * noiseScale + scrollY);
            const n3 = noise3.noise2D(x * noiseScale - scrollX * 0.5, y * noiseScale);
            const combined = (n1 + n2 + n3) / 3;
            
            if (combined > 0.1) {
              const intensity = (combined - 0.1) * 1.5;
              // Smooth hue cycling
              const hue = 195 + Math.sin(timeInSeconds * 0.3 + combined * 2) * 15;
              ctx.fillStyle = `hsla(${hue}, 65%, 55%, ${Math.min(intensity * 0.6, 0.4)})`;
              ctx.fillRect(x, y, step, step);
            }
          }
        }
        
        ctx.globalAlpha = 1;
      }

      // Layer 4: Smooth orbital glints
      const numGlints = isLowEnd ? 3 : 5;
      
      for (let i = 0; i < numGlints; i++) {
        // Stagger each glint's phase
        const glintPhase = phase + (i * Math.PI * 2) / numGlints;
        
        // Smooth elliptical orbit
        const orbitX = 0.5 + Math.cos(glintPhase * 0.6) * 0.32;
        const orbitY = 0.5 + Math.sin(glintPhase * 0.8) * 0.25;
        
        const cx = width * orbitX;
        const cy = height * orbitY;
        
        // Smooth pulsing
        const glintPulse = Math.sin(glintPhase * 1.5) * 0.4 + 0.6; // 0.2-1.0
        const size = (90 + Math.sin(glintPhase * 1.3) * 40) * glintPulse;
        
        ctx.globalAlpha = 0.15 * glintPulse;
        
        const glint = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
        glint.addColorStop(0, 'rgba(90, 224, 229, 0.85)');
        glint.addColorStop(0.35, 'rgba(77, 162, 255, 0.55)');
        glint.addColorStop(0.65, 'rgba(26, 63, 95, 0.25)');
        glint.addColorStop(1, 'rgba(77, 162, 255, 0)');
        
        ctx.fillStyle = glint;
        ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
      }
      
      ctx.globalAlpha = 1;

      // Layer 5: Subtle vignette
      const vignette = ctx.createRadialGradient(
        width / 2, 
        height / 2, 
        0, 
        width / 2, 
        height / 2, 
        Math.max(width, height) * 0.75
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.75, 'rgba(0, 0, 0, 0.05)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    // Start the animation loop with RAF timestamp
    frameRef.current = requestAnimationFrame(render);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [paused]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: isLowPerf ? 0.9 : 1 }}
      aria-hidden="true"
    />
  );
}
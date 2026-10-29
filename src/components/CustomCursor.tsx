'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Hardware coords (0ms latency for inner dot)
  const dotRef = useRef<HTMLDivElement>(null);
  // Outer ring tracking element
  const ringRef = useRef<HTMLDivElement>(null);

  const targetCoords = useRef({ x: -100, y: -100 });
  const ringCoords = useRef({ x: -100, y: -100 });
  const ringVelocity = useRef({ x: 0, y: 0 });
  const magneticTarget = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Only enable on pointer/desktop devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      targetCoords.current = { x: e.clientX, y: e.clientY };

      // Update inner dot immediately (0ms hardware latency)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 3.5}px, ${e.clientY - 3.5}px, 0)`;
      }

      // Check if hovering over interactive element
      const target = e.target as HTMLElement | null;
      const interactiveEl = target?.closest('button, a, input, textarea, select, [role="button"], [data-interactive="true"]');

      if (interactiveEl) {
        setIsHoveringInteractive(true);
        const rect = interactiveEl.getBoundingClientRect();
        // Magnetic spring snap to geometric center
        magneticTarget.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      } else {
        setIsHoveringInteractive(false);
        magneticTarget.current = null;
      }
    };

    const onMouseDown = () => setIsPressed(true);
    const onMouseUp = () => setIsPressed(false);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    // Physics loop for outer ring with damping: 24, stiffness: 260
    let animationFrameId: number;
    let lastTime = performance.now();

    const updatePhysics = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const destX = magneticTarget.current ? magneticTarget.current.x : targetCoords.current.x;
      const destY = magneticTarget.current ? magneticTarget.current.y : targetCoords.current.y;

      // Spring constants
      const stiffness = 260;
      const damping = 24;

      const forceX = (destX - ringCoords.current.x) * stiffness;
      const forceY = (destY - ringCoords.current.y) * stiffness;

      ringVelocity.current.x = (ringVelocity.current.x + forceX * dt) / (1 + damping * dt);
      ringVelocity.current.y = (ringVelocity.current.y + forceY * dt) / (1 + damping * dt);

      ringCoords.current.x += ringVelocity.current.x * dt;
      ringCoords.current.y += ringVelocity.current.y * dt;

      if (ringRef.current) {
        const ringSize = isHoveringInteractive ? 40 : 24;
        const currentScale = isPressed ? 0.85 : 1.0;
        const radiusOffset = ringSize / 2;

        ringRef.current.style.transform = `translate3d(${ringCoords.current.x - radiusOffset}px, ${ringCoords.current.y - radiusOffset}px, 0) scale(${currentScale})`;
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, isHoveringInteractive, isPressed]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden">
      {/* Outer Floating Friction Ring */}
      <div
        ref={ringRef}
        className={`absolute rounded-full transition-[width,height,background-color,border-color] duration-150 ease-out will-change-transform ${
          isHoveringInteractive
            ? 'h-[40px] w-[40px] border border-black/40 bg-black/[0.05]'
            : 'h-[24px] w-[24px] border border-black/25 bg-transparent'
        }`}
        style={{ pointerEvents: 'none' }}
      />

      {/* Inner 7px Hardware Dot */}
      <div
        ref={dotRef}
        className={`absolute h-[7px] w-[7px] rounded-full bg-[#000000] will-change-transform ${
          isHoveringInteractive ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{
          transition: 'transform 120ms ease-out, opacity 120ms ease-out',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

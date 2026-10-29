'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const coords = useRef({ x: -100, y: -100 });
  const velocity = useRef({ x: 0, y: 0 });
  const currentTilt = useRef(-15); // Resting angle: tilted to the left

  useEffect(() => {
    // Check if on touch/coarse pointer
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let lastMouseX = -100;
    let lastMouseY = -100;
    let lastTime = performance.now();

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);

      const now = performance.now();
      const dt = Math.max(0.001, (now - lastTime) / 1000);
      lastTime = now;

      // Calculate instant velocity for macOS-like kinetic tilt
      const vx = (e.clientX - lastMouseX) / dt;
      velocity.current.x = vx;

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      coords.current = { x: e.clientX, y: e.clientY };

      // Update position immediately with zero input latency
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => setIsPressed(true);
    const onMouseUp = () => setIsPressed(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth 60fps physics loop for macOS-like dynamic angle lean
    let animationFrameId: number;
    const animateCursor = () => {
      // Dynamic tilt: base is -15deg (left tilted), moving left tilts more (-24deg), moving right straightens (-6deg)
      const targetTilt = -15 + Math.max(-10, Math.min(10, velocity.current.x * 0.006));
      // Damp velocity
      velocity.current.x *= 0.88;

      // Smooth interpolation for tilt
      currentTilt.current += (targetTilt - currentTilt.current) * 0.18;

      if (cursorRef.current) {
        const svgElement = cursorRef.current.querySelector('svg');
        if (svgElement) {
          const scale = isPressed ? 0.9 : 1.0;
          svgElement.style.transform = `rotate(${currentTilt.current}deg) scale(${scale})`;
        }
      }

      animationFrameId = requestAnimationFrame(animateCursor);
    };

    animationFrameId = requestAnimationFrame(animateCursor);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, isPressed]);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[999999] will-change-transform"
      style={{
        transform: `translate3d(${coords.current.x}px, ${coords.current.y}px, 0)`,
        pointerEvents: 'none',
      }}
    >
      {/* High-DPI Sharp Black Cursor Arrow from uploaded image, Left Tilted, macOS Kinetic Motion */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="will-change-transform origin-top-left transition-[filter] duration-75"
        style={{
          transformOrigin: '2px 2px',
          transform: `rotate(${currentTilt.current}deg)`,
          filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.25))',
        }}
      >
        <path
          d="M2.5 1.5L2.5 20.5L7.5 15.5L12 23L14.8 21.5L10.3 14.5L16.5 14.5L2.5 1.5Z"
          fill="#09090B"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

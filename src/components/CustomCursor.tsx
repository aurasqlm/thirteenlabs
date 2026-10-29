'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const coords = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      coords.current = { x: e.clientX, y: e.clientY };

      // Instant 0ms hardware coordinates tracking
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

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

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
      {/* Exact arrow pointer from the user image: Straight vertical left edge, NO bottom stem, NO rotation */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="will-change-transform transition-transform duration-75 origin-top-left"
        style={{
          transform: isPressed ? 'scale(0.92)' : 'none',
          filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.35))',
        }}
      >
        <path
          d="M 3 2 L 3 22 L 9 16 L 18 16 Z"
          fill="#09090B"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="miter"
        />
      </svg>
    </div>
  );
}

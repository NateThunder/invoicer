import React, { useEffect, useId, useRef, useState } from 'react';
import { TabsTrigger } from '@/components/ui/tabs';

const HOLD_DELAY = 500;

const isMobileViewport = () => (
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(max-width: 639px)').matches
);

export default function MobileIconTab({ value, label, icon: Icon, onShortPress }) {
  const [showLabel, setShowLabel] = useState(false);
  const holdTimer = useRef(null);
  const held = useRef(false);
  const startPoint = useRef(null);
  const tooltipId = useId();

  const clearHold = () => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setShowLabel(false);
  };

  useEffect(() => () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
  }, []);

  const handlePointerDown = (event) => {
    if (!isMobileViewport() || event.pointerType === 'mouse') return;

    event.preventDefault();
    held.current = false;
    startPoint.current = { x: event.clientX, y: event.clientY };
    clearHold();
    holdTimer.current = window.setTimeout(() => {
      held.current = true;
      setShowLabel(true);
    }, HOLD_DELAY);
  };

  const handlePointerMove = (event) => {
    if (!startPoint.current || held.current) return;

    const distance = Math.hypot(
      event.clientX - startPoint.current.x,
      event.clientY - startPoint.current.y,
    );

    if (distance > 10) {
      startPoint.current = null;
      clearHold();
    }
  };

  const handlePointerUp = (event) => {
    if (!isMobileViewport() || event.pointerType === 'mouse' || !startPoint.current) return;

    event.preventDefault();
    const wasHeld = held.current;
    startPoint.current = null;
    held.current = false;
    clearHold();

    if (!wasHeld) onShortPress(value);
  };

  const handlePointerCancel = () => {
    startPoint.current = null;
    held.current = false;
    clearHold();
  };

  return (
    <TabsTrigger
      value={value}
      aria-label={label}
      aria-describedby={showLabel ? tooltipId : undefined}
      className="relative min-w-0 flex-1 touch-manipulation select-none gap-1.5 px-2 text-xs sm:min-w-24 sm:px-3"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      onContextMenu={(event) => {
        if (isMobileViewport()) event.preventDefault();
      }}
    >
      <Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
      {showLabel && (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-md sm:hidden"
        >
          {label}
        </span>
      )}
    </TabsTrigger>
  );
}

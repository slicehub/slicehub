// src/hooks/useSwipeGesture.ts
import { useRef, useCallback, useEffect } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 100,
}: SwipeOptions) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const isDragging = useRef(false);

  // --- Touch Events (Mobile) ---
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    isDragging.current = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !startX.current || !startY.current) return;

    // We do NOT preventDefault here anymore to avoid "sticky" vertical scrolling.
    // Let the browser decide if it's a scroll or not.
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || !startX.current || startY.current === null)
        return;

      const touch = e.changedTouches[0];
      const deltaX = startX.current - touch.clientX;
      const deltaY = startY.current - touch.clientY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // STRICTER CHECK:
      // 1. Must be longer than minSwipeDistance
      // 2. Horizontal movement must be at least 2x the Vertical movement
      //    This ensures we ignore "diagonal" scrolling.
      if (absX > minSwipeDistance && absX > absY * 2) {
        if (deltaX > 0) {
          // Swipe Left -> Next
          onSwipeLeft?.();
        } else {
          // Swipe Right -> Back
          onSwipeRight?.();
        }
      }

      resetState();
    },
    [minSwipeDistance, onSwipeLeft, onSwipeRight],
  );

  // --- Mouse Events (For testing on Desktop) ---
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isDragging.current = true;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    // Optional: Only prevent default on mouse to stop text selection while dragging
    // e.preventDefault();
  }, []);

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current || !startX.current || startY.current === null)
        return;

      const deltaX = startX.current - e.clientX;
      const deltaY = startY.current - e.clientY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > minSwipeDistance && absX > absY * 2) {
        if (deltaX > 0) onSwipeLeft?.();
        else onSwipeRight?.();
      }

      resetState();
    },
    [minSwipeDistance, onSwipeLeft, onSwipeRight],
  );

  const resetState = () => {
    startX.current = null;
    startY.current = null;
    isDragging.current = false;
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => (isDragging.current = false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave: onMouseUp,
    },
  };
}

import { useRef, useCallback, useEffect } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void; // Called when swiping LEFT (Navigating to next/right page)
  onSwipeRight?: () => void; // Called when swiping RIGHT (Navigating to prev/left page)
  minSwipeDistance?: number;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50,
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
    if (!isDragging.current || !startX.current) return;
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startX.current);
    const deltaY = Math.abs(touch.clientY - (startY.current || 0));

    // Prevent vertical scrolling if movement is primarily horizontal
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || !startX.current || startY.current === null)
        return;

      const touch = e.changedTouches[0];
      const deltaX = startX.current - touch.clientX;
      const deltaY = startY.current - touch.clientY;

      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        if (deltaX > 0) {
          // Swipe Left -> Next Page
          onSwipeLeft?.();
        } else {
          // Swipe Right -> Prev Page
          onSwipeRight?.();
        }
      }

      resetState();
    },
    [minSwipeDistance, onSwipeLeft, onSwipeRight],
  );

  // --- Mouse Events (Desktop Testing) ---
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isDragging.current = true;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
  }, []);

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current || !startX.current || startY.current === null)
        return;

      const deltaX = startX.current - e.clientX;
      const deltaY = startY.current - e.clientY;

      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        if (deltaX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
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

  // Cleanup global listeners if any
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

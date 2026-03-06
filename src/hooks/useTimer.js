import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialMinutes = 25) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 || !isActive) {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, seconds]);

  const toggle = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const reset = useCallback((newMinutes = initialMinutes) => {
    setIsActive(false);
    setSeconds(newMinutes * 60);
  }, [initialMinutes]);

  const formatTime = useCallback(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [seconds]);

  return {
    seconds,
    isActive,
    toggle,
    reset,
    formatTime
  };
};

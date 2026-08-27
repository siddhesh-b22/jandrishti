import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  end: number;
  start?: number;
  duration?: number; // in milliseconds (default: 1000ms)
  decimals?: number;
  prefix?: string;
  suffix?: string;
  trigger?: boolean;
}

export const useCountUp = ({
  end,
  start = 0,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  trigger = true,
}: UseCountUpOptions): string => {
  const [value, setValue] = useState<number>(start);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !trigger) {
      setValue(end);
      return;
    }

    let isMounted = true;
    startTimeRef.current = null;

    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const current = start + (end - start) * easedProgress;

      if (isMounted) {
        setValue(current);
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        if (isMounted) setValue(end);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      isMounted = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, start, duration, trigger]);

  const formattedNumber = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-IN');

  return `${prefix}${formattedNumber}${suffix}`;
};

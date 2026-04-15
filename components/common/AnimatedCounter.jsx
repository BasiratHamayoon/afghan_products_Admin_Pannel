"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({ value = 0, duration = 1200, prefix = "", suffix = "", decimals = 0, className = "" }) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const frameRef = useRef(null);
  const numericValue = parseFloat(value) || 0;

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * numericValue);
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [numericValue, duration]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
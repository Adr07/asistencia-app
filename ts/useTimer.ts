import { useState, useRef, useEffect } from "react";

export function useTimer(step: string) {
  const [timer, setTimer] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === "checked_in" || step === "before_checkout") {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setTimer((prev) => prev + 1);
        }, 1000) as unknown as NodeJS.Timeout;
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (step === "checked_out" || step === "welcome") {
        setTimer(0);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [step]);

  // Formatear el contador a HH:mm:ss
  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return { timer, setTimer, formatTimer };
}

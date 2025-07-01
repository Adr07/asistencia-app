import { useState } from "react";

export function useProgress() {
  const [progress, setProgress] = useState<number | undefined>(undefined);
  function safeSetProgress(val: any) {
    if (val && typeof val === 'object' && val.nativeEvent) return; // Ignorar eventos
    // Permitir solo números válidos o vacío
    if (val === '' || val === undefined || val === null) {
      setProgress(undefined);
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) setProgress(num);
  }
  return { progress, setProgress: safeSetProgress };
}

import { useState } from "react";

export function useAvance() {
  const [avance, setAvance] = useState<number | undefined>(undefined);
  function safeSetAvance(val: any) {
    if (val && typeof val === 'object' && val.nativeEvent) return; // Ignorar eventos
    // Permitir solo números válidos o vacío
    if (val === '' || val === undefined || val === null) {
      setAvance(undefined);
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) setAvance(num);
  }
  return { avance, setAvance: safeSetAvance };
}

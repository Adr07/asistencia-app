import { useState } from "react";

export function useObservaciones() {
  const [observaciones, setObservaciones] = useState<string>("");
  function safeSetObservaciones(val: any) {
    if (val && typeof val === 'object' && val.nativeEvent) return; // Ignorar eventos
    setObservaciones(val);
  }
  return { observaciones, setObservaciones: safeSetObservaciones };
}

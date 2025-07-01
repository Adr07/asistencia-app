import { useState } from "react";

export function useDescription() {
  const [description, setDescription] = useState<string>("");
  function safeSetDescription(val: any) {
    if (val && typeof val === 'object' && val.nativeEvent) return; // Ignorar eventos
    setDescription(val);
  }
  return { description, setDescription: safeSetDescription };
}

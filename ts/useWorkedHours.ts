import { useState } from "react";

export function useWorkedHours() {
  const [workedHours, setWorkedHours] = useState<string>("");
  const [fullTime, setFullTime] = useState<string>("");
  return { workedHours, setWorkedHours, fullTime, setFullTime };
}

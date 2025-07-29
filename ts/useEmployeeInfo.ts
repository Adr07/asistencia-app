import { useEffect, useState } from "react";
import { getEmployeeInfo } from '../db/odooApi';

export interface EmployeeInfo {
  bolsa_horas_numero: number | null;
  remaining_leaves: number | null;
}

export function useEmployeeInfo(uid: number, pass: string): EmployeeInfo | null {
  const [info, setInfo] = useState<EmployeeInfo | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const info = await getEmployeeInfo({ uid, pass });
        if (info && typeof info === 'object') {
          setInfo({
            bolsa_horas_numero: info.bolsa_horas_numero ?? null,
            remaining_leaves: info.remaining_leaves ?? null,
          });
        } else {
          setInfo(null);
        }
      } catch {
        setInfo(null);
      }
    }
    if (uid && pass) fetchInfo();
  }, [uid, pass]);

  return info;
}

import { useEffect, useState } from "react";
import { DB, RPC_URL } from "../components/AttendanceKiosk/otros/config";
import { rpcCall } from "../components/AttendanceKiosk/otros/rpc";

export interface EmployeeInfo {
  bolsa_horas_numero: number | null;
  remaining_leaves: number | null;
}

export function useEmployeeInfo(uid: number, pass: string): EmployeeInfo | null {
  const [info, setInfo] = useState<EmployeeInfo | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const empleados: any[] = await rpcCall(
          "object",
          "execute_kw",
          [DB, uid, pass, "hr.employee", "search_read", [[['user_id', '=', uid]]], { fields: ["bolsa_horas_numero", "remaining_leaves"], limit: 1 }],
          RPC_URL
        );
        if (empleados && Array.isArray(empleados) && empleados.length > 0) {
          setInfo({
            bolsa_horas_numero: empleados[0].bolsa_horas_numero ?? null,
            remaining_leaves: empleados[0].remaining_leaves ?? null,
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

import { useEffect, useState } from "react";
import { DB } from "../components/AttendanceKiosk/otros/config";

export interface EmployeeInfo {
  bolsa_horas_numero: number | null;
  remaining_leaves: number | null;
}

export function useEmployeeInfo(uid: number, pass: string): EmployeeInfo | null {
  const [info, setInfo] = useState<EmployeeInfo | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const response = await fetch("http://localhost:3001/odoo/get_employee_info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ db: DB, uid, password: pass })
        });
        if (!response.ok) throw new Error("Error en backend get_employee_info: " + response.statusText);
        const data = await response.json();
        const empleados = data.result;
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

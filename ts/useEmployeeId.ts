import { odooRead } from "../db/odooApi";

export function useEmployeeId(uid: number, pass: string) {
  const fetchEmployeeId = async () => {
    const empleados = (await odooRead({
      model: "hr.employee",
      fields: ["id"],
      domain: [["resource_id.user_id", "=", uid]],
      uid,
      pass,
      limit: 1,
    })) as any[];
    if (!empleados.length) throw new Error("Empleado no encontrado");
    return empleados[0].id;
  };
  return fetchEmployeeId;
}

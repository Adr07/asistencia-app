
import { DB, RPC_URL } from "./../components/AttendanceKiosk/otros/config";
import { rpcCall } from "./../components/AttendanceKiosk/otros/rpc";
export function useEmployeeId(uid: number, pass: string) {
  const fetchEmployeeId = async () => {
    const empleados = (await rpcCall(
      'object',
      'execute_kw',
      [
        DB,
        uid,
        pass,
        'hr.employee',
        'search_read',
        [[['resource_id.user_id', '=', uid]]],
        { fields: ['id'], limit: 1 }
      ],
      RPC_URL
    )) as any[];
    if (!empleados.length) throw new Error("Empleado no encontrado");
    return empleados[0].id;
  };
  return fetchEmployeeId;
}

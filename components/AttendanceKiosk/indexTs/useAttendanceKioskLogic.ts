import { useState, useEffect, useCallback } from "react";
import { rpcCall } from "../otros/rpc";
import { RPC_URL, DB } from "../otros/config";

/**
 * Hook para obtener y mantener el nombre e inicial del usuario desde Odoo.
 * Devuelve { userName, userInitial }.
 */
export function useUserName(uid: number, pass: string) {
  const [userName, setUserName] = useState<string>("Cargando...");
  const [userInitial, setUserInitial] = useState<string>("A");

  useEffect(() => {
    async function fetchUserName() {
      try {
        const recs: any[] = await rpcCall(
          "object",
          "execute_kw",
          [DB, uid, pass, "res.users", "read", [uid], { fields: ["name"] }],
          RPC_URL
        );
        if (recs && recs[0] && recs[0].name) {
          setUserName(recs[0].name);
          setUserInitial(recs[0].name.charAt(0).toUpperCase());
        } else {
          setUserName("Usuario");
          setUserInitial("U");
        }
      } catch {
        setUserName("Usuario");
        setUserInitial("U");
      }
    }
    fetchUserName();
  }, [uid, pass]);

  return { userName, userInitial };
}

/**
 * Hook para manejar el estado temporal de cambio de tarea/proyecto y sus setters protegidos.
 * Devuelve los valores y setters para pendingProject, pendingTask, lastDescription, lastProgress,
 * y los setters protegidos safeSetPendingProject/safeSetPendingTask.
 */
export function usePendingTaskState() {
  const [pendingProject, setPendingProject] = useState<any>(null);
  const [pendingTask, setPendingTask] = useState<any>(null);
  const [lastDescription, setLastDescription] = useState<string>("");
  const [lastProgress, setLastProgress] = useState<string>("");
  const [lastProject, setLastProject] = useState<any>(null);
  const [lastTask, setLastTask] = useState<any>(null);

  // Setters protegidos para evitar SyntheticEvent
  const safeSetPendingProject = useCallback((val: any) => {
    if (val && typeof val === "object" && val.nativeEvent) return;
    setPendingProject(val);
  }, []);
  const safeSetPendingTask = useCallback((val: any) => {
    if (val && typeof val === "object" && val.nativeEvent) return;
    setPendingTask(val);
  }, []);

  return {
    pendingProject,
    setPendingProject,
    pendingTask,
    setPendingTask,
    lastDescription,
    setLastDescription,
    lastProgress,
    setLastProgress,
    lastProject,
    setLastProject,
    lastTask,
    setLastTask,
    safeSetPendingProject,
    safeSetPendingTask,
  };
}

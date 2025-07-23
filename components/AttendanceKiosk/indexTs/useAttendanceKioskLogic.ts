
import { useCallback, useEffect, useState } from "react";
import { getPedirAvance } from '../../../db/odooApi';
import { DB } from "../otros/config";

// Custom hook para pedir avance
export function usePedirAvanceMsg(uid: number, pass: string) {
  const [pedirAvanceMsg, setPedirAvanceMsg] = useState<string>("no");
  useEffect(() => {
    async function fetchPedirAvance() {
      try {
        if (uid && pass) {
          const msg = await getPedirAvance({ uid, pass });
          if (msg === 'no') {
            console.log('[usePedirAvanceMsg] Valor devuelto por getPedirAvance: no');
          } else {
            console.log('[usePedirAvanceMsg] Valor devuelto por getPedirAvance:', msg);
          }
          setPedirAvanceMsg(typeof msg === 'string' ? msg : String(msg));
        }
      } catch (e) {
        setPedirAvanceMsg("no");
      }
    }
    fetchPedirAvance();
  }, [uid, pass]);
  return pedirAvanceMsg;
}

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
        const response = await fetch("http://localhost:3001/odoo/get_user_name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ db: DB, uid, password: pass })
        });
        if (!response.ok) throw new Error("Error en backend get_user_name: " + response.statusText);
        const data = await response.json();
        if (data && data.userName) {
          setUserName(data.userName);
          setUserInitial(data.userInitial);
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
    if (val && typeof val === "object" && val.nativeEvent) {
      return;
    }
    setPendingProject(val);
  }, []);
  const safeSetPendingTask = useCallback((val: any) => {
    if (val && typeof val === "object" && val.nativeEvent) {
      return;
    }
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

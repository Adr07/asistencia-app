import { useEffect, useState } from 'react';
import { DB, RPC_URL } from '../components/AttendanceKiosk/otros/config';
import { rpcCall } from '../components/AttendanceKiosk/otros/rpc';
import { showMessage } from '../components/AttendanceKiosk/otros/util';

export function useProjectTaskDropdownsLogic(uid: number, pass: string, selectedProject: any, currentTask: any) {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    if (uid == null || pass == null || pass === "") {
      return;
    }
    async function fetchProjects() {
      setLoading(true);
      try {
        const res = await rpcCall<any[]>(
          'object', 'execute_kw',
          [
            DB,
            uid,
            pass,
            'project.project',
            'search_read',
            [[['active', '=', true]]],
            { fields: ['id', 'name'] }
          ],
          RPC_URL
        );
        if (res && Array.isArray(res)) {
          // Filtro frontend para excluir proyecto interno
          const filtrados = res.filter(
            p => p.id !== 1 && !(p.name?.toLowerCase().includes('interno'))
          );
          setProyectos(filtrados);
        }
      } catch (error) {
        showMessage('Error al cargar proyectos');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [uid, pass]);

  // Cargar tareas cuando se selecciona un proyecto
  useEffect(() => {
    if (!selectedProject?.id || uid == null || pass == null) {
      setTareas([]);
      return;
    }
    async function fetchTasks() {
      setLoadingTasks(true);
      try {
        const res = await rpcCall<any[]>(
          'object', 'execute_kw',
          [
            DB,
            uid,
            pass,
            'project.task',
            'search_read',
            [[
              ['project_id', '=', selectedProject.id],
              ['active', '=', true]
            ]],
            { fields: ['id', 'name', 'stage_id'] }
          ],
          RPC_URL
        );
        if (res && Array.isArray(res)) {
          // Filtrar tareas completadas
          const activeTasks = res.filter(task => {
            const isDone = task.stage_id && task.stage_id[1] &&
              (task.stage_id[1].toLowerCase().includes('completado') || 
               task.stage_id[1].toLowerCase().includes('closed'));
            return !isDone;
          });
          setTareas(activeTasks);
        }
      } catch (error) {
        showMessage('Error al cargar tareas');
      } finally {
        setLoadingTasks(false);
      }
    }
    fetchTasks();
  }, [selectedProject?.id, uid, pass]);

  // Filtrar tareas para no mostrar la actual como opción
  const availableTasks = tareas.filter(task => !currentTask || currentTask.id !== task.id);

  return {
    proyectos,
    tareas,
    availableTasks,
    loading,
    loadingTasks,
    setProyectos,
    setTareas
  };
}

// Stub temporal para getProjectActivities
import { useEffect, useState } from 'react';
import { showMessage } from '../components/AttendanceKiosk/otros/util';
async function getProjectActivities({ uid, pass, project_id }: { uid: number; pass: string; project_id: number }): Promise<any[]> {
  // Devuelve un array vacío para evitar errores
  return [];
}
// import { getEmployeeAllProjects } from '../db/odooApi';

// Stub temporal para getEmployeeAllProjects
async function getEmployeeAllProjects({ uid, pass }: { uid: number; pass: string }): Promise<any[]> {
  // Devuelve un array vacío para evitar errores
  return [];
}

export function useProjectTaskDropdownsLogic(uid: number, pass: string, selectedProject: any, currentTask: any) {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
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
        const res = await getEmployeeAllProjects({ uid, pass });
        if (res && Array.isArray(res)) {
          setProyectos(res);
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
      setActividades([]);
      return;
    }
    async function fetchActivities() {
      setLoadingTasks(true);
      try {
        // Permitir project_id 1 (Interno) y cualquier otro
        const res = await getProjectActivities({ uid, pass, project_id: selectedProject.id });
        if (res && Array.isArray(res)) {
          setActividades(res);
        }
      } catch (error) {
        showMessage('Error al cargar actividades');
      } finally {
        setLoadingTasks(false);
      }
    }
    fetchActivities();
  }, [selectedProject?.id, uid, pass]);

  // Filtrar tareas para no mostrar la actual como opción

  // Filtrar actividades para no mostrar la actual como opción
  const availableActivities = actividades.filter(act => !currentTask || currentTask.id !== act.id);

  return {
    proyectos,
    actividades,
    availableActivities,
    loading,
    loadingTasks,
    setProyectos,
    setActividades
  };
}

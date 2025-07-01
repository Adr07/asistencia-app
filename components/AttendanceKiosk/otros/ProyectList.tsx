import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { rpcCall } from './rpc';
import { RPC_URL, DB } from './config';
import { showMessage } from './util';
import { ProyectListStyles } from './PoryectListSytyle';

interface ProyectListProps {
  uid: number;
  pass: string;
  onSelectProject: (proyecto: any) => void;
  selectedProject: any;
  onSelectTask: (tarea: any) => void;
  selectedTask: any;
  hideTitle?: boolean;
}

export default function ProyectList({ uid, pass, onSelectProject, selectedProject, onSelectTask, selectedTask, hideTitle }: ProyectListProps) {
  // console.log('[DEBUG][ProyectList] Render', { uid, pass, selectedProject, selectedTask });

  const [proyectos, setProyectos] = useState<any[]>([]);
  const [tareas, setTareas] = useState<{ [key: number]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState<number | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    // Validación: uid y pass deben estar definidos y válidos
    if (uid == null || pass == null || pass === "") {
      console.warn("[ProyectList] uid o pass no definidos. No se consulta Odoo.", { uid, pass });
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
            [ [] ],
            { fields: ['id', 'name'], limit: 100 }
          ],
          RPC_URL
        );
        setProyectos(res);
      } catch (error: any) {
        showMessage('Error', error.message);
        // También imprimir en consola para depuración
        console.error('Odoo fetchProjects error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [uid, pass]);

  // Mover fetchTasks fuera del useEffect para que esté disponible globalmente
  async function fetchTasks(projectId: number) {
    setLoadingTasks(projectId);
    console.log('[DEBUG][fetchTasks] solicitando tareas para proyecto', projectId);
    try {
      const res = await rpcCall<any[]>(
        'object', 'execute_kw',
        [
          DB,
          uid,
          pass,
          'project.task',
          'search_read',
          [ [ ['project_id', '=', projectId] ] ],
          { fields: ['id', 'name', 'stage_id', 'progress'], limit: 100 }
        ],
        RPC_URL
      );
      console.log('[DEBUG][fetchTasks] resultado Odoo:', res);
      setTareas(prev => ({ ...prev, [projectId]: res }));
    } catch (error: any) {
      showMessage('Error', error.message);
      console.error('[DEBUG][fetchTasks] error Odoo:', error);
    } finally {
      setLoadingTasks(null);
    }
  }

  // useEffect para cargar tareas cuando cambia el proyecto seleccionado
  useEffect(() => {
    if (selectedProject && !tareas[selectedProject.id]) {
      fetchTasks(selectedProject.id);
    }
  }, [selectedProject, uid, pass, tareas]);

  // Filtrar proyectos para excluir el proyecto interno (id 1 o nombre que contenga "interno")
  const proyectosFiltrados = proyectos.filter(
    (proyecto) => proyecto.id !== 1 && !(proyecto.name?.toLowerCase().includes("interno"))
  );

  // Handler para selección de proyecto
  const handleSelectProject = (proyecto: any) => {
    onSelectProject(proyecto);
  };

  // Handler para selección de tarea
  const handleSelectTask = (tarea: any) => {
    onSelectTask(tarea);
  };

  // Handler para expandir/plegar proyectos
  const toggleProject = (projectId: number) => {
    setExpandedProjects(prev => {
      const expanded = !prev[projectId];
      // Si se va a expandir y no hay tareas, cargarlas
      if (expanded && !tareas[projectId]) {
        fetchTasks(projectId);
      }
      return { ...prev, [projectId]: expanded };
    });
  };

  // Debug para ver qué proyecto/tarea se selecciona
  React.useEffect(() => {
    console.log('[DEBUG][ProyectList] selectedProject:', selectedProject);
    console.log('[DEBUG][ProyectList] selectedTask:', selectedTask);
  }, [selectedProject, selectedTask]);

  return (
    <View style={ProyectListStyles.container}>
      {!hideTitle && (
        <Text style={ProyectListStyles.title}>Selecciona un proyecto y una tarea</Text>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <ScrollView>
          {proyectosFiltrados.length === 0 ? (
            <Text style={ProyectListStyles.emptyText}>No hay proyectos para mostrar.</Text>
          ) : (
            proyectosFiltrados.map((proyecto) => (
              <View key={proyecto.id}>
                <TouchableOpacity
                  style={[
                    ProyectListStyles.projectItem,
                    selectedProject && selectedProject.id === proyecto.id && ProyectListStyles.selectedItem
                  ]}
                  onPress={() => {
                    handleSelectProject(proyecto); // Selecciona el proyecto
                    toggleProject(proyecto.id);    // Expande/colapsa
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={ProyectListStyles.projectName}>{proyecto.name} {expandedProjects[proyecto.id] ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {/* Mostrar tareas solo si este proyecto está expandido */}
                {expandedProjects[proyecto.id] && (
                  <View style={ProyectListStyles.taskList}>
                    {loadingTasks === proyecto.id ? (
                      <ActivityIndicator size="small" color="#007bff" />
                    ) : (
                      (tareas[proyecto.id]?.length > 0 ? (
                        tareas[proyecto.id].map((tarea) => {
                          // Detectar tarea completada por stage_id (completado)
                          const isDone = tarea.stage_id && tarea.stage_id[1] &&
                            (tarea.stage_id[1].toLowerCase().includes('completado') || tarea.stage_id[1].toLowerCase().includes('closed'));
                          return (
                            <TouchableOpacity
                              key={tarea.id}
                              style={[
                                ProyectListStyles.taskItem,
                                selectedTask && selectedTask.id === tarea.id && ProyectListStyles.selectedTask,
                                isDone && styles.completedTaskGreen
                              ]}
                              onPress={() => !isDone && handleSelectTask(tarea)}
                              activeOpacity={isDone ? 1 : 0.7}
                              disabled={isDone}
                            >
                              <Text style={[
                                ProyectListStyles.taskName,
                                isDone && styles.completedTaskTextGreen
                              ]}>
                                {tarea.name} {tarea.stage_id && tarea.stage_id[1] ? `(${tarea.stage_id[1]})` : ''} {isDone ? '✔️' : ''}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                      ) : (
                        <Text style={ProyectListStyles.emptyTaskText}>No hay tareas para este proyecto.</Text>
                      ))
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

// Estilos adicionales para tareas completadas en verde
const styles = StyleSheet.create({
  completedTaskGreen: {
    backgroundColor: '#e6ffe6',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  completedTaskTextGreen: {
    color: '#388e3c',
    fontWeight: 'bold',
    textDecorationLine: 'line-through',
  },
  completedTask: {}, // legacy, no usar
  completedTaskText: {}, // legacy, no usar
});


import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { odooRead } from '../../../db/odooApi';
import { OdooAutocompleteInput } from '../../OdooAutocompleteInput';
import { DB, RPC_URL } from './config';
import { ProyectListStyles } from './PoryectListSytyle';
import { rpcCall } from './rpc';
import { showMessage } from './util';

interface ProyectListProps {
  uid: number;
  pass: string;
  onSelectProject: (proyecto: any) => void;
  selectedProject: any;
  onSelectTask: (tarea: any) => void;
  selectedTask: any;
  hideTitle?: boolean;
  // Nuevas props para identificar y deshabilitar la tarea actual
  currentProject?: any;
  currentTask?: any;
}

export default function ProyectList(props: ProyectListProps) {
  console.log('ProyectList montado con props:', props);
  const { uid, pass, onSelectProject, selectedProject, onSelectTask, selectedTask, hideTitle, currentProject, currentTask } = props;

  const [proyectos, setProyectos] = useState<any[]>([]);
  const [tareas, setTareas] = useState<{ [key: number]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState<number | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<{ [key: number]: boolean }>({});
  
  // Estados para paginación (solo fallback)
  const [currentPage, setCurrentPage] = useState(0);
  const PROJECTS_PER_PAGE = 5;

  useEffect(() => {
    console.log('useEffect de proyectos ejecutado', { uid, pass });
    // Validación: uid y pass deben estar definidos y válidos
    if (uid == null || pass == null || pass === "") {
      return;
    }
    async function fetchProjects() {
      console.log('fetchProjects ejecutándose');
      setLoading(true);
      try {
        const res = await odooRead({
          model: 'project.project',
          fields: ['id', 'name'],
          domain: [
            '&',
              '!',
                '|',
                  ['id', '=', 1],
                  ['name', 'ilike', 'interno'],
              ['active', '=', true]
          ],
          uid,
          pass,
          limit: 100
        }) as { id: number; name: string }[];
        console.log('Proyectos recibidos del backend:', res);
        // Filtro extra en frontend por si acaso
        const filtrados = res.filter(p => {
          const excluido = p.id === 1 || (p.name?.toLowerCase().includes('interno'));
          if (excluido) {
            console.log('ProyectList: proyecto excluido en filtro frontend:', p);
          }
          return !excluido;
        });
        console.log('Proyectos después del filtro frontend:', filtrados);
        setProyectos(filtrados);
      } catch (error: any) {
        showMessage('Error', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [uid, pass]);

  // El autocompletado reemplaza la búsqueda manual

  // Mover fetchTasks fuera del useEffect para que esté disponible globalmente
  const fetchTasks = useCallback(async (projectId: number) => {
    setLoadingTasks(projectId);
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
      setTareas(prev => ({ ...prev, [projectId]: res }));
    } catch (error: any) {
      showMessage('Error', error.message);
    } finally {
      setLoadingTasks(null);
    }
  }, [uid, pass]);

  // useEffect para cargar tareas cuando cambia el proyecto seleccionado
  useEffect(() => {
    if (selectedProject && !tareas[selectedProject.id]) {
      fetchTasks(selectedProject.id);
    }
  }, [selectedProject, uid, pass, tareas, fetchTasks]);

  // Filtrado extra en frontend para asegurar que nunca se muestre el proyecto interno
  const proyectosFiltrados = proyectos.filter((p) => {
    const excluido = p.id === 1 || (p.name?.toLowerCase().includes('interno'));
    if (excluido) {
      console.log('ProyectList: proyecto excluido en proyectosFiltrados:', p);
    }
    return !excluido;
  });
  console.log('ProyectList: proyectosFiltrados para fallback:', proyectosFiltrados);

  // Calcular proyectos para la página actual
  const startIndex = currentPage * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const proyectosPaginados = proyectosFiltrados.slice(startIndex, endIndex);
  // const totalPages = Math.ceil(proyectosFiltrados.length / PROJECTS_PER_PAGE);

  // // Función para cambiar de página
  // const goToNextPage = () => {
  //   if (currentPage < totalPages - 1) {
  //     setCurrentPage(currentPage + 1);
  //   }
  // };

  // const goToPrevPage = () => {
  //   if (currentPage > 0) {
  //     setCurrentPage(currentPage - 1);
  //   }
  // };

  // // Función para manejar selección de tarea desde búsqueda
  // const handleSelectTaskFromSearch = (tarea: any) => {
  //   // Primero buscar el proyecto de la tarea y seleccionarlo
  //   const proyecto = proyectos.find(p => p.id === tarea.project_id[0]);
  //   if (proyecto) {
  //     handleSelectProject(proyecto);
  //   }
  //   handleSelectTask(tarea);
  // };

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

  // --- Render principal ---
  console.log('ProyectList renderizando');
  return (
    <View style={ProyectListStyles.container}>
      {!hideTitle && (
        <Text style={ProyectListStyles.title}>Selecciona un proyecto y una tarea</Text>
      )}
      {/* Autocompletado de proyecto */}
      <View style={{ zIndex: 20 }}>
        <OdooAutocompleteInput
          model="project.project"
          searchField="name"
          placeholder="Buscar proyecto..."
          onSelect={onSelectProject}
          value={selectedProject}
          uid={uid}
          pass={pass}
          extraDomain={[]}
          labelField="name"
        />
      </View>

      {/* Autocompletado de tarea, solo si hay proyecto seleccionado */}
      {selectedProject && (
        <View style={{ zIndex: 10 }}>
          <OdooAutocompleteInput
            model="project.task"
            searchField="name"
            placeholder="Buscar tarea..."
            onSelect={onSelectTask}
            value={selectedTask}
            uid={uid}
            pass={pass}
            extraDomain={[["project_id", "=", selectedProject.id]]}
            labelField="name"
          />
        </View>
      )}

      {/* Fallback: lista expandible solo si no hay búsqueda activa y no hay selección */}
      {!selectedProject && proyectosFiltrados.length > 0 && (
        <ScrollView style={styles.scrollContainer}>
          {proyectosPaginados
            .filter((proyecto) => {
              const excluido = proyecto.id === 1 || (proyecto.name?.toLowerCase().includes('interno'));
              if (excluido) {
                console.log('ProyectList: proyecto excluido en render:', proyecto);
              }
              return !excluido;
            })
            .map((proyecto) => (
              <View key={proyecto.id}>
                <TouchableOpacity
                  style={[
                    ProyectListStyles.projectItem,
                    selectedProject && selectedProject.id === proyecto.id && ProyectListStyles.selectedItem
                  ]}
                  onPress={() => {
                    handleSelectProject(proyecto);
                    toggleProject(proyecto.id);
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
                          const isDone = tarea.stage_id && tarea.stage_id[1] &&
                            (tarea.stage_id[1].toLowerCase().includes('completado') || tarea.stage_id[1].toLowerCase().includes('closed'));
                          const isCurrentTask = currentTask && currentTask.id === tarea.id &&
                                               currentProject && currentProject.id === proyecto.id;
                          return (
                            <TouchableOpacity
                              key={tarea.id}
                              style={[
                                ProyectListStyles.taskItem,
                                selectedTask && selectedTask.id === tarea.id && ProyectListStyles.selectedTask,
                                isDone && styles.completedTaskGreen,
                                isCurrentTask && styles.currentTaskDisabled
                              ]}
                              onPress={() => !isDone && !isCurrentTask && handleSelectTask(tarea)}
                              activeOpacity={isDone || isCurrentTask ? 1 : 0.7}
                              disabled={isDone || isCurrentTask}
                            >
                              <Text style={[
                                ProyectListStyles.taskName,
                                isDone && styles.completedTaskTextGreen,
                                isCurrentTask && styles.currentTaskTextDisabled
                              ]}>
                                {tarea.name} {tarea.stage_id && tarea.stage_id[1] ? `(${tarea.stage_id[1]})` : ''}
                                {isDone ? ' ✔️' : ''}
                                {isCurrentTask ? ' (Tarea Actual)' : ''}
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
            ))}
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
  // Estilos para la tarea actual (que no se puede seleccionar)
  currentTaskDisabled: {
    backgroundColor: '#fff3e0', // Color naranja claro
    borderColor: '#ff9800', // Borde naranja
    borderWidth: 1,
    opacity: 0.7, // Reducir opacidad para mostrar que está deshabilitada
  },
  currentTaskTextDisabled: {
    color: '#e65100', // Texto naranja oscuro
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  // Estilos para búsqueda
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  searchLoader: {
    marginLeft: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  searchResultsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 10,
  },
  searchSection: {
    marginBottom: 15,
  },
  searchSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
  },
  searchResultItem: {
    backgroundColor: '#fff',
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 10,
  },
  // Estilos para paginación
  paginationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 10,
  },
  paginationButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  paginationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  paginationButtonTextDisabled: {
    color: '#adb5bd',
  },
  completedTask: {}, // legacy, no usar
  completedTaskText: {}, // legacy, no usar
});


import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

export default function ProyectList({ uid, pass, onSelectProject, selectedProject, onSelectTask, selectedTask, hideTitle, currentProject, currentTask }: ProyectListProps) {
  console.log('[DEBUG][ProyectList] Props received:', {
    uid,
    pass,
    selectedProject,
    selectedTask,
    onSelectProject: !!onSelectProject,
    onSelectTask: !!onSelectTask,
    hideTitle
  });

  const [proyectos, setProyectos] = useState<any[]>([]);
  const [tareas, setTareas] = useState<{ [key: number]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState<number | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<{ [key: number]: boolean }>({});
  
  // Estados para paginación y búsqueda
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<{projects: any[], tasks: any[]}>({ projects: [], tasks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const PROJECTS_PER_PAGE = 5;

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

  // Función para realizar búsqueda
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ projects: [], tasks: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Buscar proyectos
      const projectsRes = await rpcCall<any[]>(
        'object', 'execute_kw',
        [
          DB,
          uid,
          pass,
          'project.project',
          'search_read',
          [ [['name', 'ilike', query]] ],
          { fields: ['id', 'name'], limit: 20 }
        ],
        RPC_URL
      );

      // Buscar tareas
      const tasksRes = await rpcCall<any[]>(
        'object', 'execute_kw',
        [
          DB,
          uid,
          pass,
          'project.task',
          'search_read',
          [ [['name', 'ilike', query]] ],
          { fields: ['id', 'name', 'project_id', 'stage_id', 'progress'], limit: 20 }
        ],
        RPC_URL
      );

      // Filtrar proyectos internos
      const filteredProjects = projectsRes.filter(
        (proyecto) => proyecto.id !== 1 && !(proyecto.name?.toLowerCase().includes("interno"))
      );

      setSearchResults({ projects: filteredProjects, tasks: tasksRes });
    } catch (error: any) {
      console.error('[DEBUG][performSearch] error:', error);
      showMessage('Error', 'Error al realizar la búsqueda');
      setSearchResults({ projects: [], tasks: [] });
    } finally {
      setIsSearching(false);
    }
  }, [uid, pass]);

  // useEffect para búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.trim().length >= 2) {
        performSearch(searchText);
      } else if (searchText.trim().length === 0) {
        setSearchResults({ projects: [], tasks: [] });
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText, performSearch]);

  // Mover fetchTasks fuera del useEffect para que esté disponible globalmente
  const fetchTasks = useCallback(async (projectId: number) => {
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
  }, [uid, pass]);

  // useEffect para cargar tareas cuando cambia el proyecto seleccionado
  useEffect(() => {
    if (selectedProject && !tareas[selectedProject.id]) {
      fetchTasks(selectedProject.id);
    }
  }, [selectedProject, uid, pass, tareas, fetchTasks]);

  // Filtrar proyectos para excluir el proyecto interno (id 1 o nombre que contenga "interno")
  const proyectosFiltrados = proyectos.filter(
    (proyecto) => proyecto.id !== 1 && !(proyecto.name?.toLowerCase().includes("interno"))
  );

  // Calcular proyectos para la página actual
  const startIndex = currentPage * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const proyectosPaginados = proyectosFiltrados.slice(startIndex, endIndex);
  const totalPages = Math.ceil(proyectosFiltrados.length / PROJECTS_PER_PAGE);

  // Función para cambiar de página
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Función para manejar selección de tarea desde búsqueda
  const handleSelectTaskFromSearch = (tarea: any) => {
    // Primero buscar el proyecto de la tarea y seleccionarlo
    const proyecto = proyectos.find(p => p.id === tarea.project_id[0]);
    if (proyecto) {
      handleSelectProject(proyecto);
    }
    handleSelectTask(tarea);
  };

  // Handler para selección de proyecto
  const handleSelectProject = (proyecto: any) => {
    console.log('[DEBUG][ProyectList] handleSelectProject internal called with:', proyecto);
    console.log('[DEBUG][ProyectList] About to call onSelectProject with:', proyecto);
    console.log('[DEBUG][ProyectList] onSelectProject function:', onSelectProject);
    onSelectProject(proyecto);
    console.log('[DEBUG][ProyectList] onSelectProject called successfully');
  };

  // Handler para selección de tarea
  const handleSelectTask = (tarea: any) => {
    console.log('[DEBUG][ProyectList] handleSelectTask internal called with:', tarea);
    console.log('[DEBUG][ProyectList] About to call onSelectTask with:', tarea);
    console.log('[DEBUG][ProyectList] onSelectTask function:', onSelectTask);
    onSelectTask(tarea);
    console.log('[DEBUG][ProyectList] onSelectTask called successfully');
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
      
      {/* Cuadro de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar proyecto o tarea..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {isSearching && <ActivityIndicator size="small" color="#007bff" style={styles.searchLoader} />}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {/* Resultados de búsqueda */}
          {searchText.trim().length >= 2 && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsTitle}>Resultados de búsqueda:</Text>
              
              {/* Proyectos encontrados */}
              {searchResults.projects.length > 0 && (
                <View style={styles.searchSection}>
                  <Text style={styles.searchSectionTitle}>Proyectos:</Text>
                  {searchResults.projects.map((proyecto) => (
                    <TouchableOpacity
                      key={`search-project-${proyecto.id}`}
                      style={[
                        ProyectListStyles.projectItem,
                        styles.searchResultItem,
                        selectedProject && selectedProject.id === proyecto.id && ProyectListStyles.selectedItem
                      ]}
                      onPress={() => {
                        handleSelectProject(proyecto);
                        setSearchText(''); // Limpiar búsqueda al seleccionar
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={ProyectListStyles.projectName}>🔍 {proyecto.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Tareas encontradas */}
              {searchResults.tasks.length > 0 && (
                <View style={styles.searchSection}>
                  <Text style={styles.searchSectionTitle}>Tareas:</Text>
                  {searchResults.tasks.map((tarea) => {
                    const isDone = tarea.stage_id && tarea.stage_id[1] &&
                      (tarea.stage_id[1].toLowerCase().includes('completado') || tarea.stage_id[1].toLowerCase().includes('closed'));
                    const isCurrentTask = currentTask && currentTask.id === tarea.id;
                    
                    return (
                      <TouchableOpacity
                        key={`search-task-${tarea.id}`}
                        style={[
                          ProyectListStyles.taskItem,
                          styles.searchResultItem,
                          selectedTask && selectedTask.id === tarea.id && ProyectListStyles.selectedTask,
                          isDone && styles.completedTaskGreen,
                          isCurrentTask && styles.currentTaskDisabled
                        ]}
                        onPress={() => {
                          if (!isDone && !isCurrentTask) {
                            handleSelectTaskFromSearch(tarea);
                            setSearchText(''); // Limpiar búsqueda al seleccionar
                          }
                        }}
                        activeOpacity={isDone || isCurrentTask ? 1 : 0.7}
                        disabled={isDone || isCurrentTask}
                      >
                        <Text style={[
                          ProyectListStyles.taskName,
                          isDone && styles.completedTaskTextGreen,
                          isCurrentTask && styles.currentTaskTextDisabled
                        ]}>
                          🔍 {tarea.name} 
                          {tarea.project_id && tarea.project_id[1] ? ` (${tarea.project_id[1]})` : ''}
                          {tarea.stage_id && tarea.stage_id[1] ? ` - ${tarea.stage_id[1]}` : ''}
                          {isDone ? ' ✔️' : ''}
                          {isCurrentTask ? ' (Tarea Actual)' : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {searchResults.projects.length === 0 && searchResults.tasks.length === 0 && !isSearching && (
                <Text style={styles.noResultsText}>No se encontraron resultados</Text>
              )}
            </View>
          )}

          {/* Lista normal de proyectos (solo si no hay búsqueda activa) */}
          {searchText.trim().length < 2 && (
            <>
              {proyectosFiltrados.length === 0 ? (
                <Text style={ProyectListStyles.emptyText}>No hay proyectos disponibles.</Text>
              ) : (
                <>
                  {/* Información de paginación */}
                  {proyectosFiltrados.length > PROJECTS_PER_PAGE && (
                    <View style={styles.paginationInfo}>
                      <Text style={styles.paginationText}>
                        Mostrando {startIndex + 1}-{Math.min(endIndex, proyectosFiltrados.length)} de {proyectosFiltrados.length} proyectos
                      </Text>
                    </View>
                  )}

                  {/* Proyectos paginados */}
                  {proyectosPaginados.map((proyecto) => (
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

                  {/* Controles de paginación */}
                  {proyectosFiltrados.length > PROJECTS_PER_PAGE && (
                    <View style={styles.paginationControls}>
                      <TouchableOpacity
                        style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
                        onPress={goToPrevPage}
                        disabled={currentPage === 0}
                      >
                        <Text style={[styles.paginationButtonText, currentPage === 0 && styles.paginationButtonTextDisabled]}>
                          ← Anterior
                        </Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.paginationInfo}>
                        Página {currentPage + 1} de {totalPages}
                      </Text>
                      
                      <TouchableOpacity
                        style={[styles.paginationButton, currentPage >= totalPages - 1 && styles.paginationButtonDisabled]}
                        onPress={goToNextPage}
                        disabled={currentPage >= totalPages - 1}
                      >
                        <Text style={[styles.paginationButtonText, currentPage >= totalPages - 1 && styles.paginationButtonTextDisabled]}>
                          Siguiente →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </>
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


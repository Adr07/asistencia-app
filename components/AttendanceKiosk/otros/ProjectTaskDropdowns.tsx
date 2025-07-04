import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DB, RPC_URL } from './config';
import { rpcCall } from './rpc';
import { showMessage } from './util';

interface ProjectTaskDropdownsProps {
  uid: number;
  pass: string;
  onSelectProject: (proyecto: any) => void;
  selectedProject: any;
  onSelectTask: (tarea: any) => void;
  selectedTask: any;
  hideTitle?: boolean;
  currentProject?: any;
  currentTask?: any;
}

interface DropdownProps {
  data: any[];
  selectedValue: any;
  onSelect: (item: any) => void;
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
  renderItem?: (item: any) => string;
  keyExtractor?: (item: any) => string;
}

// Componente Dropdown personalizado
function CustomDropdown({ data, selectedValue, onSelect, placeholder, loading, disabled, renderItem = (item) => item.name, keyExtractor = (item) => item.id.toString() }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (item: any) => {
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          disabled && styles.dropdownButtonDisabled,
          isOpen && styles.dropdownButtonOpen
        ]}
        onPress={() => !disabled && !loading && setIsOpen(true)}
        disabled={disabled || loading}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : (
          <Text style={[
            styles.dropdownButtonText,
            !selectedValue && styles.placeholderText
          ]}>
            {selectedValue ? renderItem(selectedValue) : placeholder}
          </Text>
        )}
        <Text style={styles.dropdownArrow}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={data}
              keyExtractor={keyExtractor}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selectedValue && keyExtractor(selectedValue) === keyExtractor(item) && styles.selectedDropdownItem
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.dropdownItemText}>{renderItem(item)}</Text>
                </TouchableOpacity>
              )}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function ProjectTaskDropdowns({ 
  uid, 
  pass, 
  onSelectProject, 
  selectedProject, 
  onSelectTask, 
  selectedTask, 
  hideTitle, 
  currentProject, 
  currentTask 
}: ProjectTaskDropdownsProps) {
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
          setProyectos(res);
        }
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
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
        console.error('Error al cargar tareas:', error);
        showMessage('Error al cargar tareas');
      } finally {
        setLoadingTasks(false);
      }
    }
    
    fetchTasks();
  }, [selectedProject?.id, uid, pass]);

  // Handler para selección de proyecto
  const handleProjectChange = useCallback((project: any) => {
    onSelectProject(project);
    // Limpiar tarea seleccionada cuando cambia el proyecto
    onSelectTask(null);
  }, [onSelectProject, onSelectTask]);

  // Handler para selección de tarea
  const handleTaskChange = useCallback((task: any) => {
    // Verificar que no sea la tarea actual
    const isCurrentTask = currentTask && currentTask.id === task.id;
    if (!isCurrentTask) {
      onSelectTask(task);
    }
  }, [onSelectTask, currentTask]);

  // Renderizado personalizado para tareas (mostrar si es actual)
  const renderTask = useCallback((task: any) => {
    const isCurrentTask = currentTask && currentTask.id === task.id;
    return isCurrentTask ? `${task.name} (actual)` : task.name;
  }, [currentTask]);

  // Filtrar tareas para no mostrar la actual como opción
  const availableTasks = tareas.filter(task => !currentTask || currentTask.id !== task.id);

  return (
    <View style={styles.container}>
      {!hideTitle && (
        <Text style={styles.title}>Selecciona Proyecto y Tarea</Text>
      )}
      
      {/* Información de proyecto/tarea actual si está en modo cambio */}
      {currentProject && currentTask && (
        <View style={styles.currentInfo}>
          <Text style={styles.currentLabel}>Proyecto actual:</Text>
          <Text style={styles.currentText}>{currentProject.name}</Text>
          <Text style={styles.currentLabel}>Tarea actual:</Text>
          <Text style={styles.currentText}>{currentTask.name}</Text>
          <Text style={styles.changeLabel}>Selecciona nueva tarea:</Text>
        </View>
      )}

      {/* Dropdown de Proyectos */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Proyecto:</Text>
        <CustomDropdown
          data={proyectos}
          selectedValue={selectedProject}
          onSelect={handleProjectChange}
          placeholder="Selecciona un proyecto..."
          loading={loading}
          disabled={loading}
        />
      </View>

      {/* Dropdown de Tareas */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Tarea:</Text>
        <CustomDropdown
          data={availableTasks}
          selectedValue={selectedTask}
          onSelect={handleTaskChange}
          placeholder={selectedProject ? "Selecciona una tarea..." : "Primero selecciona un proyecto"}
          loading={loadingTasks}
          disabled={loadingTasks || !selectedProject}
          renderItem={renderTask}
        />
      </View>

      {/* Texto de ayuda */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          {!selectedProject 
            ? "Selecciona un proyecto para ver las tareas disponibles"
            : !selectedTask
            ? "Selecciona una tarea para continuar"
            : "✓ Proyecto y tarea seleccionados"
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  currentInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2,
  },
  currentText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  changeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196f3',
    marginTop: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  dropdownButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  dropdownButtonOpen: {
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: '70%',
    width: '80%',
    maxWidth: 400,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedDropdownItem: {
    backgroundColor: '#e3f2fd',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  helpContainer: {
    marginTop: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

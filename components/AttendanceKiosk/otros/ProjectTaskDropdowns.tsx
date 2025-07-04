import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useProjectTaskDropdownsLogic } from '../../../ts/useProjectTaskDropdownsLogic';
import ProjectTaskDropdownsStyles from './ProjectTaskDropdownsStyles';

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
  const [search, setSearch] = useState('');

  const handleSelect = (item: any) => {
    onSelect(item);
    setIsOpen(false);
    setSearch('');
  };

  // Filtrar data por búsqueda
  const filteredData = search.trim().length > 0
    ? data.filter(item => renderItem(item).toLowerCase().includes(search.trim().toLowerCase()))
    : data;

  return (
    <View style={ProjectTaskDropdownsStyles.dropdownWrapper}>
      <TouchableOpacity
        style={[
          ProjectTaskDropdownsStyles.dropdownButton,
          disabled && ProjectTaskDropdownsStyles.dropdownButtonDisabled,
          isOpen && ProjectTaskDropdownsStyles.dropdownButtonOpen
        ]}
        onPress={() => !disabled && !loading && setIsOpen(true)}
        disabled={disabled || loading}
      >
        {loading ? (
          <View style={ProjectTaskDropdownsStyles.loadingRow}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={ProjectTaskDropdownsStyles.loadingText}>Cargando...</Text>
          </View>
        ) : (
          <Text style={[
            ProjectTaskDropdownsStyles.dropdownButtonText,
            !selectedValue && ProjectTaskDropdownsStyles.placeholderText
          ]}>
            {selectedValue ? renderItem(selectedValue) : placeholder}
          </Text>
        )}
        <Text style={ProjectTaskDropdownsStyles.dropdownArrow}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={ProjectTaskDropdownsStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={ProjectTaskDropdownsStyles.modalContent}>
            {/* Cuadro de búsqueda */}
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 6,
                padding: 8,
                marginBottom: 10,
                backgroundColor: '#fff',
              }}
              placeholder="Buscar..."
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            <FlatList
              data={filteredData}
              keyExtractor={keyExtractor}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    ProjectTaskDropdownsStyles.dropdownItem,
                    selectedValue && keyExtractor(selectedValue) === keyExtractor(item) && ProjectTaskDropdownsStyles.selectedDropdownItem
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={ProjectTaskDropdownsStyles.dropdownItemText}>{renderItem(item)}</Text>
                </TouchableOpacity>
              )}
              style={ProjectTaskDropdownsStyles.dropdownList}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={<Text style={{ padding: 10, color: '#888' }}>No hay resultados</Text>}
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
  const {
    proyectos,
    availableTasks,
    loading,
    loadingTasks
  } = useProjectTaskDropdownsLogic(uid, pass, selectedProject, currentTask);

  const handleProjectChange = useCallback((project: any) => {
    onSelectProject(project);
    onSelectTask(null);
  }, [onSelectProject, onSelectTask]);

  const handleTaskChange = useCallback((task: any) => {
    const isCurrentTask = currentTask && currentTask.id === task.id;
    if (!isCurrentTask) {
      onSelectTask(task);
    }
  }, [onSelectTask, currentTask]);

  const renderTask = useCallback((task: any) => {
    const isCurrentTask = currentTask && currentTask.id === task.id;
    return isCurrentTask ? `${task.name} (actual)` : task.name;
  }, [currentTask]);

  return (
    <View style={ProjectTaskDropdownsStyles.container}>
      {!hideTitle && (
        <Text style={ProjectTaskDropdownsStyles.title}>Selecciona Proyecto y Tarea</Text>
      )}

      {/* Información de proyecto/tarea actual si está en modo cambio */}
      {currentProject && currentTask && (
        <View style={ProjectTaskDropdownsStyles.currentInfo}>
          <Text style={ProjectTaskDropdownsStyles.currentLabel}>Proyecto actual:</Text>
          <Text style={ProjectTaskDropdownsStyles.currentText}>{currentProject.name}</Text>
          <Text style={ProjectTaskDropdownsStyles.currentLabel}>Tarea actual:</Text>
          <Text style={ProjectTaskDropdownsStyles.currentText}>{currentTask.name}</Text>
          <Text style={ProjectTaskDropdownsStyles.changeLabel}>Selecciona nueva tarea:</Text>
        </View>
      )}

      {/* Dropdown de Proyectos */}
      <View style={ProjectTaskDropdownsStyles.fieldContainer}>
        <Text style={ProjectTaskDropdownsStyles.label}>Proyecto:</Text>
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
      <View style={ProjectTaskDropdownsStyles.fieldContainer}>
        <Text style={ProjectTaskDropdownsStyles.label}>Tarea:</Text>
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
      <View style={ProjectTaskDropdownsStyles.helpContainer}>
        <Text style={ProjectTaskDropdownsStyles.helpText}>
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



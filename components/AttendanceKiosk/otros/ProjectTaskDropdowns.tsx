import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useProjectTaskDropdownsLogic } from '../../../ts/useProjectTaskDropdownsLogic';
import ProjectTaskDropdownsStyles from './ProjectTaskDropdownsStyles';

// Componente Dropdown personalizado

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
  pedirAvanceMsg?: string;
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
  currentTask?: any;
  currentProject?: any;
}

function CustomDropdown({ data, selectedValue, onSelect, placeholder, loading, disabled, renderItem = (item) => item.label || item.value || item.name, keyExtractor = (item) => item.id.toString(), pedirAvanceMsg, uid, pass, currentTask, currentProject }: DropdownProps & { pedirAvanceMsg?: string, uid: number, pass: string, currentTask?: any, currentProject?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // El valor seleccionado siempre viene de props.selectedValue
  const handleSelect = (item: any) => {
    onSelect(item);
    setIsOpen(false);
    setSearch('');
  };

  // Filtrar data por búsqueda
  const filteredData = search.trim().length > 0
    ? data.filter(item => renderItem(item).toLowerCase().includes(search.trim().toLowerCase()))
    : data;

  // El valor seleccionado viene de selectedValue (prop)
  // Para deshabilitar la opción actual, recibimos currentTask/currentProject como prop
  // Así que recibimos currentTask/currentProject como prop y lo usamos directamente

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
            {/* Mostrar el mensaje de avance al lado del nombre en el botón si hay selección */}
            {selectedValue && pedirAvanceMsg && (
              <Text style={{ marginLeft: 8, color: pedirAvanceMsg === 'no' ? '#888' : '#1976d2', fontSize: 13, fontStyle: pedirAvanceMsg === 'no' ? 'italic' : 'normal' }}>{pedirAvanceMsg}</Text>
            )}
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
              renderItem={({ item }) => {
                // Solo deshabilitar la actividad actual, nunca el proyecto actual
                let isCurrent = false;
                if (typeof item.id !== 'undefined') {
                  // Para actividades, deshabilitar la actual
                  if (typeof (currentTask?.id) !== 'undefined' && item.id === currentTask?.id) {
                    isCurrent = true;
                  }
                }
                const isSelected = selectedValue && keyExtractor(selectedValue) === keyExtractor(item);
                return (
                  <TouchableOpacity
                    style={[
                      ProjectTaskDropdownsStyles.dropdownItem,
                      isSelected && ProjectTaskDropdownsStyles.selectedDropdownItem,
                      isCurrent && { opacity: 0.5 }
                    ]}
                    onPress={() => !isCurrent && handleSelect(item)}
                    disabled={isCurrent}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={ProjectTaskDropdownsStyles.dropdownItemText}>{renderItem(item)}{isCurrent ? ' (actual)' : ''}</Text>
                      {/* Mostrar el mensaje de avance global al lado de cada actividad */}
                      {pedirAvanceMsg && (
                        <Text style={{ marginLeft: 8, color: pedirAvanceMsg === 'no' ? '#888' : '#1976d2', fontSize: 13, fontStyle: pedirAvanceMsg === 'no' ? 'italic' : 'normal' }}>{pedirAvanceMsg}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
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
  currentTask, 
  pedirAvanceMsg
}: ProjectTaskDropdownsProps) {
  const {
    proyectos,
    availableActivities,
    loading,
    loadingTasks
  } = useProjectTaskDropdownsLogic(uid, pass, selectedProject, currentTask);

  // Mostrar en consola los proyectos y actividades cada vez que cambian
  React.useEffect(() => {
    console.log('Proyectos:', proyectos);
  }, [proyectos]);
  React.useEffect(() => {
    console.log('Actividades disponibles:', availableActivities);
  }, [availableActivities]);

  const handleProjectChange = useCallback((project: any) => {
    onSelectProject(project);
    onSelectTask(null);
  }, [onSelectProject, onSelectTask]);

  const handleActivityChange = useCallback((actividad: any) => {
    const isCurrent = currentTask && currentTask.id === actividad.id;
    if (!isCurrent) {
      onSelectTask(actividad);
    }
  }, [onSelectTask, currentTask]);

  const renderActivity = useCallback((actividad: any) => {
    const isCurrent = currentTask && currentTask.id === actividad.id;
    // Solo el nombre de la actividad
    return isCurrent ? `${actividad.label || actividad.value || actividad.name} (actual)` : (actividad.label || actividad.value || actividad.name);
  }, [currentTask]);

  return (
    <View style={ProjectTaskDropdownsStyles.container}>
      {!hideTitle && (
        <Text style={ProjectTaskDropdownsStyles.title}>Selecciona Proyecto y Actividad</Text>
      )}

      {/* Información de proyecto/tarea actual solo en modo cambio de tarea */}
      {hideTitle && currentProject && currentTask && (
        <View style={ProjectTaskDropdownsStyles.currentInfo}>
          <Text style={ProjectTaskDropdownsStyles.currentLabel}>Proyecto actual:</Text>
          <Text style={ProjectTaskDropdownsStyles.currentText}>{currentProject.label || currentProject.value || currentProject.name}</Text>
          <Text style={ProjectTaskDropdownsStyles.currentLabel}>Actividad actual:</Text>
          <Text style={ProjectTaskDropdownsStyles.currentText}>{currentTask.label || currentTask.value || currentTask.name}</Text>
          <Text style={ProjectTaskDropdownsStyles.changeLabel}>Selecciona nueva actividad:</Text>
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
          uid={uid}
          pass={pass}
          currentProject={currentProject}
        />
        {/* Cartel si no hay proyectos */}
        {!loading && proyectos.length === 0 && (
          <Text style={{ color: '#888', marginTop: 8 }}>No hay proyectos disponibles</Text>
        )}
      </View>

      {/* Dropdown de Actividades */}
      <View style={ProjectTaskDropdownsStyles.fieldContainer}>
        <Text style={ProjectTaskDropdownsStyles.label}>Actividad:</Text>
        <CustomDropdown
          data={availableActivities}
          selectedValue={selectedTask}
          onSelect={handleActivityChange}
          placeholder={selectedProject ? "Selecciona una actividad..." : "Primero selecciona un proyecto"}
          loading={loadingTasks}
          disabled={loadingTasks || !selectedProject}
          renderItem={renderActivity}
          uid={uid}
          pass={pass}
          pedirAvanceMsg={pedirAvanceMsg}
          currentTask={currentTask}
        />
        {/* Mensaje de avance eliminado de debajo del botón de actividad */}
        {/* Cartel si no hay actividades */}
        {!loadingTasks && selectedProject && availableActivities.length === 0 && (
          <Text style={{ color: '#888', marginTop: 8 }}>No hay actividades disponibles para este proyecto</Text>
        )}
      </View>

      {/* Texto de ayuda */}
      <View style={ProjectTaskDropdownsStyles.helpContainer}>
        <Text style={ProjectTaskDropdownsStyles.helpText}>
          {!selectedProject 
            ? "Selecciona un proyecto para ver las actividades disponibles"
            : !selectedTask
            ? "Selecciona una actividad para continuar"
            : "✓ Proyecto y actividad seleccionados"
          }
        </Text>
      </View>
    </View>
  );
}



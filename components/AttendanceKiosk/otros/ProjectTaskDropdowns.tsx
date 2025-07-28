import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getEmployeeTiempoActividad } from '../../../db/odooApi';
// import { getEmployeeTiempoActividad } from '../../../db/odooApi';
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
  // Estado para los tiempos de actividad por id de actividad
  const [activityTimes, setActivityTimes] = useState<{ [actividadId: string]: number | null }>({});
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchTimes() {
      if (isOpen && data && data.length > 0 && currentProject && uid && pass) {
        const emp_id = uid;
        const timesObj: { [actividadId: string]: number | null } = {};
        for (const actividad of data) {
          try {
            const tiempo = await getEmployeeTiempoActividad({
              uid,
              pass,
              emp_id,
              project_id: currentProject.id,
              actividad_id: actividad.id
            });
            timesObj[actividad.id] = tiempo as number;
          } catch {
            timesObj[actividad.id] = null;
          }
        }
        setActivityTimes(timesObj);
      }
      if (!isOpen) setActivityTimes({});
    }
    fetchTimes();
  }, [isOpen, data, currentProject, uid, pass]);

  // Log para depuración de activityTimes y selectedValue
  useEffect(() => {
    // ...existing code...
  }, [activityTimes]);
  useEffect(() => {
    // ...existing code...
  }, [selectedValue]);
  useEffect(() => {
    // ...existing code...
  }, [currentProject]);

  // ...existing code...

  // Cargar tiempos de actividad al abrir el dropdown de actividades
  // useEffect(() => {
  //   if (isOpen && data && data.length > 0 && currentProject && uid && pass) {
  //     setLoadingTimes(true);
  //     const emp_id = uid;
  //     Promise.all(
  //       data.map(async (actividad) => {
  //         const tiempo = await getEmployeeTiempoActividad({
  //           uid,
  //           pass,
  //           emp_id,
  //           project_id: currentProject.id,
  //           actividad_id: actividad.id
  //         });
  //         return { id: actividad.id, tiempo };
  //       })
  //     ).then((resultArr) => {
  //       const timesObj: { [actividadId: string]: number | null } = {};
  //       resultArr.forEach(({ id, tiempo }) => {
  //         timesObj[id] = tiempo;
  //       });
  //       setActivityTimes(timesObj);
  //       setLoadingTimes(false);
  //     });
  //   }
  //   if (!isOpen) setActivityTimes({});
  // }, [isOpen, data, currentProject, uid, pass]);

  // Filtrar data por búsqueda
  const filteredData = search.trim().length > 0
    ? data.filter(item => renderItem(item).toLowerCase().includes(search.trim().toLowerCase()))
    : data;

  // El valor seleccionado siempre viene de props.selectedValue
  const handleSelect = (item: any) => {
    onSelect(item);
    setIsOpen(false);
    setSearch('');
  };

  function formatTime(minutesOrSeconds: number | null): string {
    if (minutesOrSeconds == null) return '';
    let totalMinutes = minutesOrSeconds;
    if (minutesOrSeconds > 10000) totalMinutes = Math.round(minutesOrSeconds / 60); // fallback si backend da segundos
    const h = Math.floor(totalMinutes / 60);
    const m = Math.floor(totalMinutes % 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

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
          <Text style={[ProjectTaskDropdownsStyles.dropdownButtonText, !selectedValue && ProjectTaskDropdownsStyles.placeholderText]}>
            {selectedValue ? (
              <>
                <Text>
                  {renderItem(selectedValue)}
                  {currentProject && selectedValue && activityTimes[selectedValue.id] != null && (
                    <Text style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>
                      {' · ' + formatTime(activityTimes[selectedValue.id])}
                    </Text>
                  )}
                </Text>
              </>
            ) : placeholder}
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
                let isCurrent = false;
                if (typeof item.id !== 'undefined') {
                  if (typeof (currentTask?.id) !== 'undefined' && item.id === currentTask?.id) {
                    isCurrent = true;
                  }
                }
                const isSelected = selectedValue && keyExtractor(selectedValue) === keyExtractor(item);
                const isActivityDropdown = !!currentProject;
                return (
                  <TouchableOpacity
                    style={[ProjectTaskDropdownsStyles.dropdownItem, isSelected && ProjectTaskDropdownsStyles.selectedDropdownItem, isCurrent && { opacity: 0.5 }]}
                    onPress={() => !isCurrent && handleSelect(item)}
                    disabled={isCurrent}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[ProjectTaskDropdownsStyles.dropdownItemText, isActivityDropdown ? { color: '#d32f2f', fontWeight: 'bold' } : null]}>
                          {renderItem(item)}{isCurrent ? ' (actual)' : ''}
                        </Text>
                      </View>
                      <Text style={{ color: '#d32f2f', fontSize: 13, minWidth: 40, textAlign: 'right' }}>
                        {typeof activityTimes[item.id] !== 'undefined' ? activityTimes[item.id] : 0}
                      </Text>
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
    // ...existing code...
  }, [proyectos]);
  React.useEffect(() => {
    // ...existing code...
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
          renderItem={(item) => item.label || item.value || item.name}
          keyExtractor={(item) => item.id.toString()}
          uid={uid}
          pass={pass}
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



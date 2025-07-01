import React from "react";
import { View, Text } from "react-native";
import * as attendanceHooks from "../../hooks/otros/attendanceHooks";
import styles from "./AttendanceStyles";
import useThemeColors from "../../hooks/useThemeColors";
import { useUserName, usePendingTaskState } from "./indexTs/useAttendanceKioskLogic";
import { StepRenderer } from "./indexTs/StepRenderer";
import {
  useCheckOutWithProgress,
  useStartChangingTask,
} from "./indexTs/attendanceHandlers";
import { handleChangeTask } from '../../ts/handleChangeTask';
import { RPC_URL } from "./otros/config";

/**
 * Componente principal del Kiosko de Asistencia.
 * Orquesta el flujo de registro de asistencia, cambio de tarea y check-in/check-out.
 * Toda la lógica de handlers y renderizado de pasos está extraída a hooks y componentes auxiliares.
 */
export default function AttendanceKiosk(props: {
  uid: number;
  pass: string;
  onLogout?: () => void;
}) {
  // Colores del tema
  const colors = useThemeColors();
  // Obtiene el nombre e inicial del usuario desde Odoo
  const { userName, userInitial } = useUserName(props.uid, props.pass);
  // Estado temporal para cambio de tarea y setters protegidos
  const {
    pendingProject,
    setPendingProject: _setPendingProject,
    pendingTask,
    setPendingTask: _setPendingTask,
    lastDescription,
    setLastDescription,
    lastProgress,
    setLastProgress,
    lastProject, // <-- NUEVO
    setLastProject, // <-- NUEVO
    lastTask, // <-- NUEVO
    setLastTask, // <-- NUEVO
    safeSetPendingProject,
    safeSetPendingTask,
  } = usePendingTaskState();

  // Wrappers para debug (now wrapped in useCallback to avoid useEffect dependency warning)
  const setPendingProject = React.useCallback((project: any) => {
    _setPendingProject(project);
  }, [_setPendingProject]);
  const setPendingTask = React.useCallback((task: any) => {
    _setPendingTask(task);
  }, [_setPendingTask]);

  // Estado para el input de progreso y si se está cambiando de tarea
  const [showChangingTask, setShowChangingTask] = React.useState(false);
  // Hook principal que orquesta el estado global y lógica de asistencia
  const {
    step, // Paso actual del flujo (welcome, checked_in, etc)
    loading, // Estado de carga global
    checkInTime, setCheckInTime, // Hora de entrada y setter
    checkOutTime, setCheckOutTime, // Hora de salida y setter
    workedHours, setWorkedHours, // Horas trabajadas y setter
    selectedProject, setSelectedProject, // Proyecto seleccionado y setter
    selectedTask, setSelectedTask, // Tarea seleccionada y setter
    setStep, // Setter del paso actual
    onLogout, // Handler de logout
    timer, formatTimer, // Timer y formateador
    description, setDescription, // Descripción y setter
    fullTime, // String de tiempo completo
    handleCheckIn, handleCheckOut, // Handlers de check-in y check-out
    fetchEmployeeId, // Función para obtener el id de empleado
    setLastCheckOutTimestamp, setCheckInTimestamp, // Setters de timestamps
    showMessage, // Función para mostrar mensajes
    setLoading, // Setter de loading
    checkInTimestamp, // <-- AÑADIR ESTA LÍNEA
  } = attendanceHooks.useAttendanceMain(props);

  // --- Handlers extraídos a hooks personalizados ---
  // Handler para check-out con progreso y descripción actual
  const handleCheckOutWithProgress = useCheckOutWithProgress({
    description,
    selectedProject,
    selectedTask,
    handleCheckOut: (desc) => {
      handleCheckOut(desc); // Solo descripción
    },
  });
  // Handler para iniciar el flujo de cambio de tarea
  const startChangingTask = useStartChangingTask({
    description,
    setLastDescription,
    setLastProgress,
    setLastProject, // <-- GUARDAR PROYECTO ANTERIOR
    setLastTask,    // <-- GUARDAR TAREA ANTERIOR
    selectedProject,
    selectedTask,
    setShowChangingTask,
    setStep,
  });
  // Handler robusto para cambio de tarea (flujo completo de sign_out y sign_in)
  const handleChangeTaskFlow = async (pendingProject: any, pendingTask: any) => {
    // Usar los valores guardados antes del cambio
    const prevProject = lastProject;
    const prevTask = lastTask;
    const payload = {
      fetchEmployeeId,
      uid: props.uid,
      pass: props.pass,
      setCheckOutTime,
      setLastCheckOutTimestamp,
      setStep: (v: string) => setStep(v as any),
      setSelectedProject,
      setSelectedTask,
      setDescription,
      setLoading,
      showMessage,
      RPC_URL,
      newProject: pendingProject,
      newTask: pendingTask,
      prevProject, // <-- USAR LOS GUARDADOS
      prevTask,    // <-- USAR LOS GUARDADOS
      description,
      checkInTimestamp,
    };
    try {
      const result = await handleChangeTask(payload);
      if (result === false) {
        showMessage && showMessage('Atención', 'No tienes un registro de entrada abierto. Realiza check-in antes de cambiar de tarea.');
        setStep('welcome');
        setLoading(false);
        return;
      }
      setStep("checked_in");
      setPendingProject(null);
      setPendingTask(null);
      setShowChangingTask(false);
    } catch (error) {
      showMessage && showMessage('Error', 'Ocurrió un error al intentar cambiar de tarea.');
    }
  };

  // Handler para avanzar desde CheckedInStep
  const handleNextFromCheckedIn = () => {
    setStep("before_checkout");
    // setProgressInput(""); // Limpiar progreso al avanzar // ELIMINADO
  };

  // Handler para reiniciar desde CheckedOutStep
  const handleRestartFromCheckedOut = () => {
    setStep("welcome");
    setSelectedProject(null);
    setSelectedTask(null);
    setDescription("");
    setCheckInTime("");
    setCheckOutTime("");
    setWorkedHours("");
    // setProgressInput(""); // Limpiar progreso al reiniciar // ELIMINADO
  };

  // Handler para continuar desde selección de proyecto/tarea (ProjectTaskStep)
  const handleContinueFromProjectTask = () => {
    setStep("checked_in");
  };

  // --- Renderizado principal ---
  // El botón "Continuar" ejecuta handleChangeTaskFlow solo en modo cambio de tarea
  const getOnContinue = () => {
    if (step === "changing_task" || showChangingTask) {
      return handleChangeTaskFlow;
    }
    return handleContinueFromProjectTask;
  };

  React.useEffect(() => {
    // ...
  }, [pendingProject, pendingTask]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, marginTop: 50 }]}> 
      {/* Avatar y título del usuario */}
      <View style={styles.centered}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{userName}</Text>
      </View>
      {/* Renderizado de pasos centralizado en StepRenderer */}
      <StepRenderer
        step={step}
        showChangingTask={showChangingTask}
        uid={props.uid}
        pass={props.pass}
        loading={loading}
        checkInTime={checkInTime}
        setCheckInTime={setCheckInTime}
        checkOutTime={checkOutTime}
        setCheckOutTime={setCheckOutTime}
        workedHours={workedHours}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        setStep={setStep}
        onLogout={onLogout}
        timer={timer}
        formatTimer={formatTimer}
        description={description}
        setDescription={setDescription}
        fullTime={fullTime}
        handleCheckIn={handleCheckIn}
        handleCheckOut={handleCheckOut}
        fetchEmployeeId={fetchEmployeeId}
        setLastCheckOutTimestamp={setLastCheckOutTimestamp}
        setCheckInTimestamp={setCheckInTimestamp}
        showMessage={showMessage}
        setLoading={setLoading}
        pendingProject={pendingProject}
        setPendingProject={setPendingProject}
        pendingTask={pendingTask}
        setPendingTask={setPendingTask}
        lastDescription={lastDescription}
        setLastDescription={setLastDescription}
        lastProgress={lastProgress}
        setLastProgress={setLastProgress}
        safeSetPendingProject={safeSetPendingProject}
        safeSetPendingTask={safeSetPendingTask}
        handleCheckOutWithProgress={handleCheckOutWithProgress}
        startChangingTask={startChangingTask}
        handleChangeTaskFlow={handleChangeTaskFlow}
        setShowChangingTask={setShowChangingTask}
        onNext={handleNextFromCheckedIn}
        onRestart={handleRestartFromCheckedOut}
        onContinue={getOnContinue()}
      />
    </View>
  );
}

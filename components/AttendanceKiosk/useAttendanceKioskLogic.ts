import React from "react";
import { useLocation } from "../../hooks/useLocation";
import { handleChangeTask } from '../../ts/handleChangeTask';
import { useAvance } from "../../ts/useProgress";
import { useStartChangingTask } from "./indexTs/attendanceHandlers";
import { usePedirAvanceMsg, usePendingTaskState, useUserName } from "./indexTs/useAttendanceKioskLogic";
import { RPC_URL } from "./otros/config";

interface AttendanceKioskProps {
  uid: number;
  pass: string;
  onLogout?: () => void;
}

interface AttendanceHooks {
  useAttendanceMain: (props: AttendanceKioskProps) => any;
}

export function useAttendanceKioskLogic(
  props: AttendanceKioskProps,
  attendanceHooks: AttendanceHooks
) {
  // Colores del tema
  // Obtiene el nombre e inicial del usuario desde Odoo
  const { userName, userInitial } = useUserName(props.uid, props.pass);
  // Estado temporal para cambio de tarea y setters protegidos
  const {
    pendingProject,
    setPendingProject: _setPendingProject,
    pendingTask,
    setPendingTask: _setPendingTask,
    lastDescription,
    lastProgress,
    lastProject,
    setLastProject,
    lastTask,
    setLastTask,
    safeSetPendingProject,
    safeSetPendingTask,
  } = usePendingTaskState();

  const setPendingProject = React.useCallback((project: any) => {
    _setPendingProject(project);
  }, [_setPendingProject]);
  const setPendingTask = React.useCallback((task: any) => {
    _setPendingTask(task);
  }, [_setPendingTask]);

  const [showChangingTask, setShowChangingTask] = React.useState(false);
  const { avance, setAvance: setAvanceInput } = useAvance();
  const {
    step,
    loading,
    checkInTime, setCheckInTime,
    checkOutTime, setCheckOutTime,
    workedHours, setWorkedHours,
    selectedProject, setSelectedProject,
    selectedTask, setSelectedTask,
    setStep,
    timer, formatTimer,
    observaciones, setObservaciones,
    fullTime,
    handleCheckIn, handleCheckOut,
    fetchEmployeeId,
    setLastCheckOutTimestamp, setCheckInTimestamp,
    showMessage,
    setLoading,
    checkInTimestamp,
    currentTaskStartTimestamp, setCurrentTaskStartTimestamp,
  } = attendanceHooks.useAttendanceMain(props);

  // FORZAR EL PASO A before_checkout PARA DEPURACIÓN
  // (Eliminado: efecto temporal que forzaba el paso a before_checkout para depuración)

  const { error: locationError, getCurrentLocation } = useLocation();
  const [showLocationAlert, setShowLocationAlert] = React.useState(false);
  const [locationAlertMessage, setLocationAlertMessage] = React.useState("");

  const checkLocationBeforeAction = React.useCallback(async () => {
    const location = await getCurrentLocation();
    if (!location) {
      const message = locationError || "No se pudo obtener la ubicación. Verifica que el GPS esté activado y que tengas permisos de ubicación.";
      setLocationAlertMessage(message);
      setShowLocationAlert(true);
      return false;
    }
    return true;
  }, [getCurrentLocation, locationError]);

  const handleLocationRetry = React.useCallback(async () => {
    setShowLocationAlert(false);
    const hasLocation = await checkLocationBeforeAction();
    if (!hasLocation) {
      setTimeout(() => setShowLocationAlert(true), 500);
    }
  }, [checkLocationBeforeAction]);

  // Ref para mantener el valor más reciente de observaciones
  const observacionesRef = React.useRef(observaciones);
  React.useEffect(() => {
    observacionesRef.current = observaciones;
  }, [observaciones]);

  // Wrapper para asegurar que se use SIEMPRE el valor más reciente del input
  const handleCheckOutWithProgress = React.useCallback((obsFromInput?: string) => {
    // Prioridad: argumento directo > ref > estado
    const obsToSend = typeof obsFromInput === 'string'
      ? obsFromInput
      : (typeof observacionesRef.current === 'string' ? observacionesRef.current : observaciones);
    console.log('[useAttendanceKioskLogic] handleCheckOutWithProgress observaciones:', obsToSend, 'avance:', avance);
    setTimeout(() => {
      console.log('[useAttendanceKioskLogic] POST handleCheckOutWithProgress observaciones:', obsToSend);
    }, 0);
    handleCheckOut(obsToSend, avance !== undefined ? avance : undefined);
  }, [avance, handleCheckOut]);
  const startChangingTask = useStartChangingTask({
    observaciones,
    avanceInput: avance !== undefined ? avance.toString() : "",
    setLastProject,
    setLastTask,
    selectedProject,
    selectedTask,
    setShowChangingTask,
    setStep,
  });
  const handleChangeTaskFlow = React.useCallback(async (pendingProject: any, pendingTask: any) => {
    if (!pendingProject || !pendingTask) {
      showMessage && showMessage('Error', 'Por favor selecciona un proyecto y una tarea antes de continuar.');
      return;
    }
    const location = await getCurrentLocation();
    if (!location) {
      const message = locationError || "No se pudo obtener la ubicación. Verifica que el GPS esté activado y que tengas permisos de ubicación.";
      setLocationAlertMessage(message);
      setShowLocationAlert(true);
      return;
    }
    const prevProject = lastProject;
    const prevTask = lastTask;
    const payload = {
      fetchEmployeeId,
      uid: props.uid,
      pass: props.pass,
      setCheckOutTime,
      setLastCheckOutTimestamp,
      setStep: (v: any) => setStep(v),
      setSelectedProject,
      setSelectedTask,
      setObservaciones,
      setLoading,
      showMessage,
      RPC_URL,
      newProject: pendingProject,
      newTask: pendingTask,
      prevProject,
      prevTask,
      observaciones,
      avanceInput: avance !== undefined ? avance.toString() : "",
      checkInTimestamp,
      currentTaskStartTimestamp,
      setCurrentTaskStartTimestamp,
      geo: location,
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
    } catch {
      showMessage && showMessage('Error', 'Ocurrió un error al intentar cambiar de tarea.');
    }
  }, [
    lastProject,
    lastTask,
    avance,
    getCurrentLocation,
    locationError,
    setLocationAlertMessage,
    setShowLocationAlert,
    fetchEmployeeId,
    props.uid,
    props.pass,
    setCheckOutTime,
    setLastCheckOutTimestamp,
    setStep,
    setSelectedProject,
    setSelectedTask,
    setLoading,
    showMessage,
    observaciones,
    setObservaciones,
    checkInTimestamp,
    currentTaskStartTimestamp,
    setCurrentTaskStartTimestamp,
    setPendingProject,
    setPendingTask,
    setShowChangingTask
  ]);

  const handleNextFromCheckedIn = () => {
    setStep("before_checkout");
    setAvanceInput("");
  };
  const handleRestartFromCheckedOut = () => {
    setStep("welcome");
    setSelectedProject(null);
    setSelectedTask(null);
    setObservaciones("");
    setCheckInTime("");
    setCheckOutTime("");
    setWorkedHours("");
    setAvanceInput("");
  };
  const handleContinueFromProjectTask = () => {
    setStep("checked_in");
  };
  const handleContinueFromChangingTask = React.useCallback(() => {
    handleChangeTaskFlow(pendingProject, pendingTask);
  }, [pendingProject, pendingTask, handleChangeTaskFlow]);

  // Hook para pedir avance
  const pedirAvanceMsg = usePedirAvanceMsg(props.uid, props.pass);
  return {
    userName,
    userInitial,
    pendingProject,
    setPendingProject,
    pendingTask,
    setPendingTask,
    // lastDescription, setLastDescription, lastProgress, setLastProgress removed (migrated to observaciones/avance)
    lastProject,
    setLastProject,
    lastTask,
    setLastTask,
    safeSetPendingProject,
    safeSetPendingTask,
    showChangingTask,
    setShowChangingTask,
    avance,
    setAvanceInput,
    step,
    loading,
    checkInTime,
    setCheckInTime,
    checkOutTime,
    setCheckOutTime,
    workedHours,
    setWorkedHours,
    selectedProject,
    setSelectedProject,
    selectedTask,
    setSelectedTask,
    setStep,
    timer,
    formatTimer,
    observaciones,
    setObservaciones,
    fullTime,
    handleCheckIn,
    handleCheckOut,
    fetchEmployeeId,
    setLastCheckOutTimestamp,
    setCheckInTimestamp,
    showMessage,
    setLoading,
    checkInTimestamp,
    currentTaskStartTimestamp,
    setCurrentTaskStartTimestamp,
    handleCheckOutWithProgress,
    startChangingTask,
    handleChangeTaskFlow,
    handleNextFromCheckedIn,
    handleRestartFromCheckedOut,
    handleContinueFromProjectTask,
    handleContinueFromChangingTask,
    showLocationAlert,
    setShowLocationAlert,
    locationAlertMessage,
    setLocationAlertMessage,
    handleLocationRetry,
    pedirAvanceMsg
  };
}

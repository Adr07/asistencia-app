import React from "react";
import { useLocation } from "../../hooks/useLocation";
import { handleChangeTask } from '../../ts/handleChangeTask';
import { useProgress } from "../../ts/useProgress";
import { useCheckOutWithProgress, useStartChangingTask } from "./indexTs/attendanceHandlers";
import { usePendingTaskState, useUserName } from "./indexTs/useAttendanceKioskLogic";
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
    setLastDescription,
    lastProgress,
    setLastProgress,
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
  const { progress, setProgress: setProgressInput } = useProgress();
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
    description, setDescription,
    fullTime,
    handleCheckIn, handleCheckOut,
    fetchEmployeeId,
    setLastCheckOutTimestamp, setCheckInTimestamp,
    showMessage,
    setLoading,
    checkInTimestamp,
    currentTaskStartTimestamp, setCurrentTaskStartTimestamp,
  } = attendanceHooks.useAttendanceMain(props);

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

  const handleCheckOutWithProgress = useCheckOutWithProgress({
    description,
    progressInput: progress !== undefined ? progress.toString() : "",
    selectedProject,
    selectedTask,
    handleCheckOut: (desc, prog) => {
      handleCheckOut(desc, prog);
    },
  });
  const startChangingTask = useStartChangingTask({
    description,
    progressInput: progress !== undefined ? progress.toString() : "",
    setLastDescription,
    setLastProgress,
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
      setDescription,
      setLoading,
      showMessage,
      RPC_URL,
      newProject: pendingProject,
      newTask: pendingTask,
      prevProject,
      prevTask,
      description,
      progressInput: lastProgress || "",
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
    lastProgress,
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
    setDescription,
    setLoading,
    showMessage,
    description,
    checkInTimestamp,
    currentTaskStartTimestamp,
    setCurrentTaskStartTimestamp,
    setPendingProject,
    setPendingTask,
    setShowChangingTask
  ]);

  const handleNextFromCheckedIn = () => {
    setStep("before_checkout");
    setProgressInput("");
  };
  const handleRestartFromCheckedOut = () => {
    setStep("welcome");
    setSelectedProject(null);
    setSelectedTask(null);
    setDescription("");
    setCheckInTime("");
    setCheckOutTime("");
    setWorkedHours("");
    setProgressInput("");
  };
  const handleContinueFromProjectTask = () => {
    setStep("checked_in");
  };
  const handleContinueFromChangingTask = React.useCallback(() => {
    handleChangeTaskFlow(pendingProject, pendingTask);
  }, [pendingProject, pendingTask, handleChangeTaskFlow]);

  return {
    userName,
    userInitial,
    pendingProject,
    setPendingProject,
    pendingTask,
    setPendingTask,
    lastDescription,
    setLastDescription,
    lastProgress,
    setLastProgress,
    lastProject,
    setLastProject,
    lastTask,
    setLastTask,
    safeSetPendingProject,
    safeSetPendingTask,
    showChangingTask,
    setShowChangingTask,
    progress,
    setProgressInput,
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
    description,
    setDescription,
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
    handleLocationRetry
  };
}

import * as React from "react";
import {
    BeforeCheckoutStep,
    CheckedInStep,
    CheckedOutStep,
    ProjectTaskStep
} from "../AttendanceSteps";

/**
 * Componente que renderiza el paso actual del flujo de asistencia según el valor de step.
 * Recibe todos los props necesarios para cada paso.
 */
export function StepRenderer({
  step,
  showChangingTask,
  uid,
  pass,
  ...props
}: any) {
  switch (step) {
    case "welcome":
      if (showChangingTask) {
        return (
          <ProjectTaskStep
            mode="welcome"
            uid={uid}
            pass={pass}
            onCheckIn={props.handleCheckIn}
            onLogout={props.onLogout}
            onContinue={props.onContinue}
            // Pass only the props defined in ProjectTaskStepProps
            loading={props.loading}
            selectedProject={props.selectedProject}
            selectedTask={props.selectedTask}
            setSelectedProject={props.setSelectedProject}
            setSelectedTask={props.setSelectedTask}
            observaciones={props.observaciones}
            setObservaciones={props.setObservaciones}
            pendingProject={props.pendingProject}
            pendingTask={props.pendingTask}
            // setPendingProject y setPendingTask no existen en ProjectTaskStepProps, solo pendingProject/pendingTask
            safeSetPendingProject={props.safeSetPendingProject}
            safeSetPendingTask={props.safeSetPendingTask}
            // handleChangeTaskFlow no existe en ProjectTaskStepProps
            avanceInput={props.avanceInput}
            setAvanceInput={props.setAvanceInput}
            currentProject={props.currentProject}
            currentTask={props.currentTask}
            pedirAvanceMsg={props.pedirAvanceMsg}
          />
        );
      }
      return (
        <ProjectTaskStep
          mode="welcome"
          uid={uid}
          pass={pass}
          onCheckIn={props.handleCheckIn}
          onLogout={props.onLogout}
          onContinue={props.onContinue}
          // Pass only the props defined in ProjectTaskStepProps
          loading={props.loading}
          selectedProject={props.selectedProject}
          selectedTask={props.selectedTask}
          setSelectedProject={props.setSelectedProject}
          setSelectedTask={props.setSelectedTask}
          observaciones={props.observaciones}
          setObservaciones={props.setObservaciones}
          pendingProject={props.pendingProject}
          pendingTask={props.pendingTask}
          // setPendingProject y setPendingTask no existen en ProjectTaskStepProps, solo pendingProject/pendingTask
          safeSetPendingProject={props.safeSetPendingProject}
          safeSetPendingTask={props.safeSetPendingTask}
          // handleChangeTaskFlow no existe en ProjectTaskStepProps
          avanceInput={props.avanceInput}
          setAvanceInput={props.setAvanceInput}
          currentProject={props.currentProject}
          currentTask={props.currentTask}
          pedirAvanceMsg={props.pedirAvanceMsg}
        />
      );
    case "checked_in":
      return (
        <CheckedInStep
          checkInTime={props.checkInTime}
          onNext={props.onNext}
          timer={props.timer}
          formatTimer={props.formatTimer}
          loading={props.loading}
          observaciones={props.observaciones}
          setObservaciones={props.setObservaciones}
          avanceInput={props.avanceInput}
          setAvanceInput={props.setAvanceInput}
          selectedProject={props.selectedProject}
          selectedTask={props.selectedTask}
        />
      );
    case "before_checkout":
      return (
        <BeforeCheckoutStep
          onCheckOut={(observaciones, quality) => props.handleCheckOutWithProgress(observaciones, quality)}
          onChangeTask={props.startChangingTask}
          workedHours={props.workedHours}
          loading={props.loading}
          timer={props.timer}
          formatTimer={props.formatTimer}
          observaciones={props.observaciones}
          setObservaciones={props.setObservaciones}
          avanceInput={props.avanceInput}
          setAvanceInput={props.setAvanceInput}
          selectedProject={props.selectedProject}
          selectedTask={props.selectedTask}
        />
      );
    case "changing_task":
      return (
        <ProjectTaskStep
          mode="changing_task"
          uid={uid}
          pass={pass}
          onCheckIn={props.handleCheckIn}
          onLogout={props.onLogout}
          onContinue={props.onContinue}
          onCancel={() => {
            // Al cancelar, volver al paso anterior y limpiar selección temporal
            if (props.setShowChangingTask) props.setShowChangingTask(false);
            if (props.setPendingProject) props.setPendingProject(null);
            if (props.setPendingTask) props.setPendingTask(null);
            if (props.setStep) props.setStep("before_checkout");
          }}
          // Pass only the props defined in ProjectTaskStepProps
          loading={props.loading}
          selectedProject={props.selectedProject}
          selectedTask={props.selectedTask}
          // For changing_task mode, use the wrapper functions as the setters
          setSelectedProject={props.safeSetPendingProject}
          setSelectedTask={props.safeSetPendingTask}
          observaciones={props.observaciones}
          setObservaciones={props.setObservaciones}
          avanceInput={props.avanceInput}
          setAvanceInput={props.setAvanceInput}
          pendingProject={props.pendingProject}
          pendingTask={props.pendingTask}
          // setPendingProject y setPendingTask no existen en ProjectTaskStepProps, solo pendingProject/pendingTask
          safeSetPendingProject={props.safeSetPendingProject}
          safeSetPendingTask={props.safeSetPendingTask}
          // handleChangeTaskFlow no existe en ProjectTaskStepProps
          currentProject={props.currentProject}
          currentTask={props.currentTask}
        />
      );
    case "checked_out":
      return (
        <CheckedOutStep
          onRestart={props.onRestart}
          onLogout={props.onLogout}
          checkOutTime={props.checkOutTime}
          workedHours={props.workedHours}
          fullTime={props.fullTime}
        />
      );
    default:
      return null;
  }
}

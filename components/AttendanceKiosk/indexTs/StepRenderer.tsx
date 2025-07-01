import React from "react";
import {
  WelcomeStep,
  CheckedInStep,
  CheckedOutStep,
  BeforeCheckoutStep,
  ProjectTaskStep,
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
            progressInput={props.progressInput}
            setProgressInput={props.setProgressInput}
            onContinue={props.onContinue}
            {...props}
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
          progressInput={props.progressInput}
          setProgressInput={props.setProgressInput}
          onContinue={props.onContinue}
          {...props}
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
          description={props.description}
          setDescription={props.setDescription}
          // progressInput={props.progressInput}
          // setProgressInput={props.setProgressInput}
        />
      );
    case "before_checkout":
      return (
        <BeforeCheckoutStep
          onCheckOut={props.handleCheckOutWithProgress}
          onChangeTask={props.startChangingTask}
          {...props}
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
          progressInput={props.progressInput}
          setProgressInput={props.setProgressInput}
          onContinue={() =>
            props.handleChangeTaskFlow(props.pendingProject, props.pendingTask)
          }
          setPendingProject={props.setPendingProject}
          setPendingTask={props.setPendingTask}
          pendingProject={props.pendingProject}
          pendingTask={props.pendingTask}
          onCancel={() => {
            // Al cancelar, volver al paso anterior y limpiar selección temporal
            if (props.setShowChangingTask) props.setShowChangingTask(false);
            if (props.setPendingProject) props.setPendingProject(null);
            if (props.setPendingTask) props.setPendingTask(null);
            if (props.setStep) props.setStep("before_checkout");
          }}
          {...props}
        />
      );
    case "checked_out":
      return (
        <CheckedOutStep
          onRestart={props.onRestart}
          onLogout={props.onLogout}
          {...props}
        />
      );
    default:
      return null;
  }
}

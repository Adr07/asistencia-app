import React from "react";
import { Text, View } from "react-native";
import * as attendanceHooks from "../../hooks/otros/attendanceHooks";
import useThemeColors from "../../hooks/useThemeColors";
import { LocationAlert } from "../LocationAlert";
import styles from "./AttendanceStyles";
import { StepRenderer } from "./indexTs/StepRenderer";
import { useAttendanceKioskLogic } from "./useAttendanceKioskLogic";

/**
 * Componente principal del Kiosko de Asistencia.
 * Orquesta el flujo de registro de asistencia, cambio de tarea y check-in/check-out.
 * Toda la lógica de handlers y renderizado de pasos está extraída a hooks y componentes auxiliares.
 */

interface AttendanceKioskProps {
  uid: number;
  pass: string;
  onLogout?: () => void;
}

const AttendanceKiosk = (props: AttendanceKioskProps) => {
  const colors = useThemeColors();
  const logic = useAttendanceKioskLogic(props, attendanceHooks);
  return (
    <View style={[styles.container, { backgroundColor: colors.background, marginTop: 50 }]}> 
      {/* Avatar y título del usuario */}
      <View style={styles.centered}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{logic.userInitial}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{logic.userName}</Text>
      </View>
      <StepRenderer
        step={logic.step}
        showChangingTask={logic.showChangingTask}
        uid={props.uid}
        pass={props.pass}
        loading={logic.loading}
        checkInTime={logic.checkInTime}
        setCheckInTime={logic.setCheckInTime}
        checkOutTime={logic.checkOutTime}
        setCheckOutTime={logic.setCheckOutTime}
        workedHours={logic.workedHours}
        selectedProject={logic.selectedProject}
        setSelectedProject={logic.setSelectedProject}
        selectedTask={logic.selectedTask}
        setSelectedTask={logic.setSelectedTask}
        setStep={logic.setStep}
        onLogout={props.onLogout}
        timer={logic.timer}
        formatTimer={logic.formatTimer}
        description={logic.description}
        setDescription={logic.setDescription}
        fullTime={logic.fullTime}
        handleCheckIn={logic.handleCheckIn}
        handleCheckOut={logic.handleCheckOut}
        fetchEmployeeId={logic.fetchEmployeeId}
        setLastCheckOutTimestamp={logic.setLastCheckOutTimestamp}
        setCheckInTimestamp={logic.setCheckInTimestamp}
        showMessage={logic.showMessage}
        setLoading={logic.setLoading}
        pendingProject={logic.pendingProject}
        setPendingProject={logic.setPendingProject}
        pendingTask={logic.pendingTask}
        setPendingTask={logic.setPendingTask}
        lastDescription={logic.lastDescription}
        setLastDescription={logic.setLastDescription}
        lastProgress={logic.lastProgress}
        setLastProgress={logic.setLastProgress}
        progressInput={logic.progress !== undefined ? logic.progress.toString() : ""}
        setProgressInput={logic.setProgressInput}
        safeSetPendingProject={logic.safeSetPendingProject}
        safeSetPendingTask={logic.safeSetPendingTask}
        handleCheckOutWithProgress={logic.handleCheckOutWithProgress}
        startChangingTask={logic.startChangingTask}
        handleChangeTaskFlow={logic.handleChangeTaskFlow}
        setShowChangingTask={logic.setShowChangingTask}
        onNext={logic.handleNextFromCheckedIn}
        onRestart={logic.handleRestartFromCheckedOut}
        onContinue={logic.step === "changing_task" || logic.showChangingTask ? logic.handleContinueFromChangingTask : logic.handleContinueFromProjectTask}
        currentProject={logic.selectedProject}
        currentTask={logic.selectedTask}
      />
      <LocationAlert
        visible={logic.showLocationAlert}
        message={logic.locationAlertMessage}
        onRetry={logic.handleLocationRetry}
        onCancel={() => logic.setShowLocationAlert(false)}
      />
    </View>
  );
};

export default AttendanceKiosk;

import React from "react";
import { Text, View } from "react-native";
import * as attendanceHooks from "../../hooks/otros/attendanceHooks";
import useThemeColors from "../../hooks/useThemeColors";
import { useEmployeeInfo } from "../../ts/useEmployeeInfo";
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
  const colors = useThemeColors({ light: undefined, dark: undefined }, 'text');
  const logic = useAttendanceKioskLogic(props, attendanceHooks);
  const employeeInfo = useEmployeeInfo(props.uid, props.pass);

  // Log para depuración: ¿el componente se reinicia?
  React.useEffect(() => {
    console.log('[AttendanceKiosk] Render, step actual:', logic.step);
  });

  return (
    <View style={[styles.container, { flex: 1 }]}> 
      {/* Avatar y título del usuario */}
      <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 50 }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{logic.userInitial}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{logic.userName}</Text>
        {/* Info de bolsa de horas y vacaciones */}
        {employeeInfo && (
          <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 15 }}>
              Bolsa de Horas <Text style={{ fontWeight: 'bold' }}>{employeeInfo.bolsa_horas_numero ?? '—'}</Text>
            </Text>
            <Text style={{ color: colors.text, fontSize: 15, marginHorizontal: 8 }}>|</Text>
            <Text style={{ color: colors.text, fontSize: 15 }}>
              Vacaciones disponibles <Text style={{ fontWeight: 'bold' }}>{employeeInfo.remaining_leaves ?? '—'}</Text>
            </Text>
          </View>
        )}
      </View>
      {/* Renderiza el paso actual, cada paso maneja su propio layout y padding */}
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
        observaciones={logic.observaciones}
        setObservaciones={logic.setObservaciones}
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
        // lastDescription, setLastDescription, lastProgress, setLastProgress removed (migrated to observaciones/avance)
        avanceInput={logic.avance !== undefined ? logic.avance.toString() : ""}
        setAvanceInput={logic.setAvanceInput}
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
        pedirAvanceMsg={logic.pedirAvanceMsg}
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

// export default AttendanceKiosk;
export default AttendanceKiosk;


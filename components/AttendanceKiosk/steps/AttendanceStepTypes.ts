// Tipos centralizados para los steps de asistencia

export interface CheckedOutStepProps {
  checkOutTime: string;
  workedHours?: string;
  fullTime: string;
  onRestart: () => void;
  onLogout?: () => void;
}

export interface CheckedInStepProps {
  checkInTime: string;
  onNext: () => void;
  timer: number;
  formatTimer: (t: number) => string;
  loading?: boolean;
  observaciones?: string;
  setObservaciones?: (v: string) => void;
  avanceInput?: string;
  setAvanceInput?: (v: string) => void;
}

export interface BeforeCheckoutStepProps {
  workedHours?: string;
  onCheckOut: (observaciones: string, quality: boolean) => void;
  onChangeTask: () => void;
  loading?: boolean;
  timer: number;
  formatTimer: (t: number) => string;
  observaciones: string;
  setObservaciones: (v: string) => void;
  avanceInput?: string;
  setAvanceInput?: (v: string) => void;
}

export interface ProjectTaskStepProps {
  loading?: boolean;
  uid: number;
  pass: string;
  selectedProject: any;
  selectedTask: any;
  setSelectedProject: (p: any) => void;
  setSelectedTask: (t: any) => void;
  onCheckIn?: (observaciones?: string) => void;
  onLogout?: () => void;
  onCancel?: () => void;
  onContinue?: () => void;
  mode: 'welcome' | 'changing_task';
  continueButtonColor?: string;
  pendingProject?: any;
  pendingTask?: any;
  safeSetPendingProject?: (p: any) => void;
  safeSetPendingTask?: (t: any) => void;
  currentProject?: any;
  currentTask?: any;
  pedirAvanceMsg?: string;
  observaciones?: string;
  setObservaciones?: (v: string) => void;
  avanceInput?: string;
  setAvanceInput?: (v: string) => void;
}

export interface WelcomeStepProps {
  loading?: boolean;
  onCheckIn?: () => void;
  onLogout?: () => void;
  selectedProject: any;
  selectedTask: any;
  setSelectedProject: (p: any) => void;
  setSelectedTask: (t: any) => void;
  uid: number;
  pass: string;
  description?: string;
  setDescription?: (v: string) => void;
  onCancel?: () => void;
  onContinue?: () => void;
}

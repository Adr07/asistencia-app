// AttendanceStepTypes.ts
// Tipos compartidos para los componentes de pasos del flujo de asistencia.
// Centraliza las props y tipos usados en WelcomeStep, CheckedInStep, CheckedOutStep, BeforeCheckoutStep, ProjectTaskStep, etc.

// Si se definen interfaces para Project/Task, reemplazar 'any' por el tipo correcto.

type Project = any;
type Task = any;

// Props para el paso de bienvenida
export interface WelcomeStepProps {
  loading: boolean;
  onCheckIn?: () => void;
  onLogout?: () => void;
  selectedProject: Project | null;
  selectedTask: Task | null;
  setSelectedProject: (project: Project | null) => void;
  setSelectedTask: (task: Task | null) => void;
  uid: number;
  pass: string;
  description?: string;
  setDescription?: (desc: string) => void;
  onCancel?: () => void;
  onContinue?: () => void;
}

// Props para el paso de check-in
export interface CheckedInStepProps {
  checkInTime: string;
  onNext: () => void;
  timer: number;
  formatTimer: (t: number) => string;
  description: string;
  setDescription: (desc: string) => void;
  loading?: boolean;
}

// Props para el paso de check-out
export interface CheckedOutStepProps {
  checkOutTime: string;
  workedHours?: number;
  fullTime: string;
  onRestart: () => void;
  onLogout?: () => void;
}

// Props para el paso previo al check-out
export interface BeforeCheckoutStepProps {
  workedHours: number;
  onCheckOut: () => void;
  onChangeTask: () => void;
  loading: boolean;
  timer: number;
  formatTimer: (t: number) => string;
  description: string;
  setDescription: (desc: string) => void;
}

// Props para el paso de selección de proyecto/tarea (ProjectTaskStep)
export interface ProjectTaskStepProps {
  loading: boolean;
  uid: number;
  pass: string;
  selectedProject: Project | null;
  selectedTask: Task | null;
  setSelectedProject: (project: Project | null) => void;
  setSelectedTask: (task: Task | null) => void;
  description?: string;
  setDescription?: (desc: string) => void;
  onCheckIn?: () => void;
  onLogout?: () => void;
  onCancel?: () => void;
  onContinue?: () => void;
  mode?: string;
  continueButtonColor?: string;
  pendingProject?: Project | null;
  pendingTask?: Task | null;
  setPendingProject?: (project: Project | null) => void;
  setPendingTask?: (task: Task | null) => void;
  safeSetPendingProject?: (project: Project | null) => void;
  safeSetPendingTask?: (task: Task | null) => void;
  handleChangeTaskFlow?: (pendingProject: Project | null, pendingTask: Task | null) => void | Promise<void>;
}

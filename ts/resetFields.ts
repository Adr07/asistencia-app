export function resetFields({
  setSelectedProject,
  setSelectedTask,
  setDescription,
  setCheckInTimestamp
}: {
  setSelectedProject: (v: any) => void;
  setSelectedTask: (v: any) => void;
  setDescription: (v: string) => void;
  setCheckInTimestamp: (v: number | null) => void;
}) {
  setSelectedProject(null);
  setSelectedTask(null);
  setDescription("");
  setCheckInTimestamp(null);
}

import { useEffect } from "react";

export function useInternalProjectExclusion(selectedProject: any, setSelectedProject: (v: any) => void) {
  useEffect(() => {
    setSelectedProject((prev: any | null) => {
      if (prev && (prev.id === 1 || prev.name?.toLowerCase().includes("interno"))) {
        return null;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);
}

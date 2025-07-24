import * as Location from "expo-location";

function isWebOrElectron() {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    // Detect Electron
    // @ts-ignore
    if (navigator.userAgent && navigator.userAgent.includes('Electron')) {
      return true;
    }
    // Detect web
    if (typeof window.document !== 'undefined') {
      return true;
    }
  }
  return false;
}

export function useLocation() {
  const getLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    if (isWebOrElectron()) {
      // Web/Electron: usar navigator.geolocation
      return new Promise((resolve) => {
        if (!('geolocation' in navigator)) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          },
          () => {
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    } else {
      // Móvil: usar expo-location
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return null;
        const location = await Location.getCurrentPositionAsync({});
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      } catch {
        return null;
      }
    }
  };
  return getLocation;
}

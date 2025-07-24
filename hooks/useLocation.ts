/**
 * Hook para capturar la ubicación actual del usuario
 * 
 * Este hook obtiene las coordenadas GPS del dispositivo para incluirlas
 * en los registros de asistencia y verificar que el empleado esté en
 * el lugar de trabajo correcto.
 */

import * as Location from 'expo-location';
import { useState } from 'react';

function isWebOrElectron() {
  // Expo define process.env.EXPO_WEB or navigator.userAgent for web/Electron
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

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: number;
}

export interface UseLocationResult {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<LocationData | null>;
  clearLocation: () => void;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);
    if (isWebOrElectron()) {
      // Web/Electron: usar navigator.geolocation
      return new Promise<LocationData | null>((resolve) => {
        if (!('geolocation' in navigator)) {
          setError('La geolocalización no está soportada en este navegador.');
          setIsLoading(false);
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const locationData: LocationData = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy ?? undefined,
              altitude: pos.coords.altitude ?? undefined,
              timestamp: pos.timestamp,
            };
            setLocation(locationData);
            setIsLoading(false);
            resolve(locationData);
          },
          (err) => {
            let errorMessage = 'No se pudo obtener la ubicación.';
            if (err.code === 1) {
              errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a la ubicación.';
            } else if (err.code === 2) {
              errorMessage = 'Ubicación no disponible. Verifica tu conexión o el GPS.';
            } else if (err.code === 3) {
              errorMessage = 'La solicitud de ubicación expiró. Intenta de nuevo.';
            }
            setError(errorMessage);
            setIsLoading(false);
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    } else {
      // Móvil: usar expo-location
      try {
        // Verificar que tenemos permisos
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const errorMsg = 'Los permisos de ubicación son necesarios para continuar. Por favor, activa la ubicación en la configuración de la app.';
          setError(errorMsg);
          return null;
        }

        // Verificar que el GPS esté habilitado
        const isLocationEnabled = await Location.hasServicesEnabledAsync();
        if (!isLocationEnabled) {
          const errorMsg = 'El GPS está desactivado. Por favor, activa la ubicación en los ajustes del dispositivo para continuar.';
          setError(errorMsg);
          return null;
        }

        // Obtener ubicación actual con alta precisión
        const locationResult = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 1,
        });

        const locationData: LocationData = {
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
          accuracy: locationResult.coords.accuracy ?? undefined,
          altitude: locationResult.coords.altitude ?? undefined,
          timestamp: locationResult.timestamp,
        };

        setLocation(locationData);
        return locationData;

      } catch (err) {
        // Manejo seguro de errores sin generar errores internos
        let errorMessage = 'Error al obtener ubicación';
        try {
          if (err instanceof Error) {
            if (err.message.includes('Location request timed out')) {
              errorMessage = 'No se pudo obtener la ubicación. Verifica que el GPS esté activado y que tengas buena señal.';
            } else if (err.message.includes('Location services are disabled')) {
              errorMessage = 'Los servicios de ubicación están desactivados. Por favor, actívalos en la configuración del dispositivo.';
            } else if (err.message.includes('Permission denied')) {
              errorMessage = 'Permisos de ubicación denegados. Por favor, activa los permisos en la configuración de la app.';
            } else if (err.message.includes('Network request failed')) {
              errorMessage = 'No se pudo obtener la ubicación. Verifica tu conexión a internet y el GPS.';
            } else {
              errorMessage = 'No se pudo obtener la ubicación. Verifica que el GPS esté activado.';
            }
          } else {
            errorMessage = 'No se pudo obtener la ubicación. Verifica que el GPS esté activado.';
          }
        } catch {
          errorMessage = 'No se pudo obtener la ubicación. Verifica que el GPS esté activado.';
        }
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    clearLocation,
  };
}

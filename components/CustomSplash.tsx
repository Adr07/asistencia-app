import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

export default function CustomSplash({ onReady }: { onReady: () => void }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    // Simula carga de recursos personalizados
    setTimeout(() => {
      setIsReady(true);
      onReady();
    }, 1200); // Cambia el tiempo según tu lógica
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' }}>
        <Image source={require('../assets/images/logo_app.png')} style={{ width: 100, height: 100, marginBottom: 24 }} />
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>Cargando Asistencia App</Text>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  return null;
}

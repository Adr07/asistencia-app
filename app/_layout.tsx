
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
// import CustomSplash from '../components/CustomSplash';
import { LocationPermissionWrapper } from '../components/LocationPermissionWrapper';
import { useColorScheme } from '../hooks/useColorScheme';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  // const [splashDone, setSplashDone] = useState(false);

  // Prevent Expo splash from auto-hiding immediately
  // useEffect(() => {
  //   SplashScreen.preventAutoHideAsync();
  // }, []);

  if (!loaded) {
    return null;
  }

  return (
    <LocationPermissionWrapper>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </LocationPermissionWrapper>
  );
}

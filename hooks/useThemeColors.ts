// hooks/useThemeColors.ts
import { useColorScheme } from 'react-native';

const Colors = {
  light: {
    background: '#ffffff',
    text: '#000000',
    buttonBg: '#007AFF',
    buttonText: '#ffffff',
  },
  dark: {
    background: '#000000',
    text: '#ffffff',
    buttonBg: '#0A84FF',
    buttonText: '#ffffff',
  },
};

export default function useThemeColors(p0: { light: string | undefined; dark: string | undefined; }, p1: string) {
  const scheme = useColorScheme(); // 'dark', 'light', o null :contentReference[oaicite:1]{index=1}
  return scheme === 'dark' ? Colors.dark : Colors.light;
}

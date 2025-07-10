import { View, type ViewProps } from 'react-native';

// import { useThemeColor } from '../hooks/useThemeColor';
import useThemeColors from "../hooks/useThemeColors";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;useThemeColors
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const colors = useThemeColors({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor: colors.background }, style]} {...otherProps} />;
}

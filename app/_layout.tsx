import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import '../i18n'; // Init i18n

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavDefaultTheme,
  reactNavigationDark: NavDarkTheme,
});

import Colors from '../constants/Colors';

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: Colors.jules.primary,
    secondary: Colors.jules.secondary,
    tertiary: Colors.jules.tertiary,
    background: Colors.light.background,
    surface: Colors.light.surface,
    onBackground: Colors.jules.text,
    onSurface: Colors.jules.text,
    surfaceVariant: Colors.jules.surfaceVariant,
    onSurfaceVariant: Colors.jules.textSecondary,
    primaryContainer: Colors.jules.surfaceVariant,
    onPrimaryContainer: Colors.jules.text,
    outline: Colors.jules.border,
    outlineVariant: Colors.jules.border,
    // Navigation compat fields
    text: Colors.jules.text,
    card: Colors.light.surface,
    border: Colors.jules.border,
    notification: Colors.jules.secondary,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    ...LightTheme.fonts,
  },
};

const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: Colors.jules.primary,
    secondary: Colors.jules.secondary,
    tertiary: Colors.jules.tertiary,
    background: Colors.dark.background,
    surface: Colors.dark.surface,
    onBackground: Colors.jules.text,
    onSurface: Colors.jules.text,
    surfaceVariant: Colors.jules.surfaceVariant,
    onSurfaceVariant: Colors.jules.textSecondary,
    primaryContainer: Colors.jules.surfaceVariant,
    onPrimaryContainer: Colors.jules.text,
    outline: Colors.jules.border,
    outlineVariant: Colors.jules.border,
    // Navigation compat fields
    text: Colors.jules.text,
    card: Colors.dark.surface,
    border: Colors.jules.border,
    notification: Colors.jules.secondary,
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    ...DarkTheme.fonts,
  },
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;
  const { t } = useTranslation();

  return (
    <PaperProvider theme={theme as any}>
      <ThemeProvider value={theme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="session/[id]" options={{ presentation: 'card', title: t('sessionDetail') }} />
          <Stack.Screen name="create" options={{ presentation: 'modal', title: t('createSession') }} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}

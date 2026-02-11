import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './src/contexts/AppContext';
import { RemoteProvider } from './src/contexts/RemoteContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { i18n } from './src/i18n';
import {
  HomeScreen,
  EditorScreen,
  TeleprompterScreen,
  SettingsScreen,
  RemoteModeScreen,
  RemoteControlScreen,
} from './src/screens';
import { COLORS } from './src/constants/theme';

export type RootStackParamList = {
  Home: undefined;
  Editor: { scriptId?: string };
  Teleprompter: { scriptId: string };
  Settings: undefined;
  RemoteMode: undefined;
  RemoteControl: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    i18n.init();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <RemoteProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Editor" component={EditorScreen} />
              <Stack.Screen
                name="Teleprompter"
                component={TeleprompterScreen}
                options={{ animation: 'fade' }}
              />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="RemoteMode" component={RemoteModeScreen} />
              <Stack.Screen name="RemoteControl" component={RemoteControlScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          </RemoteProvider>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

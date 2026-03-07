import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// --- DESIGN SYSTEM ---
import { COLORS } from './src/styles/theme';

// --- IMPORTACIÓN DE PANTALLAS ---
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import DayDetailScreen from './src/screens/DayDetailScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import TimerScreen from './src/screens/TimerScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';

// --- SERVICIOS LOCALES ---
import { initDatabase } from './src/database/db_pomodoro';
import { RootStackParamList } from './src/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.primary,
    primary: COLORS.secondary,
  },
};

const commonStackOptions = {
  headerStyle: { backgroundColor: COLORS.white },
  headerTintColor: COLORS.secondary,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: 17 },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  animation: 'slide_from_right' as const,
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={commonStackOptions}>
      <Stack.Screen name="Inicio" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Tarea' }} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Nueva Tarea' }} />
      <Stack.Screen name="Timer" component={TimerScreen} options={{ title: 'Enfoque', headerBackVisible: false, gestureEnabled: false }} />
    </Stack.Navigator>
  );
}

function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={commonStackOptions}>
      <Stack.Screen name="Calendario" component={CalendarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetalleDia" component={DayDetailScreen} options={{ title: 'Historial' }} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Nueva Tarea' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Tarea' }} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any = route.name === 'HomeStack' ? 'home' : 'calendar';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: { 
          backgroundColor: COLORS.white, 
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeStack} options={{ title: 'Hoy' }} />
      <Tab.Screen name="CalendarioTab" component={CalendarStack} options={{ title: 'Historial' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer theme={MyTheme}>
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

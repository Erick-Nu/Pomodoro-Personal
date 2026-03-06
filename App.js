import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// --- IMPORTACIÓN DE PANTALLAS ---
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import DayDetailScreen from './src/screens/DayDetailScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import TimerScreen from './src/screens/TimerScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';

// --- SERVICIOS LOCALES ---
import { initDatabase } from './src/database/db_pomodoro';

// Configuración global de notificaciones para que funcionen con la app abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldVibrate: true,
  }),
});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Stack para la sección principal (Home).
 * Gestiona el flujo desde la lista de hoy hasta la creación y el cronómetro.
 */
function HomeStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#1a1a2e' }, 
        headerTintColor: '#f1f5f9',
        headerTitleStyle: { fontWeight: 'bold' },
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen 
        name="Inicio" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen} 
        options={{ title: 'Detalle de Tarea' }} 
      />
      <Stack.Screen 
        name="AddTask" 
        component={AddTaskScreen} 
        options={{ title: 'Nueva Tarea' }} 
      />
      <Stack.Screen 
        name="Timer" 
        component={TimerScreen} 
        options={{ 
          title: 'Sesión de Enfoque',
          headerBackVisible: false,
          gestureEnabled: false
        }} 
      />
    </Stack.Navigator>
  );
}

/**
 * Stack para el Calendario.
 * Gestiona la navegación entre la vista mensual y el detalle diario.
 */
function CalendarStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#1a1a2e' }, 
        headerTintColor: '#f1f5f9',
        animation: 'fade_from_bottom'
      }}
    >
      <Stack.Screen 
        name="Calendario" 
        component={CalendarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DetalleDia" 
        component={DayDetailScreen} 
        options={({ route }) => ({ 
          title: 'Detalle del Día',
          headerStyle: { backgroundColor: '#1a1a2e' },
        })} 
      />
      <Stack.Screen 
        name="AddTask" 
        component={AddTaskScreen} 
        options={{ title: 'Nueva Tarea' }} 
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen} 
        options={{ title: 'Detalle de Tarea' }} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  
  useEffect(() => {
    // 1. Inicializar SQLite al arrancar el APK
    initDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator 
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'HomeStack') {
                iconName = 'home';
              } else if (route.name === 'CalendarioTab') {
                iconName = 'calendar';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4ade80',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: { 
              backgroundColor: '#0f0f23', 
              borderTopWidth: 1,
              borderTopColor: 'rgba(71, 85, 105, 0.3)',
              height: Platform.OS === 'ios' ? 85 : 70,
              paddingBottom: Platform.OS === 'ios' ? 30 : 15,
              paddingTop: 10
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerShown: false,
          })}
        >
          <Tab.Screen 
            name="HomeStack" 
            component={HomeStack} 
            options={{ title: 'Hoy' }} 
          />
          <Tab.Screen 
            name="CalendarioTab" 
            component={CalendarStack} 
            options={{ title: 'Historial' }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
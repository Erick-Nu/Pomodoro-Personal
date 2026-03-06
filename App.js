import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import DayDetailScreen from './src/screens/DayDetailScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import TimerScreen from './src/screens/TimerScreen';

import { initDatabase } from './src/database/db';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#121212' }, 
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <Stack.Screen 
        name="Inicio" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="AddTask" 
        component={AddTaskScreen} 
        options={{ title: 'Nueva Tarea' }} 
      />
      <Stack.Screen 
        name="Timer" 
        component={TimerScreen} 
        options={{ title: 'Sesión de Enfoque' }} 
      />
    </Stack.Navigator>
  );
}

function CalendarStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#121212' }, 
        headerTintColor: '#fff' 
      }}
    >
      <Stack.Screen name="Calendario" component={CalendarScreen} />
      <Stack.Screen 
        name="DetalleDia" 
        component={DayDetailScreen} 
        options={({ route }) => ({ title: route.params.date })} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  
  useEffect(() => {
    initDatabase();
  }, []);

  return (
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
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { 
            backgroundColor: '#1a1a1a', 
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 8
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
  );
}
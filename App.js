import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import DayDetailScreen from './src/screens/DayDetailScreen';
import { initDatabase } from './src/database/db';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#121212' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Calendario" component={CalendarScreen} />
      <Stack.Screen name="DetalleDia" component={DayDetailScreen} options={({ route }) => ({ title: route.params.date })} />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = route.name === 'Home' ? 'home' : 'calendar';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#1a1a1a', borderTopWidth: 0 },
        headerShown: false,
      })}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="CalendarioTab" component={CalendarStack} options={{ title: 'Calendario' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
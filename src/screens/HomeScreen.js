import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerTareasPorFecha } from '../database/queries';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [tareasHoy, setTareasHoy] = useState([]);
  const hoy = new Date().toISOString().split('T')[0];

  useFocusEffect(
    useCallback(() => {
      const data = obtenerTareasPorFecha(hoy);
      setTareasHoy(data);
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Hoy</Text>
        <Text style={styles.date}>{hoy}</Text>
      </View>

      <FlatList
        data={tareasHoy}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => {}}>
            <Text style={styles.taskTitle}>{item.nombre}</Text>
            <Text style={styles.taskMeta}>{item.tiempo_acumulado} / {item.tiempo_registrado} min</Text>
            <Text style={styles.status}>{item.estado}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tienes tareas para hoy.</Text>}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CalendarioTab', { screen: 'Calendario' })} 
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  welcome: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  date: { color: '#888', fontSize: 16 },
  card: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15, marginBottom: 15 },
  taskTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  taskMeta: { color: '#4CAF50', marginTop: 5 },
  status: { color: '#888', fontSize: 12, marginTop: 5, fontStyle: 'italic' },
  fab: { 
    position: 'absolute', right: 20, bottom: 20, 
    backgroundColor: '#4CAF50', width: 60, height: 60, 
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4
  },
  empty: { color: '#444', textAlign: 'center', marginTop: 50 }
});
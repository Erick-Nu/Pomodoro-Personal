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
    }, [hoy])
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
          <TouchableOpacity 
            style={styles.card} 
            // Navegamos al Timer pasando el objeto de la tarea
            onPress={() => navigation.navigate('Timer', { tarea: item })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.taskTitle}>{item.nombre}</Text>
              <Ionicons name="play-circle" size={24} color="#4CAF50" />
            </View>
            
            <Text style={styles.taskMeta}>
              Progreso: {Math.floor(item.tiempo_acumulado / 60)}h / {Math.floor(item.tiempo_registrado / 60)}h
            </Text>
            
            <View style={styles.progressBarBackground}>
               <View style={[
                 styles.progressBarFill, 
                 { width: `${Math.min((item.tiempo_acumulado / item.tiempo_registrado) * 100, 100)}%` }
               ]} />
            </View>

            <Text style={styles.status}>{item.estado}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tienes tareas para hoy.</Text>}
      />

      {/* Botón Flotante corregido para el nuevo Stack */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddTask')} 
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  taskMeta: { color: '#4CAF50', marginTop: 10, fontSize: 14 },
  progressBarBackground: { height: 6, backgroundColor: '#333', borderRadius: 3, marginTop: 8 },
  progressBarFill: { height: 6, backgroundColor: '#4CAF50', borderRadius: 3 },
  status: { color: '#888', fontSize: 12, marginTop: 10, fontStyle: 'italic', textTransform: 'capitalize' },
  fab: { 
    position: 'absolute', right: 20, bottom: 20, 
    backgroundColor: '#4CAF50', width: 60, height: 60, 
    borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4
  },
  empty: { color: '#444', textAlign: 'center', marginTop: 50, fontSize: 16 }
});
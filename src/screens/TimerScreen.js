import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTimer } from '../hooks/useTimer'; // Usaremos el hook que definimos antes
import { actualizarProgresoTarea } from '../database/queries';

export default function TimerScreen({ route, navigation }) {
  const { tarea } = route.params;
  const [modo, setModo] = useState(60); 
  const { formatTime, isActive, toggle, reset, seconds } = useTimer(modo);

  const finalizarYGuardar = () => {
    try {
      actualizarProgresoTarea(tarea.id, modo);
      Alert.alert("¡Buen trabajo!", `Has sumado ${modo} minutos a: ${tarea.nombre}`);
      navigation.goBack();
    } catch (error) {
      console.error("Error al actualizar progreso:", error);
    }
  };


  if (seconds === 0 && isActive) {
    finalizarYGuardar();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.taskName}>{tarea.nombre}</Text>
      <Text style={styles.meta}>Meta: {tarea.tiempo_registrado} min</Text>

      <View style={styles.timerCircle}>
        <Text style={styles.timeText}>{formatTime()}</Text>
      </View>

      <View style={styles.modeContainer}>
        <TouchableOpacity 
          style={[styles.modeBtn, modo === 60 && styles.activeMode]} 
          onPress={() => { reset(); setModo(60); }}
        >
          <Text style={styles.modeText}>60 / 15</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.modeBtn, modo === 30 && styles.activeMode]} 
          onPress={() => { reset(); setModo(30); }}
        >
          <Text style={styles.modeText}>30 / 5</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.mainBtn, isActive ? styles.pause : styles.start]} onPress={toggle}>
        <Text style={styles.btnText}>{isActive ? 'PAUSAR' : 'COMENZAR'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 20 },
  taskName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  meta: { color: '#4CAF50', marginBottom: 30 },
  timerCircle: { width: 250, height: 250, borderRadius: 125, borderWidth: 2, borderColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  timeText: { color: '#fff', fontSize: 60, fontWeight: '200' },
  modeContainer: { flexDirection: 'row', gap: 15, marginBottom: 40 },
  modeBtn: { padding: 10, borderRadius: 8, backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  activeMode: { borderColor: '#4CAF50', backgroundColor: '#1b2e1b' },
  modeText: { color: '#fff' },
  mainBtn: { width: '80%', padding: 20, borderRadius: 15, alignItems: 'center' },
  start: { backgroundColor: '#4CAF50' },
  pause: { backgroundColor: '#f44336' },
  btnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});
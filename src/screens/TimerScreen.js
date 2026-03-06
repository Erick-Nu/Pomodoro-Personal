import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTimer } from '../hooks/useTimer'; 
import { actualizarProgresoTarea } from '../database/db_queries';
import { registerForPushNotificationsAsync, sendLocalNotification } from '../hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

export default function TimerScreen({ route, navigation }) {
  const { tarea } = route.params;
  const [modo, setModo] = useState(60); 
  
  const { formatTime, isActive, toggle, reset, seconds } = useTimer(modo);

  // Configuración del círculo de progreso
  const totalSeconds = modo * 60;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (seconds === 0 && isActive) {
      handleTimerComplete();
    }
  }, [seconds, isActive]);

  const handleTimerComplete = async () => {
    await sendLocalNotification(
      "¡Bloque Completado! 🏆", 
      `Has sumado ${modo} minutos a la tarea: ${tarea.nombre}`
    );

    finalizarYGuardar();
  };

  const finalizarYGuardar = () => {
    try {
      actualizarProgresoTarea(tarea.id, modo);
      Alert.alert(
        "Sesión Guardada", 
        `Progreso actualizado. ¡Sigue así!`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error al actualizar progreso en DB:", error);
      Alert.alert("Error", "No se pudo guardar el progreso en el dispositivo.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Información de la Tarea */}
      <View style={styles.header}>
        <Text style={styles.taskName}>{tarea.nombre}</Text>
        <View style={styles.metaBadge}>
          <Text style={styles.metaText}>Meta: {tarea.tiempo_registrado} min</Text>
        </View>
      </View>

      {/* Reloj Circular con Progreso SVG */}
      <View style={styles.timerCircle}>
        <Svg width="280" height="280" style={styles.svg}>
          <Circle
            cx="140" cy="140" r={radius}
            stroke="#1e1e1e" strokeWidth="8" fill="transparent"
          />
          <Circle
            cx="140" cy="140" r={radius}
            stroke="#4CAF50" strokeWidth="8" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 140 140)"
          />
        </Svg>
        <Text style={styles.timeText}>{formatTime()}</Text>
        <Text style={styles.labelStatus}>{isActive ? 'ENFOQUE' : 'LISTO'}</Text>
      </View>

      {/* Selector de Modo (Bloqueado a 60/15 o 30/5) */}
      <View style={styles.modeContainer}>
        <TouchableOpacity 
          disabled={isActive}
          style={[styles.modeBtn, modo === 60 && styles.activeMode, isActive && styles.disabledBtn]} 
          onPress={() => { reset(); setModo(60); }}
        >
          <Ionicons name="time-outline" size={18} color={modo === 60 ? "#fff" : "#888"} />
          <Text style={[styles.modeText, modo === 60 && styles.activeText]}>60 / 15</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          disabled={isActive}
          style={[styles.modeBtn, modo === 30 && styles.activeMode, isActive && styles.disabledBtn]} 
          onPress={() => { reset(); setModo(30); }}
        >
          <Ionicons name="hourglass-outline" size={18} color={modo === 30 ? "#fff" : "#888"} />
          <Text style={[styles.modeText, modo === 30 && styles.activeText]}>30 / 5</Text>
        </TouchableOpacity>
      </View>

      {/* Control Principal */}
      <TouchableOpacity 
        style={[styles.mainBtn, isActive ? styles.pause : styles.start]} 
        onPress={toggle}
      >
        <Ionicons name={isActive ? "pause" : "play"} size={28} color="white" />
        <Text style={styles.btnText}>{isActive ? 'PAUSAR' : 'COMENZAR'}</Text>
      </TouchableOpacity>

      {/* Botón de Cancelar/Reset */}
      {!isActive && seconds < (modo * 60) && (
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Text style={styles.resetText}>Reiniciar bloque</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  taskName: { color: '#fff', fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  metaBadge: { backgroundColor: '#1b2e1b', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 10 },
  metaText: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },
  
  timerCircle: { 
    width: 280, height: 280, borderRadius: 140, 
    justifyContent: 'center', alignItems: 'center', 
    marginBottom: 40, backgroundColor: '#181818',
  },
  svg: { position: 'absolute' },
  timeText: { color: '#fff', fontSize: 70, fontWeight: '200', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  labelStatus: { color: '#4CAF50', fontSize: 14, letterSpacing: 2, marginTop: -5 },

  modeContainer: { flexDirection: 'row', gap: 15, marginBottom: 40 },
  modeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#333' },
  activeMode: { borderColor: '#4CAF50', backgroundColor: '#2e7d32' },
  disabledBtn: { opacity: 0.5 },
  modeText: { color: '#888', fontWeight: 'bold' },
  activeText: { color: '#fff' },

  mainBtn: { width: '85%', padding: 20, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  start: { backgroundColor: '#4CAF50' },
  pause: { backgroundColor: '#f44336' },
  btnText: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  
  resetBtn: { marginTop: 25 },
  resetText: { color: '#666', fontSize: 16, textDecorationLine: 'underline' }
});
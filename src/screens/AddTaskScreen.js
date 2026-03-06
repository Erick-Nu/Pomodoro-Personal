import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { crearTarea } from '../database/db_queries';

export default function AddTaskScreen({ navigation, route }) {
  const { initialDate } = route.params || { initialDate: new Date().toISOString().split('T')[0] };

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [horas, setHoras] = useState('');

  const handleSave = () => {
    if (!nombre.trim() || !horas) {
      Alert.alert("Campos incompletos", "Por favor ingresa un nombre y el tiempo estimado.");
      return;
    }

    const tiempoEnMinutos = parseInt(horas) * 60; 
    
    try {
      // Guardado local en SQLite
      crearTarea(nombre, descripcion, initialDate, tiempoEnMinutos);
      Alert.alert("Éxito", `Tarea "${nombre}" registrada para el ${initialDate}`);
      navigation.goBack(); // Retorno automático al Home o Calendario
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      Alert.alert("Error", "No se pudo guardar la tarea en el dispositivo.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.headerInfo}>
          <Text style={styles.dateInfo}>Programando para: {initialDate}</Text>
        </View>

        <Text style={styles.label}>Nombre de la Tarea</Text>
        <TextInput 
          style={styles.input} 
          value={nombre} 
          onChangeText={setNombre} 
          placeholder="Ej: Desarrollo Backend Pets Co." 
          placeholderTextColor="#555" 
        />

        <Text style={styles.label}>Descripción / Objetivo</Text>
        <TextInput 
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
          value={descripcion} 
          onChangeText={setDescripcion} 
          multiline 
          placeholder="¿Qué quieres lograr hoy?" 
          placeholderTextColor="#555" 
        />

        <Text style={styles.label}>Tiempo total de la tarea (Horas)</Text>
        <TextInput 
          style={styles.input} 
          value={horas} 
          onChangeText={setHoras} 
          keyboardType="numeric" 
          placeholder="Ej: 4" 
          placeholderTextColor="#555" 
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>REGISTRAR TAREA</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 25 },
  headerInfo: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
  dateInfo: { color: '#888', fontSize: 14, fontStyle: 'italic' },
  label: { color: '#4CAF50', fontSize: 14, marginBottom: 8, fontWeight: 'bold', textTransform: 'uppercase' },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 25, fontSize: 16 },
  saveBtn: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 10, elevation: 5 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }
});
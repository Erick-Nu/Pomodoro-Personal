import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerNotasDeTarea, agregarNota } from '../database/db_queries';
import { Ionicons } from '@expo/vector-icons';

export default function TaskDetailScreen({ route, navigation }) {
  const { tarea } = route.params;
  const [notas, setNotas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');

  const cargarNotas = useCallback(() => {
    const data = obtenerNotasDeTarea(tarea.id);
    setNotas(data);
  }, [tarea.id]);

  useFocusEffect(useCallback(() => { cargarNotas(); }, [cargarNotas]));

  const handleGuardarNota = () => {
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    agregarNota(tarea.id, nuevoTitulo, nuevoContenido, 'nota');
    setModalVisible(false);
    setNuevoTitulo('');
    setNuevoContenido('');
    cargarNotas();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>{tarea.nombre}</Text>
        <Text style={styles.description}>{tarea.descripcion || "Sin descripción"}</Text>
        <Text style={styles.meta}>Progreso: {tarea.tiempo_acumulado} / {tarea.tiempo_registrado} min</Text>
        
        <TouchableOpacity 
          style={styles.timerBtn} 
          onPress={() => navigation.navigate('Timer', { tarea })}
        >
          <Ionicons name="play" size={20} color="white" />
          <Text style={styles.timerBtnText}>Iniciar Temporizador</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Notas</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={30} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.notaCard}
            onPress={() => Alert.alert(item.titulo, item.contenido)}
          >
            <Text style={styles.notaTitle}>{item.titulo}</Text>
            <Text style={styles.notaSnippet} numberOfLines={1}>{item.contenido}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Nueva Nota</Text>
            <TextInput style={styles.input} placeholder="Título" value={nuevoTitulo} onChangeText={setNuevoTitulo} placeholderTextColor="#666" />
            <TextInput style={[styles.input, { height: 100 }]} multiline placeholder="Contenido" value={nuevoContenido} onChangeText={setNuevoContenido} placeholderTextColor="#666" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={{color: '#fff'}}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleGuardarNota}><Text style={{color: '#fff'}}>Guardar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  headerCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15, marginBottom: 25 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  description: { color: '#aaa', marginTop: 10, fontSize: 16 },
  meta: { color: '#4CAF50', marginTop: 10, fontWeight: 'bold' },
  timerBtn: { backgroundColor: '#4CAF50', flexDirection: 'row', padding: 12, borderRadius: 10, marginTop: 20, justifyContent: 'center', alignItems: 'center' },
  timerBtnText: { color: 'white', marginLeft: 10, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  notaCard: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10, marginBottom: 10 },
  notaTitle: { color: '#fff', fontWeight: 'bold' },
  notaSnippet: { color: '#888', marginTop: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15 },
  modalHeader: { color: '#fff', fontSize: 18, marginBottom: 15, fontWeight: 'bold' },
  input: { backgroundColor: '#121212', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  saveBtn: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, flex: 0.45, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#444', padding: 10, borderRadius: 5, flex: 0.45, alignItems: 'center' }
});
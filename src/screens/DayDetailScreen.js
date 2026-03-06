import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { obtenerTareasPorFecha, obtenerNotasDeTarea, agregarNota } from '../database/db_queries';
import { Ionicons } from '@expo/vector-icons';

export default function DayDetailScreen({ route }) {
  const { date } = route.params;
  const [tareasConNotas, setTareasConNotas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTareaId, setSelectedTareaId] = useState(null);

  // Estados para la nueva nota
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');

  const cargarDatos = () => {
    const tareas = obtenerTareasPorFecha(date);
    const datosCompletos = tareas.map(tarea => {
      const notas = obtenerNotasDeTarea(tarea.id);
      return { ...tarea, notas };
    });
    setTareasConNotas(datosCompletos);
  };

  useEffect(() => {
    cargarDatos();
  }, [date]);

  const handleGuardarNota = () => {
    if (!nuevoTitulo || !nuevoContenido) {
      Alert.alert("Error", "Por favor llena todos los campos de la nota.");
      return;
    }
    
    try {
      agregarNota(selectedTareaId, nuevoTitulo, nuevoContenido, 'conclusión');
      setModalVisible(false);
      setNuevoTitulo('');
      setNuevoContenido('');
      cargarDatos(); // Refrescar la lista
    } catch (error) {
      console.error(error);
    }
  };

  const renderNota = (nota) => (
    <View key={nota.id} style={styles.notaCard}>
      <View style={styles.notaHeader}>
        <Text style={styles.notaTitulo}>{nota.titulo}</Text>
        <View style={[styles.tag, { backgroundColor: nota.etiqueta === 'importante' ? '#f44336' : '#4CAF50' }]}>
          <Text style={styles.tagText}>{nota.etiqueta.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.notaContenido}>{nota.contenido}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tareasConNotas}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<Text style={styles.headerTitle}>Actividad del {date}</Text>}
        renderItem={({ item }) => (
          <View style={styles.tareaSeccion}>
            <View style={styles.tareaHeaderMain}>
              <View>
                <Text style={styles.tareaNombre}>{item.nombre}</Text>
                <Text style={styles.tareaProgreso}>Meta: {item.tiempo_registrado} min</Text>
              </View>
              {/* BOTÓN PARA AÑADIR NOTA A ESTA TAREA */}
              <TouchableOpacity 
                onPress={() => { setSelectedTareaId(item.id); setModalVisible(true); }}
                style={styles.addNotaBtn}
              >
                <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
                <Text style={styles.addNotaText}>Nota</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.notasContainer}>
              {item.notas.length > 0 ? item.notas.map(renderNota) : <Text style={styles.sinNotas}>Sin notas.</Text>}
            </View>
          </View>
        )}
      />

      {/* MODAL PARA NUEVA NOTA */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Nota / Conclusión</Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Título (ej: Resumen final)" 
              placeholderTextColor="#555"
              value={nuevoTitulo}
              onChangeText={setNuevoTitulo}
            />
            
            <TextInput 
              style={[styles.input, { height: 100 }]} 
              multiline 
              placeholder="¿Qué aprendiste o qué falta?" 
              placeholderTextColor="#555"
              value={nuevoContenido}
              onChangeText={setNuevoContenido}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGuardarNota} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 15 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  tareaSeccion: { backgroundColor: '#1e1e1e', borderRadius: 15, padding: 15, marginBottom: 20 },
  tareaHeaderMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tareaNombre: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  tareaProgreso: { color: '#4CAF50', fontSize: 12 },
  addNotaBtn: { alignItems: 'center' },
  addNotaText: { color: '#4CAF50', fontSize: 10, fontWeight: 'bold' },
  
  notasContainer: { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 },
  notaCard: { backgroundColor: '#252525', padding: 12, borderRadius: 10, marginBottom: 8 },
  notaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  notaTitulo: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  tag: { paddingHorizontal: 6, borderRadius: 4 },
  tagText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  notaContenido: { color: '#aaa', fontSize: 13 },
  sinNotas: { color: '#444', fontStyle: 'italic' },

  // Estilos del Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#121212', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  saveBtn: { backgroundColor: '#4CAF50', flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { backgroundColor: '#333', flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontWeight: 'bold' }
});
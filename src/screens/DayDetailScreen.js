import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { getTasksByDate } from '../database/db_queries_task';
import { getNotesByTaskId, createNote } from '../database/db_queries_note';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';

// Iconos SVG personalizados
const TaskIcon = ({ size = 20, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke={color} strokeWidth={2}/>
  </Svg>
);

const NoteIcon = ({ size = 16, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PlusIcon = ({ size = 18, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
  </Svg>
);

const CalendarIcon = ({ size = 24, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CloseIcon = ({ size = 24, color = COLORS.textMain }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

export default function DayDetailScreen({ route, navigation }) {
  const { date } = route.params;
  const [tareasConNotas, setTareasConNotas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTareaId, setSelectedTareaId] = useState(null);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const cargarDatos = useCallback(() => {
    const tareas = getTasksByDate(date);
    const datosCompletos = tareas.map(tarea => {
      const notas = getNotesByTaskId(tarea.id);
      return { ...tarea, notas };
    });
    setTareasConNotas(datosCompletos);
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  const handleGuardarNota = () => {
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) {
      Alert.alert("Campos incompletos", "Completa todos los campos para guardar la nota.");
      return;
    }
    Keyboard.dismiss();
    createNote(selectedTareaId, nuevoTitulo, nuevoContenido, 'conclusión');
    setModalVisible(false);
    setNuevoTitulo('');
    setNuevoContenido('');
    cargarDatos();
  };

  const formatDate = (dateString) => {
    if (dateString === today) return 'Hoy';
    const dateObj = new Date(dateString + 'T00:00:00');
    return dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const renderTareaItem = ({ item }) => (
    <View style={[styles.tareaCard, SHADOWS.light]}>
      <View style={styles.tareaHeader}>
        <View style={styles.tareaInfo}>
          <TaskIcon />
          <Text style={styles.tareaNombre}>{item.nombre}</Text>
        </View>
        <TouchableOpacity 
          style={styles.addNotaMiniBtn} 
          onPress={() => { setSelectedTareaId(item.id); setModalVisible(true); }}
        >
          <PlusIcon color={COLORS.secondary} size={14} />
        </TouchableOpacity>
      </View>

      <View style={styles.notasWrapper}>
        {item.notas.length > 0 ? (
          item.notas.map(nota => (
            <View key={nota.id} style={styles.notaItem}>
              <View style={styles.notaDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.notaItemTitle}>{nota.titulo}</Text>
                <Text style={styles.notaItemBody}>{nota.contenido}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyNotas}>Sin notas registradas</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Info */}
      <View style={[styles.summaryCard, SHADOWS.medium]}>
        <View style={styles.summaryTop}>
          <View style={styles.calendarIconBg}>
            <CalendarIcon />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Historial de actividad</Text>
            <Text style={styles.summaryDate}>{formatDate(date)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{tareasConNotas.length}</Text>
            <Text style={styles.statLab}>Tareas</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>
              {tareasConNotas.reduce((acc, t) => acc + t.notas.length, 0)}
            </Text>
            <Text style={styles.statLab}>Notas</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={tareasConNotas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTareaItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hubo actividad este día</Text>
          </View>
        }
      />

      {/* Modal Nueva Nota */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <KeyboardAvoidingView behavior="padding" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir Conclusión</Text>
              <TouchableOpacity onPress={() => { Keyboard.dismiss(); setModalVisible(false); }}><CloseIcon /></TouchableOpacity>
            </View>
            <TextInput 
              style={styles.input} 
              placeholder="Resumen corto"
              placeholderTextColor={COLORS.textMuted}
              value={nuevoTitulo} 
              onChangeText={setNuevoTitulo}
            />
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Detalles de lo aprendido..."
              placeholderTextColor={COLORS.textMuted}
              multiline 
              value={nuevoContenido} 
              onChangeText={setNuevoContenido}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleGuardarNota}>
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  summaryCard: { 
    backgroundColor: COLORS.card, 
    margin: SPACING.lg, 
    borderRadius: RADIUS.lg, 
    padding: SPACING.lg, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  calendarIconBg: { 
    width: 44, 
    height: 44, 
    borderRadius: RADIUS.md, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: SPACING.sm 
  },
  summaryLabel: { 
    color: COLORS.textMuted, 
    fontSize: 11, 
    fontWeight: '600', 
    textTransform: 'uppercase',
    letterSpacing: 0.5 
  },
  summaryDate: { 
    color: COLORS.textMain, 
    fontSize: 18, 
    fontWeight: '700', 
    textTransform: 'capitalize',
    marginTop: 2 
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statVal: { color: COLORS.secondary, fontSize: 20, fontWeight: 'bold' },
  statLab: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },

  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  tareaCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: RADIUS.md, 
    padding: SPACING.md, 
    marginBottom: SPACING.md, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  tareaHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.sm 
  },
  tareaInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  tareaNombre: { color: COLORS.textMain, fontSize: 16, fontWeight: '600' },
  addNotaMiniBtn: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  notasWrapper: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  notaItem: { flexDirection: 'row', marginBottom: 10, gap: 10 },
  notaDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: COLORS.secondary, 
    marginTop: 6 
  },
  notaItemTitle: { color: COLORS.textMain, fontSize: 14, fontWeight: '600' },
  notaItemBody: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
  emptyNotas: { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic' },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: COLORS.textMuted, fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', padding: SPACING.lg },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { 
    backgroundColor: COLORS.card, 
    borderRadius: RADIUS.lg, 
    padding: SPACING.lg 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.lg 
  },
  modalTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: '700' },
  input: { 
    backgroundColor: COLORS.primary, 
    borderRadius: RADIUS.md, 
    padding: SPACING.md, 
    marginBottom: SPACING.md,
    color: COLORS.textMain,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { 
    backgroundColor: COLORS.secondary, 
    padding: 16, 
    borderRadius: RADIUS.md, 
    alignItems: 'center' 
  },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 }
});

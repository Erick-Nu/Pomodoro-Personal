import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { deleteTask, getTaskById } from '../database/db_queries_task';
import { getNotesByTaskId, createNote, deleteNote } from '../database/db_queries_note';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';

// Iconos SVG personalizados
const TaskIcon = ({ size = 24, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke={color} strokeWidth={2}/>
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PlayIcon = ({ size = 20, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 3l14 9-14 9V3z" fill={color}/>
  </Svg>
);

const ClockIcon = ({ size = 16, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2}/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const NoteIcon = ({ size = 18, color = COLORS.textMuted }) => (
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

const CloseIcon = ({ size = 24, color = COLORS.textMain }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const TrashIcon = ({ size = 20, color = COLORS.accent }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function TaskDetailScreen({ route, navigation }) {
  const { tarea: tareaInicial } = route.params;
  const [tarea, setTarea] = useState(tareaInicial);
  const [notas, setNotas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');

  const cargarDatos = useCallback(() => {
    // Recargar tarea actualizada desde la BD
    const tareaActualizada = getTaskById(tareaInicial.id);
    if (tareaActualizada) {
      setTarea(tareaActualizada);
    }
    // Cargar notas
    const data = getNotesByTaskId(tareaInicial.id);
    setNotas(data);
  }, [tareaInicial.id]);

  useFocusEffect(useCallback(() => { cargarDatos(); }, [cargarDatos]));

  const handleGuardarNota = () => {
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) {
      Alert.alert("Campos incompletos", "Por favor completa el título y el contenido.");
      return;
    }
    Keyboard.dismiss();
    createNote(tarea.id, nuevoTitulo, nuevoContenido, 'nota');
    setModalVisible(false);
    setNuevoTitulo('');
    setNuevoContenido('');
    cargarDatos();
  };

  const handleDeleteNote = (notaId) => {
    Alert.alert("Eliminar nota", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => {
        deleteNote(notaId);
        cargarDatos();
      }}
    ]);
  };

  const handleDeleteTask = () => {
    Alert.alert("Eliminar tarea", "Esta acción eliminará la tarea y todas sus notas.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => {
        deleteTask(tarea.id);
        navigation.goBack();
      }}
    ]);
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const progress = tarea.tiempo_registrado > 0 
    ? Math.min((tarea.tiempo_acumulado / tarea.tiempo_registrado) * 100, 100) 
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Card */}
        <View style={[styles.headerCard, SHADOWS.medium]}>
          <View style={styles.headerTop}>
            <View style={styles.iconCircle}>
              <TaskIcon size={28} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{tarea.nombre}</Text>
              <View style={styles.dateRow}>
                <ClockIcon size={14} />
                <Text style={styles.dateText}>{tarea.fecha || 'Sin fecha'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleDeleteTask} style={styles.deleteBtn}>
              <TrashIcon />
            </TouchableOpacity>
          </View>

          {tarea.descripcion ? (
            <View style={styles.descBox}>
              <Text style={styles.descText}>{tarea.descripcion}</Text>
            </View>
          ) : null}

          <View style={styles.progressBox}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progreso total</Text>
              <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.timeLabel}>
              {formatTime(tarea.tiempo_acumulado)} trabajados de {formatTime(tarea.tiempo_registrado)}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.timerBtn, SHADOWS.light]} 
            onPress={() => navigation.navigate('Timer', { tarea })}
          >
            <LinearGradient colors={COLORS.gradientPrimary} style={styles.timerBtnGradient}>
              <PlayIcon />
              <Text style={styles.timerBtnText}>Continuar Sesión</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Sección Notas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notas y Avances</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addNoteBtn}>
            <PlusIcon color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {notas.length > 0 ? (
          notas.map((nota) => (
            <TouchableOpacity 
              key={nota.id} 
              style={[styles.notaCard, SHADOWS.light]}
              onLongPress={() => handleDeleteNote(nota.id)}
              activeOpacity={0.8}
            >
              <View style={styles.notaHeader}>
                <NoteIcon size={16} />
                <Text style={styles.notaTitle} numberOfLines={1}>{nota.titulo}</Text>
              </View>
              <Text style={styles.notaBody}>{nota.contenido}</Text>
              <Text style={styles.notaHint}>Mantén presionado para eliminar</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <NoteIcon size={40} color={COLORS.border} />
            <Text style={styles.emptyText}>No hay notas registradas para esta tarea</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Nueva Nota */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir Nota</Text>
              <TouchableOpacity onPress={() => { Keyboard.dismiss(); setModalVisible(false); }}>
                <CloseIcon />
              </TouchableOpacity>
            </View>
            <TextInput 
              style={styles.input} 
              placeholder="Título de la nota"
              placeholderTextColor={COLORS.textMuted}
              value={nuevoTitulo} 
              onChangeText={setNuevoTitulo}
            />
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="¿Qué lograste hoy?"
              placeholderTextColor={COLORS.textMuted}
              multiline 
              numberOfLines={4} 
              value={nuevoContenido} 
              onChangeText={setNuevoContenido}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleGuardarNota}>
              <Text style={styles.saveBtnText}>Guardar Nota</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scrollContent: { padding: SPACING.lg },
  
  headerCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: RADIUS.lg, 
    padding: SPACING.lg, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    marginBottom: SPACING.xl 
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  iconCircle: { 
    width: 50, 
    height: 50, 
    borderRadius: RADIUS.md, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerText: { flex: 1, marginLeft: SPACING.sm },
  title: { color: COLORS.textMain, fontSize: 20, fontWeight: '700' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  dateText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  deleteBtn: { padding: 10 },

  descBox: { 
    backgroundColor: COLORS.primary, 
    padding: SPACING.sm, 
    borderRadius: RADIUS.sm, 
    marginBottom: SPACING.lg 
  },
  descText: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },

  progressBox: { marginBottom: SPACING.lg },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { color: COLORS.textMain, fontSize: 14, fontWeight: '600' },
  progressValue: { color: COLORS.secondary, fontSize: 14, fontWeight: '700' },
  barBg: { height: 6, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.secondary },
  timeLabel: { color: COLORS.textMuted, fontSize: 12, marginTop: 8, fontWeight: '500' },

  timerBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  timerBtnGradient: { 
    flexDirection: 'row', 
    paddingVertical: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10 
  },
  timerBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.md 
  },
  sectionTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: '700' },
  addNoteBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: COLORS.card, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },

  notaCard: { 
    backgroundColor: COLORS.card, 
    padding: SPACING.md, 
    borderRadius: RADIUS.md, 
    marginBottom: SPACING.sm, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  notaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  notaTitle: { color: COLORS.textMain, fontSize: 15, fontWeight: '600' },
  notaBody: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  notaHint: { color: COLORS.textMuted, fontSize: 11, marginTop: 8, fontStyle: 'italic', opacity: 0.5 },

  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, marginTop: 10, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: COLORS.card, 
    borderTopLeftRadius: RADIUS.xl, 
    borderTopRightRadius: RADIUS.xl, 
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
    color: COLORS.textMain, 
    marginBottom: SPACING.md, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  saveBtn: { 
    backgroundColor: COLORS.secondary, 
    padding: 16, 
    borderRadius: RADIUS.md, 
    alignItems: 'center' 
  },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' }
});

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
  ScrollView
} from 'react-native';
import { useFocusEffect, NavigationProp, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { deleteTask } from '../database/db_queries_task';
import { getNotesByTaskId, createNote } from '../database/db_queries_note';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Tarea, Nota, RootStackParamList } from '../types';

interface TaskDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'TaskDetail'>;
}

export default function TaskDetailScreen({ route, navigation }: TaskDetailScreenProps) {
  const { tarea } = route.params;
  const [notas, setNotas] = useState<Nota[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [nuevoTitulo, setNuevoTitulo] = useState<string>('');
  const [nuevoContenido, setNuevoContenido] = useState<string>('');

  const cargarNotas = useCallback(() => {
    try {
      const data = getNotesByTaskId(tarea.id);
      setNotas(data);
    } catch (error) {
      console.error("Error al cargar notas:", error);
    }
  }, [tarea.id]);

  useFocusEffect(useCallback(() => { cargarNotas(); }, [cargarNotas]));

  const handleGuardarNota = (): void => {
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) {
      Alert.alert("Campos requeridos", "Por favor completa el título y el contenido.");
      return;
    }
    try {
      createNote(tarea.id, nuevoTitulo, nuevoContenido, 'nota');
      setModalVisible(false);
      setNuevoTitulo('');
      setNuevoContenido('');
      cargarNotas();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la nota.");
    }
  };

  const handleDeleteTask = (): void => {
    Alert.alert("Eliminar tarea", "¿Estás seguro de eliminar esta tarea?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => {
        deleteTask(tarea.id);
        navigation.goBack();
      }}
    ]);
  };

  const formatTime = (minutes: number): string => {
    if (!minutes || minutes <= 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const tiempoTotal = tarea.tiempo_registrado || 1;
  const progressPercent = Math.min((tarea.tiempo_acumulado / tiempoTotal) * 100, 100);
  const isCompleted = progressPercent >= 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.taskMainTitle}>{tarea.nombre}</Text>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.dateText}>{tarea.fecha}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleDeleteTask} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={[styles.infoCard, SHADOWS.light]}>
          {tarea.descripcion ? (
            <View style={styles.descContainer}>
              <Text style={styles.sectionLabel}>Descripción</Text>
              <Text style={styles.descText}>{tarea.descripcion}</Text>
            </View>
          ) : null}

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionLabel}>Progreso de ejecución</Text>
              <Text style={[styles.progressValText, { color: isCompleted ? '#10B981' : COLORS.secondary }]}>
                {Math.round(progressPercent)}%
              </Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${progressPercent}%`, backgroundColor: isCompleted ? '#10B981' : COLORS.secondary }]} />
            </View>
            <View style={styles.timeStats}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{formatTime(tarea.tiempo_acumulado)}</Text>
                <Text style={styles.statLab}>Invertido</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{formatTime(tarea.tiempo_registrado)}</Text>
                <Text style={styles.statLab}>Objetivo</Text>
              </View>
            </View>
          </View>

          {!isCompleted && (
            <TouchableOpacity 
              style={styles.timerBtn} 
              onPress={() => navigation.navigate('Timer', { tarea })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.secondary, '#1D4ED8']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                <Ionicons name="play" size={18} color={COLORS.white} />
                <Text style={styles.timerBtnText}>Continuar Sesión</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.notesHeader}>
          <Text style={styles.notesTitle}>Bitácora de notas</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addNoteBtn}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {notas.length > 0 ? (
          notas.map((nota) => (
            <View key={nota.id} style={[styles.notaCard, SHADOWS.light]}>
              <View style={styles.notaHeaderRow}>
                <Ionicons name="document-text-outline" size={16} color={COLORS.secondary} />
                <Text style={styles.notaTitle} numberOfLines={1}>{nota.titulo}</Text>
              </View>
              <Text style={styles.notaBody}>{nota.contenido}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyNotes}>
            <Ionicons name="journal-outline" size={40} color={COLORS.border} />
            <Text style={styles.emptyText}>Sin registros en la bitácora</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Nota</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>
            <TextInput 
              style={styles.input} placeholder="Título" placeholderTextColor={COLORS.textMuted}
              value={nuevoTitulo} onChangeText={setNuevoTitulo}
            />
            <TextInput 
              style={[styles.input, styles.textArea]} placeholder="¿Qué descubriste hoy?"
              placeholderTextColor={COLORS.textMuted} multiline numberOfLines={4}
              value={nuevoContenido} onChangeText={setNuevoContenido}
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
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  titleSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  taskMainTitle: { color: COLORS.textMain, fontSize: 24, fontWeight: '800', flex: 1, marginRight: 10 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  dateText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '500' },
  deleteBtn: { padding: 5 },
  infoCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 35 },
  sectionLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  descContainer: { marginBottom: 20, backgroundColor: COLORS.primary, padding: 12, borderRadius: RADIUS.sm },
  descText: { color: COLORS.textMain, fontSize: 15, lineHeight: 22 },
  progressSection: { marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressValText: { fontSize: 18, fontWeight: '800' },
  barBg: { height: 10, backgroundColor: COLORS.primary, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  timeStats: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { color: COLORS.textMain, fontSize: 16, fontWeight: '700' },
  statLab: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 20, backgroundColor: COLORS.border },
  timerBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 10 },
  gradientBtn: { flexDirection: 'row', paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 10 },
  timerBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  notesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  notesTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: '800' },
  addNoteBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  notaCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: RADIUS.md, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  notaHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  notaTitle: { color: COLORS.textMain, fontSize: 15, fontWeight: '700' },
  notaBody: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  emptyNotes: { alignItems: 'center', marginTop: 20, opacity: 0.5 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: '700' },
  input: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: 15, color: COLORS.textMain, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: COLORS.secondary, padding: 16, borderRadius: RADIUS.md, alignItems: 'center' },
  saveBtnText: { color: COLORS.white, fontWeight: '700' }
});

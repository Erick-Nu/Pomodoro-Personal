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
import Svg, { Path, Circle } from 'react-native-svg';
import { deleteTask } from '../database/db_queries_task';
import { getNotesByTaskId, createNote } from '../database/db_queries_note';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Tarea, Nota, RootStackParamList } from '../types';

interface TaskDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'TaskDetail'>;
}

const TaskIcon = ({ size = 24, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke={color} strokeWidth={2}/>
  </Svg>
);

const TrashIcon = ({ size = 20, color = COLORS.accent }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function TaskDetailScreen({ route, navigation }: TaskDetailScreenProps) {
  const { tarea } = route.params;
  const [notas, setNotas] = useState<Nota[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [nuevoTitulo, setNuevoTitulo] = useState<string>('');
  const [nuevoContenido, setNuevoContenido] = useState<string>('');

  const cargarNotas = useCallback(() => {
    const data = getNotesByTaskId(tarea.id);
    setNotas(data);
  }, [tarea.id]);

  useFocusEffect(useCallback(() => { cargarNotas(); }, [cargarNotas]));

  const handleGuardarNota = (): void => {
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) {
      Alert.alert("⚠️ Campos incompletos", "Por favor completa el título y el contenido.");
      return;
    }
    createNote(tarea.id, nuevoTitulo, nuevoContenido, 'nota');
    setModalVisible(false);
    setNuevoTitulo('');
    setNuevoContenido('');
    cargarNotas();
  };

  const handleDeleteTask = (): void => {
    Alert.alert("🗑️ Eliminar", "¿Estás seguro de eliminar esta tarea?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => {
        deleteTask(tarea.id);
        navigation.goBack();
      }}
    ]);
  };

  const formatTime = (minutes: number): string => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const progress = Math.min((tarea.tiempo_acumulado / tarea.tiempo_registrado) * 100, 100) || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={[styles.headerCard, SHADOWS.medium]}>
          <View style={styles.headerTop}>
            <TaskIcon size={28} />
            <View style={styles.headerText}>
              <Text style={styles.title}>{tarea.nombre}</Text>
              <Text style={styles.dateText}>{tarea.fecha}</Text>
            </View>
            <TouchableOpacity onPress={handleDeleteTask}>
              <TrashIcon />
            </TouchableOpacity>
          </View>

          {tarea.descripcion ? (
            <View style={styles.descBox}>
              <Text style={styles.descText}>{tarea.descripcion}</Text>
            </View>
          ) : null}

          <View style={styles.progressBox}>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.timeLabel}>
              {formatTime(tarea.tiempo_acumulado)} / {formatTime(tarea.tiempo_registrado)}
            </Text>
          </View>

          <TouchableOpacity style={styles.timerBtn} onPress={() => navigation.navigate('Timer', { tarea })}>
            <LinearGradient colors={[COLORS.secondary, '#1D4ED8']} style={styles.timerBtnGradient}>
              <Text style={styles.timerBtnText}>Continuar Foco</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notas</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addNoteBtn}>
            <Text style={styles.addNoteBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {notas.length > 0 ? (
          notas.map((nota) => (
            <View key={nota.id} style={[styles.notaCard, SHADOWS.light]}>
              <Text style={styles.notaTitle}>{nota.titulo}</Text>
              <Text style={styles.notaBody}>{nota.contenido}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Sin notas registradas</Text>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Nota</Text>
            <TextInput 
              style={styles.input} placeholder="Título" placeholderTextColor={COLORS.textMuted}
              value={nuevoTitulo} onChangeText={setNuevoTitulo}
            />
            <TextInput 
              style={[styles.input, styles.textArea]} placeholder="Contenido..." placeholderTextColor={COLORS.textMuted}
              multiline numberOfLines={4} value={nuevoContenido} onChangeText={setNuevoContenido}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleGuardarNota}>
              <Text style={styles.saveBtnText}>Guardar</Text>
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
  headerCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: COLORS.border },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerText: { flex: 1, marginLeft: 15 },
  title: { color: COLORS.textMain, fontSize: 20, fontWeight: '700' },
  dateText: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  descBox: { backgroundColor: 'rgba(30, 64, 175, 0.05)', padding: 12, borderRadius: RADIUS.sm, marginBottom: 20 },
  descText: { color: COLORS.textMain, fontSize: 14, lineHeight: 20 },
  progressBox: { marginBottom: 20 },
  barBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.secondary },
  timeLabel: { color: COLORS.textMuted, fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: '600' },
  timerBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  timerBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  timerBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: '700' },
  addNoteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  addNoteBtnText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  notaCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: RADIUS.md, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  notaTitle: { color: COLORS.textMain, fontSize: 15, fontWeight: '600', marginBottom: 5 },
  notaBody: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, padding: 24, borderTopWidth: 1, borderTopColor: COLORS.border },
  modalTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: '700', marginBottom: 20 },
  input: { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: RADIUS.md, padding: 15, color: COLORS.textMain, marginBottom: 15 },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: COLORS.secondary, padding: 16, borderRadius: RADIUS.md, alignItems: 'center' },
  saveBtnText: { color: COLORS.white, fontWeight: '700' }
});

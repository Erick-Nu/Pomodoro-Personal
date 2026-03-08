import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Animated,
  Pressable
} from 'react-native';
import { useFocusEffect, NavigationProp, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { deleteTask } from '../database/db_queries_task';
import { getNotesByTaskId, createNote, deleteNote } from '../database/db_queries_note';
import { COLORS, SPACING, RADIUS, SHADOWS, TAG_COLORS } from '../styles/theme';
import { Tarea, Nota, RootStackParamList } from '../types';
import NoteDetailModal from '../components/NoteDetailModal';

// === ICONOS SVG ===
const CalendarIcon = ({ size = 14, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const TrashIcon = ({ size = 18, color = "#EF4444" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PlayIcon = ({ size = 18, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M5 3l14 9-14 9V3z" />
  </Svg>
);

const PlusIcon = ({ size = 22, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
  </Svg>
);

const ChevronIcon = ({ size = 16, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CloseIcon = ({ size = 22, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CheckCircleIcon = ({ size = 16, color = "#10B981" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2}/>
    <Path d="M8 12l3 3 5-5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ClockIcon = ({ size = 16, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2}/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const NoteIcon = ({ size = 40, color = COLORS.border }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth={1.5}/>
    <Path d="M14 2v6h6M12 18v-6M9 15h6" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
  </Svg>
);

interface TaskDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'TaskDetail'>;
}

type TagType = keyof typeof TAG_COLORS;

export default function TaskDetailScreen({ route, navigation }: TaskDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { tarea } = route.params;
  const [notas, setNotas] = useState<Nota[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [nuevoTitulo, setNuevoTitulo] = useState<string>('');
  const [nuevoContenido, setNuevoContenido] = useState<string>('');
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState<TagType>('nota');
  
  const [notaSeleccionada, setNotaSeleccionada] = useState<Nota | null>(null);
  const [viewerVisible, setViewerVisible] = useState<boolean>(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const progressPercent = Math.min((tarea.tiempo_acumulado / (tarea.tiempo_registrado || 1)) * 100, 100);
  const isCompleted = progressPercent >= 100;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(progressAnim, { toValue: progressPercent, duration: 800, delay: 200, useNativeDriver: false }),
    ]).start();
  }, []);

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
      createNote(tarea.id, nuevoTitulo, nuevoContenido, etiquetaSeleccionada);
      setModalVisible(false);
      setNuevoTitulo('');
      setNuevoContenido('');
      setEtiquetaSeleccionada('nota');
      cargarNotas();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la nota.");
    }
  };

  const handleEliminarNota = (id: number): void => {
    try {
      deleteNote(id);
      cargarNotas();
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar la nota.");
    }
  };

  const handleDeleteTask = (): void => {
    Alert.alert("Eliminar tarea", "Esta acción eliminará la tarea y todas sus notas.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => {
        deleteTask(tarea.id);
        navigation.goBack();
      }}
    ]);
  };

  const handleStartSession = () => {
    navigation.navigate('Timer', { tarea });
  };

  const formatTime = (minutes: number): string => {
    if (!minutes || minutes <= 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDateLabel = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={[COLORS.secondary, '#1D4ED8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.navBar, { paddingTop: insets.top + 6 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Tarea</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={[styles.statusBadge, isCompleted ? styles.badgeCompleted : styles.badgeActive]}>
            {isCompleted ? <CheckCircleIcon size={14} /> : <ClockIcon size={14} />}
            <Text style={[styles.statusText, { color: isCompleted ? '#10B981' : COLORS.secondary }]}>
              {isCompleted ? 'Completada' : 'En progreso'}
            </Text>
          </View>
          
          <Text style={styles.taskTitle}>{tarea.nombre}</Text>
          
          <View style={styles.dateRow}>
            <CalendarIcon />
            <Text style={styles.dateText}>{formatDateLabel(tarea.fecha)}</Text>
          </View>

          <TouchableOpacity onPress={handleDeleteTask} style={styles.deleteBtn}>
            <TrashIcon />
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Card */}
        <Animated.View style={[styles.progressCard, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={[COLORS.secondary, '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressGradient}
          >
            <View style={styles.progressCircleContainer}>
              <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
            </View>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressTitle}>Progreso actual</Text>
              <Text style={styles.progressSubtitle}>
                {isCompleted ? '¡Meta alcanzada!' : `Faltan ${formatTime(tarea.tiempo_registrado - tarea.tiempo_acumulado)}`}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.progressBody}>
            <View style={styles.barBg}>
              <Animated.View style={[styles.barFill, { width: animatedWidth, backgroundColor: isCompleted ? '#10B981' : COLORS.secondary }]} />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatTime(tarea.tiempo_acumulado)}</Text>
                <Text style={styles.statLabel}>Invertido</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatTime(tarea.tiempo_registrado)}</Text>
                <Text style={styles.statLabel}>Objetivo</Text>
              </View>
            </View>

            {!isCompleted && (
              <TouchableOpacity onPress={handleStartSession} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sessionBtn}
                >
                  <PlayIcon size={16} />
                  <Text style={styles.sessionBtnText}>Continuar Sesión</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Bitácora Section */}
        <Animated.View style={[styles.notesSection, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Bitácora</Text>
              <Text style={styles.sectionSubtitle}>{notas.length} {notas.length === 1 ? 'registro' : 'registros'}</Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
              <LinearGradient colors={[COLORS.secondary, '#1D4ED8']} style={styles.addBtnGradient}>
                <PlusIcon size={20} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {notas.length > 0 ? (
            <View style={styles.notesList}>
              {notas.map((nota) => {
                const tagStyle = TAG_COLORS[nota.etiqueta as TagType] || TAG_COLORS.nota;
                return (
                  <TouchableOpacity 
                    key={nota.id} 
                    style={styles.noteCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      setNotaSeleccionada(nota);
                      setViewerVisible(true);
                    }}
                  >
                    <View style={[styles.noteAccent, { backgroundColor: tagStyle.text }]} />
                    <Text style={styles.noteTitle} numberOfLines={1}>{nota.titulo}</Text>
                    <View style={styles.noteRight}>
                      <View style={[styles.noteTag, { backgroundColor: tagStyle.bg }]}>
                        <Text style={[styles.noteTagText, { color: tagStyle.text }]}>{nota.etiqueta}</Text>
                      </View>
                      <Text style={styles.noteDate}>
                        {new Date(nota.fecha_registro).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <NoteIcon />
              <Text style={styles.emptyTitle}>Sin registros</Text>
              <Text style={styles.emptySubtitle}>Documenta tu progreso añadiendo notas</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Note Detail Modal */}
      <NoteDetailModal 
        nota={notaSeleccionada}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        onDelete={handleEliminarNota}
      />

      {/* Create Note Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Nueva Nota</Text>
                <Text style={styles.modalSubtitle}>Añade a tu bitácora</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.inputLabel}>Clasificación</Text>
              <View style={styles.tagSelector}>
                {(Object.keys(TAG_COLORS) as TagType[]).map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagOption,
                      { backgroundColor: TAG_COLORS[tag].bg, borderColor: TAG_COLORS[tag].border },
                      etiquetaSeleccionada === tag && { borderColor: TAG_COLORS[tag].text, borderWidth: 2 }
                    ]}
                    onPress={() => setEtiquetaSeleccionada(tag)}
                  >
                    <Text style={[styles.tagOptionText, { color: TAG_COLORS[tag].text }]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Título</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Escribe un título..."
                placeholderTextColor={COLORS.textMuted}
                value={nuevoTitulo} 
                onChangeText={setNuevoTitulo}
              />

              <Text style={styles.inputLabel}>Contenido</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Describe los detalles..."
                placeholderTextColor={COLORS.textMuted}
                multiline 
                textAlignVertical="top"
                value={nuevoContenido} 
                onChangeText={setNuevoContenido}
              />

              <TouchableOpacity onPress={handleGuardarNota} activeOpacity={0.85}>
                <LinearGradient
                  colors={[COLORS.secondary, '#1D4ED8']}
                  style={styles.saveBtn}
                >
                  <Text style={styles.saveBtnText}>Guardar Nota</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  backBtn: { padding: 6 },
  navTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  scrollContent: { padding: SPACING.lg, paddingBottom: 50 },

  // Header
  header: { marginBottom: SPACING.lg, position: 'relative' },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start',
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    gap: 6, 
    marginBottom: 12 
  },
  badgeActive: { backgroundColor: 'rgba(30, 64, 175, 0.1)' },
  badgeCompleted: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  statusText: { fontSize: 12, fontWeight: '700' },
  taskTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: COLORS.textMain, 
    lineHeight: 30, 
    marginBottom: 8,
    paddingRight: 50 
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500', textTransform: 'capitalize' },
  deleteBtn: { 
    position: 'absolute', 
    top: 0, 
    right: 0, 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: '#FEF2F2', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  // Progress Card
  progressCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: RADIUS.lg, 
    overflow: 'hidden', 
    marginBottom: SPACING.xl,
    ...SHADOWS.medium
  },
  progressGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: SPACING.lg, 
    gap: SPACING.md 
  },
  progressCircleContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  progressPercent: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  progressTextContainer: { flex: 1 },
  progressTitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  progressSubtitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  progressBody: { padding: SPACING.lg },
  barBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: SPACING.lg },
  barFill: { height: '100%', borderRadius: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
  statLabel: { fontSize: 12, fontWeight: '500', color: COLORS.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  sessionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    borderRadius: RADIUS.md, 
    gap: 10 
  },
  sessionBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },

  // Notes Section
  notesSection: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textMain },
  sectionSubtitle: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted, marginTop: 2 },
  addBtn: { borderRadius: 12, overflow: 'hidden' },
  addBtnGradient: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },

  // Notes List
  notesList: { gap: 10 },
  noteCard: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.white, 
    borderRadius: RADIUS.sm, 
    overflow: 'hidden', 
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: SPACING.md,
    ...SHADOWS.light
  },
  noteAccent: { width: 4, alignSelf: 'stretch' },
  noteTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.textMain, marginLeft: 14 },
  noteRight: { alignItems: 'flex-end', gap: 4 },
  noteTag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  noteTagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  noteDate: { fontSize: 11, fontWeight: '500', color: COLORS.textMuted },

  // Empty State
  emptyState: { 
    alignItems: 'center', 
    padding: SPACING.xl, 
    backgroundColor: COLORS.white, 
    borderRadius: RADIUS.lg, 
    borderWidth: 2, 
    borderColor: COLORS.border, 
    borderStyle: 'dashed' 
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginTop: SPACING.md },
  emptySubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  modalSheet: { 
    backgroundColor: COLORS.white, 
    borderTopLeftRadius: RADIUS.lg, 
    borderTopRightRadius: RADIUS.lg, 
    padding: SPACING.lg, 
    paddingBottom: 40, 
    maxHeight: '85%' 
  },
  modalHandle: { 
    width: 40, 
    height: 4, 
    backgroundColor: COLORS.border, 
    borderRadius: 2, 
    alignSelf: 'center', 
    marginBottom: SPACING.lg 
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textMain },
  modalSubtitle: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted, marginTop: 2 },
  modalCloseBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#F1F5F9', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textMain, marginBottom: 10, marginLeft: 4 },
  tagSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.lg },
  tagOption: { 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: RADIUS.sm, 
    borderWidth: 1 
  },
  tagOptionText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  input: { 
    backgroundColor: '#F8FAFC', 
    borderRadius: RADIUS.md, 
    padding: SPACING.md, 
    fontSize: 15, 
    color: COLORS.textMain, 
    marginBottom: SPACING.md, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  saveBtn: { padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.sm },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white }
});

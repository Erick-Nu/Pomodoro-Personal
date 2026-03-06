import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { obtenerNotasDeTarea, agregarNota, eliminarTarea } from '../database/db_queries';

// Iconos SVG personalizados
const TaskIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke={color} strokeWidth={2}/>
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PlayIcon = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 3l14 9-14 9V3z" fill={color}/>
  </Svg>
);

const ClockIcon = ({ size = 18, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2}/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const NoteIcon = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PlusIcon = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
  </Svg>
);

const CloseIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const DescriptionIcon = ({ size = 18, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6h16M4 10h16M4 14h10M4 18h6" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const ChevronRightIcon = ({ size = 18, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const EmptyNotesIcon = ({ size = 56, color = '#374151' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 2v6h6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 15h6M9 11h3" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
  </Svg>
);

const TrashIcon = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function TaskDetailScreen({ route, navigation }) {
  const { tarea } = route.params;
  const [notas, setNotas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');

  // Animaciones
  const headerScale = useRef(new Animated.Value(0.95)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(30)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const cargarNotas = useCallback(() => {
    const data = obtenerNotasDeTarea(tarea.id);
    setNotas(data);
  }, [tarea.id]);

  useFocusEffect(useCallback(() => { cargarNotas(); }, [cargarNotas]));

  useEffect(() => {
    // Animaciones de entrada
    Animated.sequence([
      Animated.parallel([
        Animated.spring(headerScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const openModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalScale, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setNuevoTitulo('');
      setNuevoContenido('');
    });
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGuardarNota = () => {
    if (!nuevoTitulo.trim()) {
      Alert.alert("📝 Título requerido", "Dale un título a tu nota para identificarla.");
      return;
    }
    if (!nuevoContenido.trim()) {
      Alert.alert("✏️ Contenido requerido", "Escribe el contenido de tu nota.");
      return;
    }
    
    agregarNota(tarea.id, nuevoTitulo, nuevoContenido, 'nota');
    Alert.alert(
      "✅ Nota guardada",
      "Tu nota ha sido agregada exitosamente.",
      [{ text: "Perfecto", onPress: closeModal }]
    );
    cargarNotas();
  };

  const handleStartTimer = () => {
    animateButton();
    setTimeout(() => {
      navigation.navigate('Timer', { tarea });
    }, 150);
  };

  const handleDeleteTask = () => {
    Alert.alert(
      "🗑️ Eliminar tarea",
      `¿Estás seguro de eliminar "${tarea.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            try {
              eliminarTarea(tarea.id);
              Alert.alert(
                "✅ Tarea eliminada",
                "La tarea ha sido eliminada correctamente.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error eliminando tarea:', error);
              Alert.alert("❌ Error", "No se pudo eliminar la tarea.");
            }
          }
        }
      ]
    );
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const calculateProgress = () => {
    if (!tarea.tiempo_registrado || tarea.tiempo_registrado === 0) return 0;
    return Math.min((tarea.tiempo_acumulado / tarea.tiempo_registrado) * 100, 100);
  };

  const progress = calculateProgress();

  const renderNoteItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.notaCard}
      activeOpacity={0.7}
      onPress={() => Alert.alert(item.titulo, item.contenido)}
    >
      <View style={styles.notaIconWrapper}>
        <NoteIcon size={18} color="#4ade80" />
      </View>
      <View style={styles.notaContent}>
        <Text style={styles.notaTitle} numberOfLines={1}>{item.titulo}</Text>
        <Text style={styles.notaSnippet} numberOfLines={2}>{item.contenido}</Text>
      </View>
      <ChevronRightIcon color="#475569" />
    </TouchableOpacity>
  );

  const renderEmptyNotes = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <EmptyNotesIcon />
      </View>
      <Text style={styles.emptyTitle}>Sin notas aún</Text>
      <Text style={styles.emptySubtitle}>
        Agrega notas para registrar tu progreso y aprendizajes
      </Text>
      <TouchableOpacity style={styles.emptyAddBtn} onPress={openModal} activeOpacity={0.7}>
        <PlusIcon size={18} color="#4ade80" />
        <Text style={styles.emptyAddBtnText}>Agregar primera nota</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23']}
        style={styles.gradient}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Card con info de la tarea */}
          <Animated.View 
            style={[
              styles.headerCard,
              {
                opacity: headerOpacity,
                transform: [{ scale: headerScale }]
              }
            ]}
          >
            <View style={styles.headerTop}>
              <View style={styles.taskIconWrapper}>
                <TaskIcon size={28} color="#4ade80" />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.title} numberOfLines={2}>{tarea.nombre}</Text>
                <View style={styles.dateContainer}>
                  <ClockIcon size={14} color="#64748b" />
                  <Text style={styles.dateText}>{tarea.fecha || 'Sin fecha'}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={handleDeleteTask}
                activeOpacity={0.7}
              >
                <TrashIcon size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>

            {/* Descripción */}
            {tarea.descripcion ? (
              <View style={styles.descriptionContainer}>
                <View style={styles.descriptionHeader}>
                  <DescriptionIcon size={16} color="#94a3b8" />
                  <Text style={styles.descriptionLabel}>Descripción</Text>
                </View>
                <Text style={styles.description}>{tarea.descripcion}</Text>
              </View>
            ) : null}

            {/* Progreso */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progreso</Text>
                <Text style={styles.progressValue}>
                  {formatTime(tarea.tiempo_acumulado)} / {formatTime(tarea.tiempo_registrado)}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill, 
                      { width: `${progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
              </View>
            </View>

            {/* Botón Iniciar Timer */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={styles.timerBtn} 
                onPress={handleStartTimer}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#22c55e', '#16a34a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.timerBtnGradient}
                >
                  <View style={styles.playIconWrapper}>
                    <PlayIcon size={18} color="#fff" />
                  </View>
                  <Text style={styles.timerBtnText}>Iniciar Pomodoro</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Sección de Notas */}
          <Animated.View 
            style={[
              styles.notesSection,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslate }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <NoteIcon size={20} color="#94a3b8" />
                <Text style={styles.sectionTitle}>Notas</Text>
                <View style={styles.notesCountBadge}>
                  <Text style={styles.notesCountText}>{notas.length}</Text>
                </View>
              </View>
              {notas.length > 0 && (
                <TouchableOpacity onPress={openModal} style={styles.addNoteBtn} activeOpacity={0.7}>
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    style={styles.addNoteBtnGradient}
                  >
                    <PlusIcon size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {notas.length > 0 ? (
              <FlatList
                data={notas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderNoteItem}
                scrollEnabled={false}
                contentContainerStyle={styles.notesList}
              />
            ) : (
              renderEmptyNotes()
            )}
          </Animated.View>
        </ScrollView>

        {/* Modal Nueva Nota */}
        <Modal visible={modalVisible} transparent animationType="none">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              activeOpacity={1} 
              onPress={closeModal}
            />
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  opacity: modalOpacity,
                  transform: [{ scale: modalScale }]
                }
              ]}
            >
              {/* Header del modal */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <View style={styles.modalIconWrapper}>
                    <NoteIcon size={20} color="#4ade80" />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Nueva Nota</Text>
                    <Text style={styles.modalSubtitle} numberOfLines={1}>
                      Para: {tarea.nombre}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                  <CloseIcon size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Formulario */}
              <View style={styles.modalForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Título</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Ej: Avance del día" 
                    placeholderTextColor="#4a5568"
                    value={nuevoTitulo} 
                    onChangeText={setNuevoTitulo}
                    selectionColor="#4ade80"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contenido</Text>
                  <TextInput 
                    style={[styles.input, styles.textArea]} 
                    multiline 
                    numberOfLines={4}
                    placeholder="¿Qué lograste? ¿Qué aprendiste?" 
                    placeholderTextColor="#4a5568"
                    value={nuevoContenido} 
                    onChangeText={setNuevoContenido}
                    selectionColor="#4ade80"
                  />
                </View>
              </View>

              {/* Botones */}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal} activeOpacity={0.7}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGuardarNota} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveBtn}
                  >
                    <Text style={styles.saveBtnText}>Guardar Nota</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  gradient: { 
    flex: 1 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header Card
  headerCard: { 
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: 24, 
    borderRadius: 24, 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  taskIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  title: { 
    color: '#f1f5f9', 
    fontSize: 22, 
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },

  // Description
  descriptionContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  descriptionLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  description: { 
    color: '#cbd5e1', 
    fontSize: 15,
    lineHeight: 22,
  },

  // Progress
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 5,
  },
  progressPercent: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },

  // Timer Button
  timerBtn: { 
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  timerBtnGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  playIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3,
  },
  timerBtnText: { 
    color: 'white', 
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },

  // Notes Section
  notesSection: {
    flex: 1,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: { 
    color: '#f1f5f9', 
    fontSize: 20, 
    fontWeight: '700',
  },
  notesCountBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  notesCountText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '700',
  },
  addNoteBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addNoteBtnGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  notesList: {
    gap: 0,
  },

  // Note Card
  notaCard: { 
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  notaIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notaContent: {
    flex: 1,
    marginRight: 10,
  },
  notaTitle: { 
    color: '#f1f5f9', 
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
  },
  notaSnippet: { 
    color: '#94a3b8', 
    fontSize: 13,
    lineHeight: 18,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#e2e8f0',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  emptyAddBtnText: {
    color: '#4ade80',
    fontSize: 15,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: { 
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 85, 105, 0.3)',
    marginBottom: 20,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: { 
    color: '#f1f5f9', 
    fontSize: 18, 
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
    maxWidth: 200,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Form
  modalForm: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: { 
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    color: '#f1f5f9', 
    padding: 16, 
    borderRadius: 14,
    fontSize: 15,
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  textArea: {
    height: 110,
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  // Modal Buttons
  modalButtons: { 
    flexDirection: 'row', 
    gap: 12,
  },
  saveBtn: { 
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 15,
  },
  cancelBtn: { 
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  cancelBtnText: { 
    color: '#94a3b8', 
    fontWeight: '600',
    fontSize: 15,
  },
});
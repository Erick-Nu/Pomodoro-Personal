import React, { useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { obtenerTareasPorFecha, obtenerNotasDeTarea, agregarNota } from '../database/db_queries';

// Iconos SVG personalizados
const TaskIcon = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke={color} strokeWidth={2}/>
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

const ClockIcon = ({ size = 16, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2}/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CalendarIcon = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CloseIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const TagIcon = ({ size = 14, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="7" cy="7" r="1.5" fill={color}/>
  </Svg>
);

const EmptyNotesIcon = ({ size = 48, color = '#374151' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 2v6h6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 15h6M9 11h3" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
  </Svg>
);

export default function DayDetailScreen({ route, navigation }) {
  const { date } = route.params;
  const [tareasConNotas, setTareasConNotas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTareaId, setSelectedTareaId] = useState(null);
  const [selectedTareaNombre, setSelectedTareaNombre] = useState('');

  // Estados para la nueva nota
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');

  // Animaciones
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(-20)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const today = new Date().toISOString().split('T')[0];

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
    
    // Animación de entrada del header
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslate, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [date]);

  const openModal = (tareaId, tareaNombre) => {
    setSelectedTareaId(tareaId);
    setSelectedTareaNombre(tareaNombre);
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

  const handleGuardarNota = () => {
    if (!nuevoTitulo.trim()) {
      Alert.alert("📝 Título requerido", "Dale un título a tu nota para identificarla.");
      return;
    }
    if (!nuevoContenido.trim()) {
      Alert.alert("✏️ Contenido requerido", "Escribe el contenido de tu nota.");
      return;
    }
    
    try {
      agregarNota(selectedTareaId, nuevoTitulo, nuevoContenido, 'conclusión');
      Alert.alert(
        "✅ Nota guardada",
        "Tu nota ha sido agregada exitosamente.",
        [{ text: "Perfecto", onPress: closeModal }]
      );
      cargarDatos();
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Error", "No se pudo guardar la nota. Intenta nuevamente.");
    }
  };

  const formatDate = (dateString) => {
    if (dateString === today) return 'Hoy';
    const dateObj = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return dateObj.toLocaleDateString('es-ES', options);
  };

  const getTagConfig = (etiqueta) => {
    switch(etiqueta?.toLowerCase()) {
      case 'importante':
        return { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)', label: 'Importante' };
      case 'idea':
        return { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)', label: 'Idea' };
      case 'conclusión':
        return { color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)', label: 'Conclusión' };
      default:
        return { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.15)', label: etiqueta || 'Nota' };
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const calculateProgress = (tarea) => {
    if (!tarea.tiempo_registrado || tarea.tiempo_registrado === 0) return 0;
    return Math.min((tarea.tiempo_acumulado / tarea.tiempo_registrado) * 100, 100);
  };

  const renderNota = (nota) => {
    const tagConfig = getTagConfig(nota.etiqueta);
    
    return (
      <Animated.View key={nota.id} style={styles.notaCard}>
        <View style={styles.notaHeader}>
          <View style={styles.notaTituloContainer}>
            <View style={[styles.notaIconWrapper, { backgroundColor: tagConfig.bgColor }]}>
              <NoteIcon size={14} color={tagConfig.color} />
            </View>
            <Text style={styles.notaTitulo} numberOfLines={1}>{nota.titulo}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: tagConfig.bgColor }]}>
            <TagIcon size={10} color={tagConfig.color} />
            <Text style={[styles.tagText, { color: tagConfig.color }]}>{tagConfig.label}</Text>
          </View>
        </View>
        <Text style={styles.notaContenido}>{nota.contenido}</Text>
      </Animated.View>
    );
  };

  const renderEmptyNotes = () => (
    <View style={styles.emptyNotesContainer}>
      <EmptyNotesIcon />
      <Text style={styles.emptyNotesText}>Sin notas aún</Text>
    </View>
  );

  const renderTareaItem = ({ item, index }) => {
    const progress = calculateProgress(item);
    
    return (
      <Animated.View 
        style={[
          styles.tareaSeccion,
          {
            opacity: headerOpacity,
            transform: [{
              translateY: headerTranslate.interpolate({
                inputRange: [-20, 0],
                outputRange: [20 * (index + 1), 0]
              })
            }]
          }
        ]}
      >
        {/* Header de la tarea */}
        <View style={styles.tareaHeaderMain}>
          <View style={styles.tareaIconContainer}>
            <View style={styles.tareaIconWrapper}>
              <TaskIcon size={22} color="#4ade80" />
            </View>
            <View style={styles.tareaInfoContainer}>
              <Text style={styles.tareaNombre} numberOfLines={2}>{item.nombre}</Text>
              <View style={styles.tareaMetaContainer}>
                <ClockIcon size={14} color="#64748b" />
                <Text style={styles.tareaProgreso}>
                  {formatTime(item.tiempo_acumulado)} / {formatTime(item.tiempo_registrado)}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Botón para añadir nota */}
          <TouchableOpacity 
            onPress={() => openModal(item.id, item.nombre)}
            style={styles.addNotaBtn}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              style={styles.addNotaBtnGradient}
            >
              <PlusIcon size={16} color="#fff" />
            </LinearGradient>
            <Text style={styles.addNotaText}>Nota</Text>
          </TouchableOpacity>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>

        {/* Notas */}
        <View style={styles.notasContainer}>
          <View style={styles.notasSectionHeader}>
            <NoteIcon size={16} color="#94a3b8" />
            <Text style={styles.notasSectionTitle}>
              Notas ({item.notas.length})
            </Text>
          </View>
          {item.notas.length > 0 ? item.notas.map(renderNota) : renderEmptyNotes()}
        </View>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerContainer,
        {
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslate }]
        }
      ]}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerIconWrapper}>
          <CalendarIcon color="#4ade80" />
        </View>
        <View>
          <Text style={styles.headerLabel}>Actividad del día</Text>
          <Text style={styles.headerTitle}>{formatDate(date)}</Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{tareasConNotas.length}</Text>
          <Text style={styles.statLabel}>{tareasConNotas.length === 1 ? 'Tarea' : 'Tareas'}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {tareasConNotas.reduce((acc, t) => acc + t.notas.length, 0)}
          </Text>
          <Text style={styles.statLabel}>Notas</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIconWrapper}>
        <TaskIcon size={40} color="#475569" />
      </View>
      <Text style={styles.emptyStateTitle}>Sin tareas para este día</Text>
      <Text style={styles.emptyStateSubtitle}>
        Programa tareas desde el calendario para comenzar
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23']}
        style={styles.gradient}
      >
        <FlatList
          data={tareasConNotas}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          renderItem={renderTareaItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        {/* Modal para nueva nota */}
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
                      Para: {selectedTareaNombre}
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
                    placeholder="Ej: Resumen del avance" 
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
                    placeholder="¿Qué aprendiste? ¿Qué falta por hacer?" 
                    placeholderTextColor="#4a5568"
                    value={nuevoContenido}
                    onChangeText={setNuevoContenido}
                    selectionColor="#4ade80"
                  />
                </View>
              </View>

              {/* Botones */}
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={closeModal} style={styles.cancelBtn} activeOpacity={0.7}>
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
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  headerContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  headerTitle: { 
    color: '#f1f5f9', 
    fontSize: 22, 
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#f1f5f9',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
    marginHorizontal: 16,
  },

  // Tarea sección
  tareaSeccion: { 
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  tareaHeaderMain: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tareaIconContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  tareaIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tareaInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  tareaNombre: { 
    color: '#f1f5f9', 
    fontSize: 17, 
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  tareaMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tareaProgreso: { 
    color: '#64748b', 
    fontSize: 13,
    fontWeight: '500',
  },
  addNotaBtn: { 
    alignItems: 'center',
  },
  addNotaBtnGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addNotaText: { 
    color: '#4ade80', 
    fontSize: 11, 
    fontWeight: '600',
    marginTop: 4,
  },

  // Progress bar
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 4,
  },
  progressPercent: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  
  // Notas container
  notasContainer: { 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(71, 85, 105, 0.3)', 
    paddingTop: 16,
  },
  notasSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notasSectionTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },

  // Nota card
  notaCard: { 
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 14, 
    borderRadius: 14, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.2)',
  },
  notaHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10,
  },
  notaTituloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  notaIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  notaTitulo: { 
    color: '#e2e8f0', 
    fontWeight: '600', 
    fontSize: 14,
    flex: 1,
  },
  tag: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10, 
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: { 
    fontSize: 10, 
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notaContenido: { 
    color: '#94a3b8', 
    fontSize: 14,
    lineHeight: 20,
  },

  // Empty notes
  emptyNotesContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyNotesText: {
    color: '#475569',
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Empty state
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
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

  // Modal buttons
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
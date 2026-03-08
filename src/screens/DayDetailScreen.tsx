import React, { useState, useEffect } from 'react';
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
  StatusBar
} from 'react-native';
import { RouteProp, NavigationProp, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { getTasksByDate } from '../database/db_queries_task';
import { getNotesByTaskId, createNote } from '../database/db_queries_note';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Tarea, Nota, RootStackParamList } from '../types';

interface DayDetailScreenProps {
  route: RouteProp<RootStackParamList, 'DetalleDia'>;
}

interface TareaConNotas extends Tarea {
  notas: Nota[];
}

const TaskIcon = ({ size = 20, color = COLORS.accent }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke={color} strokeWidth={2}/>
  </Svg>
);

const PlusIcon = ({ size = 18, color = COLORS.black }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
  </Svg>
);

const CalendarIcon = ({ size = 24, color = COLORS.accent }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CloseIcon = ({ size = 24, color = COLORS.textMain }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

export default function DayDetailScreen({ route }: DayDetailScreenProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { date } = route.params;
  const [tareasConNotas, setTareasConNotas] = useState<TareaConNotas[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedTareaId, setSelectedTareaId] = useState<number | null>(null);
  const [nuevoTitulo, setNuevoTitulo] = useState<string>('');
  const [nuevoContenido, setNuevoContenido] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];

  const cargarDatos = (): void => {
    try {
      const tareas = getTasksByDate(date);
      const datosCompletos = tareas.map(tarea => {
        const notas = getNotesByTaskId(tarea.id);
        return { ...tarea, notas };
      });
      setTareasConNotas(datosCompletos);
    } catch (error) {
      console.error("Error al cargar datos del día:", error);
    }
  };

  useEffect(() => { cargarDatos(); }, [date]);

  const handleGuardarNota = (): void => {
    if (!nuevoTitulo.trim() || !nuevoContenido.trim() || selectedTareaId === null) {
      Alert.alert("⚠️ Error", "Completa todos los campos");
      return;
    }
    try {
      createNote(selectedTareaId, nuevoTitulo, nuevoContenido, 'conclusión');
      setModalVisible(false);
      setNuevoTitulo('');
      setNuevoContenido('');
      cargarDatos();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la nota.");
    }
  };

  const formatDate = (dateString: string): string => {
    if (dateString === today) return 'Hoy';
    const dateObj = new Date(dateString + 'T00:00:00');
    return dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const renderTareaItem = ({ item }: { item: TareaConNotas }) => (
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
          <PlusIcon size={14} />
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
        <Text style={styles.navTitle}>Historial</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>
      
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

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <KeyboardAvoidingView behavior="padding" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir Conclusión</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><CloseIcon /></TouchableOpacity>
            </View>
            <TextInput 
              style={styles.input} placeholder="Resumen corto"
              value={nuevoTitulo} onChangeText={setNuevoTitulo}
            />
            <TextInput 
              style={[styles.input, styles.textArea]} placeholder="Detalles de lo aprendido..."
              multiline value={nuevoContenido} onChangeText={setNuevoContenido}
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
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  backBtn: { padding: 6 },
  navTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  summaryCard: { backgroundColor: COLORS.secondary, margin: SPACING.lg, borderRadius: RADIUS.lg, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  summaryTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  calendarIconBg: { width: 44, height: 44, borderRadius: RADIUS.sm, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  summaryLabel: { color: '#555', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryDate: { color: COLORS.black, fontSize: 18, fontWeight: '700', textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statVal: { color: COLORS.black, fontSize: 20, fontWeight: 'bold' },
  statLab: { color: '#555', fontSize: 12 },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  tareaCard: { backgroundColor: COLORS.secondary, borderRadius: RADIUS.md, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  tareaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tareaInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  tareaNombre: { color: COLORS.black, fontSize: 16, fontWeight: '600' },
  addNotaMiniBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  notasWrapper: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12 },
  notaItem: { flexDirection: 'row', marginBottom: 10, gap: 10 },
  notaDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent, marginTop: 6 },
  notaItemTitle: { color: COLORS.black, fontSize: 14, fontWeight: '600' },
  notaItemBody: { color: '#555', fontSize: 13, lineHeight: 18 },
  emptyNotas: { color: '#777', fontSize: 12, fontStyle: 'italic' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: COLORS.secondary, borderRadius: RADIUS.lg, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: COLORS.black, fontSize: 18, fontWeight: '700' },
  input: { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: RADIUS.md, padding: 15, marginBottom: 15, color: COLORS.black },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: COLORS.black, padding: 16, borderRadius: RADIUS.md, alignItems: 'center' },
  saveBtnText: { color: COLORS.secondary, fontWeight: '700' }
});

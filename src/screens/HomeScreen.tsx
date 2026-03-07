import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useFocusEffect, NavigationProp } from '@react-navigation/native';
import { getTasksByDate } from '../database/db_queries_task';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Tarea, RootStackParamList } from '../types';

interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [tareasHoy, setTareasHoy] = useState<Tarea[]>([]);
  
  const hoy = new Date().toISOString().split('T')[0];
  const hora = new Date().getHours();
  
  const getSaludo = (): string => {
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getGreetingIcon = (): any => {
    if (hora < 12) return 'sunny-outline';
    if (hora < 19) return 'partly-sunny-outline';
    return 'moon-outline';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  useFocusEffect(
    useCallback(() => {
      const data = getTasksByDate(hoy);
      setTareasHoy(data);
    }, [hoy])
  );

  const getProgressPercent = (acumulado: number, registrado: number): number => {
    if (!registrado) return 0;
    return Math.min((acumulado / registrado) * 100, 100);
  };

  const renderTask = ({ item }: { item: Tarea }) => {
    const progress = getProgressPercent(item.tiempo_acumulado, item.tiempo_registrado);
    const horasAcumuladas = (item.tiempo_acumulado / 60).toFixed(1);
    const horasTotal = (item.tiempo_registrado / 60).toFixed(1);
    const isCompleted = progress >= 100;

    return (
      <TouchableOpacity 
        style={[styles.card, SHADOWS.light]} 
        onPress={() => navigation.navigate('TaskDetail', { tarea: item })}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={styles.checkContainer}>
            <Ionicons 
              name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
              size={26} 
              color={isCompleted ? COLORS.secondary : COLORS.accent} 
            />
          </View>

          <View style={styles.cardMain}>
            <View style={styles.cardHeader}>
              <Text style={styles.taskTitle} numberOfLines={1}>{item.nombre}</Text>
              <View style={[styles.statusBadge, isCompleted && styles.completedBadge]}>
                <Text style={styles.statusText}>
                  {isCompleted ? 'Hecho' : item.estado}
                </Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.timeText}>
                {horasAcumuladas}h / {horasTotal}h
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: isCompleted ? COLORS.accent : COLORS.black 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => navigation.navigate('Timer', { tarea: item })}
          >
            <View style={styles.playIconBg}>
              <Ionicons name="play" size={22} color={COLORS.black} />
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="calendar-clear-outline" size={60} color={COLORS.accent} />
      </View>
      <Text style={styles.emptyTitle}>Sin tareas hoy</Text>
      <Text style={styles.emptySubtitle}>
        Es un buen momento para planificar tus objetivos y empezar a producir.
      </Text>
      <TouchableOpacity 
        style={[styles.emptyButton, SHADOWS.medium]}
        onPress={() => navigation.navigate('AddTask', { initialDate: hoy })}
      >
        <Text style={styles.emptyButtonText}>Crear primera tarea</Text>
      </TouchableOpacity>
    </View>
  );

  const totalMinutos = tareasHoy.reduce((acc, t) => acc + (t.tiempo_acumulado || 0), 0);
  const totalHoras = (totalMinutos / 60).toFixed(1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greetingRow}>
            <Ionicons name={getGreetingIcon()} size={24} color={COLORS.accent} style={{marginRight: 10}} />
            <View>
              <Text style={styles.saludo}>{getSaludo()}</Text>
              <Text style={styles.fecha}>{formatDate(hoy)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={42} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {tareasHoy.length > 0 && (
          <View style={[styles.statsCard, SHADOWS.medium]}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tareasHoy.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalHoras}h</Text>
              <Text style={styles.statLabel}>Foco</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {tareasHoy.filter(t => getProgressPercent(t.tiempo_acumulado, t.tiempo_registrado) >= 100).length}
              </Text>
              <Text style={styles.statLabel}>Listas</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tareas del día</Text>
        <Text style={styles.sectionCount}>{tareasHoy.length} activas</Text>
      </View>

      <FlatList
        data={tareasHoy}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, tareasHoy.length === 0 && styles.emptyList]}
      />

      <TouchableOpacity 
        style={[styles.fab, SHADOWS.medium]} 
        onPress={() => navigation.navigate('AddTask', { initialDate: hoy })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[COLORS.secondary, COLORS.accent]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color={COLORS.black} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  header: { 
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.black,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(234, 228, 213, 0.15)',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  saludo: { color: COLORS.textMuted, fontSize: 16, fontWeight: '500' },
  fecha: { color: COLORS.textMain, fontSize: 20, fontWeight: '700', marginTop: 2, textTransform: 'capitalize' },
  profileButton: { padding: 5 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(242, 242, 242, 0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(234, 228, 213, 0.1)',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { color: COLORS.secondary, fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2, fontWeight: '600', textTransform: 'uppercase' },
  statDivider: { width: 1, backgroundColor: 'rgba(234, 228, 213, 0.1)' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  sectionTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: '700' },
  sectionCount: { color: COLORS.textMuted, fontSize: 13 },
  listContent: { paddingBottom: 120 },
  card: { 
    backgroundColor: COLORS.secondary, 
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  checkContainer: { marginRight: 12 },
  cardMain: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  taskTitle: { color: COLORS.black, fontSize: 16, fontWeight: '700', flex: 1, marginRight: SPACING.sm },
  statusBadge: { backgroundColor: 'rgba(0, 0, 0, 0.05)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm },
  completedBadge: { backgroundColor: 'rgba(182, 176, 159, 0.2)' },
  statusText: { color: COLORS.black, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  timeText: { color: '#555', fontSize: 12, marginLeft: 5, fontWeight: '500' },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBarBackground: { flex: 1, height: 8, backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: RADIUS.full, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: RADIUS.full },
  progressPercent: { color: COLORS.black, fontSize: 11, marginLeft: SPACING.sm, width: 30, textAlign: 'right', fontWeight: '700' },
  playButton: { marginLeft: SPACING.md },
  playIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  emptyList: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: 60 },
  emptyIconContainer: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(182, 176, 159, 0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg,
  },
  emptyTitle: { color: COLORS.textMain, fontSize: 20, fontWeight: 'bold', marginBottom: SPACING.sm },
  emptySubtitle: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  emptyButton: { backgroundColor: COLORS.secondary, paddingHorizontal: SPACING.xl, paddingVertical: 14, borderRadius: RADIUS.md },
  emptyButtonText: { color: COLORS.black, fontSize: 15, fontWeight: '700' },
  fab: { position: 'absolute', right: SPACING.lg, bottom: 30, borderRadius: RADIUS.full },
  fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
});

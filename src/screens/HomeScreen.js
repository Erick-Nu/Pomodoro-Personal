import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getTasksByDate } from '../database/db_queries_task';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';

// Iconos SVG
const SunIcon = ({ size = 24, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={2}/>
    <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const MoonIcon = ({ size = 24, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CloudSunIcon = ({ size = 24, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M17.66 6.34l1.41-1.41" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Circle cx="12" cy="10" r="4" stroke={color} strokeWidth={2}/>
    <Path d="M8 18a4 4 0 014-4h.87a5.3 5.3 0 013.79 1.56A2 2 0 0118 18H8z" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CheckCircleIcon = ({ size = 24, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2}/>
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CircleIcon = ({ size = 24, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2}/>
  </Svg>
);

const ClockIcon = ({ size = 14, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2}/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const PlayIcon = ({ size = 20, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 3l14 9-14 9V3z" fill={color}/>
  </Svg>
);

const PlusIcon = ({ size = 28, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
  </Svg>
);

const CalendarEmptyIcon = ({ size = 56, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    <Path d="M9 16l6-6M9 10l6 6" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
  </Svg>
);

export default function HomeScreen({ navigation }) {
  const [tareasHoy, setTareasHoy] = useState([]);
  
  const hoy = new Date().toISOString().split('T')[0];
  const hora = new Date().getHours();
  
  const getSaludo = () => {
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getGreetingIcon = () => {
    if (hora < 12) return <SunIcon />;
    if (hora < 19) return <CloudSunIcon />;
    return <MoonIcon />;
  };

  const formatDate = (dateStr) => {
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

  const getProgressPercent = (acumulado, registrado) => {
    if (!registrado) return 0;
    return Math.min((acumulado / registrado) * 100, 100);
  };

  const renderTask = ({ item }) => {
    const progress = getProgressPercent(item.tiempo_acumulado, item.tiempo_registrado);
    const horasAcumuladas = (item.tiempo_acumulado / 60).toFixed(1);
    const horasTotal = (item.tiempo_registrado / 60).toFixed(1);
    const isCompleted = progress >= 100;

    return (
      <TouchableOpacity 
        style={[styles.card, SHADOWS.light]} 
        onPress={() => navigation.navigate('TaskDetail', { tarea: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.checkContainer}>
            {isCompleted ? (
              <CheckCircleIcon size={26} color={COLORS.secondary} />
            ) : (
              <CircleIcon size={26} color={COLORS.border} />
            )}
          </View>

          <View style={styles.cardMain}>
            <View style={styles.cardHeader}>
              <Text style={styles.taskTitle} numberOfLines={1}>{item.nombre}</Text>
              <View style={[styles.statusBadge, isCompleted && styles.completedBadge]}>
                <Text style={[styles.statusText, isCompleted && styles.statusTextCompleted]}>
                  {isCompleted ? 'Completada' : 'En progreso'}
                </Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              <ClockIcon />
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
                      backgroundColor: isCompleted ? COLORS.secondary : COLORS.accent 
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
            <LinearGradient
              colors={COLORS.gradientPrimary}
              style={styles.playIconBg}
            >
              <PlayIcon size={18} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <CalendarEmptyIcon />
      </View>
      <Text style={styles.emptyTitle}>Sin tareas para hoy</Text>
      <Text style={styles.emptySubtitle}>
        Comienza agregando tu primera tarea y enfócate en lo que importa.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.navigate('AddTask')}
      >
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonText}>Crear primera tarea</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const totalMinutos = tareasHoy.reduce((acc, t) => acc + (t.tiempo_acumulado || 0), 0);
  const totalHoras = (totalMinutos / 60).toFixed(1);
  const completadas = tareasHoy.filter(t => getProgressPercent(t.tiempo_acumulado, t.tiempo_registrado) >= 100).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greetingRow}>
            <View style={styles.greetingIconWrapper}>
              {getGreetingIcon()}
            </View>
            <View>
              <Text style={styles.saludo}>{getSaludo()}</Text>
              <Text style={styles.fecha}>{formatDate(hoy)}</Text>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        {tareasHoy.length > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tareasHoy.length}</Text>
              <Text style={styles.statLabel}>Tareas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalHoras}h</Text>
              <Text style={styles.statLabel}>Enfoque</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completadas}</Text>
              <Text style={styles.statLabel}>Listas</Text>
            </View>
          </View>
        )}
      </View>

      {/* Tasks Section */}
      {tareasHoy.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tareas del día</Text>
          <Text style={styles.sectionCount}>{tareasHoy.length} activas</Text>
        </View>
      )}

      <FlatList
        data={tareasHoy}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, tareasHoy.length === 0 && styles.emptyList]}
      />

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={styles.fabGradient}
        >
          <PlusIcon />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.primary,
  },
  header: { 
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  saludo: { 
    color: COLORS.textMuted, 
    fontSize: 14, 
    fontWeight: '500',
  },
  fecha: { 
    color: COLORS.textMain, 
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: COLORS.secondary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionCount: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  card: { 
    backgroundColor: COLORS.card, 
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  checkContainer: {
    marginRight: SPACING.sm,
  },
  cardMain: {
    flex: 1,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 6,
  },
  taskTitle: { 
    color: COLORS.textMain, 
    fontSize: 16, 
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  completedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusTextCompleted: {
    color: COLORS.secondary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: { 
    flex: 1,
    height: 6, 
    backgroundColor: COLORS.primary, 
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: { 
    height: 6, 
    borderRadius: RADIUS.full,
  },
  progressPercent: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginLeft: SPACING.sm,
    width: 32,
    textAlign: 'right',
    fontWeight: '600',
  },
  playButton: {
    marginLeft: SPACING.sm,
  },
  playIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    color: COLORS.textMain,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  fab: { 
    position: 'absolute', 
    right: SPACING.lg, 
    bottom: 30,
    borderRadius: RADIUS.full,
    ...SHADOWS.medium,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerTareasPorFecha } from '../database/db_queries';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [tareasHoy, setTareasHoy] = useState([]);
  
  const hoy = new Date().toISOString().split('T')[0];
  const hora = new Date().getHours();
  
  const getSaludo = () => {
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getEmoji = () => {
    if (hora < 12) return '☀️';
    if (hora < 19) return '🌤️';
    return '🌙';
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
      const data = obtenerTareasPorFecha(hoy);
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

    return (
      <TouchableOpacity 
        style={[styles.card, SHADOWS.light]} 
        onPress={() => navigation.navigate('TaskDetail', { tarea: item })}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardMain}>
            <View style={styles.cardHeader}>
              <Text style={styles.taskTitle} numberOfLines={1}>{item.nombre}</Text>
              <View style={[styles.statusBadge, progress >= 100 && styles.completedBadge]}>
                <Text style={[styles.statusText, progress >= 100 && styles.completedStatusText]}>
                  {progress >= 100 ? 'Completada' : item.estado}
                </Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.timeText}>
                {horasAcumuladas}h de {horasTotal}h
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: progress >= 100 ? COLORS.secondary : COLORS.accent 
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
              colors={[COLORS.secondary, '#368277']}
              style={styles.playGradient}
            >
              <Ionicons name="play" size={18} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="leaf-outline" size={60} color={COLORS.secondary} />
      </View>
      <Text style={styles.emptyTitle}>Tu día está libre</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primera tarea y comienza a ser productivo
      </Text>
      <TouchableOpacity 
        style={[styles.emptyButton, SHADOWS.medium]}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Text style={styles.emptyButtonText}>Crear tarea</Text>
      </TouchableOpacity>
    </View>
  );

  const totalMinutos = tareasHoy.reduce((acc, t) => acc + (t.tiempo_acumulado || 0), 0);
  const totalHoras = (totalMinutos / 60).toFixed(1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.saludo}>{getSaludo()} {getEmoji()}</Text>
            <Text style={styles.fecha}>{formatDate(hoy)}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={40} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        {tareasHoy.length > 0 && (
          <View style={[styles.statsCard, SHADOWS.medium]}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tareasHoy.length}</Text>
              <Text style={styles.statLabel}>Tareas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalHoras}h</Text>
              <Text style={styles.statLabel}>Trabajadas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {tareasHoy.filter(t => getProgressPercent(t.tiempo_acumulado, t.tiempo_registrado) >= 100).length}
              </Text>
              <Text style={styles.statLabel}>Hechas</Text>
            </View>
          </View>
        )}
      </View>

      {/* Tasks Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mis tareas</Text>
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

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, SHADOWS.medium]} 
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[COLORS.secondary, '#368277']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.primary,
  },
  header: { 
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saludo: { 
    color: COLORS.textMain, 
    fontSize: 24, 
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  fecha: { 
    color: COLORS.textMuted, 
    fontSize: 14,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  profileButton: {
    padding: 5,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
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
    paddingTop: SPACING.xl,
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
    paddingBottom: 100,
  },
  card: { 
    backgroundColor: COLORS.white, 
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  cardMain: {
    flex: 1,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  taskTitle: { 
    color: COLORS.textMain, 
    fontSize: 16, 
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  completedBadge: {
    backgroundColor: 'rgba(68, 161, 148, 0.2)',
  },
  statusText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  completedStatusText: {
    color: COLORS.secondary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginLeft: 5,
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
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  progressBarFill: { 
    height: 6, 
    borderRadius: RADIUS.full,
  },
  progressPercent: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginLeft: SPACING.sm,
    width: 30,
    textAlign: 'right',
    fontWeight: '600',
  },
  playButton: {
    marginLeft: SPACING.md,
  },
  playGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingTop: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondaryLight,
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
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  emptyButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  fab: { 
    position: 'absolute', 
    right: SPACING.lg, 
    bottom: SPACING.lg,
    borderRadius: RADIUS.full,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
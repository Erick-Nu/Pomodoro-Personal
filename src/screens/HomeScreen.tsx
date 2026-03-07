import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { useFocusEffect, NavigationProp } from '@react-navigation/native';
import { getTasksByDate } from '../database/db_queries_task';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Tarea, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [tareasHoy, setTareasHoy] = useState<Tarea[]>([]);
  
  const hoy = new Date().toISOString().split('T')[0];
  const hora = new Date().getHours();
  
  const getGreetingData = () => {
    if (hora < 12) return { label: 'Buenos días', icon: 'sunny-outline' };
    if (hora < 19) return { label: 'Buenas tardes', icon: 'partly-sunny-outline' };
    return { label: 'Buenas noches', icon: 'moon-outline' };
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
    const isCompleted = progress >= 100;

    return (
      <TouchableOpacity 
        style={[styles.taskCard, SHADOWS.light]} 
        onPress={() => navigation.navigate('TaskDetail', { tarea: item })}
        activeOpacity={0.7}
      >
        {/* Accent indicator bar */}
        <View style={[styles.taskAccent, { backgroundColor: isCompleted ? '#10B981' : COLORS.secondary }]} />
        
        <View style={styles.taskContent}>
          <View style={styles.taskMainInfo}>
            <Text style={styles.taskTitle} numberOfLines={1}>{item.nombre}</Text>
            <View style={styles.taskMeta}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.taskTime}>
                {(item.tiempo_acumulado / 60).toFixed(1)}h de {(item.tiempo_registrado / 60).toFixed(1)}h
              </Text>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-done" size={12} color="#10B981" />
                  <Text style={styles.completedText}>Completada</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.taskActionArea}>
            <View style={styles.miniProgressContainer}>
              <View style={styles.miniProgressBarBg}>
                <View style={[styles.miniProgressBarFill, { width: `${progress}%`, backgroundColor: isCompleted ? '#10B981' : COLORS.secondary }]} />
              </View>
              <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
            </View>
            
            {!isCompleted && (
              <TouchableOpacity 
                style={styles.inlinePlayBtn}
                onPress={() => navigation.navigate('Timer', { tarea: item })}
              >
                <Ionicons name="play-circle" size={32} color={COLORS.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const totalMinutos = tareasHoy.reduce((acc, t) => acc + (t.tiempo_acumulado || 0), 0);
  const totalHoras = (totalMinutos / 60).toFixed(1);
  const tareasCompletadas = tareasHoy.filter(t => getProgressPercent(t.tiempo_acumulado, t.tiempo_registrado) >= 100).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Dynamic Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetingLabel}>{getGreetingData().label}</Text>
            <Text style={styles.dateLabel}>{formatDate(hoy)}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color={COLORS.secondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Highlight Summary Card */}
        <LinearGradient
          colors={[COLORS.secondary, '#1E3A8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.summaryCard, SHADOWS.medium]}
        >
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalHoras}h</Text>
            <Text style={styles.summaryLabelText}>Tiempo Foco</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{tareasHoy.length}</Text>
            <Text style={styles.summaryLabelText}>Tareas Hoy</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{tareasCompletadas}</Text>
            <Text style={styles.summaryLabelText}>Finalizadas</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mi Plan del Día</Text>
          <Ionicons name="options-outline" size={20} color={COLORS.textMuted} />
        </View>

        <FlatList
          data={tareasHoy}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTask}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No hay tareas programadas</Text>
              <Text style={styles.emptySubtitle}>Organiza tu día agregando una nueva tarea ahora mismo.</Text>
              <TouchableOpacity 
                style={styles.emptyAction}
                onPress={() => navigation.navigate('AddTask', { initialDate: hoy })}
              >
                <Text style={styles.emptyActionText}>Comenzar ahora</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Modern Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, SHADOWS.medium]} 
        onPress={() => navigation.navigate('AddTask', { initialDate: hoy })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[COLORS.secondary, '#1D4ED8']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: SPACING.lg, 
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.lg 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greetingLabel: { color: COLORS.textMuted, fontSize: 14, fontWeight: '500' },
  dateLabel: { color: COLORS.textMain, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  profileBtn: { padding: 2 },
  avatarPlaceholder: { 
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.secondaryLight, 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(30, 64, 175, 0.1)' 
  },
  
  summaryCard: { 
    flexDirection: 'row', padding: 20, borderRadius: RADIUS.lg, 
    justifyContent: 'space-between', alignItems: 'center' 
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  summaryLabelText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginTop: 4, textTransform: 'uppercase' },
  summaryDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },

  content: { flex: 1, paddingHorizontal: SPACING.lg },
  sectionHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginTop: SPACING.xl, marginBottom: SPACING.md 
  },
  sectionTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: '700' },
  listPadding: { paddingBottom: 100 },

  taskCard: { 
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, marginBottom: 12, 
    flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border 
  },
  taskAccent: { width: 5, height: '100%' },
  taskContent: { flex: 1, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskMainInfo: { flex: 1 },
  taskTitle: { color: COLORS.textMain, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  taskTime: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  
  completedBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', 
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 8 
  },
  completedText: { color: '#10B981', fontSize: 10, fontWeight: '700', marginLeft: 4, textTransform: 'uppercase' },

  taskActionArea: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniProgressContainer: { alignItems: 'flex-end' },
  miniProgressBarBg: { width: 60, height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  miniProgressBarFill: { height: '100%', borderRadius: 2 },
  progressValue: { color: COLORS.textMain, fontSize: 10, fontWeight: '800', marginTop: 4 },
  inlinePlayBtn: { padding: 2 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40, lineHeight: 20 },
  emptyAction: { backgroundColor: COLORS.secondary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: RADIUS.md, marginTop: 24 },
  emptyActionText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },

  fab: { position: 'absolute', right: 24, bottom: 30, borderRadius: 30 },
  fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }
});

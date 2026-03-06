import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerTareasPorFecha } from '../database/db_queries';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

  const getProgressColor = (percent) => {
    if (percent >= 100) return ['#00C853', '#69F0AE'];
    if (percent >= 50) return ['#4CAF50', '#81C784'];
    return ['#FF9800', '#FFB74D'];
  };

  const renderTask = ({ item }) => {
    const progress = getProgressPercent(item.tiempo_acumulado, item.tiempo_registrado);
    const progressColors = getProgressColor(progress);
    const horasAcumuladas = (item.tiempo_acumulado / 60).toFixed(1);
    const horasTotal = (item.tiempo_registrado / 60).toFixed(1);

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('TaskDetail', { tarea: item })}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View style={[styles.statusIndicator, { backgroundColor: progress >= 100 ? '#00C853' : '#4CAF50' }]} />
          </View>
          
          <View style={styles.cardMain}>
            <View style={styles.cardHeader}>
              <Text style={styles.taskTitle} numberOfLines={1}>{item.nombre}</Text>
              <View style={[styles.statusBadge, progress >= 100 && styles.completedBadge]}>
                <Text style={styles.statusText}>
                  {progress >= 100 ? 'Completada' : item.estado}
                </Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={14} color="#888" />
              <Text style={styles.timeText}>
                {horasAcumuladas}h de {horasTotal}h
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={progressColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${progress}%` }]}
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
              colors={['#4CAF50', '#2E7D32']}
              style={styles.playGradient}
            >
              <Ionicons name="play" size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="leaf-outline" size={60} color="#4CAF50" />
      </View>
      <Text style={styles.emptyTitle}>Tu día está libre</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primera tarea y comienza a ser productivo
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
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
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.saludo}>{getSaludo()} {getEmoji()}</Text>
            <Text style={styles.fecha}>{formatDate(hoy)}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={40} color="#4CAF50" />
          </TouchableOpacity>
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
              <Text style={styles.statLabel}>Trabajadas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {tareasHoy.filter(t => getProgressPercent(t.tiempo_acumulado, t.tiempo_registrado) >= 100).length}
              </Text>
              <Text style={styles.statLabel}>Completadas</Text>
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
        contentContainerStyle={tareasHoy.length === 0 && styles.emptyList}
      />

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0D0D0D',
  },
  header: { 
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#121212',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saludo: { 
    color: '#fff', 
    fontSize: 26, 
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  fecha: { 
    color: '#888', 
    fontSize: 15,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  profileButton: {
    padding: 5,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#4CAF50',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  sectionCount: {
    color: '#666',
    fontSize: 14,
  },
  card: { 
    backgroundColor: '#1a1a1a', 
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardLeft: {
    marginRight: 12,
  },
  statusIndicator: {
    width: 4,
    height: 50,
    borderRadius: 2,
  },
  cardMain: {
    flex: 1,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: 'rgba(0, 200, 83, 0.2)',
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeText: {
    color: '#888',
    fontSize: 13,
    marginLeft: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: { 
    flex: 1,
    height: 6, 
    backgroundColor: '#2a2a2a', 
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: { 
    height: 6, 
    borderRadius: 3,
  },
  progressPercent: {
    color: '#666',
    fontSize: 12,
    marginLeft: 10,
    width: 35,
    textAlign: 'right',
  },
  playButton: {
    marginLeft: 12,
  },
  playGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: 25,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
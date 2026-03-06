import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { obtenerTareasPorFecha } from '../database/db_queries';

const { width } = Dimensions.get('window');

// Configuración de idioma español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

// Iconos SVG
const TaskIcon = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke={color} strokeWidth={2}/>
  </Svg>
);

const ClockIcon = ({ size = 16, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2}/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CheckIcon = ({ size = 16, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PlayIcon = ({ size = 16, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 3l14 9-14 9V3z" fill={color}/>
  </Svg>
);

const EmptyIcon = ({ size = 64, color = '#374151' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    <Path d="M12 14v.01M12 17v.01" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const ChevronRightIcon = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function CalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tareasDelDia, setTareasDelDia] = useState([]);
  const listOpacity = useRef(new Animated.Value(0)).current;
  const listTranslate = useRef(new Animated.Value(20)).current;

  const today = new Date().toISOString().split('T')[0];

  // Cargar tareas cada vez que cambie el día seleccionado
  useEffect(() => {
    // Animación de fade out/in al cambiar de día
    Animated.parallel([
      Animated.timing(listOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(listTranslate, { toValue: 20, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      const tareas = obtenerTareasPorFecha(selectedDate);
      setTareasDelDia(tareas);
      
      Animated.parallel([
        Animated.timing(listOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(listTranslate, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  }, [selectedDate]);

  const formatDateHeader = (dateString) => {
    if (dateString === today) return 'Hoy';
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-ES', options);
  };

  const getStatusConfig = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'completada':
        return { 
          color: '#22c55e', 
          bgColor: 'rgba(34, 197, 94, 0.15)', 
          icon: <CheckIcon color="#22c55e" />,
          label: 'Completada'
        };
      case 'en progreso':
        return { 
          color: '#f59e0b', 
          bgColor: 'rgba(245, 158, 11, 0.15)', 
          icon: <PlayIcon color="#f59e0b" />,
          label: 'En progreso'
        };
      default:
        return { 
          color: '#64748b', 
          bgColor: 'rgba(100, 116, 139, 0.15)', 
          icon: <ClockIcon color="#64748b" />,
          label: 'Pendiente'
        };
    }
  };

  const calculateProgress = (acumulado, registrado) => {
    if (!registrado || registrado === 0) return 0;
    return Math.min((acumulado / registrado) * 100, 100);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const renderTaskItem = ({ item, index }) => {
    const statusConfig = getStatusConfig(item.estado);
    const progress = calculateProgress(item.tiempo_acumulado, item.tiempo_registrado);
    
    return (
      <TouchableOpacity 
        style={styles.taskCard}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      >
        <View style={styles.taskCardContent}>
          {/* Icono de tarea */}
          <View style={[styles.taskIconWrapper, { backgroundColor: statusConfig.bgColor }]}>
            <TaskIcon color={statusConfig.color} />
          </View>
          
          {/* Info de la tarea */}
          <View style={styles.taskInfo}>
            <Text style={styles.taskName} numberOfLines={1}>{item.nombre}</Text>
            
            {/* Barra de progreso */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: statusConfig.color }]} />
              </View>
              <Text style={styles.progressText}>
                {formatTime(item.tiempo_acumulado)} / {formatTime(item.tiempo_registrado)}
              </Text>
            </View>
          </View>

          {/* Estado y flecha */}
          <View style={styles.taskRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              {statusConfig.icon}
            </View>
            <ChevronRightIcon color="#475569" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <EmptyIcon />
      </View>
      <Text style={styles.emptyTitle}>Sin tareas programadas</Text>
      <Text style={styles.emptySubtitle}>
        {selectedDate === today 
          ? 'Agrega una tarea para comenzar tu día productivo'
          : 'No hay tareas para esta fecha'}
      </Text>
      <TouchableOpacity 
        style={styles.addTaskBtn}
        onPress={() => navigation.navigate('AddTask', { initialDate: selectedDate })}
      >
        <LinearGradient
          colors={['#22c55e', '#16a34a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addTaskBtnGradient}
        >
          <Text style={styles.addTaskBtnText}>+ Nueva Tarea</Text>
        </LinearGradient>
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
        {/* Calendario personalizado */}
        <View style={styles.calendarWrapper}>
          <Calendar
            onDayPress={day => {
              setSelectedDate(day.dateString);
            }}
            markedDates={{
              [today]: { 
                marked: true, 
                dotColor: '#4ade80',
                ...(selectedDate === today && { selected: true, selectedColor: '#22c55e' })
              },
              ...(selectedDate !== today && {
                [selectedDate]: { selected: true, selectedColor: '#22c55e' }
              })
            }}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#94a3b8',
              selectedDayBackgroundColor: '#22c55e',
              selectedDayTextColor: '#fff',
              todayTextColor: '#4ade80',
              todayBackgroundColor: 'rgba(74, 222, 128, 0.1)',
              dayTextColor: '#e2e8f0',
              textDisabledColor: '#475569',
              monthTextColor: '#f1f5f9',
              textMonthFontWeight: '700',
              textMonthFontSize: 18,
              textDayFontWeight: '500',
              textDayFontSize: 15,
              textDayHeaderFontWeight: '600',
              textDayHeaderFontSize: 12,
              arrowColor: '#4ade80',
              'stylesheet.calendar.header': {
                week: {
                  marginTop: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(148, 163, 184, 0.1)',
                  paddingBottom: 10,
                }
              }
            }}
            style={styles.calendar}
          />
        </View>

        {/* Lista de tareas */}
        <View style={styles.taskListContainer}>
          {/* Header de la lista */}
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.dateTitle}>{formatDateHeader(selectedDate)}</Text>
              <Text style={styles.taskCount}>
                {tareasDelDia.length} {tareasDelDia.length === 1 ? 'tarea' : 'tareas'}
              </Text>
            </View>
            {tareasDelDia.length > 0 && (
              <TouchableOpacity 
                style={styles.viewAllBtn}
                onPress={() => navigation.navigate('DetalleDia', { date: selectedDate })}
              >
                <Text style={styles.viewAllText}>Ver todo</Text>
                <ChevronRightIcon size={16} color="#4ade80" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Contenido animado */}
          <Animated.View 
            style={[
              styles.listContent,
              {
                opacity: listOpacity,
                transform: [{ translateY: listTranslate }]
              }
            ]}
          >
            {tareasDelDia.length > 0 ? (
              <FlatList
                data={tareasDelDia}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTaskItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              renderEmptyState()
            )}
          </Animated.View>
        </View>
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

  // Calendario
  calendarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  calendar: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  // Lista de tareas
  taskListContainer: { 
    flex: 1, 
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTitle: { 
    color: '#f1f5f9', 
    fontSize: 20, 
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  taskCount: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  viewAllText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  listContent: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },

  // Task card
  taskCard: { 
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
    overflow: 'hidden',
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskName: { 
    color: '#f1f5f9', 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 70,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addTaskBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addTaskBtnGradient: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  addTaskBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
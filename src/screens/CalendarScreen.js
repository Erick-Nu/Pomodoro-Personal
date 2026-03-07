import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Animated,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Svg, { Path, Circle } from 'react-native-svg';
import { getTasksByDate } from '../database/db_queries_task';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';

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
const TaskIcon = ({ size = 20, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke={color} strokeWidth={2}/>
  </Svg>
);

const ChevronRightIcon = ({ size = 20, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ClockIcon = ({ size = 14, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2}/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CalendarEmptyIcon = ({ size = 56, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    <Path d="M12 14v.01M12 17v.01" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const PlusIcon = ({ size = 16, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
  </Svg>
);

export default function CalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tareasDelDia, setTareasDelDia] = useState([]);
  const listOpacity = useRef(new Animated.Value(0)).current;

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    listOpacity.setValue(0);
    const tareas = getTasksByDate(selectedDate);
    setTareasDelDia(tareas);
    Animated.timing(listOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [selectedDate]);

  const formatDateHeader = (dateString) => {
    if (dateString === today) return 'Hoy';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.taskCard, SHADOWS.light]}
      onPress={() => navigation.navigate('TaskDetail', { tarea: item })}
      activeOpacity={0.7}
    >
      <View style={styles.taskIconWrapper}>
        <TaskIcon />
      </View>
      <View style={styles.taskInfo}>
        <Text style={styles.taskName} numberOfLines={1}>{item.nombre}</Text>
        <View style={styles.taskTimeRow}>
          <ClockIcon />
          <Text style={styles.taskTime}>{(item.tiempo_registrado / 60).toFixed(1)}h programadas</Text>
        </View>
      </View>
      <ChevronRightIcon />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Calendario Section */}
      <View style={styles.calendarWrapper}>
        <Calendar
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={{
            [today]: { marked: true, dotColor: COLORS.secondary },
            [selectedDate]: { selected: true, selectedColor: COLORS.secondary }
          }}
          theme={{
            backgroundColor: COLORS.primary,
            calendarBackground: COLORS.primary,
            textSectionTitleColor: COLORS.textMuted,
            selectedDayBackgroundColor: COLORS.secondary,
            selectedDayTextColor: COLORS.white,
            todayTextColor: COLORS.secondary,
            dayTextColor: COLORS.textMain,
            textDisabledColor: COLORS.border,
            dotColor: COLORS.secondary,
            monthTextColor: COLORS.textMain,
            textMonthFontWeight: '700',
            textMonthFontSize: 18,
            arrowColor: COLORS.secondary,
            'stylesheet.calendar.header': {
              header: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 10,
              }
            }
          }}
        />
      </View>

      {/* Lista de Tareas */}
      <View style={styles.taskListContainer}>
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.dateTitle}>{formatDateHeader(selectedDate)}</Text>
            <Text style={styles.taskCount}>{tareasDelDia.length} {tareasDelDia.length === 1 ? 'tarea' : 'tareas'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.addTaskHeaderBtn}
            onPress={() => navigation.navigate('AddTask', { initialDate: selectedDate })}
          >
            <PlusIcon size={18} />
          </TouchableOpacity>
        </View>
        
        <Animated.View style={{ flex: 1, opacity: listOpacity }}>
          {tareasDelDia.length > 0 ? (
            <FlatList
              data={tareasDelDia}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderTaskItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <CalendarEmptyIcon />
              </View>
              <Text style={styles.emptyTitle}>Sin tareas programadas</Text>
              <Text style={styles.emptySubtitle}>Agrega una tarea para este día</Text>
              <TouchableOpacity 
                style={styles.addTaskBtn}
                onPress={() => navigation.navigate('AddTask', { initialDate: selectedDate })}
              >
                <PlusIcon size={16} />
                <Text style={styles.addTaskBtnText}>Nueva Tarea</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.primary 
  },
  calendarWrapper: { 
    backgroundColor: COLORS.primary, 
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  taskListContainer: { 
    flex: 1, 
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  listHeader: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg 
  },
  dateTitle: { 
    color: COLORS.textMain, 
    fontSize: 20, 
    fontWeight: '700', 
    textTransform: 'capitalize' 
  },
  taskCount: { 
    color: COLORS.textMuted, 
    fontSize: 13, 
    marginTop: 2 
  },
  addTaskHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  listContainer: { paddingBottom: 20 },
  taskCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    padding: SPACING.md, 
    borderRadius: RADIUS.md, 
    marginBottom: SPACING.sm,
    borderWidth: 1, 
    borderColor: COLORS.border
  },
  taskIconWrapper: { 
    width: 44, 
    height: 44, 
    borderRadius: RADIUS.md, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: SPACING.sm 
  },
  taskInfo: { flex: 1 },
  taskName: { 
    color: COLORS.textMain, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  taskTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  taskTime: { 
    color: COLORS.textMuted, 
    fontSize: 13 
  },

  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingBottom: 60 
  },
  emptyIconWrapper: {
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
    fontSize: 18, 
    fontWeight: '600',
    marginBottom: 4 
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: SPACING.lg,
  },
  addTaskBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.secondary, 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: RADIUS.md 
  },
  addTaskBtnText: { 
    color: COLORS.white, 
    fontWeight: '700',
    fontSize: 15,
  }
});

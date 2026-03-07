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
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { NavigationProp } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { getTasksByDate } from '../database/db_queries_task';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Tarea, RootStackParamList } from '../types';

interface CalendarScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

// Configuración de idioma español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

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

export default function CalendarScreen({ navigation }: CalendarScreenProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tareasDelDia, setTareasDelDia] = useState<Tarea[]>([]);
  const listOpacity = useRef(new Animated.Value(0)).current;

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const tareas = getTasksByDate(selectedDate);
    setTareasDelDia(tareas);
    Animated.timing(listOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [selectedDate]);

  const formatDateHeader = (dateString: string): string => {
    if (dateString === today) return 'Hoy';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const renderTaskItem = ({ item }: { item: Tarea }) => (
    <TouchableOpacity 
      style={[styles.taskCard, SHADOWS.light]}
      onPress={() => navigation.navigate('TaskDetail', { tarea: item })}
    >
      <View style={styles.taskIconWrapper}>
        <TaskIcon />
      </View>
      <View style={styles.taskInfo}>
        <Text style={styles.taskName} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.taskTime}>{(item.tiempo_registrado / 60).toFixed(1)}h programadas</Text>
      </View>
      <ChevronRightIcon />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.calendarWrapper}>
        <Calendar
          onDayPress={(day: { dateString: string; }) => setSelectedDate(day.dateString)}
          markedDates={{
            [today]: { marked: true, dotColor: COLORS.secondary },
            [selectedDate]: { selected: true, selectedColor: COLORS.secondary }
          }}
          theme={{
            backgroundColor: COLORS.white,
            calendarBackground: COLORS.white,
            textSectionTitleColor: COLORS.textMuted,
            selectedDayBackgroundColor: COLORS.secondary,
            selectedDayTextColor: COLORS.white,
            todayTextColor: COLORS.secondary,
            dayTextColor: COLORS.textMain,
            textDisabledColor: COLORS.border,
            dotColor: COLORS.secondary,
            monthTextColor: COLORS.textMain,
            textMonthFontWeight: '700',
            arrowColor: COLORS.secondary,
          }}
        />
      </View>

      <View style={styles.taskListContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.dateTitle}>{formatDateHeader(selectedDate)}</Text>
          <Text style={styles.taskCount}>{tareasDelDia.length} tareas</Text>
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
              <Text style={styles.emptyTitle}>Sin tareas para este día</Text>
              <TouchableOpacity 
                style={styles.addTaskBtn}
                onPress={() => navigation.navigate('AddTask', { initialDate: selectedDate })}
              >
                <Text style={styles.addTaskBtnText}>+ Agregar Tarea</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  calendarWrapper: { 
    backgroundColor: COLORS.white, paddingBottom: 10, 
    borderBottomWidth: 1, borderBottomColor: COLORS.border 
  },
  taskListContainer: { flex: 1, padding: SPACING.lg },
  listHeader: { marginBottom: 20 },
  dateTitle: { color: COLORS.textMain, fontSize: 20, fontWeight: '700', textTransform: 'capitalize' },
  taskCount: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  listContainer: { paddingBottom: 20 },
  taskCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, 
    padding: 16, borderRadius: RADIUS.md, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border
  },
  taskIconWrapper: { 
    width: 40, height: 40, borderRadius: RADIUS.sm, backgroundColor: COLORS.secondaryLight, 
    justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  taskInfo: { flex: 1 },
  taskName: { color: COLORS.textMain, fontSize: 16, fontWeight: '600' },
  taskTime: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyTitle: { color: COLORS.textMuted, fontSize: 16, marginBottom: 20 },
  addTaskBtn: { backgroundColor: COLORS.secondary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: RADIUS.md },
  addTaskBtnText: { color: COLORS.white, fontWeight: '700' }
});

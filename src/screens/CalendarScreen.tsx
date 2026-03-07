import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Animated,
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTasksByDate } from '../database/db_queries_task';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Tarea, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

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

export default function CalendarScreen({ navigation }: CalendarScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tareasDelDia, setTareasDelDia] = useState<Tarea[]>([]);
  
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const tareas = getTasksByDate(selectedDate);
    setTareasDelDia(tareas);
  }, [selectedDate]);

  const formatDateHeader = (dateString: string): string => {
    if (dateString === today) return 'Hoy';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  const renderTaskItem = (item: Tarea) => {
    const isCompleted = item.completada === 1 || (item.tiempo_acumulado >= item.tiempo_registrado);
    
    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.taskCard, SHADOWS.light]}
        onPress={() => navigation.navigate('TaskDetail', { tarea: item })}
        activeOpacity={0.7}
      >
        <View style={styles.taskCardBody}>
          <View style={styles.timeIndicator}>
            <View style={[styles.statusDot, { backgroundColor: isCompleted ? '#10B981' : COLORS.secondary }]} />
            <View style={styles.timeLine} />
          </View>
          
          <View style={styles.taskInfoContainer}>
            <Text style={styles.taskTitle} numberOfLines={1}>{item.nombre}</Text>
            <View style={styles.taskMetaRow}>
              <View style={styles.metaBadge}>
                <Ionicons name="timer-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{(item.tiempo_registrado / 60).toFixed(1)}h</Text>
              </View>
              {isCompleted && (
                <View style={[styles.metaBadge, styles.completedBadge]}>
                  <Ionicons name="checkmark" size={12} color="#10B981" />
                  <Text style={[styles.metaText, { color: '#10B981' }]}>Finalizada</Text>
                </View>
              )}
            </View>
          </View>
          
          <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Title */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Calendario</Text>
          <TouchableOpacity 
            style={styles.todayCircle}
            onPress={() => setSelectedDate(today)}
          >
            <Text style={styles.todayBtnText}>Ver Hoy</Text>
          </TouchableOpacity>
        </View>

        {/* Brand Blue Calendar Card */}
        <View style={[styles.calendarCard, SHADOWS.medium]}>
          <Calendar
            onDayPress={(day: { dateString: string; }) => setSelectedDate(day.dateString)}
            markedDates={{
              [today]: { marked: true, dotColor: COLORS.white },
              [selectedDate]: { selected: true, selectedColor: COLORS.white, selectedTextColor: COLORS.secondary }
            }}
            theme={{
              backgroundColor: COLORS.secondary,
              calendarBackground: COLORS.secondary,
              textSectionTitleColor: 'rgba(255,255,255,0.6)',
              selectedDayBackgroundColor: COLORS.white,
              selectedDayTextColor: COLORS.secondary,
              todayTextColor: '#EAE4D5',
              dayTextColor: COLORS.white,
              textDisabledColor: 'rgba(255,255,255,0.3)',
              dotColor: COLORS.white,
              monthTextColor: COLORS.white,
              textMonthFontWeight: '800',
              textMonthFontSize: 18,
              arrowColor: COLORS.white,
            }}
          />
        </View>

        {/* Agenda Section */}
        <View style={styles.agendaSection}>
          <View style={styles.agendaHeader}>
            <Text style={styles.agendaTitle}>{formatDateHeader(selectedDate)}</Text>
            <Text style={styles.agendaCount}>{tareasDelDia.length} tareas programadas</Text>
          </View>

          {tareasDelDia.length > 0 ? (
            <View style={styles.tasksList}>
              {tareasDelDia.map(renderTaskItem)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="calendar-outline" size={32} color={COLORS.border} />
              </View>
              <Text style={styles.emptyText}>No hay actividades</Text>
              <TouchableOpacity 
                style={styles.addInlineBtn}
                onPress={() => navigation.navigate('AddTask', { initialDate: selectedDate })}
              >
                <Text style={styles.addInlineBtnText}>+ Crear Tarea</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { paddingBottom: 40 },
  
  screenHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 20
  },
  screenTitle: { color: COLORS.textMain, fontSize: 24, fontWeight: '800' },
  todayCircle: { 
    backgroundColor: COLORS.secondaryLight, 
    paddingHorizontal: 15, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  todayBtnText: { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },

  calendarCard: { 
    backgroundColor: COLORS.secondary, 
    marginHorizontal: SPACING.lg, 
    borderRadius: RADIUS.lg,
    padding: 10,
    overflow: 'hidden'
  },

  agendaSection: { marginTop: 30, paddingHorizontal: SPACING.lg },
  agendaHeader: { marginBottom: 20 },
  agendaTitle: { color: COLORS.textMain, fontSize: 20, fontWeight: '800', textTransform: 'capitalize' },
  agendaCount: { color: COLORS.textMuted, fontSize: 13, marginTop: 4, fontWeight: '500' },

  tasksList: { marginTop: 5 },
  taskCard: { 
    backgroundColor: COLORS.white, 
    borderRadius: RADIUS.md, 
    marginBottom: 15,
    borderWidth: 1, 
    borderColor: COLORS.border
  },
  taskCardBody: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  timeIndicator: { alignItems: 'center', marginRight: 15 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 5 },
  timeLine: { width: 2, height: 30, backgroundColor: COLORS.primary, borderRadius: 1 },
  
  taskInfoContainer: { flex: 1 },
  taskTitle: { color: COLORS.textMain, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  taskMetaRow: { flexDirection: 'row', gap: 10 },
  metaBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6,
    gap: 4
  },
  completedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  metaText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },

  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 40,
    backgroundColor: 'rgba(242, 242, 242, 0.3)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border
  },
  emptyIconBg: { 
    width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center', marginBottom: 15
  },
  emptyText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600', marginBottom: 20 },
  addInlineBtn: { 
    backgroundColor: COLORS.secondary, 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: RADIUS.sm 
  },
  addInlineBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 }
});

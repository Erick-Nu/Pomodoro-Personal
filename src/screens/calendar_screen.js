import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { obtenerTareasPorFecha } from '../database/queries';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene.','Feb.','Mar','Abr','May','Jun','Jul.','Ago','Sep.','Oct.','Nov.','Dic.'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tareasDelDia, setTareasDelDia] = useState([]);

  // Cargar tareas cada vez que cambie el día seleccionado
  useEffect(() => {
    const tareas = obtenerTareasPorFecha(selectedDate);
    setTareasDelDia(tareas);
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#4CAF50' }
        }}
        theme={{
          backgroundColor: '#1a1a1a',
          calendarBackground: '#1a1a1a',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#4CAF50',
          todayTextColor: '#4CAF50',
          dayTextColor: '#fff',
          monthTextColor: '#fff',
        }}
      />

      <View style={styles.taskListContainer}>
        <Text style={styles.dateTitle}>Tareas del {selectedDate}</Text>
        
        {tareasDelDia.length > 0 ? (
          <FlatList
            data={tareasDelDia}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.taskItem}>
                <View>
                  <Text style={styles.taskName}>{item.nombre}</Text>
                  <Text style={styles.taskTime}>Progreso: {item.tiempo_acumulado}/{item.tiempo_registrado} min</Text>
                </View>
                <Text style={styles.taskStatus}>{item.estado}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>No hay tareas para este día.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  taskListContainer: { flex: 1, padding: 20 },
  dateTitle: { color: '#888', fontSize: 16, marginBottom: 15, fontWeight: 'bold' },
  taskItem: { 
    backgroundColor: '#1e1e1e', 
    padding: 15, 
    borderRadius: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  taskName: { color: '#fff', fontSize: 18, fontWeight: '600' },
  taskTime: { color: '#666', fontSize: 14 },
  taskStatus: { color: '#4CAF50', fontWeight: 'bold', fontSize: 12 },
  emptyText: { color: '#444', textAlign: 'center', marginTop: 30 }
});
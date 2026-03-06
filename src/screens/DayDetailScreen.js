import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { obtenerTareasPorFecha } from '../database/queries';

export default function DayDetailScreen({ route }) {
  const { date } = route.params;
  const tareas = obtenerTareasPorFecha(date);

  return (
    <View style={styles.container}>
      <FlatList
        data={tareas}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.nombre}</Text>
            <Text style={styles.desc}>{item.descripcion}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Sin actividad este día.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  item: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10, marginBottom: 10 },
  name: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  desc: { color: '#888', marginTop: 5 },
  empty: { color: '#444', textAlign: 'center', marginTop: 50 }
});
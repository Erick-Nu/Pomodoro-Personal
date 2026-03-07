import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Keyboard, 
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  StatusBar
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { createTask } from '../database/db_queries_task';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { RootStackParamList } from '../types';

interface AddTaskScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'AddTask'>;
}

const TaskIcon = ({ size = 20, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke={color} strokeWidth={2}/>
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const DescriptionIcon = ({ size = 20, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6h16M4 10h16M4 14h10M4 18h6" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const ClockIcon = ({ size = 20, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2}/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CalendarIcon = ({ size = 18, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

export default function AddTaskScreen({ navigation, route }: AddTaskScreenProps) {
  const { initialDate } = route.params || { initialDate: new Date().toISOString().split('T')[0] };

  const [nombre, setNombre] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [horas, setHoras] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', options);
  };

  const handleSave = () => {
    if (!nombre.trim()) {
      Alert.alert("📝 Nombre requerido", "Dale un nombre a tu tarea.");
      return;
    }
    
    if (!horas || parseInt(horas) <= 0) {
      Alert.alert("⏱️ Tiempo requerido", "Indica las horas estimadas.");
      return;
    }

    const tiempoEnMinutos = parseInt(horas) * 60; 
    
    try {
      createTask(nombre, descripcion, initialDate!, tiempoEnMinutos);
      Alert.alert("✅ Tarea creada", `"${nombre}" ha sido programada.`, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Error", "No se pudo guardar la tarea.");
    }
  };

  const isFormValid = nombre.trim() && horas && parseInt(horas) > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.dateCard, SHADOWS.light]}>
            <View style={styles.dateIconWrapper}>
              <CalendarIcon />
            </View>
            <View>
              <Text style={styles.dateLabel}>Programando para</Text>
              <Text style={styles.dateValue}>{formatDate(initialDate!)}</Text>
            </View>
          </View>

          <Animated.View style={[styles.form, { opacity: formOpacity }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, focusedInput === 'nombre' && styles.labelActive]}>Nombre de la tarea</Text>
              <View style={[styles.inputWrapper, focusedInput === 'nombre' && styles.inputWrapperActive]}>
                <TaskIcon color={focusedInput === 'nombre' ? COLORS.secondary : COLORS.textMuted} />
                <TextInput 
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  onFocus={() => setFocusedInput('nombre')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Ej: Estudiar TypeScript"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, focusedInput === 'descripcion' && styles.labelActive]}>Descripción (opcional)</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper, focusedInput === 'descripcion' && styles.inputWrapperActive]}>
                <DescriptionIcon color={focusedInput === 'descripcion' ? COLORS.secondary : COLORS.textMuted} />
                <TextInput 
                  style={[styles.input, styles.textArea]}
                  value={descripcion}
                  onChangeText={setDescripcion}
                  onFocus={() => setFocusedInput('descripcion')}
                  onBlur={() => setFocusedInput(null)}
                  multiline
                  numberOfLines={4}
                  placeholder="Detalles adicionales..."
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, focusedInput === 'tiempo' && styles.labelActive]}>Tiempo estimado</Text>
              <View style={styles.timeRow}>
                <View style={[styles.inputWrapper, styles.timeInputWrapper, focusedInput === 'tiempo' && styles.inputWrapperActive]}>
                  <ClockIcon color={focusedInput === 'tiempo' ? COLORS.secondary : COLORS.textMuted} />
                  <TextInput 
                    style={styles.input}
                    value={horas}
                    onChangeText={setHoras}
                    onFocus={() => setFocusedInput('tiempo')}
                    onBlur={() => setFocusedInput(null)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    maxLength={2}
                  />
                </View>
                <Text style={styles.timeUnit}>horas</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, !isFormValid && styles.saveBtnDisabled, SHADOWS.medium]} 
              onPress={handleSave}
              disabled={!isFormValid}
            >
              <Text style={styles.saveBtnText}>Crear Tarea</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scrollContent: { padding: SPACING.lg, paddingTop: 20 },
  dateCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, 
    padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.border
  },
  dateIconWrapper: { 
    width: 40, height: 40, borderRadius: RADIUS.sm, backgroundColor: COLORS.secondaryLight, 
    justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  dateLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  dateValue: { color: COLORS.textMain, fontSize: 16, fontWeight: '700', textTransform: 'capitalize' },
  form: { flex: 1 },
  inputGroup: { marginBottom: SPACING.lg },
  label: { color: COLORS.textMain, fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  labelActive: { color: COLORS.secondary },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, 
    borderRadius: RADIUS.md, paddingHorizontal: 16, borderWidth: 1.5, borderColor: COLORS.border 
  },
  inputWrapperActive: { borderColor: COLORS.secondary },
  input: { flex: 1, paddingVertical: 14, marginLeft: 12, color: COLORS.textMain, fontSize: 16, fontWeight: '500' },
  textAreaWrapper: { alignItems: 'flex-start', paddingTop: 14 },
  textArea: { textAlignVertical: 'top', height: 100 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeInputWrapper: { width: 100 },
  timeUnit: { marginLeft: 12, color: COLORS.textMuted, fontSize: 16, fontWeight: '600' },
  saveBtn: { 
    backgroundColor: COLORS.secondary, paddingVertical: 18, borderRadius: RADIUS.md, 
    alignItems: 'center', marginTop: SPACING.lg 
  },
  saveBtnDisabled: { backgroundColor: COLORS.border, opacity: 0.5 },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' }
});

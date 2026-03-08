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
  StatusBar,
  Dimensions
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createTask } from '../database/db_queries_task';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

interface AddTaskScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'AddTask'>;
}

export default function AddTaskScreen({ navigation, route }: AddTaskScreenProps) {
  const insets = useSafeAreaInsets();
  const { initialDate } = route.params || { initialDate: new Date().toISOString().split('T')[0] };

  const [nombre, setNombre] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [horas, setHoras] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const formOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', options);
  };

  const handleSave = () => {
    if (!nombre.trim()) {
      Alert.alert("Nombre requerido", "Por favor, asigna un nombre a la tarea.");
      return;
    }
    
    if (!horas || parseInt(horas) <= 0) {
      Alert.alert("Tiempo requerido", "Indica las horas estimadas para esta tarea.");
      return;
    }

    const tiempoEnMinutos = parseInt(horas) * 60; 
    
    try {
      createTask(nombre, descripcion, initialDate!, tiempoEnMinutos);
      Alert.alert("Tarea creada", `"${nombre}" ha sido programada correctamente.`, [
        { text: "Entendido", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar la tarea en este momento.");
    }
  };

  const isFormValid = nombre.trim() && horas && parseInt(horas) > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Gradient Header */}
        <LinearGradient
          colors={[COLORS.secondary, '#1D4ED8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.navBar, { paddingTop: insets.top + 6 }]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Nueva Tarea</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Calendar Header Indicator */}
          <View style={styles.infoSection}>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar" size={24} color={COLORS.white} style={styles.dateIcon} />
              <View>
                <Text style={styles.infoLabel}>Programando para</Text>
                <Text style={styles.infoValue}>{formatDate(initialDate!)}</Text>
              </View>
            </View>
          </View>

          <Animated.View style={[styles.formContainer, { opacity: formOpacity, transform: [{ translateY: slideAnim }] }]}>
            {/* Input: Nombre */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Ionicons 
                  name="bookmark-outline" 
                  size={16} 
                  color={focusedInput === 'nombre' ? COLORS.secondary : COLORS.textMuted} 
                />
                <Text style={[styles.label, focusedInput === 'nombre' && styles.labelActive]}>Título de la tarea</Text>
              </View>
              <TextInput 
                style={[styles.input, focusedInput === 'nombre' && styles.inputFocused]}
                value={nombre}
                onChangeText={setNombre}
                onFocus={() => setFocusedInput('nombre')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Ej: Análisis de mercado"
                placeholderTextColor={COLORS.textMuted}
                selectionColor={COLORS.secondary}
              />
            </View>

            {/* Input: Descripción */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Ionicons 
                  name="reader-outline" 
                  size={16} 
                  color={focusedInput === 'descripcion' ? COLORS.secondary : COLORS.textMuted} 
                />
                <Text style={[styles.label, focusedInput === 'descripcion' && styles.labelActive]}>Descripción</Text>
                <Text style={styles.optionalText}>(Opcional)</Text>
              </View>
              <TextInput 
                style={[styles.input, styles.textArea, focusedInput === 'descripcion' && styles.inputFocused]}
                value={descripcion}
                onChangeText={setDescripcion}
                onFocus={() => setFocusedInput('descripcion')}
                onBlur={() => setFocusedInput(null)}
                multiline
                numberOfLines={4}
                placeholder="Detalla los objetivos o pasos a seguir..."
                placeholderTextColor={COLORS.textMuted}
                selectionColor={COLORS.secondary}
              />
            </View>

            {/* Input: Tiempo */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Ionicons 
                  name="time-outline" 
                  size={16} 
                  color={focusedInput === 'tiempo' ? COLORS.secondary : COLORS.textMuted} 
                />
                <Text style={[styles.label, focusedInput === 'tiempo' && styles.labelActive]}>Inversión de tiempo</Text>
              </View>
              <View style={styles.timeInputRow}>
                <TextInput 
                  style={[styles.input, styles.timeInput, focusedInput === 'tiempo' && styles.inputFocused]}
                  value={horas}
                  onChangeText={setHoras}
                  onFocus={() => setFocusedInput('tiempo')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  maxLength={2}
                  selectionColor={COLORS.secondary}
                />
                <View style={styles.timeUnitContainer}>
                  <Text style={styles.timeUnitText}>Horas estimadas</Text>
                  <Text style={styles.pomodoroHint}>Equivale a {Math.ceil((parseInt(horas) || 0) * 60 / 25)} pomodoros</Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              style={[styles.submitBtnContainer, !isFormValid && styles.btnDisabled]} 
              onPress={handleSave}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isFormValid ? [COLORS.secondary, '#1D4ED8'] : [COLORS.border, COLORS.border]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                <Text style={[styles.submitBtnText, !isFormValid && { color: COLORS.textMuted }]}>
                  Crear Tarea
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  backBtn: { padding: 6 },
  navTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  scrollContent: { padding: SPACING.lg, paddingTop: 20 },
  
  infoSection: { marginBottom: 35 },
  dateBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.secondary, 
    padding: 20, 
    borderRadius: RADIUS.md,
    overflow: 'hidden', // Evita que el fondo blanco se filtre por las esquinas
    borderWidth: 0, // Eliminamos borde para evitar fugas visuales
  },
  dateIcon: { 
    marginRight: 15,
  },
  infoLabel: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { color: COLORS.white, fontSize: 18, fontWeight: '800', textTransform: 'capitalize', marginTop: 2 },

  formContainer: { flex: 1 },
  inputGroup: { marginBottom: 25 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8, paddingLeft: 4 },
  label: { color: COLORS.textMain, fontSize: 15, fontWeight: '700' },
  labelActive: { color: COLORS.secondary },
  optionalText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500', marginLeft: 4 },
  
  input: { 
    backgroundColor: COLORS.primary, 
    borderRadius: RADIUS.md, 
    paddingHorizontal: 18, 
    paddingVertical: 16, 
    fontSize: 16, 
    color: COLORS.textMain,
    fontWeight: '500',
    borderWidth: 1.5,
    borderColor: COLORS.border
  },
  inputFocused: { 
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.white,
  },
  textArea: { textAlignVertical: 'top', height: 120, paddingTop: 16 },
  
  timeInputRow: { flexDirection: 'row', alignItems: 'center' },
  timeInput: { width: 80, textAlign: 'center', fontSize: 24, fontWeight: '800' },
  timeUnitContainer: { marginLeft: 18 },
  timeUnitText: { color: COLORS.textMain, fontSize: 16, fontWeight: '700' },
  pomodoroHint: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500', marginTop: 2 },

  submitBtnContainer: { 
    marginTop: 20, 
    borderRadius: RADIUS.md, 
    overflow: 'hidden',
    ...SHADOWS.medium 
  },
  submitBtn: { 
    flexDirection: 'row', 
    paddingVertical: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10 
  },
  submitBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  btnDisabled: { opacity: 0.6, elevation: 0, shadowOpacity: 0 }
});

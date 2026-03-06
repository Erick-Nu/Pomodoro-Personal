import React, { useState, useRef } from 'react';
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
  Dimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { crearTarea } from '../database/db_queries';

const { width } = Dimensions.get('window');

// Iconos SVG personalizados
const TaskIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2v0z" stroke={color} strokeWidth={2}/>
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const DescriptionIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6h16M4 10h16M4 14h10M4 18h6" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const ClockIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2}/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CalendarIcon = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const RocketIcon = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.5 7 4 12.5 4 17c0 1.5.5 3 1.5 4l2-2c.5 1 1.5 2 2.5 2.5V18l2 2 2-2v3.5c1-.5 2-1.5 2.5-2.5l2 2c1-1 1.5-2.5 1.5-4 0-4.5-2.5-10-8-15z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="11" r="2" stroke={color} strokeWidth={2}/>
  </Svg>
);

export default function AddTaskScreen({ navigation, route }) {
  const { initialDate } = route.params || { initialDate: new Date().toISOString().split('T')[0] };

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [horas, setHoras] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  
  const buttonScale = useRef(new Animated.Value(1)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslate, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', options);
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = () => {
    animateButtonPress();
    
    if (!nombre.trim()) {
      Alert.alert("📝 Nombre requerido", "Dale un nombre a tu tarea para identificarla fácilmente.");
      return;
    }
    
    if (!horas || parseInt(horas) <= 0) {
      Alert.alert("⏱️ Tiempo requerido", "Indica cuántas horas dedicarás a esta tarea.");
      return;
    }

    const tiempoEnMinutos = parseInt(horas) * 60; 
    
    try {
      crearTarea(nombre, descripcion, initialDate, tiempoEnMinutos);
      Alert.alert(
        "✅ ¡Tarea creada!", 
        `"${nombre}" ha sido programada para ${formatDate(initialDate)}`,
        [{ text: "Perfecto", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      Alert.alert("❌ Error", "No se pudo guardar la tarea. Intenta nuevamente.");
    }
  };

  const isFormValid = nombre.trim() && horas && parseInt(horas) > 0;

  const calculatePomodoros = () => {
    if (!horas || parseInt(horas) <= 0) return 0;
    return Math.ceil((parseInt(horas) * 60) / 25);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f0f23']}
          style={styles.gradient}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header con fecha */}
            <View style={styles.header}>
              <View style={styles.dateContainer}>
                <View style={styles.dateIconWrapper}>
                  <CalendarIcon color="#4ade80" />
                </View>
                <View>
                  <Text style={styles.dateLabel}>Programando para</Text>
                  <Text style={styles.dateValue}>{formatDate(initialDate)}</Text>
                </View>
              </View>
            </View>

            {/* Formulario animado */}
            <Animated.View 
              style={[
                styles.formContainer,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslate }]
                }
              ]}
            >
              {/* Campo: Nombre de la tarea */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <View style={[styles.iconWrapper, focusedInput === 'nombre' && styles.iconWrapperActive]}>
                    <TaskIcon size={20} color={focusedInput === 'nombre' ? '#4ade80' : '#64748b'} />
                  </View>
                  <Text style={[styles.label, focusedInput === 'nombre' && styles.labelActive]}>
                    Nombre de la tarea
                  </Text>
                </View>
                <TextInput 
                  style={[
                    styles.input,
                    focusedInput === 'nombre' && styles.inputFocused
                  ]} 
                  value={nombre} 
                  onChangeText={setNombre}
                  onFocus={() => setFocusedInput('nombre')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Ej: Desarrollo del módulo de pagos" 
                  placeholderTextColor="#4a5568"
                  selectionColor="#4ade80"
                />
              </View>

              {/* Campo: Descripción */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <View style={[styles.iconWrapper, focusedInput === 'descripcion' && styles.iconWrapperActive]}>
                    <DescriptionIcon size={20} color={focusedInput === 'descripcion' ? '#4ade80' : '#64748b'} />
                  </View>
                  <Text style={[styles.label, focusedInput === 'descripcion' && styles.labelActive]}>
                    Descripción <Text style={styles.optional}>(opcional)</Text>
                  </Text>
                </View>
                <TextInput 
                  style={[
                    styles.input,
                    styles.textArea,
                    focusedInput === 'descripcion' && styles.inputFocused
                  ]} 
                  value={descripcion} 
                  onChangeText={setDescripcion}
                  onFocus={() => setFocusedInput('descripcion')}
                  onBlur={() => setFocusedInput(null)}
                  multiline
                  numberOfLines={4}
                  placeholder="Describe el objetivo o los pasos a seguir..." 
                  placeholderTextColor="#4a5568"
                  selectionColor="#4ade80"
                />
              </View>

              {/* Campo: Tiempo estimado */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <View style={[styles.iconWrapper, focusedInput === 'tiempo' && styles.iconWrapperActive]}>
                    <ClockIcon size={20} color={focusedInput === 'tiempo' ? '#4ade80' : '#64748b'} />
                  </View>
                  <Text style={[styles.label, focusedInput === 'tiempo' && styles.labelActive]}>
                    Tiempo estimado
                  </Text>
                </View>
                <View style={styles.timeInputContainer}>
                  <TextInput 
                    style={[
                      styles.input,
                      styles.timeInput,
                      focusedInput === 'tiempo' && styles.inputFocused
                    ]} 
                    value={horas} 
                    onChangeText={setHoras}
                    onFocus={() => setFocusedInput('tiempo')}
                    onBlur={() => setFocusedInput(null)}
                    keyboardType="numeric" 
                    placeholder="0" 
                    placeholderTextColor="#4a5568"
                    maxLength={2}
                    selectionColor="#4ade80"
                  />
                  <Text style={styles.timeUnit}>horas</Text>
                </View>
                
                {/* Indicador de pomodoros */}
                {horas && parseInt(horas) > 0 && (
                  <View style={styles.pomodoroIndicator}>
                    <Text style={styles.pomodoroText}>
                      🍅 Aproximadamente <Text style={styles.pomodoroCount}>{calculatePomodoros()}</Text> pomodoros de 25 min
                    </Text>
                  </View>
                )}
              </View>

              {/* Botón de guardar */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity 
                  style={[
                    styles.saveBtn,
                    !isFormValid && styles.saveBtnDisabled
                  ]} 
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isFormValid ? ['#22c55e', '#16a34a'] : ['#374151', '#1f2937']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveBtnGradient}
                  >
                    <RocketIcon color={isFormValid ? '#fff' : '#6b7280'} />
                    <Text style={[styles.saveBtnText, !isFormValid && styles.saveBtnTextDisabled]}>
                      Crear Tarea
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Hint de ayuda */}
              <Text style={styles.hint}>
                💡 Divide tareas grandes en bloques de 2-4 horas para mejor enfoque
              </Text>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  gradient: { 
    flex: 1 
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  // Header
  header: {
    marginBottom: 32,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  dateIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dateLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dateValue: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Form
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: '#4ade80',
  },
  optional: {
    color: '#64748b',
    fontWeight: '400',
    fontSize: 12,
  },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    color: '#f1f5f9',
    padding: 18,
    borderRadius: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  inputFocused: {
    borderColor: 'rgba(74, 222, 128, 0.5)',
    backgroundColor: 'rgba(30, 41, 59, 1)',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  
  // Time input
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 80,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 14,
  },
  timeUnit: {
    color: '#94a3b8',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  pomodoroIndicator: {
    marginTop: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  pomodoroText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  pomodoroCount: {
    color: '#f87171',
    fontWeight: '700',
  },

  // Save button
  saveBtn: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  saveBtnTextDisabled: {
    color: '#6b7280',
  },

  // Hint
  hint: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
});
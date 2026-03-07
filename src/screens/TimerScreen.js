import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  FlatList, 
  Modal,
  Animated,
  StatusBar,
  Dimensions
} from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { useTimer } from '../hooks/useTimer'; 
import { updateProgressTask } from '../database/db_queries_task';
import { registerForPushNotificationsAsync, sendLocalNotification } from '../hooks/useNotifications';

const { width } = Dimensions.get('window');

// Iconos SVG personalizados
const MusicNoteIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={2}/>
    <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth={2}/>
  </Svg>
);

const PlayIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 3l14 9-14 9V3z" fill={color}/>
  </Svg>
);

const PauseIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 4h4v16H6V4zM14 4h4v16h-4V4z" fill={color}/>
  </Svg>
);

const ListIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CloseIcon = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const SkipBackIcon = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 20L9 12l10-8v16zM5 19V5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SkipForwardIcon = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 4l10 8-10 8V4zM19 5v14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckIcon = ({ size = 18, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function TimerScreen({ route, navigation }) {
  const { tarea } = route.params;
  const [modo, setModo] = useState(60); 
  const { formatTime, isActive, toggle, reset, seconds } = useTimer(modo);

  // Estados de música
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canciones, setCanciones] = useState([]);
  const [cancionSeleccionada, setCancionSeleccionada] = useState(null);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);

  // Animaciones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslate = useRef(new Animated.Value(300)).current;

  // Configuración del círculo de progreso
  const totalSeconds = modo * 60;
  const radius = 130;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / totalSeconds;

  useEffect(() => {
    registerForPushNotificationsAsync();
    cargarMusicaLocal();
    
    // Configurar modo de audio
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    
    return () => {
      // Limpieza al desmontar
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  // Animación de pulso cuando está activo
  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  useEffect(() => {
    if (seconds === 0 && isActive) {
      handleTimerComplete();
    }
  }, [seconds, isActive]);

  // Cargar música local
  const cargarMusicaLocal = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const media = await MediaLibrary.getAssetsAsync({
          mediaType: 'audio',
          first: 100,
        });
        setCanciones(media.assets);
        if (media.assets.length > 0) {
          setCancionSeleccionada(media.assets[0]);
        }
      }
    } catch (error) {
      console.error('Error cargando música:', error);
    }
  };

  // Reproducir/Pausar música
  const playPauseMusic = async () => {
    try {
      setIsLoadingMusic(true);
      
      if (!cancionSeleccionada) {
        Alert.alert("🎵 Sin música", "No hay canciones disponibles. Verifica los permisos.");
        setIsLoadingMusic(false);
        return;
      }

      if (soundRef.current === null) {
        // Crear nuevo sonido
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: cancionSeleccionada.uri },
          { shouldPlay: true, isLooping: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = newSound;
        setIsPlaying(true);
      } else {
        // Toggle play/pause
        const status = await soundRef.current.getStatusAsync();
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error reproduciendo música:', error);
      Alert.alert("❌ Error", "No se pudo reproducir el archivo de audio.");
    } finally {
      setIsLoadingMusic(false);
    }
  };

  // Callback de estado de reproducción
  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish && !status.isLooping) {
      setIsPlaying(false);
    }
  };

  // Cambiar canción
  const cambiarCancion = async (cancion) => {
    try {
      // Detener y descargar sonido actual
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      setCancionSeleccionada(cancion);
      setIsPlaying(false);
      closeModal();
      
      // Reproducir automáticamente la nueva canción
      setTimeout(async () => {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: cancion.uri },
          { shouldPlay: true, isLooping: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = newSound;
        setIsPlaying(true);
      }, 300);
    } catch (error) {
      console.error('Error cambiando canción:', error);
    }
  };

  // Siguiente canción
  const siguienteCancion = async () => {
    if (canciones.length === 0) return;
    const currentIndex = canciones.findIndex(c => c.id === cancionSeleccionada?.id);
    const nextIndex = (currentIndex + 1) % canciones.length;
    await cambiarCancion(canciones[nextIndex]);
  };

  // Canción anterior
  const anteriorCancion = async () => {
    if (canciones.length === 0) return;
    const currentIndex = canciones.findIndex(c => c.id === cancionSeleccionada?.id);
    const prevIndex = currentIndex <= 0 ? canciones.length - 1 : currentIndex - 1;
    await cambiarCancion(canciones[prevIndex]);
  };

  // Abrir modal
  const openModal = () => {
    setShowMusicModal(true);
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(modalTranslate, {
        toValue: 0,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Cerrar modal
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslate, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowMusicModal(false));
  };

  const handleTimerComplete = async () => {
    // Detener música al completar
    if (soundRef.current && isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
    
    await sendLocalNotification("¡Tiempo cumplido! 🏆", `Sumaste ${modo} min a: ${tarea.nombre}`);
    finalizarYGuardar();
  };

  const finalizarYGuardar = () => {
    updateProgressTask(tarea.id, modo);
    navigation.goBack();
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleToggle = () => {
    animateButton();
    toggle();
  };

  const handleModeChange = (newMode) => {
    if (isActive) {
      Alert.alert(
        "⏱️ Timer activo",
        "¿Deseas cambiar el modo? Se reiniciará el temporizador.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Cambiar", onPress: () => { reset(newMode); setModo(newMode); } }
        ]
      );
    } else {
      reset(newMode);
      setModo(newMode);
    }
  };

  const formatSongName = (filename) => {
    if (!filename) return 'Desconocido';
    // Quitar extensión y limpiar nombre
    return filename.replace(/\.[^/.]+$/, "").substring(0, 30);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23']}
        style={styles.gradient}
      >
        {/* Card de Música */}
        <View style={styles.musicCard}>
          <LinearGradient
            colors={['rgba(74, 222, 128, 0.1)', 'rgba(34, 197, 94, 0.05)']}
            style={styles.musicCardGradient}
          >
            <View style={styles.musicInfo}>
              <View style={[styles.musicIconWrapper, isPlaying && styles.musicIconPlaying]}>
                <MusicNoteIcon size={22} color={isPlaying ? '#4ade80' : '#94a3b8'} />
              </View>
              <View style={styles.musicTextContainer}>
                <Text style={styles.musicLabel}>Reproduciendo</Text>
                <Text style={styles.musicTitle} numberOfLines={1}>
                  {cancionSeleccionada ? formatSongName(cancionSeleccionada.filename) : "Sin música seleccionada"}
                </Text>
              </View>
            </View>
            
            <View style={styles.musicControls}>
              <TouchableOpacity onPress={anteriorCancion} style={styles.skipBtn} activeOpacity={0.7}>
                <SkipBackIcon color="#94a3b8" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={playPauseMusic} 
                style={[styles.playBtn, isPlaying && styles.playBtnActive]}
                activeOpacity={0.8}
                disabled={isLoadingMusic}
              >
                <LinearGradient
                  colors={isPlaying ? ['#22c55e', '#16a34a'] : ['#475569', '#334155']}
                  style={styles.playBtnGradient}
                >
                  {isPlaying ? (
                    <PauseIcon size={20} color="#fff" />
                  ) : (
                    <View style={{ paddingLeft: 2 }}>
                      <PlayIcon size={20} color="#fff" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={siguienteCancion} style={styles.skipBtn} activeOpacity={0.7}>
                <SkipForwardIcon color="#94a3b8" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={openModal} style={styles.listBtn} activeOpacity={0.7}>
                <ListIcon size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Timer circular */}
        <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2}>
            {/* Círculo de fondo */}
            <Circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke="rgba(71, 85, 105, 0.3)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Círculo de progreso */}
            <Circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke={isActive ? "#4ade80" : "#22c55e"}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              transform={`rotate(-90 ${radius + strokeWidth} ${radius + strokeWidth})`}
            />
            {/* Círculo interior decorativo */}
            <Circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius - 20}
              stroke="rgba(74, 222, 128, 0.1)"
              strokeWidth={1}
              fill="transparent"
            />
          </Svg>
          
          <View style={styles.timeOverlay}>
            <Text style={[styles.timeText, isActive && styles.timeTextActive]}>
              {formatTime()}
            </Text>
            <Text style={styles.taskLabel} numberOfLines={1}>{tarea.nombre}</Text>
            <View style={styles.modeIndicator}>
              <Text style={styles.modeIndicatorText}>
                {modo} min • {Math.ceil(modo / 25)} 🍅
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Selectores de modo */}
        <View style={styles.modeSection}>
          <Text style={styles.modeSectionTitle}>Duración del enfoque</Text>
          <View style={styles.modeRow}>
            {[25, 30, 45, 60].map((m) => (
              <TouchableOpacity 
                key={m}
                style={[styles.modeBtn, modo === m && styles.activeMode]} 
                onPress={() => handleModeChange(m)}
                activeOpacity={0.7}
              >
                {modo === m ? (
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    style={styles.modeBtnGradient}
                  >
                    <Text style={[styles.modeText, styles.modeTextActive]}>{m}</Text>
                    <Text style={[styles.modeUnit, styles.modeUnitActive]}>min</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.modeBtnInner}>
                    <Text style={styles.modeText}>{m}</Text>
                    <Text style={styles.modeUnit}>min</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botón principal */}
        <Animated.View style={[styles.mainBtnContainer, { transform: [{ scale: buttonScale }] }]}>
          <TouchableOpacity 
            style={styles.mainBtn}
            onPress={handleToggle}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isActive ? ['#ef4444', '#dc2626'] : ['#22c55e', '#16a34a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.mainBtnGradient}
            >
              {isActive ? (
                <PauseIcon size={24} color="#fff" />
              ) : (
                <View style={{ paddingLeft: 3 }}>
                  <PlayIcon size={24} color="#fff" />
                </View>
              )}
              <Text style={styles.mainBtnText}>
                {isActive ? 'PAUSAR' : 'COMENZAR'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Modal de selección de canciones */}
        <Modal visible={showMusicModal} animationType="none" transparent>
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              activeOpacity={1} 
              onPress={closeModal}
            />
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  opacity: modalOpacity,
                  transform: [{ translateY: modalTranslate }]
                }
              ]}
            >
              <View style={styles.modalHandle} />
              
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <View style={styles.modalIconWrapper}>
                    <MusicNoteIcon size={22} color="#4ade80" />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Tu Biblioteca</Text>
                    <Text style={styles.modalSubtitle}>{canciones.length} canciones</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={closeModal} style={styles.closeBtn} activeOpacity={0.7}>
                  <CloseIcon size={22} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {canciones.length > 0 ? (
                <FlatList
                  data={canciones}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.songList}
                  renderItem={({ item }) => {
                    const isSelected = cancionSeleccionada?.id === item.id;
                    return (
                      <TouchableOpacity 
                        style={[styles.songItem, isSelected && styles.songItemSelected]}
                        onPress={() => cambiarCancion(item)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.songIconWrapper, isSelected && styles.songIconSelected]}>
                          <MusicNoteIcon size={18} color={isSelected ? '#4ade80' : '#64748b'} />
                        </View>
                        <Text 
                          style={[styles.songName, isSelected && styles.songNameSelected]} 
                          numberOfLines={1}
                        >
                          {formatSongName(item.filename)}
                        </Text>
                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <CheckIcon size={16} color="#4ade80" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <View style={styles.emptyMusic}>
                  <MusicNoteIcon size={48} color="#374151" />
                  <Text style={styles.emptyMusicTitle}>Sin música</Text>
                  <Text style={styles.emptyMusicText}>
                    No se encontraron archivos de audio en tu dispositivo
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  gradient: { 
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  // Music Card
  musicCard: { 
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  musicCardGradient: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  musicInfo: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center',
    marginRight: 12,
  },
  musicIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  musicIconPlaying: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  musicTextContainer: {
    flex: 1,
  },
  musicLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  musicTitle: { 
    color: '#f1f5f9', 
    fontSize: 15, 
    fontWeight: '600',
  },
  musicControls: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 8,
  },
  skipBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  playBtnActive: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  playBtnGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },

  // Timer
  timerContainer: { 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 30,
  },
  timeOverlay: { 
    position: 'absolute', 
    alignItems: 'center',
  },
  timeText: { 
    color: '#e2e8f0', 
    fontSize: 56, 
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  timeTextActive: {
    color: '#4ade80',
  },
  taskLabel: { 
    color: '#94a3b8', 
    fontSize: 15, 
    marginTop: 8,
    fontWeight: '500',
    maxWidth: 200,
    textAlign: 'center',
  },
  modeIndicator: {
    marginTop: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  modeIndicatorText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '600',
  },

  // Mode Selection
  modeSection: {
    width: '100%',
    marginBottom: 30,
  },
  modeSectionTitle: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  modeRow: { 
    flexDirection: 'row', 
    justifyContent: 'center',
    gap: 12,
  },
  modeBtn: { 
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  modeBtnInner: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
  },
  modeBtnGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  activeMode: { 
    borderColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modeText: { 
    color: '#94a3b8', 
    fontWeight: '700',
    fontSize: 20,
  },
  modeTextActive: {
    color: '#fff',
  },
  modeUnit: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  modeUnitActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Main Button
  mainBtnContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  mainBtn: { 
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  mainBtnGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  mainBtnText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: { 
    backgroundColor: '#1e293b',
    maxHeight: '60%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
    borderBottomWidth: 0,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 85, 105, 0.3)',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: { 
    color: '#f1f5f9', 
    fontSize: 18, 
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 34,
  },
  songItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
  },
  songItemSelected: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  songIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  songIconSelected: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  songName: { 
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  songNameSelected: {
    color: '#4ade80',
    fontWeight: '600',
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMusic: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  emptyMusicTitle: {
    color: '#e2e8f0',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMusicText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
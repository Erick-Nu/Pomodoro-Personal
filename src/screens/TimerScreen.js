import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { useTimer } from '../hooks/useTimer'; 
import { updateProgressTask } from '../database/db_queries_task';
import { registerForPushNotificationsAsync, sendLocalNotification } from '../hooks/useNotifications';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';

const { width } = Dimensions.get('window');
const TIMER_SIZE = Math.min(width - 80, 280);

// Iconos SVG personalizados
const MusicNoteIcon = ({ size = 24, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={2}/>
    <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth={2}/>
  </Svg>
);

const PlayIcon = ({ size = 24, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 3l14 9-14 9V3z" fill={color}/>
  </Svg>
);

const PauseIcon = ({ size = 24, color = COLORS.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 4h4v16H6V4zM14 4h4v16h-4V4z" fill={color}/>
  </Svg>
);

const ListIcon = ({ size = 24, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CloseIcon = ({ size = 24, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const SkipBackIcon = ({ size = 20, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 20L9 12l10-8v16zM5 19V5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SkipForwardIcon = ({ size = 20, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 4l10 8-10 8V4zM19 5v14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckIcon = ({ size = 18, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const TimerIcon = ({ size = 20, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="13" r="8" stroke={color} strokeWidth={2}/>
    <Path d="M12 9v4l2 2M10 2h4M12 2v2" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

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
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Configuración del círculo de progreso
  const totalSeconds = modo * 60;
  const radius = (TIMER_SIZE - 24) / 2;
  const strokeWidth = 10;
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
        Alert.alert("Sin música", "No hay canciones disponibles. Verifica los permisos de la aplicación.");
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
      Alert.alert("Error", "No se pudo reproducir el archivo de audio. Intenta con otro archivo.");
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
  };

  // Cerrar modal
  const closeModal = () => {
    setShowMusicModal(false);
  };

  const handleTimerComplete = async () => {
    // Detener música al completar
    if (soundRef.current && isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
    
    await sendLocalNotification("¡Tiempo cumplido!", `Completaste ${modo} minutos trabajando en: ${tarea.nombre}`);
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
        "Timer activo",
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
    return filename.replace(/\.[^/.]+$/, "").substring(0, 28);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <TimerIcon size={22} color={COLORS.secondary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Enfoque</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{tarea.nombre}</Text>
          </View>
        </View>

        {/* Timer circular */}
        <View style={styles.timerWrapper}>
          <View style={styles.timerCard}>
            <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
                {/* Círculo de fondo */}
                <Circle
                  cx={TIMER_SIZE / 2}
                  cy={TIMER_SIZE / 2}
                  r={radius}
                  stroke={COLORS.border}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Círculo de progreso */}
                <Circle
                  cx={TIMER_SIZE / 2}
                  cy={TIMER_SIZE / 2}
                  r={radius}
                  stroke={isActive ? COLORS.secondary : COLORS.secondary}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${TIMER_SIZE / 2} ${TIMER_SIZE / 2})`}
                />
              </Svg>
              
              <View style={styles.timeOverlay}>
                <Text style={[styles.timeText, isActive && styles.timeTextActive]}>
                  {formatTime()}
                </Text>
                <View style={styles.pomodoroInfo}>
                  <Text style={styles.pomodoroText}>
                    {modo} min · {Math.ceil(modo / 25)} pomodoros
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Selectores de modo */}
        <View style={styles.modeSection}>
          <Text style={styles.sectionTitle}>Duración</Text>
          <View style={styles.modeRow}>
            {[25, 30, 45, 60].map((m) => (
              <TouchableOpacity 
                key={m}
                style={[styles.modeBtn, modo === m && styles.modeBtnActive]} 
                onPress={() => handleModeChange(m)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeText, modo === m && styles.modeTextActive]}>{m}</Text>
                <Text style={[styles.modeUnit, modo === m && styles.modeUnitActive]}>min</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Card de Música */}
        <View style={[styles.musicCard, SHADOWS.light]}>
          <View style={styles.musicHeader}>
            <View style={styles.musicInfo}>
              <View style={[styles.musicIcon, isPlaying && styles.musicIconActive]}>
                <MusicNoteIcon size={20} color={isPlaying ? COLORS.secondary : COLORS.textMuted} />
              </View>
              <View style={styles.musicText}>
                <Text style={styles.musicLabel}>Reproduciendo</Text>
                <Text style={styles.musicTitle} numberOfLines={1}>
                  {cancionSeleccionada ? formatSongName(cancionSeleccionada.filename) : "Sin selección"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={openModal} style={styles.listBtn} activeOpacity={0.7}>
              <ListIcon size={20} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.musicControls}>
            <TouchableOpacity onPress={anteriorCancion} style={styles.controlBtn} activeOpacity={0.7}>
              <SkipBackIcon size={22} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={playPauseMusic} 
              style={styles.playPauseBtn}
              activeOpacity={0.8}
              disabled={isLoadingMusic}
            >
              <LinearGradient
                colors={isPlaying ? COLORS.gradientPrimary : [COLORS.border, COLORS.card]}
                style={styles.playPauseBtnGradient}
              >
                {isPlaying ? (
                  <PauseIcon size={22} />
                ) : (
                  <View style={{ paddingLeft: 2 }}>
                    <PlayIcon size={22} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={siguienteCancion} style={styles.controlBtn} activeOpacity={0.7}>
              <SkipForwardIcon size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón principal */}
        <View style={styles.actionSection}>
          <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
            <TouchableOpacity 
              style={styles.mainBtn}
              onPress={handleToggle}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={isActive ? [COLORS.error, '#DC2626'] : COLORS.gradientPrimary}
                style={styles.mainBtnGradient}
              >
                {isActive ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
                <Text style={styles.mainBtnText}>
                  {isActive ? 'PAUSAR' : 'COMENZAR'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Modal de selección de canciones */}
      <Modal visible={showMusicModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={closeModal}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIconWrapper}>
                  <MusicNoteIcon size={22} color={COLORS.secondary} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Biblioteca</Text>
                  <Text style={styles.modalSubtitle}>{canciones.length} canciones</Text>
                </View>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn} activeOpacity={0.7}>
                <CloseIcon size={22} />
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
                      <View style={[styles.songIcon, isSelected && styles.songIconSelected]}>
                        <MusicNoteIcon size={18} color={isSelected ? COLORS.secondary : COLORS.textMuted} />
                      </View>
                      <Text 
                        style={[styles.songName, isSelected && styles.songNameSelected]} 
                        numberOfLines={1}
                      >
                        {formatSongName(item.filename)}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <CheckIcon size={16} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <View style={styles.emptyState}>
                <MusicNoteIcon size={48} color={COLORS.border} />
                <Text style={styles.emptyTitle}>Sin música</Text>
                <Text style={styles.emptyText}>
                  No se encontraron archivos de audio
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
    maxWidth: 200,
  },

  // Timer
  timerWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  timerContainer: { 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  timeOverlay: { 
    position: 'absolute', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: { 
    color: COLORS.textMain, 
    fontSize: 52, 
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  timeTextActive: {
    color: COLORS.secondary,
  },
  pomodoroInfo: {
    marginTop: SPACING.sm,
    backgroundColor: `${COLORS.secondary}15`,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
  },
  pomodoroText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Mode Selection
  modeSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeRow: { 
    flexDirection: 'row', 
    gap: SPACING.sm,
  },
  modeBtn: { 
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeBtnActive: { 
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  modeText: { 
    color: COLORS.textMuted, 
    fontWeight: '700',
    fontSize: 18,
  },
  modeTextActive: {
    color: COLORS.white,
  },
  modeUnit: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  modeUnitActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Music Card
  musicCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  musicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  musicIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  musicIconActive: {
    backgroundColor: `${COLORS.secondary}20`,
  },
  musicText: {
    flex: 1,
  },
  musicLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  musicTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
    marginTop: 2,
  },
  listBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseBtn: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  playPauseBtnGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Action Section
  actionSection: {
    marginTop: SPACING.md,
  },
  mainBtn: { 
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  mainBtnGradient: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  mainBtnText: { 
    color: COLORS.white, 
    fontSize: 16, 
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
    backgroundColor: COLORS.overlay,
  },
  modalContent: { 
    backgroundColor: COLORS.card,
    maxHeight: '60%',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  modalTitle: { 
    color: COLORS.textMain, 
    fontSize: 18, 
    fontWeight: '700',
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  songItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  songItemSelected: {
    backgroundColor: `${COLORS.secondary}15`,
  },
  songIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  songIconSelected: {
    backgroundColor: `${COLORS.secondary}20`,
  },
  songName: { 
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  songNameSelected: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COLORS.secondary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.textMain,
    fontSize: 17,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
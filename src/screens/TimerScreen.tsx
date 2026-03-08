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
import { NavigationProp, RouteProp } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimer } from '../hooks/useTimer'; 
import { updateProgressTask } from '../database/db_queries_task';
import { registerForPushNotificationsAsync, sendLocalNotification } from '../hooks/useNotifications';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Tarea, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'Timer'>;
}

export default function TimerScreen({ route, navigation }: TimerScreenProps) {
  const insets = useSafeAreaInsets();
  const { tarea } = route.params;
  const [modo, setModo] = useState<number>(25); 
  const { formatTime, isActive, toggle, reset, seconds } = useTimer(modo);

  // Audio States
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [canciones, setCanciones] = useState<MediaLibrary.Asset[]>([]);
  const [cancionSeleccionada, setCancionSeleccionada] = useState<MediaLibrary.Asset | null>(null);
  const [showMusicModal, setShowMusicModal] = useState<boolean>(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Progress Circle Config
  const totalSeconds = modo * 60;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / totalSeconds;

  useEffect(() => {
    registerForPushNotificationsAsync();
    cargarMusicaLocal();
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const cargarMusicaLocal = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      const media = await MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 50 });
      setCanciones(media.assets);
      if (media.assets.length > 0) setCancionSeleccionada(media.assets[0]);
    }
  };

  const playPauseMusic = async () => {
    if (!cancionSeleccionada) return;
    try {
      if (soundRef.current === null) {
        const { sound } = await Audio.Sound.createAsync({ uri: cancionSeleccionada.uri }, { shouldPlay: true, isLooping: true });
        soundRef.current = sound;
        setIsPlaying(true);
      } else {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) { await soundRef.current.pauseAsync(); setIsPlaying(false); }
          else { await soundRef.current.playAsync(); setIsPlaying(true); }
        }
      }
    } catch (error) { console.error(error); }
  };

  const skipSong = async (direction: 'next' | 'prev') => {
    if (canciones.length === 0) return;
    const currentIndex = canciones.findIndex(c => c.id === cancionSeleccionada?.id);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= canciones.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = canciones.length - 1;
    if (soundRef.current) { await soundRef.current.unloadAsync(); soundRef.current = null; }
    setCancionSeleccionada(canciones[nextIndex]);
    setIsPlaying(false);
    setTimeout(() => playPauseMusic(), 200);
  };

  const handleTimerComplete = async () => {
    if (soundRef.current && isPlaying) await soundRef.current.pauseAsync();
    setIsPlaying(false);
    await sendLocalNotification("¡Tiempo cumplido! 🏆", `Has finalizado una sesión para: ${tarea.nombre}`);
    updateProgressTask(tarea.id, modo);
    navigation.goBack();
  };

  useEffect(() => {
    if (seconds === 0 && isActive) handleTimerComplete();
  }, [seconds, isActive]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Navbar Title */}
      <LinearGradient
        colors={[COLORS.secondary, '#1D4ED8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.navBar, { paddingTop: insets.top + 6 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Pomodoro</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Compact Player Top */}
        <View style={[styles.playerCard, SHADOWS.light]}>
          <View style={styles.playerInfo}>
            <Ionicons name="musical-notes" size={18} color={COLORS.secondary} />
            <Text style={styles.trackName} numberOfLines={1}>
              {cancionSeleccionada?.filename.replace(/\.[^/.]+$/, "") || "Seleccionar ambiente"}
            </Text>
            <TouchableOpacity onPress={() => setShowMusicModal(true)}>
              <Ionicons name="list" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.playerControls}>
            <TouchableOpacity onPress={() => skipSong('prev')}><Ionicons name="play-back" size={22} color={COLORS.textMuted} /></TouchableOpacity>
            <TouchableOpacity onPress={playPauseMusic} style={styles.playBtnMini}><Ionicons name={isPlaying ? "pause" : "play"} size={24} color={COLORS.secondary} /></TouchableOpacity>
            <TouchableOpacity onPress={() => skipSong('next')}><Ionicons name="play-forward" size={22} color={COLORS.textMuted} /></TouchableOpacity>
          </View>
        </View>

        {/* Timer Display */}
        <Animated.View style={[styles.timerWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <Svg width={radius * 2 + 20} height={radius * 2 + 20}>
            <Circle cx={radius + 10} cy={radius + 10} r={radius} stroke={COLORS.primary} strokeWidth={6} fill="none" />
            <AnimatedCircle
              cx={radius + 10} cy={radius + 10} r={radius}
              stroke={COLORS.secondary} strokeWidth={6} fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              transform={`rotate(-90 ${radius + 10} ${radius + 10})`}
            />
          </Svg>
          <View style={styles.timeOverlay}>
            <Text style={styles.timerText}>{formatTime()}</Text>
            <Text style={styles.taskLabel} numberOfLines={1}>{tarea.nombre}</Text>
          </View>
        </Animated.View>

        {/* Duration Selectors */}
        <View style={styles.selectorSection}>
          <Text style={styles.sectionLabel}>DURACIÓN DE LA SESIÓN</Text>
          <View style={styles.modeRow}>
            {[25, 45, 60].map((m) => (
              <TouchableOpacity 
                key={m} 
                style={[styles.modeBtn, modo === m && styles.modeBtnActive, SHADOWS.light]} 
                onPress={() => { reset(m); setModo(m); }}
              >
                <Text style={[styles.modeBtnText, modo === m && styles.modeBtnTextActive]}>{m}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={[styles.mainActionBtn, SHADOWS.medium]} onPress={toggle} activeOpacity={0.9}>
          <LinearGradient
            colors={isActive ? ['#EF4444', '#DC2626'] : [COLORS.secondary, '#1D4ED8']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.gradientBtn}
          >
            <Ionicons name={isActive ? "pause" : "play"} size={22} color={COLORS.white} />
            <Text style={styles.mainActionText}>{isActive ? 'DETENER SESIÓN' : 'COMENZAR ENFOQUE'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Music Modal */}
      <Modal visible={showMusicModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Música de ambiente</Text><TouchableOpacity onPress={() => setShowMusicModal(false)}><Ionicons name="close" size={28} color={COLORS.textMain} /></TouchableOpacity></View>
            <FlatList
              data={canciones}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.songItem} onPress={async () => { if (soundRef.current) await soundRef.current.unloadAsync(); setCancionSeleccionada(item); setShowMusicModal(false); setTimeout(() => playPauseMusic(), 300); }}>
                  <Ionicons name="musical-note" size={20} color={COLORS.secondary} /><Text style={styles.songNameText} numberOfLines={1}>{item.filename}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  backBtn: { padding: 6 },
  navTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100, alignItems: 'center' },
  
  playerCard: { width: width - 40, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: 15, marginTop: 20 },
  playerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  trackName: { flex: 1, color: COLORS.textMain, fontWeight: '700', fontSize: 14 },
  playerControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30 },
  playBtnMini: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },

  timerWrapper: { justifyContent: 'center', alignItems: 'center', marginVertical: 40 },
  timeOverlay: { position: 'absolute', alignItems: 'center' },
  timerText: { color: COLORS.textMain, fontSize: 68, fontWeight: '200' },
  taskLabel: { color: COLORS.textMuted, fontSize: 15, marginTop: 10, fontWeight: '600' },

  selectorSection: { width: '100%', alignItems: 'center', marginBottom: 40 },
  sectionLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 20 },
  modeRow: { flexDirection: 'row', gap: 15 },
  modeBtn: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: RADIUS.sm, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  modeBtnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  modeBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 16 },
  modeBtnTextActive: { color: COLORS.white },

  mainActionBtn: { width: width - 60, borderRadius: RADIUS.md, overflow: 'hidden' },
  gradientBtn: { flexDirection: 'row', paddingVertical: 18, justifyContent: 'center', alignItems: 'center', gap: 12 },
  mainActionText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, padding: 24, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: '700' },
  songItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  songNameText: { color: COLORS.textMain, fontSize: 15, flex: 1 },
  emptyListText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 30 }
});

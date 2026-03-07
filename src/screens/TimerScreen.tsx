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
  Dimensions
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { useTimer } from '../hooks/useTimer'; 
import { updateProgressTask } from '../database/db_queries_task';
import { registerForPushNotificationsAsync, sendLocalNotification } from '../hooks/useNotifications';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../styles/theme';
import { Tarea, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

interface TimerScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'Timer'>;
}

const MusicNoteIcon = ({ size = 24, color = COLORS.textMain }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={2}/>
    <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth={2}/>
  </Svg>
);

const PlayIcon = ({ size = 24, color = COLORS.black }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2}/>
  </Svg>
);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function TimerScreen({ route, navigation }: TimerScreenProps) {
  const { tarea } = route.params;
  const [modo, setModo] = useState<number>(25); 
  const { formatTime, isActive, toggle, reset, seconds } = useTimer(modo);

  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [canciones, setCanciones] = useState<MediaLibrary.Asset[]>([]);
  const [cancionSeleccionada, setCancionSeleccionada] = useState<MediaLibrary.Asset | null>(null);
  const [showMusicModal, setShowMusicModal] = useState<boolean>(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const modalTranslate = useRef(new Animated.Value(300)).current;

  const totalSeconds = modo * 60;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / totalSeconds;

  useEffect(() => {
    registerForPushNotificationsAsync();
    cargarMusicaLocal();
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const cargarMusicaLocal = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      const media = await MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 50 });
      setCanciones(media.assets);
      if (media.assets.length > 0) setCancionSeleccionada(media.assets[0]);
    }
  };

  const handleTimerComplete = async () => {
    await sendLocalNotification("¡Tiempo cumplido! 🏆", `Sumaste ${modo} min a: ${tarea.nombre}`);
    updateProgressTask(tarea.id, modo);
    navigation.goBack();
  };

  useEffect(() => {
    if (seconds === 0 && isActive) handleTimerComplete();
  }, [seconds, isActive]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.musicCard, SHADOWS.light]}>
        <View style={styles.musicInfo}>
          <Text style={styles.musicTitle} numberOfLines={1}>
            {cancionSeleccionada?.filename || "Ambiente"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowMusicModal(true)}>
          <MusicNoteIcon />
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <Svg width={radius * 2 + 20} height={radius * 2 + 20}>
          <Circle cx={radius + 10} cy={radius + 10} r={radius} stroke="#333" strokeWidth={10} fill="none" />
          <AnimatedCircle
            cx={radius + 10} cy={radius + 10} r={radius}
            stroke={COLORS.secondary} strokeWidth={10} fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius + 10} ${radius + 10})`}
          />
        </Svg>
        <View style={styles.timeOverlay}>
          <Text style={styles.timeText}>{formatTime()}</Text>
          <Text style={styles.taskLabel}>{tarea.nombre}</Text>
        </View>
      </View>

      <View style={styles.modeRow}>
        {[25, 45, 60].map((m) => (
          <TouchableOpacity key={m} style={[styles.modeBtn, modo === m && styles.activeMode]} onPress={() => {reset(m); setModo(m);}}>
            <Text style={[styles.modeText, modo === m && {color: COLORS.black}]}>{m}m</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.mainBtn} onPress={toggle}>
        <LinearGradient colors={[COLORS.secondary, COLORS.accent]} style={styles.mainBtnGradient}>
          <Text style={styles.mainBtnText}>{isActive ? 'PAUSAR' : 'COMENZAR'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black, alignItems: 'center', paddingTop: 60 },
  musicCard: { width: width - 40, backgroundColor: COLORS.secondary, padding: 15, borderRadius: RADIUS.md, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  musicInfo: { flex: 1 },
  musicTitle: { color: COLORS.black, fontWeight: '600' },
  timerContainer: { justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  timeOverlay: { position: 'absolute', alignItems: 'center' },
  timeText: { color: COLORS.textMain, fontSize: 64, fontWeight: '300' },
  taskLabel: { color: COLORS.textMuted, fontSize: 16, marginTop: 10 },
  modeRow: { flexDirection: 'row', gap: 15, marginBottom: 40 },
  modeBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: RADIUS.sm, backgroundColor: '#222' },
  activeMode: { backgroundColor: COLORS.secondary },
  modeText: { color: COLORS.textMuted, fontWeight: '700' },
  mainBtn: { width: width - 80, borderRadius: RADIUS.lg, overflow: 'hidden' },
  mainBtnGradient: { paddingVertical: 18, alignItems: 'center' },
  mainBtnText: { color: COLORS.black, fontSize: 18, fontWeight: '700' }
});

import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Animated,
  Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING, RADIUS, TAG_COLORS } from '../styles/theme';
import { Nota } from '../types';

interface NoteDetailModalProps {
  nota: Nota | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: (id: number) => void;
}

const { width, height } = Dimensions.get('window');

// Custom Icons
const CloseIcon = ({ size = 24, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const CalendarIcon = ({ size = 14, color = COLORS.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

const TrashIcon = ({ size = 16, color = "#EF4444" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const NoteIcon = ({ size = 20, color = COLORS.secondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export default function NoteDetailModal({ nota, visible, onClose, onDelete }: NoteDetailModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!nota) return null;

  const tagStyle = TAG_COLORS[nota.etiqueta as keyof typeof TAG_COLORS] || TAG_COLORS.nota;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(nota.id);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <Animated.View 
          style={[
            styles.sheet,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          {/* Header con gradiente */}
          <LinearGradient
            colors={[COLORS.secondary, '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <NoteIcon size={24} color={COLORS.white} />
              </View>
              <View style={styles.headerTextContainer}>
                <View style={[styles.tagBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.tagText}>{nota.etiqueta.toUpperCase()}</Text>
                </View>
                <Text style={styles.titleText} numberOfLines={2}>{nota.titulo}</Text>
              </View>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseIcon size={22} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Metadata */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <CalendarIcon size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{formatDate(nota.fecha_registro)}</Text>
            </View>
          </View>

          {/* Contenido */}
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.bodyText}>{nota.contenido}</Text>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
            
            {onDelete && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <TrashIcon size={16} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: SPACING.lg,
  },
  backdrop: { 
    ...StyleSheet.absoluteFillObject 
  },
  sheet: { 
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white, 
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 20,
  },
  headerGradient: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },
  titleText: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.white, 
    lineHeight: 24,
  },
  closeBtn: { 
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
  },
  metaText: { 
    fontSize: 13, 
    color: COLORS.textMuted, 
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  scrollArea: { 
    maxHeight: height * 0.35,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  bodyText: { 
    fontSize: 15, 
    lineHeight: 26, 
    color: COLORS.textMain, 
    fontWeight: '400',
  },
  footer: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1, 
    borderTopColor: COLORS.border, 
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#F8FAFC',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondary,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  deleteButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#EF4444',
  },
});

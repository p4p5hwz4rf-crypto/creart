import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { COLORS } from '../theme';

const VARIANTS = [
  { key: 'rain', label: '雨声', file: require('../../assets/sounds/rain.wav') },
  { key: 'forest', label: '森林', file: require('../../assets/sounds/white_noise.wav') },
  { key: 'ocean', label: '海浪', file: require('../../assets/sounds/white_noise.wav') },
];

export default function NatureSound({ active, onComplete, defaultDuration, color, variantIndex }) {
  const [internalVariant, setInternalVariant] = useState(variantIndex ?? 0);
  const variant = variantIndex !== undefined ? variantIndex : internalVariant;
  const [remaining, setRemaining] = useState(defaultDuration);
  const timerRef = useRef(null);
  const player = useAudioPlayer(VARIANTS[0].file);

  useEffect(() => {
    if (active) {
      player.replace(VARIANTS[variant].file);
      player.loop = true;
      player.volume = 0.6;
      player.play();

      setRemaining(defaultDuration);
      timerRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(timerRef.current);
            onComplete && onComplete(defaultDuration);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      player.pause();
    }
    return () => {
      clearInterval(timerRef.current);
      player.pause();
    };
  }, [active, variant]);

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.variants}>
        {VARIANTS.map((v, idx) => (
          <TouchableOpacity
            key={v.key}
            onPress={() => { if (!active) setVariant(idx); }}
            style={[styles.variantBtn, variant===idx && { backgroundColor: color, borderColor: color }]}
          >
            <Text style={[styles.variantText, variant===idx && { color: '#fff' }]}>{v.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.timer}>{formatTime(remaining)}</Text>
      <Text style={styles.hint}>沉浸在自然的声音中</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  variants: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  variantBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.divider, backgroundColor: COLORS.card,
  },
  variantText: { fontSize: 13, color: COLORS.textSecondary },
  timer: { fontSize: 36, fontWeight: '200', color: COLORS.textPrimary, letterSpacing: 2 },
  hint: { marginTop: 12, fontSize: 12, color: COLORS.textLight },
});

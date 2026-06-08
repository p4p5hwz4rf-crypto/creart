import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { COLORS } from '../theme';

const PRESETS = [5, 10, 30, 60];

export default function ASMRPlayer({ active, onComplete, defaultDuration, color }) {
  const [durationMin, setDurationMin] = useState(Math.floor(defaultDuration / 60));
  const [remaining, setRemaining] = useState(defaultDuration);
  const timerRef = useRef(null);
  const player = useAudioPlayer(require('../../assets/sounds/white_noise.wav'));

  useEffect(() => {
    if (active) {
      const total = durationMin * 60;
      player.loop = true;
      player.volume = 0.5;
      player.play();
      setRemaining(total);

      timerRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { clearInterval(timerRef.current); onComplete && onComplete(total); return 0; }
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
  }, [active, durationMin]);

  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <View style={styles.container}>
      {!active && (
        <View style={styles.presets}>
          <Text style={styles.label}>时长（分钟）</Text>
          <View style={styles.presetRow}>
            {PRESETS.map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setDurationMin(m)}
                style={[styles.presetBtn, durationMin===m && { backgroundColor: color, borderColor: color }]}
              >
                <Text style={[styles.presetText, durationMin===m && { color: '#fff' }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      <Text style={styles.timer}>{formatTime(remaining)}</Text>
      <Text style={styles.hint}>{active ? 'ASMR 播放中，祝你安眠' : '点击开启，陪伴你入睡'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
  presets: { alignItems: 'center', marginBottom: 20 },
  label: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 },
  presetRow: { flexDirection: 'row', gap: 12 },
  presetBtn: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.divider,
  },
  presetText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  timer: { fontSize: 40, fontWeight: '200', color: COLORS.textPrimary, letterSpacing: 2 },
  hint: { marginTop: 14, fontSize: 12, color: COLORS.textLight },
});

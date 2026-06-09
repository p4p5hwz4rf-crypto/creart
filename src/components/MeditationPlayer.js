import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';
import { COLORS } from '../theme';

const PRESETS = [5, 10, 15, 30];

// Load audio asset asynchronously to avoid Metro bundling 34MB file inline
const audioModule = require('../../assets/sounds/gymnopedie.wav');

export default function MeditationPlayer({ active, onComplete, defaultDuration, color, showTimer }) {
  const [durationMin, setDurationMin] = useState(Math.floor(defaultDuration / 60));
  const [remaining, setRemaining] = useState(defaultDuration);
  const [breathPhase, setBreathPhase] = useState('');
  const [audioUri, setAudioUri] = useState(null);
  const timerRef = useRef(null);
  const breathRef = useRef(null);
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null);

  useEffect(() => {
    const asset = Asset.fromModule(audioModule);
    asset.downloadAsync().then(() => {
      setAudioUri(asset.localUri || asset.uri);
    });
  }, []);

  useEffect(() => {
    if (active) {
      const total = durationMin * 60;
      player.loop = true;
      player.volume = 0.4;
      player.play();
      setRemaining(total);

      timerRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { clearInterval(timerRef.current); onComplete && onComplete(total); return 0; }
          return r - 1;
        });
      }, 1000);

      if (!showTimer) {
        let phase = 0;
        const cycle = () => {
          if (phase === 0) { setBreathPhase('吸气...'); phase = 1; breathRef.current = setTimeout(cycle, 4000); }
          else if (phase === 1) { setBreathPhase('保持...'); phase = 2; breathRef.current = setTimeout(cycle, 2000); }
          else { setBreathPhase('呼气...'); phase = 0; breathRef.current = setTimeout(cycle, 4000); }
        };
        cycle();
      }
    } else {
      clearInterval(timerRef.current);
      clearTimeout(breathRef.current);
      setBreathPhase('');
      player.pause();
    }
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(breathRef.current);
      setBreathPhase('');
      player.pause();
    };
  }, [active, durationMin, showTimer]);

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
      {breathPhase ? <Text style={[styles.breathText, { color }]}>{breathPhase}</Text> : null}
      <Text style={styles.hint}>{active ? (showTimer ? '保持专注，享受宁静' : '跟随呼吸，回归当下') : '设置时长，开始冥想'}</Text>
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
  breathText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
  hint: { marginTop: 10, fontSize: 12, color: COLORS.textLight },
});

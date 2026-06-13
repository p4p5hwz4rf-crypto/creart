import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';
import { COLORS } from '../theme';

const PRESETS = [5, 10, 30, 60];
const audioModule = require('../../assets/sounds/asmr.mp3');

export default function ASMRPlayer({ active, onComplete, duration, onDurationChange, color }) {
  const totalSeconds = duration || 600;
  const durationMin = Math.floor(totalSeconds / 60);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [localUri, setLocalUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  // Always init with direct require — never null (matches working components)
  const player = useAudioPlayer(audioModule);

  // Download to device cache in background for smooth looping
  useEffect(() => {
    let cancelled = false;
    async function prepare() {
      try {
        const asset = Asset.fromModule(audioModule);
        await asset.downloadAsync();
        // asset.localUri is the persistent device-cached file path
        if (!cancelled && asset.localUri) {
          setLocalUri(asset.localUri);
        }
      } catch (e) { /* keep using direct require */ }
      if (!cancelled) setLoading(false);
    }
    prepare();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (active) {
      const startTime = Date.now();
      // Use cached local file if ready, otherwise direct module
      const src = localUri ? { uri: localUri } : audioModule;
      try { player.replace(src); } catch (e) {}
      player.loop = true;
      player.volume = 0.5;
      try { player.play(); } catch (e) {}
      setRemaining(totalSeconds);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const r = totalSeconds - elapsed;
        if (r <= 0) {
          clearInterval(timerRef.current);
          setRemaining(0);
          try { player.pause(); } catch (e) {}
          onComplete && onComplete(totalSeconds);
        } else {
          setRemaining(r);
        }
      }, 250);
    } else {
      clearInterval(timerRef.current);
      try { player.pause(); } catch (e) {}
    }
    return () => {
      clearInterval(timerRef.current);
      try { player.pause(); } catch (e) {}
    };
  }, [active, totalSeconds, localUri]);

  return (
    <View style={styles.container}>
      {!active && (
        <View style={styles.presets}>
          <Text style={styles.label}>时长（分钟）</Text>
          <View style={styles.presetRow}>
            {PRESETS.map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => onDurationChange && onDurationChange(m * 60)}
                style={[styles.presetBtn, durationMin === m && { backgroundColor: color, borderColor: color }]}
              >
                <Text style={[styles.presetText, durationMin === m && { color: '#fff' }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      <Text style={styles.hint}>
        {loading ? '音频加载中...' : active ? 'ASMR 播放中，祝你安眠' : '点击开启，陪伴你入睡'}
      </Text>
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
  hint: { marginTop: 14, fontSize: 12, color: COLORS.textLight },
});

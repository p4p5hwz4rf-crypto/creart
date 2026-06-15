import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';
import { COLORS, FONT, RADIUS, SHADOWS } from '../theme';

const PRESETS = [5, 10, 30, 60];
const audioModule = require('../../assets/sounds/asmr.mp3');

export default function ASMRPlayer({ active, onComplete, duration, onDurationChange, color }) {
  const totalSeconds = duration || 600;
  const durationMin = Math.floor(totalSeconds / 60);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [localUri, setLocalUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const prevDurationRef = useRef(totalSeconds);
  const pausedRemainingRef = useRef(totalSeconds);
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
    const durationChanged = prevDurationRef.current !== totalSeconds;

    if (active) {
      prevDurationRef.current = totalSeconds;
      const startTime = Date.now();
      const startFrom = durationChanged ? totalSeconds : pausedRemainingRef.current;

      if (durationChanged) {
        try { player.stop(); } catch (e) {}
        const src = localUri ? { uri: localUri } : audioModule;
        try { player.replace(src); } catch (e) {}
      }
      player.loop = true;
      player.volume = 0.5;
      try { player.play(); } catch (e) {}
      setRemaining(startFrom);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const r = startFrom - elapsed;
        if (r <= 0) {
          clearInterval(timerRef.current);
          setRemaining(0);
          pausedRemainingRef.current = 0;
          try { player.pause(); } catch (e) {}
          onComplete && onComplete(totalSeconds);
        } else {
          setRemaining(r);
          pausedRemainingRef.current = r;
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
  presets: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.08)',
  },
  label: {
    fontSize: 12,
    fontFamily: FONT.semiBold,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  presetRow: { flexDirection: 'row', gap: 10 },
  presetBtn: {
    width: 50,
    height: 44,
    borderRadius: RADIUS.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.small,
  },
  presetText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONT.bold,
  },
  hint: {
    marginTop: 14,
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.textLight,
  },
});

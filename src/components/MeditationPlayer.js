import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { COLORS, FONT, RADIUS, SHADOWS } from '../theme';

const PRESETS = [5, 10, 15, 30];

// Default (meditation): Deuter - Dammerschein
const meditationModule = require('../../assets/sounds/gymnopedie.mp3');
// Focus / White noise: Martin Ermen - Gymnopedie Nr. 1
const focusModule = require('../../assets/sounds/gymnopedie_focus.mp3');

export default function MeditationPlayer({ active, onComplete, duration, onDurationChange, color, showTimer, audioSource }) {
  const audioModule = audioSource || meditationModule;
  const cacheName = audioSource === focusModule ? 'gymnopedie_focus.mp3' : 'gymnopedie.mp3';
  const totalSeconds = duration || 300;
  const durationMin = Math.floor(totalSeconds / 60);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [localUri, setLocalUri] = useState(null);
  const timerRef = useRef(null);
  const prevDurationRef = useRef(totalSeconds);
  const pausedRemainingRef = useRef(totalSeconds);
  const player = useAudioPlayer(localUri ? { uri: localUri } : audioModule);

  // Cache audio locally for smooth looping
  useEffect(() => {
    let cancelled = false;
    const cacheUri = FileSystem.cacheDirectory + cacheName;
    async function prepare() {
      try {
        const info = await FileSystem.getInfoAsync(cacheUri);
        if (info.exists) { if (!cancelled) setLocalUri(cacheUri); return; }
      } catch (e) { /* download */ }
      try {
        const asset = Asset.fromModule(audioModule);
        await asset.downloadAsync();
        const src = asset.localUri || asset.uri;
        await FileSystem.copyAsync({ from: src, to: cacheUri });
        if (!cancelled) setLocalUri(cacheUri);
      } catch (e) { /* keep using direct require */ }
    }
    prepare();
    return () => { cancelled = true; };
  }, [cacheName]);

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
      player.volume = 0.4;
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
        {active ? (showTimer ? '保持专注，享受宁静' : '跟随呼吸，回归当下') : '设置时长，开始冥想'}
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
    marginTop: 10,
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.textLight,
  },
});

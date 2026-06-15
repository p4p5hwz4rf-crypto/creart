import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { COLORS, FONT, RADIUS, SHADOWS } from '../theme';

const PRESETS = [3, 5, 10, 30];

const VARIANTS = [
  { key: 'rain', label: '雨声', file: require('../../assets/sounds/rain.mp3') },
  { key: 'forest', label: '森林', file: require('../../assets/sounds/forest.mp3') },
  { key: 'ocean', label: '海浪', file: require('../../assets/sounds/ocean.mp3') },
];

export default function NatureSound({ active, onComplete, duration, onDurationChange, color, subMode }) {
  const totalSeconds = duration || 180;
  const durationMin = Math.floor(totalSeconds / 60);
  const [internalSubMode, setInternalSubMode] = useState(subMode || 'rain');
  const currentSubMode = subMode !== undefined ? subMode : internalSubMode;
  const activeVariant = VARIANTS.find(v => v.key === currentSubMode) || VARIANTS[0];
  const [remaining, setRemaining] = useState(totalSeconds);
  const [cacheMap, setCacheMap] = useState({});
  const timerRef = useRef(null);
  const prevDurationRef = useRef(totalSeconds);
  const pausedRemainingRef = useRef(totalSeconds);
  const prevSubModeRef = useRef(currentSubMode);
  const player = useAudioPlayer(VARIANTS[0].file);

  // Cache audio files locally for smooth looping
  useEffect(() => {
    let cancelled = false;
    async function cacheAll() {
      const map = {};
      for (const v of VARIANTS) {
        const cacheUri = FileSystem.cacheDirectory + v.key + '.mp3';
        try {
          const info = await FileSystem.getInfoAsync(cacheUri);
          if (info.exists) {
            map[v.key] = cacheUri;
            continue;
          }
        } catch (e) { /* download */ }
        try {
          const asset = Asset.fromModule(v.file);
          await asset.downloadAsync();
          const src = asset.localUri || asset.uri;
          await FileSystem.copyAsync({ from: src, to: cacheUri });
          map[v.key] = cacheUri;
        } catch (e) { /* keep using direct require */ }
      }
      if (!cancelled) setCacheMap(map);
    }
    cacheAll();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const subModeChanged = prevSubModeRef.current !== currentSubMode;
    const durationChanged = prevDurationRef.current !== totalSeconds || subModeChanged;

    if (active) {
      prevDurationRef.current = totalSeconds;
      prevSubModeRef.current = currentSubMode;
      const startTime = Date.now();
      const startFrom = durationChanged ? totalSeconds : pausedRemainingRef.current;
      // Use cached local file if available, otherwise fall back to direct module
      if (durationChanged) {
        try { player.stop(); } catch (e) {}
        const source = cacheMap[currentSubMode];
        if (source) {
          try { player.replace({ uri: source }); } catch (e) {}
        } else {
          try { player.replace(activeVariant.file); } catch (e) {}
        }
      }
      player.loop = true;
      player.volume = 0.6;
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
  }, [active, currentSubMode, totalSeconds, cacheMap]);

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
      <Text style={styles.hint}>{active ? '沉浸在自然的声音中' : '选择声音，点击开始'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
  hint: {
    marginTop: 14,
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.textLight,
  },
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
});

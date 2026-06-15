import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { COLORS, FONT, SHADOWS, RADIUS } from '../theme';

const bowlModule = require('../../assets/sounds/bowl.mp3');

const PRESETS = [1, 3, 5, 10];

export default function BowlSound({ active, onComplete, duration, onDurationChange, color }) {
  const totalSeconds = duration || 60;
  const durationMin = Math.floor(totalSeconds / 60);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [localUri, setLocalUri] = useState(null);
  const timerRef = useRef(null);
  const rippleIntervalRef = useRef(null);
  const prevDurationRef = useRef(totalSeconds);
  const pausedRemainingRef = useRef(totalSeconds);
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;
  const player = useAudioPlayer(localUri ? { uri: localUri } : bowlModule);

  // Cache audio locally for smooth looping
  useEffect(() => {
    let cancelled = false;
    const cacheUri = FileSystem.cacheDirectory + 'bowl.mp3';
    async function prepare() {
      try {
        const info = await FileSystem.getInfoAsync(cacheUri);
        if (info.exists) { if (!cancelled) setLocalUri(cacheUri); return; }
      } catch (e) { /* download */ }
      try {
        const asset = Asset.fromModule(bowlModule);
        await asset.downloadAsync();
        const src = asset.localUri || asset.uri;
        await FileSystem.copyAsync({ from: src, to: cacheUri });
        if (!cancelled) setLocalUri(cacheUri);
      } catch (e) { /* keep using direct require */ }
    }
    prepare();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const durationChanged = prevDurationRef.current !== totalSeconds;

    if (active) {
      prevDurationRef.current = totalSeconds;
      const startFrom = durationChanged ? totalSeconds : pausedRemainingRef.current;
      if (durationChanged) {
        try { player.stop(); } catch (e) {}
        const src = localUri ? { uri: localUri } : bowlModule;
        try { player.replace(src); } catch (e) {}
      }
      player.loop = true;
      player.volume = 0.7;
      try { player.play(); } catch (e) {}
      startRipple();

      rippleIntervalRef.current = setInterval(() => {
        stopRipple();
        startRipple();
      }, 8000);

      setRemaining(startFrom);
      timerRef.current = setInterval(() => {
        setRemaining(r => {
          const next = r - 1;
          pausedRemainingRef.current = Math.max(0, next);
          if (next <= 0) { clearInterval(timerRef.current); onComplete && onComplete(totalSeconds); return 0; }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      clearInterval(rippleIntervalRef.current);
      stopRipple();
      try { player.pause(); } catch (e) {}
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(rippleIntervalRef.current);
      stopRipple();
      try { player.pause(); } catch (e) {}
    };
  }, [active, localUri, totalSeconds]);

  const startRipple = () => {
    const create = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    };
    create(ripple1, 0);
    create(ripple2, 1200);
    create(ripple3, 2400);
  };

  const stopRipple = () => {
    [ripple1, ripple2, ripple3].forEach(a => a.setValue(0));
  };

  const rippleStyle = (anim) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }],
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
  });

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
      <View style={styles.bowlArea}>
        <Animated.View style={[styles.ripple, rippleStyle(ripple1), { borderColor: color }]} />
        <Animated.View style={[styles.ripple, rippleStyle(ripple2), { borderColor: color }]} />
        <Animated.View style={[styles.ripple, rippleStyle(ripple3), { borderColor: color }]} />
        <View style={[styles.bowl, { backgroundColor: color }]}>
          <Text style={styles.bowlText}>钵</Text>
        </View>
      </View>
      <Text style={styles.hint}>{active ? '清空中' : '让音钵的余韵清空思绪'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
  bowlArea: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  ripple: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 1.5 },
  bowl: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    ...SHADOWS.small,
  },
  bowlText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: FONT.bold,
  },
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

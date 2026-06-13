import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { COLORS } from '../theme';

const bowlModule = require('../../assets/sounds/bowl.mp3');

export default function BowlSound({ active, onComplete, defaultDuration, color }) {
  const [remaining, setRemaining] = useState(defaultDuration);
  const [localUri, setLocalUri] = useState(null);
  const timerRef = useRef(null);
  const rippleIntervalRef = useRef(null);
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
    if (active) {
      // Use cached URI if available
      if (localUri) {
        try { player.replace({ uri: localUri }); } catch (e) {}
      }
      player.loop = true;
      player.volume = 0.7;
      try { player.play(); } catch (e) {}
      startRipple();

      rippleIntervalRef.current = setInterval(() => {
        stopRipple();
        startRipple();
      }, 8000);

      setRemaining(defaultDuration);
      timerRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { clearInterval(timerRef.current); onComplete && onComplete(defaultDuration); return 0; }
          return r - 1;
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
  }, [active, localUri]);

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
  container: { alignItems: 'center' },
  bowlArea: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  ripple: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 1.5 },
  bowl: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  bowlText: { color: '#fff', fontSize: 20, fontWeight: '600', letterSpacing: 2 },
  hint: { marginTop: 12, fontSize: 12, color: COLORS.textLight, letterSpacing: 0.5 },
});

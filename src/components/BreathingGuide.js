import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../theme';

const TOTAL_SECONDS = 60;
const bellModule = require('../../assets/sounds/bell.wav');

export default function BreathingGuide({ active, onComplete, pattern, color }) {
  const [phase, setPhase] = useState('ready');
  const [phaseCountdown, setPhaseCountdown] = useState(0);
  const [bellReady, setBellReady] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const phaseTimerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const player = useAudioPlayer(bellModule);

  // Preload & cache bell locally for instant phase-change chimes
  useEffect(() => {
    let cancelled = false;
    async function prepare() {
      // Download to device cache
      try {
        const asset = Asset.fromModule(bellModule);
        await asset.downloadAsync();
        if (!cancelled && asset.localUri) {
          try { player.replace({ uri: asset.localUri }); } catch (e) {}
        }
      } catch (e) { /* keep using direct require */ }
      // Warm up: play briefly at zero volume to force native buffer load
      player.loop = false;
      player.volume = 0;
      try { player.play(); } catch (e) {}
      // Let it play for a tiny moment then pause — buffer is now hot
      setTimeout(() => {
        try { player.pause(); } catch (e) {}
        player.volume = 0.7;
        if (!cancelled) setBellReady(true);
      }, 50);
    }
    prepare();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (active) {
      startSession();
    } else {
      stopSession();
    }
    return () => stopSession();
  }, [active]);

  const playBell = () => {
    if (!bellReady) return;
    try {
      // Seek to start for instant attack
      player.currentTime = 0;
      player.play();
    } catch (e) {}
  };

  // Use Date.now() reference for precise phase timing (no interval drift)
  const runPhase = (name, durationSec, nextPhase, animTo) => {
    setPhase(name);
    setPhaseCountdown(durationSec);
    if (animTo) {
      Animated.timing(scaleAnim, {
        toValue: animTo,
        duration: durationSec * 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playBell();

    const phaseStart = Date.now();
    clearInterval(phaseTimerRef.current);
    phaseTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - phaseStart) / 1000);
      const remaining = durationSec - elapsed;
      if (remaining <= 0) {
        clearInterval(phaseTimerRef.current);
        setPhaseCountdown(0);
        nextPhase();
      } else {
        setPhaseCountdown(remaining);
      }
    }, 100); // faster tick for tighter sync with bell
  };

  const startSession = () => {
    const sessionStart = Date.now();

    const checkSessionEnd = () => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      if (elapsed >= TOTAL_SECONDS) {
        stopSession();
        onComplete && onComplete(TOTAL_SECONDS);
        return true;
      }
      return false;
    };

    const doCycle = () => {
      if (checkSessionEnd()) return;

      runPhase('inhale', pattern.inhale, () => {
        if (checkSessionEnd()) return;
        if (pattern.hold > 0) {
          runPhase('hold', pattern.hold, () => {
            if (checkSessionEnd()) return;
            runPhase('exhale', pattern.exhale, doCycle, 1);
          });
        } else {
          runPhase('exhale', pattern.exhale, doCycle, 1);
        }
      }, 1.45);
    };

    // Store session timer for cleanup
    sessionTimerRef.current = setInterval(() => {
      if (checkSessionEnd()) {
        clearInterval(sessionTimerRef.current);
      }
    }, 250);

    doCycle();
  };

  const stopSession = () => {
    clearInterval(phaseTimerRef.current);
    clearInterval(sessionTimerRef.current);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
    setPhase('ready');
    setPhaseCountdown(0);
  };

  const phaseText = { ready: '准备', inhale: '吸气', hold: '屏息', exhale: '呼气' };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }], borderColor: color }]}>
        <Text style={[styles.phaseText, { color }]}>{phaseText[phase]}</Text>
        {active && phaseCountdown > 0 && <Text style={styles.countdown}>{phaseCountdown}</Text>}
      </Animated.View>
      <Text style={styles.hint}>{active ? '呼吸中' : '跟随圆圈节奏，慢慢呼吸'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  circle: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  phaseText: { fontSize: 16, fontWeight: '500', letterSpacing: 2 },
  countdown: { fontSize: 32, fontWeight: '200', color: COLORS.textPrimary, marginTop: 6, letterSpacing: 2 },
  hint: { marginTop: 20, fontSize: 12, color: COLORS.textLight, letterSpacing: 1 },
});

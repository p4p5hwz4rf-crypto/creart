import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../theme';

export default function BreathingGuide({ active, onComplete, pattern, color }) {
  const [phase, setPhase] = useState('ready');
  const [countdown, setCountdown] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const player = useAudioPlayer(require('../../assets/sounds/bell.wav'));

  useEffect(() => {
    if (active) {
      startSession();
    } else {
      stopSession();
    }
    return () => stopSession();
  }, [active]);

  const playBell = () => {
    try {
      player.volume = 0.7;
      player.play();
    } catch (e) { /* ignore */ }
  };

  const runPhase = (name, duration, nextPhase, animTo) => {
    setPhase(name);
    setCountdown(duration);
    if (animTo) {
      Animated.timing(scaleAnim, {
        toValue: animTo,
        duration: duration * 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playBell();

    let remaining = duration;
    phaseTimerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(phaseTimerRef.current);
        nextPhase();
      }
    }, 1000);
  };

  const startSession = () => {
    let cycles = 0;
    const maxCycles = 5;

    const doCycle = () => {
      if (!active) return;
      cycles++;
      if (cycles > maxCycles) {
        onComplete && onComplete(60);
        return;
      }
      runPhase('inhale', pattern.inhale, () => {
        if (pattern.hold > 0) {
          runPhase('hold', pattern.hold, () => {
            runPhase('exhale', pattern.exhale, doCycle, 1);
          });
        } else {
          runPhase('exhale', pattern.exhale, doCycle, 1);
        }
      }, 1.45);
    };
    doCycle();
  };

  const stopSession = () => {
    clearInterval(timerRef.current);
    clearInterval(phaseTimerRef.current);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
    setPhase('ready');
    setCountdown(0);
  };

  const phaseText = { ready: '准备', inhale: '吸气', hold: '屏息', exhale: '呼气' };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }], borderColor: color }]}>
        <Text style={[styles.phaseText, { color }]}>{phaseText[phase]}</Text>
        {countdown > 0 && <Text style={styles.countdown}>{countdown}</Text>}
      </Animated.View>
      <Text style={styles.hint}>跟随圆圈节奏，慢慢呼吸</Text>
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

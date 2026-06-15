import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, SHADOWS, RADIUS, FONT, MODE_GRADIENTS, SCREEN_GRADIENT } from '../theme';
import { MODE_CONFIG, MODES } from '../constants';
import BreathingGuide from './BreathingGuide';
import NatureSound from './NatureSound';
import BowlSound from './BowlSound';
import ASMRPlayer from './ASMRPlayer';
import MeditationPlayer from './MeditationPlayer';
import { getTodayStats, addUsageTime } from '../storage';

const focusAudio = require('../../assets/sounds/gymnopedie_focus.mp3');

const MODE_LIST = [
  MODES.DEEP_BREATHING,
  MODES.NATURE_SOUND,
  MODES.SINGING_BOWL,
  MODES.ASMR,
  MODES.MEDITATION,
  MODES.WHITE_NOISE,
];

const formatClock = (seconds) => {
  const safeSeconds = Math.max(0, seconds || 0);
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`;
};

export default function TherapyScreen() {
  const [selectedMode, setSelectedMode] = useState(MODES.MEDITATION);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [todayStats, setTodayStats] = useState({});
  const [natureSubMode, setNatureSubMode] = useState('rain');
  const [buttonCountdown, setButtonCountdown] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const countdownRef = useRef(null);
  const completedRef = useRef(false);
  const pausedRemainingRef = useRef(0);
  const prevTotalRef = useRef(0);
  const loggedElapsedRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      getTodayStats().then(setTodayStats);
    }, [])
  );

  const config = MODE_CONFIG[selectedMode];
  const activeGradient = MODE_GRADIENTS[selectedMode] || MODE_GRADIENTS.meditation;

  useEffect(() => {
    setSelectedDuration(config.defaultDuration);
  }, [selectedMode, config.defaultDuration]);

  useEffect(() => {
    setIsPaused(false);
    pausedRemainingRef.current = 0;
  }, [selectedDuration]);

  useEffect(() => {
    const total = selectedDuration || config.defaultDuration;
    const durationChanged = prevTotalRef.current !== total;

    if (isActive) {
      prevTotalRef.current = total;
      const startFrom = durationChanged ? total : (pausedRemainingRef.current || total);
      const startTime = Date.now();
      setButtonCountdown(startFrom);
      pausedRemainingRef.current = startFrom;
      countdownRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = startFrom - elapsed;
        if (remaining <= 0) {
          clearInterval(countdownRef.current);
          setButtonCountdown(0);
          pausedRemainingRef.current = 0;
          setIsActive(false);
          handleComplete(total);
        } else {
          setButtonCountdown(remaining);
          pausedRemainingRef.current = remaining;
        }
      }, 1000);
    } else {
      clearInterval(countdownRef.current);
    }
    return () => clearInterval(countdownRef.current);
  }, [isActive, selectedDuration, config.defaultDuration]);

  const handleToggle = () => {
    if (isActive) {
      // Playing → Paused
      const total = selectedDuration || config.defaultDuration;
      const remaining = pausedRemainingRef.current;
      const elapsed = total - remaining - loggedElapsedRef.current;
      if (elapsed > 0) {
        loggedElapsedRef.current += elapsed;
        setTodayStats(prev => {
          const next = { ...prev };
          next[selectedMode] = (next[selectedMode] || 0) + elapsed;
          return next;
        });
        addUsageTime(selectedMode, elapsed);
      }
      setIsActive(false);
      setIsPaused(true);
    } else if (isPaused) {
      // Paused → Playing (resume)
      setIsPaused(false);
      setIsActive(true);
    } else {
      // Idle → Playing (start)
      const total = selectedDuration || config.defaultDuration;
      pausedRemainingRef.current = total;
      completedRef.current = false;
      loggedElapsedRef.current = 0;
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const handleModeChange = (modeKey) => {
    if (modeKey === selectedMode) return;
    if (isActive) {
      const total = selectedDuration || config.defaultDuration;
      const elapsed = total - pausedRemainingRef.current - loggedElapsedRef.current;
      if (elapsed > 0) {
        (async () => {
          await addUsageTime(selectedMode, elapsed);
        })();
      }
    }
    loggedElapsedRef.current = 0;
    pausedRemainingRef.current = 0;
    setIsActive(false);
    setIsPaused(false);
    setSelectedMode(modeKey);
  };

  const handleComplete = (seconds) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsActive(false);
    setIsPaused(false);
    const full = seconds || selectedDuration || config.defaultDuration;
    const net = Math.max(0, full - loggedElapsedRef.current);
    loggedElapsedRef.current = 0;
    if (net > 0) {
      setTodayStats(prev => {
        const next = { ...prev };
        next[selectedMode] = (next[selectedMode] || 0) + net;
        return next;
      });
      addUsageTime(selectedMode, net);
    }
  };

  const renderPlayer = () => {
    const commonProps = {
      active: isActive,
      onComplete: handleComplete,
      color: config.color,
    };
    switch (selectedMode) {
      case MODES.DEEP_BREATHING:
        return <BreathingGuide {...commonProps} pattern={config.breathePattern} />;
      case MODES.NATURE_SOUND:
        return (
          <NatureSound
            {...commonProps}
            duration={selectedDuration}
            onDurationChange={setSelectedDuration}
            subMode={natureSubMode}
          />
        );
      case MODES.SINGING_BOWL:
        return <BowlSound {...commonProps} duration={selectedDuration} onDurationChange={setSelectedDuration} />;
      case MODES.ASMR:
        return <ASMRPlayer {...commonProps} duration={selectedDuration} onDurationChange={setSelectedDuration} allowLoop />;
      case MODES.MEDITATION:
        return <MeditationPlayer {...commonProps} duration={selectedDuration} onDurationChange={setSelectedDuration} />;
      case MODES.WHITE_NOISE:
        return <MeditationPlayer {...commonProps} duration={selectedDuration} onDurationChange={setSelectedDuration} showTimer audioSource={focusAudio} />;
      default:
        return null;
    }
  };

  const todayTotal = Object.values(todayStats).reduce((a, b) => a + b, 0);
  const totalDuration = selectedDuration || config.defaultDuration;
  const liveElapsed = isActive
    ? Math.max(0, totalDuration - pausedRemainingRef.current - loggedElapsedRef.current)
    : 0;
  const liveTodaySeconds = todayTotal + liveElapsed;

  return (
    <LinearGradient
      colors={SCREEN_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <BlurView intensity={34} tint="light" style={styles.header}>
            <View style={styles.headerInner}>
              <View style={styles.logoRow}>
                <MaterialIcons name="spa" size={20} color={COLORS.primary} />
                <Text style={styles.logoText}>心灵疗愈室——让情绪流动</Text>
              </View>
              <View style={styles.todayPill}>
                <Text style={styles.todayPillValue}>{formatClock(liveTodaySeconds)}</Text>
                <Text style={styles.todayPillLabel}>今日</Text>
              </View>
            </View>
          </BlurView>

          <View style={styles.hero}>
            <View style={[styles.heroIcon, { backgroundColor: activeGradient[0] }]}>
              <MaterialIcons name={config.icon} size={24} color="#fff" />
            </View>
            <View style={styles.heroTextBlock}>
              <Text style={styles.greeting}>重拾宁静</Text>
              <Text style={styles.subGreeting}>选择一个声音，让身心慢慢落地。</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modeList}
          >
            {MODE_LIST.map((modeKey) => {
              const modeConfig = MODE_CONFIG[modeKey];
              const active = selectedMode === modeKey;
              return (
                <TouchableOpacity
                  key={modeKey}
                  activeOpacity={0.86}
                  onPress={() => handleModeChange(modeKey)}
                  style={[styles.modeCardWrap, active && styles.modeCardWrapActive]}
                >
                  <View style={[styles.modeArt, { backgroundColor: (MODE_GRADIENTS[modeKey] || activeGradient)[1] }]}>
                    <MaterialIcons name={modeConfig.icon} size={30} color="#fff" />
                  </View>
                  <Text style={[styles.modeLabel, active && { color: modeConfig.color }]}>
                    {modeConfig.title}
                  </Text>
                  <Text style={styles.modeSubLabel}>{modeConfig.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity activeOpacity={0.86} style={styles.modeCardWrap}>
              <View style={[styles.modeArt, styles.moreArt]}>
                <MaterialIcons name="add" size={30} color={COLORS.primary} />
              </View>
              <Text style={styles.modeLabel}>探索更多</Text>
              <Text style={styles.modeSubLabel}>即将到来</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.timerSection}>
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={handleToggle}
              style={[
                styles.timerButton,
                (isActive || isPaused) && { borderColor: `${config.color}55` },
              ]}
            >
              <LinearGradient
                colors={isActive || isPaused ? activeGradient : ['#ffffff', COLORS.surfaceContainerLow]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.timerButtonInner}
              >
                <MaterialIcons
                  name={isActive ? 'pause' : 'play-arrow'}
                  size={48}
                  color={isActive || isPaused ? '#fff' : config.color}
                />
                <Text style={[styles.timerButtonText, (isActive || isPaused) && styles.timerButtonTextActive]}>
                  {isActive ? '暂停' : isPaused ? '继续' : '开始'}
                </Text>
                {(isActive || isPaused) && buttonCountdown > 0 && (
                  <Text style={styles.timerCountdown}>{formatClock(buttonCountdown)}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.timerCaption}>
              {isActive
                ? selectedMode === MODES.NATURE_SOUND
                  ? '此刻你在大自然中，放下烦恼呼吸'
                  : selectedMode === MODES.SINGING_BOWL
                    ? '闭上眼睛，让大脑呼吸'
                    : '保持这个节奏，慢慢来。'
                : isPaused
                  ? '已暂停，点击继续'
                  : '准备好后，轻触开始。'}
            </Text>
          </View>

          {selectedMode === MODES.NATURE_SOUND && config.subModes && (
            <View style={styles.soundRow}>
              {config.subModes.map((sm) => {
                const active = natureSubMode === sm.key;
                return (
                  <TouchableOpacity
                    key={sm.key}
                    activeOpacity={0.8}
                    onPress={() => { setNatureSubMode(sm.key); }}
                    style={[styles.soundWrap, active && styles.soundWrapActive]}
                  >
                    <MaterialIcons
                      name={sm.icon}
                      size={20}
                      color={active ? COLORS.onPrimary : COLORS.onSurfaceVariant}
                    />
                    <Text style={[styles.soundLabel, active && styles.soundLabelActive]}>{sm.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.playerContainer}>
            {renderPlayer()}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 120,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    height: 64,
    justifyContent: 'flex-end',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79,122,100,0.06)',
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.containerMargin,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logoText: {
    fontSize: 18,
    fontFamily: FONT.semiBold,
    color: COLORS.primary,
  },
  todayPill: {
    minWidth: 74,
    minHeight: 36,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  todayPillValue: {
    fontSize: 13,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    lineHeight: 16,
  },
  todayPillLabel: {
    fontSize: 10,
    fontFamily: FONT.medium,
    color: COLORS.textLight,
    lineHeight: 13,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.containerMargin,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  heroTextBlock: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontFamily: FONT.bold,
    color: COLORS.onSurface,
    lineHeight: 30,
  },
  subGreeting: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 21,
  },
  modeList: {
    paddingLeft: SPACING.containerMargin,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    paddingRight: SPACING.containerMargin,
    gap: 12,
  },
  modeCardWrap: {
    width: 112,
    minHeight: 142,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.07)',
    padding: 10,
    alignItems: 'center',
  },
  modeCardWrapActive: {
    backgroundColor: '#fff',
    borderColor: 'rgba(79,122,100,0.2)',
    ...SHADOWS.small,
  },
  modeArt: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  moreArt: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  modeLabel: {
    fontSize: 14,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  modeSubLabel: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 3,
  },
  timerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  timerButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.ambient,
  },
  timerButtonInner: {
    width: 136,
    height: 136,
    borderRadius: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerButtonText: {
    fontSize: 13,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginTop: 4,
  },
  timerButtonTextActive: {
    color: '#fff',
  },
  timerCountdown: {
    fontSize: 26,
    fontFamily: FONT.bold,
    color: '#fff',
    marginTop: 4,
  },
  timerCaption: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.sm,
  },
  soundRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  soundWrap: {
    minWidth: 86,
    minHeight: 44,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  soundWrapActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  soundLabel: {
    fontSize: 12,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurfaceVariant,
  },
  soundLabelActive: {
    color: COLORS.onPrimary,
  },
  playerContainer: {
    minHeight: 80,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SPACING.containerMargin,
  },
});

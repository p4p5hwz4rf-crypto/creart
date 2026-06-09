import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, SHADOWS, RADIUS, FONT } from '../theme';
import { MODE_CONFIG, MODES } from '../constants';
import BreathingGuide from './BreathingGuide';
import NatureSound from './NatureSound';
import BowlSound from './BowlSound';
import ASMRPlayer from './ASMRPlayer';
import MeditationPlayer from './MeditationPlayer';
import { getTodayStats, addUsageTime, getMonthStats } from '../storage';

const MODE_LIST = [
  MODES.MEDITATION, MODES.NATURE, MODES.WHITE_NOISE,
  MODES.BREATHING, MODES.BOWL, MODES.ASMR,
];

const MODE_IMAGES = {
  [MODES.MEDITATION]: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzoi6RZKWOlUNloKRliuyhAZSXdlaHWrtUGf6cSEugcgsAqYxPoJ6kFpdhLeejiDAZiV1L2V4OZ1SYjsawvV00PwoTJXq6i3U_t8QMYFojNfI5CaYeJdocsxyjNsj4roH7_NKdZ-i2YeMnPkxyPiGo83bgP_1G0UV_i03dbZoP2yI_YJ_iLeaqEEd_L5EGz0g0rziUCfKmSawB1IOVDNSDM5rsR9wxYHV5lnk_8HwINxxGj76uDuwwvR0CLNStHs1OsXwD4EBVaA',
  [MODES.NATURE]: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuOxODjOp5SP62iCcxdJRdA6QyXLFutgRs7DZOjPVbF7l3g4jVrMGUQ1pFs8mt6TLOmv9AqwiqLD-4lLtwJh5g2OMW7PyCj-i-2vNTn5Xw9d6zUfR2WJiMIc5Hy4nRSbKmbx4qHy_WCxW1yElZOBIA3KJ8ARgr-4h_kM1P2sduGfxnNIAHHcakO37EuylKbb8kApynZXBGgbMN9Wrg2nOnI00Nz-ocPvnePAH_eBykJ8VE9SUO_RVekMD16cfk-nIsFzEegd-zRQ',
  [MODES.WHITE_NOISE]: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYNgU4Ch8PVlKsi9u1FD9Zbuc8inviBI60FOBm5UF9uUFTTdARa6PqG2XO1H0bubydStq27Xiiu7Us15Grpzb03ETgzoYsJd4lP6BjZ6sAYPvpzc8YmNKtoGnqjA-iStjc3AC_jkvf0lw0R02xCGoNr1JZxpi9p5OjtkRD0CajRtCixsa0lolVxbT_fT2GXQxNnMgivGi03w_KU1FjNUZZh_wqjsrp0PeS97odAE1yNcfTeVwBBF-LdHKCwCUrZIyxqTYjHYhTTg',
};

const MODE_LABELS = {
  [MODES.MEDITATION]: '内在平静',
  [MODES.NATURE]: '森林小径',
  [MODES.WHITE_NOISE]: '深海',
  [MODES.BREATHING]: '呼吸',
  [MODES.BOWL]: '颂钵',
  [MODES.ASMR]: 'ASMR',
};

const NATURE_VARIANTS = [
  { key: 'forest', label: '森林', icon: 'park' },
  { key: 'rain', label: '雨声', icon: 'water-drop' },
  { key: 'waves', label: '海浪', icon: 'waves' },
];

export default function TherapyScreen() {
  const [selectedMode, setSelectedMode] = useState(MODES.MEDITATION);
  const [isActive, setIsActive] = useState(false);
  const [todayStats, setTodayStats] = useState({});
  const [monthStats, setMonthStats] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [natureVariant, setNatureVariant] = useState(1); // default rain

  useFocusEffect(
    useCallback(() => {
      getTodayStats().then(setTodayStats);
      getMonthStats(currentMonth).then(setMonthStats);
    }, [isActive, currentMonth])
  );

  const config = MODE_CONFIG[selectedMode];

  const handleToggle = () => {
    setIsActive(prev => !prev);
  };

  const handleComplete = (seconds) => {
    setIsActive(false);
    addUsageTime(selectedMode, seconds || config.defaultDuration);
    getTodayStats().then(setTodayStats);
  };

  const renderPlayer = () => {
    const commonProps = {
      active: isActive,
      onComplete: handleComplete,
      color: config.color,
    };
    switch (selectedMode) {
      case MODES.BREATHING:
        return <BreathingGuide {...commonProps} pattern={config.breathePattern} />;
      case MODES.NATURE:
        return (
          <NatureSound
            {...commonProps}
            defaultDuration={config.defaultDuration}
            variantIndex={natureVariant}
          />
        );
      case MODES.BOWL:
        return <BowlSound {...commonProps} defaultDuration={config.defaultDuration} />;
      case MODES.ASMR:
        return <ASMRPlayer {...commonProps} defaultDuration={config.defaultDuration} allowLoop />;
      case MODES.MEDITATION:
        return <MeditationPlayer {...commonProps} defaultDuration={config.defaultDuration} />;
      case MODES.WHITE_NOISE:
        return <MeditationPlayer {...commonProps} defaultDuration={config.defaultDuration} showTimer />;
      default:
        return null;
    }
  };

  const todayTotal = Object.values(todayStats).reduce((a, b) => a + b, 0);
  const todayMinutes = Math.floor(todayTotal / 60);

  // 日历数据
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const getDayRecord = (day) => {
    return monthStats[day];
  };

  return (
    <LinearGradient
      colors={['#f4fbf8', '#eef5f2', '#cbead6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 顶部 Blur Header */}
          <BlurView intensity={30} tint="light" style={styles.header}>
            <View style={styles.headerInner}>
              <View style={styles.logoRow}>
                <MaterialIcons name="spa" size={20} color={COLORS.primary} />
                <Text style={styles.logoText}>数字静修所</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <MaterialIcons name="notifications-none" size={22} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* 标题区 */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.greeting}>重拾宁静</Text>
              <Text style={styles.subGreeting}>拥抱当下的静谧</Text>
            </View>
            <View style={styles.todayBadge}>
              <Text style={styles.todayMinutes}>{todayMinutes}</Text>
              <Text style={styles.todayLabel}>今日分钟</Text>
            </View>
          </View>

          {/* 模式卡片滑块 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modeList}
          >
            {MODE_LIST.map((modeKey) => {
              const active = selectedMode === modeKey;
              const imageUri = MODE_IMAGES[modeKey];
              return (
                <TouchableOpacity
                  key={modeKey}
                  activeOpacity={0.85}
                  onPress={() => { if (!isActive) setSelectedMode(modeKey); }}
                  style={styles.modeCardWrap}
                >
                  <View style={[styles.modeImageWrap, active && styles.modeImageWrapActive]}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={styles.modeImage} />
                    ) : (
                      <View style={[styles.modeImageFallback, { backgroundColor: config.color }]}>
                        <Text style={styles.modeImageFallbackText}>{MODE_LABELS[modeKey]?.[0]}</Text>
                      </View>
                    )}
                    {active && <View style={styles.modeImageOverlay} />}
                  </View>
                  <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                    {MODE_LABELS[modeKey]}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {/* Explore More 卡片 */}
            <TouchableOpacity activeOpacity={0.85} style={styles.modeCardWrap}>
              <View style={styles.modeImageWrap}>
                <View style={[styles.modeImageFallback, { backgroundColor: COLORS.surfaceContainerHigh }]}>
                  <MaterialIcons name="add-circle" size={32} color={COLORS.primary} style={{ opacity: 0.4 }} />
                </View>
              </View>
              <Text style={styles.modeLabel}>探索更多</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* 计时器区域 */}
          <View style={styles.timerSection}>
            <View style={styles.timerGlow} />
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={handleToggle}
              style={styles.timerButton}
            >
              <MaterialIcons
                name={isActive ? 'pause' : 'play-arrow'}
                size={48}
                color={COLORS.primary}
              />
              <Text style={styles.timerButtonText}>
                {isActive ? '休息中' : '开始'}
              </Text>
              {/* 倒计时 */}
              {isActive && (
                <Text style={styles.timerCountdown}>
                  {Math.floor(config.defaultDuration / 60)}:00
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.timerCaption}>10分钟正念冥想</Text>
          </View>

          {/* 声音切换（仅 Nature 模式） */}
          {selectedMode === MODES.NATURE && (
            <View style={styles.soundRow}>
              {NATURE_VARIANTS.map((v, idx) => {
                const active = natureVariant === idx;
                return (
                  <TouchableOpacity
                    key={v.key}
                    activeOpacity={0.8}
                    onPress={() => { if (!isActive) setNatureVariant(idx); }}
                    style={styles.soundWrap}
                  >
                    <View style={[styles.soundBtn, active && styles.soundBtnActive]}>
                      <MaterialIcons
                        name={v.icon}
                        size={active ? 24 : 20}
                        color={active ? COLORS.primary : COLORS.onSurfaceVariant}
                      />
                    </View>
                    <View style={[styles.soundDot, active && styles.soundDotActive]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Player 容器 */}
          <View style={styles.playerContainer}>
            {renderPlayer()}
          </View>

          {/* 音疗日历 */}
          <View style={styles.calendarSection}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => setCurrentMonth(new Date(year, month - 1, 1))}
                style={styles.calArrowBtn}
              >
                <MaterialIcons name="chevron-left" size={20} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
              <Text style={styles.calTitle}>{year}年{month + 1}月 音疗记录</Text>
              <TouchableOpacity
                onPress={() => setCurrentMonth(new Date(year, month + 1, 1))}
                style={styles.calArrowBtn}
              >
                <MaterialIcons name="chevron-right" size={20} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            <View style={styles.weekRow}>
              {weekDays.map(d => <Text key={d} style={styles.weekDay}>{d}</Text>)}
            </View>
            <View style={styles.daysGrid}>
              {Array.from({ length: startWeekday }).map((_, i) => (
                <View key={`e${i}`} style={styles.calDay} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const record = getDayRecord(day);
                const hasRecord = !!record;
                const totalMin = hasRecord
                  ? Math.floor(Object.values(record).reduce((a, b) => a + b, 0) / 60)
                  : 0;
                return (
                  <View key={day} style={[styles.calDay, hasRecord && styles.calDayActive]}>
                    <Text style={[styles.calDayNum, hasRecord && styles.calDayNumActive]}>
                      {day}
                    </Text>
                    {hasRecord && <Text style={styles.calDayMin}>{totalMin}分</Text>}
                  </View>
                );
              })}
            </View>
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
    paddingBottom: SPACING.xxl,
  },
  // 顶部 Blur Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    height: 64,
    justifyContent: 'flex-end',
    paddingBottom: 8,
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
    gap: 6,
  },
  logoText: {
    fontSize: 20,
    fontFamily: FONT.semiBold,
    fontStyle: 'italic',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  // 标题区
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.containerMargin,
    paddingTop: 88,
    paddingBottom: SPACING.lg,
  },
  greeting: {
    fontSize: 24,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  subGreeting: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
    opacity: 0.7,
  },
  todayBadge: {
    alignItems: 'flex-end',
  },
  todayMinutes: {
    fontSize: 32,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    lineHeight: 36,
  },
  todayLabel: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
    opacity: 0.6,
    marginTop: 2,
  },
  // 模式卡片
  modeList: {
    paddingLeft: SPACING.containerMargin,
    paddingVertical: SPACING.md,
    paddingRight: 40,
    gap: 12,
  },
  modeCardWrap: {
    marginRight: 12,
    alignItems: 'center',
  },
  modeImageWrap: {
    width: 112,
    height: 112,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.figmaCard,
  },
  modeImageWrapActive: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modeImageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeImageFallbackText: {
    fontSize: 28,
    fontFamily: FONT.bold,
    color: '#fff',
    opacity: 0.8,
  },
  modeImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(70,98,83,0.15)',
  },
  modeLabel: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
    marginTop: 8,
    textAlign: 'center',
  },
  modeLabelActive: {
    color: COLORS.primary,
    fontFamily: FONT.semiBold,
  },
  // 计时器区域
  timerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    position: 'relative',
  },
  timerGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(70,98,83,0.06)',
    top: 20,
  },
  timerButton: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.figmaCard,
    borderWidth: 1,
    borderColor: 'rgba(194,200,194,0.1)',
    zIndex: 2,
  },
  timerButtonText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.primary,
    letterSpacing: 2,
    marginTop: 4,
  },
  timerCountdown: {
    fontSize: 28,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginTop: 4,
  },
  timerCaption: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    opacity: 0.8,
    marginTop: SPACING.lg,
  },
  // 声音切换
  soundRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 20,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  soundWrap: {
    alignItems: 'center',
  },
  soundBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(233,239,236,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundBtnActive: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryFixed,
    borderWidth: 2,
    borderColor: '#fff',
    ...SHADOWS.figmaButton,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  soundDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    opacity: 0,
  },
  soundDotActive: {
    opacity: 1,
  },
  // Player
  playerContainer: {
    minHeight: 120,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SPACING.containerMargin,
  },
  // 日历
  calendarSection: {
    backgroundColor: COLORS.surfaceContainerLowest,
    marginHorizontal: SPACING.containerMargin,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: 'rgba(114,121,115,0.06)',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  calTitle: {
    fontSize: 14,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
  },
  calArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  weekDay: {
    fontSize: 11,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurfaceVariant,
    opacity: 0.35,
    width: 36,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calDay: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.DEFAULT,
  },
  calDayActive: {
    backgroundColor: 'rgba(70,98,83,0.08)',
  },
  calDayNum: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.onSurface,
  },
  calDayNumActive: {
    color: COLORS.primary,
    fontFamily: FONT.semiBold,
  },
  calDayMin: {
    fontSize: 9,
    fontFamily: FONT.medium,
    color: COLORS.primary,
    marginTop: 2,
    opacity: 0.8,
  },
});

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, RADIUS, SCREEN_GRADIENT, SIZES, SPACING, SHADOWS } from '../theme';
import { MONTH_NAMES } from '../constants';
import { getMonthStats, getMonthTotalTime, clearAllStats } from '../storage';
import DailyChart from './DailyChart';

export default function StatsScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthStats, setMonthStats] = useState({});
  const [totalSeconds, setTotalSeconds] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentMonth])
  );

  const loadData = async () => {
    const stats = await getMonthStats(currentMonth);
    const total = await getMonthTotalTime(currentMonth);
    setMonthStats(stats);
    setTotalSeconds(total);
  };

  const changeMonth = (delta) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + delta);
    setCurrentMonth(d);
  };

  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const activeDays = Object.keys(monthStats).length;

  return (
    <LinearGradient colors={SCREEN_GRADIENT} style={styles.container}>
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 顶部 —— 大量留白 */}
        <View style={styles.header}>
          <Text style={styles.greeting}>月度回顾</Text>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={() => changeMonth(-1)} activeOpacity={0.6}>
              <Text style={styles.arrow}>〈</Text>
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {currentMonth.getFullYear()}年 {MONTH_NAMES[currentMonth.getMonth()]}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} activeOpacity={0.6}>
              <Text style={styles.arrow}>〉</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 概览卡片 —— 更开阔的间距 */}
        <View style={styles.overview}>
          <View style={[styles.card, SHADOWS.small]}>
            <Text style={styles.cardValue}>{totalMinutes}</Text>
            <Text style={styles.cardLabel}>总分钟数</Text>
          </View>
          <View style={[styles.card, SHADOWS.small]}>
            <Text style={styles.cardValue}>{totalHours}</Text>
            <Text style={styles.cardLabel}>总小时数</Text>
          </View>
          <View style={[styles.card, SHADOWS.small]}>
            <Text style={styles.cardValue}>{activeDays}</Text>
            <Text style={styles.cardLabel}>活跃天数</Text>
          </View>
        </View>

        {/* 情绪图表 */}
        <DailyChart monthStats={monthStats} />

        {/* 鼓励语与调试 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {totalMinutes > 0
              ? '每一天的平静积累，都是对身心的温柔关照。'
              : '本月还没有记录哦，今天开始第一次疗愈吧～'}
          </Text>
          <TouchableOpacity onPress={async () => { try { await clearAllStats(); loadData(); } catch (e) {} }}>
            <Text style={styles.clearText}>清空数据（调试用）</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.lg },
  greeting: { fontSize: SIZES.huge, fontFamily: FONT.bold, color: COLORS.textPrimary },
  monthSelector: {
    flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.72)', alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md, paddingVertical: 10, borderRadius: RADIUS.DEFAULT, ...SHADOWS.small,
  },
  arrow: { fontSize: 16, color: COLORS.textSecondary, paddingHorizontal: 10 },
  monthText: { fontSize: 14, color: COLORS.textPrimary, fontFamily: FONT.semiBold, marginHorizontal: 6 },
  overview: {
    flexDirection: 'row', paddingHorizontal: SPACING.lg, marginTop: SPACING.lg, gap: 12,
  },
  card: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg, alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.08)',
  },
  cardValue: { fontSize: 24, fontFamily: FONT.bold, color: COLORS.textPrimary },
  cardLabel: { fontSize: 11, fontFamily: FONT.medium, color: COLORS.textLight, marginTop: 6 },
  footer: { alignItems: 'center', paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.lg },
  footerText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  clearText: { fontSize: 11, color: COLORS.textLight, marginTop: SPACING.lg, textDecorationLine: 'underline' },
});

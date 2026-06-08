import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../theme';

const MODE_COLORS = {
  breathing: COLORS.breathing,
  nature: COLORS.nature,
  bowl: COLORS.bowl,
  asmr: COLORS.asmr,
  meditation: COLORS.meditation,
  whiteNoise: COLORS.whiteNoise,
};

const MODE_LABELS = {
  breathing: '呼吸',
  nature: '自然',
  bowl: '音钵',
  asmr: 'ASMR',
  meditation: '冥想',
  whiteNoise: '专注',
};

export default function DailyChart({ monthStats }) {
  const days = Object.keys(monthStats).map(Number).sort((a, b) => a - b);
  const maxTotal = days.length > 0
    ? Math.max(...days.map(d => Object.values(monthStats[d]).reduce((a, b) => a + b, 0)))
    : 1;

  const getBarSegments = (dayData) => {
    const segments = [];
    if (!dayData) return segments;
    Object.keys(dayData).forEach(mode => {
      segments.push({ mode, seconds: dayData[mode] });
    });
    return segments.sort((a, b) => b.seconds - a.seconds);
  };

  const totalByMode = {};
  days.forEach(d => {
    Object.keys(monthStats[d]).forEach(mode => {
      totalByMode[mode] = (totalByMode[mode] || 0) + monthStats[d][mode];
    });
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>本月情绪色彩</Text>
      <Text style={styles.subtitle}>每天使用的疗法用不同颜色记录，越深代表时间越长</Text>

      {/* 热力条 —— 更宽、更开阔 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
        <View style={styles.chartArea}>
          {days.map(day => {
            const dayData = monthStats[day];
            const total = Object.values(dayData).reduce((a, b) => a + b, 0);
            const height = Math.max(24, (total / Math.max(maxTotal, 300)) * 160);
            const segments = getBarSegments(dayData);
            let accumulated = 0;

            return (
              <View key={day} style={styles.barColumn}>
                <View style={[styles.barBg, { height }]}>
                  {segments.map(seg => {
                    const segH = (seg.seconds / total) * height;
                    const top = accumulated;
                    accumulated += segH;
                    return (
                      <View
                        key={seg.mode}
                        style={{
                          position: 'absolute',
                          top,
                          left: 0,
                          right: 0,
                          height: segH,
                          backgroundColor: MODE_COLORS[seg.mode] || '#ccc',
                          opacity: 0.8,
                        }}
                      />
                    );
                  })}
                </View>
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            );
          })}
          {days.length === 0 && (
            <Text style={styles.emptyText}>本月暂无记录，快去开启一次疗愈吧</Text>
          )}
        </View>
      </ScrollView>

      {/* 图例 —— 更开阔的间距 */}
      <View style={styles.legend}>
        {Object.keys(MODE_LABELS).map(mode => (
          <View key={mode} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: MODE_COLORS[mode] }]} />
            <Text style={styles.legendText}>{MODE_LABELS[mode]}</Text>
            <Text style={styles.legendTime}>
              {Math.floor((totalByMode[mode] || 0) / 60)}分
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: SPACING.lg, paddingHorizontal: SPACING.lg },
  title: { fontSize: 22, fontWeight: '300', color: COLORS.textPrimary, marginBottom: 6, letterSpacing: 2 },
  subtitle: { fontSize: 12, color: COLORS.textLight, marginBottom: SPACING.lg, lineHeight: 18 },
  chartScroll: { maxHeight: 220 },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', paddingBottom: SPACING.sm, gap: 14, minWidth: '100%' },
  barColumn: { alignItems: 'center', width: 28 },
  barBg: { width: 20, backgroundColor: COLORS.divider, borderRadius: 6, overflow: 'hidden' },
  dayLabel: { fontSize: 10, color: COLORS.textLight, marginTop: 8 },
  emptyText: { fontSize: 13, color: COLORS.textLight, marginLeft: SPACING.sm },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.xl, gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: COLORS.textSecondary },
  legendTime: { fontSize: 11, color: COLORS.textLight },
});

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Modal, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, RADIUS, FONT } from '../theme';
import { getDiaryEntries, saveDiaryEntry } from '../storage';

const WEEK_DAYS = ['S','M','T','W','T','F','S'];
const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0NgM7TiEvrukEVuVY5ylj7xMP76FFVHqwJjLfCNqRJt6fZZmC-Gw9jyO4lsWcyGjrONS4_GydYu0qXv_I2LFt-pg127qS4F8S08P74eRv2VMYDqlS5lqm4zWlfwAI04RiUVWtMMeNjlKQ1k0S20U7QqqgN-oR9OO_Siflxbm-VBPJsICiZKpTRsI4HHjcCOo0zWCf5QfwblCQgXsw85rxrWk_JDO_C4ksu9oHUcv91Q5eVgWjQ8fujSXTiHNbB-x3KFV9X9OIGQ';

export default function DiaryScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [entries, setEntries] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [currentMonth])
  );

  const loadEntries = async () => {
    const data = await getDiaryEntries();
    setEntries(data);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const handleSave = async () => {
    if (!inputText.trim() || !selectedDate) return;
    await saveDiaryEntry(selectedDate, inputText.trim());
    setInputText('');
    setModalVisible(false);
    loadEntries();
  };

  const openDate = (day) => {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setSelectedDate(key);
    setInputText(entries[key] || '');
    setModalVisible(true);
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
  const yesterdayEntry = entries[yKey];

  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;

  const isToday = (day) => {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return key === todayKey;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 顶部 Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <MaterialIcons name="spa" size={20} color={COLORS.primary} />
            <Text style={styles.logoText}>Digital Sanctuary</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialIcons name="search" size={22} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* 年月选择器 */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn} activeOpacity={0.7}>
            <MaterialIcons name="chevron-left" size={22} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
          <View style={styles.monthTextWrap}>
            <Text style={styles.monthText}>
              {new Date(year, month).toLocaleString('en-US', { month: 'long' })} {year}
            </Text>
            <Text style={styles.monthSub}>Yearly Overview</Text>
          </View>
          <TouchableOpacity onPress={nextMonth} style={styles.arrowBtn} activeOpacity={0.7}>
            <MaterialIcons name="chevron-right" size={22} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* 日历卡片 */}
        <View style={styles.calendarCard}>
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((d, i) => (
              <Text key={i} style={styles.weekDay}>{d}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {Array.from({ length: startWeekday }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const hasEntry = !!entries[key];
              const selected = selectedDate === key;
              const today = isToday(day);

              return (
                <TouchableOpacity
                  key={day}
                  style={styles.dayCell}
                  onPress={() => openDate(day)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.dayCircle,
                    hasEntry && !selected && styles.dayCircleHasEntry,
                    selected && styles.dayCircleSelected,
                    today && !selected && styles.dayCircleToday,
                  ]}>
                    <Text style={[
                      styles.dayNum,
                      (selected || (hasEntry && !selected)) && styles.dayNumActive,
                      today && !selected && styles.dayNumToday,
                    ]}>
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Yesterday's Happiness */}
        <View style={styles.yesterdaySection}>
          <Text style={styles.sectionTitle}>Yesterday's Happiness</Text>
          <View style={styles.yesterdayRow}>
            <Image source={{ uri: AVATAR_URL }} style={styles.yesterdayAvatar} />
            <View style={styles.bubbleCard}>
              {yesterdayEntry ? (
                <>
                  <Text style={styles.bubbleText}>“{yesterdayEntry}”</Text>
                  <Text style={styles.bubbleTime}>— 07:15 AM</Text>
                </>
              ) : (
                <Text style={styles.bubbleEmpty}>昨天没有记录，今天开始写下第一件幸福小事吧～</Text>
              )}
            </View>
          </View>
        </View>

        {/* Info 卡片 */}
        <View style={styles.infoCards}>
          <View style={styles.infoCardTertiary}>
            <View>
              <MaterialIcons name="cloud-queue" size={32} color={COLORS.onTertiaryFixedVariant} style={{ opacity: 0.5, marginBottom: SPACING.sm }} />
              <Text style={styles.infoCardTitle}>Current Mood</Text>
            </View>
            <View style={styles.infoCardLabelRow}>
              <Text style={styles.infoCardLabel}>TRANQUIL</Text>
              <View style={styles.pulseDot} />
            </View>
            {/* 背景光晕 */}
            <View style={styles.cardGlow} />
          </View>
          <View style={styles.infoCardSecondary}>
            <View>
              <MaterialIcons name="auto-awesome" size={32} color={COLORS.onSecondaryFixedVariant} style={{ opacity: 0.5, marginBottom: SPACING.sm }} />
              <Text style={styles.infoCardTitle}>Focus Goal</Text>
            </View>
            <Text style={styles.infoCardLabel}>MINDFUL PRESENCE</Text>
            <View style={styles.cardGlow} />
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setSelectedDate(todayKey);
          setInputText(entries[todayKey] || '');
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <MaterialIcons name="edit-note" size={28} color={COLORS.onPrimary} />
      </TouchableOpacity>

      {/* 输入弹窗 */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedDate} 幸福小事</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="今天发生了什么让你感到幸福的小事？"
              placeholderTextColor={COLORS.outline}
              value={inputText}
              onChangeText={setInputText}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnTextSecondary}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleSave}>
                <Text style={styles.modalBtnTextPrimary}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.containerMargin,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  // 顶部
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
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
  // 年月选择器
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTextWrap: {
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
  },
  monthText: {
    fontSize: 20,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
    letterSpacing: -0.2,
  },
  monthSub: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
    opacity: 0.6,
    marginTop: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // 日历
  calendarCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 40,
    padding: SPACING.lg,
    ...SHADOWS.figmaCard,
    borderWidth: 1,
    borderColor: 'rgba(194,200,194,0.1)',
    marginBottom: SPACING.xl,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  weekDay: {
    fontSize: 12,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurfaceVariant,
    opacity: 0.35,
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleHasEntry: {
    backgroundColor: COLORS.secondaryContainer,
  },
  dayCircleSelected: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dayNum: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
  },
  dayNumActive: {
    color: COLORS.onPrimary,
    fontFamily: FONT.semiBold,
  },
  dayNumToday: {
    color: COLORS.primary,
    fontFamily: FONT.semiBold,
  },
  // 昨日幸福
  yesterdaySection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONT.semiBold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  yesterdayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  yesterdayAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.surfaceContainerLowest,
    ...SHADOWS.small,
  },
  bubbleCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 24,
    padding: SPACING.lg,
    ...SHADOWS.figmaCard,
    borderWidth: 1,
    borderColor: 'rgba(194,200,194,0.1)',
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  bubbleTime: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.primary,
    opacity: 0.6,
    marginTop: SPACING.sm,
    textAlign: 'right',
  },
  bubbleEmpty: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    opacity: 0.7,
    lineHeight: 22,
  },
  // Info 卡片
  infoCards: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  infoCardTertiary: {
    flex: 1,
    height: 160,
    backgroundColor: COLORS.tertiaryFixed,
    borderRadius: 32,
    padding: SPACING.lg,
    justifyContent: 'space-between',
    ...SHADOWS.small,
    overflow: 'hidden',
    position: 'relative',
  },
  infoCardSecondary: {
    flex: 1,
    height: 160,
    backgroundColor: COLORS.secondaryFixed,
    borderRadius: 32,
    padding: SPACING.lg,
    justifyContent: 'space-between',
    ...SHADOWS.small,
    overflow: 'hidden',
    position: 'relative',
  },
  infoCardTitle: {
    fontSize: 18,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
  },
  infoCardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoCardLabel: {
    fontSize: 11,
    fontFamily: FONT.semiBold,
    letterSpacing: 1,
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.onTertiaryFixedVariant,
  },
  cardGlow: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    opacity: 0.5,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  // 弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22,29,27,0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },
  modalInput: {
    height: 120,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: 15,
    fontFamily: FONT.regular,
    color: COLORS.onSurface,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalBtnTextSecondary: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    fontFamily: FONT.medium,
  },
  modalBtnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: RADIUS.lg,
  },
  modalBtnTextPrimary: {
    color: COLORS.onPrimary,
    fontSize: 15,
    fontFamily: FONT.semiBold,
  },
});

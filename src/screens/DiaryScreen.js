import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Image, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, SHADOWS, RADIUS, FONT, SCREEN_GRADIENT } from '../theme';
import { useAuth } from '../context/AuthContext';
import {
  getDiaryEntries, saveDiaryEntry, getDailyStats, getDiaryItems,
  getTodoList, saveTodoList, getMoodEntries, saveMoodEntry,
} from '../storage';
import { MODE_CONFIG } from '../constants';

const WEEK_DAYS = ['日','一','二','三','四','五','六'];
const MOODS = [
  { key: 'happy', label: '开心', emoji: '😊', color: '#FFB347' },
  { key: 'angry', label: '愤怒', emoji: '😡', color: '#FF6B6B' },
  { key: 'frustrated', label: '沮丧', emoji: '😞', color: '#A0A0A0' },
  { key: 'sad', label: '伤心', emoji: '😢', color: '#7EB8DA' },
];

export default function DiaryScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [entries, setEntries] = useState({});
  const [dailyStats, setDailyStats] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Happy moments modal
  const [happyVisible, setHappyVisible] = useState(false);
  const [happyItems, setHappyItems] = useState([]);
  const [happyDraft, setHappyDraft] = useState('');

  // Date detail modal (therapy records, happy, mood)
  const [dateDetailVisible, setDateDetailVisible] = useState(false);

  // Mood diary modal
  const [moodVisible, setMoodVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState('happy');
  const [moodDiary, setMoodDiary] = useState('');
  const [moodEntries, setMoodEntries] = useState([]);

  // Todo list
  const [todoList, setTodoList] = useState([]);
  const [todoDraft, setTodoDraft] = useState('');
  const [todoVisible, setTodoVisible] = useState(false);

  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
  const isTodaySelected = !selectedDate || selectedDate === todayKey;

  const loadData = useCallback(async () => {
    const todoDate = selectedDate || `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
    const [diaryData, stats, todo] = await Promise.all([
      getDiaryEntries(),
      getDailyStats(),
      getTodoList(todoDate),
    ]);
    setEntries(diaryData);
    setDailyStats(stats);
    setTodoList(todo);
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData, currentMonth])
  );

  const loadMoodForDate = async (dateKey) => {
    try {
      const moods = await getMoodEntries(dateKey);
      setMoodEntries(moods);
    } catch (e) {
      setMoodEntries([]);
    }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const isFutureDate = (day) => {
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const checkDate = new Date(year, month, day);
    return checkDate > todayDateOnly;
  };

  const isTodayDate = (day) => {
    const today = new Date();
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    return key === todayKey;
  };

  const canEditHappy = (dateKey) => {
    if (!dateKey) return false;
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);
    const dbKey = `${dayBefore.getFullYear()}-${String(dayBefore.getMonth()+1).padStart(2,'0')}-${String(dayBefore.getDate()).padStart(2,'0')}`;
    return dateKey === todayKey || dateKey === yKey || dateKey === dbKey;
  };

  const openDate = (day) => {
    if (isFutureDate(day)) return;
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setSelectedDate(key);
    // Load existing happy items for this date
    setHappyItems(getDiaryItems(entries, key));
    // Load mood entries
    loadMoodForDate(key);
    setDateDetailVisible(true);
  };

  // ====== 幸福小事 (Item 4: min 3) ======
  const handleAddHappyItem = () => {
    if (!happyDraft.trim()) return;
    setHappyItems([...happyItems, happyDraft.trim()]);
    setHappyDraft('');
  };

  const handleRemoveHappyItem = (index) => {
    setHappyItems(happyItems.filter((_, i) => i !== index));
  };

  const handleSaveHappy = async () => {
    if (!selectedDate) return;
    if (!canEditHappy(selectedDate)) {
      alert('仅可记录今天、昨天或前天的幸福小事');
      return;
    }
    if (happyItems.length < 3) {
      alert('请至少记录三件幸福小事');
      return;
    }
    await saveDiaryEntry(selectedDate, happyItems);
    setHappyVisible(false);
    loadData();
  };

  const openHappyModal = () => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    // FAB 始终默认记录今天
    setSelectedDate(todayKey);
    setHappyItems(getDiaryItems(entries, todayKey));
    setHappyVisible(true);
  };

  // ====== 心情日记 (Item 6) ======
  const handleSaveMood = async () => {
    if (!selectedDate || !moodDiary.trim()) return;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    await saveMoodEntry(selectedDate, {
      mood: selectedMood,
      diary: moodDiary.trim(),
      timestamp,
    });
    setMoodDiary('');
    setSelectedMood('happy');
    setMoodVisible(false);
    loadMoodForDate(selectedDate);
  };

  // ====== 待办事项 (Item 7) ======
  const todoDateKey = selectedDate || todayKey;

  const handleAddTodo = async () => {
    if (!todoDraft.trim()) return;
    const updated = [...todoList, { text: todoDraft.trim(), done: false }];
    setTodoList(updated);
    setTodoDraft('');
    await saveTodoList(updated, todoDateKey);
  };

  const handleToggleTodo = async (index) => {
    const updated = todoList.map((item, i) =>
      i === index ? { ...item, done: !item.done } : item
    );
    setTodoList(updated);
    await saveTodoList(updated, todoDateKey);
  };

  const handleRemoveTodo = async (index) => {
    const updated = todoList.filter((_, i) => i !== index);
    setTodoList(updated);
    await saveTodoList(updated, todoDateKey);
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // 昨日幸福 — 以选中日期为基准，未选中则用今天
  const yKey = (() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const prev = new Date(y, m - 1, d - 1);
      return `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}-${String(prev.getDate()).padStart(2,'0')}`;
    }
    const today = new Date();
    const prev = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    return `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}-${String(prev.getDate()).padStart(2,'0')}`;
  })();
  const yesterdayItems = getDiaryItems(entries, yKey);
  const hasYesterdayEntry = yesterdayItems.length > 0;

  // Use user's avatar for yesterday section
  const userAvatar = user?.avatarUri || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0NgM7TiEvrukEVuVY5ylj7xMP76FFVHqwJjLfCNqRJt6fZZmC-Gw9jyO4lsWcyGjrONS4_GydYu0qXv_I2LFt-pg127qS4F8S08P74eRv2VMYDqlS5lqm4zWlfwAI04RiUVWtMMeNjlKQ1k0S20U7QqqgN-oR9OO_Siflxbm-VBPJsICiZKpTRsI4HHjcCOo0zWCf5QfwblCQgXsw85rxrWk_JDO_C4ksu9oHUcv91Q5eVgWjQ8fujSXTiHNbB-x3KFV9X9OIGQ';

  return (
    <LinearGradient colors={SCREEN_GRADIENT} style={styles.container}>
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 顶部 Header */}
        <BlurView intensity={34} tint="light" style={styles.header}>
          <View style={styles.headerInner}>
            <View style={styles.logoRow}>
              <MaterialIcons name="spa" size={20} color={COLORS.primary} />
              <Text style={styles.logoText}>心灵疗愈室——让情绪流动</Text>
            </View>
          </View>
        </BlurView>

        {/* 月度统计卡片 */}
        {(() => {
          const monthPrefix = `${year}-${String(month+1).padStart(2,'0')}`;
          const monthStatsKeys = Object.keys(dailyStats).filter(k => k.startsWith(monthPrefix));
          const monthTotalSeconds = monthStatsKeys.reduce((sum, k) => {
            return sum + Object.values(dailyStats[k] || {}).reduce((a, b) => a + b, 0);
          }, 0);
          const monthDaysWithStats = monthStatsKeys.length;
          const monthDaysWithDiary = Object.keys(entries).filter(k => k.startsWith(monthPrefix) && getDiaryItems(entries, k).length > 0).length;

          return (
            <View style={styles.monthStatsRow}>
              <View style={styles.monthStatItem}>
                <MaterialIcons name="timer" size={18} color={COLORS.primary} />
                <Text style={styles.monthStatValue}>{Math.floor(monthTotalSeconds / 60)}</Text>
                <Text style={styles.monthStatLabel}>分钟疗愈</Text>
              </View>
              <View style={styles.monthStatDivider} />
              <View style={styles.monthStatItem}>
                <MaterialIcons name="edit-note" size={18} color={COLORS.secondary} />
                <Text style={styles.monthStatValue}>{monthDaysWithDiary}</Text>
                <Text style={styles.monthStatLabel}>天日记</Text>
              </View>
              <View style={styles.monthStatDivider} />
              <View style={styles.monthStatItem}>
                <MaterialIcons name="self-improvement" size={18} color={COLORS.warm} />
                <Text style={styles.monthStatValue}>{monthDaysWithStats}</Text>
                <Text style={styles.monthStatLabel}>天疗愈</Text>
              </View>
            </View>
          );
        })()}

        {/* 年月选择器 */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn} activeOpacity={0.7}>
            <MaterialIcons name="chevron-left" size={22} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
          <View style={styles.monthTextWrap}>
            <Text style={styles.monthText}>
              {year}年 {month + 1}月
            </Text>
            <Text style={styles.monthSub}>月度日记</Text>
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
              const hasEntry = !!entries[key] && getDiaryItems(entries, key).length > 0;
              const hasStats = !!dailyStats[key];
              const hasActivity = hasEntry || hasStats;
              const selected = selectedDate === key;
              const today = isTodayDate(day);
              const future = isFutureDate(day);

              return (
                <TouchableOpacity
                  key={day}
                  style={styles.dayCell}
                  onPress={future ? undefined : () => openDate(day)}
                  activeOpacity={future ? 1 : 0.7}
                >
                  <View style={[
                    styles.dayCircle,
                    selected && !future && styles.dayCircleSelected,
                    today && !selected && !future && styles.dayCircleToday,
                  ]}>
                    <Text style={[
                      styles.dayNum,
                      future && styles.dayNumFuture,
                      selected && !future && styles.dayNumSelected,
                      today && !selected && !future && styles.dayNumToday,
                    ]}>
                      {day}
                    </Text>
                    {hasActivity && !future && (
                      <View style={[
                        styles.dayDot,
                        hasEntry && styles.dayDotEntry,
                        !hasEntry && hasStats && styles.dayDotStats,
                      ]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 昨日幸福 — 聊天框样式 */}
        <TouchableOpacity style={styles.yesterdaySection} onPress={openHappyModal} activeOpacity={0.85}>
          <Text style={styles.sectionTitle}>昨日幸福</Text>
          <View style={styles.yesterdayRow}>
            <Image source={{ uri: userAvatar }} style={styles.yesterdayAvatar} />
            <View style={styles.chatBubbleTail} />
            <View style={styles.bubbleCard}>
              {hasYesterdayEntry ? (
                <>
                  {yesterdayItems.map((item, idx) => (
                    <Text key={idx} style={styles.bubbleText}>
                      {idx + 1}. {item}
                    </Text>
                  ))}
                  <Text style={styles.bubbleCount}>{yesterdayItems.length} 件幸福小事</Text>
                </>
              ) : (
                <Text style={styles.bubbleEmpty}>昨日没有记录，点击这里记录今天的吧～</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Info 卡片: 心情 + 待办 */}
        <View style={styles.infoCards}>
          {/* Item 6: 当下心情 */}
          <TouchableOpacity
            style={[styles.infoCardTertiary, !isTodaySelected && styles.infoCardDisabled]}
            onPress={() => {
              if (!isTodaySelected) return;
              if (!selectedDate) {
                const today = new Date();
                const tk = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
                setSelectedDate(tk);
                loadMoodForDate(tk);
              } else {
                loadMoodForDate(selectedDate);
              }
              setMoodVisible(true);
            }}
            activeOpacity={isTodaySelected ? 0.85 : 1}
          >
            <View>
              <MaterialIcons name="cloud-queue" size={26} color={COLORS.onTertiaryFixedVariant} style={{ opacity: isTodaySelected ? 0.7 : 0.35, marginBottom: 4 }} />
              <Text style={styles.infoCardTitle}>当下心情</Text>
            </View>
            <View style={styles.infoCardLabelRow}>
              <Text style={styles.infoCardLabel}>{isTodaySelected ? '记录心情' : '仅当天可记'}</Text>
              {isTodaySelected && <View style={styles.pulseDot} />}
            </View>
          </TouchableOpacity>

          {/* Item 7: 待办事项 */}
          <TouchableOpacity
            style={[styles.infoCardSecondary, !isTodaySelected && styles.infoCardDisabled]}
            onPress={() => setTodoVisible(true)}
            activeOpacity={0.85}
          >
            <View>
              <MaterialIcons name="auto-awesome" size={26} color={COLORS.onSecondaryFixedVariant} style={{ opacity: isTodaySelected ? 0.7 : 0.35, marginBottom: 4 }} />
              <Text style={styles.infoCardTitle}>今日待办</Text>
            </View>
            <Text style={styles.infoCardLabel}>
              {isTodaySelected
                ? `${todoList.filter(t => t.done).length}/${todoList.length} 完成`
                : `${todoList.length} 项`}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* FAB — 幸福小事 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openHappyModal}
        activeOpacity={0.8}
      >
        <MaterialIcons name="edit-note" size={28} color={COLORS.onPrimary} />
      </TouchableOpacity>

      {/* ====== 幸福小事弹窗 (Item 4: min 3) ====== */}
      <Modal visible={happyVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>幸福小事</Text>
            <Text style={styles.modalHint}>至少记录三件（{happyItems.length}/3）</Text>

            {/* Existing items */}
            {happyItems.map((item, idx) => (
              <View key={idx} style={styles.happyItemRow}>
                <Text style={styles.happyItemNum}>{idx + 1}.</Text>
                <Text style={styles.happyItemText}>{item}</Text>
                <TouchableOpacity onPress={() => handleRemoveHappyItem(idx)} hitSlop={8}>
                  <MaterialIcons name="close" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add new item */}
            <View style={styles.happyAddRow}>
              <TextInput
                style={styles.happyInput}
                placeholder="添加一件幸福小事..."
                placeholderTextColor={COLORS.outline}
                value={happyDraft}
                onChangeText={setHappyDraft}
                onSubmitEditing={handleAddHappyItem}
              />
              <TouchableOpacity style={styles.happyAddBtn} onPress={handleAddHappyItem}>
                <MaterialIcons name="add" size={20} color={COLORS.onPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setHappyVisible(false)}>
                <Text style={styles.modalBtnTextSecondary}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnPrimary, happyItems.length < 3 && { opacity: 0.4 }]}
                onPress={handleSaveHappy}
                disabled={happyItems.length < 3}
              >
                <Text style={styles.modalBtnTextPrimary}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====== 心情日记弹窗 (Item 6) ====== */}
      <Modal visible={moodVisible} animationType="slide" transparent onRequestClose={() => setMoodVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>当下心情</Text>

            {/* Mood selector */}
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.moodChip, selectedMood === m.key && { backgroundColor: m.color }]}
                  onPress={() => setSelectedMood(m.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, selectedMood === m.key && { color: '#fff' }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Diary input */}
            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="写下此刻的心情..."
              placeholderTextColor={COLORS.outline}
              value={moodDiary}
              onChangeText={setMoodDiary}
            />

            {/* Previous entries for this date */}
            {moodEntries.length > 0 && (
              <View style={styles.prevMoods}>
                <Text style={styles.prevMoodsTitle}>今日记录</Text>
                {moodEntries.map((entry, idx) => (
                  <View key={idx} style={styles.prevMoodItem}>
                    <Text style={styles.prevMoodEmoji}>
                      {MOODS.find(m => m.key === entry.mood)?.emoji}
                    </Text>
                    <Text style={styles.prevMoodText} numberOfLines={2}>{entry.diary}</Text>
                    <Text style={styles.prevMoodTime}>{entry.timestamp.slice(11, 19)}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setMoodVisible(false)}>
                <Text style={styles.modalBtnTextSecondary}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleSaveMood}>
                <Text style={styles.modalBtnTextPrimary}>保存记录</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====== 今日待办弹窗 (Item 7) ====== */}
      <Modal visible={todoVisible} animationType="slide" transparent onRequestClose={() => setTodoVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>今日待办</Text>

            {todoList.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.todoItem}
                onPress={isTodaySelected ? () => handleToggleTodo(idx) : undefined}
                activeOpacity={isTodaySelected ? 0.7 : 1}
              >
                <MaterialIcons
                  name={item.done ? 'check-circle' : 'radio-button-unchecked'}
                  size={22}
                  color={item.done ? COLORS.primary : COLORS.outline}
                />
                <Text style={[styles.todoText, item.done && styles.todoDone]} numberOfLines={2}>
                  {item.text}
                </Text>
                {isTodaySelected && (
                  <TouchableOpacity onPress={() => handleRemoveTodo(idx)} hitSlop={8}>
                    <MaterialIcons name="close" size={18} color={COLORS.error} style={{ opacity: 0.5 }} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}

            {todoList.length === 0 && (
              <Text style={styles.todoEmpty}>{isTodaySelected ? '暂无待办，添加一条吧～' : '该日期无待办记录'}</Text>
            )}

            {isTodaySelected && (
              <View style={styles.todoAddRow}>
                <TextInput
                  style={styles.todoInput}
                  placeholder="添加今日待办..."
                  placeholderTextColor={COLORS.outline}
                  value={todoDraft}
                  onChangeText={setTodoDraft}
                  onSubmitEditing={handleAddTodo}
                />
                <TouchableOpacity style={styles.todoAddBtn} onPress={handleAddTodo}>
                  <MaterialIcons name="add" size={20} color={COLORS.onPrimary} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setTodoVisible(false)}>
                <Text style={styles.modalBtnTextSecondary}>关闭</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====== 日期详情弹窗 (疗愈记录 + 幸福小事 + 心情记录) ====== */}
      <Modal visible={dateDetailVisible} animationType="slide" transparent onRequestClose={() => setDateDetailVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDateDetailVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.dateDetailHeader}>
              <Text style={styles.modalTitle}>{selectedDate}</Text>
              <TouchableOpacity onPress={() => setDateDetailVisible(false)} hitSlop={8}>
                <MaterialIcons name="close" size={24} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.dateDetailScroll}>
              {(() => {
                const dayStats = dailyStats[selectedDate] || {};
                const totalSeconds = Object.values(dayStats).reduce((a, b) => a + b, 0);
                const diaryItems = getDiaryItems(entries, selectedDate);
                const hasAnyData = totalSeconds > 0 || diaryItems.length > 0 || moodEntries.length > 0;

                if (!hasAnyData) {
                  return (
                    <View style={styles.dateDetailEmpty}>
                      <MaterialIcons name="event-note" size={36} color={COLORS.outline} style={{ opacity: 0.35 }} />
                      <Text style={styles.dateDetailEmptyText}>这一天暂无记录</Text>
                    </View>
                  );
                }

                return (
                  <>
                    {/* 疗愈时长明细 */}
                    {totalSeconds > 0 && (
                      <View style={styles.detailCard}>
                        <View style={styles.detailCardHeader}>
                          <MaterialIcons name="timer" size={16} color={COLORS.primary} />
                          <Text style={styles.detailCardTitle}>疗愈记录 · {Math.floor(totalSeconds / 60)} 分钟</Text>
                        </View>
                        {Object.entries(dayStats).map(([modeKey, seconds]) => {
                          const cfg = MODE_CONFIG[modeKey];
                          const modeName = cfg ? cfg.title : modeKey;
                          const modeColor = cfg ? cfg.color : COLORS.outline;
                          const minutes = Math.floor(seconds / 60);
                          if (minutes <= 0) return null;
                          const barWidth = totalSeconds > 0 ? Math.max(4, (seconds / totalSeconds) * 100) : 0;
                          return (
                            <View key={modeKey} style={styles.therapyRow}>
                              <View style={[styles.therapyDot, { backgroundColor: modeColor }]} />
                              <Text style={styles.therapyModeName}>{modeName}</Text>
                              <Text style={styles.therapyModeTime}>{minutes} 分钟</Text>
                              <View style={styles.therapyBarTrack}>
                                <View style={[styles.therapyBarFill, { width: `${barWidth}%`, backgroundColor: modeColor }]} />
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {/* 幸福小事摘要 */}
                    {diaryItems.length > 0 && (
                      <View style={styles.detailCard}>
                        <View style={styles.detailCardHeader}>
                          <MaterialIcons name="favorite" size={16} color={COLORS.warm} />
                          <Text style={styles.detailCardTitle}>幸福小事 · {diaryItems.length} 件</Text>
                        </View>
                        {diaryItems.map((item, idx) => (
                          <View key={idx} style={styles.detailHappyRow}>
                            <Text style={styles.detailHappyNum}>{idx + 1}.</Text>
                            <Text style={styles.detailHappyText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* 心情记录 */}
                    {moodEntries.length > 0 && (
                      <View style={styles.detailCard}>
                        <View style={styles.detailCardHeader}>
                          <MaterialIcons name="cloud-queue" size={16} color={COLORS.tertiary} />
                          <Text style={styles.detailCardTitle}>心情记录</Text>
                        </View>
                        {moodEntries.slice(-5).map((entry, idx) => {
                          const mood = MOODS.find(m => m.key === entry.mood);
                          return (
                            <View key={idx} style={styles.detailMoodRow}>
                              <View style={[styles.detailMoodTag, { backgroundColor: (mood?.color || COLORS.outline) + '22' }]}>
                                <Text style={styles.detailMoodEmoji}>{mood?.emoji || '❓'}</Text>
                                <Text style={[styles.detailMoodTagLabel, { color: mood?.color || COLORS.onSurfaceVariant }]}>
                                  {mood?.label || entry.mood}
                                </Text>
                              </View>
                              <Text style={styles.detailMoodText} numberOfLines={2}>{entry.diary}</Text>
                              <Text style={styles.detailMoodTime}>{entry.timestamp.slice(11, 16)}</Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.containerMargin,
    paddingTop: 72,
    paddingBottom: 128,
  },
  // 顶部
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
  // 年月选择器
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderRadius: RADIUS.xl,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.08)',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTextWrap: {
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
  },
  monthText: {
    fontSize: 20,
    fontFamily: FONT.bold,
    color: COLORS.onSurface,
  },
  monthSub: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
    opacity: 0.6,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  // 日历
  calendarCard: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: 10,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  weekDay: {
    fontSize: 12,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurfaceVariant,
    opacity: 0.55,
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
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dayCircleSelected: {
    backgroundColor: COLORS.primary,
  },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dayNum: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
  },
  dayNumSelected: {
    color: '#ffffff',
    fontFamily: FONT.semiBold,
  },
  dayNumToday: {
    color: COLORS.primary,
    fontFamily: FONT.semiBold,
  },
  dayNumFuture: {
    color: '#D3D3D3',
  },
  dayDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dayDotEntry: {
    backgroundColor: COLORS.primary,
  },
  dayDotStats: {
    backgroundColor: COLORS.amber,
  },
  // 月度统计
  monthStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: RADIUS.xl,
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.08)',
  },
  monthStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  monthStatValue: {
    fontSize: 20,
    fontFamily: FONT.bold,
    color: COLORS.onSurface,
  },
  monthStatLabel: {
    fontSize: 10,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
    opacity: 0.7,
  },
  monthStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.divider,
  },
  // 昨日幸福
  yesterdaySection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: FONT.bold,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },
  yesterdayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  yesterdayAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.surfaceContainerLowest,
  },
  chatBubbleTail: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'rgba(255,255,255,0.78)',
    marginTop: 13,
    marginRight: -1,
  },
  bubbleCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.09)',
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 1,
  },
  bubbleCount: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: COLORS.primary,
    opacity: 0.6,
    marginTop: 4,
    textAlign: 'right',
  },
  bubbleEmpty: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    opacity: 0.7,
    lineHeight: 20,
  },
  // Info 卡片
  infoCards: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: 0,
  },
  infoCardTertiary: {
    flex: 1,
    height: 100,
    backgroundColor: COLORS.tertiaryContainer,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    justifyContent: 'space-between',
    ...SHADOWS.small,
    overflow: 'hidden',
    position: 'relative',
  },
  infoCardSecondary: {
    flex: 1,
    height: 100,
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    justifyContent: 'space-between',
    ...SHADOWS.small,
    overflow: 'hidden',
    position: 'relative',
  },
  infoCardDisabled: {
    opacity: 0.55,
  },
  infoCardTitle: {
    fontSize: 16,
    fontFamily: FONT.bold,
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
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.onTertiaryFixedVariant,
  },
  // Date detail
  dateDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateDetailScroll: {
    maxHeight: 420,
  },
  dateDetailEmpty: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  dateDetailEmptyText: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    opacity: 0.5,
    marginTop: 6,
  },
  // Detail cards (therapy, happy, mood)
  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'rgba(79,122,100,0.18)',
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  detailCardTitle: {
    fontSize: 14,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
  },
  // Therapy breakdown
  therapyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 8,
  },
  therapyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  therapyModeName: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
    width: 44,
  },
  therapyModeTime: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    width: 44,
    textAlign: 'right',
  },
  therapyBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceContainerHigh,
    overflow: 'hidden',
  },
  therapyBarFill: {
    height: '100%',
    borderRadius: 3,
    opacity: 0.7,
  },
  // Happy moments in detail
  detailHappyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 3,
  },
  detailHappyNum: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: COLORS.warm,
    width: 20,
    lineHeight: 20,
  },
  detailHappyText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
  // Mood entries in detail
  detailMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  detailMoodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    gap: 3,
  },
  detailMoodEmoji: {
    fontSize: 13,
  },
  detailMoodTagLabel: {
    fontSize: 10,
    fontFamily: FONT.semiBold,
  },
  detailMoodText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
  },
  detailMoodTime: {
    fontSize: 10,
    color: COLORS.outline,
    fontFamily: FONT.regular,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 112,
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  // Happy moments modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24,32,29,0.42)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.08)',
  },
  modalTitle: {
    fontSize: 19,
    fontFamily: FONT.bold,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },
  modalHint: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.md,
    opacity: 0.7,
  },
  happyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  happyItemNum: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.primary,
    width: 24,
  },
  happyItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurface,
  },
  happyAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: 8,
  },
  happyInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.DEFAULT,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurface,
  },
  happyAddBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Mood modal
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: COLORS.surfaceContainerLow,
    gap: 4,
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodLabel: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.onSurfaceVariant,
  },
  modalInput: {
    height: 100,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.DEFAULT,
    padding: SPACING.md,
    fontSize: 15,
    fontFamily: FONT.regular,
    color: COLORS.onSurface,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  prevMoods: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.DEFAULT,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  prevMoodsTitle: {
    fontSize: 12,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurfaceVariant,
    marginBottom: 6,
  },
  prevMoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  prevMoodEmoji: {
    fontSize: 14,
  },
  prevMoodText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
  },
  prevMoodTime: {
    fontSize: 11,
    color: COLORS.outline,
  },
  // Todo modal
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    gap: 10,
  },
  todoText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONT.regular,
    color: COLORS.onSurface,
  },
  todoDone: {
    textDecorationLine: 'line-through',
    color: COLORS.outline,
  },
  todoEmpty: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    opacity: 0.6,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  todoAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: 8,
  },
  todoInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.DEFAULT,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurface,
  },
  todoAddBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: SPACING.sm,
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
    borderRadius: RADIUS.DEFAULT,
  },
  modalBtnTextPrimary: {
    color: COLORS.onPrimary,
    fontSize: 15,
    fontFamily: FONT.semiBold,
  },
});

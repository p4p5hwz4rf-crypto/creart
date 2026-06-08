import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

export function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function getMonthPrefix(date=new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
}

export async function addUsageTime(modeId, seconds) {
  try {
    const today = getTodayKey();
    const data = await getDailyStats();
    if (!data[today]) data[today] = {};
    if (!data[today][modeId]) data[today][modeId] = 0;
    data[today][modeId] += seconds;
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(data));
  } catch (e) { console.warn('保存使用时长失败', e); }
}

export async function getDailyStats() {
  try { const raw = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STATS); return raw?JSON.parse(raw):{}; }
  catch (e) { return {}; }
}

export async function getMonthStats(date=new Date()) {
  const all = await getDailyStats();
  const prefix = getMonthPrefix(date);
  const result = {};
  Object.keys(all).forEach(key => {
    if (key.startsWith(prefix)) { result[parseInt(key.split('-')[2],10)] = all[key]; }
  });
  return result;
}

export async function getTodayStats() { const all=await getDailyStats(); return all[getTodayKey()]||{}; }

export async function getMonthTotalTime(date=new Date()) {
  const stats = await getMonthStats(date); let total=0;
  Object.values(stats).forEach(day=>Object.values(day).forEach(s=>total+=s));
  return total;
}

export async function clearAllStats() { await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_STATS); }

// ========== 幸福日记存储 ==========
export async function getDiaryEntries() {
  try { const raw = await AsyncStorage.getItem('@diary_entries'); return raw ? JSON.parse(raw) : {}; }
  catch (e) { return {}; }
}

export async function saveDiaryEntry(dateKey, content) {
  try {
    const entries = await getDiaryEntries();
    entries[dateKey] = content;
    await AsyncStorage.setItem('@diary_entries', JSON.stringify(entries));
  } catch (e) { console.warn('保存日记失败', e); }
}

// ========== 目标存储 ==========
export async function getGoals() {
  try { const raw = await AsyncStorage.getItem('@goals'); return raw ? JSON.parse(raw) : []; }
  catch (e) { return []; }
}

export async function saveGoal(goal) {
  try {
    const goals = await getGoals();
    if (!goals.includes(goal)) {
      goals.push(goal);
      await AsyncStorage.setItem('@goals', JSON.stringify(goals));
    }
  } catch (e) { console.warn('保存目标失败', e); }
}

export async function removeGoal(goal) {
  try {
    const goals = await getGoals();
    const filtered = goals.filter(g => g !== goal);
    await AsyncStorage.setItem('@goals', JSON.stringify(filtered));
  } catch (e) { console.warn('删除目标失败', e); }
}

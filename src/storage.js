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

// ========== 幸福日记存储（数组格式，每日期多条） ==========
export async function getDiaryEntries() {
  try { const raw = await AsyncStorage.getItem('@diary_entries'); return raw ? JSON.parse(raw) : {}; }
  catch (e) { return {}; }
}

// content 是数组：["幸福小事1", "幸福小事2", "幸福小事3", ...]
export async function saveDiaryEntry(dateKey, items) {
  try {
    const entries = await getDiaryEntries();
    entries[dateKey] = items;
    await AsyncStorage.setItem('@diary_entries', JSON.stringify(entries));
  } catch (e) { console.warn('保存日记失败', e); }
}

// 兼容读取：返回数组（旧数据可能是字符串，自动转换）
export function getDiaryItems(entries, dateKey) {
  const val = entries[dateKey];
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val]; // 兼容旧格式单条字符串
}

// ========== 座右铭 ==========
export async function getMotto() {
  try { return await AsyncStorage.getItem('@motto') || ''; }
  catch (e) { return ''; }
}

export async function saveMotto(motto) {
  try { await AsyncStorage.setItem('@motto', motto); }
  catch (e) { console.warn('保存座右铭失败', e); }
}

// ========== 头像 ==========
export async function getAvatarUri() {
  try { return await AsyncStorage.getItem('@avatar_uri') || ''; }
  catch (e) { return ''; }
}

export async function saveAvatarUri(uri) {
  try { await AsyncStorage.setItem('@avatar_uri', uri); }
  catch (e) { console.warn('保存头像失败', e); }
}

// ========== 今日待办 ==========
export async function getTodoList() {
  try {
    const today = getTodayKey();
    const raw = await AsyncStorage.getItem('@todo_lists');
    const all = raw ? JSON.parse(raw) : {};
    return all[today] || [];
  } catch (e) { return []; }
}

export async function saveTodoList(items) {
  try {
    const today = getTodayKey();
    const raw = await AsyncStorage.getItem('@todo_lists');
    const all = raw ? JSON.parse(raw) : {};
    all[today] = items;
    await AsyncStorage.setItem('@todo_lists', JSON.stringify(all));
  } catch (e) { console.warn('保存待办失败', e); }
}

// ========== 心情记录 ==========
export async function getMoodEntries(dateKey) {
  try {
    const raw = await AsyncStorage.getItem('@mood_entries');
    const all = raw ? JSON.parse(raw) : {};
    return all[dateKey] || [];
  } catch (e) { return []; }
}

export async function saveMoodEntry(dateKey, entry) {
  try {
    const raw = await AsyncStorage.getItem('@mood_entries');
    const all = raw ? JSON.parse(raw) : {};
    if (!all[dateKey]) all[dateKey] = [];
    all[dateKey].push(entry);
    await AsyncStorage.setItem('@mood_entries', JSON.stringify(all));
  } catch (e) { console.warn('保存心情失败', e); }
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

// ========== 数据迁移 ==========
const OLD_TO_NEW_MODE_KEYS = {
  breathing: 'deep_breathing',
  nature: 'nature_sound',
  bowl: 'singing_bowl',
  // asmr, meditation, whiteNoise unchanged
};

async function migrateOldModeKeys() {
  try {
    const migrated = await AsyncStorage.getItem('@migration_v1');
    if (migrated === 'done') return;

    const raw = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STATS);
    if (!raw) {
      await AsyncStorage.setItem('@migration_v1', 'done');
      return;
    }

    const data = JSON.parse(raw);
    let needsWrite = false;

    Object.keys(data).forEach(dateKey => {
      const dayData = data[dateKey];
      Object.keys(OLD_TO_NEW_MODE_KEYS).forEach(oldKey => {
        if (dayData[oldKey] !== undefined) {
          const newKey = OLD_TO_NEW_MODE_KEYS[oldKey];
          dayData[newKey] = (dayData[newKey] || 0) + dayData[oldKey];
          delete dayData[oldKey];
          needsWrite = true;
        }
      });
    });

    if (needsWrite) {
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(data));
    }
    await AsyncStorage.setItem('@migration_v1', 'done');
  } catch (e) {
    console.warn('Migration failed:', e);
  }
}

export async function runMigrations() {
  await migrateOldModeKeys();
}

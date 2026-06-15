import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDiaryEntries } from '../storage';

const SubscriptionContext = createContext({});

export function SubscriptionProvider({ children }) {
  const [registerDate, setRegisterDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('@register_date').then((date) => {
      if (date) {
        setRegisterDate(date);
      } else {
        const now = new Date().toISOString();
        AsyncStorage.setItem('@register_date', now);
        setRegisterDate(now);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getSubscriptionStatus = async () => {
    if (!registerDate) return { isActive: true, daysLeft: 30, diaryCount: 0, reason: '新用户' };

    const now = new Date();
    const reg = new Date(registerDate);
    const daysSinceReg = Math.floor((now - reg) / (1000 * 60 * 60 * 24));

    // 第一个月免费
    if (daysSinceReg <= 30) {
      return { isActive: true, daysLeft: 30 - daysSinceReg, diaryCount: 0, reason: '首月免费' };
    }

    // 检查上个月日记次数
    const entries = await getDiaryEntries();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const prefix = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    const diaryCount = Object.keys(entries).filter(k => k.startsWith(prefix)).length;

    if (diaryCount >= 28) {
      return { isActive: true, daysLeft: null, diaryCount, reason: '达标免续费' };
    }

    // 检查是否已付费（模拟）
    const paid = await AsyncStorage.getItem('@paid_month');
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (paid === currentMonthPrefix) {
      return { isActive: true, daysLeft: null, diaryCount, reason: '已付费' };
    }

    return { isActive: false, daysLeft: 0, diaryCount, reason: '未达标未付费' };
  };

  const pay = async () => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    await AsyncStorage.setItem('@paid_month', prefix);
  };

  return (
    <SubscriptionContext.Provider value={{ registerDate, getSubscriptionStatus, pay, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ onSwitch }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const sendCode = () => {
    if (phone.length !== 11) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleRegister = () => {
    if (phone.length === 11 && code.length === 4) {
      login(phone);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>注册账号</Text>
      <Text style={styles.subtitle}>用手机号快速注册</Text>

      <View style={styles.inputRow}>
        <Text style={styles.prefix}>+86</Text>
        <TextInput style={styles.phoneInput} placeholder="请输入手机号" keyboardType="phone-pad" maxLength={11} value={phone} onChangeText={setPhone} />
      </View>

      <View style={styles.codeRow}>
        <TextInput style={styles.codeInput} placeholder="验证码" keyboardType="number-pad" maxLength={4} value={code} onChangeText={setCode} />
        <TouchableOpacity style={[styles.codeBtn, countdown > 0 && { backgroundColor: COLORS.divider }]} onPress={sendCode} disabled={countdown > 0 || phone.length !== 11}>
          <Text style={styles.codeBtnText}>{countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
        <Text style={styles.registerBtnText}>注册并登录</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={onSwitch}>
        <Text style={styles.linkText}>已有账号？去登录</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '300', color: COLORS.textPrimary, letterSpacing: 6, marginBottom: SPACING.sm },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  prefix: { fontSize: 16, color: COLORS.textSecondary, marginRight: 8 },
  phoneInput: { flex: 1, height: 50, fontSize: 16, color: COLORS.textPrimary },
  codeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  codeInput: { flex: 1, height: 50, backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: SPACING.md, fontSize: 16, marginRight: SPACING.sm },
  codeBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12 },
  codeBtnText: { color: '#fff', fontSize: 13 },
  registerBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: SPACING.lg, alignSelf: 'center' },
  linkText: { color: COLORS.textSecondary, fontSize: 14 },
});

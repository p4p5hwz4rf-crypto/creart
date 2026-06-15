import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS, SCREEN_GRADIENT, SHADOWS, SPACING } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ onSwitch }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const canSendCode = phone.length === 11 && countdown === 0;
  const canRegister = phone.length === 11 && code.length === 4;

  const sendCode = () => {
    if (!canSendCode) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleRegister = () => {
    if (canRegister) {
      login(phone);
    }
  };

  return (
    <LinearGradient colors={SCREEN_GRADIENT} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.brandBlock}>
            <View style={styles.brandMark}>
              <MaterialIcons name="favorite-border" size={28} color={COLORS.warm} />
            </View>
            <Text style={styles.kicker}>Welcome In</Text>
            <Text style={styles.title}>建立你的静修角落</Text>
            <Text style={styles.subtitle}>注册后可以保存音疗记录、幸福小事和个人目标。</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>手机号注册</Text>

            <View style={styles.inputWrap}>
              <MaterialIcons name="phone-iphone" size={20} color={COLORS.primary} />
              <Text style={styles.prefix}>+86</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="请输入手机号"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
                maxLength={11}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.codeRow}>
              <View style={[styles.inputWrap, styles.codeInputWrap]}>
                <MaterialIcons name="password" size={20} color={COLORS.primary} />
                <TextInput
                  style={styles.codeInput}
                  placeholder="验证码"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={code}
                  onChangeText={setCode}
                />
              </View>
              <TouchableOpacity
                style={[styles.codeBtn, !canSendCode && styles.codeBtnDisabled]}
                onPress={sendCode}
                disabled={!canSendCode}
                activeOpacity={0.8}
              >
                <Text style={[styles.codeBtnText, !canSendCode && styles.codeBtnTextDisabled]}>
                  {countdown > 0 ? `${countdown}秒` : '获取'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.registerBtn, !canRegister && styles.registerBtnDisabled]}
              onPress={handleRegister}
              disabled={!canRegister}
              activeOpacity={0.86}
            >
              <Text style={styles.registerBtnText}>注册并登录</Text>
              <MaterialIcons name="arrow-forward" size={18} color={COLORS.onPrimary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.link} onPress={onSwitch} activeOpacity={0.7}>
              <Text style={styles.linkText}>已有账号？去登录</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.containerMargin,
    paddingVertical: SPACING.xl,
  },
  brandBlock: {
    marginBottom: SPACING.xl,
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warmContainer,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  kicker: {
    fontSize: 12,
    fontFamily: FONT.semiBold,
    color: COLORS.warm,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 34,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginTop: SPACING.sm,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.09)',
    ...SHADOWS.figmaCard,
  },
  formTitle: {
    fontSize: 17,
    fontFamily: FONT.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  inputWrap: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.DEFAULT,
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.08)',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  prefix: {
    fontSize: 14,
    fontFamily: FONT.semiBold,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
  },
  phoneInput: {
    flex: 1,
    height: 52,
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.textPrimary,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  codeInputWrap: {
    flex: 1,
    marginBottom: 0,
  },
  codeInput: {
    flex: 1,
    height: 52,
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  codeBtn: {
    width: 72,
    height: 54,
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBtnDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  codeBtnText: {
    color: COLORS.onSecondary,
    fontSize: 13,
    fontFamily: FONT.semiBold,
  },
  codeBtnTextDisabled: {
    color: COLORS.textLight,
  },
  registerBtn: {
    minHeight: 54,
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    ...SHADOWS.figmaButton,
  },
  registerBtnDisabled: {
    opacity: 0.45,
  },
  registerBtnText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontFamily: FONT.semiBold,
  },
  link: {
    marginTop: SPACING.lg,
    alignSelf: 'center',
    paddingVertical: SPACING.sm,
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONT.medium,
  },
});

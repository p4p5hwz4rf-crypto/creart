import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Modal, Alert, Linking, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, SHADOWS, RADIUS, FONT } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import * as ImagePicker from 'expo-image-picker';
import {
  getGoals, saveGoal, removeGoal, getMonthStats, getMonthTotalTime,
} from '../storage';

const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ199MwR4pEsOeshKXcVtn4XZxqPiKs7dw9arXFcbShr5rFf0lS78jlFAcJgrY2M4yTtmWWj_QeOgB6gYF3xUxyjrTGxR_xIgpQEvacmPISHG1bmWd-aFzGlpfq6baUGHoGt-bn_lcHwS27I_ls6fz987RsuHWIOfboxFN4N-vCCtAzasqcvpfOoECBjzyQECvBJ7ZWhBhB3r1syO1AN1KZWdwTLVH0A1vSE7WBM3RAEn0RmF7ybczZWIhFqBtVDy8kdUtbmFk9A';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateName } = useAuth();
  const { getSubscriptionStatus, pay } = useSubscription();
  const [nameEditing, setNameEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [reportVisible, setReportVisible] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [subStatus, setSubStatus] = useState(null);
  const [payVisible, setPayVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
      loadReport();
      loadSubStatus();
    }, [])
  );

  const loadSubStatus = async () => {
    const status = await getSubscriptionStatus();
    setSubStatus(status);
  };

  const loadGoals = async () => {
    const g = await getGoals();
    setGoals(g);
  };

  const loadReport = async () => {
    const stats = await getMonthStats();
    const total = await getMonthTotalTime();
    const days = Object.keys(stats).length;
    const totalMin = Math.floor(total / 60);
    setReportData({ days, totalMin, stats });
  };

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    await saveGoal(newGoal.trim());
    setNewGoal('');
    loadGoals();
  };

  const handleRemoveGoal = async (goal) => {
    await removeGoal(goal);
    loadGoals();
  };

  const handleLogout = () => {
    Alert.alert('确认退出', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleFeedback = () => {
    if (!feedbackText.trim()) return;
    Linking.openURL(`mailto:feedback@calmtherapy.app?subject=意见反馈&body=${encodeURIComponent(feedbackText)}`);
    setFeedbackText('');
    setFeedbackVisible(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handlePay = async () => {
    await pay();
    setPayVisible(false);
    loadSubStatus();
    Alert.alert('支付成功', '下个月使用权已解锁！');
  };

  const MenuItem = ({ icon, label, onPress, badge }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIconBox}>
          <MaterialIcons name={icon} size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <MaterialIcons name="chevron-right" size={20} color={COLORS.primary} style={{ opacity: 0.5 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 顶部 Blur Header */}
        <BlurView intensity={30} tint="light" style={styles.header}>
          <View style={styles.headerInner}>
            <View style={styles.logoRow}>
              <MaterialIcons name="spa" size={20} color={COLORS.primary} />
              <Text style={styles.logoText}>Digital Sanctuary</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <MaterialIcons name="more-vert" size={22} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* 头像与名字 */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: avatar || AVATAR_URL }}
                style={styles.avatarImg}
              />
              <View style={styles.editBadge}>
                <MaterialIcons name="edit" size={14} color={COLORS.onPrimary} />
              </View>
            </View>
          </TouchableOpacity>

          {nameEditing ? (
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onBlur={() => {
                if (newName.trim()) updateName(newName.trim());
                setNameEditing(false);
              }}
              onSubmitEditing={() => {
                if (newName.trim()) updateName(newName.trim());
                setNameEditing(false);
              }}
            />
          ) : (
            <TouchableOpacity onPress={() => { setNewName(user?.name || ''); setNameEditing(true); }}>
              <Text style={styles.name}>{user?.name || '用户'}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.subtitle}>Seeking stillness since 2022</Text>
        </View>

        {/* 今年目标 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Year's Goals</Text>
          <View style={styles.chipRow}>
            {goals.map((g) => (
              <View key={g} style={styles.chip}>
                <Text style={styles.chipText}>{g}</Text>
                <TouchableOpacity onPress={() => handleRemoveGoal(g)} hitSlop={8}>
                  <Text style={styles.chipRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.chipInputWrap}>
              <TextInput
                style={styles.chipInput}
                placeholder="添加目标..."
                placeholderTextColor={COLORS.outline}
                value={newGoal}
                onChangeText={setNewGoal}
                onSubmitEditing={handleAddGoal}
              />
              <TouchableOpacity style={styles.chipAddBtn} onPress={handleAddGoal}>
                <MaterialIcons name="add" size={20} color={COLORS.onPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 菜单列表 */}
        <View style={styles.menuCard}>
          <MenuItem icon="chat-bubble-outline" label="Feedback" onPress={() => setFeedbackVisible(true)} />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="settings"
            label="Subscription"
            onPress={() => { if (!subStatus?.isActive) setPayVisible(true); }}
            badge={subStatus?.isActive ? 'Active' : null}
          />
          <View style={styles.menuDivider} />
          <MenuItem icon="library-books" label="Records" badge="12 entries" onPress={() => setReportVisible(true)} />
        </View>

        {/* 退出登录 */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>退出账号</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 月度报告弹窗 */}
      <Modal visible={reportVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>本月音疗报告</Text>
            {reportData && (
              <>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>使用次数</Text>
                  <Text style={styles.reportValue}>{reportData.days} 次</Text>
                </View>
                <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>总时长</Text>
                  <Text style={styles.reportValue}>{reportData.totalMin} 分钟</Text>
                </View>
                <View style={styles.reportEncourage}>
                  <Text style={styles.reportEncourageText}>
                    {reportData.totalMin > 0
                      ? `这个月你完成了${reportData.days}次音疗，累计${reportData.totalMin}分钟。坚持关照自己的身心，下个月继续加油！`
                      : '本月还没有音疗记录，从今天开始，给自己一段宁静的时光吧～'}
                  </Text>
                </View>
              </>
            )}
            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setReportVisible(false)}>
              <Text style={styles.modalPrimaryText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 付费弹窗 */}
      <Modal visible={payVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>解锁下月使用权</Text>
            <Text style={styles.payDesc}>
              {subStatus?.diaryCount >= 0
                ? `本月已记录幸福小事 ${subStatus.diaryCount} 次，还差 ${Math.max(0, 20 - subStatus.diaryCount)} 次即可免费续费`
                : '本月幸福小事记录不足20次'}
            </Text>
            <View style={styles.payPrice}>
              <Text style={styles.payPriceText}>9.9</Text>
              <Text style={styles.payPriceUnit}>元 / 月</Text>
            </View>
            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handlePay}>
              <Text style={styles.modalPrimaryText}>立即支付</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setPayVisible(false)}>
              <Text style={styles.modalSecondaryText}>稍后再说</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 反馈弹窗 */}
      <Modal visible={feedbackVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>意见反馈</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="请描述你遇到的问题或建议..."
              placeholderTextColor={COLORS.outline}
              value={feedbackText}
              onChangeText={setFeedbackText}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setFeedbackVisible(false)}>
                <Text style={styles.modalSecondaryText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryBtnSmall} onPress={handleFeedback}>
                <Text style={styles.modalPrimaryText}>发送</Text>
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
    paddingTop: 80,
    paddingBottom: SPACING.xxl,
  },
  // 顶部 Header
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
    borderBottomColor: 'rgba(114,121,115,0.06)',
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
  // 头像区域
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatarImg: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.full,
    borderWidth: 4,
    borderColor: COLORS.surfaceContainerHighest,
    ...SHADOWS.ambient,
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surfaceContainerLowest,
    ...SHADOWS.small,
  },
  name: {
    fontSize: 24,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  nameInput: {
    fontSize: 24,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
    borderBottomWidth: 1,
    borderColor: COLORS.outlineVariant,
    minWidth: 160,
    textAlign: 'center',
    paddingBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
    opacity: 0.8,
  },
  // 目标区域
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.secondary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    ...SHADOWS.small,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: COLORS.onSecondaryContainer,
  },
  chipRemove: {
    fontSize: 16,
    color: COLORS.onSecondaryContainer,
    marginLeft: 8,
    opacity: 0.6,
  },
  chipInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipInput: {
    height: 40,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.onSurface,
    minWidth: 120,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  chipAddBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    ...SHADOWS.small,
  },
  // 菜单卡片
  menuCard: {
    backgroundColor: 'rgba(238,245,242,0.6)',
    borderRadius: RADIUS.xl,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(73,100,85,0.05)',
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: RADIUS.lg,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: 'rgba(70,98,83,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(95,123,107,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginHorizontal: 16,
    opacity: 0.3,
  },
  // 退出登录
  logoutBtn: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(186,26,26,0.06)',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: FONT.medium,
    color: COLORS.error,
  },
  // 弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22,29,27,0.35)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.surfaceContainer,
  },
  reportLabel: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
  },
  reportValue: {
    fontSize: 16,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
  },
  reportEncourage: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  reportEncourageText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
  },
  modalPrimaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  modalPrimaryText: {
    color: COLORS.onPrimary,
    fontSize: 15,
    fontFamily: FONT.semiBold,
  },
  modalPrimaryBtnSmall: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: RADIUS.lg,
  },
  modalSecondaryBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  modalSecondaryText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    fontFamily: FONT.medium,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: SPACING.md,
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
  payDesc: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  payPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  payPriceText: {
    fontSize: 36,
    fontFamily: FONT.bold,
    color: COLORS.onSurface,
  },
  payPriceUnit: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurfaceVariant,
    marginLeft: 4,
  },
});

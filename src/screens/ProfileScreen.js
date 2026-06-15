import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Modal, Alert, Linking, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SHADOWS, RADIUS, FONT, SCREEN_GRADIENT } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import * as ImagePicker from 'expo-image-picker';
import {
  getGoals, saveGoal, removeGoal, getMonthStats, getMonthTotalTime,
  getMotto, saveMotto,
} from '../storage';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateName, updateAvatar } = useAuth();
  const { getSubscriptionStatus, pay } = useSubscription();
  const [nameEditing, setNameEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [reportVisible, setReportVisible] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [subStatus, setSubStatus] = useState(null);
  const [payVisible, setPayVisible] = useState(false);
  const [motto, setMotto] = useState('');
  const [mottoEditing, setMottoEditing] = useState(false);
  const [mottoDraft, setMottoDraft] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadGoals().catch(() => {});
      loadReport().catch(() => {});
      loadSubStatus().catch(() => {});
      loadMotto().catch(() => {});
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

  const loadMotto = async () => {
    const m = await getMotto();
    setMotto(m || '');
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
    Linking.openURL(`mailto:feedback@calmtherapy.app?subject=意见反馈&body=${encodeURIComponent(feedbackText)}`).catch(() => {});
    setFeedbackText('');
    setFeedbackVisible(false);
  };

  const handleSaveName = async () => {
    if (newName.trim()) {
      await updateName(newName.trim());
    }
    setNameEditing(false);
  };

  const handleSaveMotto = async () => {
    await saveMotto(mottoDraft.trim());
    setMotto(mottoDraft.trim());
    setMottoEditing(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        await updateAvatar(uri);
      }
    } catch (e) { /* 用户取消或权限拒绝 */ }
  };

  const handlePay = async () => {
    try {
      await pay();
      setPayVisible(false);
      loadSubStatus();
      Alert.alert('支付成功', '下个月使用权已解锁！');
    } catch (e) { /* storage write failed */ }
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

  const userAvatarUri = user?.avatarUri;

  return (
    <LinearGradient colors={SCREEN_GRADIENT} style={styles.container}>
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 顶部 Blur Header */}
        <BlurView intensity={30} tint="light" style={styles.header}>
          <View style={styles.headerInner}>
            <View style={styles.logoRow}>
              <MaterialIcons name="spa" size={20} color={COLORS.primary} />
              <Text style={styles.logoText}>心灵疗愈室——让情绪流动</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <MaterialIcons name="more-vert" size={22} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* 头像与名字 — 点击即修改，自动保存 */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
            <View style={styles.avatarWrap}>
              {userAvatarUri ? (
                <Image
                  source={{ uri: userAvatarUri }}
                  style={styles.avatarImg}
                />
              ) : (
                <LinearGradient
                  colors={[COLORS.primaryContainer, COLORS.tertiaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarImg}
                >
                  <MaterialIcons name="self-improvement" size={44} color={COLORS.primary} />
                </LinearGradient>
              )}
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
              onBlur={handleSaveName}
              onSubmitEditing={handleSaveName}
            />
          ) : (
            <TouchableOpacity onPress={() => { setNewName(user?.name || ''); setNameEditing(true); }}>
              <Text style={styles.name}>{user?.name || '用户'}</Text>
            </TouchableOpacity>
          )}

          {/* Item 8: 可编辑座右铭 */}
          {mottoEditing ? (
            <View style={styles.mottoEditRow}>
              <TextInput
                style={styles.mottoInput}
                value={mottoDraft}
                onChangeText={setMottoDraft}
                placeholder="输入座右铭..."
                placeholderTextColor={COLORS.outline}
                autoFocus
                onBlur={handleSaveMotto}
                onSubmitEditing={handleSaveMotto}
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => { setMottoDraft(motto); setMottoEditing(true); }}
              activeOpacity={0.7}
            >
              <Text style={styles.subtitle}>{motto || '点击添加座右铭'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 今年目标 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今年目标</Text>
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
          <MenuItem icon="chat-bubble-outline" label="意见反馈" onPress={() => setFeedbackVisible(true)} />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="settings"
            label="订阅会员"
            onPress={() => { if (!subStatus?.isActive) setPayVisible(true); }}
            badge={subStatus?.isActive ? '已激活' : null}
          />
          <View style={styles.menuDivider} />
          <MenuItem icon="library-books" label="使用记录" badge="12条记录" onPress={() => setReportVisible(true)} />
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

      {/* 反馈弹窗 — 无浅色底图 */}
      <Modal visible={feedbackVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackContent}>
            <Text style={styles.feedbackTitle}>意见反馈</Text>
            <TextInput
              style={styles.feedbackInput}
              multiline
              placeholder="请描述你遇到的问题或建议..."
              placeholderTextColor={COLORS.outline}
              value={feedbackText}
              onChangeText={setFeedbackText}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.feedbackCancelBtn} onPress={() => setFeedbackVisible(false)}>
                <Text style={styles.feedbackCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryBtnSmall} onPress={handleFeedback}>
                <Text style={styles.modalPrimaryText}>发送</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 80,
    paddingBottom: 138,
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
  // 头像区域
  profileHeader: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.08)',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.figmaCard,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatarImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.surfaceContainerHighest,
    ...SHADOWS.figmaAvatar,
    alignItems: 'center',
    justifyContent: 'center',
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
  // 座右铭编辑
  mottoEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  mottoInput: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.onSurface,
    borderBottomWidth: 1,
    borderColor: COLORS.outlineVariant,
    minWidth: 200,
    textAlign: 'center',
    paddingBottom: 2,
  },
  // 目标区域
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.secondary,
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
    borderRadius: RADIUS.DEFAULT,
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
    borderRadius: RADIUS.DEFAULT,
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
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    ...SHADOWS.small,
  },
  // 菜单卡片
  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: RADIUS.xl,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.08)',
    ...SHADOWS.figmaCard,
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
    backgroundColor: 'rgba(24,32,29,0.42)',
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
  // 反馈弹窗 — 无浅色背景
  feedbackContent: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  feedbackTitle: {
    fontSize: 18,
    fontFamily: FONT.semiBold,
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  feedbackInput: {
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
  feedbackCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  feedbackCancelText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    fontFamily: FONT.medium,
    opacity: 0.8,
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

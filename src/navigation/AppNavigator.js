import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Animated, Pressable, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import TherapyScreen from '../components/TherapyScreen';
import DiaryScreen from '../screens/DiaryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS, SHADOWS, RADIUS, FONT } from '../theme';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Therapy: {
    label: '音疗',
    icon: 'graphic-eq',
    inactiveIcon: 'graphic-eq',
  },
  Diary: {
    label: '日记',
    icon: 'edit-note',
    inactiveIcon: 'edit-note',
  },
  Profile: {
    label: '我的',
    icon: 'person',
    inactiveIcon: 'person-outline',
  },
};

function TabIcon({ focused, routeName }) {
  const config = TAB_CONFIG[routeName];
  if (!config) return null;

  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <MaterialIcons
        name={focused ? config.icon : config.inactiveIcon}
        size={22}
        color={focused ? COLORS.onPrimary : COLORS.onSurfaceVariant}
      />
      {focused && <Text style={styles.tabLabel}>{config.label}</Text>}
    </View>
  );
}

function TabBarButton({ onPress, children, style, accessibilityState }) {
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const focused = accessibilityState?.selected;

  const handlePressIn = () => {
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.14);
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      style={[style, styles.tabButtonWrap, focused && styles.tabButtonWrapActive]}
    >
      <Animated.View
        style={[
          styles.ripple,
          {
            transform: [{ scale: rippleScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 3] }) }],
            opacity: rippleOpacity,
          },
        ]}
      />
      {children}
    </Pressable>
  );
}

const tabBarBackground = () => (
  <View style={StyleSheet.absoluteFill}>
    <BlurView intensity={46} tint="light" style={StyleSheet.absoluteFill} />
    <View style={styles.tabBarTint} />
  </View>
);

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarBackground,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} routeName={route.name} />
        ),
        tabBarButton: (props) => <TabBarButton {...props} />,
      })}
    >
      <Tab.Screen name="Therapy" component={TherapyScreen} />
      <Tab.Screen name="Diary" component={DiaryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    left: 18,
    height: 74,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderTopWidth: 0,
    borderRadius: RADIUS.xxl,
    paddingHorizontal: 10,
    paddingBottom: 0,
    overflow: 'hidden',
    ...SHADOWS.figmaTabBar,
  },
  tabBarTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(247,251,247,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(79,122,100,0.08)',
    borderRadius: RADIUS.xxl,
  },
  tabButtonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 74,
  },
  tabButtonWrapActive: {
    flex: 1.25,
  },
  tabItem: {
    minWidth: 48,
    height: 46,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabItemActive: {
    minWidth: 92,
    paddingHorizontal: 14,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: FONT.semiBold,
    color: COLORS.onPrimary,
  },
  ripple: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryFixedDim,
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
    zIndex: 1,
  },
});

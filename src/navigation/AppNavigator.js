import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
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
    icon: 'music-note',
    inactiveIcon: 'music-note',
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

  const iconName = focused ? config.icon : config.inactiveIcon;
  // Figma 规范：Profile 页面活跃态用 primary 深绿，其他页面用 primaryFixed 浅绿
  const activeBg = routeName === 'Profile' ? COLORS.primary : COLORS.primaryFixed;
  const activeIconColor = routeName === 'Profile' ? COLORS.onPrimary : COLORS.onPrimaryFixedVariant;

  return (
    <View style={[styles.tabItem, focused && { backgroundColor: activeBg, ...SHADOWS.small }]}>
      <MaterialIcons
        name={iconName}
        size={22}
        color={focused ? activeIconColor : COLORS.onSurfaceVariant}
        style={{ opacity: focused ? 1 : 0.5 }}
      />
    </View>
  );
}

const tabBarBackground = () => (
  <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
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
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: 'rgba(244,251,248,0.5)',
    borderTopWidth: 0,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    ...SHADOWS.figmaTabBar,
    paddingHorizontal: 40,
    paddingBottom: 12,
    elevation: 0,
    overflow: 'hidden',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
  },
});

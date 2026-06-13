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

function TabBarButton({ onPress, children, style }) {
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.14);
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} style={[style, styles.tabButtonWrap]}>
      <Animated.View
        style={[
          styles.ripple,
          {
            transform: [{ scale: rippleScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 3.2] }) }],
            opacity: rippleOpacity,
          },
        ]}
      />
      {children}
    </Pressable>
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
  tabButtonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    zIndex: 2,
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

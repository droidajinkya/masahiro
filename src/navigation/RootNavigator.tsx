import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../constants/colors';
import { ScanScreen } from '../screens/ScanScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootTabParamList = {
  Scan: undefined;
  History: undefined;
  Saved: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

type TabIconName =
  | 'scan'
  | 'scan-outline'
  | 'time'
  | 'time-outline'
  | 'bookmark'
  | 'bookmark-outline'
  | 'settings'
  | 'settings-outline';

interface TabConfig {
  name: keyof RootTabParamList;
  label: string;
  icon: TabIconName;
  activeIcon: TabIconName;
}

const TAB_CONFIG: TabConfig[] = [
  { name: 'Scan', label: 'Scan', icon: 'scan-outline', activeIcon: 'scan' },
  { name: 'History', label: 'History', icon: 'time-outline', activeIcon: 'time' },
  { name: 'Saved', label: 'Saved', icon: 'bookmark-outline', activeIcon: 'bookmark' },
  { name: 'Settings', label: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
];

export function RootNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const tabConfig = TAB_CONFIG.find((t) => t.name === route.name)!;
          return {
            headerShown: false,
            tabBarActiveTintColor: Colors.tabBarActive,
            tabBarInactiveTintColor: Colors.tabBarInactive,
            tabBarStyle: {
              backgroundColor: Colors.tabBarBackground,
              borderTopColor: Colors.tabBarBorder,
              borderTopWidth: 1,
              paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
              paddingTop: 8,
              height: Platform.OS === 'ios' ? 72 + insets.bottom : 64,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '500',
              marginTop: 2,
            },
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tabConfig.activeIcon : tabConfig.icon}
                size={size}
                color={color}
              />
            ),
          };
        }}
      >
        {TAB_CONFIG.map((tab) => {
          const Screen = SCREEN_MAP[tab.name];
          return (
            <Tab.Screen
              key={tab.name}
              name={tab.name}
              component={Screen}
              options={{ tabBarLabel: tab.label }}
            />
          );
        })}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const SCREEN_MAP: Record<keyof RootTabParamList, React.ComponentType<any>> = {
  Scan: ScanScreen,
  History: HistoryScreen,
  Saved: SavedScreen,
  Settings: SettingsScreen,
};

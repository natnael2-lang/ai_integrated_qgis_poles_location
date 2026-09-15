import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import CaptureHomeScreen from '../screens/CaptureHomeScreen';
import PoleCaptureScreen from '../screens/PoleCaptureScreen';
import AreaCaptureScreen from '../screens/AreaCaptureScreen';
import LineCaptureScreen from '../screens/LineCaptureScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const CaptureStack = createNativeStackNavigator();

function CaptureStackNavigator() {
  return (
    <CaptureStack.Navigator>
      <CaptureStack.Screen name="CaptureHome" component={CaptureHomeScreen} options={{ title: 'Capture' }} />
      <CaptureStack.Screen name="PoleCapture" component={PoleCaptureScreen} options={{ title: 'Pole' }} />
      <CaptureStack.Screen name="AreaCapture" component={AreaCaptureScreen} options={{ title: 'Farm Area' }} />
      <CaptureStack.Screen name="LineCapture" component={LineCaptureScreen} options={{ title: 'Cable / Fiber Line' }} />
    </CaptureStack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1f3864',
        tabBarIcon: ({ color, size }) => {
          const icons = {
            CaptureTab: 'add-circle-outline',
            History: 'time-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="CaptureTab" component={CaptureStackNavigator} options={{ title: 'Capture' }} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

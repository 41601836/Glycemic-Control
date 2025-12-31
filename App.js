import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// 导入页面组件
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import FoodResultScreen from './src/screens/FoodResultScreen';
import BloodSugarScreen from './src/screens/BloodSugarScreen';
import ReportScreen from './src/screens/ReportScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 底部导航栈
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === '首页') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === '相机') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === '血糖记录') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === '报告') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1E88E5',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="首页" component={HomeScreen} />
      <Tab.Screen name="相机" component={CameraScreen} />
      <Tab.Screen name="血糖记录" component={BloodSugarScreen} />
      <Tab.Screen name="报告" component={ReportScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 底部导航作为主栈 */}
        <Stack.Screen name="Main" component={TabNavigator} />
        {/* 识别结果页面，从相机页面跳转 */}
        <Stack.Screen name="识别结果" component={FoodResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


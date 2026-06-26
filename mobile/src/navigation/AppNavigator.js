import React, { useContext } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OwnerRestaurantsScreen from '../screens/OwnerRestaurantsScreen';
import EditRestaurantScreen from '../screens/EditRestaurantScreen';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { userToken } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        }
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ 
          title: 'Home',
          tabBarIconStyle: { display: 'none' }, 
          tabBarLabelPosition: 'beside-icon' 
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ 
          title: 'Profile',
          tabBarIconStyle: { display: 'none' }, 
          tabBarLabelPosition: 'beside-icon' 
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!userToken) {
              e.preventDefault();
              Alert.alert(
                "Login Required",
                "You need to log in to view your profile. Do you want to log in now?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Log In", onPress: () => navigation.navigate('Login') }
                ]
              );
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const { isLoading } = useContext(AuthContext);
  const { colors, isDarkMode } = useContext(ThemeContext);

  const baseTheme = isDarkMode ? DarkTheme : DefaultTheme;
  const MyTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Main App (Visible to everyone) */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Restaurant" component={RestaurantScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="OwnerRestaurants" component={OwnerRestaurantsScreen} />
        <Stack.Screen name="EditRestaurant" component={EditRestaurantScreen} />
        
        {/* Auth Screens (Stacked on top when needed) */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

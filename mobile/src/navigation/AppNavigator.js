import React, { useContext } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

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
  const { userToken, userRole } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  if (userRole === 'restaurant_owner') {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#009DE0',
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'OwnerRestaurantsTab') iconName = focused ? 'restaurant' : 'restaurant-outline';
            else if (route.name === 'AddRestaurantTab') iconName = focused ? 'add-circle' : 'add-circle-outline';
            else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        })}
      >
        <Tab.Screen name="OwnerRestaurantsTab" component={OwnerRestaurantsScreen} options={{ title: 'My Restaurants' }} />
        <Tab.Screen name="AddRestaurantTab" component={EditRestaurantScreen} options={{ title: 'Add Restaurant' }} />
        <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#009DE0',
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'OrdersTab') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen 
        name="OrdersTab" 
        component={OrdersScreen} 
        options={{ title: 'Orders' }} 
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!userToken) {
              e.preventDefault();
              Alert.alert(
                "Login Required",
                "You need to log in to view your orders. Do you want to log in now?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Log In", onPress: () => navigation.navigate('Login') }
                ]
              );
            }
          },
        })}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
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

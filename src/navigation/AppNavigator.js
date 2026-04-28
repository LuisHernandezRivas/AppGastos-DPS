import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Pantalla de Login */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        
        {/* Pantalla de Inicio */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={({ navigation }) => ({ 
            title: 'Mi Resumen',
            headerBackVisible: false, 
            headerRight: () => (
              <TouchableOpacity 
                onPress={() => navigation.replace('Login')}
              >
                <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
              </TouchableOpacity>
            ),
          })} 
        />
        
        {/* Pantalla de Agregar Gasto */}
        <Stack.Screen 
          name="AddExpense" 
          component={AddExpenseScreen} 
          options={{ title: 'Nuevo Gasto' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
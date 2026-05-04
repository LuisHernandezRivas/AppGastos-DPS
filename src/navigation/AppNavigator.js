import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Observar el estado de autenticación en tiempo real
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe; // Limpieza del listener al desmontar
  }, []);

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Mostrar indicador de carga mientras verifica autenticación
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'Home' : 'Login'}
        screenOptions={{
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {/* Pantallas de autenticación (solo si NO hay sesión) */}
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            {/* Pantalla principal */}
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Mis Gastos',
                headerBackVisible: false,
                headerRight: () => (
                  <TouchableOpacity onPress={handleLogout} style={{ marginRight: 4 }}>
                    <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
                  </TouchableOpacity>
                ),
              }}
            />

            {/* Pantalla de agregar gasto */}
            <Stack.Screen
              name="AddExpense"
              component={AddExpenseScreen}
              options={{ title: 'Nuevo Gasto' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

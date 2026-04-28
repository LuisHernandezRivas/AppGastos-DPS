import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function LoginScreen({ navigation }) {
  // Estados para manejar el correo electrónico y la contraseña ingresados por el usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

// Aquí es donde se implementaría la lógica de autenticación real
  function handleEmailLogin() {
    navigation.navigate('Home');
  }

  // Aquí es donde se implementaría la lógica de autenticación con Google
  function handleGoogleLogin() {
    console.log("Intentando iniciar sesión con Google");

    navigation.navigate('Home');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AppGastos</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput 
          style={styles.input}
          placeholder="correo@dominio.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>Contraseña</Text>
        <TextInput 
          style={styles.input}
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true} 
        />

    {/* Botón de inicio de sesión */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleEmailLogin}>
          <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.separatorContainer}>
        <View style={styles.line} />
        <Text style={styles.separatorText}>O ingresa con</Text>
        <View style={styles.line} />
      </View>

    {/* Botón de inicio de sesión con Google */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <View style={styles.googleButtonContent}>
          <MaterialCommunityIcons 
            name="google"     
            size={22}        
            color="#5F6368"  
            style={styles.googleIcon} 
          />
          <Text style={styles.googleButtonText}>Continuar con Google</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Estilos para LoginScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  separatorText: {
    marginHorizontal: 15,
    color: '#6B7280',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
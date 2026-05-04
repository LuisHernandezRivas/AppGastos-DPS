import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Validaciones ────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Ingresa un correo válido.';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Inicio de sesión con correo ──────────────────────────────
  const handleEmailLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // La navegación se maneja automaticamente por onAuthStateChanged en el AppNavigator
    } catch (error) {
      let message = 'Ocurrió un error. Inténtalo de nuevo.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Correo o contraseña incorrectos.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Demasiados intentos. Intenta más tarde.';
      }
      Alert.alert('Error de autenticación', message);
    } finally {
      setLoading(false);
    }
  };

  // ── Inicio de sesión con Google 
  //Google Sign-In en Expo requiere expo-auth-session o @react-native-google-signin/google-signin
  // Se deja el boton preparado para una integracion a futuro.
  const handleGoogleLogin = () => {
    Alert.alert(
      'Google Sign-In',
      'Para habilitar el inicio con Google:\n\n1. Instala expo-auth-session\n2. Configura el clientId en Google Cloud Console\n3. Implementa GoogleAuthProvider en firebase.js\n\nPor ahora usa correo y contraseña.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo y título */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="wallet" size={40} color="#6366F1" />
          </View>
          <Text style={styles.title}>AppGastos</Text>
          <Text style={styles.subtitle}>Controla tus finanzas personales</Text>
        </View>

        {/* Formulario */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>

          {/* Campo Correo */}
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="correo@dominio.com"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={(text) => { setEmail(text); setErrors(e => ({ ...e, email: '' })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* Campo Contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={(text) => { setPassword(text); setErrors(e => ({ ...e, password: '' })); }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Botón principal */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
            }
          </TouchableOpacity>

          {/* Ir a Registro */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Separador */}
        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>O ingresa con</Text>
          <View style={styles.line} />
        </View>

        {/* Botón Google */}
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <MaterialCommunityIcons name="google" size={22} color="#5F6368" />
          <Text style={styles.googleButtonText}>Continuar con Google</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0F172A' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: '#334155',
  },
  title: { fontSize: 30, fontWeight: '800', color: '#F8FAFC', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 6 },
  card: { backgroundColor: '#1E293B', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#F8FAFC', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155',
    borderRadius: 10, paddingHorizontal: 14, marginBottom: 6,
  },
  inputError: { borderColor: '#EF4444' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#F8FAFC', fontSize: 15, paddingVertical: 13 },
  errorText: { fontSize: 12, color: '#EF4444', marginBottom: 10, marginLeft: 2 },
  primaryButton: {
    backgroundColor: '#6366F1', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  registerText: { color: '#64748B', fontSize: 14 },
  registerLink: { color: '#6366F1', fontSize: 14, fontWeight: '700' },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#334155' },
  separatorText: { marginHorizontal: 12, color: '#64748B', fontSize: 13 },
  googleButton: {
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
    borderRadius: 10, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  googleButtonText: { color: '#CBD5E1', fontSize: 15, fontWeight: '600' },
});

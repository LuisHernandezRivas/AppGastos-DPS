import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Validaciones ─────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
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
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Registro ─────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Guardar el nombre en el perfil del usuario
      await updateProfile(userCredential.user, { displayName: nombre.trim() });
      // onAuthStateChanged en AppNavigator redirige automáticamente
    } catch (error) {
      let message = 'No se pudo crear la cuenta.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este correo ya está registrado.';
      }
      Alert.alert('Error de registro', message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon, value, onChange, placeholder, keyboardType, secure, errorKey, extra }) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, errors[errorKey] && styles.inputError]}>
        <MaterialCommunityIcons name={icon} size={20} color="#94A3B8" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          value={value}
          onChangeText={(t) => { onChange(t); setErrors(e => ({ ...e, [errorKey]: '' })); }}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="none"
          secureTextEntry={secure && !showPassword}
        />
        {extra}
      </View>
      {errors[errorKey] ? <Text style={styles.errorText}>{errors[errorKey]}</Text> : null}
    </>
  );

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="account-plus" size={36} color="#6366F1" />
          </View>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para comenzar</Text>
        </View>

        <View style={styles.card}>
          <Field label="Nombre completo" icon="account-outline" value={nombre} onChange={setNombre} placeholder="Tu nombre" errorKey="nombre" />
          <Field label="Correo Electrónico" icon="email-outline" value={email} onChange={setEmail} placeholder="correo@dominio.com" keyboardType="email-address" errorKey="email" />

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors(e => ({ ...e, password: '' })); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <Field label="Confirmar contraseña" icon="lock-check-outline" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repite tu contraseña" secure errorKey="confirmPassword" />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Crear Cuenta</Text>}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0F172A' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#334155' },
  title: { fontSize: 26, fontWeight: '800', color: '#F8FAFC' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  card: { backgroundColor: '#1E293B', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#334155' },
  label: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 8, marginTop: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 10, paddingHorizontal: 14, marginBottom: 6 },
  inputError: { borderColor: '#EF4444' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#F8FAFC', fontSize: 15, paddingVertical: 13 },
  errorText: { fontSize: 12, color: '#EF4444', marginBottom: 8, marginLeft: 2 },
  primaryButton: { backgroundColor: '#6366F1', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  loginText: { color: '#64748B', fontSize: 14 },
  loginLink: { color: '#6366F1', fontSize: 14, fontWeight: '700' },
});

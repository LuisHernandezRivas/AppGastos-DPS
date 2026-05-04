import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ── Categorías disponibles ───────────────────────────────────
const CATEGORIAS = [
  { label: 'Comida',          icon: 'food',           color: '#F97316' },
  { label: 'Transporte',      icon: 'car',            color: '#3B82F6' },
  { label: 'Entretenimiento', icon: 'movie-open',     color: '#A855F7' },
  { label: 'Salud',           icon: 'medical-bag',    color: '#EF4444' },
  { label: 'Educación',       icon: 'school',         color: '#10B981' },
  { label: 'Ropa',            icon: 'tshirt-crew',    color: '#EC4899' },
  { label: 'Servicios',       icon: 'lightning-bolt', color: '#EAB308' },
  { label: 'Hogar',           icon: 'home',           color: '#14B8A6' },
  { label: 'Otros',           icon: 'dots-horizontal',color: '#64748B' },
];

export default function AddExpenseScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [fecha, setFecha] = useState(formatDate(new Date())); // Fecha de hoy por defecto
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Helpers ──────────────────────────────────────────────────
  function formatDate(d) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function parseDate(str) {
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts.map(Number);
    if (!dd || !mm || !yyyy || dd > 31 || mm > 12 || yyyy < 2000) return null;
    return new Date(yyyy, mm - 1, dd);
  }

  // ── Validaciones ─────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre del gasto es obligatorio.';
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres.';
    }

    if (!monto) {
      newErrors.monto = 'El monto es obligatorio.';
    } else if (isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      newErrors.monto = 'Ingresa un monto válido mayor a 0.';
    }

    if (!categoriaSeleccionada) {
      newErrors.categoria = 'Selecciona una categoría.';
    }

    const fechaObj = parseDate(fecha);
    if (!fecha) {
      newErrors.fecha = 'La fecha es obligatoria.';
    } else if (!fechaObj) {
      newErrors.fecha = 'Formato inválido. Usa DD/MM/AAAA.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Guardar en Firestore ─────────────────────────────────────
  const handleGuardar = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No hay sesión activa.');

      const fechaObj = parseDate(fecha);

      await addDoc(collection(db, 'gastos'), {
        userId: user.uid,
        nombre: nombre.trim(),
        monto: parseFloat(parseFloat(monto).toFixed(2)),
        categoria: categoriaSeleccionada,
        fecha: fecha,                          // Texto legible
        fechaTimestamp: Timestamp.fromDate(fechaObj), // Para consultas y ordenamiento
        creadoEn: Timestamp.now(),
      });

      Alert.alert('¡Guardado!', 'Tu gasto fue registrado correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error guardando gasto:', error);
      Alert.alert('Error', 'No se pudo guardar el gasto. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* ── Nombre ── */}
        <Text style={styles.label}>Nombre del Gasto</Text>
        <View style={[styles.inputWrapper, errors.nombre && styles.inputError]}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ej. Supermercado"
            placeholderTextColor="#64748B"
            value={nombre}
            onChangeText={(t) => { setNombre(t); setErrors(e => ({ ...e, nombre: '' })); }}
            maxLength={50}
          />
        </View>
        {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}

        {/* ── Monto ── */}
        <Text style={styles.label}>Monto ($)</Text>
        <View style={[styles.inputWrapper, errors.monto && styles.inputError]}>
          <MaterialCommunityIcons name="currency-usd" size={20} color="#94A3B8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#64748B"
            value={monto}
            onChangeText={(t) => { setMonto(t); setErrors(e => ({ ...e, monto: '' })); }}
            keyboardType="decimal-pad"
            maxLength={10}
          />
        </View>
        {errors.monto ? <Text style={styles.errorText}>{errors.monto}</Text> : null}

        {/* ── Fecha ── */}
        <Text style={styles.label}>Fecha (DD/MM/AAAA)</Text>
        <View style={[styles.inputWrapper, errors.fecha && styles.inputError]}>
          <MaterialCommunityIcons name="calendar" size={20} color="#94A3B8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#64748B"
            value={fecha}
            onChangeText={(t) => { setFecha(t); setErrors(e => ({ ...e, fecha: '' })); }}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
        </View>
        {errors.fecha ? <Text style={styles.errorText}>{errors.fecha}</Text> : null}

        {/* ── Categoría ── */}
        <Text style={styles.label}>Categoría</Text>
        {errors.categoria ? <Text style={[styles.errorText, { marginBottom: 8 }]}>{errors.categoria}</Text> : null}
        <View style={styles.categoriesGrid}>
          {CATEGORIAS.map((cat) => {
            const isSelected = categoriaSeleccionada === cat.label;
            return (
              <TouchableOpacity
                key={cat.label}
                style={[
                  styles.categoryChip,
                  isSelected && { backgroundColor: cat.color + '33', borderColor: cat.color }
                ]}
                onPress={() => { setCategoriaSeleccionada(cat.label); setErrors(e => ({ ...e, categoria: '' })); }}
              >
                <MaterialCommunityIcons name={cat.icon} size={18} color={isSelected ? cat.color : '#64748B'} />
                <Text style={[styles.categoryLabel, isSelected && { color: cat.color }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Botón guardar ── */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleGuardar}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : (
              <View style={styles.saveButtonContent}>
                <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>Guardar Gasto</Text>
              </View>
            )
          }
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0F172A' },
  container: { padding: 24, paddingBottom: 50 },
  label: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 8, marginTop: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
    borderRadius: 12, paddingHorizontal: 14, marginBottom: 6,
  },
  inputError: { borderColor: '#EF4444' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#F8FAFC', fontSize: 15, paddingVertical: 14 },
  errorText: { fontSize: 12, color: '#EF4444', marginBottom: 8 },

  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28, marginTop: 4 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155',
  },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },

  saveButton: { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  saveButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

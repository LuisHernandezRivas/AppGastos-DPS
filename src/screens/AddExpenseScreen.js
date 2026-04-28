import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function AddExpenseScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fecha, setFecha] = useState('');

  function handleGuardarGasto() {
   // Aquí es donde se implementaría la lógica para guardar el gasto en una base de datos o estado global.
    console.log("Guardando gasto:", { nombre, monto, categoria, fecha });
    

    navigation.goBack();
  }

  return (
    // Contenedor principal de la pantalla
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Gasto</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Nombre del Gasto</Text>
        <TextInput 
          style={styles.input}
          placeholder="Ej. Supermercado"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Monto ($)</Text>
        <TextInput 
          style={styles.input}
          placeholder="0.00"
          value={monto}
          onChangeText={setMonto}
          keyboardType="numeric" 
        />

        <Text style={styles.label}>Categoría</Text>
        <TextInput 
          style={styles.input}
          placeholder="Ej. Comida, Transporte..."
          value={categoria}
          onChangeText={setCategoria}
        />

        <Text style={styles.label}>Fecha</Text>
        <TextInput 
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={fecha}
          onChangeText={setFecha}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleGuardarGasto}>
          <Text style={styles.primaryButtonText}>Guardar Gasto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
// Estilos para AddExpenseScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    elevation: 2, 
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
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
  }
});
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Datos de ejemplo para mostrar en el historial de gastos
const GASTOS_EJEMPLO = [
  { id: '1', titulo: 'Supermercado', monto: 85.50, categoria: 'Comida', fecha: '24 Oct' },
  { id: '2', titulo: 'Gasolina', monto: 40.00, categoria: 'Transporte', fecha: '23 Oct' },
  { id: '3', titulo: 'Netflix', monto: 12.99, categoria: 'Entretenimiento', fecha: '20 Oct' },
];

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
  {/* Tarjeta de saldo */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Gastado (Octubre)</Text>
        <Text style={styles.balanceAmount}>$138.49</Text>
      </View>

  {/* Encabezado del historial */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Historial de Gastos</Text>
        <TouchableOpacity>
          <Text style={styles.filterLink}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
      // datos de ejemplo para mostrar en el historial de gastos
        data={GASTOS_EJEMPLO}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="cart-outline" size={24} color="#2563EB" />
            </View>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseText}>{item.titulo}</Text>
              <Text style={styles.expenseDate}>{item.fecha} • {item.categoria}</Text>
            </View>
            <Text style={styles.expenseAmount}>-${item.monto.toFixed(2)}</Text>
          </View>
        )}
      />
      {/* Boton flotante para agregar gasto */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddExpense')}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}
// Estilos para HomeScreen
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  balanceCard: {
    backgroundColor: '#2563EB',
    padding: 30,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 5, 
  },
  balanceLabel: { color: '#BFDBFE', fontSize: 16 },
  balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginTop: 5 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  filterLink: { color: '#2563EB', fontWeight: 'bold' },
  expenseItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  expenseInfo: { flex: 1, marginLeft: 15 },
  expenseText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  expenseDate: { fontSize: 12, color: '#6B7280' },
  expenseAmount: { fontSize: 16, fontWeight: 'bold', color: '#EF4444' },
  fab: { // Botón flotante para agregar gasto
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2563EB',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }
});
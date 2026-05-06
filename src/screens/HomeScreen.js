import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Modal, ScrollView, Pressable
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  collection, query, where, orderBy, onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Categorías 
const CATEGORIAS = [
  { label: 'Comida',          icon: 'food',            color: '#F97316' },
  { label: 'Transporte',      icon: 'car',             color: '#3B82F6' },
  { label: 'Entretenimiento', icon: 'movie-open',      color: '#A855F7' },
  { label: 'Salud',           icon: 'medical-bag',     color: '#EF4444' },
  { label: 'Educación',       icon: 'school',          color: '#10B981' },
  { label: 'Ropa',            icon: 'tshirt-crew',     color: '#EC4899' },
  { label: 'Servicios',       icon: 'lightning-bolt',  color: '#EAB308' },
  { label: 'Hogar',           icon: 'home',            color: '#14B8A6' },
  { label: 'Otros',           icon: 'dots-horizontal', color: '#64748B' },
];

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

function getCatMeta(label) {
  return CATEGORIAS.find(c => c.label === label) || CATEGORIAS[CATEGORIAS.length - 1];
}

export default function HomeScreen({ navigation }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const now = new Date();
  const [mesFiltro, setMesFiltro] = useState(now.getMonth()); // 0-11
  const [anioFiltro, setAnioFiltro] = useState(now.getFullYear());
  const [catFiltro, setCatFiltro] = useState('Todas');

  // Modales
  const [showMesModal, setShowMesModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);

  // Suscripción a Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    const q = query(
      collection(db, 'gastos'),
      where('userId', '==', user.uid),
      orderBy('fechaTimestamp', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGastos(data);
      setLoading(false);
    }, (err) => {
      console.error('Firestore error:', err);
      setLoading(false);
    });

    return unsub;
  }, []);

  // Filtrado 
  const gastosFiltrados = gastos.filter(g => {
    const ts = g.fechaTimestamp?.toDate?.() ?? null;
    if (!ts) return false;
    const mismoMes = ts.getMonth() === mesFiltro && ts.getFullYear() === anioFiltro;
    const mismacat = catFiltro === 'Todas' || g.categoria === catFiltro;
    return mismoMes && mismacat;
  });

  // Total del mes (sin filtro de categoría para mostrar el real)
  const totalMes = gastos
    .filter(g => {
      const ts = g.fechaTimestamp?.toDate?.() ?? null;
      return ts && ts.getMonth() === mesFiltro && ts.getFullYear() === anioFiltro;
    })
    .reduce((acc, g) => acc + (g.monto ?? 0), 0);

  // Resumen por categoría (mes seleccionado)
  const resumenCats = CATEGORIAS.map(cat => {
    const total = gastos
      .filter(g => {
        const ts = g.fechaTimestamp?.toDate?.() ?? null;
        return ts && ts.getMonth() === mesFiltro && ts.getFullYear() === anioFiltro
          && g.categoria === cat.label;
      })
      .reduce((s, g) => s + (g.monto ?? 0), 0);
    return { ...cat, total };
  }).filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total);

  // Navegar entre meses 
  const cambiarMes = useCallback((dir) => {
    setMesFiltro(prev => {
      let m = prev + dir;
      let a = anioFiltro;
      if (m < 0)  { m = 11; a -= 1; }
      if (m > 11) { m = 0;  a += 1; }
      setAnioFiltro(a);
      return m;
    });
  }, [anioFiltro]);

  // Render item 
  const renderItem = ({ item }) => {
    const cat = getCatMeta(item.categoria);
    return (
      <View style={styles.expenseItem}>
        <View style={[styles.iconCircle, { backgroundColor: cat.color + '22' }]}>
          <MaterialCommunityIcons name={cat.icon} size={22} color={cat.color} />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseName} numberOfLines={1}>{item.nombre}</Text>
          <View style={styles.expenseMeta}>
            <View style={[styles.catBadge, { backgroundColor: cat.color + '22' }]}>
              <Text style={[styles.catBadgeText, { color: cat.color }]}>{item.categoria}</Text>
            </View>
            <Text style={styles.expenseDate}>{item.fecha}</Text>
          </View>
        </View>
        <Text style={styles.expenseAmount}>-${item.monto?.toFixed(2)}</Text>
      </View>
    );
  };

  // Header del FlatList 
  const ListHeader = () => (
    <>
      {/* Tarjeta de total */}
      <View style={styles.balanceCard}>
        <View style={styles.mesNav}>
          <TouchableOpacity onPress={() => cambiarMes(-1)} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-left" size={26} color="#CBD5E1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMesModal(true)}>
            <Text style={styles.mesLabel}>{MESES[mesFiltro]} {anioFiltro}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => cambiarMes(1)} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-right" size={26} color="#CBD5E1" />
          </TouchableOpacity>
        </View>
        <Text style={styles.totalSubLabel}>Total gastado</Text>
        <Text style={styles.totalAmount}>${totalMes.toFixed(2)}</Text>
        <Text style={styles.totalCount}>{gastosFiltrados.length} gasto{gastosFiltrados.length !== 1 ? 's' : ''} en el período</Text>
      </View>

      {/* Resumen por categoría */}
      {resumenCats.length > 0 && (
        <View style={styles.catResumenContainer}>
          <Text style={styles.sectionTitle}>Por categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {resumenCats.map(cat => (
              <TouchableOpacity
                key={cat.label}
                style={[
                  styles.catResumenChip,
                  catFiltro === cat.label && { borderColor: cat.color, backgroundColor: cat.color + '18' }
                ]}
                onPress={() => setCatFiltro(prev => prev === cat.label ? 'Todas' : cat.label)}
              >
                <MaterialCommunityIcons name={cat.icon} size={16} color={cat.color} />
                <Text style={[styles.catResumenLabel, catFiltro === cat.label && { color: cat.color }]}>
                  {cat.label}
                </Text>
                <Text style={[styles.catResumenMonto, catFiltro === cat.label && { color: cat.color }]}>
                  ${cat.total.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Barra de filtros */}
      <View style={styles.filterBar}>
        <Text style={styles.sectionTitle}>
          {catFiltro === 'Todas' ? 'Todos los gastos' : catFiltro}
        </Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowCatModal(true)}>
          <MaterialCommunityIcons name="filter-variant" size={16} color="#6366F1" />
          <Text style={styles.filterBtnText}>
            {catFiltro === 'Todas' ? 'Filtrar' : catFiltro}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // Empty state 
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="wallet-outline" size={52} color="#334155" />
      <Text style={styles.emptyTitle}>Sin gastos</Text>
      <Text style={styles.emptySubtitle}>
        {catFiltro !== 'Todas'
          ? `No hay gastos en "${catFiltro}" este mes.`
          : 'No registraste gastos en este período.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Cargando gastos…</Text>
        </View>
      ) : (
        <FlatList
          data={gastosFiltrados}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Modal selección de mes */}
      <Modal visible={showMesModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowMesModal(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Seleccionar mes</Text>
            <ScrollView>
              {MESES.map((m, i) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modalItem, i === mesFiltro && styles.modalItemActive]}
                  onPress={() => { setMesFiltro(i); setShowMesModal(false); }}
                >
                  <Text style={[styles.modalItemText, i === mesFiltro && styles.modalItemTextActive]}>
                    {m} {anioFiltro}
                  </Text>
                  {i === mesFiltro && <MaterialCommunityIcons name="check" size={18} color="#6366F1" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Modal filtro de categoría */}
      <Modal visible={showCatModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowCatModal(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Filtrar por categoría</Text>
            <TouchableOpacity
              style={[styles.modalItem, catFiltro === 'Todas' && styles.modalItemActive]}
              onPress={() => { setCatFiltro('Todas'); setShowCatModal(false); }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="all-inclusive" size={18} color="#6366F1" />
                <Text style={[styles.modalItemText, catFiltro === 'Todas' && styles.modalItemTextActive]}>
                  Todas las categorías
                </Text>
              </View>
              {catFiltro === 'Todas' && <MaterialCommunityIcons name="check" size={18} color="#6366F1" />}
            </TouchableOpacity>
            {CATEGORIAS.map(cat => (
              <TouchableOpacity
                key={cat.label}
                style={[styles.modalItem, catFiltro === cat.label && styles.modalItemActive]}
                onPress={() => { setCatFiltro(cat.label); setShowCatModal(false); }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <MaterialCommunityIcons name={cat.icon} size={18} color={cat.color} />
                  <Text style={[styles.modalItemText, catFiltro === cat.label && styles.modalItemTextActive]}>
                    {cat.label}
                  </Text>
                </View>
                {catFiltro === cat.label && <MaterialCommunityIcons name="check" size={18} color="#6366F1" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  listContent: { padding: 20, paddingBottom: 100 },

  // Loading
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontSize: 14 },

  // Balance card
  balanceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  mesNav: {
    flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16,
  },
  mesLabel: {
    fontSize: 16, fontWeight: '700', color: '#F8FAFC', minWidth: 160, textAlign: 'center',
  },
  totalSubLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  totalAmount: { fontSize: 42, fontWeight: '800', color: '#F8FAFC', letterSpacing: -1 },
  totalCount: { fontSize: 12, color: '#475569', marginTop: 6 },

  // Categoria resumen
  catResumenContainer: { marginBottom: 20 },
  catScroll: { marginTop: 10 },
  catResumenChip: {
    flexDirection: 'column', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, backgroundColor: '#1E293B',
    borderWidth: 1, borderColor: '#334155', marginRight: 10,
  },
  catResumenLabel: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  catResumenMonto: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },

  // Filter bar
  filterBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1E293B', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#334155',
  },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: '#6366F1' },

  // Expense item
  expenseItem: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  expenseInfo: { flex: 1 },
  expenseName: { fontSize: 15, fontWeight: '600', color: '#F1F5F9', marginBottom: 5 },
  expenseMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  expenseDate: { fontSize: 11, color: '#475569' },
  expenseAmount: { fontSize: 16, fontWeight: '700', color: '#EF4444' },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 50, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155' },
  emptySubtitle: { fontSize: 13, color: '#475569', textAlign: 'center', maxWidth: 240 },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: '#6366F1',
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },

  // Modals
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modal: {
    backgroundColor: '#1E293B', borderRadius: 20, width: '100%',
    maxHeight: '70%', padding: 20, borderWidth: 1, borderColor: '#334155',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#F8FAFC', marginBottom: 16 },
  modalItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 12,
    borderRadius: 10, marginBottom: 4,
  },
  modalItemActive: { backgroundColor: '#6366F115' },
  modalItemText: { fontSize: 15, color: '#94A3B8' },
  modalItemTextActive: { color: '#6366F1', fontWeight: '700' },
});
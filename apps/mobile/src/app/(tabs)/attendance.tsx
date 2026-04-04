import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

export default function AttendanceScreen() {
  const today = new Date().toISOString().split('T')[0]
  const { data, isLoading } = useQuery({
    queryKey: ['attendance', today],
    queryFn: () => api.getAttendance(today),
  })

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <Text style={styles.loading}>Loading...</Text>
        ) : (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Today's Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#22c55e' }]}>{data?.data?.present || 0}</Text>
                <Text style={styles.summaryLabel}>Present</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{data?.data?.absent || 0}</Text>
                <Text style={styles.summaryLabel}>Absent</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>{data?.data?.late || 0}</Text>
                <Text style={styles.summaryLabel}>Late</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  date: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  content: { padding: 16 },
  loading: { textAlign: 'center', color: '#9ca3af', padding: 40 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 28, fontWeight: '800' },
  summaryLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
})

import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

export default function HomeScreen() {
  const { user } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  const { data: announcements, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: api.getAnnouncements,
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const items = announcements?.data || []

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'User'} 👋</Text>
        <Text style={styles.role}>{user?.role || 'Member'}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#ede9fe' }]}>
          <Text style={styles.statValue}>—</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
          <Text style={styles.statValue}>—</Text>
          <Text style={styles.statLabel}>Fees Paid</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.statValue}>—</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Announcements */}
      <Text style={styles.sectionTitle}>Recent Announcements</Text>
      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No announcements yet</Text>
        </View>
      ) : (
        items.slice(0, 5).map((ann: any) => (
          <View key={ann.id} style={styles.announcementCard}>
            <Text style={styles.announcementTitle}>{ann.title}</Text>
            <Text style={styles.announcementBody} numberOfLines={2}>{ann.body || ann.content}</Text>
            <Text style={styles.announcementDate}>
              {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : ''}
            </Text>
          </View>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#6366f1' },
  greeting: { fontSize: 24, fontWeight: '800', color: '#fff' },
  role: { fontSize: 13, color: '#c7d2fe', marginTop: 2, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: 10, padding: 16, marginTop: -20 },
  statCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  emptyCard: { marginHorizontal: 16, padding: 24, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  emptyText: { color: '#9ca3af', fontSize: 14 },
  announcementCard: { marginHorizontal: 16, marginBottom: 10, padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  announcementTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  announcementBody: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  announcementDate: { fontSize: 11, color: '#9ca3af', marginTop: 6 },
})

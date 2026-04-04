import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../lib/api'

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
  })

  const notifications = data?.data || []

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refetch(); setRefreshing(false) }} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {isLoading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      ) : (
        notifications.map((n: any) => (
          <View key={n.id} style={[styles.card, !n.isRead && styles.unread]}>
            <Text style={styles.notifTitle}>{n.title}</Text>
            <Text style={styles.notifBody} numberOfLines={2}>{n.message || n.body}</Text>
            <Text style={styles.notifTime}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</Text>
          </View>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  loading: { textAlign: 'center', color: '#9ca3af', padding: 40 },
  empty: { margin: 16, padding: 40, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  emptyText: { color: '#9ca3af' },
  card: { marginHorizontal: 16, marginBottom: 8, padding: 14, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  unread: { borderLeftWidth: 3, borderLeftColor: '#6366f1', backgroundColor: '#faf5ff' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  notifBody: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  notifTime: { fontSize: 11, color: '#9ca3af', marginTop: 6 },
})

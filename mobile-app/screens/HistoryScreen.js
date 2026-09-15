import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchMySubmissions } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TYPE_LABEL = { pole: 'Pole', area: 'Farm Area', line: 'Cable/Fiber Line' };
const STATUS_COLOR = {
  verified: '#238b45',
  pending_review: '#e0a800',
  flagged: '#e31a1c',
  rejected: '#999',
};

export default function HistoryScreen() {
  const { getAccessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const token = getAccessToken();
      const data = await fetchMySubmissions(token);
      setItems(data.items || []);
    } catch (err) {
      // Silent fail is fine here -- an empty list with no error banner keeps this screen simple.
      console.error('History load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text style={styles.empty}>No submissions yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{TYPE_LABEL[item.type] || item.type}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] || '#999' }]}>
            <Text style={styles.badgeText}>{(item.status || '').replace('_', ' ')}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingTop: 40 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1,
    borderColor: '#eee', borderRadius: 10, marginBottom: 10, backgroundColor: '#fff',
  },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 12, color: '#777', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});

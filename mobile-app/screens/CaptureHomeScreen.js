import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OPTIONS = [
  { key: 'PoleCapture', title: 'Pole', desc: 'Capture a single pole: location + photo + condition.', icon: 'flash-outline' },
  { key: 'AreaCapture', title: 'Farm / Land Area', desc: 'Capture a farm or land boundary as an area.', icon: 'map-outline' },
  { key: 'LineCapture', title: 'Cable / Fiber Line', desc: 'Capture a cable or fiber route as a line.', icon: 'git-network-outline' },
];

export default function CaptureHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What are you capturing?</Text>
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={styles.card}
          onPress={() => navigation.navigate(opt.key)}
        >
          <Ionicons name={opt.icon} size={28} color="#1f3864" style={{ marginRight: 14 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{opt.title}</Text>
            <Text style={styles.cardDesc}>{opt.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 30 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1,
    borderColor: '#e0e0e0', borderRadius: 12, marginBottom: 14, backgroundColor: '#fff',
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardDesc: { fontSize: 13, color: '#666', marginTop: 2 },
});

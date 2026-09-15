import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import GeometryCapture from '../components/GeometryCapture';
import { submitLine } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LINE_TYPES = [
  { label: 'Cable', value: 'cable' },
  { label: 'Fiber', value: 'fiber' },
  { label: 'Other', value: 'other' },
];

export default function LineCaptureScreen({ navigation }) {
  const { getAccessToken } = useAuth();
  const [step, setStep] = useState('geometry'); // geometry | details
  const [points, setPoints] = useState([]);
  const [lineName, setLineName] = useState('');
  const [lineType, setLineType] = useState('cable');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGeometryComplete = (pts) => {
    setPoints(pts);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!lineName) {
      Alert.alert('Missing info', 'Enter a name for this route.');
      return;
    }
    setLoading(true);
    try {
      const token = getAccessToken();
      await submitLine({ lineName, lineType, description, points, token });
      Alert.alert('Success', `Line "${lineName}" submitted with ${points.length} points.`, [
        { text: 'OK', onPress: () => navigation.navigate('CaptureHome') },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'geometry') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.stepLabel}>Step 1 of 2 — Capture the route</Text>
        <GeometryCapture geometryType="linestring" onComplete={handleGeometryComplete} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepLabel}>Step 2 of 2 — Details</Text>
      <Text style={styles.info}>{points.length} route points captured.</Text>

      <Text style={styles.label}>Line Name</Text>
      <TextInput style={styles.input} value={lineName} onChangeText={setLineName} placeholder="e.g. Bole-Kazanchis fiber run" />

      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        {LINE_TYPES.map((t) => (
          <Button
            key={t.value}
            title={t.label}
            color={lineType === t.value ? '#2e7d32' : '#999'}
            onPress={() => setLineType(t.value)}
          />
        ))}
      </View>

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Notes about this route" multiline />

      <View style={{ marginTop: 20 }}>
        <Button title="Back to Route" onPress={() => setStep('geometry')} />
      </View>
      <View style={{ marginTop: 10 }}>
        {loading ? <ActivityIndicator size="large" /> : <Button title="Submit Line" onPress={handleSubmit} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  stepLabel: { fontSize: 13, color: '#1f3864', fontWeight: '700', marginBottom: 14 },
  info: { color: '#444', marginBottom: 14 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  typeRow: { flexDirection: 'row', gap: 6, marginVertical: 6 },
});

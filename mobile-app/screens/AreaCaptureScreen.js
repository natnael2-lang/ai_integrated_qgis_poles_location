import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import GeometryCapture from '../components/GeometryCapture';
import { submitArea } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AreaCaptureScreen({ navigation }) {
  const { getAccessToken } = useAuth();
  const [step, setStep] = useState('geometry'); // geometry | details
  const [points, setPoints] = useState([]);
  const [areaName, setAreaName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGeometryComplete = (pts) => {
    setPoints(pts);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!areaName) {
      Alert.alert('Missing info', 'Enter a name for this area.');
      return;
    }
    setLoading(true);
    try {
      const token = getAccessToken();
      const result = await submitArea({ areaName, description, points, token });
      Alert.alert('Success', `Area "${areaName}" submitted with ${points.length} points.`, [
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
        <Text style={styles.stepLabel}>Step 1 of 2 — Capture the boundary</Text>
        <GeometryCapture geometryType="polygon" onComplete={handleGeometryComplete} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepLabel}>Step 2 of 2 — Details</Text>
      <Text style={styles.info}>{points.length} boundary points captured.</Text>

      <Text style={styles.label}>Area Name</Text>
      <TextInput style={styles.input} value={areaName} onChangeText={setAreaName} placeholder="e.g. Kebele 04 farm plot" />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Notes about this area" multiline />

      <View style={{ marginTop: 20 }}>
        <Button title="Back to Boundary" onPress={() => setStep('geometry')} />
      </View>
      <View style={{ marginTop: 10 }}>
        {loading ? <ActivityIndicator size="large" /> : <Button title="Submit Area" onPress={handleSubmit} />}
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
});

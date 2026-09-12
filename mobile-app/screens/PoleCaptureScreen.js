import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LocationCapture from '../components/LocationCapture';
import PhotoCapture from '../components/PhotoCapture';
import { submitPole } from '../services/api';
import { CONDITION_OPTIONS } from '../config/constants';

export default function PoleCaptureScreen() {
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [poleCode, setPoleCode] = useState('');
  const [condition, setCondition] = useState('good');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setLocation(null);
    setPhoto(null);
    setPoleCode('');
    setCondition('good');
  };

  const handleSubmit = async () => {
    if (!location || !photo || !poleCode) {
      Alert.alert('Missing data', 'Please capture location, photo, and enter a pole code.');
      return;
    }

    setLoading(true);
    try {
      const result = await submitPole({ location, photo, poleCode, condition });
      Alert.alert('Success', `Pole ${poleCode} submitted (status: ${result.record_status}).`);
      resetForm();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pole Mapper</Text>

      <Text style={styles.label}>Pole Code</Text>
      <TextInput
        style={styles.input}
        value={poleCode}
        onChangeText={setPoleCode}
        placeholder="e.g. P-102"
      />

      <Text style={styles.label}>Condition</Text>
      <View style={styles.conditionRow}>
        {CONDITION_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            title={opt.label}
            color={condition === opt.value ? '#2e7d32' : '#999'}
            onPress={() => setCondition(opt.value)}
          />
        ))}
      </View>

      <LocationCapture location={location} onLocationCaptured={setLocation} />
      <PhotoCapture photo={photo} onPhotoCaptured={setPhoto} />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <Button title="Submit Pole" onPress={handleSubmit} disabled={loading} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
});

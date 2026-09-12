import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function LocationCapture({ location, onLocationCaptured }) {
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location access is required to capture a pole position.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    onLocationCaptured(loc.coords);
  };

  return (
    <View style={styles.container}>
      <Button title="Capture Location" onPress={getLocation} />
      {location && (
        <Text style={styles.info}>
          Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)}{'\n'}
          Accuracy: {location.accuracy.toFixed(1)} m
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  info: { marginTop: 8, color: '#333' },
});

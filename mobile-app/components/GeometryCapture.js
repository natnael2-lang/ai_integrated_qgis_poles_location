import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import MapView, { Marker, Polyline, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';

/**
 * Captures an ordered list of {lat, lon} points, either by:
 *  - "track": walking the perimeter/route while GPS auto-records points, or
 *  - "manual": tapping points directly on an embedded map
 *
 * @param {'polygon'|'linestring'} geometryType - affects the minimum point
 *   count and whether the preview closes into a shape (polygon) or stays open (line)
 * @param {(points: {lat:number, lon:number}[]) => void} onComplete
 */
export default function GeometryCapture({ geometryType, onComplete }) {
  const minPoints = geometryType === 'polygon' ? 3 : 2;

  const [mode, setMode] = useState(null); // null | 'track' | 'manual'
  const [points, setPoints] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [region, setRegion] = useState(null);
  const watchSubRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      });
    })();

    return () => {
      if (watchSubRef.current) watchSubRef.current.remove();
    };
  }, []);

  const addPoint = (lat, lon) => {
    setPoints((prev) => [...prev, { lat, lon }]);
  };

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location access is required.');
      return;
    }
    setTracking(true);
    watchSubRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 3, timeInterval: 2000 },
      (loc) => addPoint(loc.coords.latitude, loc.coords.longitude)
    );
  };

  const stopTracking = () => {
    if (watchSubRef.current) {
      watchSubRef.current.remove();
      watchSubRef.current = null;
    }
    setTracking(false);
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    addPoint(latitude, longitude);
  };

  const undoLast = () => setPoints((prev) => prev.slice(0, -1));
  const clearAll = () => setPoints([]);

  const handleFinish = () => {
    if (points.length < minPoints) {
      Alert.alert('Not enough points', `You need at least ${minPoints} points.`);
      return;
    }
    if (tracking) stopTracking();
    onComplete(points);
  };

  const coordsForMap = points.map((p) => ({ latitude: p.lat, longitude: p.lon }));

  // --- Mode selection screen ---
  if (mode === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>How do you want to capture this {geometryType === 'polygon' ? 'area' : 'route'}?</Text>
        <View style={styles.modeRow}>
          <Button title="Walk & Auto-Track" onPress={() => setMode('track')} />
        </View>
        <View style={styles.modeRow}>
          <Button title="Tap Points on Map" onPress={() => setMode('manual')} />
        </View>
      </View>
    );
  }

  // --- Walk & track mode ---
  if (mode === 'track') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Walk & Auto-Track</Text>
        <Text style={styles.info}>
          {tracking ? 'Recording your path…' : 'Not recording yet.'} Points captured: {points.length}
        </Text>

        {!tracking ? (
          <Button title="Start Walking / Tracking" onPress={startTracking} />
        ) : (
          <Button title="Stop Tracking" color="#b3261e" onPress={stopTracking} />
        )}

        <View style={styles.row}>
          <Button title="Undo Last Point" onPress={undoLast} disabled={points.length === 0} />
          <Button title="Clear All" onPress={clearAll} disabled={points.length === 0} />
        </View>

        <Button title="Switch to Tap-on-Map Mode" onPress={() => { stopTracking(); setMode('manual'); }} />

        <View style={{ marginTop: 16 }}>
          <Button title={`Finish (${points.length}/${minPoints} min)`} onPress={handleFinish} disabled={points.length < minPoints} />
        </View>
      </View>
    );
  }

  // --- Manual tap-on-map mode ---
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tap the Map to Add Points</Text>
      <Text style={styles.info}>Points captured: {points.length}</Text>

      {region ? (
        <MapView style={styles.map} initialRegion={region} onPress={handleMapPress}>
          {points.map((p, i) => (
            <Marker key={i} coordinate={{ latitude: p.lat, longitude: p.lon }} title={`Point ${i + 1}`} />
          ))}
          {geometryType === 'polygon' && points.length >= 3 ? (
            <Polygon coordinates={coordsForMap} strokeColor="#1f3864" fillColor="rgba(31,56,100,0.2)" strokeWidth={2} />
          ) : (
            <Polyline coordinates={coordsForMap} strokeColor="#1f3864" strokeWidth={3} />
          )}
        </MapView>
      ) : (
        <Text>Loading map…</Text>
      )}

      <View style={styles.row}>
        <Button title="Undo Last Point" onPress={undoLast} disabled={points.length === 0} />
        <Button title="Clear All" onPress={clearAll} disabled={points.length === 0} />
      </View>

      <Button title="Switch to Walk & Track Mode" onPress={() => setMode('track')} />

      <View style={{ marginTop: 12 }}>
        <Button title={`Finish (${points.length}/${minPoints} min)`} onPress={handleFinish} disabled={points.length < minPoints} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  label: { fontWeight: 'bold', fontSize: 15, marginBottom: 8 },
  info: { color: '#444', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  modeRow: { marginVertical: 6 },
  map: { width: '100%', height: 320, borderRadius: 8, marginBottom: 10 },
});

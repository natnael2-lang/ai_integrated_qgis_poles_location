import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import PoleCaptureScreen from './screens/PoleCaptureScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <PoleCaptureScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
});

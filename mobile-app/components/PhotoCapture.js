import React from 'react';
import { View, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function PhotoCapture({ photo, onPhotoCaptured }) {
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera access is required to photograph the pole.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      exif: true,
    });
    if (!result.canceled) {
      onPhotoCaptured(result.assets[0]);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Take Photo" onPress={takePhoto} />
      {photo && <Image source={{ uri: photo.uri }} style={styles.preview} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  preview: { width: 200, height: 200, marginTop: 10, borderRadius: 8 },
});

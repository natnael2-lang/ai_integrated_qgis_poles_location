import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(user?.email || '?')[0].toUpperCase()}</Text>
      </View>
      <Text style={styles.email}>{user?.email}</Text>
      <View style={{ marginTop: 30, width: '100%' }}>
        <Button title="Log Out" color="#b3261e" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 60 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#1f3864',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  email: { fontSize: 16, fontWeight: '600' },
});

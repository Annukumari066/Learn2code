import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';

export default function AccountScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('http://172.30.209.182:5000/api/auth/profile');
      const data = await res.json();

      if (res.ok) {
        setUser(data);
      } else {
        Alert.alert('Error', data.message || 'Failed to load profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch');
    }
  };

  const logout = () => {
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>LEARN2CODE</Text>
      <Text style={styles.subHeading}>
        PROGRAMMING LANGUAGE FLASHCARDS
      </Text>

      <View style={styles.card}>
        {/* Profile */}
        <View style={styles.profileBox}>
          <Text style={styles.avatar}>👤</Text>

          <View>
            <Text style={styles.label}>Account Details</Text>

            <Text style={styles.name}>
              {user?.name || 'Loading...'}
            </Text>

            <Text style={styles.id}>
              {user?.email || ''}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressCard}>
            <Text style={styles.icon}>💻</Text>
            <Text style={styles.progressText}>Learning</Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Skill Progress</Text>
            <Text style={styles.progressPercent}>78%</Text>
          </View>
        </View>

        {/* Dashboard */}
        <View style={styles.dashboard}>
          <View style={styles.leftDash}>
            <Text style={styles.sectionTitle}>Dashboard</Text>

            <Text style={styles.dashItem}>🐍 Python</Text>
            <Text style={styles.dashItem}>☕ Java</Text>
            <Text style={styles.dashItem}>💻 C++</Text>
            <Text style={styles.dashItem}>⚡ JavaScript</Text>
          </View>

          <View style={styles.rightDash}>
            <TouchableOpacity style={styles.menuBtn}>
              <Text style={styles.menuText}>👤 Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuBtn}>
              <Text style={styles.menuText}>⚙ Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuBtn}>
              <Text style={styles.menuText}>🔒 Security</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuBtn}
              onPress={logout}
            >
              <Text style={styles.menuText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>
        SIMPLIFY YOUR CODING JOURNEY.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#dff6ef',
    alignItems: 'center',
    padding: 20,
  },

  heading: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#0a3344',
    marginTop: 20,
  },

  subHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
  },

  card: {
    width: '92%',
    maxWidth: 700,
    backgroundColor: '#0e4b5a',
    padding: 18,
    borderRadius: 24,
    elevation: 8,
  },

  profileBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 15,
  },

  avatar: {
    fontSize: 65,
  },

  label: {
    fontSize: 16,
    color: '#555',
  },

  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },

  id: {
    fontSize: 18,
    color: '#444',
  },

  progressRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },

  progressCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },

  icon: {
    fontSize: 42,
  },

  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  progressPercent: {
    fontSize: 28,
    color: '#1e88e5',
    fontWeight: 'bold',
    marginTop: 8,
  },

  dashboard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  leftDash: {
    width: '48%',
  },

  rightDash: {
    width: '48%',
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  dashItem: {
    fontSize: 20,
    marginBottom: 12,
    color: '#222',
  },

  menuBtn: {
    backgroundColor: '#eef7f7',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  menuText: {
    fontSize: 18,
    fontWeight: '600',
  },

  footer: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 25,
    color: '#111',
    textAlign: 'center',
  },
});


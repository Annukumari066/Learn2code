import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
      
        const handleSignup = async () => {
        try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();
    console.log(data);
    Alert.alert(data.message);

    if (res.ok) {
      alert('Account Created Successfully');
      router.replace('/login');
    } else {
      alert(data.message || 'Signup Failed');
    }

  } catch (error) {
    alert('Server Error');
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>🚀</Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Learn2Code today</Text>
        <TextInput placeholder='Full Name' value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder='Email' value={email} onChangeText={setEmail} style={styles.input} keyboardType='email-address' autoCapitalize='none' />
        <TextInput placeholder='Password' value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#ecfeff' },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 },
  logo: { fontSize: 42, textAlign: 'center' },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', color: '#0f766e', marginTop: 8 },
  subtitle: { textAlign: 'center', color: '#64748b', marginBottom: 20 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#ccfbf1', borderRadius: 14, padding: 14, marginBottom: 12 },
  button: { backgroundColor: '#14b8a6', padding: 14, borderRadius: 14, marginTop: 6 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, color: '#0f766e', fontWeight: '600' }
});

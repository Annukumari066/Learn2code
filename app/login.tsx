import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();
      console.log(data);
      Alert.alert(data.message);

    
      if (res.ok) {
      await AsyncStorage.setItem('token', data.token);
      router.replace('/home');

      } else {
        Alert.alert('Error', data.message || 'Login Failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Server Error');
    }
  };

  return (
    <View style={styles.container}>
      {/* Left Side */}
      <View style={styles.left}>
     <Image
     source={require('../assets/images/login page.png')}
     style={styles.fullImage}
     resizeMode="contain"
    />
     </View>


      {/* Right Side */}
      <View style={styles.right}>
        <View style={styles.card}>
          <Text style={styles.logo}>💻</Text>
          <Text style={styles.brand}>Learn2Code</Text>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.sub}>Login to continue learning</Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.link}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e8f7f0',
  },

  // left: {
  //   flex: 1,
  //   backgroundColor: '#ffffff',
  //   justifyContent: 'center',
  //   padding: 30,
  // },


    left: {
    flex: 1,
    overflow: 'hidden',
    margin:0,
    padding:0,
  },

    fullImage: {
    width: '100%',
    height:'100%',
  
  },



  right: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
  },

  card: {
    width: '90%',
    maxWidth:500,
    backgroundColor: 'rgba(255,255,255,0.65)',
    padding: 35,
    borderRadius: 25,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },

  logo: {
    fontSize: 55,
    textAlign: 'center',
  },

  brand: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111',
  },

  title: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111',
  },

  sub: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 25,
    fontSize: 18,
  },

  input: {
    backgroundColor: '#edf4f3',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 18,
  },

  button: {
    backgroundColor: '#1f66d1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,

    shadowColor: '#1f66d1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },

  forgot: {
    textAlign: 'center',
    marginTop: 16,
    color: '#444',
    fontSize: 16,
  },

  link: {
    textAlign: 'center',
    marginTop: 16,
    color: '#1f66d1',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


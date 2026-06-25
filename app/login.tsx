import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { API_URL, setApiUrl } from '../config';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
 
WebBrowser.maybeCompleteAuthSession();

// Multi-color Google SVG Logo
const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { width } = useWindowDimensions();

  // --- AUTH STATUS & AUTO LOGIN ---
  const [checkingAuth, setCheckingAuth] = useState(true);

  // --- API SETTINGS GEAR ---
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(API_URL);
  const [testingConnection, setTestingConnection] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');

  // --- FORGOT PASSWORD MODAL ---
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1 = enter email, 2 = verify OTP & reset
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotPass, setShowForgotPass] = useState(false);



  // --- EFFECTS ---
  useEffect(() => {
    checkAutoLogin();
    loadSavedGoogleClientId();
    if (Platform.OS === 'web') {
      checkWebGoogleOAuth();
    }
  }, []);

  const checkAutoLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Verify token with backend
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.status === 200) {
          router.replace('/home');
          return;
        } else {
          await AsyncStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.log('[AUTO-LOGIN] Check failed:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadSavedGoogleClientId = async () => {
    try {
      const savedId = await AsyncStorage.getItem('google_client_id');
      if (savedId) {
        setGoogleClientId(savedId);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const checkWebGoogleOAuth = async () => {
    try {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        if (accessToken) {
          setCheckingAuth(true);
          const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          const profile = await response.json();
          if (profile.email) {
            await handleGoogleBackendLogin(profile.email, profile.name || profile.email.split('@')[0], profile.sub);
          } else {
            alert('Could not retrieve Google profile email');
          }
        }
      }
    } catch (error) {
      console.log('[GOOGLE-OAUTH] Parsing error:', error);
    } finally {
      setCheckingAuth(false);
      // Clear hash from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleGoogleBackendLogin = async (emailStr: string, nameStr: string, googleIdStr: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailStr, name: nameStr, googleId: googleIdStr })
      });
      const data = await res.json();
      if (res.status === 200) {
        await AsyncStorage.setItem('token', data.token);
        alert(`Logged in successfully with Google: ${emailStr}`);
        router.push('/home');
      } else {
        alert(data.message || 'Google Login Failed on Server');
      }
    } catch (error) {
      console.log(error);
      alert('Network error during Google authentication. Please verify the Server URL.');
    }
  };

  const handleGoogleBtnPress = async () => {
    const clientId = googleClientId || '';
    if (!clientId) {
      alert('Please configure your Google Client ID in Settings (gear icon ⚙️) to sign in with your real Google account.');
      setShowSettingsModal(true);
      return;
    }
 
    // Construct Redirect URI
    // For Web: returns e.g. http://localhost:8081/login
    // For Mobile: returns e.g. exp://10.18.250.182:8081/--/login
    const redirectUri = Linking.createURL('login');
    console.log('[GOOGLE-SIGNIN] Redirect URI:', redirectUri);
 
    const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
 
    try {
      setCheckingAuth(true);
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      if (result.type === 'success' && result.url) {
        // Parse access token from the redirect URL
        const parsedUrl = result.url;
        let token = '';
        if (parsedUrl.includes('access_token=')) {
          const hashParts = parsedUrl.split('#')[1] || parsedUrl.split('?')[1] || '';
          const params = new URLSearchParams(hashParts);
          token = params.get('access_token') || '';
        }
 
        if (token) {
          // Fetch real user info from Google's UserInfo API
          const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const profile = await response.json();
          if (profile.email) {
            await handleGoogleBackendLogin(profile.email, profile.name || profile.email.split('@')[0], profile.sub);
          } else {
            alert('Google login failed: Could not retrieve email.');
          }
        } else {
          alert('Google login failed: No access token returned.');
        }
      } else if (result.type === 'cancel') {
        console.log('Google login was cancelled by the user');
      } else {
        alert('Google login failed or was dismissed.');
      }
    } catch (error) {
      console.log('Google Login error:', error);
      alert('An error occurred during Google sign-in.');
    } finally {
      setCheckingAuth(false);
    }
  };

  // --- API SETTINGS HANDLERS ---
  const handleSaveAndTestSettings = async () => {
    if (!tempApiUrl) {
      alert('Please enter a server URL');
      return;
    }
    setTestingConnection(true);
    try {
      let testUrl = tempApiUrl.trim();
      if (testUrl.endsWith('/')) {
        testUrl = testUrl.slice(0, -1);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${testUrl}/`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (res.ok || res.status === 200 || res.status === 404 || res.status === 401) {
        await setApiUrl(testUrl);
        if (googleClientId) {
          await AsyncStorage.setItem('google_client_id', googleClientId.trim());
        } else {
          await AsyncStorage.removeItem('google_client_id');
        }
        alert('Connected successfully! Server settings updated.');
        setShowSettingsModal(false);
      } else {
        alert('Server returned status: ' + res.status);
      }
    } catch (error) {
      console.log('Connection test failed:', error);
      alert('Could not reach the server at ' + tempApiUrl + '. Please check that the server is running on the same network.');
    } finally {
      setTestingConnection(false);
    }
  };

  // --- FORGOT PASSWORD HANDLERS ---
  const handleSendOtp = async () => {
    if (!forgotEmail) {
      alert('Please enter your email');
      return;
    }
    if (!forgotEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.status === 200) {
        alert('A 6-digit OTP code has been sent to your email.');
        setForgotStep(2);
      } else {
        alert(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error(error);
      alert('Network error connecting to backend. Please check connection.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotOtp || !newPassword || !confirmPassword) {
      alert('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp,
          newPassword
        })
      });
      const data = await res.json();
      if (res.status === 200) {
        alert('Password reset successful! You can now log in.');
        setShowForgotModal(false);
        // Reset states
        setForgotEmail('');
        setForgotOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotStep(1);
      } else {
        alert(data.message || 'Reset failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating password');
    } finally {
      setForgotLoading(false);
    }
  };

  const isMobile = width < 768;

  // Custom Colors - Login screen card and inputs stay light to match the mockups
  // and completely remove the "black box" backgrounds from inputs.
  const cardBg = '#FFFFFF';
  const screenBg = '#F8FAFC';
  const textColor = '#1E293B';
  const textSecColor = '#64748B';
  const inputBg = '#FFFFFF';
  const inputBorder = '#E2E8F0';
  const inputTextColor = '#1E293B';
  const headerBg = '#FFFFFF';
  const headerBorder = '#E2E8F0';
  const dividerColor = '#E2E8F0';

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
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

      if (res.status === 200) {
        await AsyncStorage.setItem('token', data.token);
        alert('Login Successful');
        router.push('/home');
      } else if (res.status === 400) {
        alert(data.message);
      } else {
        alert('Something went wrong');
      }
    } catch (error) {
      console.log(error);
      alert('Server Error');
    }
  };

  const renderFormContent = () => (
    <View style={styles.formContainer}>
      {/* Code Badge */}
      <View style={styles.badgeOuter}>
        <View style={styles.badgeInner}>
          <Text style={styles.badgeText}>{'</>'}</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: textColor }]}>Welcome Back!</Text>
      <Text style={[styles.subtitle, { color: textSecColor }]}>
        Login to continue your coding journey
      </Text>

      {/* Email Input */}
      {!isMobile && (
        <Text style={[styles.inputLabel, { color: textColor }]}>Email Address</Text>
      )}
      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: inputBg, 
          borderColor: emailFocused ? '#4F46E5' : inputBorder,
          borderWidth: emailFocused ? 1.5 : 1
        }
      ]}>
        <Feather name="mail" size={20} color="#94A3B8" style={styles.inputIconLeft} />
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          style={[styles.inputField, { color: inputTextColor }]}
          autoCapitalize="none"
          keyboardType="email-address"
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
      </View>

      {/* Password Input */}
      {!isMobile && (
        <Text style={[styles.inputLabel, { color: textColor }]}>Password</Text>
      )}
      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: inputBg, 
          borderColor: passwordFocused ? '#4F46E5' : inputBorder,
          borderWidth: passwordFocused ? 1.5 : 1
        }
      ]}>
        <Feather name="lock" size={20} color="#94A3B8" style={styles.inputIconLeft} />
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={[styles.inputField, { color: inputTextColor }]}
          autoCapitalize="none"
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.inputIconRight}
        >
          <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Remember me & Forgot Password */}
      <View style={styles.rowBetween}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Feather name="check" size={12} color="#FFFFFF" />}
          </View>
          <Text style={[styles.checkboxLabel, { color: textSecColor }]}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setForgotEmail(email); // Autofill with whatever they entered in the login form
          setForgotStep(1);
          setShowForgotModal(true);
        }}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.9}>
        <Text style={styles.loginButtonText}>Login</Text>
        <View style={styles.arrowContainer}>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
        <Text style={[styles.dividerText, { color: textSecColor }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
      </View>

      {/* Google Button */}
      <TouchableOpacity 
        style={[styles.googleButton, { borderColor: inputBorder }]} 
        activeOpacity={0.8}
        onPress={handleGoogleBtnPress}
      >
        <GoogleLogo size={20} />
        <Text style={[styles.googleButtonText, { color: textColor }]}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Signup Footer */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: textSecColor }]}>{"Don't have an account? "}</Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.footerLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 16, color: '#64748B', fontSize: 15, fontWeight: '600' }}>Checking account status...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: screenBg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      {Platform.OS === 'web' && (
        <style dangerouslySetInnerHTML={{__html: `
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
            -webkit-text-fill-color: #1E293B !important;
            transition: background-color 5000s ease-in-out 0s !important;
          }
        `}} />
      )}

      {isMobile ? (
        // MOBILE VIEW (Image 2 Stack layout)
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexOne}
        >
          {/* Floating settings gear for mobile */}
          <TouchableOpacity 
            onPress={() => {
              setTempApiUrl(API_URL);
              setShowSettingsModal(true);
            }}
            style={{
              position: 'absolute',
              top: 40,
              right: 20,
              zIndex: 999,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: 10,
              borderRadius: 20,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 5,
              elevation: 6
            }}
          >
            <Feather name="settings" size={20} color="#1E293B" />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.mobileScrollContent}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Illustration (phone.png) */}
            <View style={styles.mobileImageContainer}>
              <Image
                source={require('../assets/images/phone.png')}
                style={styles.mobileImage}
                resizeMode="cover"
              />
            </View>

            {/* Bottom Card */}
            <View style={[styles.mobileCard, { backgroundColor: cardBg }]}>
              {renderFormContent()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        // DESKTOP/LAPTOP VIEW (Image 1 Split layout)
        <View style={styles.flexOne}>
          {/* Header with settings gear on the right */}
          <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: headerBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
                <Feather name="arrow-left" size={20} color={textColor} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: textColor }]}>Login</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                setTempApiUrl(API_URL);
                setShowSettingsModal(true);
              }}
              style={{ padding: 8 }}
            >
              <Feather name="settings" size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Two Columns Body */}
          <View style={styles.desktopBody}>
            {/* Left side image */}
            <View style={styles.desktopLeft}>
              <Image
                source={require('../assets/images/login.png')}
                style={styles.desktopImage}
                resizeMode="cover"
              />
            </View>

            {/* Right side form */}
            <View style={styles.desktopRight}>
              <View style={[styles.desktopCard, { backgroundColor: cardBg }]}>
                {renderFormContent()}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ================= MODALS SECTION ================= */}

      {/* API Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>
            <View style={modalStyles.headerRow}>
              <Text style={modalStyles.title}>Server Connection Settings</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.subtitle}>Set your computer's local IP address and port to access the backend from other devices.</Text>

            <Text style={modalStyles.label}>Backend Server URL</Text>
            <View style={modalStyles.inputContainer}>
              <Feather name="globe" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={modalStyles.input}
                value={tempApiUrl}
                onChangeText={setTempApiUrl}
                placeholder="e.g. http://192.168.1.100:5000"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>

            <Text style={modalStyles.label}>Google Client ID (Optional - Web OAuth)</Text>
            <View style={modalStyles.inputContainer}>
              <Feather name="key" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={modalStyles.input}
                value={googleClientId}
                onChangeText={setGoogleClientId}
                placeholder="Enter client ID from Google Console"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[modalStyles.primaryBtn, { marginTop: 12 }]}
              onPress={handleSaveAndTestSettings}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={modalStyles.btnText}>Save & Test Connection</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>
            <View style={modalStyles.headerRow}>
              <Text style={modalStyles.title}>Reset Password</Text>
              <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {forgotStep === 1 ? (
              <View>
                <Text style={modalStyles.subtitle}>Enter your email address to receive a 6-digit verification code.</Text>
                
                <Text style={modalStyles.label}>Email Address</Text>
                <View style={modalStyles.inputContainer}>
                  <Feather name="mail" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={modalStyles.input}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    placeholder="name@email.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity 
                  style={[modalStyles.primaryBtn, { backgroundColor: '#4F46E5' }]} 
                  onPress={handleSendOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={modalStyles.btnText}>Send OTP Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={modalStyles.subtitle}>We have sent a verification code to <Text style={{ fontWeight: '700', color: '#4F46E5' }}>{forgotEmail}</Text>. Enter it below with your new password.</Text>

                <Text style={modalStyles.label}>6-Digit OTP</Text>
                <View style={modalStyles.inputContainer}>
                  <Feather name="hash" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={modalStyles.input}
                    value={forgotOtp}
                    onChangeText={setForgotOtp}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <Text style={modalStyles.label}>New Password</Text>
                <View style={modalStyles.inputContainer}>
                  <Feather name="lock" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={modalStyles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showForgotPass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowForgotPass(!showForgotPass)}>
                    <Feather name={showForgotPass ? "eye" : "eye-off"} size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <Text style={modalStyles.label}>Confirm New Password</Text>
                <View style={modalStyles.inputContainer}>
                  <Feather name="lock" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={modalStyles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showForgotPass}
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity 
                  style={[modalStyles.primaryBtn, { backgroundColor: '#10B981' }]} 
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={modalStyles.btnText}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ marginTop: 12, alignItems: 'center' }} 
                  onPress={() => setForgotStep(1)}
                >
                  <Text style={{ color: '#4F46E5', fontWeight: '600', fontSize: 13 }}>Change Email / Request New OTP</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  // Mobile styles
  mobileScrollContent: {
    flexGrow: 1,
    backgroundColor: '#050720', // deep background matching mockup phone.png
  },
  mobileImageContainer: {
    width: '100%',
    height: 340, // Height matching Image 2 proportion
    overflow: 'hidden',
  },
  mobileImage: {
    width: '100%',
    height: '100%',
  },
  mobileCard: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    marginTop: -32, // Overlaps top section slightly for a premium card feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  // Desktop styles
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  desktopBody: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopLeft: {
    flex: 1.1, // slightly wider to give image more space
    height: '100%',
  },
  desktopImage: {
    width: '100%',
    height: '100%',
  },
  desktopRight: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8FAFC',
  },
  desktopCard: {
    width: '100%',
    maxWidth: 500, // Increased width
    borderRadius: 24,
    paddingHorizontal: 36, // Reduced padding for a more compact height
    paddingVertical: 28,  // Reduced padding for a more compact height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  // Form styles
  formContainer: {
    width: '100%',
  },
  badgeOuter: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12, // Reduced margin
  },
  badgeInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6, // Reduced margin
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20, // Reduced margin
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 48, // Reduced height
    paddingHorizontal: 16,
    marginBottom: 12, // Reduced margin
  },
  inputIconLeft: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
      default: {},
    }),
  },
  inputIconRight: {
    padding: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16, // Reduced margin
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPassword: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    height: 48, // Reduced height
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16, // Reduced margin
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  arrowContainer: {
    position: 'absolute',
    right: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Reduced margin
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48, // Reduced height
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    marginBottom: 16, // Reduced margin
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(4px)',
      } as any,
      default: {},
    }),
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  googleCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1E293B',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
      default: {},
    }),
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  googleAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    width: '100%',
  },
  googleAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});



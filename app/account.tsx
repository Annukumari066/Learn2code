import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ImageBackground,
  TextInput,
  Modal,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G, Rect, Text as SvgText, LinearGradient, Defs, Stop } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';


// Custom SVG Circular Progress Ring
const CircularProgress = ({ size, strokeWidth, percentage, color, label, colors }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.22, fontWeight: '800', color: colors.text }}>
          {percentage}%
        </Text>
        {label && (
          <Text style={{ fontSize: size * 0.08, color: colors.textSecondary, marginTop: 2, textAlign: 'center', fontWeight: '600' }}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};

export default function AccountScreen() {
  const [user, setUser] = useState<any>(null);
  const { isDark, colors, toggleTheme } = useTheme();
  
  // Responsive hooks
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;
  const isPhone = width < 768;

  // Custom theme-aware styles
  const themedStyles = getStyles(colors, isDark, isMobile, width);

  // States for user profile details (synced with AsyncStorage & defaults)
  const [bio, setBio] = useState('Passionate about solving problems and building real-world projects.');
  const [interests, setInterests] = useState('Web Development, DSA, AI/ML');
  const [location, setLocation] = useState('India');
  const [handle, setHandle] = useState('@annu_dev');
  const [level, setLevel] = useState('Level 12');
  const [joined, setJoined] = useState('Joined June 2026');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // Stats states (sync with AsyncStorage / progress API)
  const [streakCount, setStreakCount] = useState(12);
  const [topicsLearned, setTopicsLearned] = useState(1248);
  const [quizzesCompleted, setQuizzesCompleted] = useState(32);
  const globalRank = '#54';

  // Modal visibility states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [proModalVisible, setProModalVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [twoFactorVisible, setTwoFactorVisible] = useState(false);
  const [devicesVisible, setDevicesVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Edit form states
  const [formName, setFormName] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formInterests, setFormInterests] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formHandle, setFormHandle] = useState('');
  const [formLevel, setFormLevel] = useState('');
  const [formJoined, setFormJoined] = useState('');

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2FA status
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Devices state
  const [activeDevices, setActiveDevices] = useState([
    { id: '1', name: 'Windows PC (Chrome)', status: 'Active Now', icon: 'desktop-outline', current: true },
    { id: '2', name: 'iPhone 15 Pro Max (App)', status: 'Logged in 2 hours ago', icon: 'phone-portrait-outline', current: false },
    { id: '3', name: 'iPad Pro (Safari)', status: 'Logged in June 18, 2026', icon: 'tablet-portrait-outline', current: false }
  ]);

  // Privacy states
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    leaderboardShare: true,
    dataSharing: false
  });

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Notification items
  const [notifications, setNotifications] = useState([
    { id: 1, title: '🔥 Streak Alert', desc: 'You have maintained your 12-day streak! Keep studying.', time: '10m ago', unread: true },
    { id: 2, title: '🏆 Achievement Unlocked', desc: 'Java Expert badge added to your profile.', time: '2h ago', unread: true },
    { id: 3, title: '⭐ Quiz Master', desc: 'You completed 32 quizzes. Top 5% ranking!', time: '1d ago', unread: true },
    { id: 4, title: '💻 Profile Update', desc: 'Complete your profile checklists to unlock all features.', time: '2d ago', unread: false }
  ]);

  useEffect(() => {
    loadProfile();
    loadProfileDetails();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data);
        if (data.name) setFormName(data.name);
      } else {
        if (res.status === 401) {
          await AsyncStorage.removeItem('token');
          router.replace('/login');
        } else {
          Alert.alert('Error', data.message || 'Failed to load profile');
        }
      }
    } catch {
      console.log('Failed to fetch profile details');
    }
  };

  const loadProfileDetails = async () => {
    try {
      const savedBio = await AsyncStorage.getItem('@account_bio');
      if (savedBio) setBio(savedBio);

      const savedInterests = await AsyncStorage.getItem('@account_interests');
      if (savedInterests) setInterests(savedInterests);

      const savedLocation = await AsyncStorage.getItem('@account_location');
      if (savedLocation) setLocation(savedLocation);

      const savedHandle = await AsyncStorage.getItem('@account_handle');
      if (savedHandle) setHandle(savedHandle);

      const savedLevel = await AsyncStorage.getItem('@account_level');
      if (savedLevel) setLevel(savedLevel);

      const savedJoined = await AsyncStorage.getItem('@account_joined');
      if (savedJoined) setJoined(savedJoined);

      const savedPhoto = await AsyncStorage.getItem('@profile_photo');
      if (savedPhoto) setProfilePic(savedPhoto);

      const savedEmailVerify = await AsyncStorage.getItem('@email_verified');
      if (savedEmailVerify) setEmailVerified(savedEmailVerify === 'true');

      const savedIsPro = await AsyncStorage.getItem('@is_pro');
      if (savedIsPro) setIsPro(savedIsPro === 'true');

      const saved2FA = await AsyncStorage.getItem('@two_factor_enabled');
      if (saved2FA) setTwoFactorEnabled(saved2FA === 'true');
    } catch (e) {
      console.log('Failed to load profile customization', e);
    }
  };

  const loadStats = async () => {
    try {
      const localStreak = await AsyncStorage.getItem('current_streak');
      if (localStreak) setStreakCount(parseInt(localStreak));

      const localTopics = await AsyncStorage.getItem('topics_learned');
      if (localTopics) setTopicsLearned(parseInt(localTopics));

      const localQuizzes = await AsyncStorage.getItem('quizzes_completed');
      if (localQuizzes) setQuizzesCompleted(parseInt(localQuizzes));
    } catch (e) {
      console.log('Failed to load learning progress stats', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  const openEditModal = () => {
    setFormName(user?.name || 'Annu Kumari');
    setFormBio(bio);
    setFormInterests(interests);
    setFormLocation(location);
    setFormHandle(handle);
    setFormLevel(level);
    setFormJoined(joined);
    setEditModalVisible(true);
  };

  const saveProfileDetails = async () => {
    try {
      await AsyncStorage.setItem('@account_bio', formBio);
      await AsyncStorage.setItem('@account_interests', formInterests);
      await AsyncStorage.setItem('@account_location', formLocation);
      await AsyncStorage.setItem('@account_handle', formHandle);
      await AsyncStorage.setItem('@account_level', formLevel);
      await AsyncStorage.setItem('@account_joined', formJoined);

      setBio(formBio);
      setInterests(formInterests);
      setLocation(formLocation);
      setHandle(formHandle);
      setLevel(formLevel);
      setJoined(formJoined);

      if (user && formName !== user.name) {
        const updatedUser = { ...user, name: formName };
        setUser(updatedUser);
      }

      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch {
      Alert.alert('Error', 'Failed to save details');
    }
  };

  // Photo Selector using expo-image-picker
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need storage access to select a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions ? ImagePicker.MediaTypeOptions.Images : ['images'] as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const photoUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setProfilePic(photoUri);
        await AsyncStorage.setItem('@profile_photo', photoUri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to select image.');
      console.log(e);
    }
  };

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    Alert.alert('Success', 'Password changed successfully!');
    setPasswordModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggle2FA = async () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    await AsyncStorage.setItem('@two_factor_enabled', String(nextVal));
    setTwoFactorVisible(false);
    Alert.alert('Two-Factor Authentication', nextVal ? '2FA Enabled successfully!' : '2FA Disabled successfully!');
  };

  const handleRemoveDevice = (id: string) => {
    const dev = activeDevices.find(d => d.id === id);
    if (dev?.current) {
      Alert.alert('Error', 'You cannot log out of your current session.');
      return;
    }

    Alert.alert('Log Out Device', `Are you sure you want to log out of ${dev?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        onPress: () => {
          setActiveDevices(prev => prev.filter(d => d.id !== id));
          Alert.alert('Success', 'Logged out of device successfully.');
        }
      }
    ]);
  };

  const handleSavePrivacy = async () => {
    setPrivacyVisible(false);
    Alert.alert('Success', 'Privacy settings saved.');
  };

  const handleVerifyEmail = async () => {
    if (emailVerified) return;
    setEmailVerified(true);
    await AsyncStorage.setItem('@email_verified', 'true');
    Alert.alert('Success', 'Your email has been verified successfully!');
  };

  const handleCompleteNow = () => {
    if (!profilePic) {
      pickImage();
    } else if (bio.trim().length === 0 || interests.trim().length === 0 || location.trim().length === 0) {
      openEditModal();
    } else if (!emailVerified) {
      handleVerifyEmail();
    } else {
      Alert.alert('Profile Complete', 'Your profile is fully completed!');
    }
  };

  const handleSubscribePro = async (plan: string) => {
    setIsPro(true);
    await AsyncStorage.setItem('@is_pro', 'true');
    setProModalVisible(false);
    Alert.alert('Welcome to Pro!', `You have successfully subscribed to the ${plan} plan. Premium features unlocked.`);
  };

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const navigateTo = (route: string) => {
    setDrawerVisible(false);
    if (route === '/account') return;
    router.push(route as any);
  };

  // Compute profile completion variables
  const checklistItems = [
    { id: 'pic', text: 'Add profile picture', checked: !!profilePic },
    { id: 'bio', text: 'Add bio', checked: bio.trim().length > 0 },
    { id: 'loc', text: 'Add location details', checked: location.trim().length > 0 },
    { id: 'interests', text: 'Complete interests', checked: interests.trim().length > 0 },
    { id: 'email', text: 'Verify email', checked: emailVerified },
  ];

  const checkedCount = checklistItems.filter(item => item.checked).length;
  const completionPercentage = Math.round((checkedCount / checklistItems.length) * 100);

  // Filter security items based on search query
  const securityItemsList = [
    { id: 'pass', name: 'Change Password', icon: 'key-outline', action: () => setPasswordModalVisible(true) },
    { id: '2fa', name: 'Two-Factor Authentication', icon: 'shield-outline', badge: 'New', action: () => setTwoFactorVisible(true) },
    { id: 'logout', name: 'Log Out', icon: 'log-out-outline', action: () => logout() },
    { id: 'privacy', name: 'Privacy Settings', icon: 'eye-off-outline', action: () => setPrivacyVisible(true) },
    { id: 'delete', name: 'Delete Account', icon: 'trash-outline', danger: true, action: () => handleDeleteAccount() }
  ];

  const filteredSecurityItems = securityItemsList.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    setDeleteModalVisible(false);
    await AsyncStorage.removeItem('token');
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1 }}>
          
          {/* Top Navigation Header */}
          <View style={themedStyles.header}>

            {/* Left: Back Button + LEARN2CODE + Hamburger */}
            <View style={themedStyles.headerLeft}>
              <TouchableOpacity
                style={themedStyles.backButton}
                activeOpacity={0.7}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>

              {/* LEARN2CODE Gradient Brand Text */}
              <Svg width={150} height={28}>
                <Defs>
                  <LinearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#4f46e5" stopOpacity="1" />
                    <Stop offset="0.5" stopColor="#7c3aed" stopOpacity="1" />
                    <Stop offset="1" stopColor="#ec4899" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <SvgText
                  x="0"
                  y="22"
                  fontSize="18"
                  fontWeight="800"
                  fill="url(#brandGrad)"
                  letterSpacing="1.5"
                >
                  LEARN2CODE
                </SvgText>
              </Svg>

              {isMobile && (
                <TouchableOpacity
                  style={themedStyles.menuButton}
                  activeOpacity={0.7}
                  onPress={() => setDrawerVisible(true)}
                >
                  <Ionicons name="menu-outline" size={24} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>

            {/* Right: Notification + Profile */}
            <View style={themedStyles.headerRight}>

              <TouchableOpacity
                style={themedStyles.notificationBtn}
                activeOpacity={0.7}
                onPress={() => setNotificationsVisible(true)}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.text} />
                {notifications.some(n => n.unread) && (
                  <View style={themedStyles.notificationBadge}>
                    <Text style={themedStyles.notificationBadgeText}>
                      {notifications.filter(n => n.unread).length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={themedStyles.profileDropdown}
                activeOpacity={0.8}
                onPress={openEditModal}
              >
                <Image
                  source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
                  style={themedStyles.dropdownAvatar}
                />
                {!isPhone && (
                  <>
                    <Text style={themedStyles.dropdownName} numberOfLines={1}>
                      {user?.name?.split(' ')[0] || 'Annu'}
                    </Text>
                    <Ionicons name="chevron-down" size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Dashboard Body */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={themedStyles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* HERO SECTION */}
            <ImageBackground
              source={require('../assets/images/account.png')}
              style={themedStyles.heroBg}
              imageStyle={{ borderRadius: 20 }}
              resizeMode='cover'
            >
              <View style={themedStyles.heroOverlay}>
                <View style={themedStyles.heroLeft}>
                  {/* Glowing Profile Avatar with photo picker */}
                  <TouchableOpacity
                    style={themedStyles.heroAvatarWrapper}
                    activeOpacity={0.85}
                    onPress={pickImage}
                  >
                    <Image
                      source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
                      style={themedStyles.heroAvatar}
                    />
                    <View style={themedStyles.activeDot} />
                    <View style={themedStyles.cameraBadge}>
                      <Ionicons name="camera" size={12} color="#ffffff" />
                    </View>
                  </TouchableOpacity>

                  <View style={themedStyles.heroDetails}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <Text style={themedStyles.heroName}>{user?.name || 'Annu Kumari'}</Text>
                      {isPro && (
                        <View style={themedStyles.proBadge}>
                          <Text style={themedStyles.proBadgeText}>PRO</Text>
                        </View>
                      )}
                      <View style={themedStyles.levelBadge}>
                        <Text style={themedStyles.levelBadgeText}>{level}</Text>
                      </View>
                    </View>
                    <Text style={themedStyles.heroHandle}>{handle}</Text>
                    <Text style={themedStyles.heroSubText}>B.Tech IT Student</Text>
                    
                    <View style={themedStyles.heroMetaRow}>
                      <View style={themedStyles.heroMetaItem}>
                        <Ionicons name="location-outline" size={14} color="#cbd5e1" style={{ marginRight: 4 }} />
                        <Text style={themedStyles.heroMetaText}>{location}</Text>
                      </View>
                      <View style={themedStyles.heroMetaItem}>
                        <Ionicons name="calendar-outline" size={14} color="#cbd5e1" style={{ marginRight: 4 }} />
                        <Text style={themedStyles.heroMetaText}>{joined}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Edit Profile Button */}
                <TouchableOpacity
                  style={themedStyles.editProfileBtn}
                  activeOpacity={0.8}
                  onPress={openEditModal}
                >
                  <Ionicons name="create-outline" size={16} color="#4f46e5" style={{ marginRight: 6 }} />
                  <Text style={themedStyles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>

            {/* STATISTICS ROW */}
            <View style={themedStyles.statsRow}>
              {/* Flashcards Learned */}
              <View style={themedStyles.statsCard}>
                <View style={[themedStyles.statsIconWrapper, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="copy-outline" size={20} color="#2563EB" />
                </View>
                <View style={themedStyles.statsTextCol}>
                  <Text style={themedStyles.statsLabel}>Flashcards Learned</Text>
                  <Text style={themedStyles.statsVal}>{topicsLearned.toLocaleString()}</Text>
                  <Text style={themedStyles.statsSub}>Total</Text>
                </View>
              </View>

              {/* Quizzes Completed */}
              <View style={themedStyles.statsCard}>
                <View style={[themedStyles.statsIconWrapper, { backgroundColor: '#ecfdf5' }]}>
                  <Ionicons name="checkbox-outline" size={20} color="#10B981" />
                </View>
                <View style={themedStyles.statsTextCol}>
                  <Text style={themedStyles.statsLabel}>Quizzes Completed</Text>
                  <Text style={themedStyles.statsVal}>{quizzesCompleted}</Text>
                  <Text style={themedStyles.statsSub}>Total</Text>
                </View>
              </View>

              {/* Current Streak */}
              <View style={themedStyles.statsCard}>
                <View style={[themedStyles.statsIconWrapper, { backgroundColor: '#fff7ed' }]}>
                  <Ionicons name="flame" size={20} color="#F97316" />
                </View>
                <View style={themedStyles.statsTextCol}>
                  <Text style={themedStyles.statsLabel}>Current Streak</Text>
                  <Text style={themedStyles.statsVal}>{streakCount} Days</Text>
                  <Text style={themedStyles.statsSub}>Days</Text>
                </View>
              </View>

              {/* Global Rank */}
              <View style={themedStyles.statsCard}>
                <View style={[themedStyles.statsIconWrapper, { backgroundColor: '#f5f3ff' }]}>
                  <Ionicons name="trophy" size={20} color="#8B5CF6" />
                </View>
                <View style={themedStyles.statsTextCol}>
                  <Text style={themedStyles.statsLabel}>Global Rank</Text>
                  <Text style={themedStyles.statsVal}>{globalRank}</Text>
                  <Text style={themedStyles.statsSub}>Top 5% Learners</Text>
                </View>
              </View>
            </View>

            {/* DETAILS GRID - REDESIGNED GRID */}
            <View style={themedStyles.detailsGrid}>
              
              {/* LEFT PANE - Fills 2x column width on desktop */}
              <View style={themedStyles.leftPane}>
                
                {/* TOP ROW: About Me & Learning Progress side-by-side */}
                <View style={themedStyles.leftPaneRow}>
                  {/* About Me Card */}
                  <View style={themedStyles.aboutMeWrapper}>
                    <View style={themedStyles.detailCard}>
                      <View style={themedStyles.cardHeader}>
                        <Ionicons name="person-outline" size={18} color="#4f46e5" style={{ marginRight: 8 }} />
                        <Text style={themedStyles.cardTitle}>About Me</Text>
                      </View>
                      <View style={themedStyles.aboutList}>
                        <View style={themedStyles.aboutItem}>
                          <Text style={themedStyles.aboutLabel}>Full Name</Text>
                          <Text style={themedStyles.aboutValue}>{user?.name || 'Annu Kumari'}</Text>
                        </View>
                        <View style={themedStyles.aboutItem}>
                          <Text style={themedStyles.aboutLabel}>Email</Text>
                          <Text style={themedStyles.aboutValue}>{user?.email || 'annukri66@gmail.com'}</Text>
                        </View>
                        <View style={themedStyles.aboutItem}>
                          <Text style={themedStyles.aboutLabel}>Interests</Text>
                          <Text style={themedStyles.aboutValue}>{interests}</Text>
                        </View>
                        <View style={themedStyles.aboutItem}>
                          <Text style={themedStyles.aboutLabel}>Bio</Text>
                          <Text style={themedStyles.aboutValue}>{bio}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Learning Progress Card */}
                  <View style={themedStyles.learningProgressWrapper}>
                    <View style={themedStyles.detailCard}>
                      <View style={themedStyles.cardHeader}>
                        <Ionicons name="trending-up-outline" size={18} color="#4f46e5" style={{ marginRight: 8 }} />
                        <Text style={themedStyles.cardTitle}>Learning Progress</Text>
                      </View>
                      
                      <View style={themedStyles.progressRow}>
                        <CircularProgress
                          size={120}
                          strokeWidth={12}
                          percentage={78}
                          color="#3B82F6"
                          label="Overall Progress"
                          colors={colors}
                        />

                        <View style={themedStyles.progressBars}>
                          {[
                            { lang: 'Python', percent: 80, color: '#10B981' },
                            { lang: 'Java', percent: 70, color: '#3B82F6' },
                            { lang: 'C++', percent: 55, color: '#8B5CF6' },
                          ].map((item, idx) => (
                            <View key={idx} style={themedStyles.barItem}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                <Text style={themedStyles.barLangText}>{item.lang}</Text>
                                <Text style={themedStyles.barPercentText}>{item.percent}%</Text>
                              </View>
                              <View style={themedStyles.barTrack}>
                                <View style={[themedStyles.barFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>

                      <TouchableOpacity
                        style={themedStyles.detailedStatsBtn}
                        activeOpacity={0.7}
                        onPress={() => setStatsModalVisible(true)}
                      >
                        <Ionicons name="bar-chart-outline" size={16} color="#3b82f6" style={{ marginRight: 6 }} />
                        <Text style={themedStyles.detailedStatsText}>View Detailed Stats</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* BOTTOM ROW: Achievements spanning full width of left pane */}
                <View style={themedStyles.achievementsWrapper}>
                  <View style={themedStyles.detailCard}>
                    <View style={[themedStyles.cardHeader, { justifyContent: 'space-between' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="trophy-outline" size={18} color="#4f46e5" style={{ marginRight: 8 }} />
                        <Text style={themedStyles.cardTitle}>Achievements</Text>
                      </View>
                      <TouchableOpacity activeOpacity={0.6} onPress={() => navigateTo('/leaderboard')}>
                        <Text style={themedStyles.viewAllLink}>View All</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={themedStyles.badgeRow}>
                      {[
                        { icon: '🔥', title: '10 Day Streak', sub: 'Keep it up!', color: '#fff7ed' },
                        { icon: '🏆', title: 'Consistent Learner', sub: 'Study for 10 days', color: '#ecfdf5' },
                        { icon: 'code', title: 'Java Expert', sub: 'Learned 100 cards', color: '#f5f3ff' },
                        { icon: 'rocket', title: 'First Quiz', sub: 'Completed first quiz', color: '#eff6ff' },
                        { icon: 'star', title: 'Top Performer', sub: 'Top 5% rank', color: '#fdf2f8' },
                      ].map((badge, idx) => (
                        <View key={idx} style={themedStyles.badgeItem}>
                          <View style={[themedStyles.badgeIconWrapper, { backgroundColor: badge.color }]}>
                            {badge.icon === 'code' ? (
                              <Ionicons name="code-slash" size={20} color="#8B5CF6" />
                            ) : badge.icon === 'rocket' ? (
                              <Ionicons name="rocket-outline" size={20} color="#2563EB" />
                            ) : badge.icon === 'star' ? (
                              <Ionicons name="star" size={20} color="#EC4899" />
                            ) : (
                              <Text style={{ fontSize: 20 }}>{badge.icon}</Text>
                            )}
                          </View>
                          <Text style={themedStyles.badgeTitle} numberOfLines={1}>{badge.title}</Text>
                          <Text style={themedStyles.badgeSub} numberOfLines={1}>{badge.sub}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

              </View>

              {/* RIGHT PANE - Fills 1x column width on desktop */}
              <View style={themedStyles.rightPane}>
                
                {/* Profile Completion Card */}
                <View style={themedStyles.detailCard}>
                  <View style={themedStyles.cardHeader}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#4f46e5" style={{ marginRight: 8 }} />
                    <Text style={themedStyles.cardTitle}>Profile Completion</Text>
                  </View>

                  <View style={themedStyles.completionRow}>
                    <CircularProgress
                      size={90}
                      strokeWidth={9}
                      percentage={completionPercentage}
                      color="#10B981"
                      colors={colors}
                    />
                    
                    <View style={themedStyles.checklist}>
                      <Text style={themedStyles.completionSubtitle}>Complete your profile to unlock more features.</Text>
                      {checklistItems.map((item, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={themedStyles.checklistItem}
                          activeOpacity={item.id === 'email' ? 0.7 : 1}
                          onPress={item.id === 'email' ? handleVerifyEmail : undefined}
                        >
                          <Ionicons
                            name={item.checked ? "checkmark-circle" : "ellipse-outline"}
                            size={16}
                            color={item.checked ? "#10B981" : colors.textSecondary}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={[themedStyles.checklistText, item.checked && themedStyles.checklistTextChecked]}>
                            {item.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {completionPercentage < 100 && (
                    <TouchableOpacity
                      style={themedStyles.completeNowBtn}
                      activeOpacity={0.8}
                      onPress={handleCompleteNow}
                    >
                      <Text style={themedStyles.completeNowText}>Complete Now</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Account & Security Card */}
                <View style={themedStyles.detailCard}>
                  <View style={themedStyles.cardHeader}>
                    <Ionicons name="lock-closed-outline" size={18} color="#4f46e5" style={{ marginRight: 8 }} />
                    <Text style={themedStyles.cardTitle}>Account & Security</Text>
                  </View>
                  
                  <View style={themedStyles.securityList}>
                    {filteredSecurityItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={themedStyles.securityItem}
                        activeOpacity={0.7}
                        onPress={item.action}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons
                            name={item.icon as any}
                            size={18}
                            color={item.danger ? "#EF4444" : colors.text}
                            style={{ marginRight: 12 }}
                          />
                          <Text style={[themedStyles.securityText, item.danger && { color: '#EF4444' }]}>
                            {item.name}
                          </Text>
                          {item.badge && (
                            <View style={themedStyles.newBadge}>
                              <Text style={themedStyles.newBadgeText}>{item.badge}</Text>
                            </View>
                          )}
                        </View>
                        {!item.danger && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
                      </TouchableOpacity>
                    ))}
                    {filteredSecurityItems.length === 0 && (
                      <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 10 }}>
                        No settings matched your search query.
                      </Text>
                    )}
                  </View>
                </View>

              </View>

            </View>
          </ScrollView>
      </View>

      {/* COLLAPSIBLE DRAWER MODAL */}
      {isMobile && (
        <Modal
          visible={drawerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDrawerVisible(false)}
        >
          <View style={themedStyles.drawerOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setDrawerVisible(false)} />
            
            <View style={themedStyles.drawerBody}>
              <View style={themedStyles.drawerHeader}>
                <Image
                  source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
                  style={themedStyles.drawerAvatar}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={themedStyles.drawerName} numberOfLines={1}>{user?.name || 'Annu Kumari'}</Text>
                  <Text style={themedStyles.drawerEmail} numberOfLines={1}>{user?.email || 'annukri66@gmail.com'}</Text>
                </View>
              </View>

              <ScrollView style={{ flex: 1, padding: 12 }}>
                {[
                  { name: 'Dashboard', icon: 'grid-outline', route: '/home' },
                  { name: 'My Learning', icon: 'book-outline', route: '/learn' },
                  { name: 'Flashcards', icon: 'copy-outline', route: '/flashcards' },
                  { name: 'Quizzes', icon: 'help-circle-outline', route: '/mcq' },
                  { name: 'Achievements', icon: 'trophy-outline', route: '/leaderboard' },
                  { name: 'Stats', icon: 'bar-chart-outline', route: '/home' },
                  { name: 'Profile', icon: 'person', route: '/account', active: true },
                ].map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[themedStyles.drawerLink, item.active && themedStyles.drawerLinkActive]}
                    activeOpacity={0.7}
                    onPress={() => navigateTo(item.route)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.active ? '#4f46e5' : colors.textSecondary}
                      style={{ marginRight: 14 }}
                    />
                    <Text style={[themedStyles.drawerLinkText, item.active && themedStyles.drawerLinkTextActive]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}

                <View style={themedStyles.divider} />

                <TouchableOpacity
                  style={themedStyles.drawerLink}
                  activeOpacity={0.7}
                  onPress={() => {
                    setDrawerVisible(false);
                    toggleTheme();
                  }}
                >
                  <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={20} color={colors.textSecondary} style={{ marginRight: 14 }} />
                  <Text style={[themedStyles.drawerLinkText, { color: colors.text }]}>
                    {isDark ? 'Light Theme' : 'Dark Theme'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={themedStyles.drawerLink}
                  activeOpacity={0.7}
                  onPress={() => {
                    setDrawerVisible(false);
                    logout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 14 }} />
                  <Text style={[themedStyles.drawerLinkText, { color: '#EF4444' }]}>Logout</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalBody}>
            <View style={themedStyles.modalHeader}>
              <Text style={themedStyles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              <View style={themedStyles.inputGroup}>
                <Text style={themedStyles.inputLabel}>Full Name</Text>
                <TextInput
                  value={formName}
                  onChangeText={setFormName}
                  style={themedStyles.textInput}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.placeholderText}
                />
              </View>

              <View style={themedStyles.inputGroup}>
                <Text style={themedStyles.inputLabel}>Username / Handle</Text>
                <TextInput
                  value={formHandle}
                  onChangeText={setFormHandle}
                  style={themedStyles.textInput}
                  placeholder="Enter username handle"
                  placeholderTextColor={colors.placeholderText}
                />
              </View>

              <View style={themedStyles.inputGroup}>
                <Text style={themedStyles.inputLabel}>Bio</Text>
                <TextInput
                  value={formBio}
                  onChangeText={setFormBio}
                  style={[themedStyles.textInput, { height: 80, textAlignVertical: 'top' }]}
                  multiline={true}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={colors.placeholderText}
                />
              </View>

              <View style={themedStyles.inputGroup}>
                <Text style={themedStyles.inputLabel}>Interests (comma separated)</Text>
                <TextInput
                  value={formInterests}
                  onChangeText={setFormInterests}
                  style={themedStyles.textInput}
                  placeholder="e.g. Web Development, DSA"
                  placeholderTextColor={colors.placeholderText}
                />
              </View>

              <View style={themedStyles.inputGroup}>
                <Text style={themedStyles.inputLabel}>Location</Text>
                <TextInput
                  value={formLocation}
                  onChangeText={setFormLocation}
                  style={themedStyles.textInput}
                  placeholder="e.g. India"
                  placeholderTextColor={colors.placeholderText}
                />
              </View>

              <View style={themedStyles.inputGroup}>
                <Text style={themedStyles.inputLabel}>Joined Date</Text>
                <TextInput
                  value={formJoined}
                  onChangeText={setFormJoined}
                  style={themedStyles.textInput}
                  placeholder="e.g. Joined June 2026"
                  placeholderTextColor={colors.placeholderText}
                />
              </View>

              <View style={themedStyles.inputGroup}>
                <Text style={themedStyles.inputLabel}>Level</Text>
                <TextInput
                  value={formLevel}
                  onChangeText={setFormLevel}
                  style={themedStyles.textInput}
                  placeholder="e.g. Level 12"
                  placeholderTextColor={colors.placeholderText}
                />
              </View>

              <View style={themedStyles.inputGroup}>
                <Text style={themedStyles.inputLabel}>Profile Photo</Text>

                {/* Preview */}
                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                  <Image
                    source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
                    style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: colors.border }}
                  />
                </View>

                {/* Choose Photo Button */}
                <TouchableOpacity style={themedStyles.imageSelectBtn} onPress={pickImage} activeOpacity={0.7}>
                  <Ionicons name="image-outline" size={18} color="#4f46e5" style={{ marginRight: 8 }} />
                  <Text style={themedStyles.imageSelectText}>Choose custom photo</Text>
                </TouchableOpacity>

                {/* Remove Photo Button — only shown when a photo is set */}
                {profilePic && (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 10,
                      paddingVertical: 11,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: '#ef4444',
                      backgroundColor: '#fef2f2',
                    }}
                    activeOpacity={0.7}
                    onPress={async () => {
                      setProfilePic(null);
                      await AsyncStorage.removeItem('@profile_photo');
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#ef4444' }}>Remove Photo</Text>
                  </TouchableOpacity>
                )}
              </View>


              <View style={themedStyles.modalActionRow}>
                <TouchableOpacity
                  style={[themedStyles.modalBtn, { backgroundColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={[themedStyles.modalBtnText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[themedStyles.modalBtn, { backgroundColor: '#4f46e5' }]}
                  activeOpacity={0.8}
                  onPress={saveProfileDetails}
                >
                  <Text style={[themedStyles.modalBtnText, { color: '#ffffff' }]}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={passwordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalBody}>
            <View style={themedStyles.modalHeader}>
              <Text style={themedStyles.modalTitle}>Change Password</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              <View style={themedStyles.inputGroup}>
                <Text style={themedStyles.inputLabel}>Current Password</Text>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  style={themedStyles.textInput}
                  secureTextEntry={true}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.placeholderText}
                />
              </View>

              <View style={themedStyles.inputGroup}>
                <Text style={themedStyles.inputLabel}>New Password</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={themedStyles.textInput}
                  secureTextEntry={true}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.placeholderText}
                />
              </View>

              <View style={themedStyles.inputGroup}>
                <Text style={themedStyles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={themedStyles.textInput}
                  secureTextEntry={true}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.placeholderText}
                />
              </View>

              <View style={themedStyles.modalActionRow}>
                <TouchableOpacity
                  style={[themedStyles.modalBtn, { backgroundColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => setPasswordModalVisible(false)}
                >
                  <Text style={[themedStyles.modalBtnText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[themedStyles.modalBtn, { backgroundColor: '#4f46e5' }]}
                  activeOpacity={0.8}
                  onPress={handlePasswordChange}
                >
                  <Text style={[themedStyles.modalBtnText, { color: '#ffffff' }]}>Update Password</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PRO UPGRADE SUBSCRIPTION MODAL */}
      <Modal
        visible={proModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProModalVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalBody}>
            <View style={themedStyles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="ribbon" size={24} color="#F59E0B" style={{ marginRight: 8 }} />
                <Text style={themedStyles.modalTitle}>Upgrade to Learn2Code Pro</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setProModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              <Text style={{ color: colors.textSecondary, marginBottom: 20, textAlign: 'center', fontSize: 14 }}>
                Unlock access to premium coding analytics, infinite decks, custom exam creation, and an ad-free interface.
              </Text>

              {/* Pricing Cards */}
              <View style={{ gap: 16, marginBottom: 20 }}>
                {/* Monthly */}
                <TouchableOpacity
                  style={themedStyles.priceOptionCard}
                  activeOpacity={0.85}
                  onPress={() => handleSubscribePro('Monthly')}
                >
                  <View>
                    <Text style={themedStyles.priceOptionTitle}>Monthly Membership</Text>
                    <Text style={themedStyles.priceOptionDesc}>Full access billed month-to-month</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={themedStyles.priceOptionCost}>$4.99</Text>
                    <Text style={themedStyles.priceOptionPeriod}>/ month</Text>
                  </View>
                </TouchableOpacity>

                {/* Yearly */}
                <TouchableOpacity
                  style={[themedStyles.priceOptionCard, { borderColor: '#4f46e5', borderWidth: 2 }]}
                  activeOpacity={0.85}
                  onPress={() => handleSubscribePro('Yearly')}
                >
                  <View style={themedStyles.popularBadge}>
                    <Text style={themedStyles.popularBadgeText}>Best Value</Text>
                  </View>
                  <View>
                    <Text style={themedStyles.priceOptionTitle}>Annual Membership</Text>
                    <Text style={themedStyles.priceOptionDesc}>Save 33% over monthly pricing</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={themedStyles.priceOptionCost}>$39.99</Text>
                    <Text style={themedStyles.priceOptionPeriod}>/ year</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[themedStyles.completeNowBtn, { marginBottom: 20 }]}
                onPress={() => handleSubscribePro('Trial')}
              >
                <Text style={themedStyles.completeNowText}>Start 7-Day Free Trial</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* NOTIFICATIONS DROPDOWN MODAL */}
      <Modal
        visible={notificationsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={[themedStyles.modalBody, { maxHeight: 450 }]}>
            <View style={themedStyles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="notifications-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
                <Text style={themedStyles.modalTitle}>Notifications</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <TouchableOpacity onPress={handleMarkNotificationsRead}>
                  <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '700' }}>Mark read</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} onPress={() => setNotificationsVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {notifications.map(n => (
                <View key={n.id} style={[themedStyles.notificationItem, n.unread && themedStyles.notificationUnread]}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={themedStyles.notificationTitle}>{n.title}</Text>
                      <Text style={themedStyles.notificationTime}>{n.time}</Text>
                    </View>
                    <Text style={themedStyles.notificationDesc}>{n.desc}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* VIEW DETAILED STATS MODAL */}
      <Modal
        visible={statsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setStatsModalVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalBody}>
            <View style={themedStyles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="bar-chart-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
                <Text style={themedStyles.modalTitle}>Detailed Learning Analytics</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setStatsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              <View style={themedStyles.statsSummaryGrid}>
                <View style={themedStyles.statsSummaryBox}>
                  <Text style={themedStyles.statsSummaryNum}>240m</Text>
                  <Text style={themedStyles.statsSummaryLabel}>Study Time</Text>
                </View>
                <View style={themedStyles.statsSummaryBox}>
                  <Text style={themedStyles.statsSummaryNum}>{quizzesCompleted}</Text>
                  <Text style={themedStyles.statsSummaryLabel}>Quizzes Done</Text>
                </View>
                <View style={themedStyles.statsSummaryBox}>
                  <Text style={themedStyles.statsSummaryNum}>80%</Text>
                  <Text style={themedStyles.statsSummaryLabel}>Avg Score</Text>
                </View>
              </View>

              <Text style={themedStyles.graphTitle}>Weekly Study Minutes</Text>
              
              {/* SVG Study Time Graph */}
              <View style={{ alignItems: 'center', marginVertical: 14 }}>
                <Svg width="300" height="150">
                  {/* Grid Lines */}
                  <Rect x="0" y="0" width="300" height="120" fill={isDark ? '#1e293b' : '#f8fafc'} rx="10" />
                  
                  {/* Bars representing daily mins (Mon-Sun) */}
                  {[20, 45, 15, 30, 60, 10, 40].map((val, idx) => {
                    const barHeight = (val / 60) * 100;
                    const x = 25 + idx * 38;
                    const y = 110 - barHeight;
                    return (
                      <G key={idx}>
                        <Rect
                          x={x}
                          y={y}
                          width="18"
                          height={barHeight}
                          fill="#3B82F6"
                          rx="4"
                        />
                        <SvgText
                          x={x + 9}
                          y="135"
                          fill={colors.textSecondary}
                          fontSize="9"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                        </SvgText>
                        <SvgText
                          x={x + 9}
                          y={y - 4}
                          fill={colors.text}
                          fontSize="8"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {val}m
                        </SvgText>
                      </G>
                    );
                  })}
                </Svg>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* TWO-FACTOR AUTHENTICATION SETUP MODAL */}
      <Modal
        visible={twoFactorVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTwoFactorVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalBody}>
            <View style={themedStyles.modalHeader}>
              <Text style={themedStyles.modalTitle}>Two-Factor Authentication (2FA)</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setTwoFactorVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 24, alignItems: 'center' }}>
              <Ionicons
                name={twoFactorEnabled ? "shield-checkmark" : "shield-outline"}
                size={54}
                color={twoFactorEnabled ? "#10B981" : "#F59E0B"}
                style={{ marginBottom: 14 }}
              />
              
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
                {twoFactorEnabled ? '2FA is currently ENABLED' : 'Enable 2FA Protection'}
              </Text>
              
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 20, textAlign: 'center', lineHeight: 18 }}>
                Protect your account by adding an extra layer of security. Verify logins with an authenticator app (like Google Authenticator).
              </Text>

              {!twoFactorEnabled && (
                <View style={themedStyles.mockQrCode}>
                  <Text style={{ color: '#475569', fontSize: 10, fontWeight: 'bold' }}>SCAN QR CODE</Text>
                  <Svg width="80" height="80" style={{ marginVertical: 8 }}>
                    <Rect x="0" y="0" width="80" height="80" fill="#0f172a" />
                    <Rect x="10" y="10" width="20" height="20" fill="#ffffff" />
                    <Rect x="50" y="10" width="20" height="20" fill="#ffffff" />
                    <Rect x="10" y="50" width="20" height="20" fill="#ffffff" />
                    <Rect x="35" y="35" width="10" height="10" fill="#ffffff" />
                  </Svg>
                  <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '600' }}>Secret: L2C-SEC-KEY-77</Text>
                </View>
              )}

              <TouchableOpacity
                style={[themedStyles.completeNowBtn, { width: '100%', backgroundColor: twoFactorEnabled ? '#EF4444' : '#10B981' }]}
                onPress={handleToggle2FA}
              >
                <Text style={themedStyles.completeNowText}>
                  {twoFactorEnabled ? 'Disable 2FA Protection' : 'Enable 2FA Protection'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* LOGIN DEVICES MODAL */}
      <Modal
        visible={devicesVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDevicesVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalBody}>
            <View style={themedStyles.modalHeader}>
              <Text style={themedStyles.modalTitle}>Active Sessions</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setDevicesVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 16 }}>
                These devices are currently logged into your Learn2Code account. You can log out of other sessions if you suspect suspicious activity.
              </Text>

              <View style={{ gap: 14, marginBottom: 20 }}>
                {activeDevices.map(d => (
                  <View key={d.id} style={themedStyles.deviceItem}>
                    <View style={[themedStyles.deviceIconWrapper, d.current && { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                      <Ionicons name={d.icon as any} size={20} color={d.current ? '#4f46e5' : colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={themedStyles.deviceName}>{d.name}</Text>
                      <Text style={themedStyles.deviceStatus}>{d.status}</Text>
                    </View>
                    {!d.current && (
                      <TouchableOpacity
                        style={themedStyles.deviceLogoutBtn}
                        onPress={() => handleRemoveDevice(d.id)}
                      >
                        <Text style={themedStyles.deviceLogoutBtnText}>Log Out</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PRIVACY SETTINGS MODAL */}
      <Modal
        visible={privacyVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPrivacyVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalBody}>
            <View style={themedStyles.modalHeader}>
              <Text style={themedStyles.modalTitle}>Privacy Settings</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setPrivacyVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20 }}>
              <View style={{ gap: 18, marginBottom: 24 }}>
                {/* Public Profile */}
                <View style={themedStyles.privacyToggleRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={themedStyles.privacyToggleTitle}>Public Profile Visibility</Text>
                    <Text style={themedStyles.privacyToggleDesc}>Allow other users to view your bio, stats, and achievements.</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPrivacySettings(prev => ({ ...prev, publicProfile: !prev.publicProfile }))}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={privacySettings.publicProfile ? "toggle" : "toggle-outline"}
                      size={44}
                      color={privacySettings.publicProfile ? "#10B981" : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Leaderboard Sharing */}
                <View style={themedStyles.privacyToggleRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={themedStyles.privacyToggleTitle}>Leaderboard Rankings</Text>
                    <Text style={themedStyles.privacyToggleDesc}>Participate in competitive leaderboards based on points earned.</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPrivacySettings(prev => ({ ...prev, leaderboardShare: !prev.leaderboardShare }))}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={privacySettings.leaderboardShare ? "toggle" : "toggle-outline"}
                      size={44}
                      color={privacySettings.leaderboardShare ? "#10B981" : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Data Sharing */}
                <View style={themedStyles.privacyToggleRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={themedStyles.privacyToggleTitle}>Anonymized Analytics Data</Text>
                    <Text style={themedStyles.privacyToggleDesc}>Help improve courses by sharing study statistics anonymously.</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPrivacySettings(prev => ({ ...prev, dataSharing: !prev.dataSharing }))}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={privacySettings.dataSharing ? "toggle" : "toggle-outline"}
                      size={44}
                      color={privacySettings.dataSharing ? "#10B981" : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={themedStyles.completeNowBtn}
                onPress={handleSavePrivacy}
              >
                <Text style={themedStyles.completeNowText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={[themedStyles.modalBody, { maxWidth: 380, width: '90%', borderRadius: 24, overflow: 'hidden' }]}>

            {/* Red top accent bar */}
            <View style={{ height: 5, backgroundColor: '#ef4444', width: '100%' }} />

            <View style={{ padding: 28, alignItems: 'center' }}>

              {/* Warning Icon */}
              <View style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: '#fef2f2',
                justifyContent: 'center', alignItems: 'center',
                marginBottom: 18,
              }}>
                <Ionicons name="warning" size={36} color="#ef4444" />
              </View>

              {/* Title */}
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 10, textAlign: 'center' }}>
                Delete Account?
              </Text>

              {/* Description */}
              <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 8 }}>
                This will permanently delete your account and all associated data including:
              </Text>

              {/* Bullet list */}
              <View style={{ width: '100%', marginBottom: 22, gap: 6 }}>
                {[
                  'All flashcards and progress',
                  'Quiz history and scores',
                  'Achievements and streak data',
                  'Profile and personal info',
                ].map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="close-circle" size={15} color="#ef4444" />
                    <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500' }}>{item}</Text>
                  </View>
                ))}
              </View>

              <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: '700', marginBottom: 24, textAlign: 'center' }}>
                ⚠️  This action is irreversible and cannot be undone.
              </Text>

              {/* Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity
                  style={{
                    flex: 1, paddingVertical: 14, borderRadius: 14,
                    borderWidth: 1.5, borderColor: colors.border,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                  activeOpacity={0.7}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1, paddingVertical: 14, borderRadius: 14,
                    backgroundColor: '#ef4444',
                    alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'row', gap: 6,
                  }}
                  activeOpacity={0.8}
                  onPress={confirmDeleteAccount}
                >
                  <Ionicons name="trash-outline" size={16} color="#ffffff" />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>Delete Account</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </View>
      </Modal>

    </View>

  );
}



// Generate styles
const getStyles = (colors: any, isDark: boolean, isMobile: boolean, screenWidth: number) => {
  const isPhone = screenWidth < 768;

  return StyleSheet.create({
    sidebar: {
      width: 280,
      backgroundColor: colors.card,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      padding: 24,
      justifyContent: 'space-between',
    },
    sidebarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 30,
    },
    brandLogo: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: '#4f46e5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    brandLogoText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    brandName: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 0.5,
    },
    brandSub: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    sidebarLink: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 4,
    },
    sidebarLinkActive: {
      backgroundColor: '#4f46e5',
    },
    sidebarLinkText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    sidebarLinkTextActive: {
      color: '#ffffff',
    },
    proCard: {
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginTop: 20,
    },
    proCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    proCardTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 8,
    },
    proCardList: {
      marginBottom: 14,
    },
    proCardListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    proCardListText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    proCardBtn: {
      backgroundColor: '#453ec7',
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
    },
    proCardBtnText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '700',
    },
    header: {
      height: 70,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: isPhone ? 16 : 24,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      maxWidth: 400,
    },
    backButton: {
      padding: 8,
      marginRight: 6,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    },
    menuButton: {
      padding: 8,
      marginRight: 10,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 40,
      flex: 1,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      paddingVertical: 0,
    },
    shortcutBadge: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    shortcutText: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    notificationBtn: {
      position: 'relative',
      padding: 8,
    },
    notificationBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: '#ef4444',
      borderRadius: 8,
      width: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationBadgeText: {
      color: '#ffffff',
      fontSize: 9,
      fontWeight: 'bold',
    },
    profileDropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
    },
    dropdownAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    dropdownName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
    },
    scrollContainer: {
      padding: isPhone ? 16 : 24,
      gap: 24,
    },
    heroBg: {
      overflow: 'hidden',
      height:250,
      width:1250,
      
    },
    heroOverlay: {
      flexDirection: isPhone ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isPhone ? 'flex-start' : 'center',
      padding: isPhone ? 20 : 32,
      borderRadius: 20,
      gap: 16,
    },
    heroLeft: {
      flexDirection: isPhone ? 'column' : 'row',
      alignItems: isPhone ? 'flex-start' : 'center',
      gap: 20,
    },
    heroAvatarWrapper: {
      position: 'relative',
    },
    heroAvatar: {
      width: isPhone ? 80 : 100,
      height: isPhone ? 80 : 100,
      borderRadius: isPhone ? 40 : 50,
      borderWidth: 4,
      borderColor: 'rgba(255,255,255,0.7)',
    },
    activeDot: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#10b981',
      borderWidth: 3,
      borderColor: '#ffffff',
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 2,
      left: 2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#4f46e5',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#ffffff',
    },
    heroDetails: {
      gap: 4,
    },
    heroName: {
      fontSize: isPhone ? 22 : 28,
      fontWeight: '800',
      color: '#ffffff',
    },
    proBadge: {
      backgroundColor: '#4f46e5',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    proBadgeText: {
      color: '#ffffff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    levelBadge: {
      backgroundColor: 'rgba(79, 70, 229, 0.7)',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
    },
    levelBadgeText: {
      color: '#ffffff',
      fontSize: 11,
      fontWeight: 'bold',
    },
    heroHandle: {
      fontSize: 14,
      color: '#e2e8f0',
      fontWeight: '500',
    },
    heroSubText: {
      fontSize: 14,
      color: '#cecfd2',
      fontWeight: '500',
      marginTop: 2,
    },
    heroMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 16,
      marginTop: 8,
    },
    heroMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    heroMetaText: {
      fontSize: 12,
      color: '#e1e5ea',
      fontWeight: '600',
    },
    editProfileBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignSelf: isPhone ? 'stretch' : 'auto',
      justifyContent: 'center',
    },
    editProfileText: {
      color: '#4f46e5',
      fontSize: 14,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    statsCard: {
      flex: 1,
      minWidth: isPhone ? '100%' : '47%',
      maxWidth: isMobile ? undefined : 280,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    statsIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsTextCol: {
      flex: 1,
      gap: 2,
    },
    statsLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    statsVal: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    statsSub: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '500',
    },

    // Redesigned Grid Parent
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 20,
      width: '100%',
    },
    
    // Left pane with 2x width on desktop
    leftPane: {
      flex: isMobile ? undefined : 2,
      width: isMobile ? '100%' : 'auto',
      gap: 20,
    },
    leftPaneRow: {
      flexDirection: isPhone ? 'column' : 'row',
      gap: 20,
      width: '100%',
    },
    aboutMeWrapper: {
      flex: isPhone ? undefined : 1,
      width: isPhone ? '100%' : 'auto',
    },
    learningProgressWrapper: {
      flex: isPhone ? undefined : 1,
      width: isPhone ? '100%' : 'auto',
    },
    achievementsWrapper: {
      width: '100%',
      
    },

    // Right pane with 1x width on desktop
    rightPane: {
      flex: isMobile ? undefined : 1,
      width: isMobile ? '100%' : 'auto',
      gap: 20,
    },

    detailCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      padding: 24,
      gap: 16,
     
      justifyContent: 'flex-start',
      
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    viewAllLink: {
      color: '#3b82f6',
      fontSize: 12,
      fontWeight: '700',
    },
    aboutList: {
      gap: 12,
    },
    aboutItem: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 8,
    },
    aboutLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 3,
    },
    aboutValue: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
      lineHeight: 18,
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'space-between',
    },
    badgeItem: {
      width: isPhone ? '46%' : '17%',
      flexGrow: 1,
      alignItems: 'center',
      padding: 10,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
    },
    badgeIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    badgeTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    badgeSub: {
      fontSize: 9,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
    progressRow: {
      flexDirection: isPhone ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      gap: 16,
      paddingVertical: 4,
    },
    progressBars: {
      flex: 1,
      width: '100%',
      gap: 10,
    },
    barItem: {
      width: '100%',
    },
    barLangText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    barPercentText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    barTrack: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 3,
    },
    detailedStatsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#3b82f6',
      marginTop: 6,
    },
    detailedStatsText: {
      color: '#3b82f6',
      fontSize: 13,
      fontWeight: '700',
    },
    completionRow: {
      flexDirection: isPhone ? 'column' : 'row',
      alignItems: 'center',
      gap: 16,
    },
    checklist: {
      flex: 1,
      gap: 8,
    },
    completionSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
      lineHeight: 16,
    },
    checklistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 2,
    },
    checklistText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    checklistTextChecked: {
      color: colors.text,
      textDecorationLine: 'line-through',
    },
    completeNowBtn: {
      backgroundColor: '#4f46e5',
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 4,
    },
    completeNowText: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '700',
    },
    securityList: {
      gap: 2,
    },
    securityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    securityText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    newBadge: {
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      marginLeft: 8,
    },
    newBadgeText: {
      color: '#4f46e5',
      fontSize: 9,
      fontWeight: 'bold',
    },
    drawerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-start',
    },
    drawerBody: {
      width: 290,
      height: '100%',
      backgroundColor: colors.card,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      paddingVertical: 20,
    },
    drawerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    drawerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    drawerName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      maxWidth: 180,
    },
    drawerEmail: {
      fontSize: 11,
      color: colors.textSecondary,
      maxWidth: 180,
    },
    drawerLink: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginBottom: 4,
    },
    drawerLinkActive: {
      backgroundColor: isDark ? 'rgba(79, 70, 229, 0.15)' : '#eef2ff',
    },
    drawerLinkText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    drawerLinkTextActive: {
      color: '#4f46e5',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 10,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalBody: {
      width: '100%',
      maxWidth: 500,
      maxHeight: '90%',
      backgroundColor: colors.card,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
    },
    textInput: {
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text,
    },
    imageSelectBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#f0f2f5',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
    },
    imageSelectText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#4f46e5',
    },
    modalActionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 10,
      marginBottom: 20,
    },
    modalBtn: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      minWidth: 100,
      alignItems: 'center',
    },
    modalBtnText: {
      fontSize: 14,
      fontWeight: '700',
    },

    // Upgrade pricing card styles
    priceOptionCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 18,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      position: 'relative',
    },
    popularBadge: {
      position: 'absolute',
      top: -10,
      right: 18,
      backgroundColor: '#4f46e5',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    popularBadgeText: {
      color: '#ffffff',
      fontSize: 9,
      fontWeight: 'bold',
    },
    priceOptionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    priceOptionDesc: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    priceOptionCost: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.text,
    },
    priceOptionPeriod: {
      fontSize: 10,
      color: colors.textSecondary,
    },

    // Notification lists items
    notificationItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    notificationUnread: {
      backgroundColor: isDark ? 'rgba(79, 70, 229, 0.08)' : '#f5f7ff',
    },
    notificationTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    notificationTime: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    notificationDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      lineHeight: 16,
    },

    // Stats Analytics styles
    statsSummaryGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },
    statsSummaryBox: {
      flex: 1,
      padding: 16,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    statsSummaryNum: {
      fontSize: 20,
      fontWeight: '800',
      color: '#3B82F6',
    },
    statsSummaryLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
      marginTop: 4,
    },
    graphTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginTop: 10,
      marginBottom: 8,
    },

    // 2FA Mock QR Code styles
    mockQrCode: {
      padding: 16,
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      alignItems: 'center',
      marginBottom: 20,
      width: '100%',
    },

    // Devices lists items styles
    deviceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    deviceIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deviceName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    deviceStatus: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    deviceLogoutBtn: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    deviceLogoutBtnText: {
      color: '#EF4444',
      fontSize: 12,
      fontWeight: '700',
    },

    // Privacy Toggles layout styles
    privacyToggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 14,
    },
    privacyToggleTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    privacyToggleDesc: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 16,
    },
  });
};

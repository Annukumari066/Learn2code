import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  Animated,
  Platform,
  useWindowDimensions,
  DimensionValue,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
  Line,
  Circle,
  Text as SvgText,
  Rect,
  G,
} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '../config';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';


const logos = {
  C: require('../assets/images/c.png'),
  'C++': require('../assets/images/cpp.png'),
  Java: require('../assets/images/java.png'),
  Python: require('../assets/images/python.png'),
};

// Milestone Slider component matching the design mockup
const MilestoneSlider = ({ streakCount, isDark, colors, style }: any) => {
  let activeWidth: DimensionValue = '0%';
  if (streakCount === 2) {
    activeWidth = '50%';
  } else if (streakCount === 3) {
    activeWidth = '66%';
  } else if (streakCount === 4) {
    activeWidth = '83%';
  } else if (streakCount >= 5) {
    activeWidth = '100%';
  }

  return (
    <View style={[sliderStyles.sliderCard, {
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
    }, style]}>
      <View style={sliderStyles.sliderHeader}>
        <View style={sliderStyles.sliderHeaderLeft}>
          <Text style={sliderStyles.streakEmoji}>🔥</Text>
          <Text style={[sliderStyles.streakTitle, { color: colors.text }]}>
            {streakCount} Day Streak
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/account')}>
          <Text style={sliderStyles.viewDetailsText}>View Details &gt;</Text>
        </TouchableOpacity>
      </View>

      <View style={sliderStyles.sliderTrackContainer}>
        {/* Track Line Background */}
        <View style={[sliderStyles.trackBg, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />
        
        {/* Active Line (Orange) */}
        <View style={[sliderStyles.trackActive, { width: activeWidth }]} />

        {/* Node 1: Left */}
        <View style={[
          sliderStyles.node, 
          sliderStyles.nodeLeft, 
          streakCount >= 1 && sliderStyles.nodeActive,
          { borderColor: isDark ? '#334155' : '#E2E8F0' }
        ]}>
          <Text style={[sliderStyles.nodeNumberAbove, streakCount >= 1 && sliderStyles.nodeNumberActive]}>
            1
          </Text>
          <Text style={sliderStyles.nodeLabelBelow}>day</Text>
        </View>

        {/* Node 2: Middle */}
        <View style={[
          sliderStyles.node, 
          sliderStyles.nodeMiddle, 
          streakCount >= 2 && sliderStyles.nodeActive,
          { borderColor: isDark ? '#334155' : '#E2E8F0' }
        ]}>
          <Text style={[sliderStyles.nodeNumberAbove, streakCount >= 2 && sliderStyles.nodeNumberActive]}>
            2
          </Text>
          <Text style={sliderStyles.nodeLabelBelow}>days</Text>
        </View>

        {/* Node 3: Right (Star) */}
        <View style={[
          sliderStyles.nodeStar, 
          sliderStyles.nodeRight, 
          streakCount >= 5 && sliderStyles.nodeActiveStar,
          { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }
        ]}>
          <Ionicons
            name={streakCount >= 5 ? "star" : "star-outline"}
            size={13}
            color={streakCount >= 5 ? "#F59E0B" : (isDark ? "#94A3B8" : "#64748B")}
          />
          <Text style={sliderStyles.milestoneTextLabel}>5-Day Milestone</Text>
        </View>
      </View>
    </View>
  );
};

// High-fidelity progress area chart
// High-fidelity progress area chart
const OverallProgressChart = ({
  isDark,
  colors,
  dates = ["Mar 12", "Mar 13", "Mar 14", "Mar 15", "Mar 16", "Mar 17", "Mar 18"],
  codingValues = [12.5, 43.75, 37.5, 56.25, 68.75, 75, 87.5],
  problemSolvingValues = [3.125, 25, 25, 37.5, 50, 56.25, 68.75],
  conceptualValues = [0, 12.5, 12.5, 25, 31.25, 37.5, 43.75]
}: any) => {
  const getSplinePath = (vals: number[]) => {
    const xCoords = [50, 120, 190, 260, 330, 400, 470];
    const yValues = vals.map(v => 200 - 1.6 * Math.max(0, Math.min(100, v)));
    let path = `M ${xCoords[0]} ${yValues[0]}`;
    for (let i = 0; i < 6; i++) {
      const cp1_x = xCoords[i] + 35;
      const cp2_x = xCoords[i] + 35;
      const cp1_y = yValues[i] + (yValues[i+1] - yValues[i]) * 0.5;
      const cp2_y = yValues[i+1];
      path += ` C ${cp1_x} ${cp1_y}, ${cp2_x} ${cp2_y}, ${xCoords[i+1]} ${yValues[i+1]}`;
    }
    return { path, yLast: yValues[6] };
  };

  const codingInfo = getSplinePath(codingValues);
  const problemSolvingInfo = getSplinePath(problemSolvingValues);
  const conceptualInfo = getSplinePath(conceptualValues);

  return (
    <Svg width="100%" height="220" viewBox="0 0 500 220" style={{ overflow: 'visible' }}>
      <Defs>
        <SvgLinearGradient id="colorCoding" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
          <Stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
        </SvgLinearGradient>
        <SvgLinearGradient id="colorProblemSolving" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
          <Stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
        </SvgLinearGradient>
        <SvgLinearGradient id="colorConceptual" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
          <Stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
        </SvgLinearGradient>
      </Defs>

      {/* Grid Lines */}
      <Line x1="40" y1="40" x2="480" y2="40" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="4 4" />
      <Line x1="40" y1="80" x2="480" y2="80" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="4 4" />
      <Line x1="40" y1="120" x2="480" y2="120" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="4 4" />
      <Line x1="40" y1="160" x2="480" y2="160" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="4 4" />
      <Line x1="40" y1="200" x2="480" y2="200" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />

      {/* X Axis Labels */}
      <SvgText x="50" y="215" fill={colors.textSecondary} fontSize="10" textAnchor="middle">{dates[0]}</SvgText>
      <SvgText x="120" y="215" fill={colors.textSecondary} fontSize="10" textAnchor="middle">{dates[1]}</SvgText>
      <SvgText x="190" y="215" fill={colors.textSecondary} fontSize="10" textAnchor="middle">{dates[2]}</SvgText>
      <SvgText x="260" y="215" fill={colors.textSecondary} fontSize="10" textAnchor="middle">{dates[3]}</SvgText>
      <SvgText x="330" y="215" fill={colors.textSecondary} fontSize="10" textAnchor="middle">{dates[4]}</SvgText>
      <SvgText x="400" y="215" fill={colors.textSecondary} fontSize="10" textAnchor="middle">{dates[5]}</SvgText>
      <SvgText x="470" y="215" fill={colors.textSecondary} fontSize="10" textAnchor="middle">{dates[6]}</SvgText>

      {/* Y Axis Labels */}
      <SvgText x="30" y="44" fill={colors.textSecondary} fontSize="10" textAnchor="end">100</SvgText>
      <SvgText x="30" y="84" fill={colors.textSecondary} fontSize="10" textAnchor="end">80</SvgText>
      <SvgText x="30" y="124" fill={colors.textSecondary} fontSize="10" textAnchor="end">60</SvgText>
      <SvgText x="30" y="164" fill={colors.textSecondary} fontSize="10" textAnchor="end">40</SvgText>
      <SvgText x="30" y="204" fill={colors.textSecondary} fontSize="10" textAnchor="end">20</SvgText>

      {/* Area Fills */}
      <Path d={`${codingInfo.path} L 470 200 L 50 200 Z`} fill="url(#colorCoding)" />
      <Path d={`${problemSolvingInfo.path} L 470 200 L 50 200 Z`} fill="url(#colorProblemSolving)" />
      <Path d={`${conceptualInfo.path} L 470 200 L 50 200 Z`} fill="url(#colorConceptual)" />

      {/* Spline Lines */}
      <Path d={codingInfo.path} fill="none" stroke="#3B82F6" strokeWidth="2.5" />
      <Path d={problemSolvingInfo.path} fill="none" stroke="#10B981" strokeWidth="2.5" />
      <Path d={conceptualInfo.path} fill="none" stroke="#F59E0B" strokeWidth="2.5" />

      {/* Dots on Last Node */}
      <Circle cx="470" cy={codingInfo.yLast} r="4.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
      <Circle cx="470" cy={problemSolvingInfo.yLast} r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
      <Circle cx="470" cy={conceptualInfo.yLast} r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Dashed Tooltip Guide Line */}
      <Line x1="470" y1="40" x2="470" y2="200" stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"} strokeDasharray="3 3" />

      {/* Tooltip Card overlay */}
      <G transform="translate(345, 45)">
        <Rect width="115" height="75" rx="8" fill={isDark ? "#1e293b" : "#FFFFFF"} stroke={isDark ? "#334155" : "#E2E8F0"} strokeWidth="1" />
        <SvgText x="10" y="16" fill={colors.textSecondary} fontSize="8.5" fontWeight="bold">{dates[6]}</SvgText>
        
        {/* Coding */}
        <Circle cx="15" cy="30" r="3.5" fill="#3B82F6" />
        <SvgText x="24" y="33" fill={colors.text} fontSize="9" fontWeight="bold">Coding</SvgText>
        <SvgText x="105" y="33" fill={colors.text} fontSize="9" fontWeight="bold" textAnchor="end">{Math.round(codingValues[6])}</SvgText>

        {/* Problem Solving */}
        <Circle cx="15" cy="46" r="3.5" fill="#10B981" />
        <SvgText x="24" y="49" fill={colors.text} fontSize="9" fontWeight="bold">Problem Solving</SvgText>
        <SvgText x="105" y="49" fill={colors.text} fontSize="9" fontWeight="bold" textAnchor="end">{Math.round(problemSolvingValues[6])}</SvgText>

        {/* Conceptual */}
        <Circle cx="15" cy="62" r="3.5" fill="#F59E0B" />
        <SvgText x="24" y="65" fill={colors.text} fontSize="9" fontWeight="bold">Conceptual</SvgText>
        <SvgText x="105" y="65" fill={colors.text} fontSize="9" fontWeight="bold" textAnchor="end">{Math.round(conceptualValues[6])}</SvgText>
      </G>
    </Svg>
  );
};

export default function LearnScreen() {
  const { isDark, colors, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isSmall = width < 480;
  const themedStyles = styles(colors, isMobile, isDark);
  
  // 5 columns on desktop, 2 columns on mobile/tablet
  const cardWidth = isMobile ? '48%' : '18.5%';
  const isFocused = useIsFocused();
  const [streakCount, setStreakCount] = useState(2);
  const [codeExecutions, setCodeExecutions] = useState(0);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(-290)).current;

  const [totalConcepts, setTotalConcepts] = useState(11533);
  const [avgQuizScore, setAvgQuizScore] = useState(10.87);
  const [chartDates, setChartDates] = useState<string[]>(["Mar 12", "Mar 13", "Mar 14", "Mar 15", "Mar 16", "Mar 17", "Mar 18"]);
  const [codingTrend, setCodingTrend] = useState<number[]>([12.5, 43.75, 37.5, 56.25, 68.75, 75, 87.5]);
  const [problemSolvingTrend, setProblemSolvingTrend] = useState<number[]>([3.125, 25, 25, 37.5, 50, 56.25, 68.75]);
  const [conceptualTrend, setConceptualTrend] = useState<number[]>([0, 12.5, 12.5, 25, 31.25, 37.5, 43.75]);

  const toggleDrawer = (open: boolean) => {
    if (open) {
      setDrawerVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -290,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setDrawerVisible(false));
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      router.replace('/login');
    } catch (error) {
      router.replace('/login');
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadStats();
    }
  }, [isFocused]);

  const loadStats = async () => {
    try {
      const savedPhoto = await AsyncStorage.getItem('@profile_photo');
      if (savedPhoto) {
        setProfilePic(savedPhoto);
      } else {
        setProfilePic(null);
      }

      const localStreak = await AsyncStorage.getItem('current_streak');
      if (localStreak) {
        setStreakCount(parseInt(localStreak));
      }

      const execs = await AsyncStorage.getItem('@learn2code_code_executions');
      let currentExecutions = 0;
      if (execs) {
        currentExecutions = parseInt(execs);
        setCodeExecutions(currentExecutions);
      }

      const localTotalConcepts = await AsyncStorage.getItem('total_concepts');
      if (localTotalConcepts) {
        setTotalConcepts(parseInt(localTotalConcepts));
      }

      const localAvgQuizScore = await AsyncStorage.getItem('avg_quiz_score');
      if (localAvgQuizScore) {
        setAvgQuizScore(parseFloat(localAvgQuizScore));
      }

      // Generate dates for the last 7 days
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const datesList = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        datesList.push(`${months[d.getMonth()]} ${d.getDate()}`);
      }
      setChartDates(datesList);

      let completedC = 0;
      let completedCpp = 0;
      let completedJava = 0;
      let completedPython = 0;
      let totalQuizzes = 0;
      let totalStudyTime = 0;
      let streak = localStreak ? parseInt(localStreak) : 7;

      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Fetch user profile info
        try {
          const profileRes = await fetch(`${API_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUser(profileData);
          }
        } catch (profileErr) {
          console.log('Error fetching profile in loadStats:', profileErr);
        }

        const res = await fetch(`${API_URL}/api/progress`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            completedC = data.completed_C?.length || 0;
            completedCpp = data.completed_Cpp?.length || 0;
            completedJava = data.completed_Java?.length || 0;
            completedPython = data.completed_Python?.length || 0;
            totalQuizzes = data.total_quizzes_taken || 0;
            totalStudyTime = data.total_study_time || 0;
            streak = data.current_streak !== undefined ? data.current_streak : streak;
          }
        }
      } else {
        completedC = await AsyncStorage.getItem('completed_C').then(v => v ? JSON.parse(v).length : 0);
        completedCpp = await AsyncStorage.getItem('completed_C++').then(v => v ? JSON.parse(v).length : 0);
        completedJava = await AsyncStorage.getItem('completed_Java').then(v => v ? JSON.parse(v).length : 0);
        completedPython = await AsyncStorage.getItem('completed_Python').then(v => v ? JSON.parse(v).length : 0);
        totalQuizzes = await AsyncStorage.getItem('total_quizzes_taken').then(v => v ? parseInt(v) : 0);
        totalStudyTime = await AsyncStorage.getItem('total_study_time').then(v => v ? parseInt(v) : 0);
      }

      setStreakCount(streak);
      await AsyncStorage.setItem('current_streak', String(streak));

      const completedCount = completedC + completedCpp + completedJava + completedPython;
      const studyMinutes = Math.floor(totalStudyTime / 60);

      // Load mastered questions count across all languages
      let masteredCount = 0;
      const langs = ['C', 'C++', 'Java', 'Python'];
      for (const lang of langs) {
        const storedMastered = await AsyncStorage.getItem(`@learn2code_mastered_${lang}`);
        if (storedMastered) {
          const list = JSON.parse(storedMastered);
          if (Array.isArray(list)) {
            masteredCount += list.length;
          }
        }
      }

      // Calculate Total Concepts
      const calcTotalConcepts = completedCount * 20 + masteredCount + currentExecutions * 3;
      setTotalConcepts(calcTotalConcepts);
      await AsyncStorage.setItem('total_concepts', String(calcTotalConcepts));

      // Calculate Average Quiz Score
      const scoresVal = await AsyncStorage.getItem('quiz_scores_history');
      if (scoresVal) {
        const scores = JSON.parse(scoresVal);
        if (scores.length > 0) {
          const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
          setAvgQuizScore(parseFloat(avg.toFixed(2)));
          await AsyncStorage.setItem('avg_quiz_score', String(avg.toFixed(2)));
        }
      }

      // Calculate final values for chart trends
      const codingVal = Math.min(25 + completedCount * 12 + Math.floor(studyMinutes / 2), 100);
      const problemSolvingVal = Math.min(20 + totalQuizzes * 8 + completedCount * 4, 100);
      const conceptualVal = Math.min(15 + completedCount * 10 + totalQuizzes * 5, 100);

      const generateTrend = (finalVal: number, steps: number[]) => {
        return steps.map(s => Math.max(0, Math.min(100, finalVal - s)));
      };

      setCodingTrend(generateTrend(codingVal, [22, 18, 15, 10, 8, 4, 0]));
      setProblemSolvingTrend(generateTrend(problemSolvingVal, [18, 15, 12, 8, 5, 2, 0]));
      setConceptualTrend(generateTrend(conceptualVal, [15, 12, 10, 8, 6, 3, 0]));

    } catch (e) {
      console.log('Error loading stats in LearnScreen:', e);
    }
  };

  const modes = [
    {
      title: 'Flashcards',
      desc: 'Engage with curated, interactive card sets.',
      lightImage: require('../assets/images/flashcard.png'),
      darkImage: require('../assets/images/flashcard.png'),
      button: 'START FLASHCARDS',
      themeColor: '#7C3AED',
      bgLight: '#FAF5FF',
      borderLight: '#E9D5FF',
      bgDark: '#121026',
      borderDark: '#3B226A',
      onPress: () => setLangModalVisible(true),
    },
    {
      title: 'Quiz',
      desc: 'Test your skills across multiple knowledge domains.',
      lightImage: require('../assets/images/quiz.png'),
      darkImage: require('../assets/images/quiz.png'),
      button: 'START QUIZ',
      themeColor: '#EA580C',
      bgLight: '#FEF3C7',
      borderLight: '#FDE68A',
      bgDark: '#1E1610',
      borderDark: '#5C3D15',
      onPress: () => router.push('/mcq'),
    },
    {
      title: 'Notes',
      desc: 'Access detailed, structured conceptual guides.',
      lightImage: require('../assets/images/notes.png'),
      darkImage: require('../assets/images/notes.png'),
      button: 'EXPLORE NOTES',
      themeColor: '#0D9488',
      bgLight: '#F0FDFA',
      borderLight: '#CCFBF1',
      bgDark: '#091E1C',
      borderDark: '#155E57',
      onPress: () => router.push('/notes'),
    },
    {
      title: 'Revision',
      desc: 'Refresh key concepts and strengthen retention.',
      lightImage: require('../assets/images/revision.png'),
      darkImage: require('../assets/images/revision.png'),
      button: 'START REVISION',
      themeColor: '#2563EB',
      bgLight: '#EFF6FF',
      borderLight: '#BFDBFE',
      bgDark: '#0A142D',
      borderDark: '#1E3A8A',
      onPress: () => router.push('/revision'),
    },
    {
      title: 'Playground',
      desc: 'Code, compile, and run in our advanced editor.',
      lightImage: require('../assets/images/playground.png'),
      darkImage: require('../assets/images/playground.png'),
      button: 'OPEN PLAYGROUND',
      themeColor: '#16A34A',
      bgLight: '#ECFDF5',
      borderLight: '#A7F3D0',
      bgDark: '#071C17',
      borderDark: '#065F46',
      onPress: () => router.push('/playground'),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1 }}>
          {/* Custom Mockup-styled Navigation Header */}
          <View style={themedStyles.header}>
            <View style={themedStyles.headerLeft}>
              {isMobile ? (
                <>
                  <TouchableOpacity 
                    style={{ padding: 4, marginRight: 8 }}
                    activeOpacity={0.7}
                    onPress={() => toggleDrawer(true)}
                  >
                    <Ionicons name="menu-outline" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Ionicons name="briefcase-sharp" size={22} color="#3B82F6" style={{ marginRight: 8 }} />
                  <Text style={themedStyles.logoText}>Learn2Code</Text>
                </>
              ) : (
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>My Learning</Text>
              )}
            </View>
            <View style={themedStyles.headerRight}>
              <TouchableOpacity 
                style={{ padding: 4, marginRight: 8 }}
                activeOpacity={0.7}
                onPress={() => Alert.alert('Search', 'Search feature coming soon')}
              >
                <Ionicons name="search-outline" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ padding: 4, marginRight: 8 }}
                activeOpacity={0.7}
                onPress={toggleTheme}
              >
                <Ionicons 
                  name={isDark ? "sunny" : "moon-outline"} 
                  size={22} 
                  color={isDark ? "#F59E0B" : colors.textSecondary} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => router.push('/account')}
              >
                <Image
                  source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
                  style={themedStyles.headerAvatar}
                />
              </TouchableOpacity>
            </View>
          </View>

      <ScrollView 
        style={themedStyles.container} 
        contentContainerStyle={{ paddingBottom: isMobile ? (Platform.OS === 'ios' ? 110 : 90) : 40 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section Container */}
        <LinearGradient
          colors={isDark ? ['#0d172e', '#091021'] : ['#F3F7FC', '#E3EDF9']}
          style={[themedStyles.hero, { borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0' }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={isMobile ? { flex: 1 } : themedStyles.heroLeft}>
            {isMobile ? (
              <Text style={[themedStyles.heroTitle, { color: colors.text }]}>
                {"Let's Start\n"}
                <Text style={themedStyles.learningText}>Learning!</Text>{" "}
                <Text style={themedStyles.rocketEmoji}>🚀</Text>
              </Text>
            ) : (
              <Text style={[themedStyles.heroTitle, { color: colors.text }]}>
                {"Let's Start\n"}
                <Text style={{ color: '#3B82F6' }}>Learning! 🚀</Text>
              </Text>
            )}
            <Text style={themedStyles.heroSub}>
              Choose what you want to learn today and level up your coding skills.
            </Text>

            {/* Left Inside Badge Card */}
            <View style={[themedStyles.streakBadgeCard, {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            }]}>
              <Text style={themedStyles.badgeFireEmoji}>🔥</Text>
              <View style={{ flex: 1 }}>
                <Text style={[themedStyles.badgeTitle, { color: colors.text }]}>
                  {streakCount} Day Streak
                </Text>
                <Text style={themedStyles.badgeSub} numberOfLines={2}>
                  Your momentum is building! Build a formidable streak.
                </Text>
              </View>
            </View>
          </View>

          {/* Middle Rocket image for Desktop only */}
          {!isMobile && (
            <View style={themedStyles.heroMiddle}>
              <Image
                source={require('../assets/images/rocket.png')}
                style={themedStyles.heroRocket}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Right side: Milestone Slider for Desktop only */}
          {!isMobile && (
            <View style={themedStyles.heroRight}>
              <MilestoneSlider 
                streakCount={streakCount} 
                isDark={isDark} 
                colors={colors} 
                style={{ marginBottom: 0, flex: 1, height: '100%', justifyContent: 'center' }} 
              />
            </View>
          )}
        </LinearGradient>

        {/* Milestone Tracker Standalone Card - Mobile Only */}
        {isMobile && (
          <MilestoneSlider streakCount={streakCount} isDark={isDark} colors={colors} />
        )}

        {/* Section Title */}
        <View style={themedStyles.sectionTitleContainer}>
          <Text style={themedStyles.sectionTitleText}>✨ Choose a Learning Mode</Text>
          {isMobile && (
            <TouchableOpacity
              style={themedStyles.viewAllBtn}
              activeOpacity={0.7}
              onPress={() => setLangModalVisible(true)}
            >
              <Text style={themedStyles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={12} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>

        {/* Learning Mode Cards Row */}
        {isMobile ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={themedStyles.modesSlider}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {modes.map((mode) => {
              const cardBg = isDark ? mode.bgDark : mode.bgLight;
              const cardBorder = isDark ? mode.borderDark : mode.borderLight;
              const cardImage = isDark ? mode.darkImage : mode.lightImage;

              return (
                <TouchableOpacity
                  key={mode.title}
                  activeOpacity={0.9}
                  style={[
                    themedStyles.modeCardMobile,
                    {
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                    }
                  ]}
                  onPress={mode.onPress}
                >
                  {/* Illustration Image */}
                  <Image
                    source={cardImage}
                    style={themedStyles.modeCardImageMobile}
                    resizeMode="contain"
                  />

                  {/* Title */}
                  <Text style={[themedStyles.modeCardTitleMobile, { color: colors.text }]}>
                    {mode.title}
                  </Text>

                  {/* Description */}
                  <Text style={themedStyles.modeCardDescMobile} numberOfLines={2}>
                    {mode.desc}
                  </Text>

                  {/* Button */}
                  <View style={[themedStyles.modeCardBtnMobile, { backgroundColor: mode.themeColor }]}>
                    <Text style={themedStyles.modeCardBtnTextMobile}>
                      {mode.button}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={themedStyles.modesRow}>
            {modes.map((mode) => {
              const cardBg = isDark ? mode.bgDark : mode.bgLight;
              const cardBorder = isDark ? mode.borderDark : mode.borderLight;
              const cardImage = isDark ? mode.darkImage : mode.lightImage;

              return (
                <TouchableOpacity
                  key={mode.title}
                  activeOpacity={0.9}
                  style={[
                    themedStyles.modeCard,
                    {
                      width: cardWidth,
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                    }
                  ]}
                  onPress={mode.onPress}
                >
                  {/* Illustration Image */}
                  <Image
                    source={cardImage}
                    style={themedStyles.modeCardImage}
                    resizeMode="contain"
                  />

                  {/* Title */}
                  <Text style={[themedStyles.modeCardTitle, { color: colors.text }]}>
                    {mode.title}
                  </Text>

                  {/* Description */}
                  <Text style={themedStyles.modeCardDesc}>
                    {mode.desc}
                  </Text>

                  {/* Button */}
                  <View style={[themedStyles.modeCardBtn, { backgroundColor: mode.themeColor }]}>
                    <Text style={themedStyles.modeCardBtnText}>
                      {mode.button}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Overall Progress Section */}
        <View style={[themedStyles.progressSectionCard, {
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
        }]}>
          
          {/* Title bar */}
          <View style={themedStyles.progressHeader}>
            <View style={themedStyles.progressTitleGroup}>
              <View style={themedStyles.chartIconWrapper}>
                <Ionicons name="trending-up" size={18} color="#FFFFFF" />
              </View>
              <Text style={[themedStyles.progressTitleText, { color: colors.text }]}>
                Overall Progress
              </Text>
            </View>

            {/* Dropdown selector */}
            <TouchableOpacity style={themedStyles.dropdownButton} activeOpacity={0.7}>
              <Text style={themedStyles.dropdownText}>This Week</Text>
              <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Legend Row */}
          <View style={themedStyles.legendRow}>
            <View style={themedStyles.legendItem}>
              <View style={[themedStyles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={[themedStyles.legendLabel, { color: colors.textSecondary }]}>Coding</Text>
            </View>
            <View style={themedStyles.legendItem}>
              <View style={[themedStyles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={[themedStyles.legendLabel, { color: colors.textSecondary }]}>Problem Solving</Text>
            </View>
            <View style={themedStyles.legendItem}>
              <View style={[themedStyles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[themedStyles.legendLabel, { color: colors.textSecondary }]}>Conceptual Knowledge</Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <OverallProgressChart
              isDark={isDark}
              colors={colors}
              dates={chartDates}
              codingValues={codingTrend}
              problemSolvingValues={problemSolvingTrend}
              conceptualValues={conceptualTrend}
            />
          </View>
        </View>

        {/* Dynamic Summary Horizontal Row */}
        <View style={themedStyles.summaryRow}>
          {/* Card 1 */}
          <View style={[themedStyles.summaryMiniCard, {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(44, 41, 41, 0.17)' : '#E2E8F0',
          }]}>
            <View style={[themedStyles.summaryIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="bulb-outline" size={16} color="#3B82F6" />
            </View>
            <View style={themedStyles.summaryMiniTextContainer}>
              <Text style={[themedStyles.summaryMiniLabel, { color: colors.textSecondary }]}>
                Total Concepts
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[themedStyles.summaryMiniValue, { color: colors.text }]}>
                  {totalConcepts.toLocaleString()}
                </Text>
                <Ionicons name="trending-up" size={12} color="#10B981" />
              </View>
            </View>
          </View>

          {/* Card 2 */}
          <View style={[themedStyles.summaryMiniCard, {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          }]}>
            <View style={[themedStyles.summaryIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="aperture-outline" size={16} color="#10B981" />
            </View>
            <View style={themedStyles.summaryMiniTextContainer}>
              <Text style={[themedStyles.summaryMiniLabel, { color: colors.textSecondary }]}>
                Avg Quiz Score
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[themedStyles.summaryMiniValue, { color: colors.text }]}>
                  {avgQuizScore}
                </Text>
                <View style={[themedStyles.summaryMiniBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Text style={themedStyles.summaryMiniBadgeText}>▲ 30%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Card 3 */}
          <View style={[themedStyles.summaryMiniCard, {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#93a2b6',
          }]}>
            <View style={[themedStyles.summaryIconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Ionicons name="code-slash-outline" size={16} color="#8B5CF6" />
            </View>
            <View style={themedStyles.summaryMiniTextContainer}>
              <Text style={[themedStyles.summaryMiniLabel, { color: colors.textSecondary }]}>
                Code Execs
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[themedStyles.summaryMiniValue, { color: colors.text }]}>
                  {codeExecutions}
                </Text>
                <Ionicons name="checkmark-circle-outline" size={12} color="#10B981" />
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={langModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalContent}>
            {/* Modal Header */}
            <View style={themedStyles.modalHeader}>
              <Text style={themedStyles.modalTitle}>Choose Any Language:-</Text>
              <TouchableOpacity
                style={themedStyles.modalCloseBtn}
                onPress={() => setLangModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal Body: Language Cards */}
            <ScrollView contentContainerStyle={themedStyles.modalBody}>
              <View style={themedStyles.langGrid}>
                {['C', 'C++', 'Java', 'Python'].map((item) => (
                  <Pressable
                    key={item}
                    style={({ hovered }: any) => [
                      themedStyles.langCardOuter,
                      { width: isSmall ? '100%' : isMobile ? '48%' : '23.5%' },
                      hovered && themedStyles.langCardHover,
                    ]}
                    onPress={() => {
                      setLangModalVisible(false);
                      router.push({
                        pathname: '/flashcards',
                        params: {
                          language: item,
                        },
                      });
                    }}
                  >
                    {({ hovered }: any) => (
                      <LinearGradient
                        colors={
                          isDark
                            ? (hovered ? ['#334155', '#1e293b'] : ['#1e293b', '#0f172a'])
                            : (hovered ? ['#f3fffd', '#daf8f6'] : ['#edfdfa', '#dbf3ee'])
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={themedStyles.langCardInner}
                      >
                        <View style={themedStyles.imageBox}>
                          <Image
                            source={logos[item as keyof typeof logos]}
                            style={themedStyles.langImage}
                            resizeMode="contain"
                          />
                        </View>

                        <Text style={themedStyles.langTitle}>{item}</Text>
                        <Text style={themedStyles.langDesc}>
                          Start learning {item}
                        </Text>
                      </LinearGradient>
                    )}
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Drawer Menu Modal */}
      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => toggleDrawer(false)}
      >
        <View style={themedStyles.drawerOverlay}>
          {/* Backdrop Pressable */}
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => toggleDrawer(false)} 
          />
          
          <Animated.View style={[
            themedStyles.drawerBody,
            { transform: [{ translateX: slideAnim }] }
          ]}>
            {/* Drawer Header with user profile info */}
            <View style={themedStyles.drawerHeader}>
              <View style={themedStyles.drawerAvatarContainer}>
                <Image
                  source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
                  style={themedStyles.drawerAvatar}
                />
              </View>
              <View style={themedStyles.drawerUserInfo}>
                <Text style={themedStyles.drawerUserName} numberOfLines={1}>
                  {user?.name || 'Guest User'}
                </Text>
                <Text style={themedStyles.drawerUserEmail} numberOfLines={1}>
                  {user?.email || 'guest@learn2code.com'}
                </Text>
              </View>
            </View>

            {/* Navigation links list */}
            <ScrollView style={themedStyles.drawerNavScroll} showsVerticalScrollIndicator={false}>
              {[
                { name: 'Home', icon: 'home-outline', route: '/home' },
                { name: 'Learn', icon: 'book-outline', route: '/learn', isActive: true },
                { name: 'Flashcards', icon: 'copy-outline', route: '/flashcards', isLangSelect: true },
                { name: 'Quiz', icon: 'help-circle-outline', route: '/mcq' },
                { name: 'Notes', icon: 'document-text-outline', route: '/notes' },
                { name: 'Revision', icon: 'repeat-outline', route: '/revision' },
                { name: 'Playground', icon: 'code-slash-outline', route: '/playground' },
                { name: 'Leaderboard', icon: 'trophy-outline', route: '/leaderboard' },
                { name: 'Account', icon: 'person-outline', route: '/account' },
              ].map((item) => {
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      themedStyles.drawerNavItem,
                      item.isActive && themedStyles.drawerNavItemActive
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      toggleDrawer(false);
                      if (item.isLangSelect) {
                        setLangModalVisible(true);
                      } else if (!item.isActive) {
                        router.push(item.route as any);
                      }
                    }}
                  >
                    <Ionicons 
                      name={item.icon as any} 
                      size={20} 
                      color={item.isActive ? '#3B82F6' : colors.textSecondary} 
                      style={themedStyles.drawerNavIcon}
                    />
                    <Text style={[
                      themedStyles.drawerNavItemText,
                      { color: item.isActive ? '#3B82F6' : colors.text }
                    ]}>
                      {item.name}
                    </Text>
                    {item.isActive && (
                      <View style={themedStyles.activeIndicator} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Footer with theme toggle and logout */}
            <View style={themedStyles.drawerFooter}>
              {/* Theme toggle row */}
              <TouchableOpacity 
                style={themedStyles.drawerThemeToggle}
                activeOpacity={0.7}
                onPress={toggleTheme}
              >
                <View style={themedStyles.drawerThemeToggleLeft}>
                  <Ionicons 
                    name={isDark ? "sunny-outline" : "moon-outline"} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                  <Text style={[themedStyles.drawerThemeText, { color: colors.text }]}>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </Text>
                </View>
                <Ionicons 
                  name={isDark ? "sunny" : "moon"} 
                  size={16} 
                  color={isDark ? "#F59E0B" : "#3B82F6"} 
                />
              </TouchableOpacity>

              {/* Logout button */}
              <TouchableOpacity 
                style={themedStyles.drawerLogoutBtn}
                activeOpacity={0.7}
                onPress={() => {
                  toggleDrawer(false);
                  logout();
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={themedStyles.drawerLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
      </View>
    </View>
  );
}

// Milestone Slider component internal styles
const sliderStyles = StyleSheet.create({
  sliderCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
    minHeight: 120,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sliderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  streakEmoji: {
    fontSize: 20,
  },

  streakTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  viewDetailsText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: 'bold',
  },

  sliderTrackContainer: {
    height: 35,
    position: 'relative',
    justifyContent: 'center',
    marginHorizontal: 12,
  },

  trackBg: {
    height: 4,
    width: '100%',
    borderRadius: 2,
  },

  trackActive: {
    height: 4,
    backgroundColor: '#EA580C',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 15.5,
  },

  node: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#94A3B8',
    borderWidth: 1.5,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 12.5,
  },

  nodeStar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 6.5,
  },

  nodeLeft: {
    left: 0,
  },

  nodeMiddle: {
    left: '50%',
    marginLeft: -5,
  },

  nodeRight: {
    right: 0,
    marginRight: -11,
  },

  nodeActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },

  nodeActiveStar: {
    borderColor: '#F59E0B',
  },

  nodeNumberAbove: {
    position: 'absolute',
    top: -20,
    width: 80,
    left: -35,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0a0b0b',
  },

  nodeNumberActive: {
    color: '#EA580C',
  },

  nodeLabelBelow: {
    position: 'absolute',
    bottom: -20,
    width: 80,
    left: -35,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '500',
    color: '#151617',
  },

  milestoneTextLabel: {
    position: 'absolute',
    top: -20,
    right: 0,
    width: 120,
    textAlign: 'right',
    fontSize: 10,
    fontWeight: '700',
    color: '#141415',
  },
});

// Main Page styles using themed colors
const styles = (colors: any, isMobile: boolean, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 48 : 36,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  hero: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    overflow: 'hidden',
  },

  heroLeft: {
    flex: isMobile ? 1 : 2.2,
  },

  heroMiddle: {
    alignSelf: 'stretch',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: -20,
  },

  heroRight: {
    flex: isMobile ? 1 : 2.6,
    height: 170,
    justifyContent: 'center',
  },

  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },

  learningText: {
    fontFamily: Platform.select({
      ios: 'Snell Roundhand',
      android: 'serif',
      default: 'cursive',
    }),
    fontStyle: 'italic',
    fontSize: isMobile ? 32 : 36,
    color: '#3B82F6',
    fontWeight: 'bold',
  },

  rocketEmoji: {
    fontSize: isMobile ? 24 : 28,
  },

  heroSub: {
    fontSize: 15,
    marginTop: 6,
    lineHeight: 20,
    color: isDark ? '#cbd5e1' : '#000000',
  },

  streakBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    gap: 10,
    alignSelf: 'flex-start',
  },

  badgeFireEmoji: {
    fontSize: 20,
  },

  badgeTitle: {
    fontWeight: 'bold',
    fontSize: 13,
  },

  badgeSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
    color: isDark ? '#cbd5e1' : '#000000',
  },

  heroRocket: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.35 }],
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },

  sectionTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },

  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.06)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 2,
  },

  viewAllText: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: 'bold',
  },

  modesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },

  modesSlider: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  modeCardMobile: {
    width: 160,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 185,
    justifyContent: 'space-between',
    marginRight: 12,
  },

  modeCardImageMobile: {
    width: 52,
    height: 52,
    marginBottom: 4,
  },

  modeCardTitleMobile: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  modeCardDescMobile: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 15,
    marginTop: 2,
    marginBottom: 6,
    minHeight: 30,
    color: isDark ? '#cbd5e1' : '#000000',
  },

  modeCardBtnMobile: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },

  modeCardBtnTextMobile: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },

  modeCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: isMobile ? 175 : 210,
    justifyContent: 'space-between',
  },

  modeCardImage: {
    width: isMobile ? 52 : 120,
    height: isMobile ? 52 : 120,
    marginBottom: isMobile ? 4 : 6,
  },

  modeCardTitle: {
    fontSize: isMobile ? 17 : 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  modeCardDesc: {
    textAlign: 'center',
    fontSize: isMobile ? 13 : 12,
    lineHeight: isMobile ? 16 : 15,
    marginTop: 2,
    marginBottom: 6,
    minHeight: isMobile ? 32 : 30,
    color: isDark ? '#cbd5e1' : '#000000',
  },

  modeCardBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },

  modeCardBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: isMobile ? 11.5 : 10,
    letterSpacing: 0.5,
  },

  /* Overall Progress Section */
  progressSectionCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  progressTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  chartIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
  },

  dropdownText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
    justifyContent: 'center',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 1.5,
  },

  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 16,
    width: '100%',
  },

  summaryMiniCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  summaryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryMiniTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  summaryMiniLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  summaryMiniValue: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },

  summaryMiniBadge: {
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 4,
  },

  summaryMiniBadgeText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 8,
  },

  /* Language Selection Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },

  modalContent: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    width: '100%',
    maxWidth: 900,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },

  modalCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.background,
  },

  modalBody: {
    padding: 24,
  },

  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  langCardOuter: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  langCardHover: {
    borderColor: '#3B82F6',
    transform: [{ scale: 1.025 }],
  },

  langCardInner: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    width: '100%',
  },

  imageBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 8,
  },

  langImage: {
    width: 44,
    height: 44,
  },

  langTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },

  langDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  /* Drawer Menu Styles */
  drawerOverlay: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(15, 23, 42, 0.45)',
    flexDirection: 'row',
  },

  drawerBody: {
    width: 290,
    height: '100%',
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 16,
  },

  drawerHeader: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  drawerAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },

  drawerAvatar: {
    width: '100%',
    height: '100%',
  },

  drawerUserInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  drawerUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },

  drawerUserEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  drawerNavScroll: {
    flex: 1,
    paddingTop: 12,
  },

  drawerNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    position: 'relative',
  },

  drawerNavItemActive: {
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
  },

  drawerNavIcon: {
    marginRight: 14,
  },

  drawerNavItemText: {
    fontSize: 15,
    fontWeight: '600',
  },

  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#3B82F6',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },

  drawerFooter: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },

  drawerThemeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
  },

  drawerThemeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  drawerThemeText: {
    fontSize: 14,
    fontWeight: '600',
  },

  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.05)',
  },

  drawerLogoutText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
  },
});

const BottomTabBar = ({ activeTab, colors }: any) => {
  const tabs = [
    { name: 'Home', icon: 'home', route: '/home' },
    { name: 'Flashcards', icon: 'copy-outline', route: '/flashcards' },
    { name: 'Quiz', icon: 'help-circle-outline', route: '/mcq' },
    { name: 'Notes', icon: 'document-text-outline', route: '/notes' },
    { name: 'Revision', icon: 'repeat-outline', route: '/revision' },
  ];

  return (
    <View style={[tabBarStyles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {tabs.map((tab) => {
        const isActive = tab.name === activeTab;
        const iconColor = isActive ? '#3B82F6' : colors.textSecondary;
        const textColor = isActive ? '#3B82F6' : colors.textSecondary;

        return (
          <TouchableOpacity
            key={tab.name}
            style={tabBarStyles.tabItem}
            activeOpacity={0.8}
            onPress={() => {
              if (tab.route) router.push(tab.route as any);
            }}
          >
            <Ionicons name={tab.icon as any} size={20} color={iconColor} />
            <Text style={[tabBarStyles.tabLabel, { color: textColor }]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const tabBarStyles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 70 : 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
});
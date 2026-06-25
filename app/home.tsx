import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  Switch,
  ImageBackground,
  Animated,
  Platform,
  DimensionValue,
  Modal,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '../config';

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

const languageCards = [
  {
    id: 'C',
    name: 'C',
    desc: 'Start learning C programming from the basics.',
    badge: 'Beginner',
    badgeColor: '#10B981', // green
    badgeBg: '#E6F4EA',
    chartColor: '#10B981',
    logo: require('../assets/images/c.png'),
  },
  {
    id: 'C++',
    name: 'C++',
    desc: 'Master C++ with OOPs concepts and more.',
    badge: 'Intermediate',
    badgeColor: '#3B82F6', // blue
    badgeBg: '#E8F0FE',
    chartColor: '#3B82F6',
    logo: require('../assets/images/cpp.png'),
  },
  {
    id: 'Java',
    name: 'Java',
    desc: 'Learn Java programming step by step.',
    badge: 'Beginner',
    badgeColor: '#10B981', // green
    badgeBg: '#E6F4EA',
    chartColor: '#EF4444', // red/orange
    logo: require('../assets/images/java.png'),
  },
  {
    id: 'Python',
    name: 'Python',
    desc: 'Learn Python with hands-on examples.',
    badge: 'Beginner',
    badgeColor: '#10B981', // green
    badgeBg: '#E6F4EA',
    chartColor: '#F59E0B', // yellow/gold
    logo: require('../assets/images/python.png'),
  },
];

const navTabs = [
  { name: 'Home', icon: 'home-outline', route: '/home' },
  { name: 'Flashcards', icon: 'copy-outline', route: '/flashcards' },
  { name: 'Quiz', icon: 'help-circle-outline', route: '/mcq' },
  { name: 'Notes', icon: 'document-text-outline', route: '/notes' },
  { name: 'Revision', icon: 'repeat-outline', route: '/revision' },
  { name: 'Achievements', icon: 'trophy-outline', route: '/leaderboard' },
] as const;

const footerLinks = [
  {
    name: 'Flashcards',
    subtitle: 'Learn visually',
    icon: 'copy-outline',
    color: '#8B5CF6', // purple
    bg: '#F5F3FF',
    route: '/flashcards',
  },
  {
    name: 'Quiz',
    subtitle: 'Test your knowledge',
    icon: 'help-circle-outline',
    color: '#EC4899', // pink
    bg: '#FDF2F8',
    route: '/mcq',
  },
  {
    name: 'Notes',
    subtitle: 'Organized learning',
    icon: 'document-text-outline',
    color: '#F59E0B', // orange
    bg: '#FFFBEB',
    route: '/notes',
  },
  {
    name: 'Revision',
    subtitle: 'Strengthen concepts',
    icon: 'repeat-outline',
    color: '#10B981', // green
    bg: '#ECFDF5',
    route: '/revision',
  },
] as const;

const MiniChart = ({ color }: { color: string }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3 }}>
      <View style={{ width: 3, height: 6, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3, height: 14, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3, height: 10, backgroundColor: color, borderRadius: 1 }} />
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

export default function Home() {
  const { isDark, colors, toggleTheme } = useTheme();
  const themedStyles = styles(colors, isDark);

  const [lang, setLang] = useState('C');
  const [tab, setTab] = useState('Home');
  const [menu, setMenu] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < 992;
  const isTablet = width >= 768 && width < 1200;
  const isSmall = width < 576;
  const isPhone = width < 768;

  const cardWidth = isSmall ? '100%' : isTablet ? '48%' : '23.5%';

  const notes = Array.from(
    { length: 5 },
    (_, i) => `${lang} Note ${i + 1}: Important concept`
  );

  const rev = Array.from(
    { length: 5 },
    (_, i) => `${lang} Revision ${i + 1}`
  );

  // Mobile layout state hooks and fetchers
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(7);
  const [topicsLearned, setTopicsLearned] = useState(12);
  const [quizzesCompleted, setQuizzesCompleted] = useState(68);
  const [pointsEarned, setPointsEarned] = useState(340);
  const [codeExecutions, setCodeExecutions] = useState(0);
  const slideAnim = useRef(new Animated.Value(-290)).current;

  const [totalConcepts, setTotalConcepts] = useState(11533);
  const [avgQuizScore, setAvgQuizScore] = useState(10.87);
  const [chartDates, setChartDates] = useState<string[]>(["Mar 12", "Mar 13", "Mar 14", "Mar 15", "Mar 16", "Mar 17", "Mar 18"]);
  const [codingTrend, setCodingTrend] = useState<number[]>([12.5, 43.75, 37.5, 56.25, 68.75, 75, 87.5]);
  const [problemSolvingTrend, setProblemSolvingTrend] = useState<number[]>([3.125, 25, 25, 37.5, 50, 56.25, 68.75]);
  const [conceptualTrend, setConceptualTrend] = useState<number[]>([0, 12.5, 12.5, 25, 31.25, 37.5, 43.75]);

  const mobileStyles = mobileStylesCreator(colors, isDark);
  const isFocused = useIsFocused();

  useEffect(() => {
    loadStats();
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

      const localTopics = await AsyncStorage.getItem('topics_learned');
      if (localTopics) {
        setTopicsLearned(parseInt(localTopics));
      }

      const localQuizzes = await AsyncStorage.getItem('quizzes_completed');
      if (localQuizzes) {
        setQuizzesCompleted(parseInt(localQuizzes));
      }

      const localPoints = await AsyncStorage.getItem('points_earned');
      if (localPoints) {
        setPointsEarned(parseInt(localPoints));
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
          console.log('Error fetching profile in home loadStats:', profileErr);
        }

        // Fetch progress stats
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

      const completedCount = completedC + completedCpp + completedJava + completedPython;
      const studyMinutes = Math.floor(totalStudyTime / 60);
      const points = completedCount * 100 + totalQuizzes * 10 + streak * 50 + studyMinutes * 2;

      setStreakCount(streak);
      setTopicsLearned(completedCount);
      setQuizzesCompleted(totalQuizzes);
      setPointsEarned(points);

      await AsyncStorage.setItem('current_streak', String(streak));
      await AsyncStorage.setItem('topics_learned', String(completedCount));
      await AsyncStorage.setItem('quizzes_completed', String(totalQuizzes));
      await AsyncStorage.setItem('points_earned', String(points));

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
      console.log('Error loading stats in Home Screen:', e);
    }
  };

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

  // Render Mobile Phone Layout
  if (isPhone) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Mockup-styled Mobile Navigation Header */}
        <View style={mobileStyles.header}>
          <View style={mobileStyles.headerLeft}>
            <TouchableOpacity 
              style={{ padding: 4, marginRight: 8 }}
              activeOpacity={0.7}
              onPress={() => toggleDrawer(true)}
            >
              <Ionicons name="menu-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <Ionicons name="desktop-sharp" size={22} color="#3B82F6" style={{ marginRight: 8 }} />
            <Text style={mobileStyles.logoText}>Learn2Code</Text>
          </View>
          
          <View style={mobileStyles.headerRight}>
            {/* Custom Theme Switch Toggle Row */}
            <View style={mobileStyles.toggleContainer}>
              <Ionicons name="sunny" size={18} color="#F59E0B" style={{ marginRight: 4 }} />
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                thumbColor={isDark ? '#60a5fa' : '#f1f5f9'}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
            
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => router.push('/account')}
            >
              <Image
                source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
                style={mobileStyles.headerAvatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={mobileStyles.container}
          contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 110 : 90 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section Banner */}
          <LinearGradient
            colors={['#061330', '#0a1d47']}
            style={mobileStyles.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Laptop background image contained on the right */}
            <Image
              source={require('../assets/images/herosection.png')}
              style={mobileStyles.heroBgImage}
              resizeMode="contain"
            />

            <View style={mobileStyles.heroContentContainer}>
              <View style={mobileStyles.welcomeBadge}>
                <Text style={mobileStyles.welcomeText}>🔥 Welcome back!</Text>
              </View>

              <View style={mobileStyles.heroTextBlock}>
                <Text style={mobileStyles.heroTitleWelcome}>Welcome back to</Text>
                <View style={mobileStyles.heroTitleBrandRow}>
                  <Text style={mobileStyles.heroTitleBrand}>Learn2Code</Text>
                  <Image
                    source={require('../assets/images/rocket.png')}
                    style={mobileStyles.heroRocket}
                    resizeMode="contain"
                  />
                </View>

                <Text style={mobileStyles.heroSubtitle}>
                  Learn programming with interactive Flashcards, Quiz, Notes & Revision
                </Text>

                <TouchableOpacity
                  style={mobileStyles.heroStartBtn}
                  activeOpacity={0.8}
                  onPress={() => router.push('/learn')}
                >
                  <Text style={mobileStyles.heroStartBtnText}>Start Learning</Text>
                  <View style={mobileStyles.heroStartBtnIconBg}>
                    <Ionicons name="chevron-forward" size={12} color="#4f46e5" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Translucent Statistics Overlay Row */}
            <View style={mobileStyles.statsOverlayRow}>
              {/* Topics Learned */}
              <View style={mobileStyles.statItem}>
                <Ionicons name="desktop-outline" size={16} color="#38bdf8" />
                <View style={mobileStyles.statItemTextCol}>
                  <Text style={mobileStyles.statItemVal}>{topicsLearned}</Text>
                  <Text style={mobileStyles.statItemLbl}>Topics</Text>
                  <Text style={mobileStyles.statItemLbl}>Learned</Text>
                </View>
              </View>

              <View style={mobileStyles.statItemDivider} />

              {/* Quizzes Completed */}
              <View style={mobileStyles.statItem}>
                <Ionicons name="aperture-outline" size={16} color="#f43f5e" />
                <View style={mobileStyles.statItemTextCol}>
                  <Text style={mobileStyles.statItemVal}>{quizzesCompleted}</Text>
                  <Text style={mobileStyles.statItemLbl}>Quizzes</Text>
                  <Text style={mobileStyles.statItemLbl}>Completed</Text>
                </View>
              </View>

              <View style={mobileStyles.statItemDivider} />

              {/* Day Streak */}
              <View style={mobileStyles.statItem}>
                <Ionicons name="flame-outline" size={16} color="#f97316" />
                <View style={mobileStyles.statItemTextCol}>
                  <Text style={mobileStyles.statItemVal}>{streakCount}</Text>
                  <Text style={mobileStyles.statItemLbl}>Day</Text>
                  <Text style={mobileStyles.statItemLbl}>Streak</Text>
                </View>
              </View>

              <View style={mobileStyles.statItemDivider} />

              {/* Points Earned */}
              <View style={mobileStyles.statItem}>
                <Ionicons name="star-outline" size={16} color="#eab308" />
                <View style={mobileStyles.statItemTextCol}>
                  <Text style={mobileStyles.statItemVal}>{pointsEarned}</Text>
                  <Text style={mobileStyles.statItemLbl}>Points</Text>
                  <Text style={mobileStyles.statItemLbl}>Earned</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Choose Any Language Section */}
          <View style={mobileStyles.sectionHeader}>
            <View style={mobileStyles.sectionHeaderTitleRow}>
              <Ionicons name="code-slash" size={20} color="#3B82F6" style={{ marginRight: 6 }} />
              <Text style={[mobileStyles.sectionHeading, { color: colors.text }]}>Choose Any Language</Text>
            </View>
            <TouchableOpacity
              style={mobileStyles.viewAllBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/learn')}
            >
              <Text style={mobileStyles.viewAllText}>View All Courses</Text>
              <Ionicons name="chevron-forward" size={12} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Languages Horizontal Slider */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={mobileStyles.languagesSlider}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {languageCards.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={[
                  mobileStyles.langCard,
                  {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  }
                ]}
                onPress={() => {
                  router.push({
                    pathname: '/flashcards',
                    params: { language: item.id },
                  });
                }}
              >
                {/* Top Arrow Button */}
                <View style={[mobileStyles.cardArrow, { borderColor: isDark ? '#334155' : '#E2E8F0', backgroundColor: colors.background }]}>
                  <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} />
                </View>

                {/* Logo & Title */}
                <View style={mobileStyles.cardHeader}>
                  <View style={mobileStyles.cardLogoWrapper}>
                    <Image source={item.logo} style={mobileStyles.cardLogo} resizeMode="contain" />
                  </View>
                  <Text style={[mobileStyles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                </View>

                {/* Description */}
                <Text style={[mobileStyles.cardDesc, { color: isDark ? '#cbd5e1' : '#000000' }]} numberOfLines={3}>
                  {item.desc}
                </Text>

                {/* Bottom badge + chart */}
                <View style={mobileStyles.cardBottom}>
                  <View style={[mobileStyles.levelBadge, { backgroundColor: item.badgeBg }]}>
                    <Text style={[mobileStyles.levelBadgeText, { color: item.badgeColor }]}>
                      {item.badge}
                    </Text>
                  </View>
                  <MiniChart color={item.chartColor} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Links 2x2 Grid */}
          <View style={mobileStyles.quickLinksGrid}>
            {[
              {
                name: 'Flashcards',
                subtitle: 'Learn visually',
                icon: 'copy-outline',
                color: '#7C3AED',
                bgLight: '#F5F3FF',
                bgDark: '#121026',
                route: '/learn',
                isLangSelect: true,
              },
              {
                name: 'Quiz',
                subtitle: 'Test your knowledge',
                icon: 'help-circle-outline',
                color: '#EA580C',
                bgLight: '#FEF3C7',
                bgDark: '#1E1610',
                route: '/mcq',
              },
              {
                name: 'Notes',
                subtitle: 'Organized learning',
                icon: 'document-text-outline',
                color: '#0D9488',
                bgLight: '#F0FDFA',
                bgDark: '#091E1C',
                route: '/notes',
              },
              {
                name: 'Revision',
                subtitle: 'Strengthen concepts',
                icon: 'repeat-outline',
                color: '#2563EB',
                bgLight: '#EFF6FF',
                bgDark: '#0A142D',
                route: '/revision',
              },
            ].map((item) => {
              const circleBg = isDark ? item.bgDark : item.bgLight;
              const cardBg = isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF';
              const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0';

              return (
                <TouchableOpacity
                  key={item.name}
                  activeOpacity={0.8}
                  style={[
                    mobileStyles.quickLinkCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                    }
                  ]}
                  onPress={() => {
                    if (item.isLangSelect) {
                      router.push('/learn');
                    } else {
                      router.push(item.route as any);
                    }
                  }}
                >
                  <View style={[mobileStyles.quickLinkIconCircle, { backgroundColor: circleBg }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <View style={mobileStyles.quickLinkTextCol}>
                    <Text style={[mobileStyles.quickLinkTitle, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[mobileStyles.quickLinkSub, { color: isDark ? '#cbd5e1' : '#000000' }]} numberOfLines={1}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Overall Progress Card */}
          <View style={[mobileStyles.progressCard, {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          }]}>
            {/* Chart Header */}
            <View style={mobileStyles.progressHeader}>
              <View style={mobileStyles.progressTitleGroup}>
                <View style={mobileStyles.chartIconWrapper}>
                  <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                </View>
                <Text style={[mobileStyles.progressTitleText, { color: colors.text }]}>
                  Overall Progress
                </Text>
              </View>

              {/* Dropdown Selector */}
              <TouchableOpacity style={mobileStyles.dropdownButton} activeOpacity={0.7}>
                <Text style={mobileStyles.dropdownText}>This Week</Text>
                <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Legend Row */}
            <View style={mobileStyles.legendRow}>
              <View style={mobileStyles.legendItem}>
                <View style={[mobileStyles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={[mobileStyles.legendLabel, { color: colors.textSecondary }]}>Coding</Text>
              </View>
              <View style={mobileStyles.legendItem}>
                <View style={[mobileStyles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={[mobileStyles.legendLabel, { color: colors.textSecondary }]}>Problem Solving</Text>
              </View>
              <View style={mobileStyles.legendItem}>
                <View style={[mobileStyles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={[mobileStyles.legendLabel, { color: colors.textSecondary }]}>Conceptual Knowledge</Text>
              </View>
            </View>

            {/* Native SVG Chart */}
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

          {/* Bottom Mini Summary Stats Cards Row */}
          <View style={mobileStyles.summaryRow}>
            {/* Card 1: Total Concepts */}
            <View style={[mobileStyles.summaryMiniCard, {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            }]}>
              <View style={[mobileStyles.summaryIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="bulb-outline" size={14} color="#3B82F6" />
              </View>
              <View style={mobileStyles.summaryMiniTextContainer}>
                <Text style={[mobileStyles.summaryMiniLabel, { color: colors.textSecondary }]}>
                  Total Concepts
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Text style={[mobileStyles.summaryMiniValue, { color: colors.text }]}>
                    {totalConcepts.toLocaleString()}
                  </Text>
                  <Ionicons name="trending-up" size={10} color="#10B981" />
                </View>
              </View>
            </View>

            {/* Card 2: Avg Quiz Score */}
            <View style={[mobileStyles.summaryMiniCard, {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            }]}>
              <View style={[mobileStyles.summaryIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="aperture-outline" size={14} color="#10B981" />
              </View>
              <View style={mobileStyles.summaryMiniTextContainer}>
                <Text style={[mobileStyles.summaryMiniLabel, { color: colors.textSecondary }]}>
                  Avg Quiz Score
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Text style={[mobileStyles.summaryMiniValue, { color: colors.text }]}>
                    {avgQuizScore}
                  </Text>
                  <View style={[mobileStyles.summaryMiniBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Text style={mobileStyles.summaryMiniBadgeText}>▲ 30%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Card 3: Code Execs */}
            <View style={[mobileStyles.summaryMiniCard, {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            }]}>
              <View style={[mobileStyles.summaryIconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Ionicons name="code-slash-outline" size={14} color="#8B5CF6" />
              </View>
              <View style={mobileStyles.summaryMiniTextContainer}>
                <Text style={[mobileStyles.summaryMiniLabel, { color: colors.textSecondary }]}>
                  Code Execs
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Text style={[mobileStyles.summaryMiniValue, { color: colors.text }]}>
                    {codeExecutions}
                  </Text>
                  <Ionicons name="checkmark-circle-outline" size={10} color="#10B981" />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Custom Bottom Tab Bar */}
        <BottomTabBar activeTab="Home" colors={colors} />

        {/* Drawer Menu Modal */}
        <Modal
          visible={drawerVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => toggleDrawer(false)}
        >
          <View style={mobileStyles.drawerOverlay}>
            {/* Backdrop Pressable */}
            <Pressable 
              style={StyleSheet.absoluteFill} 
              onPress={() => toggleDrawer(false)} 
            />
            
            <Animated.View style={[
              mobileStyles.drawerBody,
              { transform: [{ translateX: slideAnim }] }
            ]}>
              {/* Drawer Header with user profile info */}
              <View style={mobileStyles.drawerHeader}>
                <View style={mobileStyles.drawerAvatarContainer}>
                  <Image
                    source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
                    style={mobileStyles.drawerAvatar}
                  />
                </View>
                <View style={mobileStyles.drawerUserInfo}>
                  <Text style={mobileStyles.drawerUserName} numberOfLines={1}>
                    {user?.name || 'Guest User'}
                  </Text>
                  <Text style={mobileStyles.drawerUserEmail} numberOfLines={1}>
                    {user?.email || 'guest@learn2code.com'}
                  </Text>
                </View>
              </View>

              {/* Navigation links list */}
              <ScrollView style={mobileStyles.drawerNavScroll} showsVerticalScrollIndicator={false}>
                {[
                  { name: 'Home', icon: 'home-outline', route: '/home', isActive: true },
                  { name: 'Learn', icon: 'book-outline', route: '/learn' },
                  { name: 'Flashcards', icon: 'copy-outline', route: '/learn', isLangSelect: true },
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
                        mobileStyles.drawerNavItem,
                        item.isActive && mobileStyles.drawerNavItemActive
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        toggleDrawer(false);
                        if (!item.isActive) {
                          router.push(item.route as any);
                        }
                      }}
                    >
                      <Ionicons 
                        name={item.icon as any} 
                        size={20} 
                        color={item.isActive ? '#3B82F6' : colors.textSecondary} 
                        style={mobileStyles.drawerNavIcon}
                      />
                      <Text style={[
                        mobileStyles.drawerNavItemText,
                        { color: item.isActive ? '#3B82F6' : colors.text }
                      ]}>
                        {item.name}
                      </Text>
                      {item.isActive && (
                        <View style={mobileStyles.activeIndicator} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Footer with theme toggle and logout */}
              <View style={mobileStyles.drawerFooter}>
                {/* Theme toggle row */}
                <TouchableOpacity 
                  style={mobileStyles.drawerThemeToggle}
                  activeOpacity={0.7}
                  onPress={toggleTheme}
                >
                  <View style={mobileStyles.drawerThemeToggleLeft}>
                    <Ionicons 
                      name={isDark ? "sunny-outline" : "moon-outline"} 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                    <Text style={[mobileStyles.drawerThemeText, { color: colors.text }]}>
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
                  style={mobileStyles.drawerLogoutBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    toggleDrawer(false);
                    logout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  <Text style={mobileStyles.drawerLogoutText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    );
  }

  // Render original desktop / tablet layout

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1 }}>
          {/* Navigation Header */}
          <View style={themedStyles.header}>
            <View style={themedStyles.headerLeft}>
              {isMobile ? (
                <>
                  <Ionicons name="desktop" size={24} color="#3B82F6" style={{ marginRight: 8 }} />
                  <Text style={themedStyles.logoText}>Learn2Code</Text>
                </>
              ) : (
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Dashboard</Text>
              )}
            </View>

        {/* Horizontal navigation tabs hidden on desktop because Sidebar is used */}

        <View style={themedStyles.headerRight}>
          <View style={themedStyles.toggleContainer}>
            <Ionicons name="sunny" size={18} color="#F59E0B" />
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={isDark ? '#60a5fa' : '#f1f5f9'}
              style={{ marginHorizontal: 6 }}
            />
          </View>

          <TouchableOpacity
            style={themedStyles.accountBtn}
            onPress={() => router.push('/account')}
          >
            <Ionicons name="person-outline" size={15} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={themedStyles.accountBtnText}>My Account</Text>
          </TouchableOpacity>

          {isMobile && (
            <TouchableOpacity style={themedStyles.hamburger} onPress={() => setMenu(!menu)}>
              <Ionicons name="menu-outline" size={28} color="#6366f1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mobile Menu Dropdown */}
      {isMobile && menu && (
        <View style={themedStyles.menu}>
          {navTabs.map((t, i) => (
            <TouchableOpacity
              key={i}
              style={themedStyles.menuBtn}
              onPress={() => {
                setMenu(false);
                if (t.route) router.push(t.route);
              }}
            >
              <Ionicons
                name={t.icon as any}
                size={18}
                color={isDark ? '#cbd5e1' : '#1e293b'}
                style={{ marginRight: 10 }}
              />
              <Text style={themedStyles.menuText}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={themedStyles.scroll}
        contentContainerStyle={themedStyles.scrollContent}
      >
        {tab === 'Home' && (
          <View style={themedStyles.mainContent}>
            {/* Hero Section Banner */}
            <View style={[themedStyles.hero, { backgroundColor: '#051436', overflow: 'hidden' }]}>
              <Image
                source={require('../assets/images/herosection.png')}
                style={{
                  position: 'absolute',
                  right: 0,
                  width: isMobile ? '100%' : '55%',
                  height: '100%',
                  borderRadius: 24,
                }}
                resizeMode="cover"
              />
              <View style={themedStyles.heroOverlay}>
                <View style={themedStyles.welcomeBadge}>
                  <Text style={themedStyles.welcomeText}>👋 Welcome back!</Text>
                </View>

                <View style={themedStyles.heroContent}>
                  <Text style={themedStyles.heroTitleWelcome}>Welcome back to</Text>
                  <View style={themedStyles.heroTitleBrandRow}>
                    <Text style={themedStyles.heroTitleBrand}>Learn2Code</Text>
                    <Image
                      source={require('../assets/images/rocket.png')}
                      style={themedStyles.heroRocket}
                      resizeMode="contain"
                    />
                  </View>

                  <Text style={themedStyles.heroSubtitle}>
                    Learn programming with interactive Flashcards, Quiz, Notes & Revision
                  </Text>

                  <TouchableOpacity
                    style={themedStyles.heroStartBtn}
                    onPress={() => router.push('/learn')}
                  >
                    <LinearGradient
                      colors={['#6366f1', '#4f46e5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={themedStyles.heroStartBtnGrad}
                    >
                      <Text style={themedStyles.heroStartBtnText}>Start Learning</Text>
                      <View style={themedStyles.heroStartBtnIconBg}>
                        <Ionicons name="chevron-forward" size={12} color="#4f46e5" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Statistics Overlay Row */}
                <View style={[themedStyles.statsRow, isMobile && themedStyles.statsRowMobile]}>
                  {/* Topics Learned */}
                  <View style={themedStyles.statBox}>
                    <Ionicons name="desktop" size={24} color="#38bdf8" />
                    <View style={themedStyles.statTextBox}>
                      <Text style={themedStyles.statValue}>{topicsLearned}</Text>
                      <Text style={themedStyles.statLabel}>Topics Learned</Text>
                    </View>
                  </View>

                  {!isMobile && <View style={themedStyles.statDivider} />}

                  {/* Quizzes Completed */}
                  <View style={themedStyles.statBox}>
                    <Ionicons name="aperture" size={24} color="#f43f5e" />
                    <View style={themedStyles.statTextBox}>
                      <Text style={themedStyles.statValue}>{quizzesCompleted}</Text>
                      <Text style={themedStyles.statLabel}>Quizzes Completed</Text>
                    </View>
                  </View>

                  {!isMobile && <View style={themedStyles.statDivider} />}

                  {/* Day Streak */}
                  <View style={themedStyles.statBox}>
                    <Ionicons name="flame" size={24} color="#f97316" />
                    <View style={themedStyles.statTextBox}>
                      <Text style={themedStyles.statValue}>{streakCount}</Text>
                      <Text style={themedStyles.statLabel}>Day Streak</Text>
                    </View>
                  </View>

                  {!isMobile && <View style={themedStyles.statDivider} />}

                  {/* Points Earned */}
                  <View style={themedStyles.statBox}>
                    <Ionicons name="star" size={24} color="#eab308" />
                    <View style={themedStyles.statTextBox}>
                      <Text style={themedStyles.statValue}>{pointsEarned}</Text>
                      <Text style={themedStyles.statLabel}>Points Earned</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Choose Any Language Section */}
            <View style={themedStyles.sectionHeader}>
              <View style={themedStyles.sectionHeaderTitleRow}>
                <Ionicons name="code-slash" size={22} color="#6366f1" style={{ marginRight: 8 }} />
                <Text style={themedStyles.sectionHeading}>Choose Any Language</Text>
              </View>
              <TouchableOpacity
                style={themedStyles.viewAllBtn}
                onPress={() => router.push('/learn')}
              >
                <Text style={themedStyles.viewAllText}>View All Courses</Text>
                <Ionicons name="chevron-forward" size={14} color="#6366f1" />
              </TouchableOpacity>
            </View>

            {/* Languages Grid */}
            <View style={themedStyles.cardGrid}>
              {languageCards.map((item, i) => (
                <Pressable
                  key={i}
                  style={({ hovered }) => [
                    themedStyles.langCard,
                    { width: cardWidth },
                    hovered && themedStyles.langCardHover,
                  ]}
                  onPress={() => {
                    router.push({
                      pathname: '/flashcards',
                      params: {
                        language: item.id,
                      },
                    });
                  }}
                >
                  {({ hovered }) => (
                    <View style={themedStyles.langCardContent}>
                      {/* Top Arrow Button */}
                      <TouchableOpacity
                        style={themedStyles.cardArrow}
                        onPress={() => {
                          router.push({
                            pathname: '/flashcards',
                            params: {
                              language: item.id,
                            },
                          });
                        }}
                      >
                        <Ionicons name="chevron-forward" size={14} color="#64748B" />
                      </TouchableOpacity>

                      {/* Header Logo + Title */}
                      <View style={themedStyles.cardHeader}>
                        <View style={themedStyles.cardLogoWrapper}>
                          <Image
                            source={item.logo}
                            style={themedStyles.cardLogo}
                            resizeMode="contain"
                          />
                        </View>
                        <Text style={themedStyles.cardTitle}>{item.name}</Text>
                      </View>

                      {/* Description */}
                      <Text style={themedStyles.cardDesc}>{item.desc}</Text>

                      {/* Bottom Info Row */}
                      <View style={themedStyles.cardBottom}>
                        <View style={[themedStyles.levelBadge, { backgroundColor: item.badgeBg }]}>
                          <Text style={[themedStyles.levelBadgeText, { color: item.badgeColor }]}>
                            {item.badge}
                          </Text>
                        </View>
                        <MiniChart color={item.chartColor} />
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            {/* Bottom Quick Links Menu Card */}
            <View style={themedStyles.footerCard}>
              <View style={[themedStyles.footerRow, isMobile && themedStyles.footerRowMobile]}>
                {footerLinks.map((item, i) => (
                  <React.Fragment key={i}>
                    <TouchableOpacity
                      style={themedStyles.footerItem}
                      onPress={() => router.push(item.route)}
                    >
                      <View style={[themedStyles.footerIconCircle, { backgroundColor: item.bg }]}>
                        <Ionicons name={item.icon as any} size={18} color={item.color} />
                      </View>
                      <View style={themedStyles.footerTextContainer}>
                        <Text style={themedStyles.footerItemTitle}>{item.name}</Text>
                        <Text style={themedStyles.footerItemSub}>{item.subtitle}</Text>
                      </View>
                    </TouchableOpacity>
                    {i < footerLinks.length - 1 && !isMobile && (
                      <View style={themedStyles.footerDivider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>
        )}

        {tab === 'Notes' && (
          <View style={themedStyles.subTabContainer}>
            <Text style={themedStyles.subHeading}>{lang} Notes</Text>
            {notes.map((item, i) => (
              <View key={i} style={themedStyles.listCard}>
                <Text style={themedStyles.subText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'Revision' && (
          <View style={themedStyles.subTabContainer}>
            <Text style={themedStyles.subHeading}>{lang} Revision</Text>
            {rev.map((item, i) => (
              <View key={i} style={themedStyles.listCard}>
                <Text style={themedStyles.subText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
          </ScrollView>
      </View>
    </View>
  );
}

const styles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 30,
  },

  mainContent: {
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.04,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },

  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  tabButtonActive: {
    backgroundColor: isDark ? '#312E81' : '#EEF2FF',
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  tabTextActive: {
    color: '#6366f1',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  accountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },

  accountBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },

  hamburger: {
    padding: 4,
  },

  menu: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  menuBtn: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },

  hero: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    minHeight: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },

  heroOverlay: {
    flex: 1,
    padding: 30,
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
    justifyContent: 'space-between',
  },

  welcomeBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },

  welcomeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  heroContent: {
    marginTop: 16,
    marginBottom: 24,
  },

  heroTitleWelcome: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 34,
  },

  heroTitleBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },

  heroTitleBrand: {
    fontSize: 38,
    fontWeight: '900',
    color: '#818CF8',
    letterSpacing: -1,
  },

  heroRocket: {
    width: 44,
    height: 44,
    marginLeft: 6,
  },

  heroSubtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 22,
    maxWidth: 480,
    marginTop: 10,
    fontWeight: '500',
  },

  heroStartBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginTop: 20,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },

  heroStartBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  heroStartBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 10,
  },

  heroStartBtnIconBg: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsRow: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },

  statsRowMobile: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'stretch',
  },

  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statTextBox: {
    justifyContent: 'center',
  },

  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },

  statLabel: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '500',
  },

  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },

  sectionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },

  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#312E81' : '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  viewAllText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },

  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },

  langCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.2 : 0.03,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },

  langCardHover: {
    borderColor: '#6366f1',
    transform: [{ scale: 1.02 }],
  },

  langCardContent: {
    padding: 20,
    position: 'relative',
  },

  cardArrow: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  cardLogoWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardLogo: {
    width: 44,
    height: 44,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },

  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },

  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  levelBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  footerCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.2 : 0.03,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 30,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  footerRowMobile: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'stretch',
  },

  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },

  footerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  footerTextContainer: {
    justifyContent: 'center',
  },

  footerItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },

  footerItemSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  footerDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },

  subTabContainer: {
    padding: 10,
  },

  subHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 12,
  },

  listCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 1,
  },

  subText: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
});

const mobileStylesCreator = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 12,
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

  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  hero: {
    borderRadius: 24,
    minHeight: 270,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0',
  },

  heroBgImage: {
    position: 'absolute',
    right: -15,
    top: 5,
    width: '45%',
    height: '65%',
    opacity: 0.95,
  },

  heroContentContainer: {
    padding: 20,
    paddingBottom: 76,
  },

  welcomeBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },

  welcomeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  heroTextBlock: {
    width: '55%',
  },

  heroTitleWelcome: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  heroTitleBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },

  heroTitleBrand: {
    color: '#818CF8',
    fontSize: 24,
    fontWeight: '900',
  },

  heroRocket: {
    width: 22,
    height: 22,
  },

  heroSubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    fontWeight: '500',
  },

  heroStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
    gap: 6,
  },

  heroStartBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  heroStartBtnIconBg: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsOverlayRow: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },

  statItemTextCol: {
    justifyContent: 'center',
  },

  statItemVal: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  statItemLbl: {
    color: '#94a3b8',
    fontSize: 7.5,
    fontWeight: '600',
    lineHeight: 9,
  },

  statItemDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
  },

  sectionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
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

  languagesSlider: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  langCard: {
    width: 180,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
    marginRight: 12,
    justifyContent: 'space-between',
    minHeight: 185,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  cardArrow: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  cardLogoWrapper: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardLogo: {
    width: 30,
    height: 30,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },

  cardDesc: {
    fontSize: 11.5,
    lineHeight: 15,
    marginBottom: 12,
    minHeight: 45,
  },

  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  levelBadge: {
    paddingVertical: 2.5,
    paddingHorizontal: 8,
    borderRadius: 12,
  },

  levelBadgeText: {
    fontSize: 8.5,
    fontWeight: 'bold',
  },

  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },

  quickLinkCard: {
    width: '48.5%',
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

  quickLinkIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickLinkTextCol: {
    flex: 1,
  },

  quickLinkTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  quickLinkSub: {
    fontSize: 9,
    marginTop: 1,
  },

  progressCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  progressTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  chartIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: colors.background,
  },

  dropdownText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
    justifyContent: 'center',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 1.2,
  },

  legendLabel: {
    fontSize: 9,
    fontWeight: '600',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    width: '100%',
  },

  summaryMiniCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },

  summaryIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryMiniTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  summaryMiniLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },

  summaryMiniValue: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
  },

  summaryMiniBadge: {
    paddingVertical: 1,
    paddingHorizontal: 3,
    borderRadius: 3,
  },

  summaryMiniBadgeText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 7,
  },

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

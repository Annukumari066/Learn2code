import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { mcqData } from '../data/mcqData';
import { router, useFocusEffect, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';


const getLogoByLangKey = (key: string) => {
  switch (key) {
    case 'C': return require('../assets/images/c.png');
    case 'C++': return require('../assets/images/cpp.png');
    case 'Java': return require('../assets/images/java.png');
    case 'Python': return require('../assets/images/python.png');
    default: return null;
  }
};

export default function MCQ() {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors, isDark);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Completed levels state per language
  const [completedC, setCompletedC] = useState<number[]>([]);
  const [completedCpp, setCompletedCpp] = useState<number[]>([]);
  const [completedJava, setCompletedJava] = useState<number[]>([]);
  const [completedPython, setCompletedPython] = useState<number[]>([]);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Load progress dynamically from AsyncStorage
  const loadProgress = useCallback(async () => {
    try {
      const savedPhoto = await AsyncStorage.getItem('@profile_photo');
      if (savedPhoto) setProfilePic(savedPhoto);
      else setProfilePic(null);
    } catch (e) {
      console.log('Failed to load profile photo in MCQ:', e);
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await fetch(`${API_URL}/api/progress`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const progressData = await res.json();
          if (progressData) {
            const completed_C = progressData.completed_C || [];
            const completed_Cpp = progressData.completed_Cpp || [];
            const completed_Java = progressData.completed_Java || [];
            const completed_Python = progressData.completed_Python || [];

            await AsyncStorage.setItem('completed_C', JSON.stringify(completed_C));
            await AsyncStorage.setItem('completed_C++', JSON.stringify(completed_Cpp));
            await AsyncStorage.setItem('completed_Java', JSON.stringify(completed_Java));
            await AsyncStorage.setItem('completed_Python', JSON.stringify(completed_Python));
          }
        }
      }
    } catch (e) {
      console.log('Failed to fetch progress from backend in MCQ:', e);
    }

    try {
      const cLevels = await AsyncStorage.getItem('completed_C');
      const cppLevels = await AsyncStorage.getItem('completed_C++');
      const javaLevels = await AsyncStorage.getItem('completed_Java');
      const pythonLevels = await AsyncStorage.getItem('completed_Python');

      if (cLevels) setCompletedC(JSON.parse(cLevels));
      if (cppLevels) setCompletedCpp(JSON.parse(cppLevels));
      if (javaLevels) setCompletedJava(JSON.parse(javaLevels));
      if (pythonLevels) setCompletedPython(JSON.parse(pythonLevels));
    } catch (e) {
      console.error('Failed to load completed levels', e);
    }
  }, []);

  // Reload progress whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  // Level data helper
  const getCompletedLevelsForLang = (l: string) => {
    if (l === 'C') return completedC;
    if (l === 'C++') return completedCpp;
    if (l === 'Java') return completedJava;
    if (l === 'Python') return completedPython;
    return [];
  };

  const [lang, setLang] = useState('');
  const [level, setLevel] = useState('');
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [step, setStep] = useState('language');
  const [selectedLang, setSelectedLang] = useState('');

  const questions = (mcqData as any)[lang]?.[level] || [];

  const languages = [
    {
      name: 'C',
      image: require('../assets/images/c.png'),
      color: ['#3b82f6', '#93c5fd']
    },
    {
      name: 'C++',
      image: require('../assets/images/cpp.png'),
      color: ['#1e3a8a', '#60a5fa']
    },
    {
      name: 'Java',
      image: require('../assets/images/java.png'),
      color: ['#f97316', '#fdba74']
    },
    {
      name: 'Python',
      image: require('../assets/images/python.png'),
      color: ['#eab308', '#fde68a']
    }
  ];

  const currentLangCompleted = getCompletedLevelsForLang(selectedLang);

  if (step === 'level') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          onPress={() => setStep('language')}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.heading}>
          {selectedLang} Levels
        </Text>

        <View style={styles.levelGrid}>
          {[1, 2, 3, 4, 5].map((lvl) => {
            const isUnlocked = lvl === 1 || currentLangCompleted.includes(lvl - 1);
            const isCompleted = currentLangCompleted.includes(lvl);

            return (
              <TouchableOpacity
                key={lvl}
                disabled={!isUnlocked}
                style={[
                  styles.levelCard,
                  !isUnlocked && styles.lockedCard,
                  isCompleted && styles.completedCard
                ]}
                onPress={() => {
                  router.push({
                    pathname: '/mcqmodern',
                    params: {
                      lang: selectedLang,
                      level: 'level' + lvl,
                    },
                  });
                }}
              >
                <Text style={[styles.levelTitle, isCompleted && { color: isDark ? '#ffffff' : '#111111' }]}>
                  Level {lvl}
                </Text>

                <Text style={[styles.levelDesc, isCompleted && { color: isDark ? '#e2e8f0' : '#475569' }]}>
                  {isCompleted
                    ? 'Completed ✅'
                    : isUnlocked
                    ? 'Start Test'
                    : 'Locked 🔒'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  if (step === 'quiz') {
    const q = questions[currentQuestion];
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 10 }}>
            Question {currentQuestion + 1}/{questions.length}
          </Text>

          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: colors.text }}>
            {q.question}
          </Text>

          {q.options.map((opt: string, idx: number) => {
            const isSelected = answers[currentQuestion] === opt;
            return (
              <TouchableOpacity
                key={idx}
                style={{
                  padding: 15,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.accent : colors.border,
                  borderRadius: 12,
                  marginTop: 10,
                  backgroundColor: isSelected ? (isDark ? '#1e3a8a' : '#dbeafe') : colors.card,
                }}
                onPress={() =>
                  setAnswers({
                    ...answers,
                    [currentQuestion]: opt,
                  })
                }
              >
                <Text style={{ color: isSelected ? (isDark ? '#ffffff' : '#1e3a8a') : colors.text }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.submit}
          onPress={async () => {
            if (currentQuestion < questions.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
            } else {
              let score = 0;
              questions.forEach((q: any, i: number) => {
                if (answers[i] === q.answer) {
                  score++;
                }
              });

              const currentLevel = Number(level.replace('level', ''));

              if (score >= questions.length * 0.7) {
                alert(`🎉 Passed!\nScore: ${score}/${questions.length}`);

                const key = `completed_${selectedLang}`;
                const stored = await AsyncStorage.getItem(key);
                let completed = stored ? JSON.parse(stored) : [];
                if (!completed.includes(currentLevel)) {
                  completed.push(currentLevel);
                  await AsyncStorage.setItem(key, JSON.stringify(completed));
                }

                setCurrentQuestion(0);
                setAnswers({});
                loadProgress();
                setStep('level');
              } else {
                alert(`❌ Failed!\nScore: ${score}/${questions.length}`);
              }
            }
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const cardWidth = isMobile ? (width < 480 ? '100%' : '48%') : '23%';
  const progressCardWidth = isMobile ? '100%' : (width < 900 ? '48%' : '23%');

  // Overall progress is calculated dynamically across 4 languages (5 levels each = 20 levels total)
  const totalCompleted = completedC.length + completedCpp.length + completedJava.length + completedPython.length;
  const overallProgress = Math.min(Math.round((totalCompleted / 20) * 100), 100);

  const handleStartProgressQuiz = (langKey: string, completedList: number[]) => {
    const nextLvl = completedList.length === 5 ? 5 : completedList.length + 1;
    router.push({
      pathname: '/mcqmodern',
      params: {
        lang: langKey,
        level: 'level' + nextLvl,
      },
    });
  };

  const progressData = [
    {
      language: 'C Programming',
      langKey: 'C',
      completedList: completedC,
      level: `Level ${completedC.length === 5 ? 5 : completedC.length + 1}`,
      topic: completedC.length === 5 ? 'All Completed' : `Level ${completedC.length + 1} Test`,
      progress: Math.min(Math.round((completedC.length / 5) * 100), 100),
      button: completedC.length === 5 ? 'Review' : 'Continue'
    },
    {
      language: 'C++',
      langKey: 'C++',
      completedList: completedCpp,
      level: `Level ${completedCpp.length === 5 ? 5 : completedCpp.length + 1}`,
      topic: completedCpp.length === 5 ? 'All Completed' : `Level ${completedCpp.length + 1} Test`,
      progress: Math.min(Math.round((completedCpp.length / 5) * 100), 100),
      button: completedCpp.length === 5 ? 'Review' : 'Continue'
    },
    {
      language: 'Python',
      langKey: 'Python',
      completedList: completedPython,
      level: `Level ${completedPython.length === 5 ? 5 : completedPython.length + 1}`,
      topic: completedPython.length === 5 ? 'All Completed' : `Level ${completedPython.length + 1} Test`,
      progress: Math.min(Math.round((completedPython.length / 5) * 100), 100),
      button: completedPython.length === 5 ? 'Review' : 'Start Test'
    },
    {
      language: 'Java',
      langKey: 'Java',
      completedList: completedJava,
      level: `Level ${completedJava.length === 5 ? 5 : completedJava.length + 1}`,
      topic: completedJava.length === 5 ? 'All Completed' : `Level ${completedJava.length + 1} Test`,
      progress: Math.min(Math.round((completedJava.length / 5) * 100), 100),
      button: completedJava.length === 5 ? 'Completed' : 'Start Test'
    }
  ];

  if (isMobile) {
    return (
      <View style={{ flex: 1, position: 'relative', backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        {/* BACKDROP FOR SIDEBAR (Always overlay when visible) */}
        {sidebarVisible && (
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setSidebarVisible(false)}
          />
        )}

        {/* SIDEBAR (Absolute Overlay Drawer style) */}
        {sidebarVisible && (
          <LinearGradient
            colors={['#4f46e5', '#9333ea']}
            style={[
              styles.sidebar,
              styles.sidebarMobile
            ]}
          >
            <View style={styles.sidebarHeader}>
              <Text style={styles.logo}>Learn2Code</Text>
              <TouchableOpacity
                onPress={() => setSidebarVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profile}>
              <Image
                source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
                style={styles.avatar}
              />
              <Text style={styles.name}>Annu</Text>
              <Text style={styles.percent}>{overallProgress}% Complete</Text>
            </View>

            <View style={styles.menuContainer}>
              <TouchableOpacity
                onPress={() => {
                  router.push('/mcq');
                  setSidebarVisible(false);
                }}
              >
                <Text style={styles.menu}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  router.push('/mcq');
                  setSidebarVisible(false);
                }}
              >
                <Text style={styles.menu}>Take a Test</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  router.push('/result');
                  setSidebarVisible(false);
                }}
              >
                <Text style={styles.menu}>My Results</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSidebarVisible(false);
                }}
              >
                <Text style={styles.menu}>Leaderboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSidebarVisible(false);
                }}
              >
                <Text style={styles.menu}>Settings</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {/* MOBILE HEADER */}
        <View style={styles.mobileHeader}>
          <TouchableOpacity
            style={styles.mobileMenuButton}
            onPress={() => setSidebarVisible(true)}
          >
            <Ionicons name="menu-outline" size={28} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.mobileHeaderTitle}>mcq</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.mobileMain}
          contentContainerStyle={styles.mobileMainContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.mobileHeading}>Welcome back 👋</Text>
          <Text style={styles.mobileSub}>Choose your language section</Text>

          {/* LANGUAGE SECTION CARDS */}
          <View style={styles.mobileGrid}>
            {languages.map((item, i) => {
              // Custom text color for SELECT button to match language theme
              const selectTextColor = item.color[0];

              return (
                <LinearGradient
                  key={i}
                  colors={item.color as [string, string]}
                  style={styles.mobileCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Image source={item.image} style={styles.mobileLogoImg} />

                  <View style={styles.mobileCardTextContainer}>
                    <Text style={styles.mobileCardTitle}>{item.name}</Text>
                    <Text style={styles.mobileCardDesc}>
                      Start learning {item.name}
                    </Text>
                  </View>

                  <View style={styles.mobileCardRightContainer}>
                    <TouchableOpacity
                      style={styles.mobileBtn}
                      onPress={() => {
                        setSelectedLang(item.name);
                        setStep('level');
                      }}
                    >
                      <Text style={[styles.mobileBtnText, { color: selectTextColor }]}>
                        SELECT
                      </Text>
                    </TouchableOpacity>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </LinearGradient>
              );
            })}
          </View>

          {/* MY PROGRESS & UPCOMING TESTS */}
          <Text style={styles.mobileProgressHeading}>
            MY PROGRESS & UPCOMING TESTS
          </Text>

          <View style={styles.mobileProgressContainer}>
            {progressData.map((item, i) => {
              const langLogo = getLogoByLangKey(item.langKey);

              return (
                <View key={i} style={styles.mobileProgressCard}>
                  {langLogo && (
                    <Image source={langLogo} style={styles.mobileProgressLogoImg} />
                  )}

                  <View style={styles.mobileProgressTextContainer}>
                    <Text style={styles.mobileProgressTitle}>
                      {item.language} - {item.level}
                    </Text>
                    <Text style={styles.mobileProgressTopic}>({item.topic})</Text>

                    <View style={styles.mobileProgressBarBg}>
                      <View
                        style={[
                          styles.mobileProgressBarFill,
                          { width: `${item.progress}%` },
                        ]}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.mobileProgressBtn}
                    onPress={() =>
                      handleStartProgressQuiz(item.langKey, item.completedList)
                    }
                  >
                    <Text style={styles.mobileProgressBtnText}>{item.button}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.main}
            contentContainerStyle={styles.mainContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.mainHeader}>
              {isMobile && (
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setSidebarVisible(true)}
                >
                  <Text style={styles.menuButtonText}>☰</Text>
                </TouchableOpacity>
              )}
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>
              Welcome back 👋
            </Text>
            <Text style={styles.sub}>
              Choose your language section
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {languages.map((item, i) => (
            <LinearGradient
              key={i}
              colors={item.color as [string, string]}
              style={[styles.card, { width: cardWidth }]}
            >
              <Image
                source={item.image}
                style={styles.logoImg}
              />

              <Text style={styles.cardTitle}>
                {item.name}
              </Text>

              <Text style={styles.cardDesc}>
                Start learning {item.name}
              </Text>

              <TouchableOpacity
                style={styles.btn}
                onPress={() => {
                  setSelectedLang(item.name);
                  setStep('level');
                }}
              >
                <Text style={styles.btnText}>
                  SELECT
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </View>

        {/* PROGRESS SECTION */}
        <Text style={styles.progressHeading}>
          MY PROGRESS & UPCOMING TESTS
        </Text>

        <View style={styles.progressContainer}>
          {progressData.map((item, i) => (
            <View
              key={i}
              style={[styles.progressCard, { width: progressCardWidth }]}
            >
              <Text style={styles.progressTitle}>
                {item.language} - {item.level}
              </Text>

              <Text style={styles.progressTopic}>
                ({item.topic})
              </Text>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${item.progress}%` }
                  ]}
                />
              </View>

              <TouchableOpacity 
                style={styles.progressBtn}
                onPress={() => handleStartProgressQuiz(item.langKey, item.completedList)}
              >
                <Text style={styles.progressBtnText}>
                  {item.button}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      </View>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 999,
  },

  sidebar: {
    width: 230,
    padding: 20,
    justifyContent: 'space-between',
    height: '100%',
  },

  sidebarMobile: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    width: 250,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },

  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  closeButton: {
    padding: 6,
  },

  closeButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold'
  },

  profile: {
    alignItems: 'center',
    marginVertical: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },

  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  percent: {
    color: '#ddd',
    fontSize: 12,
    marginTop: 4,
  },

  menuContainer: {
    flex: 1,
    marginTop: 20,
  },

  menu: {
    color: '#fff',
    marginVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },

  main: {
    flex: 1,
    backgroundColor: colors.background
  },

  mainContentContainer: {
    padding: 24,
    paddingBottom: 60,
  },

  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  menuButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  menuButtonText: {
    fontSize: 24,
    color: colors.accent,
    lineHeight: 24,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },

  sub: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 15,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },

  card: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },

  logoImg: {
    width: 60,
    height: 60,
    marginBottom: 10
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },

  cardDesc: {
    color: '#fff',
    marginVertical: 10,
    textAlign: 'center',
    fontSize: 13,
  },

  btn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10
  },

  btnText: {
    fontWeight: 'bold',
    color: '#1f2937',
  },

  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },

  levelCard: {
    width: 180,
    height: 100,
    backgroundColor: colors.surface,
    borderRadius: 15,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },

  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },

  levelDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
  },

  lockedCard: {
    backgroundColor: isDark ? '#334155' : '#d1d5db',
    opacity: 0.6,
  },

  completedCard: {
    backgroundColor: isDark ? '#065f46' : '#bbf7d0',
  },

  submit: {
    backgroundColor: colors.accent,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
 
  progressHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 16,
    color: colors.text,
  },

  progressContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },

  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },

  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },

  progressTopic: {
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
  },

  progressBarBg: {
    height: 8,
    backgroundColor: colors.inputBg,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },

  progressBtn: {
    marginTop: 16,
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  progressBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  backBtn: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },

  backText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
  },

  // Mobile-specific styles matching the design layout exactly
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  mobileMenuButton: {
    padding: 4,
  },
  mobileHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    fontFamily: 'System',
  },
  mobileMain: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mobileMainContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  mobileHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
  },
  mobileSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  mobileGrid: {
    gap: 12,
  },
  mobileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mobileLogoImg: {
    width: 48,
    height: 48,
    marginRight: 12,
    resizeMode: 'contain',
  },
  mobileCardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  mobileCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  mobileCardDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  mobileCardRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  mobileProgressHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: isDark ? '#94a3b8' : '#334155',
    marginTop: 28,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  mobileProgressContainer: {
    gap: 12,
  },
  mobileProgressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mobileProgressLogoImg: {
    width: 36,
    height: 36,
    marginRight: 12,
    resizeMode: 'contain',
  },
  mobileProgressTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  mobileProgressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  mobileProgressTopic: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mobileProgressBarBg: {
    height: 4,
    backgroundColor: isDark ? '#334155' : '#e2e8f0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
    width: '90%',
  },
  mobileProgressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  mobileProgressBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  mobileProgressBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});






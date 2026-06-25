import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
  ScrollView,
} from 'react-native';

import {
  useLocalSearchParams,
  router,
} from 'expo-router';

import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';

import ResultHero from '../components/ResultHero';
import ScoreCard from '../components/ScoreCard';
import LevelProgress from '../components/LevelProgress';
import Achievements from '../components/Achivements';
import PerformanceCard from '../components/PerformanceCard';

export default function ResultScreen() {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors, isDark);

  const {
    score,
    answered,
    correct,
    wrong,
    total,
    level,
    lang,
    userAnswers,
    questionsData,
    timeTaken,
  } = useLocalSearchParams();

  useEffect(() => {
    const saveProgress = async () => {
      try {
        // 1. Increment total quizzes taken
        const currentAttempts = await AsyncStorage.getItem('total_quizzes_taken');
        const nextAttempts = currentAttempts ? parseInt(currentAttempts) + 1 : 1;
        await AsyncStorage.setItem('total_quizzes_taken', String(nextAttempts));

        // Save raw score history to compute average score
        if (correct !== undefined) {
          const storedScores = await AsyncStorage.getItem('quiz_scores_history');
          let scoresHistory = storedScores ? JSON.parse(storedScores) : [];
          scoresHistory.push(Number(correct));
          await AsyncStorage.setItem('quiz_scores_history', JSON.stringify(scoresHistory));
        }

        // 2. Add time taken to total study time
        if (timeTaken) {
          const currentStudyTime = await AsyncStorage.getItem('total_study_time');
          const additionalTime = parseInt(String(timeTaken)) || 0;
          const nextStudyTime = currentStudyTime ? parseInt(currentStudyTime) + additionalTime : additionalTime;
          await AsyncStorage.setItem('total_study_time', String(nextStudyTime));
        }

        // 3. Save level completion if score >= 70
        if (Number(score) >= 70 && lang && level) {
          const key = `completed_${lang}`;
          const currentLevelNum = parseInt(String(level).replace(/[^0-9]/g, '')) || 1;

          const stored = await AsyncStorage.getItem(key);
          let completed = stored ? JSON.parse(stored) : [];
          if (!Array.isArray(completed)) {
            completed = [];
          }

          if (!completed.includes(currentLevelNum)) {
            completed.push(currentLevelNum);
            await AsyncStorage.setItem(key, JSON.stringify(completed));
            console.log(`Saved level ${currentLevelNum} completion for ${lang}`);
          }
        }

        // 4. Sync everything with backend
        const nextC = await AsyncStorage.getItem('completed_C').then(v => v ? JSON.parse(v) : []);
        const nextCpp = await AsyncStorage.getItem('completed_C++').then(v => v ? JSON.parse(v) : []);
        const nextJava = await AsyncStorage.getItem('completed_Java').then(v => v ? JSON.parse(v) : []);
        const nextPython = await AsyncStorage.getItem('completed_Python').then(v => v ? JSON.parse(v) : []);
        const totalAttempts = await AsyncStorage.getItem('total_quizzes_taken').then(v => v ? parseInt(v) : 0);
        const totalStudy = await AsyncStorage.getItem('total_study_time').then(v => v ? parseInt(v) : 0);

        const token = await AsyncStorage.getItem('token');
        if (token) {
          await fetch(`${API_URL}/api/progress`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              completed_C: nextC,
              completed_Cpp: nextCpp,
              completed_Java: nextJava,
              completed_Python: nextPython,
              total_quizzes_taken: totalAttempts,
              total_study_time: totalStudy
            })
          });
          console.log('Progress successfully synced with backend on quiz result');
        }
      } catch (err) {
        console.error('Failed to save progress to AsyncStorage or sync with backend', err);
      }
    };
    saveProgress();
  }, [score, lang, level, timeTaken]);

  console.log('RESULT PARAMS');
  console.log(lang);
  console.log(level);
  console.log('RESULT LANG:', lang);
  console.log('RESULT LEVEL:', level);

  const currentLevel =
    parseInt(
      String(level).replace(
        /[^0-9]/g,
        ''
      )
    ) || 1;

  const nextLevel =
    currentLevel + 1;

  const isMobile =
    Dimensions.get('window').width < 768;

  const { width } =
    useWindowDimensions();

  const isTablet =
    width >= 768 &&
    width < 1024;

  const isDesktop =
    width >= 1024;

  const { reviewData } = useLocalSearchParams();

  const openReview = (type: 'correct' | 'wrong') => {
    const answers = JSON.parse(
      userAnswers as string
    );

    const questions = JSON.parse(
      questionsData as string
    );

    const reviewData = questions.map(
      (q: any, index: number) => ({
        ...q,
        userAnswer: answers[index] || '',
      })
    );


    router.push({
      pathname: '/review',
      params: {
        type,
        reviewData: JSON.stringify(
          reviewData
        ),
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 50,
      }}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}

      <View
        style={[
          styles.header,
          {
            flexDirection:
              isMobile
                ? 'column'
                : 'row',
          },
        ]}
      >

        <View>

          <Text style={styles.headerTitle}>
            Quiz Results
          </Text>

          <Text style={styles.headerSubtitle}>
            {lang} • {level}
          </Text>

        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            🎉 Completed
          </Text>
        </View>

      </View>

      {/* Hero + Score */}

      <View
        style={[
          styles.topRow,

          isMobile && {
            flexDirection: 'column',
          },
        ]}
      >

        <ResultHero
          level={String(level)}
          style={{
            flex: isDesktop ? 2 : 1,
          }}
        />

        <ScoreCard
          score={Number(score)}
          answered={Number(answered)}
          correct={Number(correct)}
          wrong={Number(wrong)}
          userAnswers={String(userAnswers)}
          questionsData={String(questionsData)}
          style={{
            flex: 1,
          }}
        />


      </View>

      {/* Progress + Achievements */}

      <View
        style={[
          styles.secondRow,

          isMobile && {
            flexDirection: 'column',
          },
        ]}
      >

        <LevelProgress
          level={String(level)}
        />

        <Achievements
          score={Number(score)}
          answered={Number(answered)}
        />

      </View>

      {/* Performance + Actions */}

      <View
        style={[
          styles.thirdRow,

          isMobile && {
            flexDirection: 'column',
          },
        ]}
      >
        <PerformanceCard
          answered={Number(answered)}
          total={Number(total)}
          correct={Number(correct)}
          wrong={Number(wrong)}
        />



        {/* Action Card */}

        <View style={styles.actionCard}>

          <LinearGradient
            colors={isDark ? ['#6b21a8', '#1e293b'] : ['#c27cee', '#fcfcfd']}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionGradient}
          >

            <Text style={styles.actionEmoji}>
              🚀
            </Text>

            <Text style={styles.actionTitle}>
              Continue Your Journey
            </Text>

            <Text style={styles.actionText}>
              You&apos;re doing great!
              Level 2 is ready to unlock.
              Challenge yourself and
              earn more achievements.
            </Text>

          </LinearGradient>

          {/* Start Level 2 */}

          <TouchableOpacity
            onPress={() => {

              router.push({
                pathname: '/mcqmodern',

                params: {
                  lang,
                  level:
                    `level${nextLevel}`,
                },
              });

            }}
          >

            <LinearGradient
              colors={isDark ? ['#7c3aed', '#6d28d9'] : ['#8e3cc8', '#e1d7f9']}
              start={{ x: 1, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={styles.primaryButton}
            >

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Start Level {nextLevel} →
              </Text>

            </LinearGradient>

          </TouchableOpacity>

          {/* Retry */}

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              router.replace({
                pathname: '/mcqmodern',
                params: {
                  lang,
                  level,
                },
              });
            }}
          >

            <Text style={styles.retryText}>
              Retry Level
            </Text>

          </TouchableOpacity>

        </View>

      </View>

    </ScrollView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: 30,
  },

  headerTitle: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.text,
  },

  headerSubtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 16,
  },

  statusBadge: {
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#d8f9e4',

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 20,
  },

  statusText: {
    color: isDark ? '#4ade80' : '#16A34A',
    fontWeight: '600',
  },

  topRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },

  secondRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },

  thirdRow: {
    flexDirection: 'row',
    gap: 20,
  },

  actionCard: {
    flex: 1,
  },

  actionGradient: {
    borderRadius: 28,
    padding: 25,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },

  actionEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },

  actionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#090606',
    marginBottom: 10,
  },

  actionText: {
    color: colors.textSecondary,
    lineHeight: 24,
  },

  primaryButton: {
    height: 58,

    borderRadius: 18,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 15,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  retryButton: {
    height: 58,

    backgroundColor: colors.inputBg,

    borderRadius: 18,

    justifyContent: 'center',
    alignItems: 'center',
  },

  retryText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 16,
  },

});
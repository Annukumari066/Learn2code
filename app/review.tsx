import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function Review() {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors, isDark);
  const { userAnswers, questionsData, type } = useLocalSearchParams();

  let questions: any[] = [];
  try {
    if (questionsData) {
      questions = JSON.parse(questionsData as string);
    }
  } catch (e) {
    console.error('Failed to parse questionsData', e);
  }

  let answers: any = {};
  try {
    if (userAnswers) {
      answers = JSON.parse(userAnswers as string);
    }
  } catch (e) {
    console.error('Failed to parse userAnswers', e);
  }

  // Map user answers into the questions
  const mappedQuestions = questions.map((q: any, index: number) => ({
    ...q,
    userAnswer: answers[index] || '',
    originalIndex: index,
  }));

  // Filter based on whether we are reviewing 'correct' or 'wrong' questions
  const filteredQuestions = mappedQuestions.filter((q: any) => {
    if (type === 'correct') {
      return q.userAnswer === q.answer;
    }
    if (type === 'wrong') {
      return q.userAnswer !== q.answer;
    }
    return true;
  });

  const isMobile = Dimensions.get('window').width < 768;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
          ← Back to Results
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {type === 'correct'
          ? 'Correct Answers Review'
          : type === 'wrong'
          ? 'Wrong & Skipped Answers'
          : 'Review Answers'}
      </Text>

      {filteredQuestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No questions to display in this section.
          </Text>
        </View>
      ) : (
        filteredQuestions.map((q: any, index: number) => {
          const isCorrectAnswer = q.userAnswer === q.answer;
          return (
            <View
              key={index}
              style={[
                styles.card,
                isCorrectAnswer ? styles.correctCard : styles.wrongCard,
              ]}
            >
              <View
                style={[
                  styles.badge,
                  isCorrectAnswer ? styles.correctBadge : styles.wrongBadge,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isCorrectAnswer
                      ? styles.correctBadgeText
                      : styles.wrongBadgeText,
                  ]}
                >
                  Question {q.originalIndex + 1} • {isCorrectAnswer ? 'Correct' : q.userAnswer ? 'Incorrect' : 'Skipped'}
                </Text>
              </View>

              <Text style={styles.question}>
                {q.question}
              </Text>

              {q.options.map((option: string, optionIndex: number) => {
                const isCorrect = option === q.answer;
                const isUserAnswer = option === q.userAnswer;

                return (
                  <View
                    key={optionIndex}
                    style={[
                      styles.option,
                      isCorrect && styles.correctOption,
                      isUserAnswer && !isCorrect && styles.wrongOption,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionCircle,
                        isCorrect && styles.correctCircle,
                        isUserAnswer && !isCorrect && styles.wrongCircle,
                      ]}
                    >
                      <Text style={styles.optionLetter}>
                        {String.fromCharCode(65 + optionIndex)}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionText}>
                        {option}
                      </Text>

                      {isCorrect && (
                        <Text style={styles.correctLabel}>
                          ✓ Correct Answer
                        </Text>
                      )}

                      {isUserAnswer && !isCorrect && (
                        <Text style={styles.wrongLabel}>
                          ✗ Your Answer
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },

  backButton: {
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  backButtonText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 16,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },

  correctCard: {
    borderColor: '#10B981',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  wrongCard: {
    borderColor: '#EF4444',
    borderWidth: 2,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.inputBg,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 18,
  },

  correctBadge: {
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5',
  },

  correctBadgeText: {
    color: isDark ? '#34d399' : '#065F46',
  },

  wrongBadge: {
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
  },

  wrongBadgeText: {
    color: isDark ? '#fca5a5' : '#991B1B',
  },

  badgeText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },

  question: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },

  optionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7C6EE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },

  optionLetter: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },

  optionText: {
    fontSize: 22,
    color: colors.text,
    fontWeight: '500',
  },

  correctOption: {
    borderColor: '#22C55E',
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#F0FDF4',
  },

  wrongOption: {
    borderColor: '#EF4444',
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
  },

  correctCircle: {
    backgroundColor: '#22C55E',
  },

  wrongCircle: {
    backgroundColor: '#EF4444',
  },

  correctLabel: {
    color: '#16A34A',
    marginTop: 6,
    fontWeight: '700',
  },

  wrongLabel: {
    color: '#DC2626',
    marginTop: 6,
    fontWeight: '700',
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
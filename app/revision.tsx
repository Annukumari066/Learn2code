import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
  Platform,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { useIsFocused } from '@react-navigation/native';
import { API_URL } from '../config';
import { revisionTopics, RevisionTopic, RevisionCard } from '../data/revisionData';
import { useTheme } from '../context/ThemeContext';

export default function Revision() {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isFocused = useIsFocused();

  const [selectedLang, setSelectedLang] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState<'explanation' | 'cards'>('explanation');
  const [userAnswer, setUserAnswer] = useState('');

  // Dynamic progress states for the Hub Dashboard
  const [cProgress, setCProgress] = useState(0);
  const [cppLessons, setCppLessons] = useState(0);
  const [javaNextLesson, setJavaNextLesson] = useState('JVM & Basics');
  const [pythonMastery, setPythonMastery] = useState(0);

  const logos: { [key: string]: any } = {
    C: require('../assets/images/c.png'),
    Cpp: require('../assets/images/cpp.png'),
    Java: require('../assets/images/java.png'),
    Python: require('../assets/images/python.png'),
  };

  const languages = ['C', 'Cpp', 'Java', 'Python'];

  const langDetails: { [key: string]: { name: string; desc: string; color: string } } = {
    C: { name: 'C', desc: 'Fundamental Syntax. Pointers. Structures.', color: '#0ea5e9' },
    Cpp: { name: 'C++', desc: 'OOP Principles. Standard Template Library (STL).', color: '#ef4444' },
    Java: { name: 'Java', desc: 'Object-Oriented. Multithreading. MVC.', color: '#8b5cf6' },
    Python: { name: 'Python', desc: 'Syntax & Functions. Data Structures. Popular Libraries.', color: '#f59e0b' }
  };

  useEffect(() => {
    if (isFocused) {
      loadProgress();
    }
  }, [isFocused]);

  const loadProgress = async () => {
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
      console.log('Failed to fetch progress from backend in Revision:', e);
    }

    try {
      // 1. C progress
      const cStored = await AsyncStorage.getItem('completed_C');
      const cCount = cStored ? JSON.parse(cStored).length : 0;
      setCProgress(Math.round((cCount / 5) * 100));

      // 2. C++ lessons
      const cppStored = await AsyncStorage.getItem('completed_C++');
      const cppCount = cppStored ? JSON.parse(cppStored).length : 0;
      setCppLessons(cppCount * 4); // Map 5 levels to 20 lessons

      // 3. Java next lesson
      const javaStored = await AsyncStorage.getItem('completed_Java');
      const javaCount = javaStored ? JSON.parse(javaStored).length : 0;
      const javaLessons = [
        'JVM & Basics',
        'Platform Independence',
        'Classes & Objects',
        'Inheritance',
        'Exception Handling',
        'All completed! 🎉'
      ];
      setJavaNextLesson(javaLessons[Math.min(javaCount, 5)]);

      // 4. Python mastery
      const pythonStored = await AsyncStorage.getItem('completed_Python');
      const pythonCount = pythonStored ? JSON.parse(pythonStored).length : 0;
      setPythonMastery(Math.round((pythonCount / 5) * 100));

    } catch (e) {
      console.log('Failed to load progress in Revision Hub', e);
    }
  };

  const handleBack = () => {
    if (selectedTopicId !== null) {
      setSelectedTopicId(null);
      setCurrentCard(0);
      setShowAnswer(false);
      setUserAnswer('');
    } else if (selectedLang !== '') {
      setSelectedLang('');
    } else {
      router.back();
    }
  };

  // Helper to parse inline code snippets (e.g. `main()`)
  // Helper to parse bold markdown (**bold**) and inline code backticks (`code`)
  const renderFormattedText = (text: string) => {
    const codeParts = text.split('`');
    return codeParts.map((codePart, cIdx) => {
      if (cIdx % 2 === 1) {
        return (
          <Text key={`code-${cIdx}`} style={styles.inlineCode}>
            {codePart}
          </Text>
        );
      }

      const boldParts = codePart.split('**');
      return boldParts.map((boldPart, bIdx) => {
        if (bIdx % 2 === 1) {
          return (
            <Text key={`bold-${cIdx}-${bIdx}`} style={{ fontWeight: '800', color: colors.text }}>
              {boldPart}
            </Text>
          );
        }
        return boldPart;
      });
    });
  };

  // Custom detailed explanation content renderer with support for monospace code blocks and heading tags
  const renderExplanation = (explanation: string, langColor: string) => {
    const parts = explanation.split('```');
    return parts.map((part, index) => {
      // Odd indices are code blocks
      if (index % 2 === 1) {
        const lines = part.split('\n');
        let langHeader = lines[0].trim();
        let codeLines = lines.slice(1);

        // If first line doesn't match standard programming lang prefixes, include it back in the code block
        const standardLangs = ['c', 'cpp', 'java', 'python', 'c++', 'javascript', 'html', 'css'];
        if (!standardLangs.includes(langHeader.toLowerCase())) {
          codeLines = lines;
          langHeader = '';
        }

        const code = codeLines.join('\n').trim();

        return (
          <View key={index} style={styles.codeBlockContainer}>
            {langHeader ? (
              <View style={styles.codeBlockHeader}>
                <Text style={styles.codeBlockHeaderLang}>{langHeader.toUpperCase()}</Text>
                <Ionicons name="code-slash-outline" size={14} color="#94a3b8" />
              </View>
            ) : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.codeScrollView}>
              <Text style={styles.codeText}>{code}</Text>
            </ScrollView>
          </View>
        );
      } else {
        // Even indices are text blocks
        const paragraphs = part.split('\n\n');
        return paragraphs.map((para, pIdx) => {
          const trimmed = para.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith('###')) {
            const headingText = trimmed.replace(/^###\s*/, '');
            return (
              <Text key={`${index}-${pIdx}`} style={styles.heading3Text}>
                {renderFormattedText(headingText)}
              </Text>
            );
          }

          return (
            <Text key={`${index}-${pIdx}`} style={styles.explanationParagraphText}>
              {renderFormattedText(trimmed)}
            </Text>
          );
        });
      }
    });
  };



  const renderTopicSelection = () => {
    const topics = revisionTopics[selectedLang] || [];
    const details = langDetails[selectedLang];

    return (
      <View style={styles.topicsContainer}>
        {/* Dynamic header banner for the selected language */}
        <View style={[styles.langHeaderCard, { borderLeftColor: details.color }]}>
          <Text style={[styles.langHeaderTitle, { color: details.color }]}>
            {details.name} Revision Topics
          </Text>
          <Text style={styles.langHeaderDesc}>
            Select a topic to explore a detailed educational summary and practice with a 20-card interactive revision deck.
          </Text>
        </View>

        {/* 10 Topic Rows */}
        <View style={styles.topicsList}>
          {topics.map((topic, idx) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicRowCard}
              onPress={() => {
                setSelectedTopicId(topic.id);
                setCurrentCard(0);
                setShowAnswer(false);
                setUserAnswer('');
                setActiveTab('explanation');
              }}
            >
              <View style={[styles.topicNumberBadge, { backgroundColor: details.color + '15' }]}>
                <Text style={[styles.topicNumberText, { color: details.color }]}>
                  {String(idx + 1).padStart(2, '0')}
                </Text>
              </View>
              <View style={styles.topicRowContent}>
                <Text style={styles.topicRowTitle}>{topic.title}</Text>
                <Text style={styles.topicRowDesc} numberOfLines={2}>
                  {topic.shortDesc}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color="#94a3b8"
                style={styles.topicRowChevron}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderWorkspace = () => {
    const topics = revisionTopics[selectedLang] || [];
    const activeTopic = topics.find((t) => t.id === selectedTopicId) || null;
    if (!activeTopic) return null;

    const details = langDetails[selectedLang];
    const cards = activeTopic.cards || [];
    const currentCardData = cards[currentCard] || { question: 'No question found', answer: 'No answer found' };

    const workspaceContent = (
      <>
        {/* Left Column (Desktop) or Selected Tab (Mobile) - Detailed Explanation */}
        {(!isMobile || activeTab === 'explanation') && (
          <View style={[styles.explanationColumn, !isMobile && styles.desktopColumn]}>
            <ScrollView
              style={styles.explanationScroll}
              contentContainerStyle={styles.explanationScrollContent}
              nestedScrollEnabled={true}
            >
              <Text style={styles.workspaceTopicTitle}>{activeTopic.title}</Text>
              <Text style={styles.workspaceTopicSubtitle}>General Topic Overview</Text>
              <View style={styles.explanationSeparator} />

              <View style={styles.generalOverviewContainer}>
                {renderExplanation(activeTopic.explanation, details.color)}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Right Column (Desktop) or Selected Tab (Mobile) - Interactive Flashcard Deck */}
        {(!isMobile || activeTab === 'cards') && (
          <View style={[styles.cardsColumn, !isMobile && styles.desktopColumn]}>
            <View style={styles.cardWorkspaceHeader}>
              <View style={styles.cardHeaderMeta}>
                <Text style={styles.cardProgressCount}>
                  Card {currentCard + 1} of {cards.length}
                </Text>
                <View style={styles.miniProgressBg}>
                  <View
                    style={[
                      styles.miniProgressFill,
                      { width: `${((currentCard + 1) / cards.length) * 100}%`, backgroundColor: details.color },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Flashcard Outer Frame */}
            <View style={styles.flashcardOuter}>
              <LinearGradient colors={isDark ? ['#1e293b', '#0f172a'] : ['#ffffff', '#f8fafc']} style={styles.flashcardInner}>
                <Text style={styles.cardQuestionLabel}>QUESTION</Text>
                <Text style={styles.cardQuestionText}>{currentCardData.question}</Text>

                {showAnswer && (
                  <View style={styles.middleAnswerContainer}>
                    <Text style={styles.cardAnswerLabel}>ANSWER</Text>
                    <Text style={styles.cardAnswerText}>{currentCardData.answer}</Text>
                  </View>
                )}

                {/* User Draft Answer Input at the bottom of the card */}
                <View style={styles.userAnswerContainer}>
                  <Text style={styles.userAnswerLabel}>YOUR ANSWER</Text>
                  <TextInput
                    style={styles.userAnswerInput}
                    placeholder="Write your answer here..."
                    placeholderTextColor="#94a3b8"
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Action Control Buttons */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.toggleAnswerBtn, { borderColor: details.color + '30' }]}
                onPress={() => setShowAnswer(!showAnswer)}
              >
                <Ionicons
                  name={showAnswer ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={details.color}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.toggleAnswerBtnText, { color: details.color }]}>
                  {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.nextCardBtn, { backgroundColor: details.color }]}
                onPress={() => {
                  const total = cards.length;
                  if (currentCard < total - 1) {
                    setCurrentCard(currentCard + 1);
                    setShowAnswer(false);
                    setUserAnswer('');
                  } else {
                    alert(`🎉 You completed the revision for: ${activeTopic.title}!`);
                    setSelectedTopicId(null);
                    setCurrentCard(0);
                    setShowAnswer(false);
                    setUserAnswer('');
                  }
                }}
              >
                <Text style={styles.nextCardBtnText}>
                  {currentCard < cards.length - 1 ? 'Next' : 'Finish'}
                </Text>
                <Ionicons
                  name={currentCard < cards.length - 1 ? 'arrow-forward-outline' : 'checkmark-circle-outline'}
                  size={20}
                  color="#ffffff"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </>
    );

    return (
      <View style={styles.workspaceContainer}>
        {/* Mobile Tab Header Navigation Bar */}
        {isMobile && (
          <View style={styles.tabHeader}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'explanation' && [styles.tabButtonActive, { borderBottomColor: details.color }],
              ]}
              onPress={() => setActiveTab('explanation')}
            >
              <Ionicons
                name="book-outline"
                size={18}
                color={activeTab === 'explanation' ? details.color : '#64748b'}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'explanation' && [styles.tabButtonTextActive, { color: details.color }],
                ]}
              >
                Explanation
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'cards' && [styles.tabButtonActive, { borderBottomColor: details.color }],
              ]}
              onPress={() => setActiveTab('cards')}
            >
              <Ionicons
                name="copy-outline"
                size={18}
                color={activeTab === 'cards' ? details.color : '#64748b'}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'cards' && [styles.tabButtonTextActive, { color: details.color }],
                ]}
              >
                Flashcards (20)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.workspaceBody, !isMobile && styles.desktopWorkspaceBody]}>
          {workspaceContent}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={isDark ? ['#0b0f19', '#1e293b'] : ['#fafafb', '#f4f6f8']} style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={16} color={colors.text} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedTopicId !== null ? 'STUDY WORKSPACE' : 'REVISION HUB'}
        </Text>
      </View>

      {selectedTopicId !== null ? (
        // Render Workspace directly to allow columns independent scrolling
        renderWorkspace()
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {selectedLang === '' ? (
            <View>
              {/* Title Block */}
              <View style={styles.titleBlock}>
                <View style={styles.titleRow}>
                  <Ionicons name="flash-outline" size={28} color="#f59e0b" style={{ marginRight: 8 }} />
                  <Text style={styles.mainTitle}>REVISION SECTION</Text>
                </View>
                <Text style={styles.subtitle}>Select a language to browse its study topics</Text>
              </View>

              {/* Grid Container */}
              <View style={[styles.grid, isMobile && styles.gridMobile]}>
                {languages.map((langKey) => {
                  const details = langDetails[langKey];
                  const logo = logos[langKey];

                  return (
                    <TouchableOpacity
                      key={langKey}
                      style={[styles.langCard, { width: isMobile ? '100%' : '48%' }]}
                      onPress={() => {
                        setSelectedLang(langKey);
                        setSelectedTopicId(null);
                        setCurrentCard(0);
                        setShowAnswer(false);
                      }}
                    >
                      {/* Logo Box */}
                      <View style={styles.logoBox}>
                        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
                      </View>

                      {/* Right side content */}
                      <View style={styles.cardContent}>
                        <Text style={styles.cardTitleText}>{details.name}</Text>
                        <Text style={styles.cardDescText}>{details.desc}</Text>

                        {/* Dynamic Metrics */}
                        {langKey === 'C' && (
                          <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>Progress: {cProgress}%</Text>
                            <Progress.Circle
                              size={16}
                              progress={cProgress / 100}
                              color="#0ea5e9"
                              unfilledColor="#e2e8f0"
                              borderWidth={0}
                              thickness={2.5}
                              style={{ marginLeft: 8 }}
                            />
                          </View>
                        )}

                        {langKey === 'Cpp' && (
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>Lessons: {cppLessons}/20 Completed</Text>
                            <View style={styles.progressBarBg}>
                              <View
                                style={[
                                  styles.progressBarFill,
                                  { width: `${(cppLessons / 20) * 100}%`, backgroundColor: '#ef4444' },
                                ]}
                              />
                            </View>
                          </View>
                        )}

                        {langKey === 'Java' && (
                          <Text style={styles.metricLabel}>
                            Next lesson: <Text style={{ color: '#8b5cf6', fontWeight: '700' }}>{javaNextLesson}</Text>
                          </Text>
                        )}

                        {langKey === 'Python' && (
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>Mastery: {pythonMastery}%</Text>
                            <View style={styles.progressBarBg}>
                              <View
                                style={[styles.progressBarFill, { width: `${pythonMastery}%`, backgroundColor: '#f59e0b' }]}
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            renderTopicSelection()
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginRight: 60, // Align text middle considering back button space
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  titleBlock: {
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 35,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridMobile: {
    flexDirection: 'column',
  },
  langCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metricCol: {
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: colors.inputBg,
    borderRadius: 3,
    marginTop: 6,
    width: '100%',
    maxWidth: 120,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Topics Selection Styling
  topicsContainer: {
    marginTop: 10,
  },
  langHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 6,
    marginBottom: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  langHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  langHeaderDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  topicsList: {
    gap: 14,
  },
  topicRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  topicNumberBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  topicNumberText: {
    fontSize: 14,
    fontWeight: '800',
  },
  topicRowContent: {
    flex: 1,
  },
  topicRowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  topicRowDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  topicRowChevron: {
    marginLeft: 8,
  },
  // Workspace Layout
  workspaceContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  tabButtonTextActive: {
    fontWeight: '800',
  },
  workspaceBody: {
    flex: 1,
  },
  desktopWorkspaceBody: {
    flexDirection: 'row',
    padding: 24,
    gap: 24,
  },
  explanationColumn: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  cardsColumn: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  desktopColumn: {
    flex: 1,
    height: '100%',
  },
  explanationScroll: {
    flex: 1,
  },
  explanationScrollContent: {
    padding: 24,
  },
  workspaceTopicTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 32,
    marginBottom: 12,
  },
  explanationSeparator: {
    height: 1.5,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  explanationParagraphText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  inlineCode: {
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    backgroundColor: colors.inputBg,
    color: '#ef4444',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  codeBlockContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  codeBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
  },
  codeBlockHeaderLang: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  codeScrollView: {
    padding: 16,
  },
  codeText: {
    color: '#f8fafc',
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    lineHeight: 20,
  },
  // Card Review Frame Styles
  cardWorkspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  cardHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardProgressCount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    minWidth: 90,
  },
  miniProgressBg: {
    height: 6,
    backgroundColor: colors.inputBg,
    borderRadius: 3,
    flex: 1,
    marginLeft: 16,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  flashcardOuter: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    marginBottom: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  flashcardInner: {
    padding: 24,
    flex: 1,
    minHeight: 220,
  },
  cardQuestionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardQuestionText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 28,
    marginBottom: 20,
  },
  middleAnswerContainer: {
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    paddingLeft: 12,
    paddingVertical: 4,
  },
  cardAnswerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981', // Always green
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardAnswerText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  userAnswerContainer: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 16,
    marginTop: 'auto',
  },
  userAnswerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  userAnswerInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.inputText,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    flex: 0.48,
  },
  toggleAnswerBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
  },
  toggleAnswerBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  nextCardBtn: {
    // Dynamic background color set inline
  },
  nextCardBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  workspaceTopicSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  heading3Text: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: 6,
  },
  generalOverviewContainer: {
    marginBottom: 8,
  },
});
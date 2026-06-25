import React,{useState,
  useEffect,} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native'; 
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { mcqData } from '../data/mcqData';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';


export default function MCQModern() {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors, isDark);
  const [startedAt] =
  useState(
    new Date().toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  );

const params = useLocalSearchParams();

const lang =
  typeof params.lang === 'string'
    ? params.lang
    : '';

const level =
  typeof params.level === 'string'
    ? params.level
    : '';

console.log('ALL PARAMS:', params);
console.log('PARAMS JSON:', JSON.stringify(params));
console.log('LANG:', lang);
console.log('LEVEL:', level);
const isMobile =
  Dimensions.get('window').width < 768;
const [selectedAnswer, setSelectedAnswer] =
  useState<string | null>(null);
const [answers, setAnswers] =
  useState<{ [key: number]: string }>({});  
const [currentQuestion,
  setCurrentQuestion] =
  useState(0);
const levelTimeMap: {
  [key: string]: number;
} = {
  level1: 15 * 60,
  level2: 20 * 60,
  level3: 20 * 60,
  level4: 25 * 60,
  level5: 30 * 60,
};
const [timeLeft, setTimeLeft] =
  useState(
    levelTimeMap[
      level as string
    ] || 15 * 60
  ); // 20 min  
const [autoSubmit, setAutoSubmit] =
  useState(false);    
const [questions, setQuestions] = useState<any[]>(() => {
  return (mcqData as any)[lang as string]?.[level as string] || [];
});

useEffect(() => {
  const localFallback = (mcqData as any)[lang as string]?.[level as string] || [];
  setQuestions(localFallback);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mcqs?language=${encodeURIComponent(lang)}&level=${encodeURIComponent(level)}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
        }
      }
    } catch (err) {
      console.log('Failed to fetch MCQs, using fallback data:', err);
    }
  };

  if (lang && level) {
    fetchQuestions();
  }
}, [lang, level]);
console.log('LANG:', lang);
console.log('LEVEL:', level);
console.log('QUESTIONS:', questions.length);  
const q = questions[currentQuestion];
const progress =
  questions.length
    ? ((currentQuestion + 1) /
        questions.length) *
      100
    : 0;
const minutes =
  Math.floor(timeLeft / 60);
const seconds =
  timeLeft % 60;
const formattedTime =
  `${minutes}:${
    seconds < 10
      ? '0' + seconds
      : seconds
  }`;
    useEffect(() => {

  const timer = setInterval(() => {

    setTimeLeft(prev => {

      if (prev <= 1) {

      clearInterval(timer);

      setAutoSubmit(true);

     return 0;
}

      return prev - 1;
    });

  }, 1000);

  return () =>
    clearInterval(timer);

}, []);
useEffect(() => {

  if (autoSubmit) {

    alert(
      '⏰ Time is over! Quiz submitted automatically.'
    );

    handleSubmit();
  }

}, [autoSubmit]);

const answered =
  Object.keys(answers).length;

const correct =
  Object.keys(answers).filter(
    (key) =>
      answers[Number(key)] ===
      questions[Number(key)]?.answer
  ).length;

const wrong =
  answered - correct;

const score =
  Math.round(
    (correct / questions.length) * 100
  );
console.log('SUBMIT LANG:', lang);
console.log('SUBMIT LEVEL:', level);  
const handleSubmit = () => {

  const answered =
    Object.keys(answers).length;

  const correct =
    Object.keys(answers).filter(
      key =>
        answers[Number(key)] ===
        questions[Number(key)]?.answer
    ).length;

  const wrong =
    answered - correct;

  const score =
    Math.round(
      (correct / questions.length) * 100
    );

 router.push({
  pathname: '/result',
  params: {
    score,
    answered,
    correct,
    wrong,
    total: questions.length,

    lang: String(lang),
    level: String(level),

    userAnswers: JSON.stringify(answers),
    questionsData: JSON.stringify(questions),

    timeTaken: 1200 - timeLeft,
  },
});
};
const Wrapper = isMobile
  ? ScrollView
  : View;
 return (
  <Wrapper
    style={{ flex: 1 }}
    {...(isMobile
      ? {
          contentContainerStyle: {
            flexGrow: 1,
          },
          showsVerticalScrollIndicator: false,
        }
      : {})}
  >
    <View style={styles.container}>
      {/* Header */}
      <View
  style={[
    styles.header,
    isMobile && {
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 15,
    },
  ]}
>

  <View style={styles.headerLeft}>

    <LinearGradient
  colors={[
    '#4F46E5',
    '#A855F7'
  ]}
  style={styles.logoBox}
>
  <Text style={styles.logoText}>
    {'</>'}
  </Text>
</LinearGradient>

    <View>
      <Text style={styles.title}>
        MCQ Test
      </Text>

      <Text style={styles.subtitle}>
        Sharpen your coding skills 🚀
      </Text>
    </View>

  </View>

  <View
  style={[
    styles.headerRight,
    isMobile && {
      flexWrap: 'wrap',
      width: '100%',
    },
  ]}
>

    <View style={styles.badge}>
      <Text>🔥</Text>

      <View>
        <Text style={styles.badgeLabel}>
          Streak
        </Text>

        <Text style={styles.badgeValue}>
          7
        </Text>
      </View>
    </View>

    <View style={styles.badge}>
      <Text>💻</Text>

      <View>
        <Text style={styles.badgeLabel}>
          Language
        </Text>

        <Text style={styles.badgeValue}>
          {lang}
        </Text>
      </View>
    </View>

    <View style={styles.badge}>
      <Text>🟢</Text>

      <View>
        <Text style={styles.badgeLabel}>
          Easy
        </Text>

        <Text style={styles.badgeValue}>
          {level}
        </Text>
      </View>
    </View>
     <TouchableOpacity
  onPress={handleSubmit}
>
  <LinearGradient
    colors={[
      '#4473e1',
      '#712696',
    ]}
    style={styles.submitButton}
  >
    <Text style={styles.submitButtonText}>
      Submit Quiz 
    </Text>
  </LinearGradient>
</TouchableOpacity>
  </View>

</View>

     
      {/* Main Content */}
<View
  style={[
    styles.mainContent,
    isMobile && {
      flexDirection: 'column',
    },
  ]}
>
  {/* Left Side */}
  <View
  style={[
    styles.leftSection,
    isMobile && {
      width: '100%',
      padding: 15,
    },
  ]}
>

     {/* Progress */}
     <View style={styles.topSection}>

  {/* Progress Card */}
  <View style={styles.progressCard}>

    <View style={styles.progressHeader}>
      <Text style={styles.progressTitle}>
        Progress
      </Text>

      <Text style={styles.progressPercent}>
        {Math.round(progress)}% Completed
      </Text>
    </View>

    <View style={styles.progressTrack}>
      <LinearGradient
        colors={['#6dfecb', '#8bea97']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.progressFill,
          {
            width: `${progress}%`,
          },
        ]}
      />
    </View>

  </View>


</View>


    {/* Top Row */}
    <View style={styles.questionTop}>

      <View style={styles.questionBadge}>
        <Text style={styles.questionBadgeText}>
          Question {currentQuestion + 1}
        </Text>
      </View>

      <View style={styles.timerBox}>
  <Text style={styles.timerText}>
    ⏱ {formattedTime}
  </Text>
</View>

    </View>

    {/* Question + Illustration */}
    <Text style={styles.questionTitle}>
     {q?.question}
    </Text>

    {/* Options */}
    {q?.options?.map(
      (item: string, index: number) => (

        <TouchableOpacity
          
        key={index}
        onPress={() => {

       setSelectedAnswer(item);

       setAnswers({
       ...answers,
      [currentQuestion]: item,
      });

       }}
       style={[
        styles.optionCard,
        selectedAnswer === item && {
        borderColor: isDark ? '#10b981' : '#6bd661',
        borderWidth: 2,
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#e5fdcef5',
    },
  ]}
>
        

          <View style={styles.optionLetter}>
            <Text
              style={{
                color: '#f2f2f7',
                fontWeight: '700',
              }}
            >
              {['A', 'B', 'C', 'D'][index]}
            </Text>
          </View>

          <Text style={styles.optionText}>
            {item}
          </Text>
        </TouchableOpacity>
      )
    )}
   {/* Footer */}
<View
  style={[
    styles.footer,
    isMobile && {
      flexDirection: 'column',
      gap: 15,
    },
  ]}
>

  {isMobile ? (

    <>
      {/* Next Button */}
      <TouchableOpacity
        style={{ width: '100%' }}
        onPress={() => {

          if (!selectedAnswer) {

            alert(
              'Please select an answer first'
            );

            return;
          }

          if (
            currentQuestion <
            questions.length - 1
          ) {

            setCurrentQuestion(
              currentQuestion + 1
            );

            setSelectedAnswer(null);

          } else {

            alert(
              'Quiz Completed 🎉'
            );

          }

        }}
      >
        <LinearGradient
          colors={[
            '#4F46E5',
            '#A855F7',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.nextButton,
            {
              width: '100%',
            },
          ]}
        >
          <Text style={styles.nextButtonText}>
            Next Question →
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Skip Button */}
      <TouchableOpacity
        style={[
          styles.skipButton,
          {
            width: '100%',
          },
        ]}
        onPress={() => {

          if (
            currentQuestion <
            questions.length - 1
          ) {

            setCurrentQuestion(
              currentQuestion + 1
            );

            setSelectedAnswer(null);

          }

        }}
      >
        <Text style={styles.skipButtonText}>
          ⏭ Skip Question
        </Text>
      </TouchableOpacity>
    </>

  ) : (

    <>
      {/* Desktop Skip */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => {

          if (
            currentQuestion <
            questions.length - 1
          ) {

            setCurrentQuestion(
              currentQuestion + 1
            );

            setSelectedAnswer(null);

          }

        }}
      >
        <Text style={styles.skipButtonText}>
          ⏭ Skip Question
        </Text>
      </TouchableOpacity>

      {/* Desktop Tip */}
      <View style={styles.tipBox}>
        <Text style={styles.tipText}>
          💡 Think carefully before selecting your answer.
        </Text>
      </View>

      {/* Desktop Next */}
      <TouchableOpacity
        onPress={() => {

          if (!selectedAnswer) {

            alert(
              'Please select an answer first'
            );

            return;
          }

          if (
            currentQuestion <
            questions.length - 1
          ) {

            setCurrentQuestion(
              currentQuestion + 1
            );

            setSelectedAnswer(null);

          } else {

            alert(
              'Quiz Completed 🎉'
            );

          }

        }}
      >
        <LinearGradient
          colors={[
            '#4F46E5',
            '#A855F7',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>
            Next Question →
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </>

  )}

</View>
    </View>
        {/* Right Side */}
       <View
  style={[
    styles.rightSection,
    isMobile && {
      width: '100%',
    },
  ]}
>

  {/* Overview */}
  <View
  style={[
    styles.overviewCard,
    isMobile && {
      width: '100%',
      height: 'auto',
    },
  ]}
>
    <Text style={styles.overviewTitle}>
      Overview
    </Text>

    <View style={styles.statsGrid}>

      <View style={styles.statBox}>
        <Text style={{ fontSize: 20 }}>
         ✅
        </Text>
        <Text style={styles.statNumber}>
          {currentQuestion + 1}
        </Text>
        <Text style={styles.statLabel}>
          Attempted
        </Text>
      </View>

      <View style={styles.statBox}>
        <Text style={{ fontSize: 20 }}>
        ✏️
        </Text>
        <Text style={styles.statNumber}>
          {currentQuestion}
        </Text>
        <Text style={styles.statLabel}>
          Answered
        </Text>
      </View>

    </View>

  </View>

  {/* Question Navigator */}
  <View
  style={[
    styles.navigatorCard,
    isMobile && {
      width: '100%',
    },
  ]}
>
    <Text style={styles.navigatorTitle}>
  Question Navigator
</Text>

<View style={styles.navigatorGrid}>

  {questions.map((_: any, index: number) => (

    <TouchableOpacity
      key={index}
      onPress={() =>
        setCurrentQuestion(index)
      }
     style={[
  styles.questionBox,

  answers[index] && {
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
    borderColor: '#22C55E',
    borderWidth: 2,
  },

     currentQuestion === index && {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
]}
    >

      <Text
        style={[
          styles.questionBoxText,

          currentQuestion === index && {
            color: '#fff',
          },
        ]}
      >
        {index + 1}
      </Text>

    </TouchableOpacity>

  ))}

</View>
  </View>

  {/* Session Info */}
 {!isMobile && (

  <View style={styles.sessionCard}>

    <Text style={styles.sessionTitle}>
      Session Info
    </Text>

    <View style={styles.sessionRow}>
      <Text style={styles.sessionLabel}>
        📋 Total Questions
      </Text>

      <Text style={styles.sessionValue}>
        {questions.length}
      </Text>
    </View>

    <View style={styles.sessionRow}>
      <Text style={styles.sessionLabel}>
        ⏱ Time Remaining
      </Text>

      <Text style={styles.sessionValue}>
        {formattedTime}
      </Text>
    </View>

    <View style={styles.sessionRow}>
      <Text style={styles.sessionLabel}>
        📅 Started At
      </Text>

      <Text style={styles.sessionValue}>
        {startedAt}
      </Text>
    </View>

    <View style={styles.sessionRow}>
      <Text style={styles.sessionLabel}>
        🎯 Current Question
      </Text>

      <Text style={styles.sessionValue}>
        {currentQuestion + 1}
      </Text>
    </View>

  </View>

)}
  </View>
  </View>
    </View>
    </Wrapper>
  );
}


const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  header: {
  backgroundColor: colors.surface,
  borderRadius: 24,
  padding: 20,
  height: 80,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 1,
},

  progressCard: {
  flex: 2,
  backgroundColor: colors.surface,
  borderRadius: 24,
  padding:10,
  height: 80,
  justifyContent: 'center',
  shadowColor: colors.accent,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 5,
},

  mainContent: {
  flex: 1,
  flexDirection: 'row',
  gap: 15,
},
 leftSection: {
  flex: 1,
  backgroundColor: colors.surface,
  borderRadius: 24,
  padding:20,
  marginTop:1,
},

  footer: {
  backgroundColor: colors.surface,
  borderRadius: 24,
  padding: 10,

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',

  marginTop: 1,
},

  heading: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  headerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 15,
},

headerRight: {
  flexDirection: 'row',
  gap: 12,
},

logoBox: {
  width: 60,
  height: 60,
  borderRadius: 18,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#7C3AED',
},

logoText: {
  color: '#fff',
  fontSize: 22,
  fontWeight: 'bold',
},

title: {
  fontSize: 30,
  fontWeight: '700',
  color: colors.text,
},

subtitle: {
  fontSize: 15,
  color: colors.textSecondary,
  marginTop: 5,
},

badge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  backgroundColor: colors.surface,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.border,
},

badgeLabel: {
  fontSize: 12,
  color: colors.textSecondary,
},

badgeValue: {
  fontSize: 16,
  fontWeight: '700',
  color: colors.text,
},

progressTrack: {
  height: 12,
  backgroundColor: colors.inputBg,
  borderRadius: 20,
  overflow: 'hidden',
},

progressFill: {
  height: 12,
  borderRadius: 20,
},

questionTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 2,
},

questionBadge: {
  backgroundColor: isDark ? '#1e1b4b' : '#EEF2FF',
  paddingHorizontal: 18,
  paddingVertical: 10,
  borderRadius: 14,
},

questionBadgeText: {
  color: isDark ? '#a5b4fc' : '#4F46E5',
  fontWeight: '700',
},

timerBox: {
  backgroundColor: colors.inputBg,
  paddingHorizontal: 18,
  paddingVertical: 10,
  borderRadius: 14,
},

timerText: {
  fontWeight: '600',
  color: colors.text,
},

questionTitle: {
  fontSize: 22,
  fontWeight: '700',
  color: colors.text,
  marginBottom:15,
},

optionCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 18,
  paddingVertical: 10,
  paddingHorizontal: 18,
  marginBottom: 10,
},

optionLetter: {
  width: 40,
  height: 30,
  borderRadius: 20,
  backgroundColor: '#7d73ea',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 15,
},

optionText: {
  fontSize: 15,
  color: colors.text,
  fontWeight: '500',
},
topSection: {
  flexDirection: 'row',
  gap: 15,
  marginBottom: 15,
},

overviewCard: {
  width: 370,
  height:180,
  backgroundColor: colors.surface,
  borderRadius: 24,
  padding: 15,
  marginBottom: 1,
 
},
progressHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 18,
},

progressTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: colors.text,
},

progressPercent: {
  fontSize: 16,
  fontWeight: '600',
  color: colors.textSecondary,
},

overviewTitle: {
  fontSize: 15,
  fontWeight: '700',
  marginBottom: 15,
  color: colors.text,
},

statsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},

statBox: {
  width: '48%',
  height:70,
  backgroundColor: colors.inputBg,
  borderRadius: 16,
  padding: 14,
  marginBottom: 10,
},

statNumber: {
  fontSize: 20,
  fontWeight: '700',
  color: colors.text,
},

statLabel: {
  marginTop: 3,
  color: colors.textSecondary,
  marginBottom:5,
},

rightSection: {
  width: 370,
  gap: 10,
},

navigatorCard: {
  backgroundColor: colors.surface,
  borderRadius: 24,
  padding: 20,
},


skipButton: {
  width: 180,
  height: 55,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: colors.surface,
},
skipButtonText: {
  color: colors.accent,
  fontSize: 16,
  fontWeight: '700',
},

tipBox: {
  flex: 1,

  marginHorizontal: 30,

  height: 60,

  backgroundColor: colors.inputBg,

  borderRadius: 16,

  justifyContent: 'center',
  alignItems: 'center',
},

tipText: {
  color: colors.textSecondary,
  textAlign: 'center',
  fontSize: 14,
},

nextButton: {
  width: 200,
  height: 53,

  borderRadius: 16,

  justifyContent: 'center',
  alignItems: 'center',
},

nextButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},

navigatorTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: colors.text,
  marginBottom: 10,
  marginTop:1,
},

navigatorGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 7,
},

questionBox: {
  width: 40,
  height: 30,

  borderRadius: 12,

  borderWidth: 1,
  borderColor: colors.border,

  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: colors.inputBg,
},

questionBoxText: {
  fontSize: 13,
  fontWeight: '500',
  color: colors.text,
},

sessionCard: {
  backgroundColor: colors.surface,
  borderRadius: 24,
  padding: 10,
},


sessionTitle: {
  fontSize: 15,
  fontWeight: '700',
  color: colors.text,
  marginBottom: 15,
},

sessionRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 5,
},

sessionLabel: {
  color: isDark ? '#60a5fa' : '#265ca9',
  fontSize: 15,
  fontWeight:'bold',
  
},

sessionValue: {
  color: colors.text,
  fontSize: 15,
  fontWeight: '500',
},
submitButton: {
  paddingHorizontal: 24,
  paddingVertical: 14,
  borderRadius: 16,

  justifyContent: 'center',
  alignItems: 'center',
},

submitButtonText: {
  color: '#fff',
  fontSize: 15,
  fontWeight: '700',
},
});
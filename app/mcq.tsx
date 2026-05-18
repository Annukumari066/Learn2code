import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MCQ() {
  const progressData = [
  {
    language: 'C Programming',
    level: 'Level 2',
    topic: 'Arrays',
    progress: 60,
    button: 'Continue'
  },

  {
    language: 'Python',
    level: 'Level 3',
    topic: 'Functions',
    progress: 30,
    button: 'Start Test'
  },

  {
    language: 'Java',
    level: 'Level 1',
    topic: 'Introduction',
    progress: 100,
    button: 'Completed'
  }
];
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [lang, setLang] = useState('');

  const [level, setLevel] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const mcqData: any = {
    C: {
      level1: [
        {
          question: "What is int?",
          options: ["Integer", "Float", "Char", "None"],
          answer: "Integer"
        },

        {
          question: "printf() is used for?",
          options: ["Input", "Output", "Loop", "Condition"],
          answer: "Output"
        },

        // add total 20 questions here
      ],

      level2: [
        {
          question: "Array index starts from?",
          options: ["0", "1", "2", "10"],
          answer: "0"
        },

        // 20 questions
      ]
    },

    Cpp: {
      level1: [
        {
          question: "C++ is?",
          options: [
            "Programming Language",
            "OS",
            "Database",
            "Browser"
          ],
          answer: "Programming Language"
        }
      ]
    },

    Java: {
      level1: [
        {
          question: "Java is?",
          options: [
            "Platform Independent",
            "OS",
            "Browser",
            "Tool"
          ],
          answer: "Platform Independent"
        }
      ]
    },

    Python: {
      level1: [
        {
          question: "Python is famous for?",
          options: [
            "Easy syntax",
            "Hardware",
            "Compiler",
            "Networking"
          ],
          answer: "Easy syntax"
        }
      ]
    }
  };

  const questions =
    mcqData[lang]?.[level] || [];

  const score = questions.reduce(
    (acc: number, q: any, i: number) => {
      return answers[i] === q.answer
        ? acc + 1
        : acc;
    },
    0
  );

  const [step, setStep] = useState('language');
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
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
  const currentLevel = Number(
    level.replace('level', '')
  );

  if (!completedLevels.includes(currentLevel)) {
    setCompletedLevels([
      ...completedLevels,
      currentLevel,
    ]);
  }
  if (step === 'level') {

   return (
    <View style={styles.container}>

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

          const isUnlocked =
            lvl === 1 ||
            completedLevels.includes(lvl - 1);

          return (

            <TouchableOpacity
              key={lvl}
              disabled={!isUnlocked}
              style={[
                styles.levelCard,

                !isUnlocked &&
                  styles.lockedCard,

                completedLevels.includes(lvl) &&
                  styles.completedCard
              ]}
              onPress={() => {

                setLang(selectedLang);

                setLevel('level' + lvl);

                setStep('quiz');
              }}
            >

              <Text style={styles.levelTitle}>
                Level {lvl}
              </Text>

              <Text style={styles.levelDesc}>
                {completedLevels.includes(lvl)
                  ? 'Completed ✅'
                  : isUnlocked
                  ? 'Start Test'
                  : 'Locked 🔒'}
              </Text>

            </TouchableOpacity>

          );
        })}

      </View>
    </View>
  );
}

   
 if (step === 'quiz') {

  return (
    <View style={styles.container}>

      {questions.map((q: any, i: number) => (

        <View
          key={i}
          style={{ marginBottom: 20 }}
        >

          <Text style={{ fontSize: 18 }}>
            {q.question}
          </Text>

          {q.options.map(
            (opt: string, idx: number) => (

              <TouchableOpacity
                key={idx}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 8,
                  marginTop: 5,
                  backgroundColor:
                    answers[i] === opt
                      ? '#d1e7dd'
                      : '#fff'
                }}
                onPress={() =>
                  setAnswers({
                    ...answers,
                    [i]: opt
                  })
                }
              >
                <Text>{opt}</Text>
              </TouchableOpacity>

            )
          )}

        </View>

      ))}

      <TouchableOpacity
        style={styles.submit}
        onPress={() => {

          let score = 0;

          questions.forEach(
            (q: any, i: number) => {

              if (
                answers[i] === q.answer
              ) {
                score++;
              }
            }
          );

          const currentLevel = Number(
            level.replace('level', '')
          );

          if (
            score === questions.length
          ) {

            alert(
              `🎉 Level ${currentLevel} Completed Successfully`
            );

            if (
              !completedLevels.includes(
                currentLevel
              )
            ) {
              setCompletedLevels([
                ...completedLevels,
                currentLevel
              ]);
            }

            setStep('level');

          } else {

            alert(
              `❌ You got ${score}/${questions.length}`
            );
          }
        }}
      >
        <Text style={{ color: '#fff' }}>
          Submit
        </Text>
      </TouchableOpacity>

    </View>
  );
}



  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>

      {/* SIDEBAR */}
      <LinearGradient
        colors={['#4f46e5', '#9333ea']}
        style={styles.sidebar}
      >
        <Text style={styles.logo}>Learn2Code</Text>

        <View style={styles.profile}>
          <Image
            source={require('../assets/images/avatar.jpeg')}
            style={styles.avatar}
          />
          <Text style={styles.name}>Annu</Text>
          <Text style={styles.percent}>65% Complete</Text>
        </View>

        <View>
          <Text style={styles.menu}>Dashboard</Text>
          <Text style={styles.menu}>Take a Test</Text>
          <Text style={styles.menu}>My Results</Text>
          <Text style={styles.menu}>Leaderboard</Text>
          <Text style={styles.menu}>Settings</Text>
        </View>
      </LinearGradient>

      {/* MAIN */}
      <View style={styles.main}>
        <Text style={styles.heading}>
          Welcome back 👋
        </Text>

        <Text style={styles.sub}>
          Choose your language section
        </Text>

        <View style={styles.grid}>
          {languages.map((item, i) => (
            <LinearGradient
              key={i}
              colors={item.color as [string, string]
              }
              style={styles.card}
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
        
      {/* 👇PROGRESS SECTION HERE 👇 */}
       <Text style={styles.progressHeading}>
       MY PROGRESS & UPCOMING TESTS
      </Text>

      <View style={styles.progressContainer}>

      {progressData.map((item, i) => (

    <View
      key={i}
      style={styles.progressCard}
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
            {
              width: `${item.progress}%`
            }
          ]}
        />

      </View>

      <TouchableOpacity
        style={styles.progressBtn}
      >
        <Text style={styles.progressBtnText}>
          {item.button}
        </Text>
      </TouchableOpacity>

    </View>

  ))}

</View>


      </View>

     </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 230,
    padding: 20,
    justifyContent: 'space-between'
  },

  logo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },

  profile: {
    alignItems: 'center'
  },

  name: {
    color: '#fff',
    fontWeight: 'bold'
  },

  percent: {
    color: '#ddd',
    fontSize: 12
  },

  menu: {
    color: '#fff',
    marginVertical: 10
  },

  main: {
    flex: 1,
    padding: 30,
    backgroundColor: '#f3f4f6'
  },

  heading: {
    fontSize: 26,
    fontWeight: 'bold'
  },

  sub: {
    color: '#666',
    marginBottom: 30
  },

  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  card: {
    width: '23%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',

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
    textAlign: 'center'
  },

  btn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10
  },

  btnText: {
    fontWeight: 'bold'
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
    backgroundColor: '#ffffff',
    borderRadius: 15,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },

  levelDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f3f4f6'
  },

  lockedCard: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },

  completedCard: {
    backgroundColor: '#bbf7d0',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginVertical: 15,
  },
  submit: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
 
progressHeading: {
  fontSize: 28,
  fontWeight: 'bold',
  marginTop: 40,
  marginBottom: 20,
},

progressContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

progressCard: {
  width: '31%',
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 20,

  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 5,
},

progressTitle: {
  fontSize: 18,
  fontWeight: 'bold',
},

progressTopic: {
  color: '#666',
  marginTop: 5,
  marginBottom: 15,
},

progressBarBg: {
  height: 10,
  backgroundColor: '#ddd',
  borderRadius: 10,
  overflow: 'hidden',
},

progressBarFill: {
  height: '100%',
  backgroundColor: '#2563eb',
  borderRadius: 10,
},

progressBtn: {
  marginTop: 20,
  backgroundColor: '#2563eb',
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
},

backText: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#0a296b',
},



});






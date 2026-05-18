import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
  Image,
} from 'react-native';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';

const logos = {
  C: require('../assets/images/c.png'),
  'C++': require('../assets/images/cpp.png'),
  Java: require('../assets/images/java.png'),
  Python: require('../assets/images/python.png'),
};

const data = {
  C: [
    { front: 'printf()', back: 'Used to print output in C.' },
    { front: 'scanf()', back: 'Used to take input from user.' },
    { front: 'int', back: 'Stores whole numbers.' },
    { front: 'float', back: 'Stores decimal values.' },
    { front: 'char', back: 'Stores a single character.' },
    { front: 'if', back: 'Used for condition checking.' },
    { front: 'for', back: 'Loop used for repetition.' },
    { front: 'array', back: 'Stores multiple values.' },
  ],

  'C++': [
    { front: 'cout', back: 'Used to print output in C++.' },
    { front: 'cin', back: 'Used to take input in C++.' },
    { front: 'class', back: 'Blueprint for creating objects.' },
    { front: 'object', back: 'Instance of a class.' },
    { front: 'inheritance', back: 'Reuse properties of another class.' },
    { front: 'polymorphism', back: 'Many forms of one function.' },
    { front: 'vector', back: 'Dynamic array in C++.' },
    { front: 'namespace', back: 'Avoid naming conflicts.' },
  ],

  Java: [
    { front: 'System.out.println()', back: 'Used to print output in Java.' },
    { front: 'Scanner', back: 'Used to take input from user.' },
    { front: 'String', back: 'Stores text values.' },
    { front: 'main()', back: 'Program starts from main method.' },
    { front: 'class', back: 'Blueprint of objects.' },
    { front: 'object', back: 'Instance of class.' },
    { front: 'ArrayList', back: 'Resizable array in Java.' },
    { front: 'if', back: 'Condition statement.' },
  ],

  Python: [
    { front: 'print()', back: 'Used to print output in Python.' },
    { front: 'input()', back: 'Used to take user input.' },
    { front: 'def', back: 'Used to define a function.' },
    { front: 'list', back: 'Stores multiple ordered values.' },
    { front: 'tuple', back: 'Immutable collection.' },
    { front: 'dict', back: 'Stores key-value pairs.' },
    { front: 'for', back: 'Loop through items.' },
    { front: 'if', back: 'Conditional statement.' },
  ],
};

export default function Home() {
  const tabs = ['Home', 'Flashcards', 'MCQ', 'Notes', 'Revision'];
  const langs = ['C', 'C++', 'Java', 'Python'];

  const [tab, setTab] = useState('Home');
  const [lang, setLang] = useState('C');
  const [menu, setMenu] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const cards = data[lang as keyof typeof data];
  const scaleAnim = useState(new Animated.Value(1))[0];

  const notes = Array.from(
    { length: 5 },
    (_, i) => `${lang} Note ${i + 1}: Important concept`
  );

  const rev = Array.from(
    { length: 5 },
    (_, i) => `${lang} Revision ${i + 1}`
  );

  const mcq = Array.from({ length: 5 }, (_, i) => ({
    q: `${lang} Question ${i + 1}?`,
    a: 'Correct Answer',
  }));

  const speak = (text: string, index: number) => {
    setSpeakingIndex(index);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Speech.speak(text, {
      language: 'en',
      rate: 0.9,
      onDone: () => setSpeakingIndex(null),
      onStopped: () => setSpeakingIndex(null),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Text style={styles.logo}>💻 Learn2Code</Text>

       
      <View style={styles.rightNav}>
       <TouchableOpacity
       style={styles.loginBtn}
       onPress={() => router.push('/account')}
      >
      <Text style={styles.loginText}>My Account</Text>
     </TouchableOpacity>

     <TouchableOpacity onPress={() => setMenu(!menu)}>
     <Text style={styles.ham}>☰</Text>
     </TouchableOpacity>
     </View>


      </View>

      {menu && (
        <View style={styles.menu}>
          {tabs.map((x, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuBtn}
             onPress={() => {
              if (x === 'MCQ') {

             router.push('/mcq');

            } else if (x === 'Notes') {

               router.push('/notes');

            } else if(x === 'Revision'){
              router.push('/revision');
            }else{

              setTab(x);
            }
            setMenu(false);
          }}
           >
        <Text style={styles.menuText}>{x}</Text>    
         </TouchableOpacity>
          ))}
          </View>
        )}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === 'Home' && (
          <View>
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>
                🚀 Welcome back to the Learn2Code
              </Text>

              <Text style={styles.heroSub}>
                Learn programming with interactive Flashcards, Quiz, Notes &
                Revision
              </Text>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => setTab('Flashcards')}
              >
                <Text style={styles.startText}>Start Learning</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.heading}>Choose Any Language:-</Text>

            <View style={styles.cardGrid}>
              {langs.map((item, i) => (
                <Pressable
                  key={i}
                  style={({ hovered }) => [
                    styles.langCard,
                    hovered && styles.langCardHover,
                  ]}
                  onPress={() => {
                    setLang(item);
                    setTab('Flashcards');
                  }}
                >
                  <View style={styles.imageBox}>
                    <Image
                      source={logos[item as keyof typeof logos]}
                      style={styles.langImage}
                      resizeMode="contain"
                    />
                  </View>

                  <Text style={styles.langTitle}>{item}</Text>
                  <Text style={styles.langDesc}>
                    Start learning {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {tab === 'Flashcards' && (
          <View>
            <Text style={styles.heading}>{lang} Flashcards</Text>

            <View style={styles.grid}>
              {cards.map((card, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.card,
                    speakingIndex === i && {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Text style={styles.title}>{card.front}</Text>

                  <Text
                    style={[
                      styles.sub,
                      speakingIndex === i && styles.highlightText,
                    ]}
                  >
                    {card.back}
                  </Text>

                  <TouchableOpacity
                    style={styles.audio}
                    onPress={() =>
                      speak(card.front + ' ' + card.back, i)
                    }
                  >
                    <Text style={styles.audioTxt}>🔊 Audio</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {tab === 'Notes' && (
          <View>
            <Text style={styles.heading}>{lang} Notes</Text>
            {notes.map((item, i) => (
              <View key={i} style={styles.listCard}>
                <Text style={styles.sub}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'Revision' && (
          <View>
            <Text style={styles.heading}>{lang} Revision</Text>
            {rev.map((item, i) => (
              <View key={i} style={styles.listCard}>
                <Text style={styles.sub}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf7f2',
    paddingTop: 0,
    paddingHorizontal: 12,
  },

  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#05506b',
    padding: 14,
    borderRadius: 10,
    elevation: 4,
  },

  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  ham: {
    fontSize: 28,
    color: '#fff',
  },

  rightNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  loginBtn: {
    backgroundColor: '#d3d7d822',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },

  loginText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  menu: {
    backgroundColor: '#fff',
    marginTop: 8,
    borderRadius: 14,
    padding: 8,
    elevation: 3,
  },

  menuBtn: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#162548',
  },

  hero: {
    backgroundColor: '#a1f6ff',
    padding: 30,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  heroTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#121e43',
    textAlign: 'center',
  },

  heroSub: {
    fontSize: 16,
    color: '#061427',
    marginTop: 10,
    textAlign: 'center',
  },

  startBtn: {
    marginTop: 20,
    backgroundColor: '#2d194e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fdd85d',
    elevation: 5,
  },

  startText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#013244',
    marginTop: 20,
    marginBottom: 12,
  },

  cardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
langCard: {
  width: '23%',
  backgroundColor: '#dbf3ee',
  padding: 15,
  borderRadius: 18,
  alignItems: 'center',
  marginBottom: 15,
  borderWidth: 1.5,
  borderColor: '#024e56',

  shadowColor: '#2b7078',
  shadowOffset: { width: 3, height: 6 },
  shadowOpacity: 0.58,
  shadowRadius: 10,
  elevation: 5,
},


  langCardHover: {
    backgroundColor: '#daf8f6',
    borderColor: '#f4c43f',
    transform: [{ scale: 1.03 }],
    borderWidth: 3,
  },

 
imageBox: {
  width: 80,
  height: 80,
  borderRadius: 65,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',

  shadowColor: '#056868',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.58,
  shadowRadius: 8,
  elevation: 5,
},



  langImage: {
    width: 60,
    height: 60,
  },

  langTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#0f172a',
  },

  langDesc: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginTop: 6,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },

card: {
  width: '48%',
  backgroundColor: '#ecfeff',
  padding: 14,
  borderRadius: 18,
  marginBottom: 12,
  minHeight: 180,
  justifyContent: 'center',

  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 6,
  elevation: 4,
},



  listCard: {
    backgroundColor: '#f7fcfb',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },

  sub: {
    fontSize: 16,
    color: '#18212f',
    marginTop: 8,
    textAlign: 'center',
  },

  audio: {
    marginTop: 10,
    backgroundColor: '#2f5d80',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth:1,
  },

  audioTxt: {
    color: '#fff',
    fontWeight: '700',
  },

  highlightText: {
    color: '#2563eb',
    fontWeight: 'bold',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  
});



import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

export default function Revision() {

  const revisionData: any = {
    C: [
      {
        question: 'What is Array?',
        answer:
          'Array stores multiple values of same datatype.',
      },

      {
        question: 'What is Loop?',
        answer:
          'Loop repeats statements multiple times.',
      },

      {
        question: 'What is Function?',
        answer:
          'Function is a reusable block of code.',
      },
    ],

    Cpp: [
      {
        question: 'What is OOP?',
        answer:
          'Object Oriented Programming concept.',
      },

      {
        question: 'What is Class?',
        answer:
          'Class is blueprint of objects.',
      },

      {
        question: 'What is Inheritance?',
        answer:
          'Inheritance allows code reusability.',
      },
    ],

    Java: [
      {
        question: 'What is JVM?',
        answer:
          'Java Virtual Machine runs Java programs.',
      },

      {
        question: 'What is Exception Handling?',
        answer:
          'It handles runtime errors.',
      },

      {
        question: 'What is Object?',
        answer:
          'Object is instance of a class.',
      },
    ],

    Python: [
      {
        question: 'What is List?',
        answer:
          'List stores multiple items.',
      },

      {
        question: 'What is Dictionary?',
        answer:
          'Dictionary stores key-value pairs.',
      },

      {
        question: 'What is Function?',
        answer:
          'Function organizes reusable code.',
      },
    ],
  };

  const [selectedLang, setSelectedLang] =
    useState('');

  const [currentCard, setCurrentCard] =
    useState(0);

  const [showAnswer, setShowAnswer] =
    useState(false);

  const languages = Object.keys(revisionData);

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.heading}>
        ⚡ Revision Section
      </Text>

      <Text style={styles.sub}>
        Select a language
      </Text>

      {/* LANGUAGE BUTTONS */}
      <View style={styles.langContainer}>

        {languages.map((lang, i) => (

          <TouchableOpacity
            key={i}
            style={[
              styles.langBtn,

              selectedLang === lang &&
                styles.activeBtn,
            ]}
            onPress={() => {

              setSelectedLang(lang);

              setCurrentCard(0);

              setShowAnswer(false);
            }}
          >

            <Text style={styles.langText}>
              {lang === 'Cpp'
                ? 'C++'
                : lang}
            </Text>

          </TouchableOpacity>

        ))}

      </View>

      {/* FLASHCARD */}
      {selectedLang !== '' && (

        <View style={styles.card}>

          <Text style={styles.question}>
            {
              revisionData[selectedLang][
                currentCard
              ].question
            }
          </Text>

          {showAnswer && (

            <Text style={styles.answer}>
              {
                revisionData[selectedLang][
                  currentCard
                ].answer
              }
            </Text>

          )}

          {/* SHOW ANSWER */}
          <TouchableOpacity
            style={styles.btn}
            onPress={() =>
              setShowAnswer(!showAnswer)
            }
          >

            <Text style={styles.btnText}>
              {showAnswer
                ? 'Hide Answer'
                : 'Show Answer'}
            </Text>

          </TouchableOpacity>

          {/* NEXT BUTTON */}
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {

              const total =
                revisionData[selectedLang]
                  .length;

              if (
                currentCard < total - 1
              ) {

                setCurrentCard(
                  currentCard + 1
                );

                setShowAnswer(false);

              } else {

                alert(
                  '🎉 Revision Completed'
                );
              }
            }}
          >

            <Text style={styles.btnText}>
              Next
            </Text>

          </TouchableOpacity>

        </View>

      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
  },

  heading: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  sub: {
    color: '#666',
    marginTop: 5,
    marginBottom: 25,
  },

  langContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  langBtn: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  activeBtn: {
    backgroundColor: '#2563eb',
  },

  langText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },

  card: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    marginTop: 30,

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  question: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },

  answer: {
    fontSize: 18,
    color: '#444',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 25,
  },

  btn: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },

  nextBtn: {
    backgroundColor: '#16a34a',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

});
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';

export default function Notes() {
  const [selectedLang, setSelectedLang] =
    useState('');

  const [myNote, setMyNote] = useState('');

  const [savedNotes, setSavedNotes] =
    useState<string[]>([]);

  const languages = [
    'C',
    'Cpp',
    'Java',
    'Python',
  ];

  const predefinedNotes: any = {
    C: [
      {
        title: 'Variables',
        content:
          'Variables store data values in memory.',
      },

      {
        title: 'Data Types',
        content:
          'C supports int, float, char, double etc.',
      },

      {
        title: 'Loops',
        content:
          'Loops repeat statements multiple times.',
      },

      {
        title: 'Arrays',
        content:
          'Arrays store multiple values of same type.',
      },

      {
        title: 'Functions',
        content:
          'Functions are reusable blocks of code.',
      },
    ],

    Cpp: [
      {
        title: 'OOP',
        content:
          'C++ supports Object Oriented Programming.',
      },

      {
        title: 'Classes & Objects',
        content:
          'Classes are blueprints for objects.',
      },

      {
        title: 'Inheritance',
        content:
          'Inheritance allows code reusability.',
      },

      {
        title: 'Polymorphism',
        content:
          'Polymorphism allows multiple forms.',
      },

      {
        title: 'Constructors',
        content:
          'Constructors initialize objects.',
      },
    ],

    Java: [
      {
        title: 'JVM',
        content:
          'Java code runs on Java Virtual Machine.',
      },

      {
        title: 'Platform Independent',
        content:
          'Java follows Write Once Run Anywhere.',
      },

      {
        title: 'Classes',
        content:
          'Java programs are based on classes.',
      },

      {
        title: 'Inheritance',
        content:
          'Inheritance helps reuse code.',
      },

      {
        title: 'Exception Handling',
        content:
          'Exceptions handle runtime errors.',
      },
    ],

    Python: [
      {
        title: 'Introduction',
        content:
          'Python is easy and beginner friendly.',
      },

      {
        title: 'Lists',
        content:
          'Lists store multiple values.',
      },

      {
        title: 'Functions',
        content:
          'Functions organize reusable code.',
      },

      {
        title: 'Dictionaries',
        content:
          'Dictionaries store key-value pairs.',
      },

      {
        title: 'OOP',
        content:
          'Python also supports OOP concepts.',
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.heading}>
        📚 Notes Section
      </Text>

      <Text style={styles.sub}>
        Choose a language
      </Text>

      {/* LANGUAGE CARDS */}
      <View style={styles.langContainer}>
        {languages.map((lang, i) => (

          <TouchableOpacity
            key={i}
            style={[
              styles.langCard,

              selectedLang === lang &&
                styles.selectedCard,
            ]}
            onPress={() =>
              setSelectedLang(lang)
            }
          >
            <Text style={styles.langText}>
              {lang === 'Cpp'
                ? 'C++'
                : lang}
            </Text>
          </TouchableOpacity>

        ))}
      </View>

      {/* PREDEFINED NOTES */}
      {selectedLang !== '' && (

        <View>

          <Text style={styles.sectionTitle}>
            📘 Predefined Notes
          </Text>

          {predefinedNotes[selectedLang]?.map(
            (item: any, i: number) => (

              <View
                key={i}
                style={styles.noteCard}
              >

                <Text style={styles.noteTitle}>
                  {item.title}
                </Text>

                <Text style={styles.noteContent}>
                  {item.content}
                </Text>

              </View>

            )
          )}

          {/* PERSONAL NOTES */}
          <Text style={styles.sectionTitle}>
            📝 My Personal Notes
          </Text>

          <TextInput
            placeholder="Write your notes here..."
            multiline
            value={myNote}
            onChangeText={setMyNote}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {

              if (
                myNote.trim() !== ''
              ) {

                setSavedNotes([
                  ...savedNotes,
                  myNote,
                ]);

                setMyNote('');
              }
            }}
          >
            <Text style={styles.saveText}>
              Save Note
            </Text>
          </TouchableOpacity>

          {/* SAVED NOTES */}
          {savedNotes.map(
            (note, i) => (

              <View
                key={i}
                style={styles.savedCard}
              >
                <Text>{note}</Text>
              </View>

            )
          )}

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
    fontSize: 28,
    fontWeight: 'bold',
  },

  sub: {
    color: '#666',
    marginTop: 5,
    marginBottom: 20,
  },

  langContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  langCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  selectedCard: {
    backgroundColor: '#2563eb',
  },

  langText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
  },

  noteCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  noteContent: {
    color: '#555',
    lineHeight: 22,
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    minHeight: 120,
    textAlignVertical: 'top',

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  saveBtn: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },

  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  savedCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
});
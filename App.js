import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import words from './data/words.json';

export default function App() {
  const [index, setIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);

  const current = words[index];

  const nextCard = () => {
    setShowMeaning(false);
    setIndex((index + 1) % words.length);
  };

  const prevCard = () => {
    setShowMeaning(false);
    setIndex((index - 1 + words.length) % words.length);
  };

  const speakWord = () => {
    Speech.speak(current.word);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flashcards App</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => setShowMeaning(!showMeaning)}
      >
        <Text style={styles.cardText}>
          {showMeaning ? current.meaning : current.word}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.audioBtn} onPress={speakWord}>
        <Text style={styles.btnText}>🔊 Pronounce</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={prevCard}>
          <Text style={styles.btnText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={nextCard}>
          <Text style={styles.btnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 30,
  },

  card: {
    width: '92%',
    height: 250,
    backgroundColor: '#1e293b',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 12,
  },

  cardText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#f8fafc',
    textAlign: 'center',
  },

  smallText: {
    fontSize: 16,
    color: '#cbd5e1',
    marginTop: 10,
    textAlign: 'center',
  },

  progressBox: {
    backgroundColor: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 30,
    marginBottom: 20,
  },

  progressText: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 14,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  btn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    minWidth: 110,
    alignItems: 'center',
    elevation: 5,
  },

  secondaryBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    minWidth: 110,
    alignItems: 'center',
    elevation: 5,
  },

  dangerBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    minWidth: 110,
    alignItems: 'center',
    elevation: 5,
  },

  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
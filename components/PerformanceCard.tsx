import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function PerformanceCard({
  answered,
  total,
  correct,
  wrong,
}: {
  answered: number;
  total: number;
  correct: number;
  wrong: number;
}) {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors, isDark);

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (

    <View style={styles.card}>

      <Text style={styles.title}>
        Performance Analytics
      </Text>

      {/* Stats */}

      <View style={styles.statsRow}>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {answered}
          </Text>

          <Text style={styles.statLabel}>
            Attempted
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text
            style={[
              styles.statValue,
              {
                color: '#22C55E',
              },
            ]}
          >
            {correct}
          </Text>

          <Text style={styles.statLabel}>
            Correct
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text
            style={[
              styles.statValue,
              {
                color: '#EF4444',
              },
            ]}
          >
            {wrong}
          </Text>

          <Text style={styles.statLabel}>
            Wrong
          </Text>
        </View>

      </View>

      {/* Accuracy */}

      <View style={styles.progressSection}>

        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            Accuracy
          </Text>

          <Text style={styles.progressPercent}>
            {accuracy}%
          </Text>
        </View>

        <View style={styles.progressTrack}>

          <View
            style={[
              styles.progressFill,
              {
                width: `${accuracy}%`,
              },
            ]}
          />

        </View>

      </View>

      {/* Completion */}

      <View style={styles.progressSection}>

        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            Completion
          </Text>

          <Text style={styles.progressPercent}>
            {total > 0 ? Math.round((answered / total) * 100) : 0}%
          </Text>
        </View>

        <View style={styles.progressTrack}>

          <View
            style={[
              styles.progressFillPurple,
              {
                width: `${total > 0 ? Math.round((answered / total) * 100) : 0}%`,
              },
            ]}
          />

        </View>

      </View>

    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({

  card: {
    flex: 1,

    backgroundColor: colors.surface,

    borderRadius: 28,

    padding: 24,

    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 15,

    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 25,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  statBox: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },

  statLabel: {
    marginTop: 5,
    color: colors.textSecondary,
  },

  progressSection: {
    marginBottom: 20,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  progressTitle: {
    color: colors.text,
    fontWeight: '600',
  },

  progressPercent: {
    color: colors.text,
    fontWeight: '700',
  },

  progressTrack: {
    height: 12,

    backgroundColor: colors.inputBg,

    borderRadius: 20,

    overflow: 'hidden',
  },

  progressFill: {
    height: 12,

    backgroundColor: '#22C55E',

    borderRadius: 20,
  },

  progressFillPurple: {
    height: 12,

    backgroundColor: '#8B5CF6',

    borderRadius: 20,
  },

});
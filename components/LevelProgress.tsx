import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function LevelProgress({
  level,
}: {
  level: string;
}) {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors, isDark);

  const currentLevel =
    parseInt(
      String(level).replace(
        /[^0-9]/g,
        ''
      )
    ) || 1;

  const nextLevel =
    currentLevel + 1; 
  return (
    <View style={styles.card}>

      <Text style={styles.title}>
        Learning Journey
      </Text>

      {/* Level 1 */}

      <View style={styles.levelRow}>

        <View style={styles.leftSection}>
          <View style={styles.completedDot} />

          <View style={styles.line} />
        </View>

        <View style={styles.rightSection}>

          <Text style={styles.levelTitle}>
            Level {currentLevel}
          </Text>

          <Text style={styles.levelDesc}>
            Successfully completed
          </Text>

        </View>

        <View style={styles.completedBadge}>
          <Text style={styles.badgeText}>
            Completed
          </Text>
        </View>

      </View>

      {/* Level 2 */}

      <View style={styles.levelRow}>

        <View style={styles.leftSection}>
          <View style={styles.unlockedDot} />
        </View>

        <View style={styles.rightSection}>

          <Text style={styles.levelTitle}>
            Level {nextLevel}
          </Text>

          <Text style={styles.levelDesc}>
            Ready to unlock
          </Text>

        </View>

        <View style={styles.unlockedBadge}>
          <Text style={styles.badgeTextPurple}>
            Unlocked
          </Text>
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

  levelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
  },

  leftSection: {
    width: 30,
    alignItems: 'center',
  },

  completedDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22C55E',
  },

  unlockedDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8B5CF6',
  },

  line: {
    width: 3,
    height: 55,
    backgroundColor: '#22C55E',
    marginTop: 5,
    borderRadius: 10,
  },

  rightSection: {
    flex: 1,
    marginLeft: 12,
  },

  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  levelDesc: {
    marginTop: 4,
    color: colors.textSecondary,
  },

  completedBadge: {
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 20,
  },

  unlockedBadge: {
    backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF',

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 20,
  },

  badgeText: {
    color: isDark ? '#4ade80' : '#16A34A',
    fontWeight: '600',
    fontSize: 12,
  },

  badgeTextPurple: {
    color: isDark ? '#818cf8' : '#6366F1',
    fontWeight: '600',
    fontSize: 12,
  },

});
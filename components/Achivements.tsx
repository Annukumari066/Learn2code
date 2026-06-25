import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Achievements({
  score,
  answered,
}: {
  score: number;
  answered: number;
}) {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors, isDark);

  const achievements = [];

  if (answered >= 1) {
    achievements.push({
      icon: '🏆',
      title: 'First Step',
      desc: 'Completed First Quiz',
      bg: isDark ? 'rgba(251, 191, 36, 0.15)' : '#FEF3C7',
    });
  }

  if (answered >= 10) {
    achievements.push({
      icon: '🔥',
      title: 'Streak Master',
      desc: 'Answered 10+ Questions',
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
    });
  }

  if (score >= 80) {
    achievements.push({
      icon: '⭐',
      title: 'Score Booster',
      desc: 'Scored 80%+',
      bg: isDark ? 'rgba(139, 92, 246, 0.15)' : '#EDE9FE',
    });
  }

  if (score >= 90) {
    achievements.push({
      icon: '🚀',
      title: 'Top Performer',
      desc: 'Scored 90%+',
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE',
    });
  }


  return (
    <View style={styles.card}>

      <Text style={styles.heading}>
        Achievements
      </Text>

      <View style={styles.grid}>

        {achievements.map(
          (item, index) => (

            <View
              key={index}
              style={[
                styles.achievementCard,
                {
                  backgroundColor:
                    item.bg,
                },
              ]}
            >

              <Text style={styles.icon}>
                {item.icon}
              </Text>

              <Text style={styles.title}>
                {item.title}
              </Text>

              <Text style={styles.desc}>
                {item.desc}
              </Text>

            </View>

          )
        )}

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

  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  achievementCard: {
    width: '48%',

    borderRadius: 20,

    padding: 15,

    marginBottom: 15,
  },

  icon: {
    fontSize: 34,
    marginBottom: 10,
  },

  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },

  desc: {
    marginTop: 5,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

});
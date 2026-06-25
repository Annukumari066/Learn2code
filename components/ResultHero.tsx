import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function ResultHero({
  level,
  style,
}: {
  level: string;
  style?: ViewStyle;
})  {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <LinearGradient
      colors={isDark ? ['#581c87', '#1e293b'] : ['#c6a6e4', '#f9f8fa']}
      start={{ x: 1, y: 0 }}
      end={{ x: 1, y: 2 }}
      style={[styles.card, style]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          ✨ Level Complete
        </Text>
      </View>

      <Text style={styles.trophy}>
        🏆
      </Text>

      <Text style={styles.title}>
        Congratulations!
      </Text>

      <Text style={styles.subtitle}>
        You completed {level}
      </Text>

      <Text style={styles.desc}>
        Great work! Keep learning,
        earn achievements and unlock
        the next challenge.
      </Text>
    </LinearGradient>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({

  card: {
    flex: 1,
    borderRadius: 28,
    padding: 30,
    minHeight: 280,
    justifyContent: 'center',
  },

  badge: {
    alignSelf: 'flex-start',

    backgroundColor:
      isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(243, 229, 229, 0.18)',

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 20,

    marginBottom: 20,
  },

  badgeText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },

  trophy: {
    fontSize: 70,
    marginBottom: 15,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
  },

  subtitle: {
    fontSize: 20,
    marginTop: 10,
    color: isDark ? '#4ade80' : '#52b552',
    fontWeight: '600',
  },

  desc: {
    marginTop: 15,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },

});
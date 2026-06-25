import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function ScoreCard({
  score,
  answered,
  correct,
  wrong,
  userAnswers,
  questionsData,
  style,
}: {
  score: number;
  answered: number;
  correct: number;
  wrong: number;
  userAnswers: string;
  questionsData: string;
  style?: ViewStyle;
})

{
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors, isDark);
  const progress = score / 100;

  return (

    <View
      style={[
        styles.card,
        style,
      ]}
    >

      <Text style={styles.heading}>
        Final Score
      </Text>

      <Progress.Circle
        size={170}
        progress={progress}
        thickness={14}
        color="#22C55E"
        unfilledColor={isDark ? colors.inputBg : '#E2E8F0'}
        borderWidth={0}
        showsText
        formatText={() =>
          `${score}%`
        }
        textStyle={{
          fontSize: 32,
          fontWeight: '700',
          color: colors.text,
        }}
      />
      <View style={styles.statsRow}>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {answered}
          </Text>

          <Text style={styles.statLabel}>
            Attempted
          </Text>
        </View>

        <TouchableOpacity
          style={styles.statItem}
          onPress={() =>
            router.push({
              pathname: '/review',
              params: {
                type: 'correct',
                userAnswers,
                questionsData,
              },
            })
          }
        >
          <Text
            style={[
              styles.statNumber,
              { color: '#22C55E' },
            ]}
          >
            {correct}
          </Text>

          <Text style={styles.statLabel}>
            Correct
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statItem}
          onPress={() =>
            router.push({
              pathname: '/review',
              params: {
                type: 'wrong',
                userAnswers,
                questionsData,
              },
            })
          }
        >
          <Text
            style={[
              styles.statNumber,
              { color: '#EF4444' },
            ]}
          >
            {wrong}
          </Text>

          <Text style={styles.statLabel}>
            Wrong
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({

  card: {
    width: 340,

    backgroundColor: colors.surface,

    borderRadius: 28,

    padding: 25,

    alignItems: 'center',

    shadowColor: colors.accent,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,

    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 25,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    width: '100%',

    marginTop: 30,
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },

  statLabel: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 13,
  },
  score: {
    fontSize: 52,
    fontWeight: '700',
    color: '#22C55E',
  },
});
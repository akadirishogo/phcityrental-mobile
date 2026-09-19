import { colors } from '@/theme';
import { StyleSheet, Text } from 'react-native';

export function Wordmark() {
  return (
    <Text style={styles.wordmark} accessibilityRole="header">
      <Text style={styles.accent}>PH</Text>
      <Text style={styles.rest}>CityRentals</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  accent: {
    color: colors.orange,
    fontWeight: '800',
  },
  rest: {
    color: '#fff',
    fontWeight: '600',
  },
});


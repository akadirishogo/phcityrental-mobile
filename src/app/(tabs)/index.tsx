import { colors, spacing, type } from '@/theme';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Link href={{ pathname: '/property/[id]', params: { id: '1' } }}
  style={styles.link}>
        Open property 1 (test the details route)
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  title: { ...type.title, color: colors.text, marginBottom: spacing.lg },
  link: { ...type.body, color: colors.orange },
});

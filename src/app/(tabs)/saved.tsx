import { PropertyCard } from '@/components/PropertyCard';
import { MOCK_PROPERTIES } from '@/core/mock/properties';
import { useSavedProperties } from '@/features/saved/SavedPropertiesProvider';
import { colors, spacing, type } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function SavedScreen() {
  const { saved, toggleSave, isSaved, isLoaded } = useSavedProperties();

  const savedProperties = MOCK_PROPERTIES.filter((property) => saved.includes(property.id));

  if (!isLoaded) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateBody}>Loading your saved properties…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={savedProperties}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <PropertyCard property={item} isSaved={isSaved(item.id)} onToggleSave={toggleSave} />
      )}
      ListHeaderComponent={
        savedProperties.length > 0 ? (
          <Text style={styles.count}>
            {savedProperties.length} saved {savedProperties.length === 1 ? 'property' : 'properties'}
          </Text>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.state}>
          <Ionicons name="heart-outline" size={48} color={colors.border} />
          <Text style={styles.stateTitle}>Nothing saved yet</Text>
          <Text style={styles.stateBody}>
            Tap the save button on any property and it will appear here.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: spacing.lg, paddingBottom: spacing.xxl, backgroundColor: colors.bg, flexGrow: 1 },
  count: { ...type.small, color: colors.textMuted, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.sm },
  stateTitle: { ...type.heading, color: colors.text, textAlign: 'center' },
  stateBody: { ...type.small, color: colors.textMuted, textAlign: 'center' },
});

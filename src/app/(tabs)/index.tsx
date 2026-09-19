import { PropertyCard } from '@/components/PropertyCard';
import { useSavedProperties } from '@/features/saved/SavedPropertiesProvider';
import { useProperties } from '@/features/search/useProperties';
import { colors, radius, spacing, type } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';



export default function HomeScreen() {
  const router = useRouter();
  const { toggleSave, isSaved } = useSavedProperties();
  const { data = [], isLoading, refetch, isRefetching } = useProperties({});
  const [query, setQuery] = useState('');

  const submitSearch = () => {
    const trimmed = query.trim();
    router.push({
      pathname: '/search',
      params: trimmed ? { location: trimmed } : {},
    });
  };


  const featured = data.filter((p) => p.isVerified).slice(0, 4);

  return (
    <View style={styles.screen}>
        <View style={styles.hero}>
          <View style={styles.searchPill}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submitSearch}
            placeholder="Search by location…"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Search properties by location"
            returnKeyType="search"
          />
          <Pressable onPress={submitSearch} hitSlop={8} accessibilityLabel="Search">
            <Ionicons name="arrow-forward-circle" size={26} color={colors.orange} />
          </Pressable>
        </View>

      </View>
        <FlatList
          data={featured}
          refreshing={isRefetching}
          onRefresh={refetch}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isSaved={isSaved(item.id)}
              onToggleSave={toggleSave}
            />
          )}
          ListHeaderComponent={
            <View>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Featured</Text>
                  <Text style={styles.sectionSubtitle}>Verified picks across Port Harcourt</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View all properties"
                  onPress={() => router.push('/search')}
                >
                  <Text style={styles.viewAll}>View all</Text>
                </Pressable>
              </View>

              {isLoading && <Text style={styles.loading}>Loading properties…</Text>}
            </View>
          }
        />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xxl, backgroundColor: colors.bg },
  hero: {
    backgroundColor: colors.slate,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  greeting: { ...type.small, color: '#cbd5e1', marginBottom: spacing.xs },
  heroTitle: { ...type.title, color: '#fff', marginBottom: spacing.lg },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#fff',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  searchInput: { ...type.body, color: colors.textMuted, flex: 1 },
  categories: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  category: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    minHeight: 44,
  },
  categoryLabel: { ...type.tiny, color: colors.slate },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.lg
  },
  screen: { flex: 1, backgroundColor: colors.bg },
  sectionTitle: { ...type.heading, color: colors.text },
  sectionSubtitle: { ...type.small, color: colors.textMuted },
  viewAll: { ...type.small, color: colors.orange, fontWeight: '600' },
  loading: { ...type.small, color: colors.textMuted, paddingHorizontal: spacing.lg },
});

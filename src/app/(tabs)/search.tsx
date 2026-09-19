import { PropertyCard } from '@/components/PropertyCard';
import { PropertyMapView } from '@/components/PropertyMapView';
import type { PropertyType, SearchFilters } from '@/core/types';
import { useSavedProperties } from '@/features/saved/SavedPropertiesProvider';
import { useProperties } from '@/features/search/useProperties';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { colors, radius, spacing, type } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';


const TYPES: { label: string; value?: PropertyType }[] = [
  { label: 'All' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Studio', value: 'studio' },
];

const BEDROOMS = [
  { label: 'Any' },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
];

const PRICES = [
  { label: 'Any' },
  { label: 'Under ₦300k', max: 300_000 },
  { label: '₦300k–600k', min: 300_000, max: 600_000 },
  { label: '₦600k+', min: 600_000 },
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ location?: string; propertyType?: PropertyType }>();
  const { toggleSave, isSaved } = useSavedProperties();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [location, setLocation] = useState(params.location ?? '');
  const [propertyType, setPropertyType] = useState<PropertyType | undefined>(params.propertyType);
  const [bedrooms, setBedrooms] = useState<number | undefined>();
  const [priceIndex, setPriceIndex] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const debouncedLocation = useDebouncedValue(location, 350);

  const filters: SearchFilters = {
    location: debouncedLocation,
    propertyType,
    bedrooms,
    minPrice: PRICES[priceIndex].min,
    maxPrice: PRICES[priceIndex].max,
    isVerifiedOnly: verifiedOnly,
  };

  useEffect(() => {
    if (params.location !== undefined) setLocation(params.location);
  }, [params.location]);

  const { data = [], isLoading, error, refetch, isFetching, isRefetching } = useProperties(filters);
  const filterPanel = 
  <View style={styles.header}>
  <View style={styles.searchBar}>
    <Ionicons name="search" size={18} color={colors.textMuted} />
    <TextInput
      style={styles.input}
      value={location}
      onChangeText={setLocation}
      placeholder="Search by location…"
      placeholderTextColor={colors.textMuted}
      accessibilityLabel="Search properties by location"
      returnKeyType="search"
    />
    {location.length > 0 && (
      <Pressable onPress={() => setLocation('')} hitSlop={8} accessibilityLabel="Clear location">
        <Ionicons name="close-circle" size={18} color={colors.textMuted} />
      </Pressable>
    )}
  </View>

  <ChipRow label="Property type">
    {TYPES.map((t) => (
      <Chip
        key={t.label}
        label={t.label}
        active={propertyType === t.value}
        onPress={() => setPropertyType(t.value)}
      />
    ))}
  </ChipRow>

  <ChipRow label="Bedrooms">
    {BEDROOMS.map((b) => (
      <Chip
        key={b.label}
        label={b.label}
        active={bedrooms === b.value}
        onPress={() => setBedrooms(b.value)}
      />
    ))}
  </ChipRow>

  <ChipRow label="Price">
    {PRICES.map((p, index) => (
      <Chip
        key={p.label}
        label={p.label}
        active={priceIndex === index}
        onPress={() => setPriceIndex(index)}
      />
    ))}
  </ChipRow>

  <Pressable
    style={[styles.verified, verifiedOnly && styles.verifiedActive]}
    onPress={() => setVerifiedOnly((v) => !v)}
    accessibilityRole="switch"
    accessibilityState={{ checked: verifiedOnly }}
    accessibilityLabel="Show verified properties only"
  >
    <Ionicons
      name={verifiedOnly ? 'checkmark-circle' : 'ellipse-outline'}
      size={18}
      color={verifiedOnly ? '#fff' : colors.slate}
    />
    <Text style={[styles.verifiedText, verifiedOnly && styles.verifiedTextActive]}>
      Verified only
    </Text>
  </Pressable>

  <View style={styles.resultBar}>
    <Text style={styles.count}>
      {isLoading ? 'Searching…' : `${data.length} ${data.length === 1 ? 'property' : 'properties'}`}
    </Text>

    <View style={styles.toggle}>
      <Pressable
        style={[styles.toggleButton, viewMode === 'list' && styles.toggleActive]}
        onPress={() => setViewMode('list')}
        accessibilityRole="button"
        accessibilityState={{ selected: viewMode === 'list' }}
        accessibilityLabel="Show results as a list"
      >
        <Ionicons name="list" size={16} color={viewMode === 'list' ? '#fff' : colors.slate} />
      </Pressable>
      <Pressable
        style={[styles.toggleButton, viewMode === 'map' && styles.toggleActive]}
        onPress={() => setViewMode('map')}
        accessibilityRole="button"
        accessibilityState={{ selected: viewMode === 'map' }}
        accessibilityLabel="Show results on a map"
      >
        <Ionicons name="map" size={16} color={viewMode === 'map' ? '#fff' : colors.slate} />
      </Pressable>
    </View>
  </View>

</View>

if (viewMode === 'map') {
  return (
    <View style={styles.screen}>
      <ScrollView style={styles.filterScroll}>{filterPanel}</ScrollView>
      <PropertyMapView properties={data} />
    </View>
  );
}



  return (
    <FlatList
      data={data}
      refreshing={isRefetching}
      onRefresh={refetch}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <PropertyCard property={item} isSaved={isSaved(item.id)} onToggleSave={toggleSave} />
      )}
      ListHeaderComponent={
        filterPanel
      }
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator style={styles.state} color={colors.slate} />
        ) : error ? (
          <View style={styles.state}>
            <Text style={styles.stateTitle}>We couldn’t load these results</Text>
            <Text style={styles.stateBody}>Something went wrong reaching the property service.</Text>
            <Pressable style={styles.retry} onPress={() => refetch()} disabled={isFetching}>
              <Text style={styles.retryText}>{isFetching ? 'Retrying…' : 'Try again'}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.state}>
            <Text style={styles.stateTitle}>No properties found</Text>
            <Text style={styles.stateBody}>Try widening your filters or clearing the location.</Text>
          </View>
        )
      }
    />
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.chipRow}>
      <Text style={styles.chipLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {children}
      </ScrollView>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xxl, backgroundColor: colors.bg },
  header: { paddingTop: spacing.lg, gap: spacing.md, marginBottom: spacing.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, ...type.body, color: colors.text },
  chipRow: { gap: spacing.sm },
  chipLabel: { ...type.tiny, color: colors.textMuted, paddingHorizontal: spacing.lg, textTransform: 'uppercase' },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  chip: {
    paddingHorizontal: spacing.lg,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.slate },
  chipText: { ...type.small, color: colors.slate },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  verifiedActive: { backgroundColor: colors.green },
  verifiedText: { ...type.small, color: colors.slate },
  verifiedTextActive: { color: '#fff', fontWeight: '600' },
  count: { ...type.small, color: colors.textMuted, paddingHorizontal: spacing.lg, marginTop: spacing.xs },
  state: { padding: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  stateTitle: { ...type.heading, color: colors.text, textAlign: 'center' },
  stateBody: { ...type.small, color: colors.textMuted, textAlign: 'center' },
  retry: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.slate,
  },
  screen: { flex: 1, backgroundColor: colors.bg },
  filterScroll: { flexGrow: 0, maxHeight: 260 },
  resultBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  toggle: { flexDirection: 'row', gap: spacing.xs, backgroundColor: colors.surface, borderRadius: radius.pill, padding: 3 },
  toggleButton: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  toggleActive: { backgroundColor: colors.slate },
  retryText: { ...type.small, color: '#fff', fontWeight: '600' },
});

import type { Property } from '@/core/types';
import { colors, radius, spacing, type } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Located = Property & { coordinates: NonNullable<Property['coordinates']> };

function hasCoordinates(property: Property): property is Located {
  return property.coordinates !== undefined;
}

interface PropertyMapViewProps {
  properties: Property[];
}

export function PropertyMapView({ properties }: PropertyMapViewProps) {
  const router = useRouter();
  const located = properties.filter(hasCoordinates);

  if (located.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="map-outline" size={40} color={colors.border} />
        <Text style={styles.emptyText}>No mapped properties match these filters.</Text>
      </View>
    );
  }

  const lats = located.map((p) => p.coordinates.lat);
  const lngs = located.map((p) => p.coordinates.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Guard against a zero-width range when every pin shares a coordinate.
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const position = (property: Located) => ({
    left: `${8 + ((property.coordinates.lng - minLng) / lngRange) * 76}%`,
    top: `${8 + ((maxLat - property.coordinates.lat) / latRange) * 76}%`,
  });

  return (
    <View style={styles.map}>
      <View style={styles.caption}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
        <Text style={styles.captionText}>
          Schematic view — {located.length} of {properties.length} plotted by coordinates
        </Text>
      </View>

      {located.map((property) => (
        <Pressable
          key={property.id}
          style={[styles.pin, position(property) as never]}
          accessibilityRole="button"
          accessibilityLabel={`${property.title}, ₦${property.price.toLocaleString()}. Open details.`}
          onPress={() => router.push({ pathname: '/property/[id]', params: { id: property.id } })}
        >
          <Text style={styles.pinText}>₦{Math.round(property.price / 1000)}k</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: '#e8edf2',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  caption: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    zIndex: 1,
  },
  captionText: { ...type.tiny, color: colors.textMuted },
  pin: {
    position: 'absolute',
    backgroundColor: colors.slate,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    minHeight: 32,
    justifyContent: 'center',
  },
  pinText: { ...type.tiny, color: '#fff', fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xxl },
  emptyText: { ...type.small, color: colors.textMuted, textAlign: 'center' },
});

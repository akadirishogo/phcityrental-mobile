import type { Property } from '@/core/types';
import { colors, radius, spacing, type } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PropertyImage } from './PropertyImage';

interface PropertyCardProps {
  property: Property;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

function PropertyCardComponent({ property, isSaved, onToggleSave }: PropertyCardProps) {
  const router = useRouter();


  return (
    <Pressable
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${property.title}, ${property.location}, ₦${property.price.toLocaleString()}`}
      onPress={() => router.push({ pathname: '/property/[id]', params: { id: property.id } })}
    >
        <PropertyImage uri={property.images[0]} style={styles.image} />

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{property.title}</Text>

        <View style={styles.badges}>
          {property.isVerified && (
            <View style={[styles.badge, styles.badgeVerified]}>
              <Text style={styles.badgeText}>Verified</Text>
            </View>
          )}
          <View style={[styles.badge, styles.badgeInclusive]}>
            <Text style={styles.badgeText}>All-Inclusive</Text>
          </View>
        </View>

        <Text style={styles.location} numberOfLines={1}>{property.location}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₦{property.price.toLocaleString()}</Text>
          <Text style={styles.meta}>
            {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`} · {property.bathrooms} bath
          </Text>
        </View>

        <Text style={styles.allInclusive}>
          ₦{property.allInclusivePrice.toLocaleString()} all-inclusive
        </Text>

        <Pressable
          style={[styles.saveButton, isSaved && styles.saveButtonActive]}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? `Remove ${property.title} from saved` : `Save ${property.title}`}
          onPress={() => onToggleSave(property.id)}
          hitSlop={8}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={16}
            color={isSaved ? '#fff' : colors.slate}
          />
          <Text style={[styles.saveText, isSaved && styles.saveTextActive]}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export const PropertyCard = memo(PropertyCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: { width: '100%', height: 180, backgroundColor: colors.surface },
  imageFallback: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  fallbackText: { ...type.tiny, color: colors.textMuted },
  body: { padding: spacing.lg, gap: spacing.sm },
  title: { ...type.heading, color: colors.text },
  badges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  badgeVerified: { backgroundColor: colors.green },
  badgeInclusive: { backgroundColor: colors.purple },
  badgeText: { ...type.tiny, color: '#fff' },
  location: { ...type.small, color: colors.textMuted },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { ...type.heading, color: colors.text },
  meta: { ...type.small, color: colors.textMuted },
  allInclusive: { ...type.tiny, color: colors.textMuted },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  saveButtonActive: { backgroundColor: colors.green, borderColor: colors.green },
  saveText: { ...type.small, color: colors.slate, fontWeight: '600' },
  saveTextActive: { color: '#fff' },
});

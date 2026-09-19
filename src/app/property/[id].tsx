import { PropertyImage } from '@/components/PropertyImage';
import { formatNaira, getBreakdownTotal, getPriceBreakdown } from '@/core/domains/pricing';
import { useProperty } from '@/features/property/useProperty';
import { useSavedProperties } from '@/features/saved/SavedPropertiesProvider';
import { colors, radius, spacing, type } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: property, isLoading, error, refetch, isFetching } = useProperty(id ?? '');
  const { toggleSave, isSaved } = useSavedProperties();
  const [imageIndex, setImageIndex] = useState(0);

  if (isLoading) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator color={colors.slate} />
        <Text style={styles.stateBody}>Loading property…</Text>
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.centre}>
        <Text style={styles.stateTitle}>We couldn’t load this property</Text>
        <Text style={styles.stateBody}>
          {error ? 'Something went wrong fetching the details.' : 'This property may no longer be listed.'}
        </Text>
        {error && (
          <Pressable style={styles.primaryButton} onPress={() => refetch()} disabled={isFetching}>
            <Text style={styles.primaryButtonText}>{isFetching ? 'Retrying…' : 'Try again'}</Text>
          </Pressable>
        )}
      </View>
    );
  }

  const saved = isSaved(property.id);
  const breakdown = getPriceBreakdown(property);

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View>
          {property.images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))
              }
            >
              {property.images.map((uri) => (
                <PropertyImage key={uri} uri={uri} style={styles.hero} />
              ))}
            </ScrollView>
          ) : (
            <PropertyImage style={styles.hero} iconSize={40} />
          )}

          {property.images.length > 1 && (
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {imageIndex + 1}/{property.images.length}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.location}>{property.location}</Text>

          <View style={styles.badges}>
            <View style={[styles.badge, property.isVerified ? styles.badgeVerified : styles.badgeUnverified]}>
              <Text style={styles.badgeText}>
                {property.isVerified ? 'Verified listing' : 'Not yet verified'}
              </Text>
            </View>
            <View style={[styles.badge, styles.badgeInclusive]}>
              <Text style={styles.badgeText}>All-Inclusive</Text>
            </View>
          </View>
        </View>

        <View style={styles.specs}>
          <Spec icon="bed-outline" label={property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Beds`} />
          <Spec icon="water-outline" label={`${property.bathrooms} Baths`} />
          <Spec icon="home-outline" label={property.propertyType} />
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>All-inclusive price breakdown</Text>
          {breakdown.map((line) => (
            <View key={line.label} style={styles.priceLine}>
              <Text style={styles.priceLabel}>{line.label}</Text>
              <Text style={styles.priceValue}>{formatNaira(line.amount)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.priceLine}>
            <Text style={styles.totalLabel}>Total per year</Text>
            <Text style={styles.totalValue}>{formatNaira(getBreakdownTotal(property))}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Description</Text>
          <Text style={[styles.body, !property.description && styles.muted]}>
            {property.description || 'The agent has not provided a description for this property yet.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Amenities</Text>
          {property.amenities.length > 0 ? (
            <View style={styles.amenities}>
              {property.amenities.map((amenity) => (
                <View key={amenity} style={styles.amenity}>
                  <Ionicons name="checkmark" size={14} color={colors.green} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.body, styles.muted]}>No amenities listed.</Text>
          )}
        </View>

        <View style={styles.agentCard}>
          <Text style={styles.heading}>Listing agent</Text>
          <Text style={styles.agentName}>{property.agentName}</Text>
          <Text style={styles.body}>{property.agentPhone}</Text>
          <Text style={styles.body}>{property.agentEmail}</Text>

          <View style={styles.actions}>
            <Pressable
              style={[styles.primaryButton, styles.flex]}
              accessibilityRole="button"
              accessibilityLabel={`Call ${property.agentName}`}
              onPress={() => Linking.openURL(`tel:${property.agentPhone.replace(/\s/g, '')}`)}
            >
              <Ionicons name="call-outline" size={16} color="#fff" />
              <Text style={styles.primaryButtonText}>Call</Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, styles.flex]}
              accessibilityRole="button"
              accessibilityLabel={`Email ${property.agentName}`}
              onPress={() =>
                Linking.openURL(
                  `mailto:${property.agentEmail}?subject=${encodeURIComponent(`Enquiry: ${property.title}`)}`
                )
              }
            >
              <Ionicons name="mail-outline" size={16} color={colors.slate} />
              <Text style={styles.secondaryButtonText}>Email</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.saveButton, saved && styles.saveButtonActive]}
            accessibilityRole="button"
            accessibilityLabel={saved ? `Remove ${property.title} from saved` : `Save ${property.title}`}
            onPress={() => toggleSave(property.id)}
          >
            <Ionicons name={saved ? 'heart' : 'heart-outline'} size={16} color={saved ? '#fff' : colors.slate} />
            <Text style={[styles.secondaryButtonText, saved && styles.saveTextActive]}>
              {saved ? 'Saved' : 'Save property'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

function Spec({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.spec}>
      <Ionicons name={icon} size={18} color={colors.slate} />
      <Text style={styles.specText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.sm, backgroundColor: colors.bg },
  hero: { width, height: 260, backgroundColor: colors.surface },
  heroFallback: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  counter: {
    position: 'absolute', right: spacing.lg, bottom: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: spacing.md,
    paddingVertical: 4, borderRadius: radius.pill,
  },
  counterText: { ...type.tiny, color: '#fff' },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm },
  title: { ...type.title, color: colors.text },
  location: { ...type.body, color: colors.textMuted },
  badges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginTop: spacing.xs },
  badge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  badgeVerified: { backgroundColor: colors.green },
  badgeUnverified: { backgroundColor: colors.textMuted },
  badgeInclusive: { backgroundColor: colors.purple },
  badgeText: { ...type.tiny, color: '#fff' },
  specs: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    paddingVertical: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surface,
  },
  spec: { alignItems: 'center', gap: spacing.xs },
  specText: { ...type.small, color: colors.slate, textTransform: 'capitalize' },
  heading: { ...type.heading, color: colors.text, marginBottom: spacing.xs },
  priceLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  priceLabel: { ...type.body, color: colors.textMuted },
  priceValue: { ...type.body, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  totalLabel: { ...type.body, color: colors.text, fontWeight: '700' },
  totalValue: { ...type.heading, color: colors.text },
  body: { ...type.body, color: colors.text },
  muted: { color: colors.textMuted },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amenity: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.pill, backgroundColor: colors.surface,
  },
  amenityText: { ...type.small, color: colors.slate },
  agentCard: {
    margin: spacing.lg, padding: spacing.lg, gap: spacing.xs,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
  },
  agentName: { ...type.body, color: colors.text, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  flex: { flex: 1 },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    minHeight: 48, borderRadius: radius.md, backgroundColor: colors.slate, paddingHorizontal: spacing.lg,
  },
  primaryButtonText: { ...type.small, color: '#fff', fontWeight: '700' },
  secondaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  secondaryButtonText: { ...type.small, color: colors.slate, fontWeight: '600' },
  saveButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md,
  },
  saveButtonActive: { backgroundColor: colors.green, borderColor: colors.green },
  saveTextActive: { color: '#fff' },
  stateTitle: { ...type.heading, color: colors.text, textAlign: 'center' },
  stateBody: { ...type.small, color: colors.textMuted, textAlign: 'center' },

});

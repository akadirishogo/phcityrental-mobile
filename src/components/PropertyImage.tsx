import { colors, spacing, type } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

interface PropertyImageProps {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  iconSize?: number;
  showLabel?: boolean;
}

export function PropertyImage({ uri, style, iconSize = 28, showLabel = true }: PropertyImageProps) {
  // Tracked by URL, not a boolean, so a different image is retried rather than
  // inheriting the previous one's failure.
  const [failedUri, setFailedUri] = useState<string | null>(null);

  if (!uri || failedUri === uri) {
    return (
      <View style={[styles.fallback, style as StyleProp<ViewStyle>]}>
        <Ionicons name="image-outline" size={iconSize} color={colors.textMuted} />
        {showLabel && <Text style={styles.text}>No photo available</Text>}
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      transition={200}
      onError={() => setFailedUri(uri)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  text: { ...type.tiny, color: colors.textMuted },
});

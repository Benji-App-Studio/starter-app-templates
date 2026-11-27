import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type Segment<T extends string> = { id: T; label: string };

type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'md' | 'sm';
};

/** Two to four options with a thumb that springs between them. */
export function SegmentedControl<T extends string>({ segments, value, onChange, size = 'md' }: SegmentedControlProps<T>) {
  const { colors, radii, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, segments.findIndex((segment) => segment.id === value));
  const offset = useSharedValue(index);
  const inset = spacing.xs;

  useEffect(() => {
    offset.value = reducedMotion ? index : withSpring(index, { damping: 20, stiffness: 220 });
  }, [index, offset, reducedMotion]);

  const segmentWidth = width / segments.length;
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value * segmentWidth }],
  }));
  const height = size === 'md' ? 40 : 32;

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width - inset * 2)}
      style={[
        styles.track,
        { height: height + inset * 2, padding: inset, borderRadius: radii.md, backgroundColor: colors.surfaceRaised },
      ]}
    >
      {width > 0 ? (
        <Animated.View
          style={[
            styles.thumb,
            { top: inset, left: inset, width: segmentWidth, height, borderRadius: radii.sm, backgroundColor: colors.primary },
            thumbStyle,
          ]}
        />
      ) : null}
      {segments.map((segment) => {
        const selected = segment.id === value;
        return (
          <Pressable
            key={segment.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) {
                void Haptics.selectionAsync();
                onChange(segment.id);
              }
            }}
            style={[styles.segment, { height, paddingHorizontal: spacing.sm }]}
          >
            <Text variant={size === 'md' ? 'label' : 'caption'} color={selected ? 'onPrimary' : 'muted'} numberOfLines={1}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row' },
  thumb: { position: 'absolute' },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

import { View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { mixColors, useTheme } from '@/theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const STOPS = [0, 0.25, 0.5, 0.75, 1];

type MoodFaceProps = {
  /** 0 = awful … 1 = great. A shared value animates; a number draws a fixed face. */
  progress: SharedValue<number> | number;
  size?: number;
};

/**
 * The app's own face: a disc in the mood color whose mouth and eyes morph
 * between a frown and a squinting smile as the progress moves.
 */
export function MoodFace({ progress, size = 96 }: MoodFaceProps) {
  const { colors } = useTheme();
  const faceColors = [...colors.mood];
  const inkColors = colors.mood.map((color) => mixColors(color, colors.shade, 0.55));

  const value = useDerivedValue(() => (typeof progress === 'number' ? progress : progress.value));

  const body = useAnimatedProps(() => ({
    fill: interpolateColor(value.value, STOPS, faceColors),
  }));
  const eye = useAnimatedProps(() => ({
    fill: interpolateColor(value.value, STOPS, inkColors),
    // Eyes squint on the happiest faces and droop slightly on the lowest.
    ry: interpolate(value.value, [0, 0.6, 1], [4.2, 5, 2.6]),
  }));
  const mouth = useAnimatedProps(() => {
    const curve = interpolate(value.value, [0, 1], [-22, 22]);
    const lift = interpolate(value.value, [0, 1], [68, 62]);
    return {
      d: `M 33 ${lift} Q 50 ${lift + curve} 67 ${lift}`,
      stroke: interpolateColor(value.value, STOPS, inkColors),
    };
  });

  return (
    <View style={{ width: size, height: size }} accessible={false}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <AnimatedCircle cx={50} cy={50} r={46} animatedProps={body} />
        <AnimatedEllipse cx={35} cy={42} rx={4.6} animatedProps={eye} />
        <AnimatedEllipse cx={65} cy={42} rx={4.6} animatedProps={eye} />
        <AnimatedPath
          fill="none"
          strokeWidth={5.5}
          strokeLinecap="round"
          animatedProps={mouth}
        />
      </Svg>
    </View>
  );
}

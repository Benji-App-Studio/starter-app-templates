import Svg, { Path } from 'react-native-svg';

type CupIconProps = {
  /** Sets the glass height: a small glass is drawn shorter than a bottle. */
  amountMl: number;
  size?: number;
  color: string;
  fill: string;
};

const MIN_ML = 150;
const MAX_ML = 750;

/** A tumbler glyph whose height scales with the cup size, two-thirds full. */
export function CupIcon({ amountMl, size = 40, color, fill }: CupIconProps) {
  const t = Math.min(1, Math.max(0, (amountMl - MIN_ML) / (MAX_ML - MIN_ML)));
  const bodyHeight = size * (0.5 + 0.45 * t);
  const top = size - bodyHeight;
  const left = size * 0.22;
  const right = size * 0.78;
  const baseLeft = size * 0.3;
  const baseRight = size * 0.7;
  const bottom = size - 2;
  const corner = size * 0.08;
  const waterTop = top + bodyHeight * 0.38;
  const waterLeft = left + (baseLeft - left) * 0.38;
  const waterRight = right - (right - baseRight) * 0.38;

  const outline = [
    `M ${left} ${top}`,
    `L ${right} ${top}`,
    `L ${baseRight} ${bottom - corner}`,
    `Q ${baseRight} ${bottom} ${baseRight - corner} ${bottom}`,
    `L ${baseLeft + corner} ${bottom}`,
    `Q ${baseLeft} ${bottom} ${baseLeft} ${bottom - corner}`,
    'Z',
  ].join(' ');

  const water = [
    `M ${waterLeft} ${waterTop}`,
    `L ${waterRight} ${waterTop}`,
    `L ${baseRight} ${bottom - corner}`,
    `Q ${baseRight} ${bottom} ${baseRight - corner} ${bottom}`,
    `L ${baseLeft + corner} ${bottom}`,
    `Q ${baseLeft} ${bottom} ${baseLeft} ${bottom - corner}`,
    'Z',
  ].join(' ');

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={water} fill={fill} />
      <Path d={outline} stroke={color} strokeWidth={2.2} strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

import Svg, { Circle, Path } from 'react-native-svg';

interface TabIconProps {
  color: string;
  size?: number;
}

/** Your goals — seed → arc → bloom (HeroArc growth mark, simplified) */
export function GoalsTabIcon({ color, size = 24 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="5.5" cy="17.5" r="2" fill={color} opacity={0.55} />
      <Path
        d="M5.5 17.5C5.5 17.5 8 17.5 11 13.5C14 9.5 17 7 20 5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="20" cy="5" r="2.5" fill={color} />
    </Svg>
  );
}

/** Companion — two people linked; coaches in your corner, not judges */
export function CompanionTabIcon({ color, size = 24 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8" cy="8" r="3" stroke={color} strokeWidth={2} />
      <Path
        d="M4 20c0-2.8 1.8-4.5 4-4.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="16" cy="8" r="3" stroke={color} strokeWidth={2} />
      <Path
        d="M20 20c0-2.8-1.8-4.5-4-4.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M10.5 12.5c.8.6 2.2.6 3 0"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        opacity={0.65}
      />
    </Svg>
  );
}

/** Profile / Your growth — you at the center, sprout of who you're becoming */
export function GrowthTabIcon({ color, size = 24 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="9" r="3.25" stroke={color} strokeWidth={2} />
      <Path
        d="M6.5 20.5c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 4.5V6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="3.25" r="1.25" fill={color} />
    </Svg>
  );
}

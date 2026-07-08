import { PropsWithChildren, useEffect, useRef } from "react";
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

export function FadeIn({ children, delay = 0 }: PropsWithChildren<{ delay?: number }>) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 240, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 240, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, opacity, translateY]);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export function StaggerItem({ children, index, glow = false }: PropsWithChildren<{ index: number; glow?: boolean }>) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const scale = useRef(new Animated.Value(glow ? 0.94 : 1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 260, delay: Math.min(index, 8) * 45, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 260, delay: Math.min(index, 8) * 45, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, delay: Math.min(index, 8) * 45, speed: 14, bounciness: glow ? 8 : 0, useNativeDriver: true }),
    ]).start();
  }, [glow, index, opacity, scale, translateY]);
  return <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }, { scale }] }}>{children}</Animated.View>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export function ScalePressable({ style, children, ...props }: PressableProps & { style?: StyleProp<ViewStyle> }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (toValue: number) => Animated.spring(scale, { toValue, speed: 35, bounciness: 2, useNativeDriver: true }).start();
  return <AnimatedPressable {...props} onPressIn={(e) => { animate(0.96); props.onPressIn?.(e); }} onPressOut={(e) => { animate(1); props.onPressOut?.(e); }} style={[style, { transform: [{ scale }] }]}>{children}</AnimatedPressable>;
}


import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { router, useFocusEffect } from "expo-router";
import { api } from "@/lib/api";
import { Student, WeeklyStats } from "@/types/api";
import { Colors, Shadows } from "@/constants/Colors";
import { ErrorState, Skeleton } from "@/components/ui";
import { ScalePressable } from "@/components/Motion";
import { haptic } from "@/utils/feedback";
export default function Dashboard() {
  const [student, setStudent] = useState<Student>(),
    [stats, setStats] = useState<WeeklyStats>(),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = useCallback(() => {
    setError("");
    return Promise.all([api.student(), api.stats()])
      .then(([s, t]) => {
        setStudent(s);
        setStats(t);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );
  const p = Math.min(1, (stats?.todayCompleted || 0) / (stats?.dailyGoal || 1)),
    max = Math.max(1, ...(stats?.sessionsPerDay.map((x) => x.count) || [1])),
    today = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
      new Date().getDay()
    ];
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={s.page}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={load}
            tintColor={Colors.primary}
          />
        }
      >
        {loading ? (
          <Skeleton />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setLoading(true);
              load();
            }}
          />
        ) : (
          <>
            <View style={s.greeting}>
              <View style={s.avatar}>
                <Text style={s.initials}>{student?.initials}</Text>
              </View>
              <View>
                <Text style={s.hello}>
                  Hey, {student?.name.split(" ")[0]}! 👋
                </Text>
                <Text style={s.sub}>Ready to make today count?</Text>
              </View>
            </View>
            <View style={s.stats}>
              <Stat
                icon="flash"
                value={stats?.totalCoins || 0}
                label="COINS"
                bg={Colors.primaryLight}
                color={Colors.primary}
              />
              <Stat
                icon="flame"
                value={stats?.streak || 0}
                label="DAY STREAK"
                bg={Colors.amberLight}
                color={Colors.amber}
              />
              <Stat
                icon="checkmark-circle"
                value={stats?.totalSessions || 0}
                label="SESSIONS"
                bg={Colors.successLight}
                color={Colors.success}
              />
            </View>
            <Text style={s.section}>This week</Text>
            <View style={s.chart}>
              {stats?.sessionsPerDay.map((x, index) => (
                <View key={x.day} style={s.column}>
                  <AnimatedBar
                    height={Math.max(7, (x.count / max) * 82)}
                    delay={index * 55}
                    color={x.day === today ? Colors.primary : Colors.primaryLight}
                  />
                  <Text style={[s.day, x.day === today && s.activeDay]}>
                    {x.day[0].toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
            <View style={s.progressCard}>
              <View>
                <Svg width={72} height={72}>
                  <Circle
                    cx={36}
                    cy={36}
                    r={30}
                    fill="none"
                    stroke={Colors.border}
                    strokeWidth={7}
                  />
                  <ProgressCircle progress={p} />
                </Svg>
                <Text style={s.ringText}>
                  {stats?.todayCompleted}/{stats?.dailyGoal}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.goalTitle}>
                  {p >= 1 ? "Daily goal complete!" : "Daily goal"}
                </Text>
                <Text style={s.goalText}>
                  {p >= 1
                    ? "You showed up for yourself today."
                    : `${
                        (stats?.dailyGoal || 0) - (stats?.todayCompleted || 0)
                      } more ${
                        (stats?.dailyGoal || 0) -
                          (stats?.todayCompleted || 0) ===
                        1
                          ? "session"
                          : "sessions"
                      } to reach your goal`}
                </Text>
              </View>
            </View>
            <ScalePressable
              style={s.cta}
              onPress={() => {
                haptic.impact();
                router.push("/timer");
              }}
            >
              <Ionicons name="play" size={19} color="#fff" />
              <Text style={s.ctaText}>Start Focus Session</Text>
            </ScalePressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
function AnimatedBar({ height, delay, color }: { height: number; delay: number; color: string }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(value, { toValue: height, duration: 520, delay, useNativeDriver: false }).start(); }, [delay, height, value]);
  return <Animated.View style={[s.bar, { height: value, backgroundColor: color }]} />;
}
function ProgressCircle({ progress }: { progress: number }) {
  const value = useRef(new Animated.Value(188.5)).current;
  useEffect(() => { Animated.timing(value, { toValue: 188.5 * (1 - progress), duration: 700, useNativeDriver: false }).start(); }, [progress, value]);
  return <AnimatedCircle cx={36} cy={36} r={30} fill="none" stroke={Colors.primary} strokeWidth={7} strokeLinecap="round" strokeDasharray={188.5} strokeDashoffset={value} rotation="-90" origin="36,36" />;
}

function Stat({ icon, value, label, bg, color }: any) {
  return (
    <View style={[s.stat, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={19} color={color} />
      <Text style={s.num}>{value}</Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  page: { padding: 20, paddingBottom: 30 },
  greeting: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.primary,
  },
  hello: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stats: { flexDirection: "row", gap: 10, marginBottom: 24 },
  stat: { flex: 1, borderRadius: 14, padding: 12, minHeight: 112 },
  num: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 26,
    color: Colors.text,
    marginTop: 10,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    marginTop: 4,
  },
  section: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
    marginBottom: 14,
  },
  chart: {
    height: 120,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 4,
    paddingBottom: 28,
    marginBottom: 24,
  },
  column: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "100%",
    maxWidth: 36,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  day: {
    position: "absolute",
    bottom: -21,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.textTertiary,
  },
  activeDay: { color: Colors.primary },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
    ...Shadows.card,
  },
  ringText: {
    position: "absolute",
    width: 72,
    textAlign: "center",
    top: 27,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  goalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
  },
  goalText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  cta: {
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    ...Shadows.cta,
  },
  ctaText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
});





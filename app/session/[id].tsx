import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { api } from "@/lib/api";
import { SessionDetail } from "@/types/api";
import { Colors, Shadows } from "@/constants/Colors";
import { ErrorState, Skeleton } from "@/components/ui";
import { formatDate, minutes, typeName, typeTheme } from "@/utils/format";
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    [data, setData] = useState<SessionDetail>(),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = () =>
    api
      .session(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, [id]);
  const t = data ? typeTheme(data.type) : null;
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.nav}>
        <Pressable onPress={() => router.back()} style={s.back}>
          <Ionicons name="arrow-back" size={21} color={Colors.text} />
        </Pressable>
        <Text style={s.navTitle}>Session details</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.page}>
        {loading ? (
          <Skeleton />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setLoading(true);
              setError("");
              load();
            }}
          />
        ) : (
          data && (
            <>
              <View style={s.hero}>
                <View style={[s.heroIcon, { backgroundColor: t?.bg }]}>
                  <Ionicons name={t?.icon} size={30} color={t?.color} />
                </View>
                <Text style={s.title}>{typeName(data.type)}</Text>
                <Text style={s.date}>{formatDate(data.startedAt)}</Text>
                <View style={s.metrics}>
                  <Metric
                    value={`${minutes(data.durationMs)}`}
                    label="MINUTES"
                  />
                  <View style={s.divider} />
                  <Metric value={`+${data.coins}`} label="COINS" />
                  <View style={s.divider} />
                  <Metric
                    value={data.status === "completed" ? "Done" : "Stopped"}
                    label="STATUS"
                  />
                </View>
              </View>
              <Text style={s.section}>Session timeline</Text>
              <View style={s.timeline}>
                {data.timeline.map((x, i) => (
                  <View style={s.entry} key={i}>
                    <View
                      style={[
                        s.dot,
                        {
                          backgroundColor:
                            x.type === "focus"
                              ? Colors.primary
                              : Colors.success,
                        },
                      ]}
                    />
                    {i < data.timeline.length - 1 && <View style={s.line} />}
                    <View style={{ flex: 1 }}>
                      <Text style={s.entryTitle}>
                        {x.type === "focus" ? "Focused work" : "Rest break"}
                      </Text>
                      <Text style={s.entryTime}>
                        {minutes(x.durationMs)} min ·{" "}
                        {new Date(x.startedAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <Ionicons
                      name={
                        x.type === "focus" ? "radio-outline" : "cafe-outline"
                      }
                      size={19}
                      color={Colors.textTertiary}
                    />
                  </View>
                ))}
              </View>
            </>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const Metric = ({ value, label }: { value: string; label: string }) => (
  <View style={s.metric}>
    <Text style={s.value}>{value}</Text>
    <Text style={s.label}>{label}</Text>
  </View>
);
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  nav: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  page: { padding: 20 },
  hero: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    ...Shadows.card,
  },
  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
    marginTop: 14,
  },
  date: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  metrics: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metric: { flex: 1, alignItems: "center" },
  value: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.text },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 0.6,
    marginTop: 4,
  },
  divider: { width: 1, height: 30, backgroundColor: Colors.border },
  section: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
    marginTop: 26,
    marginBottom: 12,
  },
  timeline: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    ...Shadows.card,
  },
  entry: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    position: "relative",
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, zIndex: 2 },
  line: {
    position: "absolute",
    left: 5,
    top: 16,
    width: 2,
    height: 48,
    backgroundColor: Colors.border,
  },
  entryTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  entryTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 3,
  },
});

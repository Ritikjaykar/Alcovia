import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { Session } from "@/types/api";
import { Colors, Shadows } from "@/constants/Colors";
import { ErrorState, ScreenTitle, Skeleton } from "@/components/ui";
import { formatDate, minutes, typeName, typeTheme } from "@/utils/format";
import { haptic } from "@/utils/feedback";
import { ScalePressable, StaggerItem } from "@/components/Motion";
const filters = [
  ["today", "Today"],
  ["week", "This Week"],
  ["month", "This Month"],
  ["", "All"],
];
export default function History() {
  const [filter, setFilter] = useState("");
  const [data, setData] = useState<Session[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState("");
  const [paging, setPaging] = useState(false);
  const load = useCallback(
    async (reset = true) => {
      try {
        setError("");
        const r = await api.sessions(
          filter || undefined,
          reset ? undefined : cursor || undefined
        );
        setData((v) => (reset ? r.data : [...v, ...r.data]));
        setCursor(r.cursor);
        setMore(r.hasMore);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
        setRefresh(false);
        setPaging(false);
      }
    },
    [filter, cursor]
  );
  useEffect(() => {
    setLoading(true);
    load(true);
  }, [filter]);
  const footer = paging ? (
    <Text style={s.end}>Loading more…</Text>
  ) : !more && data.length > 0 ? (
    <Text style={s.end}>You're all caught up</Text>
  ) : null;
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <ScreenTitle>History</ScreenTitle>
        <View style={s.filters}>
          {filters.map(([v, l]) => (
            <Pressable
              key={l}
              onPress={() => { haptic.selection(); setFilter(v); }}
              style={[s.pill, filter === v && s.active]}
            >
              <Text style={[s.pillText, filter === v && s.activeText]}>
                {l}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {loading ? (
        <View style={s.pad}>
          <Skeleton />
        </View>
      ) : error && !data.length ? (
        <ErrorState
          message={error}
          onRetry={() => {
            setLoading(true);
            load(true);
          }}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(x) => x.id}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={() => {
                setRefresh(true);
                load(true);
              }}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item, index }) => <Card item={item} index={index} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons
                name="sparkles-outline"
                size={32}
                color={Colors.primary}
              />
              <Text style={s.emptyTitle}>Your focus story starts here</Text>
              <Text style={s.emptyText}>
                Complete a session and it will show up here.
              </Text>
            </View>
          }
          ListFooterComponent={footer}
          onEndReached={() => {
            if (more && !paging) {
              setPaging(true);
              load(false);
            }
          }}
          onEndReachedThreshold={0.35}
        />
      )}
    </SafeAreaView>
  );
}
function Card({ item, index }: { item: Session; index: number }) {
  const t = typeTheme(item.type);
  return (
    <StaggerItem index={index}>
      <ScalePressable
        style={s.card}
        onPress={() => {
          haptic.selection();
          router.push({ pathname: "/session/[id]", params: { id: item.id } });
        }}
      >
        <View style={[s.icon, { backgroundColor: t.bg }]}>
          <Ionicons name={t.icon} color={t.color} size={19} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{typeName(item.type)}</Text>
          <Text style={s.meta}>
            {minutes(item.durationMs)} min · {formatDate(item.startedAt)}
          </Text>
        </View>
        <Text style={s.coins}>+{item.coins}</Text>
        <Ionicons name="chevron-forward" size={15} color={Colors.textTertiary} />
      </ScalePressable>
    </StaggerItem>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 4 },
  filters: { flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 16 },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  active: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activeText: { color: "#fff" },
  pad: { padding: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 28 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...Shadows.card,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  meta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 3,
  },
  coins: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.success },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 30 },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: Colors.text,
    marginTop: 14,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  end: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: "center",
    padding: 18,
  },
});





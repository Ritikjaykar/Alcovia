import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { Achievement } from "@/types/api";
import { Colors, Shadows } from "@/constants/Colors";
import { ErrorState, ScreenTitle, Skeleton } from "@/components/ui";
import { FadeIn, StaggerItem } from "@/components/Motion";
export default function Achievements() {
  const [data, setData] = useState<Achievement[]>([]),
    [loading, setLoading] = useState(true),
    [refresh, setRefresh] = useState(false),
    [error, setError] = useState("");
  const load = useCallback(
    () =>
      api
        .achievements()
        .then(setData)
        .catch((e) => setError(e.message))
        .finally(() => {
          setLoading(false);
          setRefresh(false);
        }),
    []
  );
  useEffect(() => {
    load();
  }, []);
  const unlocked = data.filter((x) => x.unlockedAt).length;
  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.head}>
        <ScreenTitle subtitle={`${unlocked} of ${data.length || 12} unlocked`}>
          Achievements
        </ScreenTitle>
      </View>
      {loading ? (
        <View style={s.pad}>
          <Skeleton />
        </View>
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
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={(x) => x.id}
          contentContainerStyle={s.list}
          columnWrapperStyle={s.row}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={() => {
                setRefresh(true);
                load();
              }}
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={
            <FadeIn>
              <View style={s.summary}>
              <View style={s.summaryIcon}>
                <Ionicons name="trophy" size={25} color={Colors.amber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.summaryTitle}>
                  {unlocked < 6 ? "Building momentum" : "On a roll!"}
                </Text>
                <Text style={s.summaryText}>
                  {12 - unlocked} badges are waiting for you. Every focused
                  minute moves you closer.
                </Text>
              </View>
            </View>
            </FadeIn>
          }
          renderItem={({ item, index }) => <Badge item={item} index={index} />}
        />
      )}
    </SafeAreaView>
  );
}
function Badge({ item, index }: { item: Achievement; index: number }) {
  const open = !!item.unlockedAt;
  return (
    <StaggerItem index={index} glow={open}>
    <View style={[s.badge, !open && s.locked]}>
      <View
        style={[
          s.badgeIcon,
          { backgroundColor: open ? Colors.primaryLight : "#ECEEF2" },
        ]}
      >
        <Ionicons
          name={item.icon as any}
          size={25}
          color={open ? Colors.primary : Colors.textTertiary}
        />
        {open && (
          <View style={s.check}>
            <Ionicons name="checkmark" size={10} color="#fff" />
          </View>
        )}
      </View>
      <Text style={[s.name, !open && { color: Colors.textSecondary }]}>
        {item.name}
      </Text>
      <Text style={s.desc} numberOfLines={2}>
        {item.description}
      </Text>
      {open ? (
        <Text style={s.unlocked}>UNLOCKED</Text>
      ) : (
        <>
          <View style={s.track}>
            <View
              style={[s.fill, { width: `${Math.min(item.progress, 100)}%` }]}
            />
          </View>
          <Text style={s.count}>
            {item.current} / {item.target}
          </Text>
        </>
      )}
    </View>
    </StaggerItem>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  head: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  pad: { padding: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 30 },
  row: { gap: 12 },
  summary: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...Shadows.card,
  },
  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.amberLight,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
  summaryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginTop: 3,
  },
  badge: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    minHeight: 205,
    ...Shadows.card,
  },
  locked: { opacity: 0.82 },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  check: {
    position: "absolute",
    right: -3,
    top: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.text },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 16,
    marginTop: 4,
    minHeight: 32,
  },
  unlocked: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: Colors.success,
    letterSpacing: 0.7,
    marginTop: 13,
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: "hidden",
    marginTop: 13,
  },
  fill: { height: 5, backgroundColor: Colors.primary, borderRadius: 3 },
  count: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 5,
  },
});




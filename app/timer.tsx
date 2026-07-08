import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { SessionType } from "@/types/api";
import { Colors, Shadows } from "@/constants/Colors";
import { FadeIn, ScalePressable } from "@/components/Motion";
import { haptic } from "@/utils/feedback";
const options: { type: SessionType; label: string; min: number }[] = [
  { type: "quick_sprint", label: "Quick", min: 15 },
  { type: "deep_focus", label: "Deep", min: 25 },
  { type: "pomodoro", label: "Pomodoro", min: 25 },
];
export default function Timer() {
  const [selected, setSelected] = useState(options[1]),
    [left, setLeft] = useState(selected.min * 60),
    [running, setRunning] = useState(false),
    [saving, setSaving] = useState(false),
    [completed, setCompleted] = useState(false),
    start = useRef(new Date().toISOString()),
    pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () =>
        setLeft((v) => {
          if (v <= 1) {
            clearInterval(id);
            setRunning(false);
            finish();
            return 0;
          }
          return v - 1;
        }),
      1000
    );
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (!running) { pulse.setValue(1); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.018, duration: 850, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse, running]);
  const choose = (x: (typeof options)[0]) => {
    if (!running) {
      haptic.selection();
      setSelected(x);
      setLeft(x.min * 60);
    }
  };
  const finish = async () => {
    setSaving(true);
    try {
      await api.complete({
        type: selected.type,
        durationMs: selected.min * 60000,
        timeline: [
          {
            type: "focus",
            durationMs: selected.min * 60000,
            startedAt: start.current,
          },
        ],
      });
      haptic.success();
      Alert.alert(
        "Session complete",
        "Nice work — your coins have been added.",
        [{ text: "Done", onPress: () => router.replace("/") }]
      );
    } catch (e: any) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSaving(false);
    }
  };
  const pct = left / (selected.min * 60);
  if (completed) return <Success coins={selected.type === "quick_sprint" ? 30 : 50} />;
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.nav}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={Colors.text} />
        </Pressable>
        <Text style={s.navTitle}>Focus session</Text>
        <View style={{ width: 26 }} />
      </View>
      <View style={s.body}>
        <Text style={s.eyebrow}>
          {running ? "STAY WITH IT" : "CHOOSE YOUR RHYTHM"}
        </Text>
        <View style={s.options}>
          {options.map((x) => (
            <Pressable
              key={x.type}
              onPress={() => choose(x)}
              style={[s.option, x.type === selected.type && s.selected]}
            >
              <Text
                style={[
                  s.optionText,
                  x.type === selected.type && s.selectedText,
                ]}
              >
                {x.label}
              </Text>
              <Text
                style={[
                  s.optionMin,
                  x.type === selected.type && s.selectedText,
                ]}
              >
                {x.min} min
              </Text>
            </Pressable>
          ))}
        </View>
        <Animated.View style={[s.ring, { transform: [{ scale: pulse }] }]}>
          <Svg width={286} height={286}>
            <Circle
              cx={143}
              cy={143}
              r={127}
              fill="none"
              stroke={Colors.primaryLight}
              strokeWidth={12}
            />
            <Circle
              cx={143}
              cy={143}
              r={127}
              fill="none"
              stroke={Colors.primary}
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray={798}
              strokeDashoffset={798 * (1 - pct)}
              rotation="-90"
              origin="143,143"
            />
          </Svg>
          <View style={s.clock}>
            <Text style={s.time}>
              {String(Math.floor(left / 60)).padStart(2, "0")}:
              {String(left % 60).padStart(2, "0")}
            </Text>
            <Text style={s.mode}>{selected.label} focus</Text>
          </View>
        </Animated.View>
        <ScalePressable
          disabled={saving}
          style={s.play}
          onPress={() => {
            haptic.impact();
            start.current = new Date().toISOString();
            setRunning((v) => !v);
          }}
        >
          <Ionicons name={running ? "pause" : "play"} size={28} color="#fff" />
        </ScalePressable>
        <Text style={s.hint}>
          {running ? "Tap to pause" : "Find a quiet spot. You’ve got this."}
        </Text>
        {__DEV__ && (
          <Pressable onPress={finish} style={s.demo}>
            <Text style={s.demoText}>Finish now (demo)</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
function Success({ coins }: { coins: number }) {
  const colors = [Colors.primary, Colors.success, Colors.amber, "#FF6B81"];
  return <SafeAreaView style={s.safe}><FadeIn><View style={s.successPage}>
    <View style={s.confetti}>{Array.from({ length: 18 }).map((_, i) => <View key={i} style={[s.confettiDot, { backgroundColor: colors[i % colors.length], left: `${8 + (i * 17) % 86}%`, top: 10 + (i * 37) % 180, transform: [{ rotate: `${i * 23}deg` }] }]} />)}</View>
    <View style={s.successIcon}><Ionicons name="checkmark" size={46} color="#fff" /></View>
    <Text style={s.successTitle}>Focus complete!</Text>
    <Text style={s.successCopy}>You protected your attention and finished strong.</Text>
    <View style={s.coinPill}><Ionicons name="sparkles" size={18} color={Colors.amber}/><Text style={s.coinText}>+{coins} coins earned</Text></View>
    <ScalePressable style={s.done} onPress={() => { haptic.selection(); router.replace("/"); }}><Text style={s.doneText}>Back to dashboard</Text></ScalePressable>
  </View></FadeIn></SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  successPage:{height:"100%",alignItems:"center",justifyContent:"center",padding:28,overflow:"hidden"},
  confetti:{position:"absolute",top:40,left:0,right:0,height:230},confettiDot:{position:"absolute",width:8,height:16,borderRadius:3},
  successIcon:{width:92,height:92,borderRadius:46,backgroundColor:Colors.success,alignItems:"center",justifyContent:"center",...Shadows.cta},
  successTitle:{fontFamily:"Inter_800ExtraBold",fontSize:28,color:Colors.text,marginTop:24},successCopy:{fontFamily:"Inter_400Regular",fontSize:14,lineHeight:21,color:Colors.textSecondary,textAlign:"center",marginTop:8,maxWidth:290},
  coinPill:{flexDirection:"row",gap:8,backgroundColor:Colors.amberLight,borderRadius:22,paddingHorizontal:18,paddingVertical:11,marginTop:22},coinText:{fontFamily:"Inter_700Bold",fontSize:14,color:Colors.text},
  done:{height:52,borderRadius:14,backgroundColor:Colors.primary,alignItems:"center",justifyContent:"center",paddingHorizontal:28,marginTop:32},doneText:{fontFamily:"Inter_700Bold",fontSize:15,color:"#fff"},
  nav: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  navTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  body: { flex: 1, alignItems: "center", padding: 20 },
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 1.4,
    marginTop: 18,
  },
  options: { flexDirection: "row", gap: 8, marginTop: 18 },
  option: {
    borderRadius: 14,
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.text,
  },
  optionMin: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectedText: { color: "#fff" },
  ring: { width: 286, height: 286, marginTop: 42 },
  clock: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 52,
    color: Colors.text,
    letterSpacing: -2,
  },
  mode: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  play: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 34,
    ...Shadows.cta,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 14,
  },
  demo: { marginTop: 22, padding: 10 },
  demoText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.primary,
  },
});





import { SessionType } from "@/types/api";
export const typeName = (t: SessionType) =>
  ({
    deep_focus: "Deep Focus",
    quick_sprint: "Quick Sprint",
    pomodoro: "Pomodoro",
  }[t]);
export const minutes = (ms: number) => Math.round(ms / 60000);
export const formatDate = (v: number | string) => {
  const d = new Date(v),
    now = new Date(),
    time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    diff = Math.floor(
      (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
        86400000
    );
  return `${
    diff === 0
      ? "Today"
      : diff === 1
      ? "Yesterday"
      : d.toLocaleDateString([], { month: "short", day: "numeric" })
  }, ${time}`;
};
export const typeTheme = (t: SessionType) =>
  t === "deep_focus"
    ? { icon: "radio" as const, bg: "#EDE9FE", color: "#6C5CE7" }
    : t === "quick_sprint"
    ? { icon: "flash" as const, bg: "#D1FAE5", color: "#00B894" }
    : { icon: "timer" as const, bg: "#FEF3C7", color: "#F39C12" };

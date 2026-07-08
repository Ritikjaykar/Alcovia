import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { getDb, initDb } from "./db";
const app = express(),
  PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
initDb();
const fail = (res: Response, status: number, error: string, code: string) =>
  res.status(status).json({ error, code });
const exists = (id: string) =>
  !!getDb().prepare("SELECT 1 FROM students WHERE id=?").get(id);
const student = (r: any) => ({
  id: r.id,
  name: r.name,
  initials: r.initials,
  totalCoins: r.total_coins,
  currentStreak: r.current_streak,
  dailyGoal: r.daily_goal,
  joinedAt: r.joined_at,
});
const session = (r: any) => ({
  id: r.id,
  studentId: r.student_id,
  type: r.type,
  durationMs: r.duration_ms,
  coins: r.coins,
  status: r.status,
  startedAt: r.started_at,
  completedAt: r.completed_at,
});
app.get("/api/students/:id", (req, res) => {
  const r = getDb()
    .prepare("SELECT * FROM students WHERE id=?")
    .get(req.params.id);
  return r
    ? res.json(student(r))
    : fail(res, 404, "Student not found", "NOT_FOUND");
});
app.get("/api/students/:id/sessions", (req, res) => {
  if (!exists(req.params.id))
    return fail(res, 404, "Student not found", "NOT_FOUND");
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit),
    filter = req.query.filter as string | undefined;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50)
    return fail(
      res,
      400,
      "Limit must be an integer from 1 to 50",
      "INVALID_LIMIT"
    );
  if (filter && !["today", "week", "month"].includes(filter))
    return fail(res, 400, "Invalid filter", "INVALID_FILTER");
  let decoded: { startedAt: number; id: string } | undefined;
  if (req.query.cursor) {
    try {
      decoded = JSON.parse(
        Buffer.from(String(req.query.cursor), "base64url").toString()
      );
      if (
        !decoded ||
        typeof decoded.startedAt !== "number" ||
        typeof decoded.id !== "string"
      )
        throw Error();
    } catch {
      return fail(res, 400, "Invalid cursor", "INVALID_CURSOR");
    }
  }
  const where = ["student_id=?"],
    values: any[] = [req.params.id];
  if (decoded) {
    where.push("(started_at<? OR (started_at=? AND id<?))");
    values.push(decoded.startedAt, decoded.startedAt, decoded.id);
  }
  if (filter) {
    const d = new Date();
    if (filter === "today") d.setHours(0, 0, 0, 0);
    if (filter === "week") {
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    }
    if (filter === "month") {
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
    }
    where.push("started_at>=?");
    values.push(d.getTime());
  }
  const rows = getDb()
      .prepare(
        `SELECT * FROM sessions WHERE ${where.join(
          " AND "
        )} ORDER BY started_at DESC,id DESC LIMIT ?`
      )
      .all(...values, limit + 1) as any[],
    hasMore = rows.length > limit,
    data = rows.slice(0, limit).map(session),
    last = data[data.length - 1];
  res.json({
    data,
    hasMore,
    cursor:
      hasMore && last
        ? Buffer.from(
            JSON.stringify({ startedAt: last.startedAt, id: last.id })
          ).toString("base64url")
        : null,
  });
});
app.get("/api/students/:id/sessions/:sessionId", (req, res) => {
  if (!exists(req.params.id))
    return fail(res, 404, "Student not found", "NOT_FOUND");
  const r: any = getDb()
    .prepare("SELECT * FROM sessions WHERE id=? AND student_id=?")
    .get(req.params.sessionId, req.params.id);
  if (!r) return fail(res, 404, "Session not found", "NOT_FOUND");
  const t = getDb()
    .prepare(
      "SELECT type,duration_ms,started_at FROM session_timeline WHERE session_id=? ORDER BY started_at"
    )
    .all(r.id) as any[];
  res.json({
    ...session(r),
    startedAt: new Date(r.started_at).toISOString(),
    completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : null,
    timeline: t.map((e) => ({
      type: e.type,
      durationMs: e.duration_ms,
      startedAt: e.started_at,
    })),
  });
});
app.get("/api/students/:id/achievements", (req, res) => {
  if (!exists(req.params.id))
    return fail(res, 404, "Student not found", "NOT_FOUND");
  const rows = getDb()
    .prepare(
      "SELECT * FROM achievements WHERE student_id=? ORDER BY unlocked_at IS NULL,id"
    )
    .all(req.params.id) as any[];
  res.json(
    rows.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      unlockedAt: a.unlocked_at,
      progress: a.progress,
      target: a.target,
      current: a.current,
    }))
  );
});
app.get("/api/students/:id/stats", (req, res) => {
  const s: any = getDb()
    .prepare("SELECT * FROM students WHERE id=?")
    .get(req.params.id);
  if (!s) return fail(res, 404, "Student not found", "NOT_FOUND");
  if (req.query.period && req.query.period !== "week")
    return fail(res, 400, "Only week is supported", "INVALID_PERIOD");
  const x: any = getDb()
      .prepare(
        "SELECT MAX(started_at) value FROM sessions WHERE student_id=? AND status='completed'"
      )
      .get(req.params.id),
    anchor = x.value ? new Date(x.value) : new Date(),
    mon = new Date(anchor);
  mon.setHours(0, 0, 0, 0);
  mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
  const rows = getDb()
      .prepare(
        "SELECT started_at FROM sessions WHERE student_id=? AND status='completed' AND started_at>=? AND started_at<?"
      )
      .all(req.params.id, mon.getTime(), mon.getTime() + 7 * 86400000) as any[],
    counts = Array(7).fill(0);
  rows.forEach((r) => counts[(new Date(r.started_at).getDay() + 6) % 7]++);
  const day = new Date(anchor);
  day.setHours(0, 0, 0, 0);
  res.json({
    totalSessions: rows.length,
    totalCoins: s.total_coins,
    streak: s.current_streak,
    todayCompleted: rows.filter(
      (r) =>
        r.started_at >= day.getTime() && r.started_at < day.getTime() + 86400000
    ).length,
    dailyGoal: s.daily_goal,
    sessionsPerDay: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map(
      (d, i) => ({ day: d, count: counts[i] })
    ),
  });
});
app.post("/api/students/:id/sessions", (req, res) => {
  if (!exists(req.params.id))
    return fail(res, 404, "Student not found", "NOT_FOUND");
  const { type, durationMs, timeline } = req.body || {};
  if (
    !["deep_focus", "quick_sprint", "pomodoro"].includes(type) ||
    !Number.isInteger(durationMs) ||
    durationMs <= 0 ||
    !Array.isArray(timeline) ||
    !timeline.length
  )
    return fail(res, 400, "Invalid session payload", "VALIDATION_ERROR");
  if (
    timeline.some(
      (t: any) =>
        !["focus", "break"].includes(t.type) ||
        !Number.isInteger(t.durationMs) ||
        t.durationMs <= 0 ||
        Number.isNaN(Date.parse(t.startedAt))
    )
  )
    return fail(res, 400, "Invalid timeline", "VALIDATION_ERROR");
  const id = `ses_${randomUUID()}`,
    startedAt = Date.parse(timeline[0].startedAt),
    completedAt = startedAt + durationMs,
    coins = type === "quick_sprint" ? 30 : 50;
  getDb().transaction(() => {
    getDb()
      .prepare("INSERT INTO sessions VALUES (?,?,?,?,?,?,?,?)")
      .run(
        id,
        req.params.id,
        type,
        durationMs,
        coins,
        "completed",
        startedAt,
        completedAt
      );
    const add = getDb().prepare(
      "INSERT INTO session_timeline (session_id,type,duration_ms,started_at) VALUES (?,?,?,?)"
    );
    timeline.forEach((t: any) =>
      add.run(id, t.type, t.durationMs, t.startedAt)
    );
    getDb()
      .prepare("UPDATE students SET total_coins=total_coins+? WHERE id=?")
      .run(coins, req.params.id);
  })();
  res
    .status(201)
    .json({
      id,
      studentId: req.params.id,
      type,
      durationMs,
      coins,
      status: "completed",
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date(completedAt).toISOString(),
      timeline,
    });
});
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: Date.now() })
);
app.use((_req, res) => fail(res, 404, "Route not found", "NOT_FOUND"));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  fail(res, 500, "Internal server error", "INTERNAL_ERROR");
});
app.listen(PORT, () =>
  console.log(`Alcovia API running on http://localhost:${PORT}`)
);

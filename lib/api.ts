import {
  Achievement,
  PaginatedResponse,
  Session,
  SessionDetail,
  Student,
  WeeklyStats,
} from "@/types/api";
export const STUDENT_ID = "stu_01";
const BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
export class ApiError extends Error {
  constructor(message: string, public status = 0) {
    super(message);
  }
}
export async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const c = new AbortController(),
    timer = setTimeout(() => c.abort(), 10000);
  try {
    const r = await fetch(BASE + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
      signal: c.signal,
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok)
      throw new ApiError(body.error || "Something went wrong", r.status);
    return body;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      e instanceof Error && e.name === "AbortError"
        ? "Request timed out. Please try again."
        : "Unable to reach the server."
    );
  } finally {
    clearTimeout(timer);
  }
}
export const api = {
  student: () => request<Student>(`/students/${STUDENT_ID}`),
  stats: () =>
    request<WeeklyStats>(`/students/${STUDENT_ID}/stats?period=week`),
  sessions: (filter?: string, cursor?: string) =>
    request<PaginatedResponse<Session>>(
      `/students/${STUDENT_ID}/sessions?limit=8${
        filter ? `&filter=${filter}` : ""
      }${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`
    ),
  session: (id: string) =>
    request<SessionDetail>(`/students/${STUDENT_ID}/sessions/${id}`),
  achievements: () =>
    request<Achievement[]>(`/students/${STUDENT_ID}/achievements`),
  complete: (body: object) =>
    request<SessionDetail>(`/students/${STUDENT_ID}/sessions`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

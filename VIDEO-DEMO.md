# Video Demo Script

Target length: about 2 minutes 30 seconds.

You can record the phone screen with no narration, but short narration makes the decisions easier to understand.

## Before Recording

1. Start the backend with `cd server`, `npm run seed`, then `npm run dev`.
2. Start Expo with `npx expo start --clear`.
3. Open the app in Expo Go.
4. Confirm Dashboard, History, and Achievements load.
5. Keep the phone and computer on the same Wi-Fi.
6. Turn on Do Not Disturb so notifications do not appear.

## Script and Shot List

### 0:00–0:12 — Introduction

Show the Dashboard.

Say:

> This is my Alcovia student focus app. I completed the core mobile and API requirements, plus the Focus Timer, Achievements, and Animations and Polish bonuses.

Point briefly at the greeting, stats, weekly chart, and daily goal.

### 0:12–0:35 — Dashboard and polish

Pull down to refresh, then release.

Say:

> The dashboard loads the student and weekly statistics from the Express API. I used shimmer skeletons for loading, animated chart bars, and an animated daily-goal ring. The interface also uses small press and haptic feedback instead of random decorative animation.

Tap Start Focus Session.

### 0:35–1:05 — Focus Timer

Select Quick, Deep, and Pomodoro once, then select Quick.

Tap Start, wait two seconds, pause, then resume.

Say:

> The timer supports three API session types and can pause and resume. The main control scales under the finger, gives haptic feedback, and the timer circle gently pulses while active.

Tap Finish Now (demo).

Show the confetti success screen and coins earned. Tap Back to Dashboard.

Say:

> The demo action completes the flow immediately, posts the session to the API, and shows a success vibration, confetti, and earned coins.

### 1:05–1:35 — History and session detail

Open History and select All if needed.

Slowly scroll so the staggered card entrance and pagination are visible.

Say:

> History uses cursor-based pagination, pull-to-refresh, and separate loading, empty, error, and finished states. Session list dates arrive as epoch milliseconds.

Tap one session card.

Say:

> The detail endpoint intentionally returns ISO date strings. This screen handles that different format and shows the useful focus and break timeline.

Go back.

### 1:35–1:57 — Achievements

Open Achievements and scroll slowly.

Say:

> The Achievements bonus loads all twelve achievements from the API. Unlocked achievements are clear and celebratory, while locked achievements still show current progress and a target.

### 1:57–2:18 — Error handling

Optional but recommended: stop the API before recording this part, or record a separate short clip.

Refresh one screen and show the error state, then restart the server and tap Try Again.

Say:

> If the API is unavailable or takes longer than ten seconds, the app stops loading and gives the student a useful retry action.

### 2:18–2:30 — Closing

Return to Dashboard.

Say:

> The backend uses Express and SQLite with input validation, structured errors, cursor pagination, session detail, achievements, weekly statistics, and completed-session creation. My design and technical trade-offs are documented in DECISIONS.md.

## Recording Tips

- Keep taps slow enough to see the press-scale effect.
- Do not spend time waiting on the real timer; use Finish Now (demo).
- Show the haptic behavior by mentioning it because it is not visible in a recording.
- Avoid showing terminal errors or private account information.
- Upload the final recording to Loom, Google Drive, or YouTube and verify the link is viewable.


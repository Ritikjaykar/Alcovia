# Alcovia Student

A mobile focus companion for students, built with React Native, Expo Router, Express, and SQLite.

Alcovia helps a student understand their focus habits, complete timed sessions, track daily progress, review session history, and unlock achievements. The project includes the mobile application and the API that powers it.

> Built for the Alcovia student app take-home assignment.

## Highlights

- Dashboard closely follows the supplied visual specification
- Weekly focus chart and animated daily-goal progress
- Cursor-paginated session history
- Useful session detail with focus and break timeline
- Focus timer with Quick, Deep Focus, and Pomodoro modes
- Achievement collection with locked and unlocked states
- Loading shimmer, error recovery, empty states, and pull-to-refresh
- Press animations, staggered list entrances, haptic feedback, and timer celebration
- Typed Express API backed by SQLite
- Input validation and consistent structured errors

## Completed Requirements

### Core

- [x] Dashboard screen
- [x] History screen
- [x] History filters
- [x] Cursor-based pagination
- [x] Loading, empty, error, timeout, and refresh states
- [x] Session detail screen
- [x] Student profile API
- [x] Session list API
- [x] Session detail API
- [x] Weekly statistics API
- [x] Date-format handling
- [x] Completed `DECISIONS.md`

### Bonuses

- [x] B1 — Focus Timer
- [x] B2 — Achievements
- [x] B5 — Animations and Polish
- [ ] B3 — n8n Workflow
- [ ] B4 — Automated API Tests

## Screens

### Dashboard

The Dashboard introduces the student, shows coins, streak, session count, weekly activity, and today's progress.

Polish includes:

- Chart bars that grow from zero
- Animated SVG progress ring
- Pull-to-refresh
- Shimmer loading placeholders
- Haptic and press feedback on the main action

### History

History supports Today, This Week, This Month, and All filters.

It also includes:

- Opaque cursor pagination
- Staggered card entrance animation
- Pull-to-refresh
- Empty and error states
- End-of-list feedback
- Session navigation with card scale and haptic feedback

> The provided fixture's numeric timestamps point to 2024. Use the **All** filter to view all seeded sessions.

### Session Detail

The detail screen shows:

- Session type and date
- Duration
- Coins earned
- Completion status
- Focus and break timeline

The list endpoint returns epoch milliseconds, while the detail endpoint returns ISO strings. The app handles both formats through one date-formatting helper.

### Focus Timer

The timer supports:

- Quick Sprint — 15 minutes
- Deep Focus — 25 minutes
- Pomodoro — 25 minutes
- Start, pause, and resume
- Animated and gently pulsing timer ring
- Completed-session API request
- Success vibration
- Confetti result screen
- Coins-earned feedback

A development-only **Finish now (demo)** action is available so the complete flow can be demonstrated without waiting for the full timer.

### Achievements

Achievements are presented as collectible badges.

- Unlocked badges use stronger color and a check mark
- Locked badges show progress and target values
- Cards animate into place
- Unlocked cards receive a small scale and glow-style entrance

## Technology

### Mobile

- React Native
- Expo SDK 52
- Expo Router
- TypeScript
- React Native SVG
- React Native Animated
- Ionicons

### API

- Node.js
- Express
- TypeScript
- SQLite
- better-sqlite3

## Project Structure

```text
.
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Dashboard
│   │   ├── history.tsx        # Session history
│   │   └── achievements.tsx   # Achievement collection
│   ├── session/[id].tsx       # Session detail
│   ├── timer.tsx              # Focus timer
│   └── _layout.tsx
├── components/
│   ├── Motion.tsx             # Shared motion components
│   └── ui.tsx                 # Skeleton and shared states
├── constants/
│   └── Colors.ts
├── lib/
│   └── api.ts                 # Typed mobile API client
├── server/
│   ├── fixtures/
│   └── src/
│       ├── db.ts
│       ├── index.ts
│       └── seed.ts
├── types/
│   └── api.ts
├── utils/
│   ├── feedback.ts
│   └── format.ts
├── DECISIONS.md
├── VIDEO-DEMO.md
├── APK-BUILD.md
└── eas.json
```

## Getting Started

### Requirements

- Node.js
- npm
- Expo Go on an Android or iOS phone
- Phone and computer connected to the same Wi-Fi network

### 1. Install mobile dependencies

From the project root:

```powershell
npm install
```

### 2. Install API dependencies

```powershell
cd server
npm install
cd ..
```

### 3. Configure the API URL

Create `.env` in the project root:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000/api
```

Find your Windows Wi-Fi address with:

```powershell
ipconfig
```

Use the IPv4 Address shown under the active Wi-Fi adapter.

Do not use `localhost` with Expo Go on a physical phone. On the phone, `localhost` means the phone itself.

### 4. Seed and run the API

Open the first terminal:

```powershell
cd server
npm run seed
npm run dev
```

Verify it from the computer:

```text
http://YOUR_COMPUTER_IP:3000/health
```

You should receive a JSON response with `"status": "ok"`.

### 5. Start Expo

Open a second terminal from the project root:

```powershell
npx expo start --clear
```

Scan the QR code with Expo Go.

If the phone cannot load the API:

1. Confirm the phone and computer use the same Wi-Fi.
2. Open the health URL in the phone's browser.
3. Confirm the API terminal is still running.
4. Allow Node.js through Windows Firewall.
5. Check that the computer's IPv4 address has not changed.

## Available Commands

### Mobile

```powershell
npm start
npm run android
npm run ios
npm run web
```

### API

Run these from `server/`:

```powershell
npm run seed
npm run dev
npm run build
npm start
```

### Type Check

```powershell
node node_modules\typescript\bin\tsc --noEmit
```

## API Reference

Base URL:

```text
http://YOUR_COMPUTER_IP:3000/api
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/students/:id` | Student profile |
| GET | `/students/:id/stats?period=week` | Weekly statistics |
| GET | `/students/:id/sessions` | Paginated session list |
| GET | `/students/:id/sessions/:sessionId` | Session detail and timeline |
| GET | `/students/:id/achievements` | Locked and unlocked achievements |
| POST | `/students/:id/sessions` | Create a completed session |

### Session Query Parameters

| Parameter | Values |
| --- | --- |
| `limit` | Integer from 1 to 50 |
| `cursor` | Opaque cursor returned by the previous response |
| `filter` | `today`, `week`, `month`, or omitted |

### Error Shape

```json
{
  "error": "Student not found",
  "code": "NOT_FOUND"
}
```

## Quick Testing Checklist

### Dashboard

- Student name and initials load
- Statistics cards display values
- Weekly bars animate
- Daily-goal ring animates
- Start Focus Session opens the timer
- Pull-to-refresh works

### History

- All four filters work
- Cards display type, duration, date, and coins
- Scrolling loads more pages
- Pull-to-refresh works
- Cards open Session Detail
- Cards scale before navigation

### Timer

- Session modes can be changed
- Start, pause, and resume work
- Timer ring moves and pulses
- Finish Now shows the completion screen
- Coins and confetti appear
- New session appears in History

### Achievements

- Twelve achievements load
- Locked and unlocked styles are different
- Locked achievements show progress
- Cards animate into place

### Failure State

1. Stop the API.
2. Refresh a screen.
3. Confirm the error and Try Again action appear.
4. Restart the API.
5. Tap Try Again.

## Animations and Accessibility

Motion is short and attached to useful feedback:

- Shimmer means data is loading
- Growing bars and rings explain progress
- Scale means a press was accepted
- Stagger helps the eye follow loaded list content
- Timer pulse means the session is active
- Confetti confirms completion

Android haptics are implemented with short built-in vibration patterns so they work in Expo Go without another native package. iOS vibration is intentionally disabled because React Native's built-in iOS vibration is too long for subtle feedback.

## Build an APK

The repository includes an EAS preview profile configured to produce an installable APK.

```powershell
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
```

When the build completes, Expo provides a page where the APK can be downloaded.

Read [APK-BUILD.md](./APK-BUILD.md) for the complete guide.

> The APK still needs access to the Express API. For an APK that works outside your local Wi-Fi, deploy the server publicly and update `EXPO_PUBLIC_API_URL` before building.

## Video Demo

A complete recording script and shot list are available in [VIDEO-DEMO.md](./VIDEO-DEMO.md).

The recommended recording shows:

1. Dashboard
2. Focus Timer
3. Completion and coins
4. History and pagination
5. Session Detail
6. Achievements
7. Error and retry handling

## Engineering Decisions

See [DECISIONS.md](./DECISIONS.md) for the reasoning behind:

- Local state management
- API date handling
- Cursor pagination
- Edge states
- Session Detail content
- Scaling limitations
- Bonus screen design
- Motion and haptic choices

## Known Limitations

- Automated API tests are not included.
- The optional n8n workflow is not included.
- The local API must be running for the mobile app to load data.
- Fixture list timestamps and timeline timestamps use different years.
- Android receives subtle haptic feedback; iOS does not use the built-in long vibration.

## License

This repository was created for the Alcovia take-home assignment.


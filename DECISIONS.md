# Decisions

This file explains the choices I made while building the assignment.

## State Management

I used normal React state inside each screen.

The app has only one student and a small number of screens, so a bigger state library would add extra setup without giving much value. I kept all API calls in one small typed API file so the screens do not repeat fetch logic.

The Dashboard reloads when it becomes active. This is useful after finishing a timer because the latest coins and session count appear automatically.

## API Integration

The API returns two different date formats:

- The session list returns numbers in epoch milliseconds.
- Session detail returns ISO date strings.

I kept both formats in the TypeScript types because that is the real API contract. My date formatting helper accepts either a number or a string and turns it into a JavaScript Date. This keeps the screen components simple.

## Pagination

The History screen uses the cursor returned by the API.

The app does not try to read or create the cursor. It stores it and sends it back when the user reaches the end of the list. New results are added below the existing results.

I also added a loading guard so scrolling cannot start the same request twice. When there are no more pages, the app stops making requests and shows “You're all caught up.”

## Edge Cases

While data is loading, the app shows animated card skeletons instead of a spinner. This keeps the page shape stable and feels more natural.

If the API is unavailable, the app shows a clear error message and a Try Again button. Requests time out after ten seconds instead of loading forever.

If there are no sessions, History explains that completed sessions will appear there. Dashboard, History, and Achievements also support pull-to-refresh.

## Session Detail

The detail screen shows:

- Session type
- Date and time
- Duration
- Coins earned
- Completion status
- Focus and break timeline

I chose these details because they help the student understand what happened during the session. I did not show raw IDs or timestamps because they are developer information, not useful student information.

## What's Weak

The weakest part is automated testing. I checked TypeScript, created Android production bundles, and manually tested the API, but I did not build a full automated test suite.

With two more days, I would add API tests for invalid cursors, pagination boundaries, equal timestamps, invalid POST bodies, and date formats. I would also add screen tests for loading, retry, and empty states.

The supplied fixture dates also have a mismatch. The session number timestamps point to 2024, while timeline strings point to 2026. I kept the required API formats and documented the issue instead of silently changing the fixture data.

## What Breaks at Scale

SQLite would be the first problem with thousands of users because it cannot handle many writes at the same time.

For a larger product, I would use PostgreSQL, run several API servers, add the full pagination index, cache weekly statistics, and send background work through a job queue.

## Bonus: Focus Timer

I added Quick, Deep, and Pomodoro session choices. The timer can start, pause, resume, and save a completed session through the API.

A development-only Finish Now button makes the demo practical. It lets me show the completed-session flow without waiting 15 or 25 minutes.

I left out custom task names, notifications, and configurable intervals because they are not needed to prove the main timer flow.

## Bonus: Achievements

I used a two-column badge grid because achievements should feel collectible and easy to scan.

Unlocked badges use stronger color, a check mark, scale, glow, and sparkle-style movement. Locked badges are softer but still show a progress bar and current target. A locked achievement therefore still gives the student a useful next goal.

## Bonus: Animations and Polish

I used animation only when it explains an action or change.

- Loading cards use an animated shimmer.
- Dashboard chart bars grow from zero.
- The daily progress ring animates to its value.
- History cards fade and slide in one after another.
- Pressed cards and buttons scale down to 0.96 before opening.
- Tab navigation uses one short fade and keeps screens mounted to prevent flashing.
- The timer circle gently pulses while running.
- Timer completion shows confetti, coins earned, and a success screen.
- Important actions provide Android haptic feedback.

I used React Native Animated, React Native SVG, and the built-in Android vibration API. This works in Expo Go without adding another native package. iOS vibration is left off because the built-in iOS pulse is too long to feel subtle.

## API Fixture Decision

Weekly statistics use the newest completed session as the demo reference date. This keeps the supplied seed data visible even though its numeric timestamps are old.

With real production sessions, the newest session naturally becomes the current reference.


# Build an Installable Android APK

The simplest method is Expo EAS Build. The included `eas.json` preview profile is configured to produce an APK instead of an AAB.

## Important: The API Must Still Be Available

The APK contains the mobile interface, not the Express server.

The current `.env` uses:

```
EXPO_PUBLIC_API_URL=http://10.207.128.38:3000/api
```

This works only when:

- The phone and computer are on the same Wi-Fi.
- The computer's IP is still `10.207.128.38`.
- The backend is running.
- Windows Firewall allows Node.js on port 3000.

For an APK that works anywhere, deploy the server to a public HTTPS host and change `EXPO_PUBLIC_API_URL` to that public URL before building.

## EAS Cloud Build — Recommended

### 1. Create an Expo account

Create a free account at https://expo.dev/signup.

### 2. Install or run EAS CLI

If normal npm commands work:

```powershell
npm install --global eas-cli
```

You can also run it without a global install:

```powershell
npx eas-cli@latest login
```

### 3. Log in

```powershell
eas login
```

### 4. Connect the project

From the project root:

```powershell
eas build:configure
```

If Expo asks to create or link a project, accept it. Do not remove the existing `preview.android.buildType: apk` setting from `eas.json`.

### 5. Build the APK

```powershell
eas build --platform android --profile preview
```

Choose the option that lets EAS create and manage the Android signing key.

### 6. Install it

When the build finishes, EAS prints a build-page link.

Open that link on the Android phone, download the APK, allow installation from that browser when Android asks, and install it.

## Google Play Store Build

Google Play expects an AAB rather than an APK. Use:

```powershell
eas build --platform android --profile production
```

The production profile creates the store artifact.

## Local APK Build — Optional

This requires Android Studio, the Android SDK, Java, and Gradle.

```powershell
npx expo prebuild
cd android
.\gradlew assembleRelease
```

The result is normally under:

```
android\app\build\outputs\apk\release\
```

Local release signing needs extra Android keystore configuration. EAS is easier for this assignment because it creates and safely manages the signing key.


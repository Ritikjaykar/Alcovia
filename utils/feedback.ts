import { Platform, Vibration } from "react-native";

// Short Android vibrations feel like native selection/impact feedback in Expo Go.

export const haptic = {
  selection: () => {
    if (Platform.OS === "android") Vibration.vibrate(8);
  },
  impact: () => {
    if (Platform.OS === "android") Vibration.vibrate(16);
  },
  success: () => {
    if (Platform.OS === "android") Vibration.vibrate([0, 18, 45, 28]);
  },
};

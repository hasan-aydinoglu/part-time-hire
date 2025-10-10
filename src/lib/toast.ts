import { Alert, Platform, ToastAndroid } from "react-native";

export function toast(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // iOS için basit bildirim
    Alert.alert("", message);
  }
}

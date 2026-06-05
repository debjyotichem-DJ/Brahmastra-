import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          // Verify token or just navigate to tabs assuming it's valid
          router.replace("/(tabs)");
        } else {
          router.replace("/login");
        }
      } catch (e) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-[#F0F4F8]">
      <ActivityIndicator size="large" color="#4ECDC4" />
      <Text className="mt-4 font-bold text-[#2D3142]">Loading D-Chemistry...</Text>
    </View>
  );
}

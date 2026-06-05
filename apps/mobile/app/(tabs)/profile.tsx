import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../src/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  const { data: me } = useQuery({
    queryKey: ["mobile-me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.data;
    }
  });

  const handleLogout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (e) {
      // ignore
    } finally {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      router.replace("/login");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F0F4F8]" edges={['top']}>
      <View className="p-4 border-b border-[#D0DEDC] bg-[#F0F4F8]">
        <Text className="text-2xl font-bold text-[#2D3142]">Profile</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        {/* Profile Card */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6 items-center">
          <View className="w-20 h-20 bg-[#F5A623]/20 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl font-bold text-[#E09010]">
              {me?.profile?.name?.charAt(0) || "U"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-[#2D3142]">{me?.profile?.name || "Student"}</Text>
          <Text className="text-[#5C6480] mt-1">{me?.email}</Text>
        </View>

        <View className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
          <TouchableOpacity className="p-4 flex-row items-center border-b border-[#F0F4F8]">
            <View className="w-8 h-8 bg-[#E8F0EF] rounded-full items-center justify-center mr-3">
              <Ionicons name="settings" size={18} color="#4ECDC4" />
            </View>
            <Text className="flex-1 font-medium text-[#2D3142]">Account Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#D0DEDC" />
          </TouchableOpacity>
          
          <TouchableOpacity className="p-4 flex-row items-center border-b border-[#F0F4F8]">
            <View className="w-8 h-8 bg-[#E8F0EF] rounded-full items-center justify-center mr-3">
              <Ionicons name="notifications" size={18} color="#4ECDC4" />
            </View>
            <Text className="flex-1 font-medium text-[#2D3142]">Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#D0DEDC" />
          </TouchableOpacity>

          <TouchableOpacity className="p-4 flex-row items-center">
            <View className="w-8 h-8 bg-[#E8F0EF] rounded-full items-center justify-center mr-3">
              <Ionicons name="language" size={18} color="#4ECDC4" />
            </View>
            <Text className="flex-1 font-medium text-[#2D3142]">Language</Text>
            <Text className="text-[#5C6480] mr-2">{me?.profile?.language || "EN"}</Text>
            <Ionicons name="chevron-forward" size={20} color="#D0DEDC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="bg-[#EF4444]/10 rounded-2xl p-4 flex-row items-center justify-center mb-8"
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#EF4444" />
          <Text className="text-[#EF4444] font-bold ml-2 text-lg">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

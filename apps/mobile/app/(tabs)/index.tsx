import React from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../src/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function DashboardScreen() {
  const router = useRouter();
  const { data: dashboardData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["mobile-dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard");
      return data.data;
    }
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F4F8]">
        <Text className="text-[#4ECDC4] font-bold">Loading Dashboard...</Text>
      </View>
    );
  }

  const { streak, subjectProgress, quoteOfTheDay, upcomingClasses } = dashboardData || {};

  return (
    <SafeAreaView className="flex-1 bg-[#F0F4F8]" edges={['top']}>
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-[#2D3142]">Dashboard</Text>
            <Text className="text-[#5C6480]">Ready to learn Chemistry?</Text>
          </View>
          <View className="bg-white px-3 py-2 rounded-xl flex-row items-center shadow-sm">
            <Ionicons name="flame" size={20} color="#F5A623" />
            <Text className="ml-1 font-bold text-[#2D3142]">{streak || 0}</Text>
          </View>
        </View>

        {/* Quote */}
        <View className="bg-[#4ECDC4] rounded-2xl p-5 shadow-sm mb-6">
          <Text className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Quote of the Day</Text>
          <Text className="text-white text-lg font-medium leading-relaxed">"{quoteOfTheDay}"</Text>
        </View>

        {/* Progress */}
        <Text className="text-lg font-bold text-[#2D3142] mb-3">Your Progress</Text>
        {subjectProgress?.length > 0 ? (
          subjectProgress.map((subject: any) => (
            <View key={subject.subjectId} className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-[#2D3142]">{subject.subjectName}</Text>
                <Text className="font-bold text-[#4ECDC4]">{subject.percentage}%</Text>
              </View>
              <View className="h-2 bg-[#E8F0EF] rounded-full overflow-hidden">
                <View className="h-full bg-[#4ECDC4]" style={{ width: `${subject.percentage}%` }} />
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-4 items-center border border-dashed border-[#D0DEDC]">
            <Text className="text-[#5C6480]">No active progress yet.</Text>
          </View>
        )}

        {/* Upcoming Live */}
        <Text className="text-lg font-bold text-[#2D3142] mt-2 mb-3">Upcoming Live</Text>
        {upcomingClasses?.length > 0 ? (
          upcomingClasses.map((live: any) => {
            const date = new Date(live.scheduledAt);
            return (
              <TouchableOpacity key={live.id} className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex-row items-center">
                <View className="w-12 h-12 bg-[#E8F0EF] rounded-xl items-center justify-center mr-4">
                  <Ionicons name="calendar" size={24} color="#4ECDC4" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-[#2D3142] mb-1">{live.title}</Text>
                  <Text className="text-xs text-[#5C6480]">
                    {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D0DEDC" />
              </TouchableOpacity>
            )
          })
        ) : (
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-8 items-center border border-dashed border-[#D0DEDC]">
            <Ionicons name="videocam-off" size={32} color="#D0DEDC" className="mb-2" />
            <Text className="text-[#5C6480]">No upcoming live classes.</Text>
          </View>
        )}
        <View className="h-20" /> {/* Extra padding for the floating button */}
      </ScrollView>

      {/* AI Chatbot Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#4ECDC4] rounded-full shadow-lg items-center justify-center"
        style={{ elevation: 8, shadowColor: '#4ECDC4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
        onPress={() => router.push("/chat")}
      >
        <Ionicons name="chatbubbles" size={26} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

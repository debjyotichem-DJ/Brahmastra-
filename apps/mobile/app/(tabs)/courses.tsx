import React from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../src/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function CoursesScreen() {
  const router = useRouter();
  
  const { data: subjects, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["mobile-subjects"],
    queryFn: async () => {
      const { data } = await api.get("/courses/subjects");
      return data.data;
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F0F4F8]" edges={['top']}>
      <View className="p-4 border-b border-[#D0DEDC] bg-[#F0F4F8]">
        <Text className="text-2xl font-bold text-[#2D3142]">Subjects</Text>
      </View>
      
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {isLoading ? (
          <View className="py-10 items-center">
            <Text className="text-[#4ECDC4]">Loading subjects...</Text>
          </View>
        ) : (
          subjects?.map((subject: any) => (
            <TouchableOpacity 
              key={subject.id} 
              className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
              onPress={() => router.push(`/course/${subject.id}`)}
            >
              <View className="h-24 bg-[#4ECDC4] justify-center px-6">
                <Text className="text-2xl font-bold text-white">{subject.name}</Text>
              </View>
              <View className="p-5 flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="book" size={16} color="#4ECDC4" />
                  <Text className="ml-2 font-medium text-[#2D3142]">{subject.chapterCount} Chapters</Text>
                </View>
                <Ionicons name="chevron-forward-circle" size={24} color="#4ECDC4" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../src/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["mobile-subject-detail", id],
    queryFn: async () => {
      const { data } = await api.get(`/courses/subjects/${id}/chapters`);
      return data.data; // { subject, chapters }
    }
  });

  const { subject, chapters } = data || {};

  return (
    <SafeAreaView className="flex-1 bg-[#F0F4F8]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-[#D0DEDC] bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Ionicons name="arrow-back" size={24} color="#2D3142" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#2D3142]">{subject?.name || "Loading..."}</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {isLoading ? (
          <Text className="text-center text-[#5C6480] mt-10">Loading chapters...</Text>
        ) : (
          chapters?.map((chapter: any, index: number) => (
            <TouchableOpacity 
              key={chapter.id} 
              className="bg-white rounded-2xl p-4 shadow-sm mb-3 flex-row items-center"
              // In a real app, this would route to topics
              onPress={() => alert(`Navigating to ${chapter.name} topics...`)}
            >
              <View className="w-10 h-10 bg-[#E8F0EF] rounded-full items-center justify-center mr-4">
                <Text className="font-bold text-[#2D3142]">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-[#2D3142] mb-1">{chapter.name}</Text>
                <Text className="text-xs text-[#5C6480]">{chapter.topicCount} Topics</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D0DEDC" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

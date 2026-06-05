import React from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../src/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TestsScreen() {
  const { data: tests, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["mobile-tests"],
    queryFn: async () => {
      const { data } = await api.get("/tests");
      return data.data;
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F0F4F8]" edges={['top']}>
      <View className="p-4 border-b border-[#D0DEDC] bg-[#F0F4F8]">
        <Text className="text-2xl font-bold text-[#2D3142]">Tests & Mocks</Text>
      </View>
      
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {isLoading ? (
          <View className="py-10 items-center">
            <Text className="text-[#4ECDC4]">Loading tests...</Text>
          </View>
        ) : (
          tests?.map((test: any) => {
            const isAttempted = test.testAttempts && test.testAttempts.length > 0;
            
            return (
              <View key={test.id} className="bg-white rounded-2xl p-5 shadow-sm mb-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="bg-[#E8F0EF] px-2 py-1 rounded text-xs">
                    <Text className="text-[#5C6480] text-xs font-bold uppercase">{test.type}</Text>
                  </View>
                  {isAttempted && (
                    <View className="bg-[#22C55E]/10 px-2 py-1 rounded flex-row items-center">
                      <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
                      <Text className="text-[#22C55E] text-xs font-bold ml-1">Attempted</Text>
                    </View>
                  )}
                </View>
                
                <Text className="text-lg font-bold text-[#2D3142] mb-2">{test.title}</Text>
                
                <View className="flex-row gap-4 mb-4">
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={16} color="#4ECDC4" />
                    <Text className="ml-1 text-sm text-[#5C6480]">{test.duration} mins</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="ribbon" size={16} color="#F5A623" />
                    <Text className="ml-1 text-sm text-[#5C6480]">{test.totalMarks} marks</Text>
                  </View>
                </View>

                {isAttempted ? (
                  <TouchableOpacity className="bg-[#E8F0EF] h-10 rounded-xl items-center justify-center flex-row">
                    <Text className="text-[#4ECDC4] font-bold">View Result</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity className="bg-[#4ECDC4] h-10 rounded-xl items-center justify-center flex-row">
                    <Text className="text-white font-bold">Start Test</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

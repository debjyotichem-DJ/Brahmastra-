import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { api } from "../src/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your D-Chemistry AI tutor. 🧪 Ask me any chemistry question — from basic concepts to JEE/NEET problems!"
    }
  ]);

  const chatMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const { data } = await api.post("/chat/message", {
        message: messageText,
        conversationId,
        context: "academic"
      });
      return data.data;
    },
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages(prev => [
        ...prev,
        { id: data.message.id, role: "assistant", content: data.response }
      ]);
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." }
      ]);
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userMessage }
    ]);
    
    chatMutation.mutate(userMessage);
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, chatMutation.isPending]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    
    return (
      <View className={`flex-row mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-[#4ECDC4]/20 items-center justify-center mr-2">
            <Ionicons name="hardware-chip" size={16} color="#3AAFA9" />
          </View>
        )}
        
        <View 
          className={`max-w-[80%] p-3 rounded-2xl ${
            isUser 
              ? "bg-[#4ECDC4] rounded-tr-sm" 
              : "bg-white border border-[#D0DEDC] rounded-tl-sm shadow-sm"
          }`}
        >
          <Text className={`text-base ${isUser ? "text-white" : "text-[#2D3142]"}`}>
            {item.content}
          </Text>
        </View>

        {isUser && (
          <View className="w-8 h-8 rounded-full bg-[#F5A623]/20 items-center justify-center ml-2">
            <Ionicons name="person" size={16} color="#E09010" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F0F4F8]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-[#D0DEDC] bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="close" size={24} color="#2D3142" />
        </TouchableOpacity>
        <View className="w-8 h-8 rounded-lg bg-[#4ECDC4]/20 items-center justify-center mr-3">
          <Ionicons name="hardware-chip" size={20} color="#3AAFA9" />
        </View>
        <View>
          <Text className="text-lg font-bold text-[#2D3142]">D-Chemistry AI</Text>
          <Text className="text-xs text-[#5C6480]">Your AI Tutor</Text>
        </View>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          ListFooterComponent={() => 
            chatMutation.isPending ? (
              <View className="flex-row justify-start mb-4 items-center">
                <View className="w-8 h-8 rounded-full bg-[#4ECDC4]/20 items-center justify-center mr-2">
                  <Ionicons name="hardware-chip" size={16} color="#3AAFA9" />
                </View>
                <View className="bg-white border border-[#D0DEDC] p-4 rounded-2xl rounded-tl-sm">
                  <ActivityIndicator size="small" color="#4ECDC4" />
                </View>
              </View>
            ) : null
          }
        />

        {/* Input Area */}
        <View className="p-4 bg-white border-t border-[#D0DEDC] flex-row items-end">
          <TextInput
            className="flex-1 min-h-[48px] max-h-[120px] bg-[#F0F4F8] rounded-2xl px-4 py-3 text-[#2D3142] border border-[#D0DEDC]"
            placeholder="Ask me anything..."
            placeholderTextColor="#5C6480"
            multiline
            value={input}
            onChangeText={setInput}
            editable={!chatMutation.isPending}
          />
          <TouchableOpacity 
            className={`w-12 h-12 rounded-full items-center justify-center ml-2 ${
              input.trim() && !chatMutation.isPending ? "bg-[#4ECDC4]" : "bg-[#D0DEDC]"
            }`}
            onPress={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
          >
            <Ionicons name="send" size={20} color="white" className="ml-1" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

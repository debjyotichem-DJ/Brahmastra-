import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../src/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      const { data } = await api.post("/auth/login", { email, password });
      
      if (data.success) {
        const { tokens } = data.data;
        await AsyncStorage.setItem("accessToken", tokens.accessToken);
        await AsyncStorage.setItem("refreshToken", tokens.refreshToken);
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#F0F4F8]"
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo Area */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-2xl bg-[#4ECDC4] items-center justify-center shadow-lg mb-4">
            <Ionicons name="flask" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-[#2D3142]">D-Chemistry</Text>
          <Text className="text-[#5C6480] mt-2">Continue your chemistry journey</Text>
        </View>

        {/* Form Area */}
        <View className="bg-white p-6 rounded-2xl shadow-sm">
          {error ? (
            <View className="bg-[#EF4444]/10 p-3 rounded-lg mb-4">
              <Text className="text-[#EF4444] text-sm text-center">{error}</Text>
            </View>
          ) : null}

          <View className="mb-4">
            <Text className="text-sm font-medium text-[#2D3142] mb-1.5">Email Address</Text>
            <TextInput
              className="h-12 border border-[#D0DEDC] rounded-xl px-4 bg-[#F8FAFC] text-[#2D3142]"
              placeholder="student@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-[#2D3142] mb-1.5">Password</Text>
            <TextInput
              className="h-12 border border-[#D0DEDC] rounded-xl px-4 bg-[#F8FAFC] text-[#2D3142]"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            className="bg-[#4ECDC4] h-12 rounded-xl items-center justify-center flex-row"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity className="mt-4 items-center">
            <Text className="text-[#4ECDC4] font-medium">Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

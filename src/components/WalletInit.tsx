import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { generateKeypair, getPublicKeyFromSecret } from "../services/stellar";
import { createAccount } from "../db/helpers";

interface WalletInitProps {
  onInitialized: () => void;
}

export const WalletInit: React.FC<WalletInitProps> = ({ onInitialized }) => {
  const [secretInput, setSecretInput] = useState("");

  const handleCreateNew = async () => {
    const kp = generateKeypair();
    await createAccount(kp.publicKey(), kp.secret());
    Alert.alert(
      "Wallet Created",
      `IMPORTANT: Write down your secret key:\n\n${kp.secret()}`,
      [{ text: "I've saved it", onPress: onInitialized }]
    );
  };

  const handleImport = async () => {
    const pubKey = getPublicKeyFromSecret(secretInput);
    if (!pubKey) {
      Alert.alert("Error", "Invalid Secret Key");
      return;
    }
    await createAccount(pubKey, secretInput);
    onInitialized();
  };

  return (
    <View className="flex-1 justify-center p-6 bg-slate-900">
      <Text className="text-white text-3xl font-bold mb-2">Welcome to Isla</Text>
      <Text className="text-slate-400 mb-10 text-lg">
        Offline-first mesh payments on Stellar.
      </Text>

      <TouchableOpacity
        onPress={handleCreateNew}
        className="bg-blue-600 p-4 rounded-xl mb-6 items-center shadow-lg shadow-blue-500/20"
      >
        <Text className="text-white font-bold text-lg">Create New Wallet</Text>
      </TouchableOpacity>

      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-[1px] bg-slate-700" />
        <Text className="text-slate-500 mx-4">OR</Text>
        <View className="flex-1 h-[1px] bg-slate-700" />
      </View>

      <View className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4">
        <Text className="text-slate-400 text-xs mb-2 uppercase font-bold">
          Import Secret Key
        </Text>
        <TextInput
          value={secretInput}
          onChangeText={setSecretInput}
          placeholder="S..."
          placeholderTextColor="#475569"
          className="text-white text-base"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        onPress={handleImport}
        disabled={!secretInput.startsWith("S") || secretInput.length < 56}
        className={`p-4 rounded-xl items-center ${
          secretInput.length >= 56 ? "bg-slate-700" : "bg-slate-800 opacity-50"
        }`}
      >
        <Text className="text-white font-semibold">Import Existing Wallet</Text>
      </TouchableOpacity>
    </View>
  );
};

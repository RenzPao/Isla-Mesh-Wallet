import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { createOfflinePaymentXDR } from "../services/stellar";
import { startBroadcastingXDR, stopBroadcasting } from "../services/ble";
import Account from "../db/models/Account";

interface SendScreenProps {
  account: Account;
  onBack: () => void;
}

export const SendScreen: React.FC<SendScreenProps> = ({ account, onBack }) => {
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!amount || !receiver) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Construct and Sign XDR
      // In a real app, we'd fetch the correct sequence number from Horizon when online,
      // and increment it locally when offline.
      const sequence = (BigInt(account.lastSequence) + 1n).toString();
      const xdr = await createOfflinePaymentXDR(
        account.encryptedSecret,
        receiver,
        amount,
        sequence
      );

      // 2. Start BLE Broadcast
      await startBroadcastingXDR(xdr);
      setIsBroadcasting(true);
      
    } catch (e) {
      Alert.alert("Error", "Failed to generate transaction");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    await stopBroadcasting();
    setIsBroadcasting(false);
    onBack();
  };

  if (isBroadcasting) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-slate-900">
        <View className="w-40 h-40 bg-blue-500/20 rounded-full items-center justify-center mb-10">
            <View className="w-20 h-20 bg-blue-500 rounded-full animate-pulse shadow-2xl shadow-blue-500" />
        </View>
        <Text className="text-white text-2xl font-bold mb-2 text-center">Broadcasting Payment</Text>
        <Text className="text-slate-400 text-center mb-10">
            Keep this screen open near the merchant's device to complete the transfer.
        </Text>
        <Text className="text-blue-400 font-mono mb-10">${amount} USDC</Text>
        <TouchableOpacity 
            onPress={handleCancel}
            className="bg-slate-800 px-8 py-4 rounded-xl border border-slate-700"
        >
            <Text className="text-white font-bold">Cancel Broadcast</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-6 bg-slate-900">
      <TouchableOpacity onPress={onBack} className="mb-6">
        <Text className="text-blue-400 font-bold">← Back to Wallet</Text>
      </TouchableOpacity>

      <Text className="text-white text-3xl font-bold mb-8">Send USDC</Text>

      <View className="bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-6">
        <Text className="text-slate-400 text-xs mb-2 uppercase font-bold">Recipient Address</Text>
        <TextInput
          value={receiver}
          onChangeText={setReceiver}
          placeholder="G..."
          placeholderTextColor="#475569"
          className="text-white text-base"
          autoCapitalize="none"
        />
      </View>

      <View className="bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-10">
        <Text className="text-slate-400 text-xs mb-2 uppercase font-bold">Amount (USDC)</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor="#475569"
          keyboardType="numeric"
          className="text-white text-3xl font-bold"
        />
      </View>

      <TouchableOpacity
        onPress={handleSend}
        disabled={isLoading}
        className="bg-blue-600 p-5 rounded-2xl items-center shadow-xl shadow-blue-500/20"
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-xl">Confirm & Broadcast</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

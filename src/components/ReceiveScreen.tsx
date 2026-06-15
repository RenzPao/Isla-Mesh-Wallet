import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { startScanningForPayments, stopScanning } from "../services/ble";
import { queueReceivedTransaction } from "../db/transactionHelpers";

interface ReceiveScreenProps {
  onBack: () => void;
}

export const ReceiveScreen: React.FC<ReceiveScreenProps> = ({ onBack }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [receivedCount, setReceivedCount] = useState(0);

  const handleXDRReceived = async (xdr: string) => {
    const success = await queueReceivedTransaction(xdr);
    if (success) {
      setReceivedCount((prev) => prev + 1);
      Alert.alert("Success", "New offline payment received and queued for sync!");
    } else {
      Alert.alert("Error", "Received invalid payment data.");
    }
  };

  useEffect(() => {
    startScanningForPayments(handleXDRReceived);
    return () => stopScanning();
  }, []);

  return (
    <View className="flex-1 p-6 bg-slate-900 justify-between">
      <View>
        <TouchableOpacity onPress={onBack} className="mb-6">
          <Text className="text-blue-400 font-bold">← Back to Wallet</Text>
        </TouchableOpacity>

        <Text className="text-white text-3xl font-bold mb-4">Receive Payment</Text>
        <Text className="text-slate-400 mb-10">
          The app is scanning for nearby Isla users broadcasting payments.
        </Text>

        <View className="bg-slate-800 p-10 rounded-3xl border border-slate-700 items-center justify-center mb-10">
          <ActivityIndicator size="large" color="#3b82f6" className="mb-4" />
          <Text className="text-white font-semibold">Scanning for Peers...</Text>
          <Text className="text-slate-500 text-xs mt-2 italic">Bluetooth must be ON</Text>
        </View>

        {receivedCount > 0 && (
          <View className="bg-green-500/10 p-4 rounded-xl border border-green-500/50">
            <Text className="text-green-500 font-bold text-center">
              {receivedCount} Payment(s) Received in this session!
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={onBack}
        className="bg-slate-800 p-5 rounded-2xl items-center border border-slate-700 mb-10"
      >
        <Text className="text-white font-bold text-lg">Stop Scanning</Text>
      </TouchableOpacity>
    </View>
  );
};

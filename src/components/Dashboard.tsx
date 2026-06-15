import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import Account from "../db/models/Account";
import Transaction from "../db/models/Transaction";
import withObservables from "@nozbe/with-observables";
import { database } from "../db";

interface DashboardProps {
  account: Account;
  transactions: Transaction[];
  onSendPress: () => void;
  onReceivePress: () => void;
}

const DashboardView: React.FC<DashboardProps> = ({
  account,
  transactions,
  onSendPress,
  onReceivePress,
}) => {
  const [activeTab, setActiveTab] = useState<"pending" | "settled">("pending");

  const filteredTransactions = transactions.filter((tx) =>
    activeTab === "pending" ? tx.status === "pending_sync" : tx.status === "settled"
  );

  // Helper for Neumorphic styles that works better across platforms
  const getNeuStyle = (type: 'flat' | 'pressed') => {
    if (Platform.OS === 'web') {
      return type === 'flat' 
        ? { boxShadow: '9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff' }
        : { boxShadow: 'inset 9px 9px 16px #a3b1c6, inset -9px -9px 16px #ffffff' };
    }
    // Native shadows are limited, so we use background colors and borders to simulate depth
    return {};
  };

  return (
    <View className="flex-1 bg-[#e0e5ec]">
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Neumorphic Balance Card */}
          <View 
            className="bg-[#e0e5ec] p-8 rounded-[40px] mb-10 items-center justify-center border border-white/20"
            style={getNeuStyle('flat')}
          >
            <Text className="text-[#7e8ba0] text-xs mb-2 uppercase tracking-[3px] font-bold">
              Available USDC
            </Text>
            <Text className="text-[#44475a] text-5xl font-black">
              ${parseFloat(account.lastBalance).toFixed(2)}
            </Text>
          </View>

          {/* Neumorphic Action Buttons */}
          <View className="flex-row gap-6 mb-12">
            <TouchableOpacity
              onPress={onSendPress}
              className="flex-1 bg-[#e0e5ec] p-6 rounded-3xl items-center border border-white/40"
              style={getNeuStyle('flat')}
            >
              <Text className="text-[#44475a] font-bold text-lg">Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onReceivePress}
              className="flex-1 bg-[#e0e5ec] p-6 rounded-3xl items-center border border-white/40"
              style={getNeuStyle('flat')}
            >
              <Text className="text-[#44475a] font-bold text-lg">Receive</Text>
            </TouchableOpacity>
          </View>

          {/* History Viewer Label */}
          <Text className="text-[#44475a] font-black text-2xl mb-6 px-2">History</Text>
          
          {/* Neumorphic Tab Switcher */}
          <View 
            className="flex-row bg-[#e0e5ec] p-2 rounded-2xl mb-8 border border-white/20"
            style={getNeuStyle('pressed')}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("pending")}
              className={`flex-1 p-3 rounded-xl items-center ${
                activeTab === "pending" ? "bg-[#e0e5ec] border border-white/40" : ""
              }`}
              style={activeTab === "pending" ? getNeuStyle('flat') : {}}
            >
              <Text className={`font-bold ${activeTab === "pending" ? "text-[#3b82f6]" : "text-[#a3b1c6]"}`}>
                Mesh
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("settled")}
              className={`flex-1 p-3 rounded-xl items-center ${
                activeTab === "settled" ? "bg-[#e0e5ec] border border-white/40" : ""
              }`}
              style={activeTab === "settled" ? getNeuStyle('flat') : {}}
            >
              <Text className={`font-bold ${activeTab === "settled" ? "text-[#3b82f6]" : "text-[#a3b1c6]"}`}>
                Settled
              </Text>
            </TouchableOpacity>
          </View>

          {/* Neumorphic Transactions List */}
          {filteredTransactions.length === 0 ? (
            <View 
              className="bg-[#e0e5ec] p-12 rounded-3xl border border-white/20 items-center justify-center"
              style={getNeuStyle('pressed')}
            >
              <Text className="text-[#a3b1c6] text-center font-medium italic">
                No activity found
              </Text>
            </View>
          ) : (
            filteredTransactions.map((tx) => (
              <View
                key={tx.id}
                className="bg-[#e0e5ec] p-5 rounded-3xl mb-5 border border-white/20 flex-row justify-between items-center"
                style={getNeuStyle('flat')}
              >
                <View>
                  <Text className="text-[#44475a] font-black text-xl">${tx.amount}</Text>
                  <Text className="text-[#a3b1c6] text-[10px] uppercase font-bold tracking-widest mt-1">
                    {activeTab === "pending" ? "Mesh Sync" : "On-Chain"}
                  </Text>
                </View>
                <View 
                  className="w-12 h-12 rounded-2xl bg-[#e0e5ec] items-center justify-center border border-white/40"
                  style={getNeuStyle('flat')}
                >
                  <Text className="text-blue-500 text-lg">●</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const enhance = withObservables([], () => ({
  transactions: database
    .get<Transaction>("transactions")
    .query()
    .observe(),
}));

export const Dashboard = enhance(DashboardView);

import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
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

  return (
    <View className="flex-1">
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Balance Card */}
          <View className="bg-blue-600 p-8 rounded-3xl mb-8 shadow-xl shadow-blue-500/30">
            <Text className="text-blue-100 text-sm mb-1 uppercase tracking-widest font-bold">
              Available USDC
            </Text>
            <Text className="text-white text-5xl font-black">
              ${parseFloat(account.lastBalance).toFixed(2)}
            </Text>
            <View className="mt-6 pt-6 border-t border-blue-500/50">
              <Text className="text-blue-100 text-[10px] opacity-70">
                {account.publicKey}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity
              onPress={onSendPress}
              className="flex-1 bg-white p-5 rounded-2xl items-center shadow-md"
            >
              <Text className="text-slate-900 font-bold text-lg">Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onReceivePress}
              className="flex-1 bg-slate-800 p-5 rounded-2xl items-center border border-slate-700"
            >
              <Text className="text-white font-bold text-lg">Receive</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction History Tabs */}
          <Text className="text-white font-bold text-xl mb-4 px-2">History Viewer</Text>
          
          <View className="flex-row bg-slate-800 p-1 rounded-xl mb-6">
            <TouchableOpacity
              onPress={() => setActiveTab("pending")}
              className={`flex-1 p-3 rounded-lg items-center ${
                activeTab === "pending" ? "bg-slate-700" : ""
              }`}
            >
              <Text className={`font-bold ${activeTab === "pending" ? "text-white" : "text-slate-500"}`}>
                Pending Sync
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("settled")}
              className={`flex-1 p-3 rounded-lg items-center ${
                activeTab === "settled" ? "bg-slate-700" : ""
              }`}
            >
              <Text className={`font-bold ${activeTab === "settled" ? "text-white" : "text-slate-500"}`}>
                Settled On-Chain
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <View className="bg-slate-800/50 p-10 rounded-2xl border border-dashed border-slate-700 items-center justify-center">
              <Text className="text-slate-500 text-center">
                {activeTab === "pending" 
                  ? "No offline payments waiting to sync" 
                  : "No settled transactions on the ledger"}
              </Text>
            </View>
          ) : (
            filteredTransactions.map((tx) => (
              <View
                key={tx.id}
                className="bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-700 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-white font-bold text-lg">${tx.amount} USDC</Text>
                  <Text className="text-slate-500 text-[10px] uppercase tracking-tighter">
                    {activeTab === "pending" ? "Received Offline" : "Verified on Ledger"}
                  </Text>
                  <Text className="text-slate-600 text-[9px] mt-1">
                    {tx.senderPublicKey.slice(0, 12)}...
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    tx.status === "settled" ? "bg-green-500/20" : "bg-blue-500/10"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold uppercase ${
                      tx.status === "settled" ? "text-green-500" : "text-blue-400"
                    }`}
                  >
                    {tx.status === "pending_sync" ? "LOCAL" : "SETTLED"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Make the Dashboard observable so it updates when transactions change
const enhance = withObservables([], () => ({
  transactions: database
    .get<Transaction>("transactions")
    .query()
    .observe(),
}));

export const Dashboard = enhance(DashboardView);

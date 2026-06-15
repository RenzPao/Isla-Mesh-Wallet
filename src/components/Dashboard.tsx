import React from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList } from "react-native";
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

          {/* Recent Activity Label */}
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-white font-bold text-xl">Merchant Outbox</Text>
            <Text className="text-slate-500 text-xs font-bold uppercase">
              {transactions.length} Pending
            </Text>
          </View>

          {/* Transactions List */}
          {transactions.length === 0 ? (
            <View className="bg-slate-800/50 p-10 rounded-2xl border border-dashed border-slate-700 items-center justify-center">
              <Text className="text-slate-500 text-center">No pending transactions</Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View
                key={tx.id}
                className="bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-700 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-white font-bold text-lg">${tx.amount} USDC</Text>
                  <Text className="text-slate-500 text-[10px] uppercase tracking-tighter">
                    From: {tx.senderPublicKey.slice(0, 8)}...
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    tx.status === "settled" ? "bg-green-500/20" : "bg-slate-700"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold uppercase ${
                      tx.status === "settled" ? "text-green-500" : "text-slate-400"
                    }`}
                  >
                    {tx.status === "pending_sync" ? "Offline Cached" : tx.status}
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

import "./src/utils/polyfills";
import "./src/styles/global.css";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, Switch, SafeAreaView, ActivityIndicator, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useStore } from "./src/store/useStore";
import { getActiveAccount, updateAccountBalance } from "./src/db/helpers";
import Account from "./src/db/models/Account";
import { WalletInit } from "./src/components/WalletInit";
import { Dashboard } from "./src/components/Dashboard";
import { SendScreen } from "./src/components/SendScreen";
import { ReceiveScreen } from "./src/components/ReceiveScreen";
import { syncTransactions } from "./src/services/relay";
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export default function App() {
  const { isOfflineMode, setOfflineMode, isOnline, setIsOnline } = useStore();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"dashboard" | "send" | "receive">(
    "dashboard"
  );

  const checkAccount = async () => {
    setIsLoading(true);
    const activeAccount = await getActiveAccount();
    setAccount(activeAccount);
    setIsLoading(false);
  };

  const fetchOnChainState = async () => {
    if (!account || isOfflineMode || !isOnline) return;

    try {
      const stellarAccount = await server.loadAccount(account.publicKey);
      const usdcBalance = stellarAccount.balances.find(
        (b) => "asset_code" in b && b.asset_code === "USDC"
      );
      
      const balance = usdcBalance ? usdcBalance.balance : "0";
      await updateAccountBalance(account, balance, stellarAccount.sequenceNumber());
      // Refresh local account state
      const updated = await getActiveAccount();
      setAccount(updated);
    } catch (e) {
      console.log("Stellar: Account not funded or not found yet on testnet.");
    }
  };

  useEffect(() => {
    checkAccount();
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOnline && !isOfflineMode) {
      syncTransactions();
      fetchOnChainState();
    }
  }, [isOnline, isOfflineMode]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#e0e5ec] items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!account) {
    return <WalletInit onInitialized={checkAccount} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#e0e5ec]">
      <View className="flex-row justify-between items-center px-6 py-4">
        <Text className="text-[#44475a] text-xl font-black tracking-tight">Isla Mesh</Text>
        <View 
            className="flex-row items-center bg-[#e0e5ec] px-3 py-1 rounded-full border border-white/40"
            style={Platform.OS === 'web' ? { boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' } : {}}
        >
          <Text className="text-[#7e8ba0] mr-2 text-[10px] uppercase font-bold tracking-widest">
            {isOfflineMode ? "Mesh" : "Stellar"}
          </Text>
          <Switch
            value={isOfflineMode}
            onValueChange={setOfflineMode}
            trackColor={{ false: "#a3b1c6", true: "#3b82f6" }}
            thumbColor={isOfflineMode ? "#ffffff" : "#e0e5ec"}
          />
        </View>
      </View>

      {currentView === "dashboard" && (
        <Dashboard
          account={account}
          onSendPress={() => setCurrentView("send")}
          onReceivePress={() => setCurrentView("receive")}
        />
      )}

      {currentView === "send" && (
        <SendScreen account={account} onBack={() => setCurrentView("dashboard")} />
      )}

      {currentView === "receive" && (
        <ReceiveScreen onBack={() => setCurrentView("dashboard")} />
      )}

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

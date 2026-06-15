import "./src/utils/polyfills";
import "./src/styles/global.css";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, Switch, SafeAreaView, ActivityIndicator } from "react-native";
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

  // Sync effect
  useEffect(() => {
    if (isOnline && !isOfflineMode) {
      syncTransactions();
      fetchOnChainState();
    }
  }, [isOnline, isOfflineMode]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!account) {
    return <WalletInit onInitialized={checkAccount} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-row justify-between items-center px-6 py-4">
        <Text className="text-white text-xl font-bold">Isla Mesh</Text>
        <View className="flex-row items-center">
          <Text className="text-slate-400 mr-2 text-[10px] uppercase font-bold">
            {isOfflineMode ? "Mesh Mode" : "Online Mode"}
          </Text>
          <Switch
            value={isOfflineMode}
            onValueChange={setOfflineMode}
            trackColor={{ false: "#334155", true: "#3b82f6" }}
            thumbColor={isOfflineMode ? "#ffffff" : "#cbd5e1"}
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

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

import React, { createContext, useContext, useEffect, useState } from "react";
import { BackpackConnector } from "../lib/BackpackConnector";
import { PublicKey } from "@solana/web3.js";

const RPC_URL = "https://api.devnet.solana.com";

// Define types for the context state
interface WalletContextProps {
  walletAddress: PublicKey | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const useWallet = (): WalletContextProps => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

const WalletProvider: React.FC<{ children: any }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<PublicKey | null>(null);
  const backpackConnector = new BackpackConnector(RPC_URL);

  const connectWallet = async () => {
    const publicKey = await backpackConnector.connect();
    if (publicKey) {
      setWalletAddress(publicKey);
    }
  };

  const disconnectWallet = () => {
    backpackConnector?.disconnect();
    setWalletAddress(null);
  };

  const signTransaction = async (transaction: any) => {
    return backpackConnector.signTransaction(transaction);
  };

  useEffect(() => {
    // Auto-connect if a wallet is already connected
    const backpackWallet = (window as any).backpack;
    if (backpackWallet && backpackWallet.isConnected) {
      backpackWallet.connect({ onlyIfTrusted: true }).then((response: any) => {
        setWalletAddress(new PublicKey(response.publicKey.toString()));
      });
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connectWallet,
        disconnectWallet,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;

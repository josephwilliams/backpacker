import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Connection,
  PublicKey,
  TransactionInstruction,
  Transaction,
  // sendAndConfirmTransaction,
} from "@solana/web3.js";
import { useWallet } from "./WalletContext"; // Import the WalletContext
// import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
// import idl from "../idl/idl.json";
import { sha256 } from "js-sha256"; // You can use this to create the instruction discriminator
import BN from "bn.js";

const counterPDA = new PublicKey(
  // This is hard-coded from Solana Playground.
  "BBEkuy1gtyAV4PDXqd9NJwsL7HDG58Daj1Z5TX7UPFzj"
);
const PROGRAM_ID = new PublicKey(
  "5nibB8ShJiiLS21prznZqdyeBStssBNfiuurgepcMDBw"
);
const RPC_URL = "https://api.devnet.solana.com";

interface SolanaContractContextProps {
  count: number | null;
  incrementCount: (addTree: any) => Promise<void>;
  isIncrementing: boolean;
}

const SolanaContractContext = createContext<
  SolanaContractContextProps | undefined
>(undefined);

export const useSolanaContract = (): SolanaContractContextProps => {
  const context = useContext(SolanaContractContext);
  if (!context) {
    throw new Error(
      "useSolanaContract must be used within a SolanaContractProvider"
    );
  }
  return context;
};

const SolanaContractProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { walletAddress, signTransaction } = useWallet(); // Get the wallet address from WalletContext
  const [count, setCount] = useState<number | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [programId, setProgramId] = useState<PublicKey | null>(null);

  const [isIncrementing, setIsIncrementing] = useState(false);

  // Initialize connection to Solana
  useEffect(() => {
    const conn = new Connection(RPC_URL);
    setConnection(conn);
    setProgramId(PROGRAM_ID);
  }, []);

  // Fetch the current count from the PDA
  const fetchCount = useCallback(async () => {
    if (!connection || !counterPDA) return;

    try {
      // Fetch account info from the counter PDA (not programId)
      const accountInfo = await connection.getAccountInfo(counterPDA);

      if (accountInfo?.data) {
        // Assuming the count is stored in the first 8 bytes as a u64
        const countData = accountInfo.data.subarray(8, 16); // Use subarray instead of slice
        const countValue = new BN(countData, "le");

        setCount(Number(countValue)); // Convert BigInt to number for your state
      }
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  }, [connection]); // Make sure counterPDA is correctly passed as a dependency

  const incrementCount = useCallback(async () => {
    if (!walletAddress) {
      console.error("Wallet not connected");
      return;
    }

    const connection = new Connection(RPC_URL, "confirmed");

    try {
      setIsIncrementing(true);
      // // Derive the counter PDA (Program Derived Address)
      // const [counterPDA] = await PublicKey.findProgramAddress(
      //   [Buffer.from("counter")],
      //   new PublicKey(PROGRAM_ID)
      // );

      // Generate the 8-byte discriminator for the "increment" instruction
      const incrementDiscriminator = sha256("global:increment").slice(0, 16); // First 8 bytes

      // Create the instruction with the discriminator included
      const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: counterPDA,
            isSigner: false,
            isWritable: true,
          },
        ],
        programId: new PublicKey(PROGRAM_ID),
        data: Buffer.concat([Buffer.from(incrementDiscriminator, "hex")]), // Add discriminator
      });

      // Create a new transaction and add the instruction
      const transaction = new Transaction().add(instruction);

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletAddress);

      // Sign the transaction
      const signedTx = await signTransaction(transaction);

      // Send the transaction
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );

      // Confirm the transaction
      const confirmation = await connection.confirmTransaction(signature);

      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      } else {
        console.log("Transaction confirmed");
        // optimistic update, as the updated count isn't immediately fetchable.
        setCount((prevCount) => (prevCount || 0) + 1);
      }

      // You can add logic here to update your UI or fetch the new count
    } catch (error) {
      console.error("Error incrementing count:", error);
    } finally {
      setIsIncrementing(false);
    }
  }, [walletAddress, signTransaction]);

  useEffect(() => {
    fetchCount();
  }, [connection, fetchCount, programId]);

  return (
    <SolanaContractContext.Provider
      value={{ count, incrementCount, isIncrementing }}
    >
      {children}
    </SolanaContractContext.Provider>
  );
};

export default SolanaContractProvider;

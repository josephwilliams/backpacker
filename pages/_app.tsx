import type { AppProps } from "next/app";
import WalletProvider from "@/contexts/WalletContext";
import SolanaContractProvider from "@/contexts/ContractContext";

import "../styles/globals.css";
import { ForestProvider } from "@/contexts/ForestContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <SolanaContractProvider>
        <ForestProvider>
          <Component {...pageProps} />
        </ForestProvider>
      </SolanaContractProvider>
    </WalletProvider>
  );
}

export default MyApp;

import React from "react";
import { useWallet } from "../contexts/WalletContext";
// import Link from "next/link";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

function shortenSolanaAddress(address, startLength = 4, endLength = 4) {
  // Ensure the address is valid and long enough to truncate
  if (address.length <= startLength + endLength) {
    return address;
  }

  // Extract the beginning and end of the address
  const start = address.slice(0, startLength);
  const end = address.slice(-endLength);

  // Combine the start and end with ellipsis in the middle
  return `${start}...${end}`;
}

const WalletButton: React.FC = () => {
  const { walletAddress, connectWallet, disconnectWallet } = useWallet();

  return (
    <div>
      {walletAddress ? (
        <div className="flex gap-3 mt-3 shadow-md bg-[#93a093] text-white rounded-md p-3">
          <p className="text-sm">
            Connected{" "}
            <span className="font-bold">
              {shortenSolanaAddress(walletAddress.toString())}
            </span>
          </p>
          <button className="" onClick={disconnectWallet}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
              />
            </svg>
          </button>
        </div>
      ) : (
        // <button
        //   onClick={connectWallet}
        //   className="shadow-md bg-[#93a093] text-white rounded-md p-3 mt-3 text-sm"
        // >
        //   Connect to Backpack
        // </button>
        <div className="mt-3">
          <DynamicWidget />
        </div>
      )}
      {/* <Link href="https://github.com/josephwilliams/backpacker" target="_blank">
        <div className="flex gap-3 mt-3 shadow-md bg-[#93a093] text-white rounded-md p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
            />
          </svg>
        </div>
      </Link> */}
    </div>
  );
};

export default WalletButton;

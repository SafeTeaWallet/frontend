import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';

// SafeTea Factory ABI (simplified for demo)
export const SAFETEA_FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "address[]", "name": "owners", "type": "address[]" }
    ],
    "name": "createWallet",
    "outputs": [{ "internalType": "address", "name": "walletAddress", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserWallets",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllWallets",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": false, "internalType": "address[]", "name": "owners", "type": "address[]" }
    ],
    "name": "WalletCreated",
    "type": "event"
  }
] as const;

// SafeTea Wallet ABI (simplified for demo)
export const SAFETEA_WALLET_ABI = [
  {
    "inputs": [],
    "name": "getOwners",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getOwnerCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" },
      { "internalType": "bytes", "name": "data", "type": "bytes" },
      { "internalType": "uint256", "name": "_expiry", "type": "uint256" }
    ],
    "name": "submitTransaction",
    "outputs": [{ "internalType": "uint256", "name": "txIndex", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "txIndex", "type": "uint256" }
    ],
    "name": "confirmTransaction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTransactionCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract addresses
export const SAFETEA_FACTORY_ADDRESS = import.meta.env.VITE_SAFETEA_FACTORY_ADDRESS || '0xffffffffffffffffffffffffffffff2';

export function useContracts() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const factoryContract = publicClient && getContract({
    address: SAFETEA_FACTORY_ADDRESS as `0x${string}`,
    abi: SAFETEA_FACTORY_ABI,
    client: publicClient,
  });

  const getWalletContract = (walletAddress: string) => {
    if (!publicClient) return null;
    
    return getContract({
      address: walletAddress as `0x${string}`,
      abi: SAFETEA_WALLET_ABI,
      client: publicClient,
    });
  };

  return {
    factoryContract,
    getWalletContract,
    publicClient,
    walletClient,
    userAddress: address,
  };
}
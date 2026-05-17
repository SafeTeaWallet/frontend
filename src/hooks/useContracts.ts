import {
  useAccount,
  usePublicClient,
  useWalletClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { getContract, parseEther, formatEther, encodeFunctionData } from "viem";
import { useQuery } from "@tanstack/react-query";

// ─── ABIs ────────────────────────────────────────────────────────────────────

export const SAFETEA_FACTORY_ABI = [
  {
    inputs: [{ internalType: "address[]", name: "owners", type: "address[]" }],
    name: "createWallet",
    outputs: [{ internalType: "address", name: "walletAddress", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserWallets",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllWallets",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address[]", name: "newOwners", type: "address[]" }],
    name: "updateWalletOwners",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isSafeTeaWallet",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "wallet", type: "address" },
      { indexed: false, internalType: "address[]", name: "owners", type: "address[]" },
    ],
    name: "WalletCreated",
    type: "event",
  },
] as const;

export const SAFETEA_WALLET_ABI = [
  // ── View ──────────────────────────────────────────────────────────────────
  {
    inputs: [],
    name: "getOwners",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwnerCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMajorityThreshold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTransactionCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwnerProposalCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getTransaction",
    outputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
      { internalType: "bool", name: "executed", type: "bool" },
      { internalType: "bool", name: "canceled", type: "bool" },
      { internalType: "uint256", name: "confirmations", type: "uint256" },
      { internalType: "uint256", name: "rejections", type: "uint256" },
      { internalType: "uint256", name: "expiry", type: "uint256" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getOwnerProposal",
    outputs: [
      { internalType: "address", name: "proposedOwner", type: "address" },
      { internalType: "bool", name: "executed", type: "bool" },
      { internalType: "bool", name: "canceled", type: "bool" },
      { internalType: "uint256", name: "confirmations", type: "uint256" },
      { internalType: "uint256", name: "rejections", type: "uint256" },
      { internalType: "uint256", name: "expiry", type: "uint256" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isOwner",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "txIndex", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "hasConfirmedTransaction",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "txIndex", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "hasRejectedTransaction",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "proposalIndex", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "hasConfirmedOwnerProposal",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "proposalIndex", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "hasRejectedOwnerProposal",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "txIndex", type: "uint256" }],
    name: "isTransactionExpired",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // ── Write ─────────────────────────────────────────────────────────────────
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
      { internalType: "uint256", name: "_expiry", type: "uint256" },
    ],
    name: "submitTransaction",
    outputs: [{ internalType: "uint256", name: "txIndex", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "txIndex", type: "uint256" }],
    name: "confirmTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "txIndex", type: "uint256" }],
    name: "rejectTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "txIndex", type: "uint256" }],
    name: "executeTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "txIndex", type: "uint256" }],
    name: "markTransactionExpired",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newOwner", type: "address" },
      { internalType: "uint8", name: "proposalType", type: "uint8" },
      { internalType: "uint256", name: "_expiry", type: "uint256" },
    ],
    name: "proposeOwner",
    outputs: [{ internalType: "uint256", name: "proposalIndex", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "proposalIndex", type: "uint256" }],
    name: "confirmOwnerProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "proposalIndex", type: "uint256" }],
    name: "rejectOwnerProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "proposalIndex", type: "uint256" }],
    name: "markOwnerProposalExpired",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ERC-20 minimal ABI for token info + balance
export const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ─── Constants ───────────────────────────────────────────────────────────────

export const SAFETEA_FACTORY_ADDRESS =
  (import.meta.env.VITE_SAFETEA_FACTORY_ADDRESS as string) ||
  "0xff214105529499f00bd6e6f099BA471C2338ab82";

// OwnerProposalType enum values matching the contract
export const OwnerProposalType = {
  Add: 0,
  Remove: 1,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SafeWalletData {
  address: string;
  owners: string[];
  threshold: number;
  balance: string;
  transactionCount: number;
  isOwner: boolean;
}

export interface TransactionData {
  index: number;
  to: string;
  value: string;
  data: string;
  executed: boolean;
  canceled: boolean;
  confirmations: number;
  rejections: number;
  expiry: number;
  createdAt: number;
  hasConfirmed?: boolean;
  hasRejected?: boolean;
  nonce?: number;
  submittedBy?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface OwnerProposalData {
  index: number;
  proposedOwner: string;
  executed: boolean;
  canceled: boolean;
  confirmations: number;
  rejections: number;
  expiry: number;
  createdAt: number;
  hasConfirmed?: boolean;
  hasRejected?: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useContracts() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();

  const factoryContract =
    publicClient &&
    getContract({
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

  // ── Read: user wallets ────────────────────────────────────────────────────
  const { data: userWallets, refetch: refetchUserWallets } = useReadContract({
    address: SAFETEA_FACTORY_ADDRESS as `0x${string}`,
    abi: SAFETEA_FACTORY_ABI,
    functionName: "getUserWallets",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // ── Write: create wallet ──────────────────────────────────────────────────
  const createWallet = async (owners: string[]): Promise<`0x${string}`> => {
    if (!writeContractAsync) throw new Error("Wallet not connected");
    return writeContractAsync({
      address: SAFETEA_FACTORY_ADDRESS as `0x${string}`,
      abi: SAFETEA_FACTORY_ABI,
      functionName: "createWallet",
      args: [owners as `0x${string}`[]],
    });
  };

  // ── Read: wallet details ──────────────────────────────────────────────────
  const getWalletDetails = async (
    walletAddress: string
  ): Promise<SafeWalletData | null> => {
    if (!publicClient || !address) return null;
    try {
      const walletContract = getWalletContract(walletAddress);
      if (!walletContract) return null;

      const [owners, threshold, transactionCount, balance, isOwnerResult] =
        await Promise.all([
          walletContract.read.getOwners(),
          walletContract.read.getMajorityThreshold(),
          walletContract.read.getTransactionCount(),
          publicClient.getBalance({ address: walletAddress as `0x${string}` }),
          walletContract.read.isOwner([address]),
        ]);

      return {
        address: walletAddress,
        owners: owners as string[],
        threshold: Number(threshold),
        balance: formatEther(balance),
        transactionCount: Number(transactionCount),
        isOwner: isOwnerResult as boolean,
      };
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      return null;
    }
  };

  // ── Read: transactions ────────────────────────────────────────────────────
  const getWalletTransactions = async (
    walletAddress: string
  ): Promise<TransactionData[]> => {
    if (!publicClient || !address) return [];
    try {
      const walletContract = getWalletContract(walletAddress);
      if (!walletContract) return [];

      const transactionCount = await walletContract.read.getTransactionCount();
      const transactions: TransactionData[] = [];

      for (let i = 0; i < Number(transactionCount); i++) {
        const [to, value, data, executed, canceled, confirmations, rejections, expiry, createdAt] =
          await walletContract.read.getTransaction([BigInt(i)]);

        const [hasConfirmed, hasRejected] = await Promise.all([
          walletContract.read.hasConfirmedTransaction([BigInt(i), address]),
          walletContract.read.hasRejectedTransaction([BigInt(i), address]),
        ]);

        transactions.push({
          index: i,
          to: to as string,
          value: formatEther(value as bigint),
          data: data as string,
          executed: executed as boolean,
          canceled: canceled as boolean,
          confirmations: Number(confirmations),
          rejections: Number(rejections),
          expiry: Number(expiry),
          createdAt: Number(createdAt),
          hasConfirmed: hasConfirmed as boolean,
          hasRejected: hasRejected as boolean,
          nonce: i,
          submittedBy: "0x0000000000000000000000000000000000000000",
          gasLimit: "21000",
          gasPrice: "20 gwei",
        });
      }

      return transactions.reverse();
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };

  // ── Read: owner proposals ─────────────────────────────────────────────────
  const getOwnerProposals = async (
    walletAddress: string
  ): Promise<OwnerProposalData[]> => {
    if (!publicClient || !address) return [];
    try {
      const walletContract = getWalletContract(walletAddress);
      if (!walletContract) return [];

      const count = await walletContract.read.getOwnerProposalCount();
      const proposals: OwnerProposalData[] = [];

      for (let i = 0; i < Number(count); i++) {
        const [proposedOwner, executed, canceled, confirmations, rejections, expiry, createdAt] =
          await walletContract.read.getOwnerProposal([BigInt(i)]);

        const [hasConfirmed, hasRejected] = await Promise.all([
          walletContract.read.hasConfirmedOwnerProposal([BigInt(i), address]),
          walletContract.read.hasRejectedOwnerProposal([BigInt(i), address]),
        ]);

        proposals.push({
          index: i,
          proposedOwner: proposedOwner as string,
          executed: executed as boolean,
          canceled: canceled as boolean,
          confirmations: Number(confirmations),
          rejections: Number(rejections),
          expiry: Number(expiry),
          createdAt: Number(createdAt),
          hasConfirmed: hasConfirmed as boolean,
          hasRejected: hasRejected as boolean,
        });
      }

      return proposals.reverse();
    } catch (error) {
      console.error("Error fetching owner proposals:", error);
      return [];
    }
  };

  // ── Read: token info from chain ───────────────────────────────────────────
  const getTokenInfo = async (tokenAddress: string, walletAddress: string) => {
    if (!publicClient) return null;
    try {
      const tokenContract = getContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        client: publicClient,
      });

      const [name, symbol, decimals, balance] = await Promise.all([
        tokenContract.read.name(),
        tokenContract.read.symbol(),
        tokenContract.read.decimals(),
        tokenContract.read.balanceOf([walletAddress as `0x${string}`]),
      ]);

      return {
        address: tokenAddress,
        name: name as string,
        symbol: symbol as string,
        decimals: Number(decimals),
        balance: (Number(balance) / Math.pow(10, Number(decimals))).toFixed(4),
      };
    } catch (error) {
      console.error("Error fetching token info:", error);
      return null;
    }
  };

  // ── Write: submit transaction ─────────────────────────────────────────────
  const submitTransaction = async (
    walletAddress: string,
    to: string,
    value: string,
    data: string = "0x",
    expiryDays: number = 7
  ): Promise<`0x${string}`> => {
    if (!writeContractAsync) throw new Error("Wallet not connected");
    const expiry = Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;
    return writeContractAsync({
      address: walletAddress as `0x${string}`,
      abi: SAFETEA_WALLET_ABI,
      functionName: "submitTransaction",
      args: [
        to as `0x${string}`,
        parseEther(value),
        data as `0x${string}`,
        BigInt(expiry),
      ],
    });
  };

  // ── Write: submit token transfer ──────────────────────────────────────────
  const submitTokenTransfer = async (
    walletAddress: string,
    tokenAddress: string,
    recipient: string,
    amount: bigint,
    expiryDays: number = 7
  ): Promise<`0x${string}`> => {
    if (!writeContractAsync) throw new Error("Wallet not connected");
    const expiry = Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;

    const transferData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [recipient as `0x${string}`, amount],
    });

    return writeContractAsync({
      address: walletAddress as `0x${string}`,
      abi: SAFETEA_WALLET_ABI,
      functionName: "submitTransaction",
      args: [
        tokenAddress as `0x${string}`,
        BigInt(0),
        transferData,
        BigInt(expiry),
      ],
    });
  };

  // ── Write: confirm transaction ────────────────────────────────────────────
  const confirmTransaction = async (walletAddress: string, txIndex: number): Promise<`0x${string}`> => {
    if (!writeContractAsync) throw new Error("Wallet not connected");
    return writeContractAsync({
      address: walletAddress as `0x${string}`,
      abi: SAFETEA_WALLET_ABI,
      functionName: "confirmTransaction",
      args: [BigInt(txIndex)],
    });
  };

  // ── Write: reject transaction ─────────────────────────────────────────────
  const rejectTransaction = async (walletAddress: string, txIndex: number): Promise<`0x${string}`> => {
    if (!writeContractAsync) throw new Error("Wallet not connected");
    return writeContractAsync({
      address: walletAddress as `0x${string}`,
      abi: SAFETEA_WALLET_ABI,
      functionName: "rejectTransaction",
      args: [BigInt(txIndex)],
    });
  };

  // ── Write: execute transaction ────────────────────────────────────────────
  const executeTransaction = async (walletAddress: string, txIndex: number): Promise<`0x${string}`> => {
    if (!writeContractAsync) throw new Error("Wallet not connected");
    return writeContractAsync({
      address: walletAddress as `0x${string}`,
      abi: SAFETEA_WALLET_ABI,
      functionName: "executeTransaction",
      args: [BigInt(txIndex)],
    });
  };

  // ── Write: propose owner ──────────────────────────────────────────────────
  const proposeOwner = async (
    walletAddress: string,
    ownerAddress: string,
    proposalType: 0 | 1,
    expiryDays: number = 7
  ): Promise<`0x${string}`> => {
    if (!writeContractAsync) throw new Error("Wallet not connected");
    const expiry = Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;
    return writeContractAsync({
      address: walletAddress as `0x${string}`,
      abi: SAFETEA_WALLET_ABI,
      functionName: "proposeOwner",
      args: [ownerAddress as `0x${string}`, proposalType, BigInt(expiry)],
    });
  };

  // ── Write: confirm owner proposal ─────────────────────────────────────────
  const confirmOwnerProposal = async (
    walletAddress: string,
    proposalIndex: number
  ): Promise<`0x${string}`> => {
    if (!writeContractAsync) throw new Error("Wallet not connected");
    return writeContractAsync({
      address: walletAddress as `0x${string}`,
      abi: SAFETEA_WALLET_ABI,
      functionName: "confirmOwnerProposal",
      args: [BigInt(proposalIndex)],
    });
  };

  // ── Write: reject owner proposal ──────────────────────────────────────────
  const rejectOwnerProposal = async (
    walletAddress: string,
    proposalIndex: number
  ): Promise<`0x${string}`> => {
    if (!writeContractAsync) throw new Error("Wallet not connected");
    return writeContractAsync({
      address: walletAddress as `0x${string}`,
      abi: SAFETEA_WALLET_ABI,
      functionName: "rejectOwnerProposal",
      args: [BigInt(proposalIndex)],
    });
  };

  return {
    factoryContract,
    getWalletContract,
    publicClient,
    walletClient,
    userAddress: address,
    userWallets: userWallets as string[] | undefined,
    refetchUserWallets,
    createWallet,
    getWalletDetails,
    getWalletTransactions,
    getOwnerProposals,
    getTokenInfo,
    submitTransaction,
    submitTokenTransfer,
    confirmTransaction,
    rejectTransaction,
    executeTransaction,
    proposeOwner,
    confirmOwnerProposal,
    rejectOwnerProposal,
  };
}

import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { verify } from "@noble/ed25519";

// Initialize Solana connection
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  "confirmed"
);

export interface WalletAuthMessage {
  message: string;
  timestamp: number;
  address: string;
}

/**
 * Generate a message for wallet signature
 */
export function generateAuthMessage(walletAddress: string): WalletAuthMessage {
  const timestamp = Date.now();
  const message = `VYNDER Authentication\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nSign this message to authenticate with VYNDER.`;
  
  return {
    message,
    timestamp,
    address: walletAddress,
  };
}

/**
 * Verify a wallet signature
 */
export async function verifyWalletSignature(
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  try {
    // Verify the public key is valid
    const pubKey = new PublicKey(publicKey);
    
    // Decode the signature
    const signatureBytes = bs58.decode(signature);
    
    // Create message bytes
    const messageBytes = new TextEncoder().encode(message);
    
    // Verify signature using Solana's verification
    // Note: This is a simplified version. In production, you'd want to use
    // a more robust verification method that handles the message format properly
    const isValid = await verifySignature(messageBytes, signatureBytes, pubKey);
    
    return isValid;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Verify signature using Ed25519
 * Solana wallets sign the raw message bytes directly
 */
async function verifySignature(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: PublicKey
): Promise<boolean> {
  try {
    // Convert public key to bytes
    const publicKeyBytes = publicKey.toBytes();
    
    // Solana wallets sign the message directly (no prefix needed for wallet adapter)
    // Verify signature using Ed25519
    const isValid = await verify(signature, message, publicKeyBytes);
    return isValid;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Validate Solana wallet address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}


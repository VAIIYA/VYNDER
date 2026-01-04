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
 * Solana wallets sign messages directly, and we verify using Ed25519
 */
export async function verifyWalletSignature(
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  try {
    // Verify the public key is valid
    const pubKey = new PublicKey(publicKey);
    
    // Decode the signature from base58
    const signatureBytes = bs58.decode(signature);
    
    // Create message bytes from the original message string
    const messageBytes = new TextEncoder().encode(message);
    
    // Verify signature using Ed25519
    // The wallet adapter signs the raw message bytes
    const isValid = await verifySignature(messageBytes, signatureBytes, pubKey);
    
    if (!isValid) {
      console.error("Signature verification failed");
      console.error("Message:", message);
      console.error("Public key:", publicKey);
      console.error("Signature (base58):", signature);
      console.error("Signature length:", signatureBytes.length);
      console.error("Message length:", messageBytes.length);
    }
    
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


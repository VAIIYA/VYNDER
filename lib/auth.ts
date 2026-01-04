// Re-export wallet auth as the main auth
export { walletAuthOptions as authOptions } from "./wallet-auth";
// Re-export generateAuthMessage from solana-auth (client-safe, no MongoDB)
export { generateAuthMessage } from "./solana-auth";





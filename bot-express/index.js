require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// Health check endpoint required by Render
app.get('/health', (req, res) => {
  res.status(200).send('ChamaCircle Bot is running smoothly! 💸');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 ChamaCircle Express Bot listening on port ${PORT}`);
  startAutomation();
});

// Web3 Setup
const CHAMACIRCLE_ADDRESS = "0x7e95a47e10eBC0605b3ce04294a3324670C420Bd";

const CHAMACIRCLE_ABI = [
  "function getAllGroups() view returns (string[])",
  "function groups(string) view returns (string name, address admin, uint256 totalFunds, uint256 minMembers, uint256 maxMembers, uint256 contributionAmount, uint256 cycle, bool isActive, uint256 memberCount, uint256 payoutIndex, uint256 lastCycleStartTime)",
  "function startCycle(string)"
];

async function startAutomation() {
  const rpcUrl = process.env.RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey || privateKey.includes("PASTE_YOUR_WALLET")) {
    console.error("❌ ERROR: Missing PRIVATE_KEY in .env file.");
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(CHAMACIRCLE_ADDRESS, CHAMACIRCLE_ABI, wallet);

  console.log(`🔗 Connected to Avalanche Fuji`);
  console.log(`🤖 Bot Wallet Address: ${wallet.address}`);
  console.log(`⏳ Starting polling engine...`);

  setInterval(async () => {
    try {
      // 1. Fetch EVERY group on the platform
      const allGroupCodes = await contract.getAllGroups();
      
      if (allGroupCodes.length === 0) {
        return; // No groups exist yet
      }

      // 2. Loop through them and check if they need a payout
      for (let code of allGroupCodes) {
        const group = await contract.groups(code);
        
        const totalFunds = group[2]; // totalFunds
        const cycleLength = group[6]; // cycle in minutes
        const isActive = group[7]; // isActive
        const lastCycleStartTime = group[10]; // lastCycleStartTime

        if (isActive && totalFunds > 0n) {
          const currentTime = Math.floor(Date.now() / 1000);
          const unlockTime = Number(lastCycleStartTime) + (Number(cycleLength) * 60);

          if (currentTime >= unlockTime) {
            console.log(`\n🚨 [${code}] Timer hit ZERO! Initiating automatic payout...`);
            try {
              const tx = await contract.startCycle(code);
              console.log(`⏳ Transaction sent! Hash: ${tx.hash}`);
              await tx.wait();
              console.log(`✅ [${code}] Payout successful! Cycle restarted.`);
            } catch (err) {
              console.error(`❌ [${code}] Payout failed:`, err.shortMessage || err.message);
            }
          }
        }
      }
    } catch (error) {
      console.error("Polling Error:", error.shortMessage || error.message);
    }
  }, 10000); // Check every 10 seconds
}

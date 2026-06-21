require('dotenv').config();
const { ethers } = require('ethers');

// Ensure all environment variables are present
const RPC_URL = process.env.RPC_URL;
const RECOVERY_PHRASE = process.env.RECOVERY_PHRASE;
const GROUP_CODE = process.env.GROUP_CODE;

if (!RPC_URL || !RECOVERY_PHRASE || !GROUP_CODE) {
  console.error("❌ Missing environment variables. Please check your .env file.");
  process.exit(1);
}

const CHAINCHAMA_ADDRESS = "0x8D34a06913401f917D7a9f44Ade5dAB5eE807cbE";

// Minimal ABI required for the bot
const CHAINCHAMA_ABI = [
  "function groups(string) view returns (string name, address admin, uint256 contributionAmount, uint256 cycle, uint256 minMembers, uint256 maxMembers, bool isActive, uint256 totalFunds, uint256 payoutIndex)",
  "function startCycle(string _code)"
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = ethers.Wallet.fromPhrase(RECOVERY_PHRASE).connect(provider);
const contract = new ethers.Contract(CHAINCHAMA_ADDRESS, CHAINCHAMA_ABI, wallet);

console.log(`🤖 ChainChama Admin Automation Bot Started!`);
console.log(`👀 Monitoring Group: "${GROUP_CODE}"`);
console.log(`💼 Using Admin Wallet: ${wallet.address}`);
console.log(`--------------------------------------------------`);

let isProcessing = false;

async function checkAndAutomate() {
  if (isProcessing) return;

  try {
    const group = await contract.groups(GROUP_CODE);
    
    // Check if the group exists
    if (group.admin === ethers.ZeroAddress) {
      console.log(`⚠️ Group "${GROUP_CODE}" not found on-chain.`);
      return;
    }

    // Ensure the wallet provided is actually the admin
    if (group.admin.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error(`❌ ERROR: The wallet provided is NOT the admin of group "${GROUP_CODE}".`);
      console.error(`Admin should be: ${group.admin}`);
      process.exit(1);
    }

    const minMembers = Number(group.minMembers);
    const contributionAmount = group.contributionAmount;
    const totalFunds = group.totalFunds;

    // Calculate the expected full pot amount
    const expectedFullPot = contributionAmount * BigInt(minMembers);

    const fundsInAvax = ethers.formatEther(totalFunds);
    const expectedInAvax = ethers.formatEther(expectedFullPot);

    process.stdout.write(`\r⏳ Current Pot: ${fundsInAvax} / ${expectedInAvax} AVAX `);

    // If the pot is fully funded, trigger startCycle automatically!
    if (totalFunds > 0n && totalFunds >= expectedFullPot) {
      isProcessing = true;
      console.log(`\n\n🎉 POT IS FULL! Triggering Automatic Payout...`);
      
      const tx = await contract.startCycle(GROUP_CODE);
      console.log(`🚀 Transaction Sent! Hash: ${tx.hash}`);
      
      console.log(`⌛ Waiting for blockchain confirmation...`);
      await tx.wait();
      
      console.log(`✅ Payout Successfully Executed!`);
      console.log(`--------------------------------------------------`);
      
      isProcessing = false;
    }

  } catch (error) {
    console.error("\n❌ Error fetching data:", error.message);
  }
}

// Poll the blockchain every 10 seconds
setInterval(checkAndAutomate, 10000);

// Run immediately on start
checkAndAutomate();

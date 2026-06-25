# 💸 ChamaCircle
**Community Savings, Secured by Trust on Avalanche.**

ChamaCircle brings the traditional East African rotating savings and credit association (Chama) to the blockchain. It offers transparent, trustless, and fully automated savings groups where members contribute periodically and receive payouts on a rotating schedule.

## 🔗 Live Links
- **Website (Testnet):** [Insert your Vercel link here]
- **Smart Contract (Fuji):** `0x768C862BC834b0f173Ccef435488ab39D30FF8a8`

## 🚀 Features
- **Decentralized Groups:** Create savings circles with defined contribution amounts, minimum members, and cycle durations.
- **Wallet Authentication:** Users authenticate directly with MetaMask or the Core Wallet.
- **Round-Robin Payouts:** Funds are distributed sequentially and fairly to each member when the cycle timer completes.
- **100% Automated Backend:** Built with a custom Node.js bot (hosted on Render) that constantly scans the blockchain and executes payouts automatically the exact second a cycle finishes. No manual triggering required!
- **Real-time UI Sync:** The frontend queries the Avalanche testnet to provide live updates of the total pot and who has successfully paid their contribution.

## 🛠️ Tech Stack
- **Frontend:** Next.js, Tailwind CSS, Ethers.js
- **Backend Automation Bot:** Node.js, Express, Ethers.js
- **Database:** Firebase (Firestore) for member profiles and off-chain metadata
- **Blockchain:** Avalanche Fuji Testnet (Solidity Smart Contracts)

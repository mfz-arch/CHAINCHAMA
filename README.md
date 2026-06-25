# 💸 ChamaCircle

**Community Savings, Secured by Trust on Avalanche. Automated by Web3.**

ChamaCircle brings the traditional East African rotating savings and credit association (Chama) to the blockchain. It offers transparent, trustless, and fully automated savings groups where members contribute periodically and receive payouts on a rotating schedule.

---

## 🌟 System Architecture: The 3 Pillars

ChamaCircle is built on a highly scalable, modern Web3 architecture that consists of three main components working together in perfect harmony:

1. **The Smart Contract (Avalanche Fuji):** Handles all the actual money. It stores the AVAX, tracks who has contributed, manages the round-robin payout logic, and exposes a global `getAllGroups()` function.
2. **The Real-Time Frontend (Next.js + Firebase):** The user interface. Instead of forcing users to wait for slow blockchain reads, we push all non-financial metadata (Names, Group Codes, Pending Join Requests) to a Firebase Firestore database. This allows instant cross-device synchronization.
3. **The 24/7 Automation Bot (Express.js):** A lightweight Node.js server that acts as the "Engine". It constantly polls the Avalanche blockchain, checks the cycle timers of every group in the world, and automatically executes the payout function the exact second a timer hits zero. No human intervention is required.

---

## 🚀 Features

- **Decentralized Groups:** Create savings circles with defined contribution amounts, minimum members, and cycle durations.
- **Wallet Authentication:** Users authenticate directly with MetaMask—no emails or passwords required.
- **Round-Robin Payouts:** Funds are distributed sequentially and fairly to each member when the cycle timer completes.
- **100% Automated Backend:** Built with a custom Express.js bot that constantly scans the blockchain and executes payouts automatically.
- **Real-time UI Sync:** Firebase Firestore ensures that when a new user requests to join a group, the Chairman sees it instantly on their dashboard.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, Tailwind CSS, Ethers.js
- **Backend Automation Bot:** Node.js, Express, Ethers.js, dotenv
- **Database:** Firebase (Firestore) for member profiles and off-chain metadata
- **Blockchain:** Avalanche Fuji Testnet (Solidity Smart Contracts)

---

## 📚 Step-by-Step Setup Instructions

Follow these instructions to run the entire ChamaCircle ecosystem locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) installed (v18+ recommended)
- A MetaMask wallet connected to the **Avalanche Fuji Testnet**
- Testnet AVAX (You can get some from the Avalanche Faucet)

### 1. Clone & Install Dependencies
First, clone the repository and install the frontend dependencies:
```bash
git clone https://github.com/mfz-arch/chamacircle.git chamacircle
cd chamacircle
npm install
```

### 2. Firebase Configuration
To enable the real-time UI synchronization:
1. Create a project on [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database**.
3. Create a file named `.env.local` in the root of the project.
4. Add your Firebase keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

### 3. Smart Contract Deployment
You must deploy the `ChamaCircle.sol` contract to Avalanche Fuji:
1. Open the [Remix IDE](https://remix.ethereum.org/).
2. Create a new file and paste the code from `src/contracts/ChamaCircle.sol`.
3. Compile the contract using the Solidity Compiler.
4. Go to the "Deploy" tab, select **Injected Provider - MetaMask** as the environment.
5. Click **Deploy** and approve the transaction.
6. Copy the deployed contract address.
7. Open `src/lib/contract.ts` and paste your new address at the top:
   `export const CHAMACIRCLE_ADDRESS = "YOUR_ADDRESS_HERE";`

### 4. Run the Next.js Frontend
Start the local development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser. You can now create groups, connect your wallet, and test the UI!

### 5. Run the Express Automation Bot
To make the payouts happen automatically, you must start the backend bot:
1. Open a new terminal tab.
2. Navigate to the bot directory:
```bash
cd bot-express
npm install
```
3. Create a `.env` file inside the `bot-express` folder:
```env
PRIVATE_KEY=your-metamask-private-key-here
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PORT=3001
```
4. Open `bot-express/index.js` and update `CHAMACIRCLE_ADDRESS` on line 20 with your new contract address.
5. Start the bot:
```bash
npm start
```
You should see `🚀 ChamaCircle Express Bot listening on port 3001` and `🔗 Connected to Avalanche Fuji` in your terminal.

---

## 🔗 Hackathon Links

- **Website (Testnet):** [https://chamacircle.vercel.app/](https://chamacircle.vercel.app/)
- **Smart Contract (Fuji):** [Snowtrace (0x768C862BC834b0f173Ccef435488ab39D30FF8a8)](https://testnet.snowtrace.io/address/0x768C862BC834b0f173Ccef435488ab39D30FF8a8)
- **Automation Bot:** [https://chamacircle-bot.onrender.com](https://chamacircle-bot.onrender.com)

**Built with ❤️ for the Global Web3 Hackathon**

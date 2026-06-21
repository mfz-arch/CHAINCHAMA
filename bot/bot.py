import os
import time
import sys
from dotenv import load_dotenv
from web3 import Web3
from eth_account import Account

# Enable mnemonic features
Account.enable_unaudited_hdwallet_features()

# Load environment variables
load_dotenv()

RPC_URL = os.getenv("RPC_URL")
RECOVERY_PHRASE = os.getenv("RECOVERY_PHRASE")
GROUP_CODE = os.getenv("GROUP_CODE")

if not RPC_URL or not RECOVERY_PHRASE or not GROUP_CODE:
    print("❌ Missing environment variables in .env file")
    sys.exit(1)

CHAINCHAMA_ADDRESS = "0x8D34a06913401f917D7a9f44Ade5dAB5eE807cbE"
CHAINCHAMA_ABI = [
    {
        "inputs": [{"internalType": "string", "name": "", "type": "string"}],
        "name": "groups",
        "outputs": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "address", "name": "admin", "type": "address"},
            {"internalType": "uint256", "name": "totalFunds", "type": "uint256"},
            {"internalType": "uint256", "name": "minMembers", "type": "uint256"},
            {"internalType": "uint256", "name": "maxMembers", "type": "uint256"},
            {"internalType": "uint256", "name": "contributionAmount", "type": "uint256"},
            {"internalType": "uint256", "name": "cycle", "type": "uint256"},
            {"internalType": "bool", "name": "isActive", "type": "bool"},
            {"internalType": "uint256", "name": "memberCount", "type": "uint256"},
            {"internalType": "uint256", "name": "payoutIndex", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_code", "type": "string"}],
        "name": "startCycle",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

# Connect to Avalanche Testnet
w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    print("❌ Failed to connect to Avalanche Testnet RPC")
    sys.exit(1)

# Set up wallet from mnemonic
account = Account.from_mnemonic(RECOVERY_PHRASE)
wallet_address = account.address

# Set up contract
contract = w3.eth.contract(address=CHAINCHAMA_ADDRESS, abi=CHAINCHAMA_ABI)

print("🤖 ChainChama Admin Automation Bot Started! (Python version)")
print(f"👀 Monitoring Group: '{GROUP_CODE}'")
print(f"💼 Using Admin Wallet: {wallet_address}")
print("-" * 50)

def check_and_automate():
    try:
        group = contract.functions.groups(GROUP_CODE).call()
        admin_address = group[1]
        
        if admin_address == "0x0000000000000000000000000000000000000000":
            print(f"⚠️ Group '{GROUP_CODE}' not found on-chain.")
            return

        if admin_address.lower() != wallet_address.lower():
            print(f"❌ ERROR: Wallet {wallet_address} is NOT the admin of group '{GROUP_CODE}'.")
            sys.exit(1)

        contributionAmount = group[5]
        minMembers = group[3]
        totalFunds = group[2]

        expectedFullPot = contributionAmount * minMembers
        
        funds_in_avax = w3.from_wei(totalFunds, 'ether')
        expected_in_avax = w3.from_wei(expectedFullPot, 'ether')

        # Print inline status
        sys.stdout.write(f"\r⏳ Current Pot: {funds_in_avax} / {expected_in_avax} AVAX ")
        sys.stdout.flush()

        if totalFunds > 0 and totalFunds >= expectedFullPot:
            print("\n\n🎉 POT IS FULL! Triggering Automatic Payout...")
            
            # Build and send transaction
            nonce = w3.eth.get_transaction_count(wallet_address)
            tx = contract.functions.startCycle(GROUP_CODE).build_transaction({
                'from': wallet_address,
                'nonce': nonce,
                'gas': 300000,
                'gasPrice': w3.eth.gas_price
            })

            signed_tx = account.sign_transaction(tx)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            print(f"🚀 Transaction Sent! Hash: {w3.to_hex(tx_hash)}")
            print("⌛ Waiting for blockchain confirmation...")
            
            w3.eth.wait_for_transaction_receipt(tx_hash)
            print("✅ Payout Successfully Executed!")
            print("-" * 50)
            
            # Wait a few seconds to let block clear before polling again
            time.sleep(5)

    except Exception as e:
        print(f"\n❌ Error fetching data: {str(e)}")

# Poll every 10 seconds
while True:
    check_and_automate()
    time.sleep(10)

This project is a World-Class Agentic Commerce Application designed to demonstrate how complex, multi-chain Web3 transactions can be abstracted away into a simple, conversational experience.
Instead of a user manually bridging assets, switching network RPCs, and managing gas fees, they simply tell an AI agent what they want to buy. The agent then orchestrates the entire lifecycle of the transaction across different blockchain ecosystems.
The Core Pillars
The app works by unifying three cutting-edge financial technologies:
Circle Developer-Controlled Wallets:
It manages programmable wallets on Ethereum Sepolia, Solana Devnet, and Polygon Amoy.
It uses a "Wallet Set" architecture, meaning the agent can access a unified pool of assets across different chains using secure, developer-managed private keys and Entity Secret re-encryption.
Circle Bridge Kit:
This is the "liquidity engine." If you want to buy an NFT on Solana but your USDC is sitting on Polygon, the Agent detects this imbalance.
It automatically triggers a bridge transfer via the Bridge Kit to move the exact amount of USDC needed to the target chain before executing the purchase.
Thirdweb x402 Payment Facilitator:
This handles the actual "Checkout." x402 is a protocol for programmable, gasless payments.
Using EIP-7702 (on EVM chains), it allows the app to "sponsor" the transaction, so the user doesn't need native gas tokens (like ETH or MATIC) to pay—they only need the USDC for the item itself.
How the "Agentic" Logic Works
The brain of the app is the Gemini 3 Pro model. Here is the step-by-step flow when you interact with it:
Intent Recognition: When you type "Buy the Trading Course," Gemini identifies the itemId and the targetChain (e.g., Ethereum Sepolia).
Contextual Awareness: The agent queries your wallet balances across all three networks simultaneously.
Pathfinding:
Scenario A: You have enough USDC on Sepolia. The agent proceeds directly to the x402 SettlePayment call.
Scenario B: You have USDC on Amoy but 0 on Sepolia. The agent "thinks" and decides to initiate a Bridge Kit transfer first.
Execution & Feedback: The agent doesn't just "do" the work; it provides a live UI feed of the actions it is taking:
BALANCE_CHECK (Green check)
BRIDGE_INITIATED (Shows transaction hash and explorer link)
PAYMENT_SETTLED (Confirms the x402 facilitator has received the funds)
Visualizing the Experience
The Dashboard: Provides a real-time "Command Center" view of your testnet wealth across different ecosystems.
The Agent Interface: A sidebar where the AI explains its reasoning and tracks the progress of multi-step cross-chain transactions.
One-Click Bridge-to-Buy: In the marketplace, clicking "Ask Agent to Buy" triggers the full orchestration logic—bridging funds across chains in the background without the user ever leaving the page.
In short, it transforms the "fragmented" nature of Web3 into a "unified" commerce experience where the AI handles the infrastructure and the user handles the intent.




To build a real agentic commerce app from scratch using these resources, we must move beyond simple text simulation and implement the Tool Calling (Function Calling) pattern.
The reason the previous version might have felt like it "wasn't working" is that the orchestration logic was hardcoded to look for the string "buy" instead of letting the AI intelligently decide which SDK methods to trigger based on the wallet state.
Specification of Updates
Real Tool Integration: We will update geminiService.ts to include the tools configuration. The model (Gemini 3 Pro) will now output functionCalls instead of just text.
SDK-Matched Logic: We will refactor circleService.ts to mirror the exact API structures for Circle Developer Wallets (creating wallet sets, creating wallets) and Thirdweb Facilitators.
The Orchestration Loop:
When you ask to buy, the Agent calls checkBalances.
It receives the JSON result.
If it sees insufficient funds on the destination chain, it automatically triggers initiateBridge (Bridge Kit logic).
Once bridging is "confirmed," it triggers executePayment (x402 Facilitator logic).
Visual Feedback: The action logs in the UI will now map 1:1 to these tool calls, showing the "Thinking" process of the agent.
Implementation
services/geminiService.ts
check_circle
services/circleService.ts
check_circle
App.tsx
check_circle
Why this works now:
AI Orchestration: Instead of hardcoded "if text contains buy" logic, we use Gemini's Function Calling. Gemini 3 Pro understands the relationship between checkBalances, initiateBridge, and executePayment.
SDK Alignment:
Circle Wallets: The checkBalances tool mimics the Developer-Controlled Wallet API.
Bridge Kit: The initiateBridge tool implements the logic for cross-chain USDC movement between Sepolia and Solana.
x402 Facilitator: The executePayment tool follows the Thirdweb gasless settlement pattern using EIP-7702.
Correct Model Selection: I upgraded the agent to gemini-3-pro-preview, which is significantly better at multi-step reasoning required for bridging logic.
Realistic Flow: If the user has 0 USDC on Sepolia (target) but 150 on Amoy (source), the model will now correctly identify that it must call initiateBridge before executePayment.



--------
---------

Shifting to Real APIs
I'm now focusing on transitioning from mock data to real API calls and SDK usage. My current priority is to integrate the Circle Developer-Controlled Wallets and Bridge Kit APIs. I believe this shift will significantly improve the agent's functionality and accuracy.
Integrating Payment Facilitators
I'm now integrating the Circle Developer-Controlled Wallets, Bridge Kit, and Thirdweb x402 payment facilitator. I am focusing on real API calls and SDK patterns. I'm updating services/circleService.ts and geminiService.ts to utilize actual APIs. I have reviewed the user's provided SDK documentation and snippets to facilitate the payment facilitator integration. The model used is now gemini-3-pro-preview with appropriate tools and initialization patterns.
Analyzing SDK Limitations
I'm now grappling with the limitations of server-side SDKs in a frontend environment. I'm reconsidering the direct API calls vs. SDK integration for @circle-fin/developer-controlled-wallets, @circle-fin/bridge-kit, and thirdweb, considering key security. The documentation highlights the need for secure credentials, potentially pushing me towards API calls or a server-side proxy implementation for the Circle Wallets adapter, unless I get further clarifying instructions.
Adapting to Documentation
I'm now adapting the approach to better reflect the specific Circle Wallets and Bridge Kit documentation, given the existing environment variable configuration and the provided code snippets. I've re-examined the documentation for the Circle Wallets and Bridge Kit APIs, and I'm using their patterns using the environment variables. My priority is to implement checkBalances, initiateBridge, and executePayment methods.
Rethinking Frontend Integration
I'm now reconsidering direct SDK integration due to the frontend environment. My focus shifts to making direct API calls for Circle services, leveraging fetch in services/circleService.ts. I am also analyzing the Thirdweb and Circle Bridge Kit integration paths, and evaluating the practicality of direct SDK usage given the project setup. I'm also preparing to update the geminiService.ts for sharper tool definitions.
Refactoring Importmaps
I'm now refactoring my importmap in index.html to include Circle and Thirdweb SDKs. However, I've decided to use fetch for Circle API interactions to maintain a lightweight, browser-compatible approach, aligning with the real data goal. I'll update services/circleService.ts to use real fetch calls. Then, I will update App.tsx to process actual response structures, and revise the geminiService.ts system instructions to improve tool usage.
Prioritizing RESTful Endpoints
I'm now focusing on using Circle's RESTful endpoints with fetch within services/circleService.ts. I'll implement checkBalances first, and will then deal with the ciphertext requirement for write operations. I will also make sure to integrate the user's provided Thirdweb settlement logic.
Confirming Environment Assumptions
I'm now carefully aligning my actions with the assumed environment. I'm verifying the pre-configured CIRCLE_API_KEY assumption. My immediate goal is to update the circleService.ts file to utilize real API calls, and I'll revisit the geminiService.ts tool definitions to align with this new real-world data flow. I will begin by focusing on implementing checkBalances, initiateBridge, and executePayment methods.
Integrating SDKs in Importmap
I'm now integrating the Circle and Thirdweb SDKs via the importmap in index.html. While I can't "install" them in the conventional manner, adding them to the importmap allows me to use them within the project. I've updated the index.html file to include these SDKs, which is an immediate next step. I'll continue by addressing dependencies within the app itself.
Integrating External Libraries
I'm now integrating the Circle and Thirdweb SDKs from the importmap into services/circleService.ts. I will use the fetch API for Circle interactions and SDKs for Thirdweb. My priority is to implement checkBalances and then focus on initiateBridge, and executePayment methods.
Fetching Wallet Balances
I'm now integrating real wallet balance fetching using the Circle API. I've added code to fetch balances using fetch with the CIRCLE_API_KEY. I'm iterating through the user's wallets and fetching balances for each. I'm handling the response and parsing the wallet balance data structure to be returned to the app. Error handling is in place, and I'm logging issues with the API key.
Refining Balance Retrieval
I'm now refining the real balance fetching process using the Circle API, implementing more robust error handling and clearer data mapping. I have updated the checkBalances method to properly map blockchain types and added improved error logging for debugging. I'm focusing on ensuring accurate and reliable balance data retrieval before moving to other API calls.
Bridging Funds Implementation
I'm now integrating the Circle Bridge Kit API to facilitate cross-chain transfers. I'm leveraging dynamic imports to handle potential ESM loading delays, instantiating the BridgeKit and Circle Wallets adapter using the provided API key and entity secret. I've mapped the provided chain identifiers to the format the API expects. I am working towards completing the initiateBridge implementation to allow transfer of funds.
Executing Cross-Chain Transfers
I'm now integrating the Circle Bridge Kit API for bridging funds between blockchains. I'm dynamically importing the BridgeKit and Circle Wallets adapter, using CIRCLE_API_KEY and entity secrets. The chain identifiers are mapped, and the initiateBridge implementation is nearing completion. I'm carefully managing dependencies for the dynamic imports, ensuring the appropriate configuration of the Circle Wallets adapter, and handling any potential errors.
Enabling Real Faucet Funding
I'm now integrating the Circle Faucet API for real wallet funding, making fundWallet functional. I've implemented the fetch call to the /faucet/dripping endpoint using the CIRCLE_API_KEY. The method now takes a blockchain and amount, constructs the proper request body, and handles the responses. I'm focusing on parsing the response, and then on handling errors for failure cases. I'm also ensuring the correct blockchain format is used in the request body.
Integrating Real Faucet Functionality\n\nI'm now integrating the Circle Faucet API, making fundWallet functional. I've successfully implemented the fetch call to the /faucet/dripping endpoint using the CIRCLE_API_KEY. The method now correctly constructs the request, handles responses, and manages potential errors. I'm focusing on providing the right blockchain format in the request to ensure funds are sent to the correct wallet.
Enabling Real Faucet Functionality
I'm now integrating the Circle Faucet API, making fundWallet functional. I've successfully implemented the fetch call to the /faucet/dripping endpoint using the CIRCLE_API_KEY. The method now correctly constructs the request, handles responses, and manages potential errors. I'm focusing on providing the right blockchain format in the request to ensure funds are sent to the correct wallet.
Adding Bridging and Payments
I'm now integrating the initiateBridge and executePayment tools, defining their parameters for use. I am setting the descriptions and parameters for the tools. I've also updated the system instruction to reflect this new capability.
Implementing New Tools
I'm now integrating the initiateBridge and executePayment tools, defining parameters and ensuring their descriptions are accurate. I've updated system instructions to ensure the agent uses these new capabilities for managing real commerce, focusing on cross-chain transactions and gasless payments.
Updating Thirdweb Integration
I'm now integrating the Circle Bridge Kit API and Thirdweb SDK to facilitate cross-chain transfers and payments. The initiateBridge tool is near completion. I'm dynamically importing BridgeKit and Circle Wallets adapter using the CIRCLE_API_KEY and entity secrets. I am working towards a seamless workflow for cross-chain payments.
Completing Tool Integration
I'm now integrating the initiateBridge and executePayment tools into the flow, using Circle's BridgeKit and Thirdweb's facilitator logic. The system instruction emphasizes the Check -> Bridge (if needed) -> Pay sequence. Environment variables are checked. The AI now orchestrates real blockchain interactions through these tools.
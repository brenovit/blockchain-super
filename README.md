# blockchain-super
Blockchain simulatior with multiple nodes running on container(docker) using P2P network for communication.

# Repo

The repository contains:

- the blockchain service (blockchained)
- the web admin for the chain (frontend)

# Technologies & Stack
- Backend (Blockchain & P2P)
  - TypeScript (Node.js)
  - WebSockets (e.g., ws package) or LibP2P
  - Redis (optional)
- Frontend
  - SvelteKit
  - Bootstrap
  - WebSockets for real-time updates

# Execution

Go to blockchained folder and run 
```
npm install
```

Then run

```
npm start
```

# Plan

1. Core Blockchain

    - **Blocks**: Contain transactions, a timestamp, and a hash.
    - **Mining**: A proof-of-work (PoW) mechanism.
    - **Transactions**: Users can create and broadcast transactions.
    - **Consensus**: Ensure all nodes agree on the chain.

2. P2P Network
   - Use **WebSockets** (or LibP2P) to communicate between nodes.
   - Nodes should be able to:
     - Discover and connect to peers.
     - Sync the blockchain with other nodes.
     - Broadcast new transactions and blocks.

3. Local Nodes
   - Each node will run a simple blockchain instance.
   - Nodes should store the blockchain in memory or a lightweight database (e.g., LevelDB or lowdb).

4. Frontend (SvelteKit)
   - **Dashboard** to visualize the blockchain.
   - **Send transactions** between users.
   - **Show the current network state** (connected nodes, chain status).

# Inpiration

This project was inpired by the projects [blockchain-demo](https://github.com/anders94/blockchain-demo) and [public-private-key-demo](https://github.com/anders94/public-private-key-demo) from [Anders Brownworth](https://andersbrownworth.com/)
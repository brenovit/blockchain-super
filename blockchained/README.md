# blockchain-super
Blockchain simulatior with multiple nodes running on container(docker) using P2P network for communication.

# Repo

The repository contains:

- the blockchain service (blockchained)
- 
# Technologies & Stack
- Backend (Blockchain & P2P)
  - TypeScript (Node.js)
  - WebSockets (ws package and libp2p)
  - Redis (optional)

# Execution

Install all dependencies
```
npm install
```

Then start the node on default port 5000

```
npm start
```

Or start the node on explicity
```
npm start --port 5002
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
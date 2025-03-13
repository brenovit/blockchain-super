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

Compile the project since it uses ESModule
```
npm run build
```

Then start the node

```
npm start
```

Or start the node on explicity
```
npm start --id 1
```

Or compile and run using

```
npm run dev
```
# Plan

1. Core Blockchain

    - **Blocks**: Contain transactions, a timestamp, and a hash.
    - **Mining**: A proof-of-work (PoW) mechanism.
    - **Transactions**: Users can create and broadcast transactions.
    - **Consensus**: Ensure all nodes agree on the chain.

2. P2P Network
   - Use **WebSockets** and **LibP2P** to communicate between nodes and FE.
   - Nodes should be able to:
     - Discover and connect to peers.
     - Sync the blockchain with other nodes.
     - Broadcast new transactions and blocks.
     - Elect a master and slave node
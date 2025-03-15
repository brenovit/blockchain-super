# blockchain-super
Blockchain simulatior with multiple nodes running on container(docker) using P2P network for communication.

# Repo

This repository contains the blockchain service (blockchained) with the websocket client to be used in the FE.
  
# Technologies & Stack
- Backend (Blockchain & P2P)
- TypeScript (Node.js)
- WebSocket/libp2p (Client)
- libp2p (Server)

# Set Up

Install all dependencies
```
npm install
```

Compile the project since
```
npm run build
```
## Execution

### Server

To start the server node with default id 1

```
npm start
```

Or start the server with choosen id
```
npm start --id 1
```

To compile the code and start the server
```
node run server
```
### Client

To compile the code and start the WebSocket client
```
node run client
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
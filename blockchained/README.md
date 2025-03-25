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

Compile the project
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
npm start --id 2
```

To compile the code and start the server (default id 1)
```
node run server
```

To ensure the network is working is important to have more than 1 server running.

### Client

To compile the code and start the WebSocket client
```
node run client
```

# Plan

1. Core Blockchain

    - **Blocks**: The entity saved in the blockchain. It contains:
      -  Index: the index of the block in the chain (order)
      -  Data: the data the block holds
      -  Timestamp: when the block was created
      -  Nonce: the hash resolution
      -  Previous hash: The hash of previous block
      -  Hash: the hex output using SHA256 of the index + data + timestamp + nonce + previous hash
    - **Mining**: A proof-of-work (PoW) mechanism. (no reward yet)
    - **Consensus**: Ensure all nodes agree on the chain.
    - **Transactions**: Users can create and broadcast transactions.    

2. P2P Network
   - Use **WebSockets** and **LibP2P** to communicate between nodes and FE.
   - There are 2 types of Nodes:
     - Server node:
       - Uses only pubsub with gossip protocol to communicate
       - Discover and connect to peers.
       - Sync the blockchain with other nodes.
       - Broadcast new blocks.
       - Elect a master node.
       - Mine and vote for the block.
       - Connects to all topics availables
     - Client node:
       - Has pubsub + gossip and websocket
       - Broadcast info from servers to/from websocket
       - Connected to blockchain topic
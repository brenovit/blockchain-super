import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { yamux } from "@chainsafe/libp2p-yamux";
import { Logger } from "../../utils/logger.js";
import { identify } from "@libp2p/identify";
import { mdns } from "@libp2p/mdns";
import { NodeEvent, NodeMessage } from "../node-event.js";
import crypto from "crypto";
import { TopicName } from "./p2p-topic.js";
import { checkIfMasterNodeDisconnected } from "./election-flow.js";

type MessageId = string | null;

const receivedEventIds = new Set<MessageId>(); // ✅ Track processed messages

const node = await createLibp2p({
  addresses: {
    listen: ["/ip4/127.0.0.1/tcp/0/ws"], // Listen on a random available port
  },
  transports: [webSockets()],
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()],
  peerDiscovery: [mdns()],
  services: {
    pubsub: gossipsub(),
    indentify: identify(),
  },
});

await node.start();

export const MY_ID = node.peerId.toString();
Logger.info(`🚀 libp2p Node started: ${MY_ID}`);

node.addEventListener("peer:discovery", (event) => {
  Logger.info(`🔍 Discovered new peer: ${event.detail.id}`);
  peerDiscovery(event.detail.id);
});

async function peerDiscovery(peerId: any) {
  //totalPeers += 1;
  await node
    .dial(peerId)
    .catch((err) => Logger.error(`❌ Failed to connect to peer: ${err}`));
}

node.addEventListener("peer:disconnect", (event) => {
  const peerId = event.detail.toString();
  Logger.info(`❌ Peer disconnected: ${peerId}`);
  //totalPeers -= 1;
  checkIfMasterNodeDisconnected(peerId);
});

//============= START: Publish to node
async function safePublish(
  topic: TopicName,
  message: NodeMessage,
  maxRetries = 1,
  delay = 1000
) {
  const event = generateEventWithId(message);
  if (receivedEventIds.has(event.id)) {
    Logger.trace(`⚠️ Not rebroadcasting duplicate message: ${event.id}`);
    return;
  }

  receivedEventIds.add(event.id);
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const peers = node.services.pubsub.getSubscribers(topic);

    if (peers.length > 0) {
      try {
        Logger.trace(
          `📡 Publishing to topic [${topic}] | ${event.type} : ${event.id} | Attemp: ${attempt}/${maxRetries}`
        );
        return await node.services.pubsub.publish(
          topic,
          new TextEncoder().encode(JSON.stringify(event))
        );
      } catch (error) {
        Logger.error(
          `❌ Error publishing on attemp ${attempt}/${maxRetries}: ${error}`
        );
      }
    } else {
      Logger.warn(
        `⚠️ No peers subscribed to ${topic}. Attemp ${attempt}/${maxRetries}. Retrying in ${
          delay / 1000
        } seconds...`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  Logger.warn(`⛔ Failed to publish to ${topic} after ${maxRetries} attempts.`);
  return Promise.resolve();
}

function generateEventWithId(event: NodeMessage): NodeEvent {
  return {
    id: crypto.createHash("sha1").update(JSON.stringify(event)).digest("hex"),
    data: event.data,
    type: event.type,
  };
}
//============= STOP: Publish to node

function hasEvent(eventId: MessageId) {
  return receivedEventIds.has(eventId);
}

function addEvent(eventId: MessageId) {
  receivedEventIds.add(eventId);
}

//============= START: Node maintanance
// Erase messages id every 15 seconds
setInterval(() => {
  receivedEventIds.clear();
}, 15000);
//============= STOP: Node maintanance

export { node, safePublish, hasEvent, addEvent };

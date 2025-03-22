export type NodeEvent = {
  type: NodeEventType | undefined;
  data?: any;
  id: string | null;
};

export type NodeMessage = {
  type: NodeEventType;
  data?: any;
};

export const EventType = {
  MASTER_ANNOUNCEMENT: "MASTER_ANNOUNCEMENT",
  ELECTION: "ELECTION",
  REQUEST_SYNC_BLOCKCHAIN: "REQUEST_SYNC_BLOCKCHAIN",
  REQUEST_SYNC_BLOCKCHAIN_SERVER: "REQUEST_SYNC_BLOCKCHAIN_SERVER",
  BLOCKCHAIN_UPDATE: "BLOCKCHAIN_UPDATE",
  CREATE_BLOCK: "CREATE_BLOCK",
  ADD_BLOCK: "ADD_BLOCK",
  MINE_BLOCK: "MINE_BLOCK",
  BLOCKCHAIN: "BLOCKCHAIN",
  VOTE_RESPONSE: "VOTE_RESPONSE",
  VOTE_REQUEST: "VOTE_REQUEST",
} as const;

export type NodeEventType = (typeof EventType)[keyof typeof EventType];

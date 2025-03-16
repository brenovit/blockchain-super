export type NodeEvent = {
  type: NodeEventType | undefined;
  data?: any;
  id: string | null;
};

export type NodeMessage = {
  type: NodeEventType | undefined;
  data?: any;
};

export type NodeEventType =
  | "MASTER_ANNOUNCEMENT"
  | "ELECTION"
  | "REQUEST_SYNC_BLOCKCHAIN"
  | "BLOCKCHAIN_UPDATE"
  | "CREATE_BLOCK"
  | "ADD_BLOCK"
  | "MINE_BLOCK"
  | "BLOCKCHAIN";

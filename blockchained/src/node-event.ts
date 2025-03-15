export type NodeEvent = {
  type: NodeEventType | undefined;
  data?: any;
};

export type NodeEventType =
  | "REQUEST_SYNC_BLOCKCHAIN"
  | "MASTER_ANNOUNCEMENT"
  | "ADD_BLOCK"
  | "ELECTION"
  | "BLOCKCHAIN"
  | "CREATE_BLOCK"
  | "MINE_BLOCK";

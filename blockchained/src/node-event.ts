export type NodeEvent = {
  type: NodeEventType | undefined;
  data: any;
};

export type NodeEventType =
  | "MASTER_ANNOUNCEMENT"
  | "ADD_BLOCK"
  | "ELECTION"
  | "BLOCKCHAIN"
  | "CREATE_BLOCK"
  | "MINE_BLOCK";

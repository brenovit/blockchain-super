export const Topics = {
  BLOCKCHAIN: "blockchain",
  BLOCKCHAIN_VOTE: "blockchain_vote",
  NETWORK_LEADER_ELECTION: "leader_election",
} as const;

export type TopicName = (typeof Topics)[keyof typeof Topics];

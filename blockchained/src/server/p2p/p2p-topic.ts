export const Topics = {
  BLOCKCHAIN: "blockchain",
  ELECTION: "leader-election",
  VOTE: "vote",
} as const;

export type TopicName = (typeof Topics)[keyof typeof Topics];

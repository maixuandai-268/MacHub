export type TransactionTab = "all" | "completed" | "pending" | "failed";

export type TransactionSummaryStat = {
  label: string;
  value: number;
  isMoney?: boolean;
};

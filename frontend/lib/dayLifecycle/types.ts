export enum DayState {
  PRE_OPEN = "PRE_OPEN",
  OPENING_IN_PROGRESS = "OPENING_IN_PROGRESS",
  OPEN = "OPEN",
  CLOSING_IN_PROGRESS = "CLOSING_IN_PROGRESS",
  CLOSED = "CLOSED",
}

export interface DayStep {
  id: string;
  title: string;
  done: boolean;
  targetPath?: string;
}

export interface DayStatus {
  state: DayState;
  businessDate: string;
  openingSteps: DayStep[];
  closingSteps: DayStep[];
  lockReason?: string;
  metadata?: any;
  updatedAt: string;
}

export type Role = "restaurant" | "supplier";

export interface AgentAvailability {
  id: string;
  agentId: string;
  communityId: string | null;
  dayOfWeek: number; // 0=Dom, 1=Seg, ..., 6=Sáb
  startTime: string; // "14:00"
  endTime: string; // "17:00"
  slotDurationMinutes: number;
  active: boolean;
}

export interface AgentBlockedDate {
  id: string;
  agentId: string;
  blockedDate: string; // "YYYY-MM-DD"
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
}

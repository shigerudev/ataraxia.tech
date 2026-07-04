export type RiskLevel = 'low' | 'medium' | 'high';
export type SessionChannel = 'chat' | 'voice';
export type SessionStatus = 'active' | 'crisis' | 'closed';

export interface Session {
  id: string;
  userId: string;
  channel: SessionChannel;
  status: SessionStatus;
  riskLevel: RiskLevel | null;
  createdAt: string;
  closedAt: string | null;
}

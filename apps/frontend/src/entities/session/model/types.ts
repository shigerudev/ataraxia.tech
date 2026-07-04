export type RiskLevel = 'low' | 'medium' | 'high';
export type SessionChannel = 'chat' | 'voice';
export type TherapyModality = 'individual' | 'grupal';

export interface Session {
  id: string;
  channel: SessionChannel;
  status: 'active' | 'crisis' | 'closed';
  riskLevel: RiskLevel | null;
}

export interface CrisisInfo {
  message: string;
  hotlines: { name: string; phone: string }[];
}

export enum SessionStatus {
  PLANNED = 'PLANNED',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED'
}

export interface SessionSummary {
  sessionId: string;
  name: string;
  status: SessionStatus;
  battleCount: number;
  createdAt: string;
  lastModified: string;
}

export interface SessionDetail {
  sessionId: string;
  name: string;
  status: SessionStatus;
  battles: SessionBattle[];
  createdAt: string;
  lastModified: string;
}

export interface SessionBattle {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  lastModified: string;
}

export interface CreateSessionRequest {
  name: string;
}

export interface RenameSessionRequest {
  name: string;
}

export interface SessionResponse {
  sessionId: string;
  name: string;
  status: SessionStatus;
  createdAt: string;
  lastModified: string;
}

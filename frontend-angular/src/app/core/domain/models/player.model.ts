export interface Player {
  playerId: string;
  name: string;
  characterClass: string;
  level: number;
  maxHp: number;
  isDeleted: boolean;
  createdAt: string;
  lastModified: string;
}

export interface PlayerListResponse {
  players: Player[];
  total: number;
}

export interface CreatePlayerRequest {
  name: string;
  characterClass: string;
  level: number;
  maxHp: number;
}

export interface UpdatePlayerRequest {
  name: string;
  characterClass: string;
  level: number;
  maxHp: number;
}

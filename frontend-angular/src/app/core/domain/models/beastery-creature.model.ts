export interface BeasteryCreature {
  creatureId: string;
  name: string;
  hitPoints: number;
  armorClass: number;
  isDeleted: boolean;
  createdAt: string;
  lastModified: string;
}

export interface BeasteryCreatureListResponse {
  creatures: BeasteryCreature[];
  total: number;
}

export interface CreateBeasteryCreatureRequest {
  name: string;
  hitPoints: number;
  armorClass: number;
}

export interface UpdateBeasteryCreatureRequest {
  name: string;
  hitPoints: number;
  armorClass: number;
}

export interface DuplicateBeasteryCreatureRequest {
  name?: string;
}

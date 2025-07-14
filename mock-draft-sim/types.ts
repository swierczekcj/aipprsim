// NFL Player model for PPR fantasy football
export type PlayerPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';

export interface Player {
  id: string; // unique identifier (could be ESPN ID or generated)
  name: string;
  position: PlayerPosition;
  team: string;
  projectedPPR: number;
  adp: number;
}

export interface DraftPick {
  round: number;
  pick: number;
  teamIndex: number; // 0 = user, 1-11 = AI teams
  player: Player;
}

export interface Team {
  name: string;
  picks: Player[];
}

export interface DraftState {
  availablePlayers: Player[];
  teams: Team[];
  draftPicks: DraftPick[];
  currentRound: number;
  currentPick: number;
  draftOrder: number[]; // order of team indices for the current round
  isDraftComplete: boolean;
}

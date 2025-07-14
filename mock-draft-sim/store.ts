import { create } from 'zustand';
import { Player, DraftState, Team, DraftPick } from './types';

// Example mock player data (expand as needed)
const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'J. Chase', position: 'WR', team: 'CIN', projectedPPR: 352.96, adp: 1.6 },
  { id: '2', name: 'B. Robinson', position: 'RB', team: 'ATL', projectedPPR: 334.84, adp: 3.2 },
  { id: '3', name: 'J. Jefferson', position: 'WR', team: 'MIN', projectedPPR: 322.02, adp: 4.2 },
  { id: '4', name: 'S. Barkley', position: 'RB', team: 'PHI', projectedPPR: 324.38, adp: 3.5 },
  { id: '5', name: 'J. Gibbs', position: 'RB', team: 'DET', projectedPPR: 317.64, adp: 5.4 },
  // ...add more players (ideally 200+ for realism)
];

const TEAM_COUNT = 12;
const ROUNDS = 14;

function getInitialTeams(): Team[] {
  return Array.from({ length: TEAM_COUNT }, (_, i) => ({
    name: i === 0 ? 'You' : `AI Team ${i+1}`,
    picks: [],
  }));
}

function getSnakeOrder(round: number): number[] {
  // 0 = user, 1-11 = AI
  const order = Array.from({ length: TEAM_COUNT }, (_, i) => i);
  return round % 2 === 0 ? order : order.slice().reverse();
}

export const useDraftStore = create<{
  state: DraftState;
  draftPlayer: (playerId: string) => void;
  nextAIPick: () => void;
  resetDraft: () => void;
}>(() => ({
  state: {
    availablePlayers: [...MOCK_PLAYERS],
    teams: getInitialTeams(),
    draftPicks: [],
    currentRound: 1,
    currentPick: 0,
    draftOrder: getSnakeOrder(1),
    isDraftComplete: false,
  },
  draftPlayer: (playerId: string) => {
    // Core draft logic for user and AI
    const { state } = useDraftStore.getState();
    if (state.isDraftComplete) return;
    const playerIndex = state.availablePlayers.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;
    const player = state.availablePlayers[playerIndex];
    const teamIndex = state.draftOrder[state.currentPick];
    // Add player to team
    const teams = state.teams.map((team, idx) =>
      idx === teamIndex ? { ...team, picks: [...team.picks, player] } : team
    );
    // Add to draft picks
    const draftPick: DraftPick = {
      round: state.currentRound,
      pick: state.currentPick + 1,
      teamIndex,
      player,
    };
    // Remove from available players
    const availablePlayers = state.availablePlayers.filter(p => p.id !== playerId);
    // Advance pick/round
    let currentPick = state.currentPick + 1;
    let currentRound = state.currentRound;
    let draftOrder = state.draftOrder;
    let isDraftComplete = false;
    if (currentPick >= TEAM_COUNT) {
      currentPick = 0;
      currentRound += 1;
      if (currentRound > ROUNDS) {
        isDraftComplete = true;
      } else {
        draftOrder = getSnakeOrder(currentRound);
      }
    }
    useDraftStore.setState({
      state: {
        ...state,
        availablePlayers,
        teams,
        draftPicks: [...state.draftPicks, draftPick],
        currentPick,
        currentRound,
        draftOrder,
        isDraftComplete,
      },
    });
  },
  nextAIPick: () => {
    // AI picks best available player by projectedPPR
    const { state, draftPlayer } = useDraftStore.getState();
    if (state.isDraftComplete) return;
    const teamIndex = state.draftOrder[state.currentPick];
    if (teamIndex === 0) return; // Not AI's turn
    // Pick top projectedPPR
    const best = state.availablePlayers.slice().sort((a, b) => b.projectedPPR - a.projectedPPR)[0];
    if (best) draftPlayer(best.id);
  },
  resetDraft: () => {
    useDraftStore.setState({
      state: {
        availablePlayers: [...MOCK_PLAYERS],
        teams: getInitialTeams(),
        draftPicks: [],
        currentRound: 1,
        currentPick: 0,
        draftOrder: getSnakeOrder(1),
        isDraftComplete: false,
      },
    });
  },
}));

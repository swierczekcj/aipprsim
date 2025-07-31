import { Player, PlayerPosition } from './types';

// Drafting weights for different rounds
const ROUND_STRATEGIES = {
  early: {
    // Rounds 1-3: Focus on high-impact positions with high PPR
    RB: 0.4,
    WR: 0.4,
    QB: 0.1,
    TE: 0.1,
    K: 0,
    DEF: 0,
    PPR_WEIGHT: 0.8,
    ADP_WEIGHT: 0.2,
    RANDOM_WEIGHT: 0.1,
  },
  mid: {
    // Rounds 4-8: Balance positions and value picks
    RB: 0.3,
    WR: 0.3,
    QB: 0.2,
    TE: 0.2,
    K: 0,
    DEF: 0,
    PPR_WEIGHT: 0.6,
    ADP_WEIGHT: 0.3,
    RANDOM_WEIGHT: 0.1,
  },
  late: {
    // Rounds 9-14: Focus on value, flexibility, and depth
    RB: 0.2,
    WR: 0.2,
    QB: 0.2,
    TE: 0.2,
    K: 0.1,
    DEF: 0.1,
    PPR_WEIGHT: 0.4,
    ADP_WEIGHT: 0.4,
    RANDOM_WEIGHT: 0.2,
  },
};

// Calculate positional need score based on team composition
function calculatePositionalNeed(team: Player[], position: PlayerPosition): number {
  const positionCount = team.filter(p => p.position === position).length;
  const maxPerPosition = {
    QB: 1,
    RB: 3,
    WR: 3,
    TE: 2,
    K: 1,
    DEF: 1,
  };
  return 1 - (positionCount / maxPerPosition[position]);
}

// Calculate draft score for a player
function calculateDraftScore(
  player: Player,
  team: Player[],
  round: number,
  availablePlayers: Player[],
): number {
  // Determine which strategy to use based on round
  const strategy = 
    round <= 3 ? ROUND_STRATEGIES.early :
    round <= 8 ? ROUND_STRATEGIES.mid :
    ROUND_STRATEGIES.late;

  // Calculate positional need
  const positionalNeed = calculatePositionalNeed(team, player.position);
  const positionalWeight = strategy[player.position as keyof typeof strategy];

  // Calculate PPR score
  const pprScore = player.projectedPPR;
  const maxPPR = Math.max(...availablePlayers.map(p => p.projectedPPR));
  const normalizedPPR = pprScore / maxPPR;

  // Calculate ADP score
  const adpScore = player.adp;
  const maxADP = Math.max(...availablePlayers.map(p => p.adp));
  const normalizedADP = adpScore / maxADP;

  // Calculate random factor
  const randomFactor = Math.random();

  // Combine scores with weights
  return (
    positionalNeed * positionalWeight +
    normalizedPPR * strategy.PPR_WEIGHT +
    normalizedADP * strategy.ADP_WEIGHT +
    randomFactor * strategy.RANDOM_WEIGHT
  );
}

export { calculateDraftScore };

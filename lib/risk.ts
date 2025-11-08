export type PositionSizingInput = {
  accountBalance: number; // in account currency
  riskPct: number; // e.g., 0.01 for 1%
  entry: number;
  stopLoss: number;
  symbol: string; // e.g., EURUSD
};

// Simplified pip value estimation for major FX pairs (not accurate for all symbols)
function estimatePipValue(symbol: string, lotSize: number): number {
  // For most USD-quoted majors, 1 pip value per standard lot ? $10
  // Scale linearly by lot size
  return 10 * lotSize;
}

export function computeLotSize(input: PositionSizingInput): number {
  const { accountBalance, riskPct, entry, stopLoss, symbol } = input;
  const riskAmount = accountBalance * riskPct; // amount we are willing to lose
  const pipDistance = Math.abs(entry - stopLoss); // raw price distance
  if (pipDistance <= 0) return 0;

  // Approximate pips (assumes 5-digit pairs; keeps it simple)
  const pips = pipDistance * 10000;

  // Iterate to get a lot size that risks ~ riskAmount
  // risk per lot ~ pips * pipValue(lot)
  // pipValue per standard lot ? $10 for majors
  let lotGuess = 0.1; // start small
  for (let i = 0; i < 20; i++) {
    const pipValue = estimatePipValue(symbol, lotGuess);
    const riskAtThisLot = Math.abs(pips) * pipValue;
    const ratio = riskAmount / (riskAtThisLot || 1);
    lotGuess = lotGuess * ratio;
    if (!isFinite(lotGuess) || lotGuess <= 0) {
      lotGuess = 0.01;
      break;
    }
    if (Math.abs(riskAtThisLot - riskAmount) / riskAmount < 0.05) {
      break;
    }
  }

  // Clamp and round to two decimals typical for MT5 brokers
  const clamped = Math.max(0.01, Math.min(50, lotGuess));
  return Math.round(clamped * 100) / 100;
}

export function canUnlockJourney(args: {
  locationOrder: number;
  requirementXp: number;
  totalXP: number;
  previousCompleted: boolean;
}): boolean {
  if (args.locationOrder === 0) return true;
  if (args.totalXP < args.requirementXp) return false;
  return args.previousCompleted;
}

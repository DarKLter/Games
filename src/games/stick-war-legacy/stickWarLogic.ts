export type UnitType = 'miner' | 'sword' | 'archidon' | 'spearton' | 'magikill' | 'giant' | 'albowtross' | 'meric';
export type ArmyStance = 'garrison' | 'defend' | 'attack';

export interface UnitSpec {
  id: UnitType;
  label: string;
  icon: string;
  cost: number;
  hp: number;
  dmg: number;
  range: number;
  speed: number;
}

export const UNIT_CATALOG: UnitSpec[] = [
  { id: 'miner', label: 'Miner', icon: '⛏️', cost: 50, hp: 65, dmg: 6, range: 26, speed: 74 },
  { id: 'sword', label: 'Sword', icon: '🗡️', cost: 80, hp: 105, dmg: 17, range: 34, speed: 94 },
  { id: 'archidon', label: 'Archer', icon: '🏹', cost: 110, hp: 78, dmg: 15, range: 225, speed: 80 },
  { id: 'spearton', label: 'Spear', icon: '🛡️', cost: 160, hp: 235, dmg: 23, range: 42, speed: 70 },
  { id: 'magikill', label: 'Mage', icon: '🪄', cost: 240, hp: 115, dmg: 34, range: 210, speed: 64 },
  { id: 'giant', label: 'Giant', icon: '👹', cost: 420, hp: 560, dmg: 60, range: 54, speed: 46 },
  { id: 'albowtross', label: 'Sky', icon: '🦅', cost: 190, hp: 105, dmg: 22, range: 240, speed: 98 },
  { id: 'meric', label: 'Medic', icon: '🩺', cost: 150, hp: 95, dmg: 16, range: 175, speed: 76 }
];

export function canAffordUnit(gold: number, unitIdx: number): boolean {
  const spec = UNIT_CATALOG[unitIdx];
  return !!spec && gold >= spec.cost;
}

export function computeStatueDamage(baseDmg: number, isEnemyAttack = false): number {
  return Math.max(1, Math.round(isEnemyAttack ? baseDmg * 0.9 : baseDmg));
}

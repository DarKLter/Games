import { MlbbHeroDef } from '../types';
import { MLBB_HEROES_TANK } from './heroesTank';
import { MLBB_HEROES_FIGHTER_A } from './heroesFighterA';
import { MLBB_HEROES_FIGHTER_B } from './heroesFighterB';
import { MLBB_HEROES_ASSASSIN } from './heroesAssassin';
import { MLBB_HEROES_MAGE } from './heroesMage';
import { MLBB_HEROES_MARKSMAN } from './heroesMarksman';
import { MLBB_HEROES_SUPPORT } from './heroesSupport';

/**
 * COMPLETE 2026 MLBB HERO ENCYCLOPEDIA — ALL 133 HEROES (A–Z)
 * Modularly split by primary role into <=120 KB files for fast AI editing & low token usage.
 */
export const MLBB_GENERATED_133_HEROES: MlbbHeroDef[] = [
  ...MLBB_HEROES_TANK,
  ...MLBB_HEROES_FIGHTER_A,
  ...MLBB_HEROES_FIGHTER_B,
  ...MLBB_HEROES_ASSASSIN,
  ...MLBB_HEROES_MAGE,
  ...MLBB_HEROES_MARKSMAN,
  ...MLBB_HEROES_SUPPORT,
].sort((a, b) => a.name.localeCompare(b.name));

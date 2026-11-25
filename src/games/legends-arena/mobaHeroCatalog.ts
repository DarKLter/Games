import { MobaEmblemId, MobaEmblemTalentLoadout, getTalentById } from './mobaSystemsCatalog';

export type MobaWeaponKind = 'sword' | 'staff' | 'bow' | 'shield' | 'daggers' | 'halberd';
export type MobaRole = 'Marksman' | 'Tank' | 'Fighter' | 'Assassin' | 'Mage' | 'Support';
export type MobaLane = 'Gold Lane' | 'EXP Lane' | 'Mid Lane' | 'Roam' | 'Jungle';
export type MobaArchetype =
  | 'burst'
  | 'blink_dash'
  | 'cc_pull'
  | 'heal_shield'
  | 'dot_burn'
  | 'snipe'
  | 'stealth'
  | 'summon_pet';

export interface MobaSkillDetail {
  name: string;
  desc: string;
}

export interface MobaHeroDef {
  id: number;
  name: string;
  title: string;
  role: MobaRole;
  lane: MobaLane;
  icon: string;
  weapon: MobaWeaponKind;
  archetype: MobaArchetype;
  unlockCost: number;
  bodyColor: number;
  cloakColor: number;
  bladeColor: number;
  accentHex: string;
  maxHp: number;
  moveSpeed: number;
  atkDmg: number;
  atkRange: number;
  isRanged: boolean;
  passive: MobaSkillDetail;
  skills: MobaSkillDetail[];
  skill4?: MobaSkillDetail;
  skillNames: string[];
  summary: string;
}

type HeroTuple = [
  name: string,
  title: string,
  role: MobaRole,
  lane: MobaLane,
  icon: string,
  weapon: MobaWeaponKind,
  archetype: MobaArchetype,
  unlockCost: number,
  bodyColor: number,
  cloakColor: number,
  bladeColor: number,
  hpMod: number,
  spdMod: number,
  atkMod: number,
  passive: [string, string],
  s1: [string, string],
  s2: [string, string],
  s3: [string, string],
  s4?: [string, string]
];

const ROLE_BASE: Record<MobaRole, { hp: number; spd: number; atk: number; range: number; ranged: boolean }> = {
  Marksman: { hp: 132, spd: 11.8, atk: 33, range: 15.2, ranged: true },
  Tank: { hp: 248, spd: 10.1, atk: 28, range: 5.2, ranged: false },
  Fighter: { hp: 182, spd: 11.4, atk: 36, range: 5.6, ranged: false },
  Assassin: { hp: 144, spd: 13.3, atk: 44, range: 5.2, ranged: false },
  Mage: { hp: 138, spd: 11.0, atk: 32, range: 13.6, ranged: true },
  Support: { hp: 172, spd: 11.3, atk: 27, range: 11.8, ranged: true }
};

function toHex(n: number): string {
  return `#${(n & 0xffffff).toString(16).padStart(6, '0')}`;
}

function buildHero(id: number, t: HeroTuple): MobaHeroDef {
  const [
    name,
    title,
    role,
    lane,
    icon,
    weapon,
    archetype,
    unlockCost,
    bodyColor,
    cloakColor,
    bladeColor,
    hpMod,
    spdMod,
    atkMod,
    passive,
    s1,
    s2,
    s3,
    s4
  ] = t;
  const base = ROLE_BASE[role];
  const ranged = weapon === 'bow' || weapon === 'staff' || (role === 'Support' && weapon === 'halberd') || base.ranged;
  const range = weapon === 'bow' ? 15.6 : weapon === 'staff' ? 13.8 : ranged ? 11.8 : 5.5;
  const skills: MobaSkillDetail[] = [
    { name: s1[0], desc: s1[1] },
    { name: s2[0], desc: s2[1] },
    { name: s3[0], desc: s3[1] }
  ];
  const skill4 = s4 ? { name: s4[0], desc: s4[1] } : undefined;
  if (skill4) skills.push(skill4);
  return {
    id,
    name,
    title,
    role,
    lane,
    icon,
    weapon,
    archetype,
    unlockCost,
    bodyColor,
    cloakColor,
    bladeColor,
    accentHex: toHex(bladeColor),
    maxHp: Math.round(base.hp + hpMod),
    moveSpeed: Number((base.spd + spdMod).toFixed(1)),
    atkDmg: Math.round(base.atk + atkMod),
    atkRange: archetype === 'snipe' ? range + 1.8 : range,
    isRanged: ranged,
    passive: { name: passive[0], desc: passive[1] },
    skills,
    skill4,
    skillNames: skills.map((s) => s.name),
    summary: `${title} · ${passive[0]}`
  };
}

// 129 Unique Renamed Arena Heroes (3 Free Starters at IDs 0..2 + 126 Coin Unlocks 100..500)
const HERO_TUPLES: HeroTuple[] = [
  [
    'Zilong', 'Spear of Dragon', 'Fighter', 'EXP Lane', '⚔️', 'sword', 'blink_dash', 0,
    0x2563eb, 0x1e40af, 0x38bdf8, 8, 0.2, 2,
    ['Dragon Flurry', 'After every 3 basic attacks, his next basic attack strikes 3 times in rapid succession, dealing bonus damage and healing Zilong.'],
    ['Spear Flip', 'Hooks an enemy with his spear and flips them backward over his shoulder.'],
    ['Spear Strike', 'Charges rapidly to a target enemy, lowering their Physical Defense (cooldown resets if Zilong kills a target).'],
    ['Supreme Warrior', 'Removes all slow effects on himself, gains massive Movement Speed and Attack Speed, and becomes immune to slows for 7.5 seconds.']
  ],
  [
    'Eudora', 'Lightning Weaver', 'Mage', 'Mid Lane', '🔥', 'staff', 'burst', 0,
    0x7c3aed, 0xc2410c, 0xf97316, 4, 0, 3,
    ['Superconductor', 'Her skills apply Superconductor to enemies, causing her next skill against them to trigger amplified lightning effects.'],
    ['Forked Lightning', 'Blasts forked lightning in a fan area (deals heavy bonus damage to Superconducted targets).'],
    ['Ball Lightning', 'Fires a lightning orb that stuns an enemy (splits into secondary bolts to stun up to 3 nearby enemies if Superconducted).'],
    ['Thunder\'s Wrath', 'Calls down a massive lightning bolt from the sky onto a target, followed by dark storm clouds that explode for huge AoE damage.']
  ],
  [
    'Layla', 'Energy Gunner', 'Marksman', 'Gold Lane', '🏹', 'bow', 'snipe', 0,
    0x0f766e, 0x134e4a, 0x84fab0, 4, 0.1, 2,
    ['Malefic Gun', 'Her basic attacks and skills deal more damage the farther away she is from her target (up to 130% damage).'],
    ['Malefic Bomb', 'Fires an energy blast forward. Hitting an enemy increases her basic attack range and movement speed for a few seconds.'],
    ['Void Projectile', 'Fires an energy orb that explodes on a target, slowing them and applying a Magic Mark; hitting the marked enemy stuns them briefly.'],
    ['Destruction Rush', 'Fires a massive long-range energy laser beam in a straight line. Passively increases her basic attack and skill range every time she levels up this ultimate.']
  ],
  [
    'Miya', 'Moonlight Archer', 'Marksman', 'Gold Lane', '🌙', 'bow', 'burst', 150,
    0x1d4ed8, 0x312e81, 0x93c5fd, 0, 0.3, 1,
    ['Moon Blessing', 'Every basic attack increases her Attack Speed (stacks up to 5 times). At full stacks, she summons a Moonlight Shadow that fires extra arrows with every shot.'],
    ['Moon Arrow', 'Splits her basic attack into multiple arrows, hitting her main target plus up to two nearby enemies simultaneously.'],
    ['Arrow of Eclipse', 'Shoots a volley of arrows into a target area that deals damage, immobilizes (freezes/roots) enemies in place, and splits into minor slowing arrows.'],
    ['Hidden Moonlight', 'Immediately removes all Crowd Control (CC) debuffs on herself, turns invisible (concealed), gains massive movement speed, and instantly maxes out her Passive stacks.']
  ],
  [
    'Beatrix', 'Dawnbreak Soldier', 'Marksman', 'Gold Lane', '🎯', 'bow', 'burst', 350,
    0xbe123c, 0x881337, 0xfda4af, 6, 0.1, 4,
    ['Mechanical Genius', 'Carries two guns at a time out of four total weapons, each with completely unique basic attacks and ultimates.'],
    ['Masterful Gunner', 'Swaps between her currently equipped primary and secondary weapons.'],
    ['Tactical Reposition', 'Rolls/dashes forward in a chosen direction and instantly reloads her current weapon.'],
    ['4 Variants', 'Switches between Renner (Sniper), Bennett (Rocket Mortar), Wesker (Shotgun Fan), or Nibiru (SMG Bullet Storm).']
  ],
  [
    'Brody', 'Lone Star', 'Marksman', 'Gold Lane', '🔫', 'bow', 'burst', 300,
    0x4338ca, 0x1e1b4b, 0xa78bfa, 8, -0.2, 6,
    ['Abyss Corrosion', 'His basic attacks have a wind-up animation (he can move while charging them), deal heavy damage, and apply Abyss Marks (up to 4 stacks) that increase his damage against that target.'],
    ['Abyss Impact', 'Sends a shockwave forward that damages enemies, slows them, and applies Abyss Marks for every enemy pierced.'],
    ['Corrosive Strike', 'Dashes to an enemy, stuns them briefly, applies a mark, and leaps backward to a safe distance.'],
    ['Torn-Apart Memory', 'Locks onto all nearby enemies within range and fires homing energy blasts that deal bonus damage based on their missing HP and Abyss Mark stacks.']
  ],
  [
    'Bruno', 'Protector', 'Marksman', 'Gold Lane', '⚽', 'bow', 'burst', 200,
    0x0369a1, 0x0c4a6e, 0x38bdf8, 4, 0.2, 3,
    ['Mecha Legs', 'Gains extra Critical Chance (stacks up to 10 times) every time his skills deal damage.'],
    ['Volley Shot', 'Kicks an enhanced Powerball that deals heavy damage, slows the enemy, and bounces back toward Bruno—catching it resets his 2nd Skill cooldown.'],
    ['Flying Tackle', 'Performs a sliding dash forward that stuns enemies in his path and pulls his bouncing Powerball directly to him.'],
    ['Worldie', 'Kicks a super energy ball at a target that knocks them back and bounces repeatedly between nearby enemy heroes, reducing their physical defense.']
  ],
  [
    'Claude', 'Master Thief', 'Marksman', 'Gold Lane', '🐒', 'bow', 'summon_pet', 350,
    0xb45309, 0x78350f, 0xfbbf24, 0, 0.5, 2,
    ['Battle Side-by-side', 'His monkey companion, Dexter, automatically attacks alongside Claude, dealing extra basic attack damage.'],
    ['Art of Thievery', 'Fires a fan-shaped wave that steals Movement Speed and Attack Speed from hit enemies and gives it to Claude.'],
    ['Battle Mirror Image', 'Leaves a hologram clone of Dexter at a target location; pressing the skill again teleports Claude to the clone\'s spot.'],
    ['Blazing Duet', 'Rapidly fires a storm of bullets at all nearby enemies for 3 seconds while gaining a shield (scales heavily with Attack Speed).']
  ],
  [
    'Clint', 'West Justice', 'Marksman', 'Gold Lane', '🤠', 'bow', 'snipe', 200,
    0x92400e, 0x451a03, 0xfcd34d, 4, 0, 5,
    ['Double Shot', 'After casting any skill, his next basic attack turns into a long-range, armor-piercing rifle shot that hits enemies in a straight line.'],
    ['Quick Draw', 'Fires 5 bullets in rapid succession in a fan-shaped area.'],
    ['Trapping Recoil', 'Shoots a trap net forward that immobilizes the first enemy hit while launching Clint backward.'],
    ['Grenade Bombardment', 'Launches a grenade that explodes on impact (holds up to 5 charges with a very short cooldown).']
  ],
  [
    'Granger', 'Death Chanter', 'Marksman', 'Gold Lane', '🎻', 'bow', 'burst', 300,
    0x374151, 0x111827, 0xf87171, 2, 0.2, 5,
    ['Caprice', 'Uses Demonic Energy instead of mana; every 6th bullet from his gun is guaranteed to deal a Critical Hit.'],
    ['Rhapsody', 'Rapidly fires all 6 bullets in a straight line while allowing him to move freely.'],
    ['Rondo', 'Dashes in a direction and enhances his next basic attacks while reducing the cooldown of his 1st Skill.'],
    ['Death Sonata', 'Transforms his violin case into a super cannon and fires 3 massive explosive shells from long range, dashing slightly after each shot.']
  ],
  [
    'Hanabi', 'Scarlet Flower', 'Marksman', 'Gold Lane', '🌸', 'bow', 'heal_shield', 250,
    0xdb2777, 0x831843, 0xf472b6, 6, 0.1, 1,
    ['Ninjutsu: Petal Barrage', 'Her basic attacks and skills bounce between nearby enemies; whenever she has a Shield active, she is completely immune to Crowd Control (stuns/slows).'],
    ['Ninjutsu: Equinox', 'Grants herself a shield, boosts movement/attack speed, and activates her Crowd Control immunity.'],
    ['Ninjutsu: Soul Scroll', 'Throws a kunai forward that damages, slows, and marks enemies so her bouncing petals deal extra damage to them.'],
    ['Forbidden Jutsu: Higanbana', 'Throws a blooming flower projectile that immobilizes the first enemy hit and spreads to bind nearby enemies.']
  ],
  [
    'Irithel', 'Jungle Heart', 'Marksman', 'Gold Lane', '🦁', 'bow', 'burst', 250,
    0xd97706, 0x7c2d12, 0xfdba74, 4, 0.6, 3,
    ['Jungle Heart', 'Rides her beast Leo, allowing her to shoot arrows continuously while moving without stopping.'],
    ['Strafe', 'Fires a volley of arrows into an area, reducing the physical defense of hit enemies.'],
    ['Force of the Queen', 'Leo lets out a loud roar that damages and slows all nearby enemies.'],
    ['Heavy Crossbow', 'Leaps forward and empowers her crossbow for 15 seconds, turning her basic attacks into explosive AoE heavy arrows.']
  ],
  [
    'Ixia', 'Arclight Outlaw', 'Marksman', 'Gold Lane', '💫', 'bow', 'heal_shield', 350,
    0x6d28d9, 0x4c1d95, 0xc4b5fd, 2, 0.2, 4,
    ['Siphon Starlium', 'Every 3rd basic attack on a target drains their HP to heal Ixia and deals extra damage.'],
    ['Dual Arc', 'Fires two parallel energy beams forward that damage enemies and grant Ixia a movement speed boost.'],
    ['Star Helix', 'Fires a vortex canister that knocks enemies slightly airborne and pulls them into the center line.'],
    ['Full Barrage', 'Splits her weapon into 6 floating cannons, massively expanding her attack range into a giant fan shape where every basic attack hits all enemies inside.']
  ],
  [
    'Karrie', 'Lost Star', 'Marksman', 'Gold Lane', '🌀', 'bow', 'dot_burn', 250,
    0x0e7490, 0x164e63, 0x22d3ee, 4, 0.3, 3,
    ['Lightwheel Mark', 'Every 5th hit on the same enemy triggers a True Damage explosion equal to a percentage of the enemy\'s Max HP (melts high-HP tanks).'],
    ['Spinning Lightwheel', 'Throws a flywheel that stops at a target location, continuously damaging and slowing enemies inside it.'],
    ['Phantom Step', 'Performs a quick short-range dash while throwing a lightwheel at the nearest enemy.'],
    ['Speedy Lightwheel', 'Enters Dual Wield mode, firing two lightwheels per basic attack at massively increased attack speed.']
  ],
  [
    'Kimmy', 'Jetpack Rebel', 'Marksman', 'Gold Lane', '🧪', 'bow', 'dot_burn', 250,
    0x0891b2, 0x155e75, 0x67e8f9, 2, 0.4, 2,
    ['Chemist\'s Instinct', 'Uses Energy instead of mana and aims her basic attacks manually using a directional joystick while moving in any direction.'],
    ['Energy Transformation', 'Switches her spray gun into chemical pellets that deal Magic Damage and splash on impact.'],
    ['Chemical Refinement', 'Dashes backward while spraying a chemical trail that slows enemies who walk over it.'],
    ['Maximum Charge', 'Charges up and fires a long-range luminous chemical missile that explodes on contact.']
  ],
  [
    'Lesley', 'Deadly Sniper', 'Marksman', 'Gold Lane', '🔭', 'bow', 'snipe', 300,
    0x4c1d95, 0x1f2937, 0xe879f9, 0, 0.2, 6,
    ['Lethal Shot', 'After 5 seconds without taking damage, her next basic attack has extended range, higher critical chance, and deals True Damage (ignores armor).'],
    ['Master of Camouflage', 'Enters stealth camouflage, increases movement speed, and immediately resets her Passive sniper shot.'],
    ['Tactical Grenade', 'Throws a grenade forward that knocks enemies back while Lesley leaps backward.'],
    ['Ultimate Snipe', 'Locks onto an enemy hero from extreme range and fires 4 lethal sniper bullets one after another.']
  ],
  [
    'Melissa', 'Cursed Needle', 'Marksman', 'Gold Lane', '🪡', 'bow', 'summon_pet', 350,
    0x7e22ce, 0x581c87, 0xf0abfc, 4, 0.1, 3,
    ['Doll Buster', 'Deals 125% increased damage to summoned units, creeps, and shields.'],
    ['Falling!', 'Dashes forward and gains a burst of Attack Speed while commanding her dolls to move with her.'],
    ['Eyes on You!', 'Throws her doll Muddles at an enemy, linking nearby enemies together—attacking the doll transfers damage to all linked heroes.'],
    ['Go Away!', 'Creates a protective barrier around herself for 4 seconds that physically pushes away and blocks melee enemies from touching her.']
  ],
  [
    'Moskov', 'Spear of Quiescence', 'Marksman', 'Gold Lane', '🔱', 'bow', 'blink_dash', 250,
    0x312e81, 0x1e1b4b, 0x818cf8, 2, 0.3, 4,
    ['Spear of Quiescence', 'His basic attacks pierce through his target to hit enemies behind them, and every hit reduces the cooldown of his 1st and 2nd Skills.'],
    ['Abyss Walker', 'Teleports a short distance and gains massive Attack Speed and penetration damage.'],
    ['Spear of Misery', 'Fires a powerful spear that knocks an enemy backward; if they collide with another enemy hero or a wall, they get stunned.'],
    ['Spear of Destruction', 'Throws a giant spear globally across the entire map. If it hits an enemy hero, Moskov can press the skill again to teleport directly behind them.']
  ],
  [
    'Natan', 'Spacetime Walker', 'Marksman', 'Gold Lane', '⏳', 'bow', 'summon_pet', 400,
    0x2563eb, 0x1e3a8a, 0x93c5fd, 2, 0.3, 4,
    ['Theory of Everything', 'Converts all physical attack stats into Magic Damage; hitting enemies with skills grants stacks of Attack Speed and Movement Speed.'],
    ['Superposition', 'Fires a dense burst of gravitational energy forward in a line.'],
    ['Interference!', 'Launches a gravitational orb that pulls enemies along its path and explodes at the end.'],
    ['Entropy?', 'Summons a reverse-mirror clone of himself that mimics all of Natan\'s basic attacks and skills in reverse; he can swap places with the clone.']
  ],
  [
    'Obsidia', 'Bone Weaver', 'Marksman', 'Gold Lane', '🦴', 'bow', 'stealth', 450,
    0x3f3f46, 0x18181b, 0xe4e4e7, 6, 0.2, 4,
    ['Return to Bone', 'Basic attacks harvest Bone Shards from enemies; at full shards, her basic attacks fire extra homing bone needles.'],
    ['Abyssal Bone Needle', 'Fires a piercing bone projectile that marks the first enemy hit and increases her movement speed.'],
    ['Phantom Shadowmeld', 'Dissolves into shadow mist, gaining brief untargetability and dashing forward.'],
    ['Hunt of Bone', 'Fires a tether at an enemy hero, pulling herself toward them and forcing them into a close-range duel where they cannot blink away.']
  ],
  [
    'Popol and Kupa', 'Icefield Companions', 'Marksman', 'Gold Lane', '🐺', 'bow', 'summon_pet', 300,
    0x0284c7, 0x075985, 0xbae6fd, 8, 0.1, 2,
    ['We Are Friends', 'Fights alongside his wolf companion Kupa; if Kupa falls in battle, Popol can summon him back after a short channel.'],
    ['Bite \'em, Kupa!', 'Popol throws a spear and commands Kupa to leap onto the target and bite them repeatedly.'],
    ['Kupa, Help!', 'Calls Kupa back to Popol\'s side, granting Popol a shield and knocking back nearby enemies.'],
    ['We Are Angry!', 'Enrages both Popol and Kupa—Kupa grows huge, gains massive HP/Attack, and turns his 1st Skill bite into a stun.']
  ],
  [
    'Wanwan', 'Agile Tiger', 'Marksman', 'Gold Lane', '🐯', 'bow', 'blink_dash', 400,
    0xea580c, 0x9a3412, 0xfdba74, -4, 0.7, 3,
    ['Tiger Pace', 'Reveals 3 weak spots around enemy heroes and lets Wanwan hop a short distance after every basic attack. Hitting all 3 weak spots unlocks her Ultimate.'],
    ['Swallow\'s Path', 'Throws a fire swallow forward that returns as 3 daggers, hitting an enemy\'s back weak spot and stunning them.'],
    ['Needles in Flowers', 'Instantly removes all Crowd Control effects on herself and fires deadly needles at nearby enemies.'],
    ['Crossbow of Tang', 'Flies into the air completely untargetable and invulnerable for 2.5 seconds, firing a rapid barrage of arrows at the target (switches to new targets if the first one dies).']
  ],
  [
    'Tigreal', 'Warrior of Dawn', 'Tank', 'Roam', '🛡️', 'shield', 'cc_pull', 100,
    0x475569, 0x1d4ed8, 0xfacc15, 12, 0, 1,
    ['Fearless', 'Gains a stack of blessing every time he uses a skill or gets hit; at 4 stacks, he completely blocks the next basic attack.'],
    ['Attack Wave', 'Slams the ground to send out 3 waves of shockwaves that damage and slow enemies.'],
    ['Sacred Hammer', 'Charges forward, pushing all enemies in his path; pressing it again knocks those enemies airborne into the air.'],
    ['Implosion', 'Pulls all surrounding enemies violently toward himself and stuns them in a wide circle.']
  ],
  [
    'Franco', 'Frozen Warrior', 'Tank', 'Roam', '⚓', 'shield', 'cc_pull', 200,
    0x0284c7, 0x0c4a6e, 0x7dd3fc, 16, 0.2, 1,
    ['Wasteland Force', 'When out of combat, he gains extra movement speed, regenerates HP rapidly, and builds up stacks that boost his next skill\'s damage.'],
    ['Iron Hook', 'Launches an iron hook in a straight line, snagging the first enemy hit and dragging them all the way back to Franco.'],
    ['Fury Shock', 'Slams the ground around him, dealing damage based on his Max HP and heavily slowing nearby enemies.'],
    ['Bloody Hunt', 'Locks onto an enemy with Suppression (cannot be purified) and hacks them 6 times in a row while holding them completely still.']
  ],
  [
    'Khufra', 'Desert Tyrant', 'Tank', 'Roam', '🏜️', 'shield', 'cc_pull', 350,
    0x92400e, 0x78350f, 0xfde047, 18, 0.1, 0,
    ['Spell Curse', 'Every few seconds, his next basic attack extends his bandages for long-range magic damage, slowing the target and healing Khufra.'],
    ['Tyrant\'s Revenge', 'Stretches his arms back and launches himself across a huge distance, knocking airborne any enemy he crashes into.'],
    ['Bouncing Ball', 'Curls into a giant bouncing ball that gains massive defenses and blocks/knocks down any enemy trying to use a dash or blink skill through him.'],
    ['Tyrant\'s Rage', 'Pulls all nearby enemies around him toward his front; if they slam into a wall, they take extra damage and are stunned.']
  ],
  [
    'Atlas', 'Ocean Gladiator', 'Tank', 'Roam', '🌊', 'shield', 'cc_pull', 300,
    0x155e75, 0x083344, 0x22d3ee, 16, 0, 1,
    ['Frigid Breath', 'Every time he casts a skill, he generates a freezing aura around himself that slows enemy movement and attack speed until they freeze solid.'],
    ['Annihilate', 'Smashes the ground to cause 3 explosions around him (if ejected from his mecha, both Atlas and his mecha perform this attack).'],
    ['Perfect Match', 'Ejects out of his mecha armor, gaining massive speed and stun immunity; when he reunites with the mecha, he stuns nearby enemies.'],
    ['Fatal Links', 'Throws chains onto all nearby enemy heroes, pulls them in, and slams them violently onto the ground in a chosen direction.']
  ],
  [
    'Johnson', 'Mustang', 'Tank', 'Roam', '🏎️', 'shield', 'cc_pull', 250,
    0x1d4ed8, 0x1e293b, 0x60a5fa, 15, 0.3, 0,
    ['Electro-airbag', 'When his HP drops below 30%, he automatically generates a massive shield based on his Physical Defense.'],
    ['Deadly Pincers', 'Throws his spanner wrench into an area, dealing damage and stunning enemies hit.'],
    ['Electromagnetic Rays', 'Raises his shield to continuously blast electricity in front of him, damaging and slowing enemies.'],
    ['Full Throttle', 'Transforms into a sports car! One allied hero can hop inside as a passenger while Johnson drives across the map, crashing into enemies to stun them and create an electrified zone.']
  ],
  [
    'Akai', 'Panda Warrior', 'Tank', 'Roam', '🐼', 'shield', 'cc_pull', 150,
    0x15803d, 0x14532d, 0x86efac, 14, 0.2, 2,
    ['Tai Chi', 'Every skill cast grants him a shield and marks hit enemies; his basic attacks deal bonus damage to marked targets.'],
    ['Headbutt', 'Charges forward and knocks up the first enemy hero he hits, allowing him to roll slightly afterward.'],
    ['Body Slam', 'Slams the ground with his belly, dealing AoE damage, slowing enemies, and applying his passive mark.'],
    ['Heavy Spin', 'Spins like a tornado for 4 seconds, removing all debuffs on himself and repeatedly knocking back enemies (great for pinning enemies against walls).']
  ],
  [
    'Lolita', 'Steel Elf', 'Tank', 'Roam', '🔋', 'shield', 'heal_shield', 250,
    0xb45309, 0x451a03, 0xfef08a, 10, 0.3, 0,
    ['Noumenon Energy Core', 'Periodically grants a regenerative shield to herself and all nearby allies.'],
    ['Charge!', 'Dashes forward and empowers her next basic attack into a hammer smash that stuns the target.'],
    ['Guardian\'s Reflection', 'Raises a wide energy shield that blocks all incoming enemy ranged projectiles (arrows, bullets, magic orbs) and reflects them back at the enemies.'],
    ['Noumenon Blast', 'Charges up a massive fan-shaped energy slam; the longer she charges, the larger the stun duration and damage.']
  ],
  [
    'Gatotkaca', 'Mighty Guardian', 'Tank', 'Roam', '⚡', 'shield', 'cc_pull', 200,
    0x7c2d12, 0x431407, 0xfb923c, 20, -0.1, 2,
    ['Steel Bones', 'Converts a percentage of his lost HP into extra Physical Defense, and taking damage builds Rage that empowers his next basic attack into a healing leap slam.'],
    ['Blast Iron Fist', 'Shatters the ground in front of him, creating a cracked pathway that continuously damages and slows enemies.'],
    ['Unbreakable', 'Charges up and dashes forward, taunting enemies in his path so they are forced to basic attack him.'],
    ['Avatar of the Guardian', 'Leaps high into the sky and crashes down onto a distant target area, knocking all enemies inside airborne into the center.']
  ],
  [
    'Minotaur', 'Son of Minos', 'Tank', 'Roam', '🐂', 'shield', 'heal_shield', 200,
    0x991b1b, 0x450a0a, 0xfca5a5, 18, 0, 1,
    ['Rage Incarnate', 'Applying Crowd Control to enemies lowers their defenses, while healing allies boosts their defenses.'],
    ['Despair Stomp', 'Jumps to a target area, damaging and knocking enemies airborne.'],
    ['Motivation Roar', 'Roars to heal himself and all nearby allies while boosting their attack speed.'],
    ['Minoan Fury', 'Enters Rage state, slams the ground 3 times to send out shockwaves that slow and knock enemies high into the air, and refreshes his 1st and 2nd Skills.']
  ],
  [
    'Belerick', 'Guard of Nature', 'Tank', 'Roam', '🌿', 'shield', 'heal_shield', 250,
    0x166534, 0x052e16, 0x4ade80, 28, -0.2, 0,
    ['Deadly Thorns', 'Gains 30% extra HP from equipment items; whenever he takes damage, he fires thorny vines back at nearby enemies.'],
    ['Ancient Seed', 'Sends vines in a line that damage enemies and taunt them into attacking him.'],
    ['Nature\'s Strike', 'Gains a burst of movement speed and empowers his next basic attack to slow the target and heal Belerick.'],
    ['Wrath of Dryad', 'Spreads thorny vines in a giant circle around him, immobilizing (rooting) all caught enemies in place.']
  ],
  [
    'Grock', 'Fortress Titan', 'Tank', 'Roam', '🗿', 'shield', 'cc_pull', 250,
    0x57534e, 0x292524, 0xd6d3d1, 22, -0.2, 3,
    ['Earthen Force', 'Whenever he stands near a wall or turret, he gains extra movement speed, physical defense, and HP regeneration.'],
    ['Power of Nature', 'Charges up and swings his stone pillar in a circle; while charging near a wall, he becomes immune to all Crowd Control.'],
    ['Guardian\'s Barrier', 'Launches a shockwave that turns into a physical stone wall, blocking enemy escape paths.'],
    ['Wild Charge', 'Charges forward like a battering ram; if he hits a wall or turret, he stops and deals massive AoE knock-up damage.']
  ],
  [
    'Hylos', 'Grand Warden', 'Tank', 'Roam', '🐴', 'shield', 'dot_burn', 200,
    0x1e3a8a, 0x172554, 0xfef08a, 24, 0.2, 0,
    ['Thickened Blood', 'Converts every 1 point of extra Mana from items into 1.5 Max HP; if he runs out of mana, he can cast skills using his own HP.'],
    ['Law and Order', 'Gains movement speed and empowers his next basic attack to stun and knock back an enemy slightly.'],
    ['Ring of Punishment', 'Activates a continuous aura around himself that drains mana to damage enemies, slow them, and reduce their attack speed.'],
    ['Glorious Pathway', 'Creates a long golden highway on the ground that heals Hylos, speeds up all allies running forward, and slows enemies.']
  ],
  [
    'Uranus', 'Aethereal Defender', 'Tank', 'Roam', '🌀', 'shield', 'heal_shield', 300,
    0x0369a1, 0x0c4a6e, 0x38bdf8, 22, 0.1, 0,
    ['Radiance', 'Every time he takes damage, he gains a stack of energy (up to 20 stacks) that grants massive continuous HP regeneration.'],
    ['Ionic Edge', 'Releases two energy blades that orbit around him, damaging enemies and reducing their attack power.'],
    ['Transcendent Ward', 'Dashes to a target location, gaining an energy shield that explodes when broken or expired.'],
    ['Consecration', 'Removes all slow effects on himself, heals instantly, boosts movement speed, and increases his HP regeneration stacks.']
  ],
  [
    'Baxia', 'Mystic Tortoise', 'Tank', 'Jungle', '🐢', 'shield', 'dot_burn', 300,
    0xb91c1c, 0x7f1d1d, 0xf97316, 16, 0.2, 2,
    ['Baxia Mark', 'Permanently reduces incoming damage and reduces the healing/shield regeneration of enemies hit by his skills by 50%.'],
    ['Baxia-Shield Unity', 'Retracts into his shell and rolls across the map like a high-speed wheel; he can jump over walls and stun enemies on impact.'],
    ['Shield of Spirit', 'Throws his shield forward; if it hits an enemy hero, the cooldown resets almost immediately so he can spam it.'],
    ['Tortoise\'s Puissance', 'Sprouts lava shields and sprints forward, leaving a trail of burning magma that damages and slows enemies.']
  ],
  [
    'Barats', 'Dino Rider', 'Tank', 'Jungle', '🦖', 'shield', 'cc_pull', 350,
    0x065f46, 0x064e3b, 0x34d399, 20, -0.1, 3,
    ['Big Guy', 'Hitting enemies with skills grants Big Guy stacks (up to 16), making Barats and his dinosaur Detona grow physically huge with massive defenses and stomping basic attacks.'],
    ['So-Called Teamwork', 'Detona spits oil in a fan shape, and Barats drops a firecracker to ignite it for AoE damage and slow.'],
    ['Missile "Expert"', 'Fires two missiles that explode and push enemies backward toward Barats.'],
    ['Detona\'s Welcome', 'Locks onto an enemy hero, swallows them whole inside Detona\'s mouth, and spits them out in any direction (stunning them if they hit a wall or teammate).']
  ],
  [
    'Gloo', 'Swamp Spirits', 'Tank', 'Roam', '🟣', 'shield', 'dot_burn', 350,
    0x6b21a8, 0x3b0764, 0xd8b4fe, 18, 0.1, 0,
    ['Stick, Stick', 'Skills apply Sticky stacks to enemies, slowing them and reducing the damage they deal to Gloo.'],
    ['Slam, Slam', 'Reaches out and slams the ground, leaving a gooey puddle that explodes after a delay and immobilizes enemies.'],
    ['Pass, Pass', 'Stretches forward in a line; if he hits his 1st Skill puddle, he pulls himself forward and drags enemies along.'],
    ['Split, Split', 'Splits into 12 mini-blobs that move together; once an enemy has 5 Sticky stacks, Gloo can latch directly onto their back, transferring 80% of damage Gloo takes onto that enemy.']
  ],
  [
    'Edith', 'Forsaken Warden', 'Tank', 'Roam', '🤖', 'shield', 'burst', 400,
    0x1d4ed8, 0x312e81, 0x67e8f9, 14, 0.1, 3,
    ['Overload', 'After casting any skill, her next basic attacks trigger chain lightning that bounces between enemies.'],
    ['Earth Shatter', 'Slams her mech\'s axe down, knocking enemies airborne. (In Marksman mode: calls down lightning in an area).'],
    ['Onward', 'Charges forward and flips the first enemy hero hit backward over her shoulder. (In Marksman mode: fires a lightning bolt that binds enemies).'],
    ['Primal Wrath', 'Ejects out of her giant mecha armor into a flying Marksman! Converts all her Tank defenses into massive Attack Speed, Magic Lifesteal, and ranged lightning attacks.']
  ],
  [
    'Chip', 'Phase Technician', 'Tank', 'Roam', '🦊', 'shield', 'blink_dash', 450,
    0x0284c7, 0x1e293b, 0x38bdf8, 12, 0.4, 1,
    ['Snack Time!', 'Eats potato chips out of combat to regenerate HP quickly.'],
    ['Crash Course', 'Rams his hovercraft into the ground, marking enemies so his next basic attack stuns all marked targets in an area.'],
    ['Overtime', 'Gains a burst of movement speed and charges forward to knock back an enemy.'],
    ['Shortcut', 'Drops a Main Portal onto an enemy hero and opens Connecting Portals near all allied heroes across the map, allowing teammates to teleport instantly to the fight.'],
    ['Why Walk?', 'Teleports directly to one of the Beacon spots located around the map.']
  ],
  [
    'Alice', 'Queen of Blood', 'Tank', 'Mid Lane', '🦇', 'staff', 'heal_shield', 250,
    0x881337, 0x4c0519, 0xf43f5e, 10, 0.2, 2,
    ['Blood Ancestry', 'Gains permanent mana regeneration every time she levels up and boosts her healing received.'],
    ['Flowing Blood', 'Fires a blood orb in a straight line; pressing the skill again teleports Alice instantly to the orb\'s location.'],
    ['Blood Awe', 'Unleashes a dark pulse around herself that damages and immobilizes (roots) nearby enemies.'],
    ['Blood Ode', 'Enters a continuous blood-draining state, constantly damaging all nearby enemies and healing Alice for every target drained.']
  ],
  [
    'Esmeralda', 'Astrologer', 'Tank', 'EXP Lane', '🌙', 'halberd', 'heal_shield', 350,
    0x4338ca, 0x312e81, 0xa855f7, 12, 0.4, 2,
    ['Starmoon Casket', 'Deals both Physical and Magic damage; her attacks completely ignore enemy shields and gradually convert stolen shields into her own HP.'],
    ['Frostmoon Shield', 'Gains a massive shield and movement speed while gradually stealing the shields of nearby enemies.'],
    ['Stardust Dance', 'Waves her ribbons in a circle, dealing physical and magic damage while reducing the cooldown of her 1st Skill.'],
    ['Falling Starmoon', 'Charges up power and leaps onto a target location, dealing heavy AoE damage and immobilizing enemies.']
  ],
  [
    'Hilda', 'Power of Megalith', 'Tank', 'Roam', '🪓', 'shield', 'heal_shield', 150,
    0x3f6212, 0x1a2e05, 0xa3e635, 16, 0.5, 3,
    ['Blessing of Wilderness', 'Entering any bush immediately grants her a protective shield and rapidly regenerates her HP.'],
    ['Combat Ritual', 'Gains a burst of movement speed and empowers her next basic attack to slash enemies in a wide area and slow them.'],
    ['Art of Hunting', 'Locks onto an enemy and slashes them up to 3 times with her giant axe, knocking them back on the final hit.'],
    ['Power of Wildness', 'Leaps into the air and slams her axe down onto a single target, stunning them and dealing massive damage (scales with kills/assists).']
  ],
  [
    'Chou', 'Kung Fu Boy', 'Fighter', 'EXP Lane', '🥋', 'sword', 'blink_dash', 250,
    0xb45309, 0x78350f, 0xfacc15, 4, 0.4, 4,
    ['Only Fast', 'After moving 8 yards, his next basic attack deals 180% damage and slows the target.'],
    ['Jeet Kune Do', 'Punches forward up to 3 times; the 3rd punch knocks nearby enemies airborne and resets his 2nd Skill cooldown.'],
    ['Shunpo', 'Dashes forward while becoming completely immune to Crowd Control (stuns/slows) and gaining a shield.'],
    ['The Way of Dragon', 'Roundhouse-kicks an enemy backward; pressing it again launches Chou into the air to unleash a combo of kicks in mid-air.']
  ],
  [
    'Alucard', 'Demon Hunter', 'Fighter', 'Jungle', '🗡️', 'sword', 'heal_shield', 150,
    0x1e40af, 0x172554, 0x60a5fa, 0, 0.3, 4,
    ['Pursuit', 'After casting a skill, his next basic attack lets him dash directly to a target and deal boosted damage; gains massive Hybrid Lifesteal.'],
    ['Groundsplitter', 'Leaps forward and slams his greatsword onto the ground, damaging and slowing enemies.'],
    ['Whirling Smash', 'Swings his sword in a full circle, slashing all nearby enemies.'],
    ['Fission Wave', 'Absorbs energy from enemies to boost his Hybrid Lifesteal and reduce his skill cooldowns; pressing it again fires a massive energy shockwave forward.']
  ],
  [
    'Balmond', 'Bloody Beast', 'Fighter', 'EXP Lane', '🪓', 'sword', 'heal_shield', 100,
    0x991b1b, 0x450a0a, 0xf87171, 18, 0, 2,
    ['Bloodthirst', 'Restores 5% of his Max HP whenever he kills a minion/creep, and 20% Max HP whenever he kills an enemy hero.'],
    ['Soul Lock', 'Charges forward and slams into enemies, stopping on the first hero hit and slowing them.'],
    ['Cyclone Sweep', 'Spins his giant axe continuously for 3 seconds while moving, dealing rapidly increasing physical damage.'],
    ['Lethal Counter', 'Slams his axe down in a fan shape, dealing massive True Damage based on the enemy\'s missing HP (ideal for executing low-HP enemies or securing Turtle/Lord).']
  ],
  [
    'Bane', 'Frozen King', 'Fighter', 'EXP Lane', '🏴‍☠️', 'sword', 'heal_shield', 150,
    0x0369a1, 0x0c4a6e, 0x38bdf8, 8, 0.1, 3,
    ['Shark Bite', 'Every skill cast infuses his weapon with tidal energy, empowering his next basic attack into a wide spinning slash that deals bonus Max-HP damage.'],
    ['Crab Claw Cannon', 'Fires a cannonball at an enemy that bounces to a second target behind them, slowing both.'],
    ['Ale', 'Drinks rum to immediately heal himself and gain movement speed; pressing it again spits venom in a fan shape.'],
    ['Deadly Catch', 'Summons a school of ghostly sharks that charge across a huge area, knocking enemies airborne and damaging turrets.']
  ],
  [
    'Freya', 'Valkyrie', 'Fighter', 'EXP Lane', '🪽', 'sword', 'heal_shield', 350,
    0x1d4ed8, 0x0f172a, 0x93c5fd, 10, 0.2, 3,
    ['Power of Einherjar', 'Casting a skill grants her massive Attack Speed for her next two basic attacks; basic attacks generate Sacred Orbs (up to 6 stacks).'],
    ['Leap of Faith', 'Jumps to a target area, pulling nearby enemies to the center and damaging them.'],
    ['Spirit Combo', 'Consumes Sacred Orbs to dash forward with a shield; can be cast repeatedly to perform a 4-hit combo that ends in a knock-up.'],
    ['Valkyrie Descent', 'Transforms into her Valkyrie form, gaining a massive shield, increased attack power, and turning her basic attacks into long-range AoE slashes.']
  ],
  [
    'Ruby', 'Little Red Hood', 'Fighter', 'EXP Lane', '🌹', 'halberd', 'cc_pull', 250,
    0xbe123c, 0x4c0519, 0xfda4af, 12, 0.1, 1,
    ['Let\'s Dance!', 'Gains huge Physical Lifesteal (125% ratio from items); after casting any skill, she can hop/dash in any direction and gains extra defense stacks.'],
    ['Be Good!', 'Slashes with her scythe and sends a shockwave forward that damages and slows enemies.'],
    ['Don\'t run, Wolf King!', 'Swings her scythe twice in a circle around her, stunning nearby enemies briefly and pulling them inward.'],
    ['I\'m Offended!', 'Sweeps her scythe across a wide horizontal range, pulling all hit enemies directly to her and stunning them.']
  ],
  [
    'Alpha', 'Blade of Enmity', 'Fighter', 'Jungle', '🦾', 'halberd', 'summon_pet', 200,
    0x0284c7, 0x1e293b, 0x38bdf8, 8, 0.2, 3,
    ['Beta, Advance!', 'After hitting an enemy twice with skills, his floating drone Beta locks onto them, firing continuous laser strikes that deal True Damage and slow them.'],
    ['Rotary Impact', 'Slashes forward to send out a shockwave, followed by Beta firing a laser along the exact same line.'],
    ['Force Swing', 'Charges up and swings his blade in a wide fan, damaging enemies and healing himself for every target hit.'],
    ['Spear of Alpha', 'Commands Beta to smash down onto a target area to stun enemies, while Alpha leaps in right behind, knocking all enemies along his path into the air.']
  ],
  [
    'Lapu-Lapu', 'Great Chief', 'Fighter', 'EXP Lane', '🏝️', 'sword', 'burst', 250,
    0xca8a04, 0x713f12, 0xfef08a, 14, 0.1, 3,
    ['Homeland Defender', 'Dealing damage builds Bravery Blessing; at full energy, his next basic attack dashes to the target and grants him a shield.'],
    ['Justice Blades', 'Throws two boomerangs forward that return to him. (Heavy-Sword Mode: Slams his giant sword down to stun enemies).'],
    ['Jungle Warrior', 'Dashes forward slashing enemies. (Heavy-Sword Mode: Spins his giant sword, gaining damage reduction for every enemy hit).'],
    ['Bravest Fighter', 'Leaps into the air and fuses his twin blades into a massive Heavy Sword, gaining CC immunity, higher defenses, and 3 giant AoE slam attacks.']
  ],
  [
    'Roger', 'Dire Wolf Hunter', 'Fighter', 'Jungle', '🌕', 'daggers', 'burst', 200,
    0x475569, 0x1e293b, 0xfbbf24, 4, 0.5, 4,
    ['Full Moon Curse', 'In Human form, his attacks slow enemies; in Werewolf form, his attacks deal bonus damage based on the enemy\'s missing HP.'],
    ['Open Fire / Lycan Pounce', 'Human: Fires two rapid shots that lower enemy defense. Wolf: Leaps onto an enemy while becoming untargetable, tearing them apart.'],
    ['Hunter\'s Steps / Bloodthirsty Howl', 'Human: Gains movement speed. Wolf: Howls to gain massive attack speed and extra speed toward low-HP enemies.'],
    ['Wolf Transformation / Restore Human Form', 'Leaps forward and transforms into a Werewolf (gaining armor/magic defense) or rolls backward to return to Human form.']
  ],
  [
    'Argus', 'Nightstalker', 'Fighter', 'EXP Lane', '🪽', 'sword', 'heal_shield', 250,
    0x15803d, 0x052e16, 0x4ade80, 2, 0.2, 5,
    ['Warmonger', 'Every basic attack charges his demonic blade; at full charge, his next basic attack strikes twice rapidly, ignores a portion of armor, and heals him.'],
    ['Demonic Grip', 'Extends a demonic hand to pull himself and an enemy together; pressing it again lets him dash a second time.'],
    ['Meteoric Sword', 'Thrusts his sword forward, cursing hit enemies so they bleed damage when moving and leave a speed-boosting trail for Argus.'],
    ['Eternal Evil', 'Immediately cleanses all Crowd Control debuffs and enters Death Immunity for 4 seconds—his HP cannot drop below 1, and all damage he deals heals him!']
  ],
  [
    'Jawhead', 'Steel Sweetheart', 'Fighter', 'Roam', '🚀', 'halberd', 'cc_pull', 200,
    0x0369a1, 0x1e3a8a, 0x38bdf8, 14, 0.3, 2,
    ['Mecha Suppression', 'Every time he damages a target, he applies a stack (up to 10) that increases his basic attack damage against them.'],
    ['Smart Missiles', 'Launches 12 homing missiles at random nearby enemies over 5 seconds while moving freely.'],
    ['Ejector', 'Gains a shield and movement speed; pressing it again grabs the nearest target (ally, enemy, or creep) and throws them to a chosen location, stunning enemies on landing.'],
    ['Unstoppable Force', 'Locks onto an enemy hero from afar and rockets directly into them, stunning the target and knocking back surrounding enemies.']
  ],
  [
    'Martis', 'Ashura King', 'Fighter', 'EXP Lane', '👑', 'sword', 'burst', 300,
    0x6d28d9, 0x3b0764, 0xc084fc, 8, 0.3, 4,
    ['Ashura\'s Wrath', 'Every time he uses a skill, his Attack Speed increases by 30% (up to 120% max).'],
    ['Ashura Aura', 'Clamps his twin blades together in a fan shape, pulling enemies to the center and damaging them.'],
    ['Mortal Coil', 'Charges forward slashing 4 times in a chosen direction while gaining 60% damage reduction and CC immunity; pressing it again charges forward and knocks an enemy airborne.'],
    ['Decimation', 'Dashes to an enemy hero to execute them—if the target\'s HP is below 50%, it deals True Damage, and if it kills the target, Martis gains 100% movement speed and can cast the Ultimate again for free!']
  ],
  [
    'Aldous', 'Soul Contractor', 'Fighter', 'EXP Lane', '👊', 'sword', 'burst', 250,
    0xb45309, 0x451a03, 0xfde047, 16, 0.1, 6,
    ['Contract: Transform', 'After every 2 attacks, his next basic attack generates a protective shield based on the damage dealt.'],
    ['Contract: Soul Steal', 'Empowers his next basic attack into a giant fist smash; killing units with it permanently increases the damage of this skill forever (stacks up to 650).'],
    ['Contract: Explosion', 'Enters a defensive stance for 2 seconds, gaining damage reduction and movement speed before exploding to stun nearby enemies.'],
    ['Contract: Chase Fate', 'Reveals all enemy heroes on the entire map; selecting one launches Aldous flying across the whole map straight into that enemy, knocking them back.']
  ],
  [
    'Leomord', 'Sworn Sword', 'Fighter', 'Jungle', '🐎', 'sword', 'blink_dash', 300,
    0x1e40af, 0x0f172a, 0x60a5fa, 10, 0.3, 3,
    ['The Oath Keeper', 'Whenever an enemy hero\'s HP drops below 50%, all of Leomord\'s basic attacks against them are guaranteed Critical Hits.'],
    ['Momentum', 'Charges up his sword while gaining a shield, then slams forward to deal heavy AoE damage and slow enemies.'],
    ['Decimation Assault', 'Dashes forward quickly, damaging and slowing enemies in his path.'],
    ['Phantom Steed', 'Summons his spectral warhorse Barbiel from behind him; when Barbiel reaches Leomord, he mounts the horse, gaining AoE sweeping basic attacks, higher speed, and a brand-new set of mounted charging skills.']
  ],
  [
    'Thamuz', 'Lord Lava', 'Fighter', 'EXP Lane', '🔥', 'halberd', 'dot_burn', 300,
    0xc2410c, 0x7c2d12, 0xfb923c, 18, 0, 3,
    ['Grand Lord Lava', 'His attacks scorch enemies with continuous True Damage; when holding his scythes, his attacks have a chance to erupt molten lava beneath the target.'],
    ['Molten Scythes', 'Throws his twin scythes forward, damaging and slowing enemies; the scythes spin in place until Thamuz recalls them or picks them up.'],
    ['Chasm Leap', 'Leaps to a target area, dealing damage, slowing enemies, and instantly recalling his thrown scythes.'],
    ['Cauterant Inferno', 'Erupts in demonic lava, gaining massive Max HP, healing every time he attacks, and gaining huge Attack Speed.']
  ],
  [
    'Badang', 'Tribal Warrior', 'Fighter', 'EXP Lane', '🥊', 'sword', 'cc_pull', 200,
    0xca8a04, 0x78350f, 0xfef08a, 10, 0.2, 3,
    ['Chivalry Fist', 'Every 4th basic attack knocks enemies backward—if they hit a wall or obstacle, they get stunned.'],
    ['Fist Wind', 'Fires a whirlwind of fist energy forward that knocks back and slows enemies (explodes if it hits a wall).'],
    ['Fist Break', 'Dashes forward, knocking enemies back and creating a solid rock wall behind them to trap them.'],
    ['Fist Crack', 'Unleashes a rapid storm of golden punches in front of him while gaining a CC-immune shield (combos with his 2nd Skill wall to stun-lock enemies inside).']
  ],
  [
    'Guinevere', 'Ms. Violet', 'Fighter', 'EXP Lane', '💜', 'staff', 'cc_pull', 300,
    0x7e22ce, 0x581c87, 0xe879f9, 2, 0.4, 3,
    ['Super Magic', 'Deals bonus damage to airborne enemies; landing skills builds Super Magic, empowering her next basic attack to dash and heal her.'],
    ['Energy Wave', 'Fires an energy orb forward that damages, slows, and reduces all of her skill cooldowns by 1 second.'],
    ['Spatial Migration', 'Leaps to a target area, knocking all caught enemies high into the air; pressing it again teleports her away while leaving a decoy illusion behind.'],
    ['Violet Requiem', 'Unleashes a whirlwind of magic around herself for 2 seconds; if enemies are already airborne, she keeps them suspended in mid-air for the entire duration!']
  ],
  [
    'Terizla', 'Executioner', 'Fighter', 'EXP Lane', '🔨', 'halberd', 'heal_shield', 250,
    0x44403c, 0x1c1917, 0xa8a29e, 20, -0.3, 5,
    ['Body of Smith', 'Gains 1% damage reduction for every 2% of his missing HP (making him nearly unkillable at low HP), and converts extra attack speed into physical attack.'],
    ['Revenge Strike', 'Cracks the ground forward to slow enemies and speed himself up; the fissure explodes after 3 seconds based on the target\'s missing HP.'],
    ['Execution Strike', 'Swings his giant hammer up to 3 times in a chosen direction, dealing massive AoE damage and slowing on the final overhead smash.'],
    ['Penalty Zone', 'Leaps into a target area, summoning a demonic scaffold that repeatedly pulls and hooks caught enemies back into the center.']
  ],
  [
    'X.Borg', 'Firaga Armor', 'Fighter', 'EXP Lane', '🔥', 'bow', 'dot_burn', 250,
    0xdc2626, 0x7f1d1d, 0xfca5a5, 16, 0.2, 2,
    ['Firaga Armor', 'Wears a separate HP layer of Firaga Armor; when the armor breaks, he rolls out of it into Armorless state and collects energy supplies from burning enemies to rebuild it.'],
    ['Fire Missiles', 'Activates his flamethrower to continuously spray fire in a cone; once an enemy\'s temperature maxes out, the flames deal True Damage.'],
    ['Fire Stake', 'Shoots 5 fire stakes at the edge of a fan area that pull enemies and dropped Firaga supplies back toward X.Borg.'],
    ['Last Insanity', 'Charges forward spraying fire in a full circle, slowing enemies before violently self-destructing his Firaga Armor for massive True Damage based on enemy Max HP.']
  ],
  [
    'Dyrroth', 'Prince of the Abyss', 'Fighter', 'EXP Lane', '😈', 'daggers', 'burst', 200,
    0x991b1b, 0x3b0764, 0xf43f5e, 6, 0.3, 5,
    ['Wrath of the Abyss', 'Every 2 basic attacks, his next basic attack turns into a circular Abyssal Strike that deals heavy AoE damage and heals Dyrroth.'],
    ['Burst Strike', 'Fires a dark energy wave forward that damages and slows enemies.'],
    ['Spectre Step', 'Dashes forward; pressing it again locks onto an enemy and slashes them 3 times, shredding up to 75% of their Physical Defense.'],
    ['Abysm Strike', 'Charges up and unleashes a fatal dark slash in front of him that deals massive damage based on the enemy\'s missing HP.']
  ],
  [
    'Masha', 'Wild-oats Fist', 'Fighter', 'EXP Lane', '🐾', 'daggers', 'burst', 300,
    0xd97706, 0x451a03, 0xfde047, 22, 0.6, 2,
    ['Ancient Strength', 'Possesses 3 separate HP bars! Losing an HP bar removes all debuffs on her; the fewer HP bars she has left, the higher her Attack Speed and Lifesteal.'],
    ['Wild Power', 'Consumes a bit of her own HP to empower her basic attacks with bonus Max-HP damage and extra movement speed.'],
    ['Howl Shock', 'Roars forward, damaging, slowing, and reducing the attack speed of enemies hit.'],
    ['Thunderclap', 'Consumes a portion of her HP to rocket directly onto an enemy hero while immune to CC, dealing massive damage based on her own Max HP and knocking back surrounding enemies.']
  ],
  [
    'Silvanna', 'Imperial Knightess', 'Fighter', 'EXP Lane', '⚜️', 'halberd', 'cc_pull', 250,
    0x2563eb, 0xfef08a, 0xfacc15, 12, 0.2, 2,
    ['Knightess\' Resolve', 'Basic attacks deal Magic Damage and apply marks that reduce enemy defenses (up to 5 stacks).'],
    ['Cometic Spear', 'Thrusts her lance forward to stun the first enemy hit; pressing it again lets her dash in a chosen direction.'],
    ['Spiral Strangling', 'Spins her lance rapidly in front of her, pulling enemies toward the center while gaining a shield.'],
    ['Imperial Justice', 'Leaps onto an area and creates a Circle of Light that chains the closest enemy hero inside for 3.5 seconds so they cannot escape, while Silvanna gains massive Attack Speed and Magic Lifesteal.']
  ],
  [
    'Yu Zhong', 'Black Dragon', 'Fighter', 'EXP Lane', '🐉', 'halberd', 'heal_shield', 400,
    0x312e81, 0x581c87, 0xc084fc, 16, 0.2, 4,
    ['Cursing Touch', 'Applies Sha Residue stacks to enemies; at 5 stacks, the residue erupts to continuously drain the enemy\'s HP, heal Yu Zhong, and grant him movement speed.'],
    ['Dragon Tail', 'Infuses his cloak with energy and spins it in a circle—enemies hit by the sharpened outer edge take 250% damage.'],
    ['Soul Grip', 'Unleashes a dragon soul wave forward that slows enemies and empowers his next basic attack to dash and apply multiple Sha stacks.'],
    ['Black Dragon Form', 'Transforms into a giant flying Black Dragon for 7 seconds, ignoring all walls, becoming immune to CC, knocking back enemies he flies over, and entering empowered Dragonoid form afterward.']
  ],
  [
    'Khaleed', 'Desert Scimitar', 'Fighter', 'EXP Lane', '🏜️', 'sword', 'heal_shield', 300,
    0xd97706, 0x78350f, 0xfbbf24, 14, 0.5, 3,
    ['Desert Power', 'Moving builds up Desert Power; at full charge, he surfs on sand for extra speed and empowers his next basic attack to dash and deal bonus damage.'],
    ['Desert Tornado', 'Spins his scimitar up to 3 times while dashing slightly, pulling nearby enemies toward him with every slash.'],
    ['Quicksand Guard', 'Kneels in a protective sandstorm for 4 seconds, gaining massive damage reduction and rapidly regenerating his lost HP while slowing nearby enemies.'],
    ['Raging Sandstorm', 'Rides a giant sand wave toward a target area, knocking enemies back along his path and slamming down at the end to stun everyone inside.']
  ],
  [
    'Paquito', 'Heavenly Fist', 'Fighter', 'EXP Lane', '🥊', 'daggers', 'blink_dash', 350,
    0xdc2626, 0x1e293b, 0xfca5a5, 8, 0.5, 5,
    ['Champ Stance', 'Every skill cast grants a stack of Champ Stance; at 3 stacks, his next skill has zero cooldown and deals massively enhanced damage.'],
    ['Heavy Left Punch', 'Throws a heavy punch forward; if it hits a hero, Paquito gains a protective shield.'],
    ['Jab', 'Dashes forward rapidly and throws a devastating straight jab.'],
    ['Knockout Strike', 'Unleashes an uppercut combo that pushes enemies backward and slows them (in Champ Stance, it launches them airborne into the air).']
  ],
  [
    'Phoveus', 'Shadow of Dread', 'Fighter', 'EXP Lane', '⛓️', 'halberd', 'cc_pull', 350,
    0x4c1d95, 0x1e1b4b, 0xa78bfa, 18, 0, 4,
    ['Demonic Force', 'Every time an enemy hero uses a blink, dash, or displacement skill near him, Phoveus\'s skill cooldowns are drastically reduced and his next basic attack dashes to them.'],
    ['Demonic Impact', 'Slams his monolith onto the ground, sending out a wave of Astaros energy and gaining a shield.'],
    ['Dark Wave', 'Drops his monolith into an area to knock enemies airborne and drag them together.'],
    ['Infernal Pursuit', 'Marks any enemy hit by his skills or using dashes, allowing Phoveus to leap high into the sky and crash down onto them repeatedly with zero cooldown as long as marks remain!']
  ],
  [
    'Aulus', 'Warrior of Ferocity', 'Fighter', 'EXP Lane', '🪓', 'halberd', 'heal_shield', 300,
    0xb91c1c, 0x450a0a, 0xfbbf24, 12, 0.3, 4,
    ['Fighting Spirit', 'Basic attacks build up Fighting Spirit stacks (up to 4), granting extra Physical Attack, Penetration, and Movement Speed.'],
    ['Aulus, Charge!', 'Removes all slow effects on himself, gains movement speed, and reduces damage taken from the front.'],
    ['The Power of Axe', 'Slams his axe down in a fan shape, gaining massive Attack Speed and HP healing on his next basic attacks for every enemy hit.'],
    ['Undying Fury', 'Permanently upgrades his axe each time this ultimate is leveled up (increasing attack, lifesteal, and range), and slams the ground to create a burning lava path.']
  ],
  [
    'Yin', 'Martial Genius', 'Fighter', 'Jungle', '🥊', 'sword', 'burst', 350,
    0xbe123c, 0x0f172a, 0xf43f5e, 6, 0.4, 5,
    ['Leave It to Me', 'Deals 120% increased damage whenever there are no allied heroes nearby.'],
    ['Charged Punch', 'Gains movement speed and empowers his next basic attack into a heavy AoE punch. (In Domain: Rapidly smashes the ground 10 times in a straight line while CC-immune).'],
    ['Instant Blast', 'Dashes forward while leaving behind a golden ring that stuns enemies hit. (In Domain: Tackles forward, knocking enemies back and gaining damage reduction).'],
    ['My Turn', 'Pulls a single enemy hero into his private Domain of Lieh dimension for 8 seconds—completely isolating them from both teams for a 1v1 duel!']
  ],
  [
    'Julian', 'Scarlet Raven', 'Fighter', 'Jungle', '🪶', 'sword', 'blink_dash', 400,
    0x9f1239, 0x18181b, 0xfb7185, 6, 0.3, 4,
    ['Smith\'s Legacy', 'Has no Ultimate skill—instead, after casting any 2 different skills, his 3rd skill becomes an Enhanced Skill and empowers his basic attacks with Magic Lifesteal!'],
    ['Scythe', 'Throws a spinning magic scythe forward. (Enhanced: Throws giant flying scythes that continuously slice and slow enemies).'],
    ['Sword', 'Dashes forward in a flash of shadow. (Enhanced: Turns untargetable while slicing back and forth rapidly).'],
    ['Chain', 'Summons dark chains in an area to immobilize enemies. (Enhanced: Pulls all enemies to the center and knocks them airborne).']
  ],
  [
    'Fredrinn', 'Rogue Appraiser', 'Fighter', 'Jungle', '💎', 'sword', 'heal_shield', 350,
    0x0284c7, 0x1e293b, 0x7dd3fc, 22, 0, 2,
    ['Appraiser\'s Wrath', 'Stores a portion of incoming damage as Crystal Energy, which he converts back into HP when dealing damage; hitting enemies builds Combo Points (up to 4).'],
    ['Piercing Strike', 'Thrusts his sword forward to slow enemies and empowers his next basic attack with extended range.'],
    ['Brave Assault', 'Dashes forward, knocking up the first enemy hit on his next basic attack.'],
    ['Energy Eruption', 'Taunts all nearby enemies and reduces his 1st and 2nd Skill cooldowns.'],
    ['Appraiser\'s Wrath', 'Consumes 4 Combo Points to slam his greatsword down in a fan shape, dealing massive damage based on the Crystal Energy he stored from taking hits.']
  ],
  [
    'Arlott', 'Lone Lancer', 'Fighter', 'EXP Lane', '👁️', 'halberd', 'blink_dash', 400,
    0x991b1b, 0x18181b, 0xf87171, 8, 0.4, 4,
    ['Demon Gaze', 'Periodically marks nearby enemies with a Demonic Eye (also marks any enemy hit by Crowd Control).'],
    ['Dauntless Strike', 'Sweeps his lance forward, stunning enemies hit by the outer edge.'],
    ['Vengeance', 'Dashes through an enemy target—if the target was marked by his Passive, the cooldown resets instantly and heals Arlott!'],
    ['Final Slash', 'Cleaves across a huge fan area, sweeping all caught enemies to the side and applying his Passive mark to every single one of them.']
  ],
  [
    'Cici', 'Buoyant Performer', 'Fighter', 'EXP Lane', '🪀', 'daggers', 'heal_shield', 350,
    0xe11d48, 0x881337, 0xfda4af, 6, 0.6, 2,
    ['Performer\'s Delight', 'Dealing damage builds Delight stacks (up to 10), increasing her Movement Speed and Spell Vamp.'],
    ['Yo-Yo Blitz', 'Locks onto the nearest enemy and rapidly whips them with her yo-yo 10 times for percentage Max-HP damage while moving freely.'],
    ['Buoyant Bounce', 'Leaps onto a target—if she lands on an enemy or ally, she bounces a second time in a chosen direction.'],
    ['Curtain Call', 'Throws her yo-yo to tether two nearby enemy heroes together, slowing them and allowing her 1st Skill to strike both targets simultaneously.']
  ],
  [
    'Lukas', 'Beast of Light', 'Fighter', 'EXP Lane', '🦁', 'sword', 'burst', 450,
    0xd97706, 0xfef08a, 0xfacc15, 16, 0.2, 4,
    ['Hero\'s Resolve', 'Builds Resolve over time and through combat; at 100 Resolve, he can unleash his Sacred Beast transformation.'],
    ['Flash Combo', 'Empowers his next basic attack into a whirlwind slam (gains bonus stacks and stun effects based on basic attack hits).'],
    ['Flash Step', 'Dashes forward and empowers his next basic attack to blink directly behind his target.'],
    ['Unleash the Beast', 'Transforms into a giant Sacred Beast with boosted stats and wide AoE attacks; pressing it again fires a massive Shockwave Blast forward.']
  ],
  [
    'Suyou', 'Mask of the Immortal', 'Fighter', 'Jungle', '🎭', 'sword', 'blink_dash', 450,
    0x0369a1, 0x1e293b, 0x38bdf8, 10, 0.3, 4,
    ['Transient Immortal', 'Tap-casting skills keeps him in nimble Mortal form (extra speed); hold-casting skills channels his Immortal form (extra damage reduction and heavy strikes).'],
    ['Blade Surge', 'Tap: Throws his weapon and blinks to it. Hold: Charges forward with his Immortal phantom, stunning enemies in his path.'],
    ['Soul Sever', 'Tap: Performs a quick fan slash. Hold: Channels 3 massive Immortal cleaves that deal bonus missing-HP damage and heal him.'],
    ['Evil Queller', 'Tap: Glides backward while firing an energy wave. Hold: Charges up a long-range Immortal arrow that pierces enemies.']
  ],
  [
    'Sun', 'Monkey King', 'Fighter', 'Jungle', '🐒', 'halberd', 'summon_pet', 250,
    0xca8a04, 0x713f12, 0xfde047, 8, 0.3, 3,
    ['Simian God', 'Reduces enemy Physical Defense with every hit from himself or his clones, and heals Sun whenever his clones deal damage.'],
    ['Endless Variety', 'Hurls his golden staff forward, transforming it into an identical doppelganger clone that fights alongside him.'],
    ['Swift Exchange', 'Sends a clone charging forward while Sun enters stealth briefly and swaps positions.'],
    ['Instantaneous Move', 'Commands himself and all active clones to leap onto a target simultaneously for a coordinated smash.'],
    ['Clone Techniques', 'Summons a high-durability doppelganger clone while briefly becoming untargetable.']
  ],
  [
    'Minsitthar', 'Courageous Warrior', 'Fighter', 'Roam', '👑', 'halberd', 'cc_pull', 200,
    0xb45309, 0x1e3a8a, 0xfacc15, 16, 0.1, 1,
    ['Mark of the King', 'Every 5 hits on an enemy hero triggers an explosion that stuns them, deals bonus Max-HP damage, and heals Minsitthar.'],
    ['Spear of Glory', 'Thrusts his spear forward to pierce enemies, then pulls all hit enemy heroes back toward him.'],
    ['Shield Assault', 'Raises his golden shield to block frontal damage while rapidly stabbing enemies in front of him.'],
    ['King\'s Calling', 'Summons 4 Royal Guards in a circular arena that completely disables all enemy blink and dash skills inside the ring.']
  ],
  [
    'Kaja', 'Nazar King', 'Fighter', 'Roam', '⚡', 'halberd', 'cc_pull', 250,
    0x1d4ed8, 0x4c1d95, 0x67e8f9, 14, 0.2, 2,
    ['Wrath Sanction', 'Every 6 seconds, his next basic attack sends out chain lightning that paralyzes enemies and reduces their damage output.'],
    ['Ring of Order', 'Emits a wide electric ring that damages enemies, slows them, and heals Kaja for each target hit.'],
    ['Lightning Bomb', 'Dashes forward while leaving 3 lightning bombs behind that explode when enemies touch them.'],
    ['Divine Judgment', 'Suppresses an enemy hero (un-purifiable) with a lightning whip, allowing Kaja to drag the helpless enemy backward toward his team.']
  ],
  [
    'Benedetta', 'Shadow Ranger', 'Fighter', 'EXP Lane', '⚡', 'sword', 'blink_dash', 400,
    0xbe123c, 0x18181b, 0xfb7185, 4, 0.6, 4,
    ['Elapsed Daytime', 'Holding down the basic attack button charges her sword—releasing it performs a long-range Swordout Slash dash!'],
    ['Phantom Slash', 'Leaps backward leaving a shadow that slashes forward, followed by Benedetta dashing in for a second slash.'],
    ['An Eye for an Eye', 'Raises her sword defensively, becoming completely immune to all damage and Crowd Control for 0.8 seconds—if she blocks a stun, her counter-dash stuns the enemy!'],
    ['Alecto: Final Blow', 'Clenches her sword and slashes across a giant rectangular area, leaving a storm of sword-cuts that continuously shred and slow enemies while charging her Passive.']
  ],
  [
    'Saber', 'Wandering Sword', 'Assassin', 'Jungle', '🌀', 'daggers', 'burst', 150,
    0x1d4ed8, 0x172554, 0x38bdf8, 4, 0.1, 2,
    ['Enemy\'s Bane', 'Every hit reduces the enemy\'s Physical Defense (stacks up to 5 times).'],
    ['Orbiting Swords', 'Releases 5 swords that orbit around him, flying out to pierce enemies whenever Saber attacks.'],
    ['Charge', 'Dashes forward and empowers his next basic attack to dash and slow the target.'],
    ['Triple Sweep', 'Dashes to an enemy hero, knocks them airborne into the sky, and slashes them 3 times in mid-air before slamming them down.']
  ],
  [
    'Fanny', 'Blade Dancer', 'Assassin', 'Jungle', '🦅', 'daggers', 'blink_dash', 350,
    0xbe123c, 0x1e293b, 0xfda4af, 0, 0.8, 4,
    ['Air Superiority', 'Deals up to 30% extra damage while flying through the air and applies Prey Marks that restore her Energy when hit.'],
    ['Tornado Strike', 'Spins her twin blades in a circle around her (triggers automatically whenever she flies past an enemy with cables).'],
    ['Steel Cable', 'Fires a grappling cable that hooks onto any wall and pulls Fanny across the map—casting multiple cables rapidly lets her fly nonstop!'],
    ['Cut Throat', 'Lunges onto an enemy hero for a massive burst of damage that scales with her Prey Mark stacks.']
  ],
  [
    'Hayabusa', 'Crimson Shadow', 'Assassin', 'Jungle', '🥷', 'daggers', 'stealth', 300,
    0x312e81, 0x1e1b4b, 0xa855f7, 2, 0.4, 3,
    ['Ninjutsu: Trace of Shadow', 'Every hit applies a Shadow Mark (up to 4 stacks), increasing all of Hayabusa\'s damage against that target.'],
    ['Ninjutsu: Phantom Shuriken', 'Throws 3 shurikens in a fan shape that return to him, restoring Energy on hit.'],
    ['Ninjutsu: Quad Shadow', 'Dashes forward and sends out 4 phantom shadows in 4 directions; pressing the skill again teleports Hayabusa directly to any chosen shadow.'],
    ['Ougi: Shadow Kill', 'Turns into a shadow completely untargetable and invulnerable, rapidly slashing enemies inside the area (prioritizes enemies with Shadow Marks).']
  ],
  [
    'Lancelot', 'Blade of Roses', 'Assassin', 'Jungle', '🌹', 'sword', 'blink_dash', 350,
    0x1e3a8a, 0x7c3aed, 0x93c5fd, 2, 0.5, 4,
    ['Soul Cutter', 'Every time he charges/dashes, his damage increases by 7.5% for 4 seconds (stacks up to 4 times).'],
    ['Puncture', 'Dashes through an enemy and leaves a Sword Mark—as long as he hits an unmarked enemy, this skill has zero cooldown, allowing infinite dashes through minions and heroes!'],
    ['Thorned Rose', 'Performs a triangular sword technique in an area while becoming completely untargetable/invulnerable, slashing enemies in the center 3 times.'],
    ['Phantom Execution', 'Charges up briefly while invulnerable and lunges forward with a devastating piercing strike.']
  ],
  [
    'Gusion', 'Holy Blade', 'Assassin', 'Jungle', '🗡️', 'daggers', 'blink_dash', 350,
    0x0369a1, 0x1e1b4b, 0x38bdf8, 0, 0.4, 5,
    ['Dagger Specialist', 'Every skill cast adds a rune to his dagger; at 3 runes, his next basic attack deals massive missing-HP damage and heals him.'],
    ['Sword Spike', 'Throws a dagger that marks the first enemy hit; pressing it again teleports Gusion behind that marked target anywhere on the map.'],
    ['Shadowblade Slaughter', 'Throws up to 5 daggers forward in a fan shape that slow enemies; pressing it again recalls all thrown daggers back to Gusion.'],
    ['Incandescence', 'Dashes forward and immediately resets the cooldowns of his 1st and 2nd Skills (allowing him to throw 10 daggers at once!).']
  ],
  [
    'Natalia', 'Bright Claw', 'Assassin', 'Roam', '🐈‍⬛', 'daggers', 'stealth', 250,
    0x374151, 0x111827, 0xd8b4fe, -6, 0.7, 4,
    ['Assassin Instinct', 'Standing in a bush for 1 second puts her into Camouflage stealth; attacking from behind or out of stealth teleports her behind the target and silences them.'],
    ['Claw Dash', 'Dashes forward slashing enemies; if she hits an enemy, she can dash a second time immediately.'],
    ['Smoke Bomb', 'Drops a smoke cloud that slows enemies inside while making Natalia 100% immune to all basic attacks.'],
    ['The Hunt', 'Instantly enters her Passive Camouflage state and empowers her next basic attack (holds 2 charges).']
  ],
  [
    'Karina', 'Shadow Blade', 'Assassin', 'Jungle', '🗡️', 'daggers', 'burst', 150,
    0x1e1b4b, 0x6b21a8, 0xe879f9, 2, 0.2, 4,
    ['Shadow Combo', 'Every 3rd consecutive hit on the same enemy deals massive True Damage based on their missing HP and reduces her basic skill cooldowns.'],
    ['Dance of Blades', 'Enters defensive blade-spin mode for 3.5 seconds, gaining movement speed, blocking all incoming basic attacks, and reflecting damage back at attackers.'],
    ['Dance of Death', 'Brandishes her twin blades in a circle, slashing all surrounding enemies.'],
    ['Shadow Assault', 'Dashes through an enemy hero, leaving a Shadow Mark behind them—if the target dies within 5 seconds, this Ultimate\'s cooldown resets completely!']
  ],
  [
    'Helcurt', 'Shadowbringer', 'Assassin', 'Jungle', '🌑', 'daggers', 'stealth', 250,
    0x18181b, 0x4c1d95, 0xa78bfa, 0, 0.6, 5,
    ['Shadow of Styx', 'Whenever he stays out of enemy sight, he enters stealth mode with extra movement speed and HP regeneration; killing a hero spawns a dark fog around him.'],
    ['Shadow Transition', 'Teleports to a target location, damaging and slowing enemies (applies Silence if used from stealth).'],
    ['Deadly Stinger', 'Fires up to 5 stored poisoned stingers forward in a narrow cone for massive burst damage.'],
    ['Dark Night Falls', 'Plunges all 5 enemy heroes across the entire map into total darkness (blinding their minimap and vision range) while giving Helcurt huge Attack Speed and Movement Speed.']
  ],
  [
    'Selena', 'Abyssal Witch', 'Assassin', 'Mid Lane', '🕸️', 'daggers', 'snipe', 350,
    0x4c1d95, 0x312e81, 0xe879f9, -4, 0.3, 4,
    ['Symbiosis', 'Switches between Elven (Mage) and Abyssal (Assassin) forms; Elven skills apply Abyssal Marks that Abyssal skills detonate for massive bonus damage.'],
    ['Abyssal Trap / Soul Eater', 'Elven: Plants an invisible ward trap that slows and marks enemies. Abyssal: Empowers her next basic attack with heavy damage and a shield.'],
    ['Abyssal Arrow / Garotte', 'Elven: Fires a long-range magic stun arrow—the farther it flies, the longer the stun (up to 3 seconds!). Abyssal: Dashes forward (resets if she hits a marked target).'],
    ['Primal Darkness / Blessing of the Moon God', 'Transforms between her Abyssal Assassin form and Elven Mage form, immediately resetting her skill cooldowns.']
  ],
  [
    'Hanzo', 'Akuma Ninja', 'Assassin', 'Jungle', '👹', 'daggers', 'stealth', 300,
    0x7f1d1d, 0x18181b, 0xf43f5e, 0, 0.3, 4,
    ['Ame no Habakiri', 'Absorbs Demon Blood whenever nearby units die, fueling his Ultimate demon form.'],
    ['Ninjutsu: Demon Feast', 'After 5 basic attacks, instantly swallows a jungle creep or minion whole to digest it for extra gold/EXP. (Demon Form: Devours a target area).'],
    ['Ninjutsu: Soul Reap', 'Opens a dark portal that continuously slices enemies inside. (Demon Form: Dashes forward slashing all targets in an area).'],
    ['Kinjutsu: Pinnacle Ninja', 'Leaves his real body behind and unleashes his Supreme Demon spirit to fly through walls and attack enemies from afar.']
  ],
  [
    'Ling', 'Cyan Finch', 'Assassin', 'Jungle', '🦅', 'sword', 'blink_dash', 400,
    0x0369a1, 0x0c4a6e, 0x67e8f9, -4, 0.6, 4,
    ['Cloud Walker', 'Gains double Critical Chance from items; standing on walls restores Lightness Points faster.'],
    ['Finch Poise', 'Leaps onto any wall on the map, entering half-stealth and allowing him to hop rapidly from wall to wall.'],
    ['Defiant Sword', 'Dashes forward and thrusts his sword (if cast from a wall, he dives down onto a target area).'],
    ['Tempest of Blades', 'Leaps into the air completely invulnerable, knocking enemies airborne and dropping 4 Tempests of Blades around the arena—touching each blade resets his 2nd Skill cooldown!']
  ],
  [
    'Yi Sun-shin', 'Paenlong Legend', 'Assassin', 'Jungle', '🏹', 'bow', 'snipe', 350,
    0x1e40af, 0x1e3a8a, 0x93c5fd, 6, 0.2, 4,
    ['Heavenly Vow', 'Automatically switches between his longbow (at range) and glaive (up close); every weapon swap triggers an empowered critical strike and reduces his skill cooldowns.'],
    ['Traceless', 'Dashes forward while becoming immune to Crowd Control and gaining damage reduction.'],
    ['Blood Floods', 'Charges up his bow to fire a long-range piercing arrow that cuts through all enemies in a line.'],
    ['Mountain Shocker', 'Commands his naval fleet to launch 3 waves of flaming cannonballs onto every enemy hero across the entire map, revealing their locations!']
  ],
  [
    'Aamon', 'Duke of Shards', 'Assassin', 'Jungle', '💠', 'daggers', 'stealth', 350,
    0x0e7490, 0x1e293b, 0x67e8f9, 2, 0.4, 3,
    ['Invisible Armor', 'Every time he hits an enemy with a skill, he enters Camouflage stealth, regenerates HP, gains speed, and drops shards on the ground.'],
    ['Soul Shards', 'Launches 5 demonic shards at an enemy that scatter around the target afterward.'],
    ['Slayer Shards', 'Throws a shard forward that bounces back to Aamon and immediately activates his stealth camouflage.'],
    ['Endless Shards', 'Collects all scattered shards on the battlefield (up to 25) and rains them down simultaneously onto a single target for devastating execution damage.']
  ],
  [
    'Joy', 'Flash of Miracle', 'Assassin', 'Jungle', '⚡', 'daggers', 'blink_dash', 450,
    0xeab308, 0x713f12, 0xfef08a, 0, 0.8, 3,
    ['Humph, Joy\'s Angry!', 'Hitting non-minion enemies with skills grants her a shield and movement speed burst.'],
    ['Look, Leonin Crystal!', 'Summons a Leonin Crystal at a target location that damages enemies.'],
    ['Meow, Rhythm of Joy!', 'Dashes in a direction; hitting an enemy or crystal starts a musical beat—dashing on the beat lets her dash up to 4 times in a row while gaining CC immunity!'],
    ['Ha, Electrifying Beats!', 'Unlocks after dashing with her 2nd Skill; removes all debuffs on herself, boosts speed, and unleashes 8 rhythmic electric shockwaves around her.']
  ],
  [
    'Nolan', 'Cosmic Wayfinder', 'Assassin', 'Jungle', '🌌', 'daggers', 'blink_dash', 450,
    0x4338ca, 0x0f172a, 0x818cf8, 2, 0.5, 5,
    ['Dimensional Rift', 'His skills leave cosmic rifts on the ground; when two rifts touch, they explode together to pull enemies inward and restore Nolan\'s Energy.'],
    ['Expansion', 'Slashes in a rectangular area in front of him, leaving a horizontal cosmic rift.'],
    ['Gauge', 'Dashes forward, leaving a diagonal cosmic rift along his path.'],
    ['Fracture', 'Cleanses all debuffs on himself, slashes a target area 3 times to create 3 rifts at once, and dashes backward.']
  ],
  [
    'Mathilda', 'Swift Plume', 'Assassin', 'Roam', '🕊️', 'staff', 'heal_shield', 350,
    0x0284c7, 0x075985, 0xbae6fd, 12, 0.5, 0,
    ['Ancestral Guidance', 'Moving builds Ancestral Guidance; at full stacks, her next basic attack deals bonus Magic Damage and boosts her movement speed.'],
    ['Soul Bloom', 'Summons up to 6 wisps around herself that automatically home in on nearby enemies.'],
    ['Guiding Wind', 'Leaps forward and creates a wind field around herself—any ally near Mathilda gets a free Guiding Wind button that lets them fly directly to Mathilda\'s side!'],
    ['Circling Eagle', 'Locks onto an enemy hero and circles around them rapidly in mid-air while firing wisps, then slams into them to knock them airborne.']
  ],
  [
    'Harley', 'Mage Genius', 'Assassin', 'Jungle', '🎩', 'daggers', 'burst', 250,
    0x7c3aed, 0x4c1d95, 0xfde047, -2, 0.4, 4,
    ['Magic Master', 'Basic attacks deal Magic Damage and reduce the target\'s Magic Defense (stacks up to 10 times).'],
    ['Poker Trick', 'Rapidly fires 3 waves of playing cards forward while moving freely.'],
    ['Space Escape', 'Teleports forward while leaving his magic hat behind; pressing it again within 4 seconds teleports Harley straight back to his hat.'],
    ['Deadly Magic', 'Fires a ring of fire onto an enemy hero that lasts 4 seconds—at the end, it explodes to deal massive bonus damage equal to 50% of all damage the target took while the ring was active!']
  ],
  [
    'Kadita', 'Ocean Goddess', 'Assassin', 'Mid Lane', '🌊', 'halberd', 'burst', 300,
    0x0891b2, 0x164e63, 0x22d3ee, 6, 0.3, 4,
    ['Thalassophobia', 'After taking damage, she gains a blessing that heals back 65% of the HP she lost over 4 seconds.'],
    ['Ocean Ode', 'Turns into a mermaid and rides a wave forward while gaining CC immunity and 50% damage reduction, returning to her starting spot afterward.'],
    ['Breath of the Ocean', 'Summons a water geyser beneath a target area that erupts after a delay to knock enemies high into the air.'],
    ['Rough Waves', 'Dives underground completely untargetable, sending out 6 giant tsunami waves in all directions that return to her for massive burst damage.']
  ],
  [
    'Nana', 'Sweet Leonin', 'Mage', 'Mid Lane', '🐾', 'staff', 'cc_pull', 100,
    0xec4899, 0x831843, 0xf9a8d4, 4, 0.2, 0,
    ['Molina\'s Gift', 'Upon taking fatal damage, Nana transforms into an untargetable furry creature for 2 seconds with 70% extra movement speed, escaping death (150s cooldown).'],
    ['Magic Boomerang', 'Throws a giant boomerang forward that damages and slows enemies both on the way out and on the way back.'],
    ['Molina Smooch', 'Summons Molina in an area—any enemy who walks nearby gets chased and transformed into a helpless little critter (silenced and slowed).'],
    ['Molina Blitz', 'Calls down 3 massive paw-shaped explosions in a line; hitting an enemy twice stuns them.']
  ],
  [
    'Gord', 'Professor of the Mystic', 'Mage', 'Mid Lane', '🛸', 'staff', 'dot_burn', 150,
    0x0284c7, 0x0369a1, 0x38bdf8, 0, 0.4, 2,
    ['Mystic Favor', 'After hitting an enemy 4 times with skills or basic attacks, the 4th hit triggers an explosion of True Damage and slows them.'],
    ['Mystic Projectile', 'Throws a bouncing magic bomb that explodes on impact to damage and stun enemies.'],
    ['Mystic Injunction', 'Summons an energy field on the ground that rapidly ticks Magic Damage 10 times.'],
    ['Mystic Gush', 'Fires a continuous giant laser beam in a chosen direction for 3 seconds (can slowly rotate the beam\'s angle).']
  ],
  [
    'Kagura', 'Onmyouji Master', 'Mage', 'Mid Lane', '☂️', 'staff', 'blink_dash', 350,
    0x2563eb, 0x1e3a8a, 0x93c5fd, 4, 0.2, 4,
    ['Yin Yang Gathering', 'Whenever she reunites with her Seimei Umbrella, she gains a shield, stuns nearby enemies, and slows them.'],
    ['Seimei Umbrella Open', 'Sends her umbrella flying to a target location, damaging and slowing enemies in its path.'],
    ['Rasho Umbrella Flee', 'With Umbrella: Dashes away while removing all Crowd Control debuffs and leaving her umbrella behind. Without Umbrella: Teleports directly to her umbrella\'s location.'],
    ['Yin Yang Overturn', 'With Umbrella: Knocks back and slows nearby enemies. Without Umbrella: Emits dark chains around the umbrella that pull all linked enemies together after 1.5 seconds for massive burst damage.']
  ],
  [
    'Cyclops', 'Starsoul Magician', 'Mage', 'Mid Lane', '🪐', 'staff', 'cc_pull', 150,
    0x6d28d9, 0x312e81, 0xa855f7, 8, 0.3, 1,
    ['Starlit Hourglass', 'Every time any of his skills hits an enemy, all of his skill cooldowns are reduced by 0.5 seconds.'],
    ['Stardust Shock', 'Fires two shockwaves forward in a straight line.'],
    ['Planets Attack', 'Summons 5 starlight spheres that orbit around him, boosting his movement speed before homing in on nearby enemies.'],
    ['Star Power Lockdown', 'Launches a giant planetary sphere that chases down an enemy hero across obstacles and immobilizes (roots) them for up to 2 seconds.']
  ],
  [
    'Aurora', 'Maiden of the Glacier', 'Mage', 'Mid Lane', '❄️', 'staff', 'cc_pull', 250,
    0x0891b2, 0x0c4a6e, 0xbae6fd, 6, 0, 3,
    ['Pride of Ice', 'Upon taking fatal damage, she freezes herself in solid ice for 1.5 seconds, becoming completely invulnerable and recovering 30% Max HP.'],
    ['Hailstone Blast', 'Calls down giant hailstones into a target area that damage and slow enemies.'],
    ['Frosty Breeze', 'Blows freezing wind in a fan shape, freezing enemies solid in place.'],
    ['Frigid Glacier', 'Creates a massive glacial path that erupts in shattering ice, freezing all caught enemies inside the area.']
  ],
  [
    'Vexana', 'Shimmer of Hope', 'Mage', 'Mid Lane', '👻', 'staff', 'summon_pet', 250,
    0x0f766e, 0x134e4a, 0x5eead4, 6, 0.1, 2,
    ['Nether Touch', 'Her skills apply Nether Curse to enemies—when a cursed enemy dies, they explode for heavy AoE Magic Damage.'],
    ['Deathly Grasp', 'Fires a phantom claw forward that terrifies the first enemy hero hit, forcing them to walk helplessly away while spectral hands erupt around them.'],
    ['Cursed Blast', 'Marks a circular area with dark energy that explodes after 1 second for heavy AoE damage.'],
    ['Eternal Guard', 'Summons a giant Undead Knight onto a target area to knock enemies airborne, fighting alongside Vexana for 15 seconds.']
  ],
  [
    'Odette', 'Swan Princess', 'Mage', 'Mid Lane', '🦢', 'staff', 'burst', 200,
    0x4338ca, 0x312e81, 0xc4b5fd, 4, 0, 4,
    ['Lakeshore Ambience', 'After casting any skill, her next basic attack releases a bouncing sound wave that ricochets between nearby enemies.'],
    ['Avian Authority', 'Concentrates energy to summon a swan that flies forward, damaging and slowing enemies.'],
    ['Blue Nova', 'Fires a magic energy ball forward that immobilizes (binds) an enemy and splits into secondary balls to bind nearby targets.'],
    ['Swan Song', 'Leaps forward and channels a massive musical arena for 5 seconds, gaining a huge shield and continuously dealing massive AoE damage to all enemies inside.']
  ],
  [
    'Zhask', 'King of Swarms', 'Mage', 'Mid Lane', '👾', 'staff', 'summon_pet', 300,
    0x7e22ce, 0x3b0764, 0xd8b4fe, 2, -0.1, 3,
    ['Decimation', 'Upon dying, he summons a frenzied Nightmaric Spawn on the spot that slows and attacks his killer.'],
    ['Nightmaric Spawn', 'Summons an alien turret creature that automatically fires death rays at nearby enemies.'],
    ['Mind Eater', 'Fires a penetrating psychic beam in a line (his Spawn fires a synchronized beam at the same target, stunning enemies hit by both).'],
    ['Hive Clones', 'Releases 5 exploding alien mines across an area that slow enemies.'],
    ['Dominator\'s Descent', 'Fuses inside a giant, super-powered Nightmaric Spawn with massive HP and upgraded abilities (can eject out to reposition).']
  ],
  [
    'Pharsa', 'Wings of Vengeance', 'Mage', 'Mid Lane', '🦅', 'staff', 'snipe', 300,
    0x6b21a8, 0x1e1b4b, 0xc084fc, 0, 0.2, 5,
    ['Spiritual Unity', 'Her bird Verri periodically enters hunting mode, empowering Pharsa\'s next attack to deal bonus damage and slow the enemy.'],
    ['Curse of Crow', 'Casts a magic spell on an area that marks enemies—hitting a marked enemy with any other skill stuns them.'],
    ['Energy Impact', 'Releases a wide wave of magic energy forward.'],
    ['Feathered Air Strike', 'Flies into the air and bombards a huge circle around her with up to 4 massive orbital magic strikes.'],
    ['Wings by Wings', 'Transforms into mist wrapped around Verri, flying rapidly over walls and obstacles across the map.']
  ],
  [
    'Valir', 'Son of Flames', 'Mage', 'Mid Lane', '🔥', 'staff', 'dot_burn', 200,
    0xdc2626, 0x991b1b, 0xfb923c, 6, 0.2, 2,
    ['Ashing', 'His skills apply Blaze stacks; at 3 stacks, the enemy erupts in an explosion that stuns them and deals percentage Max-HP damage.'],
    ['Burst Fire', 'Launches a fireball that explodes on impact and leaves burning ground (holds 2 charges; hitting an enemy hero refunds a charge immediately!).'],
    ['Searing Torrent', 'Unleashes a giant wall of fire forward that knocks back all enemies in front of him and leaves a burning trail.'],
    ['Vengeance Flame', 'Immediately removes all Crowd Control debuffs on himself and ignites 4 flames that boost his movement speed and empower his 1st and 2nd Skills.']
  ],
  [
    'Chang\'e', 'Moon Palace Immortal', 'Mage', 'Mid Lane', '🐇', 'staff', 'burst', 250,
    0xf59e0b, 0x78350f, 0xfef08a, 2, 0.4, 2,
    ['Trouble Maker', 'Every time she damages an enemy, she leaves a mark that increases her subsequent skill damage against that target (up to 40%).'],
    ['Starmoon Shockwave', 'Fires an energy ball forward that slows enemies (if her 2nd Skill shield is active, her Rabbit fires 4 extra balls alongside it!).'],
    ['Crescent Moon', 'Gains a protective shield, movement speed, and enhances both her basic attacks and her 1st Skill.'],
    ['Meteor Shower', 'Channels a rapid machine-gun barrage of 30 meteors forward in a line for 4 seconds while moving at high speed.']
  ],
  [
    'Vale', 'Windtalker', 'Mage', 'Mid Lane', '🌪️', 'staff', 'cc_pull', 200,
    0x0284c7, 0x075985, 0x7dd3fc, 2, 0.4, 3,
    ['Windtalk', 'Gains permanent Movement Speed stacks whenever he gets a kill or assist (up to 10 stacks).'],
    ['Wind Blade', 'Unleashes two wind blades from the left and right toward a target point.'],
    ['Windblow', 'Sends a whirlwind forward that knocks enemies airborne and leaves a lingering tornado that continuously damages them.'],
    ['Windstorm', 'Summons a massive cyclone in an area that pulls all caught enemies violently into the center before exploding for huge AoE damage.']
  ],
  [
    'Lunox', 'Twilight Goddess', 'Mage', 'Mid Lane', '☯️', 'staff', 'burst', 350,
    0x7c3aed, 0xfacc15, 0xf472b6, 2, 0.2, 5,
    ['Dreamland Twist', 'Converts Cooldown Reduction into Magic Penetration (in Chaos mode) or Spell Vamp (in Order mode).'],
    ['Starlight Pulse', 'Summons starlight rain that damages enemies and heals Lunox, shifting her toward Order (Light).'],
    ['Chaos Assault', 'Fires a dark energy bolt that deals percentage Max-HP damage and slows enemies, shifting her toward Chaos (Dark).'],
    ['Cosmic Fission', 'Unleashes a wave of light and dark energy that slows enemies in a line.'],
    ['Order & Chaos', 'In Light Mode: Turns into a glowing orb completely immune to all damage and CC while damaging nearby enemies. In Dark Mode: Dashes forward and removes the cooldown on her 2nd Skill for 4 seconds, allowing rapid-fire dark bolts!']
  ],
  [
    'Harith', 'Time Traveler', 'Mage', 'Jungle', '⏳', 'staff', 'blink_dash', 350,
    0x2563eb, 0x1e3a8a, 0x60a5fa, 4, 0.5, 3,
    ['Key Insight', 'Gains up to 35% Hybrid Lifesteal based on the number of nearby enemy heroes.'],
    ['Synchro Fission', 'Creates a phantom of himself across from him that fires a wave toward Harith, causing an explosion where they meet.'],
    ['Chrono Dash', 'Dashes in a chosen direction, gaining a shield and empowering his next basic attack to slow the target and reduce this skill\'s cooldown.'],
    ['Zaman Force', 'Summons a giant dimensional rift on the ground that slows enemies and massively reduces the cooldown of his 2nd Skill, letting him dash nonstop!']
  ],
  [
    'Lylia', 'Little Witch', 'Mage', 'Mid Lane', '🦇', 'staff', 'dot_burn', 350,
    0x6b21a8, 0x3b0764, 0xd8b4fe, 4, 0.4, 3,
    ['Angry Gloom', 'Gains extra movement speed whenever she stays near her Gloom shadow creatures.'],
    ['Magic Shockwave', 'Sends out a wave that leaves a Gloom creature at the end of its path.'],
    ['Shadow Energy', 'Drops dark energy onto an area (holds up to 5 charges)—if it touches Gloom, Gloom devours it and explodes in a larger radius!'],
    ['Black Shoes', 'Rewinds time back to the exact spot her Black Shoes stood 4 seconds ago, restoring her HP and Mana to what they were 4 seconds earlier and refilling all 2nd Skill charges!']
  ],
  [
    'Cecilion', 'Embrace of Night', 'Mage', 'Mid Lane', '🧛', 'staff', 'snipe', 350,
    0x881337, 0x18181b, 0xf43f5e, 0, -0.1, 6,
    ['Overflowing', 'Every time his skills hit an enemy, his Max Mana permanently increases (stacks infinitely)—and all of his skill damage scales directly with his Max Mana!'],
    ['Bat Impact', 'Commands a giant bat to dive onto a target location (can be spammed rapidly, though mana cost rises temporarily with consecutive casts).'],
    ['Sanguine Claws', 'Summons two spectral claws that slam together, pulling enemies into the center and immobilizing them.'],
    ['Bats Feast', 'Unleashes 40 blood bolts from his cloak while gaining slow immunity and speed, healing Cecilion for every bolt that hits an enemy.']
  ],
  [
    'Luo Yi', 'Yin-Yang Geomancer', 'Mage', 'Mid Lane', '☯️', 'staff', 'cc_pull', 300,
    0x4f46e5, 0x1e1b4b, 0xfbbf24, 6, 0.1, 3,
    ['Duality', 'Skills apply either Yin (Dark) or Yang (Light) marks to enemies—whenever a Yin-marked hero and a Yang-marked hero get close to each other, they violently slam together and get stunned!'],
    ['Dispersion', 'Fires Yin or Yang energy forward in a fan shape (switches color after each cast).'],
    ['Rotation', 'Summons a continuous circle of Yin or Yang energy on the ground that slows and damages enemies (switches color after each cast).'],
    ['Diversion', 'Creates a giant Teleport Circle around herself and another across the map—after 3 seconds, Luo Yi and all allied heroes standing inside are teleported across the map!']
  ],
  [
    'Yve', 'Astrowarden', 'Mage', 'Mid Lane', '🌌', 'staff', 'burst', 400,
    0x4338ca, 0x312e81, 0xc084fc, 4, 0.1, 4,
    ['Galactic Power', 'Gains stacks whenever her 1st or 2nd Skills hit enemy heroes, granting extra shields and strikes during her Ultimate.'],
    ['Void Blast', 'Detonates galactic energy in a circular area, dealing bonus damage in the center.'],
    ['Void Crystal', 'Summons a Void Crystal that fires a continuous slowing beam across a chosen path.'],
    ['Real World Manipulation', 'Creates a massive 7x7 starry chessboard arena for 15 seconds while gaining CC immunity—tapping tiles causes instant explosions, and sliding across tiles creates a slowing laser line!']
  ],
  [
    'Valentina', 'Prophetess of the Night', 'Mage', 'Mid Lane', '🔮', 'staff', 'blink_dash', 400,
    0x6b21a8, 0x1e1b4b, 0xe879f9, 8, 0.3, 4,
    ['Primal Force', 'Gains extra EXP every time she damages an enemy hero, and converts damage dealt into HP healing if her level is higher than the target\'s.'],
    ['Shadow Strike', 'Fires shadow bolts in a fan shape that mark enemies—hitting a marked enemy a second time terrifies (fears) them.'],
    ['Shadow Step', 'Dashes forward while firing 3 homing shadow bolts (holds 2 charges and reduces her 1st Skill cooldown).'],
    ['I Am You', 'Steals the exact Ultimate ability of any targeted enemy hero, allowing Valentina to transform into that enemy hero and cast their Ultimate against them!']
  ],
  [
    'Xavier', 'Defier of Light', 'Mage', 'Mid Lane', '✨', 'staff', 'snipe', 350,
    0x1d4ed8, 0x1e3a8a, 0x93c5fd, 4, 0.1, 4,
    ['Transcendence', 'Hitting enemies with skills upgrades his transcendence stage (up to Stage 3), massively expanding the size of his skills and reducing their cooldowns.'],
    ['Infinite Extension', 'Fires a mystic bullet that extends its range every time it passes through an enemy or his 2nd Skill barrier.'],
    ['Mystic Field', 'Creates a Mystic Barrier that speeds up allies and slows enemies—hitting it with his 1st or 3rd Skill expands it into a giant trap that immobilizes all enemies inside.'],
    ['Dawning Light', 'Fires a colossal laser beam that stretches all the way across the entire map from base to base, instantly putting him into Stage 3 Transcendence!']
  ],
  [
    'Novaria', 'Star Rebel', 'Mage', 'Mid Lane', '🌠', 'staff', 'snipe', 400,
    0x4f46e5, 0x0f172a, 0xa5b4fc, 0, 0.4, 5,
    ['Star Trail', 'Her Astral Spheres continuously slow enemies and grant vision of surrounding areas.'],
    ['Astral Meteor', 'Calls down a meteor onto an area that shatters into lingering stardust.'],
    ['Astral Recall', 'Summons an Astral Sphere from afar and draws it to herself while phasing through walls with extra speed; pressing it again snipes the sphere at extreme range (damage scales with travel distance).'],
    ['Astral Echo', 'Sends a massive wave of Astral Echoes across a wide area, revealing hidden enemies in bushes/stealth and increasing their hitbox size by 2.5x!']
  ],
  [
    'Zhuxin', 'Beacon of Spirits', 'Mage', 'Mid Lane', '🏮', 'staff', 'cc_pull', 450,
    0xbe123c, 0x4c0519, 0xfda4af, 6, 0.3, 2,
    ['Crimson Butterflies', 'Converts mana spent on her 2nd Skill into crimson butterflies that follow her lantern and restore her mana when she stops channeling.'],
    ['Fluttering Grace', 'Waves her fan in a cone to steal Movement Speed from enemies and give it to herself.'],
    ['Lantern Flare', 'Channels a floating Soul Lantern that you can move freely—enemies caught inside build up Soul Snare stacks until Zhuxin lifts them into the air and throws them to any chosen spot!'],
    ['Crimson Beacon', 'Blinks to a target location, gaining a shield and creating a swirling butterfly field that continuously damages enemies and applies Soul Snare stacks.']
  ],
  [
    'Zetian', 'Celestial Empress', 'Mage', 'Mid Lane', '🐦‍🔥', 'staff', 'snipe', 500,
    0xb45309, 0x7c2d12, 0xfef08a, 4, 0.2, 4,
    ['Celestial Armament', 'Gains extra Spell Vamp; whenever an enemy approaches close, her phoenix spirit automatically blasts them back with a protective barrier.'],
    ['Phoenix Strike', 'Launches a phoenix wave forward that hits 3 times in succession, pulling enemies slightly on the final strike.'],
    ['Phoenix Descent', 'Summons a phoenix spirit at a target location that damages, slows, and reduces enemy Magic Defense (can be redirected once).'],
    ['Fury of the Phoenix', 'Empowers all allied heroes with movement speed while calling down global phoenix strikes onto all 5 enemy heroes across the entire map, revealing and stunning them!']
  ],
  [
    'Rafaela', 'Wings of Holiness', 'Support', 'Roam', '✨', 'halberd', 'heal_shield', 100,
    0x0284c7, 0xfef08a, 0x7dd3fc, 6, 0.2, 0,
    ['Divine Resurrection', 'Grants a special active blessing skill that allows her to revive a fallen allied hero directly at the base after a short channel!'],
    ['Light of Retribution', 'Strikes the 3 nearest enemies with holy light, revealing hidden enemies and slowing them.'],
    ['Holy Healing', 'Restores HP to herself and all nearby allies (prioritizing the most injured ally) while granting a burst of movement speed and slow immunity.'],
    ['Holy Baptism', 'Fires a wide beam of holy light forward that damages and stuns all enemies in a straight line.']
  ],
  [
    'Estes', 'Moon Elf King', 'Support', 'Roam', '🍃', 'halberd', 'heal_shield', 200,
    0x15803d, 0x064e3b, 0x4ade80, 10, 0.1, -2,
    ['Scripture of the Moon Elf', 'Charges moonlight energy over time; at 100 stacks, his next basic attack fires a bouncing moonlight beam that damages and slows enemies.'],
    ['Moonlight Immersion', 'Links himself to a target ally, immediately healing them and continuously regenerating their HP for 3 seconds.'],
    ['Domain of Moon God', 'Drops a moonlight flood zone on the ground that reveals enemies and heavily slows anyone who crosses its outer edge.'],
    ['Blessing of Moon Goddess', 'Unleashes a massive enhanced version of his 1st Skill that links and rapidly heals all nearby allied heroes simultaneously!']
  ],
  [
    'Angela', 'Bunnylove', 'Support', 'Roam', '🎀', 'halberd', 'heal_shield', 250,
    0xec4899, 0x831843, 0xf9a8d4, -2, 0.4, 0,
    ['Smart Heart', 'Every time she casts a skill, her movement speed increases (up to 30%), and this bonus also transfers to whichever ally she is attached to.'],
    ['Love Waves', 'Fires a wave of love energy forward that heals allies and applies Lover\'s Marks to enemies (holds up to 5 charges).'],
    ['Puppet-on-a-String', 'Tethers an enemy with a puppet string—if the enemy fails to break the tether within 3 seconds, they get immobilized (stunned) in place.'],
    ['Heartguard', 'Channels a shield onto any allied hero anywhere on the map and teleports directly inside their body for 12 seconds, casting her 1st and 2nd Skills with zero mana cost from inside them!']
  ],
  [
    'Diggie', 'Timekeeper', 'Support', 'Roam', '🦉', 'halberd', 'cc_pull', 300,
    0xd97706, 0x78350f, 0xfde047, 0, 0.3, 1,
    ['Young Again', 'When Diggie dies, he turns into an invulnerable Egg that can roam freely around the map (annoying enemies and granting vision) until he revives right on the spot!'],
    ['Auto Alarm Bomb', 'Throws little owl alarms (up to 3 charges) that chase nearby enemies and explode, slowing them.'],
    ['Reverse Time', 'Locks a magic mark onto an enemy—after 4 seconds (or if they try to run out of the circle), they get pulled violently back to their starting spot.'],
    ['Time Journey', 'Immediately cleanses all Crowd Control debuffs from himself and all nearby allies, granting everyone a huge shield and 100% Crowd Control immunity for 3 seconds!']
  ],
  [
    'Floryn', 'Budding Hope', 'Support', 'Roam', '🌱', 'halberd', 'heal_shield', 300,
    0x16a34a, 0x052e16, 0x86efac, 4, 0.2, 0,
    ['Dew', 'Carries a special Lantern of Hope item that she can share with one allied hero at any time from the fountain, boosting that ally\'s stats and evolving her skills.'],
    ['Sow', 'Throws an energy seed at an enemy that bounces healing fruits directly to all nearby allies.'],
    ['Sprout', 'Fires a blob of energy forward that explodes on impact and stuns enemies in an area.'],
    ['Bloom', 'Sends out 2 waves of healing light that heal all 5 allied heroes across the entire map regardless of distance, while granting them a shield and anti-heal immunity!']
  ],
  [
    'Carmilla', 'Shadow of Twilight', 'Support', 'Roam', '🩸', 'halberd', 'cc_pull', 250,
    0x881337, 0x4c0519, 0xfb7185, 22, 0.2, 2,
    ['Vampire Pact', 'Steals Physical and Magic Defense from every enemy hero she damages (up to 5 stacks).'],
    ['Crimson Flower', 'Summons two spinning crimson flowers around herself that damage enemies, slow them, and heal Carmilla on every hit.'],
    ['Bloodbath', 'Builds up movement speed; pressing it again fires a blood wave at an enemy to stun them for up to 1.75 seconds.'],
    ['Curse of Blood', 'Throws a Blood Curse into an area that links up to 4 enemy heroes together—any damage or Crowd Control applied to one linked enemy is shared across all linked enemies!']
  ],
  [
    'Faramis', 'Alchemist', 'Support', 'Mid Lane', '⚗️', 'halberd', 'heal_shield', 300,
    0x0e7490, 0x164e63, 0x5eead4, 6, 0.3, 2,
    ['Vicious Retrieval', 'Collects soul fragments dropped whenever units die or get hit by his skills, healing himself, reducing his respawn timer, and boosting his Magic Power.'],
    ['Shadow Stampede', 'Enters spectral Shadow state—ignoring walls, gaining speed, and pulling all touched enemy heroes back toward him when the state ends.'],
    ['Ghost Bursters', 'Blasts ghostly energy in a fan shape that splits and bounces between nearby enemies for heavy AoE burst.'],
    ['Cult Altar', 'Creates a spectral Nether Realm around himself that grants extra HP bars (death protection) to himself and all nearby allies—if an ally\'s extra HP bar is depleted, they survive instead of dying!']
  ]
];

export const MOBA_HEROES: MobaHeroDef[] = HERO_TUPLES.map((tuple, idx) => buildHero(idx, tuple));

export const MOBA_ROLES: MobaRole[] = ['Marksman', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Support'];

export type MobaModeId = 'classic' | 'ranked' | 'brawl' | 'ai_vs' | 'custom' | 'overdrive';

export interface MobaModeDef {
  id: MobaModeId;
  title: string;
  badge: string;
  sub: string;
  rewardMult: number;
  allowTrialAll: boolean;
  hasBans?: boolean;
  disableRecall?: boolean;
  cdMult?: number;
}

export const MOBA_MODES: MobaModeDef[] = [
  {
    id: 'ranked',
    title: '🏆 Ranked Draft',
    badge: 'BANS · +50%',
    sub: 'Draft Pick with Hero Bans & 10-Tier Rank Climb (Warrior → Mythical Immortal)',
    rewardMult: 1.5,
    allowTrialAll: false,
    hasBans: true,
    cdMult: 1.0
  },
  {
    id: 'classic',
    title: '⚔️ Classic 5v5',
    badge: 'STANDARD',
    sub: 'Authentic 3-lane Land of Dawn 5v5 clash with owned & trial heroes',
    rewardMult: 1.0,
    allowTrialAll: false,
    cdMult: 1.0
  },
  {
    id: 'brawl',
    title: '🔥 Brawl Chaos',
    badge: 'NO RECALL',
    sub: 'Single-lane fast skirmish · -35% CD · Rapid waves · No base recall heal',
    rewardMult: 1.15,
    allowTrialAll: false,
    disableRecall: true,
    cdMult: 0.65
  },
  {
    id: 'ai_vs',
    title: '🤖 VS A.I. / Training',
    badge: 'ALL 129 FREE',
    sub: 'Try ANY of the 129 canonical heroes free & test builds/combos',
    rewardMult: 0.75,
    allowTrialAll: true,
    cdMult: 0.85
  },
  {
    id: 'overdrive',
    title: '⚡ Arcade Overdrive',
    badge: '-70% CD',
    sub: 'Mayhem cooldowns, super-fast gold & hyper teamfight brawls',
    rewardMult: 1.25,
    allowTrialAll: true,
    cdMult: 0.35
  },
  {
    id: 'custom',
    title: '🎛️ Custom Lobby',
    badge: 'SANDBOX',
    sub: 'Private practice match with instant draft pick & all 129 heroes unlocked',
    rewardMult: 0.6,
    allowTrialAll: true,
    cdMult: 0.8
  }
];

export interface MobaEmblemDef {
  role: MobaEmblemId;
  icon: string;
  accentHex: string;
  perLevelAtk: number;
  perLevelHp: number;
  perLevelSpd: number;
  perLevelCdPct: number;
  summary: string;
}

export const MOBA_EMBLEMS: MobaEmblemDef[] = [
  {
    role: 'Common',
    icon: '🌟',
    accentHex: '#cbd5e1',
    perLevelAtk: 3,
    perLevelHp: 14,
    perLevelSpd: 0.25,
    perLevelCdPct: 3,
    summary: 'Hybrid Regen, Adaptive ATK & HP'
  },
  {
    role: 'Marksman',
    icon: '🏹',
    accentHex: '#84fab0',
    perLevelAtk: 4,
    perLevelHp: 6,
    perLevelSpd: 0.35,
    perLevelCdPct: 2,
    summary: '+ATK Speed, Adaptive ATK & Lifesteal'
  },
  {
    role: 'Tank',
    icon: '🛡️',
    accentHex: '#facc15',
    perLevelAtk: 1,
    perLevelHp: 26,
    perLevelSpd: 0.15,
    perLevelCdPct: 2,
    summary: '+Max HP, Hybrid Defense & Regen'
  },
  {
    role: 'Fighter',
    icon: '⚔️',
    accentHex: '#38bdf8',
    perLevelAtk: 3,
    perLevelHp: 16,
    perLevelSpd: 0.2,
    perLevelCdPct: 3,
    summary: '+Spell Vamp, Adaptive ATK & Defense'
  },
  {
    role: 'Assassin',
    icon: '🗡️',
    accentHex: '#e879f9',
    perLevelAtk: 5,
    perLevelHp: 4,
    perLevelSpd: 0.45,
    perLevelCdPct: 3,
    summary: '+Penetration, Adaptive ATK & Move Speed'
  },
  {
    role: 'Mage',
    icon: '🔥',
    accentHex: '#fb923c',
    perLevelAtk: 4,
    perLevelHp: 8,
    perLevelSpd: 0.2,
    perLevelCdPct: 5,
    summary: '+Magic Power, Magic Pen & -Cooldowns'
  },
  {
    role: 'Support',
    icon: '✨',
    accentHex: '#7dd3fc',
    perLevelAtk: 2,
    perLevelHp: 16,
    perLevelSpd: 0.32,
    perLevelCdPct: 5,
    summary: '+Healing Effect, Move Speed & -Cooldowns'
  }
];

export function getEmblemUpgradeCost(curLevel: number): number {
  if (curLevel >= 5) return 0;
  return Math.max(1, curLevel) * 50;
}

export function getMobaEmblemBonus(
  role: MobaEmblemId,
  level: number,
  talents?: MobaEmblemTalentLoadout
): {
  atkBonus: number;
  hpBonus: number;
  spdBonus: number;
  cdReduction: number;
  coreTalentId: string;
} {
  const def = MOBA_EMBLEMS.find((e) => e.role === role) ?? MOBA_EMBLEMS[0];
  const lv = Math.max(1, Math.min(5, level));
  let atkBonus = def.perLevelAtk * lv;
  let hpBonus = def.perLevelHp * lv;
  let spdBonus = def.perLevelSpd * lv;
  let cdPct = def.perLevelCdPct * lv;

  if (talents) {
    for (const tid of [talents.t1, talents.t2]) {
      const t = getTalentById(tid);
      if (!t) continue;
      if (t.atkBonus) atkBonus += t.atkBonus;
      if (t.hpBonus) hpBonus += t.hpBonus;
      if (t.spdBonus) spdBonus += t.spdBonus;
      if (t.cdPct) cdPct += t.cdPct;
    }
  }

  return {
    atkBonus,
    hpBonus,
    spdBonus: Number(spdBonus.toFixed(2)),
    cdReduction: Math.min(0.28, cdPct / 100),
    coreTalentId: talents?.t3 ?? 'killing_spree'
  };
}

export interface MobaQuestDef {
  id: string;
  title: string;
  desc: string;
  target: number;
  rewardCoins: number;
  stat: 'matches' | 'kills' | 'turrets' | 'wins' | 'heroes';
}

export const MOBA_QUESTS: MobaQuestDef[] = [
  { id: 'first_blood', title: 'Arena Debut', desc: 'Play 1 Legends Arena match', target: 1, rewardCoins: 45, stat: 'matches' },
  { id: 'slayer_5', title: 'Chain Slayer', desc: 'Defeat 5 enemy heroes or Lords', target: 5, rewardCoins: 75, stat: 'kills' },
  { id: 'siege_3', title: 'Tower Breaker', desc: 'Destroy 3 enemy turrets', target: 3, rewardCoins: 90, stat: 'turrets' },
  { id: 'champion_2', title: 'Twin Victories', desc: 'Win 2 Legends Arena matches', target: 2, rewardCoins: 120, stat: 'wins' },
  { id: 'collector_6', title: 'Hero Collector', desc: 'Unlock 6 heroes in Hero Store', target: 6, rewardCoins: 150, stat: 'heroes' }
];

export function getMobaQuestValue(
  quest: MobaQuestDef,
  stats: {
    matches: number;
    kills: number;
    turrets: number;
    wins: number;
    unlockedCount: number;
  }
): number {
  switch (quest.stat) {
    case 'matches': return stats.matches;
    case 'kills': return stats.kills;
    case 'turrets': return stats.turrets;
    case 'wins': return stats.wins;
    case 'heroes': return stats.unlockedCount;
  }
}

export interface MobaLeaderboardRow {
  name: string;
  points: number;
  wins: number;
  rankTitle: string;
  isPlayer: boolean;
}

const LEADERBOARD_RIVALS: { name: string; points: number; wins: number }[] = [
  { name: 'KairiHyper99', points: 620, wins: 22 },
  { name: 'FannyCableGod', points: 510, wins: 17 },
  { name: 'TigrealSetPro', points: 420, wins: 14 },
  { name: 'YveChessQueen', points: 345, wins: 11 },
  { name: 'FrancoHookKing', points: 270, wins: 9 },
  { name: 'KaguraUmbrella', points: 210, wins: 7 },
  { name: 'JohnsonDrift', points: 145, wins: 5 },
  { name: 'LaylaGoldLane', points: 90, wins: 3 }
];

export const MOBA_RANKS = [
  'Warrior',
  'Elite',
  'Master',
  'Grandmaster',
  'Epic',
  'Legend',
  'Mythic',
  'Mythical Honor',
  'Mythical Glory',
  'Mythical Immortal'
];

export function getMobaRankTitle(wins: number): string {
  const w = Math.max(0, wins);
  if (w >= 20) return MOBA_RANKS[9]; // Mythical Immortal
  if (w >= 16) return MOBA_RANKS[8]; // Mythical Glory
  if (w >= 13) return MOBA_RANKS[7]; // Mythical Honor
  if (w >= 10) return MOBA_RANKS[6]; // Mythic
  if (w >= 8) return MOBA_RANKS[5]; // Legend
  if (w >= 6) return MOBA_RANKS[4]; // Epic
  if (w >= 4) return MOBA_RANKS[3]; // Grandmaster
  if (w >= 2) return MOBA_RANKS[2]; // Master
  if (w >= 1) return MOBA_RANKS[1]; // Elite
  return MOBA_RANKS[0]; // Warrior
}

export function computeMobaLeaderboard(playerName: string, wins: number, kills: number): MobaLeaderboardRow[] {
  const playerPts = Math.max(0, wins * 25 + kills * 2);
  const rows: MobaLeaderboardRow[] = LEADERBOARD_RIVALS.map((r) => ({
    name: r.name,
    points: r.points,
    wins: r.wins,
    rankTitle: getMobaRankTitle(r.wins),
    isPlayer: false
  }));
  rows.push({
    name: playerName || 'You',
    points: playerPts,
    wins,
    rankTitle: getMobaRankTitle(wins),
    isPlayer: true
  });
  return rows.sort((a, b) => b.points - a.points || Number(b.isPlayer) - Number(a.isPlayer));
}

// =========================================================================
// DAILY MISSION SYSTEM (Resets Daily at Local Midnight)
// =========================================================================
export type MobaDailyMissionStat = 'matches' | 'ranked_wins' | 'kills' | 'jungle' | 'bosses';

export interface MobaDailyMissionDef {
  id: string;
  title: string;
  desc: string;
  target: number;
  rewardCoins: number;
  stat: MobaDailyMissionStat;
}

export const MOBA_DAILY_MISSIONS: MobaDailyMissionDef[] = [
  { id: 'daily_play_3', title: 'Play 3 Matches', desc: 'Complete or enter 3 Legends Arena matches today', target: 3, rewardCoins: 60, stat: 'matches' },
  { id: 'daily_win_ranked', title: 'Win 1 Ranked Game', desc: 'Claim victory in a Ranked Draft match', target: 1, rewardCoins: 100, stat: 'ranked_wins' },
  { id: 'daily_kills_10', title: 'Hero Takedowns', desc: 'Eliminate 10 enemy heroes on the Battlefield', target: 10, rewardCoins: 75, stat: 'kills' },
  { id: 'daily_jungle_6', title: 'Jungle Hunter', desc: 'Slay 6 Jungle Creeps or Buff Golems', target: 6, rewardCoins: 55, stat: 'jungle' },
  { id: 'daily_boss_1', title: 'River Boss Slayer', desc: 'Defeat the River Turtle or The Lord', target: 1, rewardCoins: 90, stat: 'bosses' }
];

export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMillisUntilMidnight(date = new Date()): number {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
  return Math.max(0, next.getTime() - date.getTime());
}

export function formatDailyCountdown(ms: number): string {
  const totalMin = Math.max(1, Math.floor(ms / 60000));
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return `${hrs}h ${String(mins).padStart(2, '0')}m`;
}

export function getMobaDailyMissionValue(
  mission: MobaDailyMissionDef,
  daily: {
    matchesPlayed: number;
    rankedWins: number;
    kills: number;
    jungleSlain: number;
    bossesSlain: number;
  }
): number {
  switch (mission.stat) {
    case 'matches': return daily.matchesPlayed;
    case 'ranked_wins': return daily.rankedWins;
    case 'kills': return daily.kills;
    case 'jungle': return daily.jungleSlain;
    case 'bosses': return daily.bossesSlain;
  }
}

// =========================================================================
// COMPLETE PER-HERO PASSIVE, SKILL 1-4 & 3D VFX RESOLVER (ALL 129 HEROES)
// =========================================================================
export type MobaPassiveKind =
  | 'atk_speed_stack'
  | 'longshot_scale'
  | 'hit_3_proc'
  | 'crit_6th'
  | 'true_5th'
  | 'shield_cc_immune'
  | 'move_fire'
  | 'bush_regen_stealth'
  | 'kill_heal'
  | 'low_hp_armor'
  | 'cd_on_hit'
  | 'lifesteal_aura'
  | 'burn_stacks'
  | 'pet_companion'
  | 'revive_cheat';

export type MobaSkillActionKind =
  | 'dash_strike'
  | 'blink_teleport'
  | 'hook_pull'
  | 'aoe_blast'
  | 'orbital_drop'
  | 'laser_beam'
  | 'fan_volley'
  | 'homing_barrage'
  | 'barrier_shield'
  | 'heal_aura'
  | 'summon_turret'
  | 'summon_clone'
  | 'cc_freeze_root'
  | 'whirlwind_spin'
  | 'transform_form'
  | 'snipe_shot'
  | 'stealth_ambush';

export type MobaVfxKind =
  | 'ring'
  | 'beam'
  | 'meteor'
  | 'slash_arc'
  | 'vortex'
  | 'lightning'
  | 'hook_chain'
  | 'flame_wave'
  | 'frost_burst'
  | 'shield_dome'
  | 'clone_summon'
  | 'turret_summon'
  | 'portal_warp'
  | 'stealth_mist'
  | 'transform_giant';

export type MobaSkillTargeting = 'line' | 'circle' | 'cone' | 'lock' | 'self';
export type MobaSkillMoveKind = 'none' | 'blink' | 'dash' | 'leap' | 'snap_back';
export type MobaCcKind =
  | 'none'
  | 'slow'
  | 'stun'
  | 'root'
  | 'silence'
  | 'fear'
  | 'taunt'
  | 'pull'
  | 'flip'
  | 'knockback';
export type MobaIconicUltKind =
  | 'none'
  | 'tigreal_implosion'
  | 'lancelot_thorned_rose'
  | 'johnson_car'
  | 'yve_chessboard'
  | 'kagura_overturn';
export type MobaElementTheme =
  | 'fire'
  | 'ice'
  | 'lightning'
  | 'wind'
  | 'water'
  | 'shadow'
  | 'nature'
  | 'celestial'
  | 'earth'
  | 'blood'
  | 'steel';

export type MobaElementStatusKind =
  | 'burn'
  | 'freeze'
  | 'shock'
  | 'gust'
  | 'soak'
  | 'curse'
  | 'vine'
  | 'radiant'
  | 'crush'
  | 'bleed'
  | 'none';

export type MobaElementProjectileKind =
  | 'fireball'
  | 'icicle'
  | 'thunder_orb'
  | 'wind_blade'
  | 'hydro_wave'
  | 'shadow_kunai'
  | 'vine_thorn'
  | 'star_bolt'
  | 'boulder'
  | 'blood_scythe'
  | 'steel_tracer';

export interface MobaElementVisualDef {
  theme: MobaElementTheme;
  label: string;
  icon: string;
  primary: number;
  secondary: number;
  core: number;
  glowHex: string;
  projectileKind: MobaElementProjectileKind;
  statusKind: MobaElementStatusKind;
  statusLabel: string;
}

export const MOBA_ELEMENT_PALETTES: Record<MobaElementTheme, MobaElementVisualDef> = {
  fire: {
    theme: 'fire',
    label: 'Pyro Flame',
    icon: '🔥',
    primary: 0xff5a1f,
    secondary: 0xfacc15,
    core: 0xfff3c4,
    glowHex: '#ff6b2b',
    projectileKind: 'fireball',
    statusKind: 'burn',
    statusLabel: 'BURNING'
  },
  ice: {
    theme: 'ice',
    label: 'Glacial Frost',
    icon: '❄️',
    primary: 0x38bdf8,
    secondary: 0xa5f3fc,
    core: 0xf0f9ff,
    glowHex: '#38bdf8',
    projectileKind: 'icicle',
    statusKind: 'freeze',
    statusLabel: 'FROZEN'
  },
  lightning: {
    theme: 'lightning',
    label: 'Storm Volt',
    icon: '⚡',
    primary: 0x60a5fa,
    secondary: 0xfde047,
    core: 0xe0f2fe,
    glowHex: '#60a5fa',
    projectileKind: 'thunder_orb',
    statusKind: 'shock',
    statusLabel: 'SHOCKED'
  },
  wind: {
    theme: 'wind',
    label: 'Gale Tempest',
    icon: '🌪️',
    primary: 0x2dd4bf,
    secondary: 0x99f6e4,
    core: 0xf0fdfa,
    glowHex: '#2dd4bf',
    projectileKind: 'wind_blade',
    statusKind: 'gust',
    statusLabel: 'SWEPT'
  },
  water: {
    theme: 'water',
    label: 'Tidal Surge',
    icon: '🌊',
    primary: 0x0ea5e9,
    secondary: 0x67e8f9,
    core: 0xe0f2fe,
    glowHex: '#0ea5e9',
    projectileKind: 'hydro_wave',
    statusKind: 'soak',
    statusLabel: 'SOAKED'
  },
  shadow: {
    theme: 'shadow',
    label: 'Abyssal Void',
    icon: '🌑',
    primary: 0x9333ea,
    secondary: 0xf43f5e,
    core: 0xe9d5ff,
    glowHex: '#a855f7',
    projectileKind: 'shadow_kunai',
    statusKind: 'curse',
    statusLabel: 'CURSED'
  },
  nature: {
    theme: 'nature',
    label: 'Verdant Bloom',
    icon: '🌿',
    primary: 0x22c55e,
    secondary: 0xa3e635,
    core: 0xdcfce7,
    glowHex: '#22c55e',
    projectileKind: 'vine_thorn',
    statusKind: 'vine',
    statusLabel: 'ENTANGLED'
  },
  celestial: {
    theme: 'celestial',
    label: 'Astral Radiance',
    icon: '✨',
    primary: 0xfacc15,
    secondary: 0xf472b6,
    core: 0xfef9c3,
    glowHex: '#fbbf24',
    projectileKind: 'star_bolt',
    statusKind: 'radiant',
    statusLabel: 'SEARED'
  },
  earth: {
    theme: 'earth',
    label: 'Seismic Stone',
    icon: '🪨',
    primary: 0xd97706,
    secondary: 0xf59e0b,
    core: 0xfde68a,
    glowHex: '#f59e0b',
    projectileKind: 'boulder',
    statusKind: 'crush',
    statusLabel: 'SHATTERED'
  },
  blood: {
    theme: 'blood',
    label: 'Crimson Siphon',
    icon: '🩸',
    primary: 0xe11d48,
    secondary: 0x991b1b,
    core: 0xffcdd2,
    glowHex: '#f43f5e',
    projectileKind: 'blood_scythe',
    statusKind: 'bleed',
    statusLabel: 'BLEEDING'
  },
  steel: {
    theme: 'steel',
    label: 'Kinetic Steel',
    icon: '⚔️',
    primary: 0x94a3b8,
    secondary: 0x38bdf8,
    core: 0xf8fafc,
    glowHex: '#cbd5e1',
    projectileKind: 'steel_tracer',
    statusKind: 'none',
    statusLabel: 'STRUCK'
  }
};

const HERO_BASE_ELEMENT_MAP: Record<string, MobaElementTheme> = {
  // Fire / Magma / Explosive Pyro
  Valir: 'fire',
  'X.Borg': 'fire',
  Thamuz: 'fire',
  Baxia: 'fire',
  Kimmy: 'fire',
  Barats: 'fire',
  Aulus: 'fire',
  Zetian: 'fire',
  Bruno: 'fire',
  Jawhead: 'fire',
  Sun: 'fire',
  Aldous: 'fire',
  'Lapu-Lapu': 'fire',
  Masha: 'fire',

  // Ice / Glacial / Frost
  Aurora: 'ice',
  Atlas: 'ice',
  'Popol and Kupa': 'ice',
  Freya: 'ice',
  Franco: 'ice',
  Hylos: 'ice',

  // Lightning / Storm / Energy Pulse
  Eudora: 'lightning',
  Kaja: 'lightning',
  Joy: 'lightning',
  Johnson: 'lightning',
  Edith: 'lightning',
  Gord: 'lightning',
  Karrie: 'lightning',
  Beatrix: 'lightning',
  Ixia: 'lightning',
  Alpha: 'lightning',
  Saber: 'lightning',
  Claude: 'lightning',
  Chip: 'lightning',
  Harley: 'lightning',
  Natan: 'lightning',

  // Wind / Gale / Swift Blades
  Vale: 'wind',
  Ling: 'wind',
  Zilong: 'wind',
  Mathilda: 'wind',
  Fanny: 'wind',
  Wanwan: 'wind',
  Benedetta: 'wind',
  Chou: 'wind',
  Badang: 'wind',
  Paquito: 'wind',
  Lukas: 'wind',
  'Yi Sun-shin': 'wind',

  // Water / Ocean / Tidal
  Kadita: 'water',
  Bane: 'water',
  Odette: 'water',

  // Shadow / Abyss / Cursed Void
  Hayabusa: 'shadow',
  Helcurt: 'shadow',
  Vexana: 'shadow',
  Kagura: 'shadow',
  Selena: 'shadow',
  Karina: 'shadow',
  Hanzo: 'shadow',
  Julian: 'shadow',
  Natalia: 'shadow',
  Moskov: 'shadow',
  Argus: 'shadow',
  Dyrroth: 'shadow',
  Leomord: 'shadow',
  Terizla: 'shadow',
  Phoveus: 'shadow',
  Arlott: 'shadow',
  Suyou: 'shadow',
  Aamon: 'shadow',
  Nolan: 'shadow',
  Gusion: 'shadow',
  Lylia: 'shadow',
  Valentina: 'shadow',
  Faramis: 'shadow',
  Zhask: 'shadow',
  Pharsa: 'shadow',
  Obsidia: 'shadow',
  Melissa: 'shadow',
  Hanabi: 'shadow',
  Gloo: 'shadow',

  // Nature / Forest / Spirit Flora
  Belerick: 'nature',
  Estes: 'nature',
  Floryn: 'nature',
  Diggie: 'nature',
  Nana: 'nature',
  Irithel: 'nature',
  Hilda: 'nature',
  Akai: 'nature',
  Cici: 'nature',
  Roger: 'nature',
  Guinevere: 'nature',
  Angela: 'nature',
  Zhuxin: 'nature',

  // Celestial / Starlight / Radiant Light
  Rafaela: 'celestial',
  Uranus: 'celestial',
  Lunox: 'celestial',
  Novaria: 'celestial',
  Yve: 'celestial',
  Miya: 'celestial',
  "Chang'e": 'celestial',
  Xavier: 'celestial',
  Harith: 'celestial',
  Cyclops: 'celestial',
  Esmeralda: 'celestial',
  Silvanna: 'celestial',
  Minsitthar: 'celestial',
  Lancelot: 'celestial',
  'Luo Yi': 'celestial',
  Lolita: 'celestial',
  Tigreal: 'celestial',

  // Earth / Seismic / Sand & Stone
  Grock: 'earth',
  Khufra: 'earth',
  Minotaur: 'earth',
  Gatotkaca: 'earth',
  Khaleed: 'earth',
  Fredrinn: 'earth',
  Yin: 'earth',
  Martis: 'earth',

  // Blood / Crimson / Siphon
  Alice: 'blood',
  Ruby: 'blood',
  Alucard: 'blood',
  Balmond: 'blood',
  'Yu Zhong': 'blood',
  Cecilion: 'blood',
  Carmilla: 'blood',

  // Steel / Ballistic / Kinetic Arms
  Layla: 'steel',
  Granger: 'steel',
  Clint: 'steel',
  Brody: 'steel',
  Lesley: 'steel'
};

export function getHeroBaseElementTheme(hero: MobaHeroDef): MobaElementTheme {
  const mapped = HERO_BASE_ELEMENT_MAP[hero.name];
  if (mapped) return mapped;
  const txt = `${hero.title} ${hero.summary} ${hero.passive.name} ${hero.passive.desc}`.toLowerCase();
  if (txt.includes('fire') || txt.includes('flame') || txt.includes('lava') || txt.includes('pyro') || txt.includes('burn')) return 'fire';
  if (txt.includes('ice') || txt.includes('frost') || txt.includes('glaci') || txt.includes('snow') || txt.includes('freez')) return 'ice';
  if (txt.includes('lightning') || txt.includes('thunder') || txt.includes('electric') || txt.includes('volt')) return 'lightning';
  if (txt.includes('wind') || txt.includes('gale') || txt.includes('tempest') || txt.includes('cyclone')) return 'wind';
  if (txt.includes('ocean') || txt.includes('sea') || txt.includes('wave') || txt.includes('tide') || txt.includes('water')) return 'water';
  if (txt.includes('blood') || txt.includes('crimson') || txt.includes('vamp')) return 'blood';
  if (txt.includes('forest') || txt.includes('vine') || txt.includes('nature') || txt.includes('bloom') || txt.includes('leaf')) return 'nature';
  if (txt.includes('rock') || txt.includes('stone') || txt.includes('earth') || txt.includes('sand') || txt.includes('quake')) return 'earth';
  if (txt.includes('shadow') || txt.includes('abyss') || txt.includes('void') || txt.includes('curse') || txt.includes('dark')) return 'shadow';
  if (txt.includes('star') || txt.includes('moon') || txt.includes('holy') || txt.includes('light') || txt.includes('celestial')) return 'celestial';
  if (hero.role === 'Mage') return 'celestial';
  if (hero.role === 'Support') return 'nature';
  if (hero.role === 'Assassin') return 'shadow';
  if (hero.role === 'Tank') return 'earth';
  return 'steel';
}

export function resolveElementStatusEffect(
  elementTheme: MobaElementTheme,
  ccKind: MobaCcKind
): {
  statusKind: MobaElementStatusKind;
  durationSec: number;
  dotDpsRatio: number;
  label: string;
  colorHex: string;
} {
  const pal = MOBA_ELEMENT_PALETTES[elementTheme];
  if (elementTheme === 'fire') {
    return { statusKind: 'burn', durationSec: 3.0, dotDpsRatio: 0.14, label: 'BURN', colorHex: pal.glowHex };
  }
  if (elementTheme === 'ice') {
    const hardFreeze = ccKind === 'stun' || ccKind === 'root' || ccKind === 'pull';
    return {
      statusKind: 'freeze',
      durationSec: hardFreeze ? 1.85 : 2.4,
      dotDpsRatio: 0,
      label: hardFreeze ? 'FROZEN' : 'CHILLED',
      colorHex: pal.glowHex
    };
  }
  if (elementTheme === 'lightning') {
    return { statusKind: 'shock', durationSec: 1.8, dotDpsRatio: 0.06, label: 'SHOCK', colorHex: pal.glowHex };
  }
  if (elementTheme === 'wind') {
    return { statusKind: 'gust', durationSec: 1.5, dotDpsRatio: 0, label: 'GALE', colorHex: pal.glowHex };
  }
  if (elementTheme === 'water') {
    return { statusKind: 'soak', durationSec: 2.2, dotDpsRatio: 0, label: 'SOAKED', colorHex: pal.glowHex };
  }
  if (elementTheme === 'shadow') {
    return { statusKind: 'curse', durationSec: 2.8, dotDpsRatio: 0.1, label: 'CURSED', colorHex: pal.glowHex };
  }
  if (elementTheme === 'nature') {
    return { statusKind: 'vine', durationSec: 2.1, dotDpsRatio: 0.05, label: 'ROOTED', colorHex: pal.glowHex };
  }
  if (elementTheme === 'celestial') {
    return { statusKind: 'radiant', durationSec: 2.0, dotDpsRatio: 0.05, label: 'RADIANT', colorHex: pal.glowHex };
  }
  if (elementTheme === 'earth') {
    return { statusKind: 'crush', durationSec: 1.9, dotDpsRatio: 0, label: 'CRUSHED', colorHex: pal.glowHex };
  }
  if (elementTheme === 'blood') {
    return { statusKind: 'bleed', durationSec: 3.0, dotDpsRatio: 0.13, label: 'BLEED', colorHex: pal.glowHex };
  }
  return { statusKind: 'none', durationSec: 0, dotDpsRatio: 0, label: '', colorHex: pal.glowHex };
}

export function resolveSkillAimPoint(
  originX: number,
  originZ: number,
  normX: number,
  normY: number,
  maxRange: number,
  targeting: MobaSkillTargeting,
  playLimit = 84
): { aimX: number; aimZ: number; aimYaw: number; dist: number } {
  const safeRange = Math.max(2, maxRange);
  const mag = Math.hypot(normX, normY);
  const clampedMag = Math.min(1, mag);
  const dirX = mag > 1e-4 ? normX / mag : 0;
  const dirZ = mag > 1e-4 ? normY / mag : -1;
  const aimYaw = Math.atan2(dirX, dirZ);

  let dist = safeRange * clampedMag;
  if (targeting === 'self') {
    dist = 0;
  } else if (targeting === 'line' || targeting === 'cone') {
    dist = safeRange * Math.max(0.35, clampedMag);
  }

  const rawX = originX + Math.sin(aimYaw) * dist;
  const rawZ = originZ + Math.cos(aimYaw) * dist;
  const aimX = Math.max(-playLimit, Math.min(playLimit, rawX));
  const aimZ = Math.max(-playLimit, Math.min(playLimit, rawZ));
  const finalDist = Math.hypot(aimX - originX, aimZ - originZ);
  return { aimX, aimZ, aimYaw, dist: finalDist };
}

export function triggerHealthTrailDamage(
  prevHp: number,
  nextHp: number,
  prevTrailHp: number,
  prevHoldSec: number,
  holdDurationSec = 0.22
): { trailHp: number; holdSec: number } {
  const safeNext = Math.max(0, nextHp);
  if (safeNext < prevHp) {
    return {
      trailHp: Math.max(prevTrailHp, prevHp),
      holdSec: Math.max(prevHoldSec, holdDurationSec)
    };
  }
  if (safeNext > prevHp) {
    return {
      trailHp: Math.max(safeNext, prevTrailHp <= prevHp ? safeNext : prevTrailHp),
      holdSec: safeNext >= prevTrailHp ? 0 : prevHoldSec
    };
  }
  return { trailHp: Math.max(safeNext, prevTrailHp), holdSec: prevHoldSec };
}

export function stepHealthTrail(
  currentHp: number,
  maxHp: number,
  prevTrailHp: number,
  prevHoldSec: number,
  dt: number
): { trailHp: number; holdSec: number } {
  const safeMax = Math.max(1, maxHp);
  const safeCur = Math.max(0, Math.min(safeMax, currentHp));
  const clampedTrail = Math.max(0, Math.min(safeMax, prevTrailHp));
  if (clampedTrail <= safeCur + 0.001) {
    return { trailHp: safeCur, holdSec: 0 };
  }
  const safeDt = Math.max(0, dt);
  if (prevHoldSec > 0) {
    const nextHold = Math.max(0, prevHoldSec - safeDt);
    return { trailHp: clampedTrail, holdSec: nextHold };
  }
  const gap = clampedTrail - safeCur;
  const decay = Math.max(safeMax * 0.45, gap * 4.8) * safeDt;
  const nextTrail = Math.max(safeCur, clampedTrail - decay);
  return {
    trailHp: nextTrail - safeCur < 0.25 ? safeCur : nextTrail,
    holdSec: 0
  };
}

export function detectCooldownReadySlots<K extends string>(
  prevCds: Partial<Record<K, number>>,
  nextCds: Record<K, number>
): K[] {
  const ready: K[] = [];
  for (const key of Object.keys(nextCds) as K[]) {
    const prev = prevCds[key] ?? 0;
    const next = nextCds[key] ?? 0;
    if (prev > 0 && next <= 0) {
      ready.push(key);
    }
  }
  return ready;
}

export interface MobaSkillEffectSpec {
  slot: 1 | 2 | 3 | 4;
  name: string;
  shortLabel: string;
  icon: string;
  kind: MobaSkillActionKind;
  vfx: MobaVfxKind;
  targeting: MobaSkillTargeting;
  moveKind: MobaSkillMoveKind;
  elementTheme: MobaElementTheme;
  iconicUlt: MobaIconicUltKind;
  cdSec: number;
  dmgMult: number;
  range: number;
  radius: number;
  ccKind: MobaCcKind;
  ccSec: number;
  ccImmuneSec: number;
  healPct: number;
  shieldSec: number;
  hasteSec: number;
  stealthSec: number;
  giantSec: number;
}

export interface MobaHeroCombatKit {
  passiveKind: MobaPassiveKind;
  passiveLabel: string;
  maxStacks: number;
  skills: MobaSkillEffectSpec[];
}

function resolvePassiveKind(hero: MobaHeroDef): { kind: MobaPassiveKind; maxStacks: number; label: string } {
  const txt = `${hero.passive.name} ${hero.passive.desc}`.toLowerCase();
  if (txt.includes('companion') || txt.includes('wolf') || txt.includes('pet') || txt.includes('turret')) {
    return { kind: 'pet_companion', maxStacks: 3, label: hero.passive.name };
  }
  if (txt.includes('bush')) {
    return { kind: 'bush_regen_stealth', maxStacks: 1, label: hero.passive.name };
  }
  if (txt.includes('fatal') || txt.includes('ice block') || txt.includes('egg')) {
    return { kind: 'revive_cheat', maxStacks: 1, label: hero.passive.name };
  }
  if (txt.includes('farther') || txt.includes('distance')) {
    return { kind: 'longshot_scale', maxStacks: 1, label: hero.passive.name };
  }
  if (txt.includes('shield') && (txt.includes('immune') || txt.includes('cc'))) {
    return { kind: 'shield_cc_immune', maxStacks: 4, label: hero.passive.name };
  }
  if (txt.includes('6th') || txt.includes('sixth')) {
    return { kind: 'crit_6th', maxStacks: 6, label: hero.passive.name };
  }
  if (txt.includes('5th') || txt.includes('fifth') || txt.includes('4th') || txt.includes('four')) {
    return { kind: 'true_5th', maxStacks: 5, label: hero.passive.name };
  }
  if (txt.includes('3rd') || txt.includes('third') || txt.includes('every 2') || txt.includes('every 3')) {
    return { kind: 'hit_3_proc', maxStacks: 3, label: hero.passive.name };
  }
  if (txt.includes('blaze') || txt.includes('burn') || txt.includes('scorch') || txt.includes('lava') || txt.includes('curse')) {
    return { kind: 'burn_stacks', maxStacks: 3, label: hero.passive.name };
  }
  if (txt.includes('cooldown')) {
    return { kind: 'cd_on_hit', maxStacks: 3, label: hero.passive.name };
  }
  if (txt.includes('missing hp') || txt.includes('lost hp') || txt.includes('armor')) {
    return { kind: 'low_hp_armor', maxStacks: 5, label: hero.passive.name };
  }
  if (txt.includes('kill') || txt.includes('takedown') || txt.includes('minion')) {
    return { kind: 'kill_heal', maxStacks: 4, label: hero.passive.name };
  }
  if (txt.includes('lifesteal') || txt.includes('heal') || txt.includes('vamp') || txt.includes('drain')) {
    return { kind: 'lifesteal_aura', maxStacks: 4, label: hero.passive.name };
  }
  if (txt.includes('while moving') || txt.includes('hop')) {
    return { kind: 'move_fire', maxStacks: 3, label: hero.passive.name };
  }
  return { kind: 'atk_speed_stack', maxStacks: 5, label: hero.passive.name };
}

function classifySkillSpec(hero: MobaHeroDef, detail: MobaSkillDetail, slot: 1 | 2 | 3 | 4): MobaSkillEffectSpec {
  const txt = `${detail.name} ${detail.desc}`.toLowerCase();
  const isUlt = slot === 3 || slot === 4;
  const cdSec = slot === 1 ? 3.0 : slot === 2 ? 4.8 : slot === 3 ? 8.5 : 7.0;
  const shortWord = detail.name.split(/\s+/)[0].slice(0, 7).toUpperCase();

  let kind: MobaSkillActionKind = 'aoe_blast';
  let vfx: MobaVfxKind = 'ring';
  let targeting: MobaSkillTargeting = isUlt ? 'circle' : 'line';
  let moveKind: MobaSkillMoveKind = 'none';
  let elementTheme: MobaElementTheme = getHeroBaseElementTheme(hero);
  let iconicUlt: MobaIconicUltKind = 'none';
  let icon = hero.icon;
  let ccKind: MobaCcKind = 'none';
  let ccSec = 0;
  let ccImmuneSec = 0;
  let dmgMult = slot === 1 ? 1.45 : slot === 2 ? 1.95 : 2.9;
  let range = hero.isRanged ? 16 : 8;
  let radius = slot === 3 || slot === 4 ? 10 : 6.8;
  let healPct = 0;
  let shieldSec = 0;
  let hasteSec = 0;
  let stealthSec = 0;
  let giantSec = 0;

  // Per-skill elemental keyword overrides (e.g. Lunox Chaos Dark vs Order Light, explicit flame/frost/storm skills)
  if (txt.includes('fire') || txt.includes('flame') || txt.includes('lava') || txt.includes('burn') || txt.includes('magma') || txt.includes('inferno') || txt.includes('scorch')) {
    elementTheme = 'fire';
  } else if (txt.includes('ice') || txt.includes('frost') || txt.includes('glaci') || txt.includes('freez') || txt.includes('blizzard') || txt.includes('hail')) {
    elementTheme = 'ice';
  } else if (txt.includes('lightning') || txt.includes('electric') || txt.includes('thunder') || txt.includes('volt') || txt.includes('spark')) {
    elementTheme = 'lightning';
  } else if (txt.includes('wind') || txt.includes('tornado') || txt.includes('gale') || txt.includes('tempest') || txt.includes('whirlwind')) {
    elementTheme = 'wind';
  } else if (txt.includes('wave') && (txt.includes('ocean') || txt.includes('tide') || txt.includes('sea') || txt.includes('water'))) {
    elementTheme = 'water';
  } else if (txt.includes('blood') || txt.includes('crimson') || txt.includes('vamp')) {
    elementTheme = 'blood';
  } else if (txt.includes('vine') || txt.includes('thorn') || txt.includes('flower') || txt.includes('bloom') || txt.includes('seed')) {
    elementTheme = 'nature';
  } else if (txt.includes('shadow') || txt.includes('abyss') || txt.includes('chaos') || txt.includes('dark') || txt.includes('curse') || txt.includes('phantom')) {
    elementTheme = 'shadow';
  } else if (txt.includes('holy') || txt.includes('light') || txt.includes('star') || txt.includes('moon') || txt.includes('celestial') || txt.includes('astral')) {
    elementTheme = 'celestial';
  } else if (txt.includes('rock') || txt.includes('stone') || txt.includes('earthquake') || txt.includes('sandstorm') || txt.includes('boulder')) {
    elementTheme = 'earth';
  }

  // Signature Iconic Skills from MLBB Guide
  if (hero.name === 'Tigreal' && slot === 3) {
    iconicUlt = 'tigreal_implosion';
    kind = 'whirlwind_spin';
    vfx = 'vortex';
    targeting = 'self';
    ccKind = 'pull';
    ccSec = 1.8;
    radius = 12.5;
    dmgMult = 3.1;
    elementTheme = 'celestial';
  } else if (hero.name === 'Lancelot' && (slot === 2 || slot === 3)) {
    iconicUlt = 'lancelot_thorned_rose';
    kind = 'aoe_blast';
    vfx = 'slash_arc';
    targeting = 'cone';
    moveKind = slot === 3 ? 'dash' : 'none';
    ccImmuneSec = 1.0;
    radius = 9.5;
    dmgMult = slot === 3 ? 3.2 : 2.3;
    elementTheme = 'celestial';
  } else if (hero.name === 'Johnson' && slot === 3) {
    iconicUlt = 'johnson_car';
    kind = 'transform_form';
    vfx = 'lightning';
    targeting = 'line';
    moveKind = 'dash';
    ccKind = 'stun';
    ccSec = 1.6;
    ccImmuneSec = 4.0;
    hasteSec = 6.0;
    shieldSec = 5.0;
    radius = 10.5;
    dmgMult = 3.2;
    elementTheme = 'lightning';
  } else if (hero.name === 'Yve' && slot === 3) {
    iconicUlt = 'yve_chessboard';
    kind = 'orbital_drop';
    vfx = 'meteor';
    targeting = 'circle';
    ccKind = 'slow';
    ccSec = 2.6;
    ccImmuneSec = 3.5;
    shieldSec = 4.0;
    radius = 14.0;
    dmgMult = 3.4;
    elementTheme = 'celestial';
  } else if (hero.name === 'Kagura' && slot === 3) {
    iconicUlt = 'kagura_overturn';
    kind = 'hook_pull';
    vfx = 'vortex';
    targeting = 'circle';
    ccKind = 'pull';
    ccSec = 1.5;
    radius = 11.5;
    dmgMult = 3.25;
    elementTheme = 'shadow';
  } else if (txt.includes('flip') && (txt.includes('shoulder') || txt.includes('backward'))) {
    kind = 'hook_pull';
    vfx = 'hook_chain';
    targeting = 'lock';
    icon = '🔄';
    ccKind = 'flip';
    ccSec = 1.1;
    range = 9;
  } else if (txt.includes('hook') || txt.includes('drag') || txt.includes('pull') || txt.includes('tether')) {
    kind = 'hook_pull';
    vfx = 'hook_chain';
    targeting = 'line';
    icon = '🪝';
    ccKind = 'pull';
    ccSec = 1.15;
    range = 16;
  } else if (txt.includes('turret') || txt.includes('spawn') || txt.includes('guard')) {
    kind = 'summon_turret';
    vfx = 'turret_summon';
    targeting = 'circle';
    icon = '👾';
    dmgMult *= 0.85;
  } else if (txt.includes('clone') || txt.includes('decoy') || txt.includes('mirror') || txt.includes('doppelganger') || txt.includes('companion')) {
    kind = 'summon_clone';
    vfx = 'clone_summon';
    targeting = 'circle';
    icon = '👥';
    hasteSec = 2.0;
  } else if (txt.includes('transform') || txt.includes('giant') || txt.includes('beast') || txt.includes('valkyrie') || txt.includes('eject') || txt.includes('werewolf') || txt.includes('dragon form') || txt.includes('fuses')) {
    kind = 'transform_form';
    vfx = 'transform_giant';
    targeting = 'self';
    icon = '🐲';
    giantSec = 6.5;
    shieldSec = 4.0;
    hasteSec = 3.0;
    ccImmuneSec = 1.8;
    healPct = 0.2;
    dmgMult *= 1.15;
  } else if (txt.includes('invisible') || txt.includes('stealth') || txt.includes('camouflage') || txt.includes('mist') || txt.includes('darkness')) {
    kind = 'stealth_ambush';
    vfx = 'stealth_mist';
    targeting = 'self';
    icon = '👻';
    stealthSec = 2.8;
    hasteSec = 2.4;
  } else if (txt.includes('portal') || txt.includes('beacon') || txt.includes('teleport') || txt.includes('blink')) {
    kind = 'blink_teleport';
    vfx = 'portal_warp';
    targeting = 'circle';
    moveKind = 'blink';
    icon = '🌀';
    range = 15;
    hasteSec = 2.0;
    healPct = slot === 4 ? 0.2 : 0;
  } else if (txt.includes('laser') || txt.includes('beam') || txt.includes('cannon')) {
    kind = 'laser_beam';
    vfx = 'beam';
    targeting = 'line';
    icon = '⚡';
    range = 24;
    dmgMult *= 1.18;
  } else if (txt.includes('sniper') || txt.includes('global') || txt.includes('extreme range') || txt.includes('snipe')) {
    kind = 'snipe_shot';
    vfx = 'beam';
    targeting = 'lock';
    icon = '🎯';
    range = 32;
    dmgMult *= 1.25;
  } else if (txt.includes('meteor') || txt.includes('orbital') || txt.includes('rain') || txt.includes('skyfall') || txt.includes('bolt') || txt.includes('thunder')) {
    kind = 'orbital_drop';
    vfx = txt.includes('bolt') || txt.includes('thunder') || txt.includes('lightning') ? 'lightning' : 'meteor';
    targeting = 'circle';
    icon = vfx === 'lightning' ? '⚡' : '☄️';
    range = 18;
    radius = isUlt ? 11.5 : 8.0;
  } else if (txt.includes('freeze') || txt.includes('glacial') || txt.includes('root') || txt.includes('bind') || txt.includes('immobil') || txt.includes('stun') || txt.includes('petrify')) {
    kind = 'cc_freeze_root';
    vfx = txt.includes('ice') || txt.includes('glaci') || txt.includes('freez') ? 'frost_burst' : 'vortex';
    targeting = 'circle';
    icon = vfx === 'frost_burst' ? '❄️' : '⛓️';
    ccKind = txt.includes('stun') ? 'stun' : 'root';
    ccSec = isUlt ? 1.8 : 1.15;
  } else if (txt.includes('spin') || txt.includes('cyclone') || txt.includes('whirl') || txt.includes('tornado') || txt.includes('vortex')) {
    kind = 'whirlwind_spin';
    vfx = 'vortex';
    targeting = 'self';
    icon = '🌪️';
    ccKind = 'pull';
    ccSec = 0.85;
    hasteSec = 1.6;
    dmgMult *= 1.12;
  } else if (txt.includes('heal') || txt.includes('restore') || txt.includes('cleanse') || txt.includes('revive')) {
    kind = 'heal_aura';
    vfx = 'shield_dome';
    targeting = 'self';
    icon = '💚';
    healPct = isUlt ? 0.42 : 0.22;
    hasteSec = 2.0;
  } else if (txt.includes('shield') || txt.includes('barrier') || txt.includes('immune') || txt.includes('block') || txt.includes('taunt')) {
    kind = 'barrier_shield';
    vfx = 'shield_dome';
    targeting = 'self';
    icon = '🛡️';
    shieldSec = isUlt ? 4.8 : 2.8;
    healPct = 0.1;
  } else if (txt.includes('barrage') || txt.includes('volley') || txt.includes('fan') || txt.includes('arrows') || txt.includes('bullets') || txt.includes('shards') || txt.includes('cards') || txt.includes('cone')) {
    kind = txt.includes('homing') || txt.includes('missile') || txt.includes('swarm') ? 'homing_barrage' : 'fan_volley';
    vfx = elementTheme === 'fire' ? 'flame_wave' : 'slash_arc';
    targeting = kind === 'homing_barrage' ? 'lock' : 'cone';
    icon = hero.isRanged ? '🏹' : '🗡️';
    dmgMult *= 1.12;
  } else if (txt.includes('leap') || txt.includes('jump') || txt.includes('sky') || txt.includes('crash down') || txt.includes('pounce')) {
    kind = 'dash_strike';
    vfx = 'ring';
    targeting = 'circle';
    moveKind = 'leap';
    icon = '🦅';
    range = 13;
    radius = isUlt ? 10.5 : 7.4;
    hasteSec = 1.2;
  } else if (txt.includes('dash') || txt.includes('charge') || txt.includes('vault') || txt.includes('slam') || txt.includes('lunge') || txt.includes('tackle') || txt.includes('roll')) {
    kind = 'dash_strike';
    vfx = 'slash_arc';
    targeting = 'line';
    moveKind = txt.includes('backward') || txt.includes('recoil') ? 'snap_back' : 'dash';
    icon = '💨';
    range = hero.weapon === 'daggers' ? 12.5 : 9.5;
    hasteSec = 1.2;
  }

  // Specific MLBB CC cue overrides (Silence, Fear, Taunt, CC Immunity)
  if (txt.includes('taunt')) {
    ccKind = 'taunt';
    ccSec = Math.max(ccSec, 1.5);
  } else if (txt.includes('terrif') || txt.includes('fear')) {
    ccKind = 'fear';
    ccSec = Math.max(ccSec, 1.4);
  } else if (txt.includes('silence') || txt.includes('critter') || txt.includes('helpless')) {
    ccKind = 'silence';
    ccSec = Math.max(ccSec, 1.4);
  } else if (ccKind === 'none' && (txt.includes('slow') || txt.includes('chill'))) {
    ccKind = 'slow';
    ccSec = 1.6;
  } else if (ccKind === 'none' && (txt.includes('knock') || txt.includes('airborne') || txt.includes('push'))) {
    ccKind = 'knockback';
    ccSec = 0.85;
  }

  if (txt.includes('immune to crowd control') || txt.includes('cc immunity') || txt.includes('cc-immune') || txt.includes('untargetable') || txt.includes('invulnerable')) {
    ccImmuneSec = Math.max(ccImmuneSec, isUlt ? 2.5 : 1.3);
  }

  if (elementTheme === 'fire' && vfx === 'ring') vfx = 'flame_wave';
  if (elementTheme === 'ice' && vfx === 'ring') vfx = 'frost_burst';
  if (elementTheme === 'lightning' && vfx === 'ring') vfx = 'lightning';
  if (elementTheme === 'wind' && vfx === 'ring') vfx = 'vortex';
  if (elementTheme === 'water' && vfx === 'ring') vfx = 'vortex';
  if (elementTheme === 'shadow' && vfx === 'ring') vfx = 'vortex';
  if (elementTheme === 'nature' && vfx === 'ring') vfx = 'frost_burst';
  if (elementTheme === 'earth' && vfx === 'ring') vfx = 'meteor';
  if (elementTheme === 'blood' && vfx === 'ring') vfx = 'slash_arc';
  if (elementTheme === 'celestial' && vfx === 'ring') vfx = 'beam';

  return {
    slot,
    name: detail.name,
    shortLabel: shortWord,
    icon,
    kind,
    vfx,
    targeting,
    moveKind,
    elementTheme,
    iconicUlt,
    cdSec,
    dmgMult: Number(dmgMult.toFixed(2)),
    range,
    radius,
    ccKind,
    ccSec,
    ccImmuneSec,
    healPct,
    shieldSec,
    hasteSec,
    stealthSec,
    giantSec
  };
}

const COMBAT_KIT_CACHE = new Map<number, MobaHeroCombatKit>();

export function getHeroCombatKit(hero: MobaHeroDef): MobaHeroCombatKit {
  const cached = COMBAT_KIT_CACHE.get(hero.id);
  if (cached) return cached;
  const passive = resolvePassiveKind(hero);
  const skills: MobaSkillEffectSpec[] = hero.skills.map((s, idx) =>
    classifySkillSpec(hero, s, (idx + 1) as 1 | 2 | 3 | 4)
  );
  const kit: MobaHeroCombatKit = {
    passiveKind: passive.kind,
    passiveLabel: passive.label,
    maxStacks: passive.maxStacks,
    skills
  };
  COMBAT_KIT_CACHE.set(hero.id, kit);
  return kit;
}

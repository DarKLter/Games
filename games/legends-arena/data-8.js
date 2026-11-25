(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/data/heroesMarksman ===
ArcadeMod.define("src/games/legends-arena/mlbb/data/heroesMarksman", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MLBB_HEROES_MARKSMAN", {
    enumerable: true,
    get: function() {
        return MLBB_HEROES_MARKSMAN;
    }
});
var MLBB_HEROES_MARKSMAN = [
    {
        "id": "beatrix",
        "name": "Beatrix",
        "title": "Dawnbreak Star",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Damage",
        "costBp": 0,
        "costDiamonds": 0,
        "starter": true,
        "primaryColor": "#38A3FF",
        "accentColor": "#BAE6FD",
        "weaponIcon": "☄️",
        "resource": "none",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 0,
        "manaGrowth": 0,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 84
        },
        "passiveName": "Mechanical Genius",
        "passiveDesc": "Cannot Crit (converts every 1% Crit Chance into +1 Physical Attack). Carries 2 equipped firearms out of 4 distinct guns: **Renner** (Long-Range Sniper Rifle), **Bennett** (Area Mortar Launcher), **Wesker** (Close-Range Shotgun), and **Nibiru** (Rapid Dual SMGs).",
        "skills": [
            {
                "slot": 1,
                "name": "Masterful Gunsmith",
                "icon": "🏹",
                "desc": "[STANCE_SWITCH] Swaps between Primary and Secondary equipped weapons (0.6s CD).",
                "manaCost": 0,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 0,
                "radius": 125,
                "telegraph": "self",
                "physics": "buff",
                "color": "#38A3FF",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Tactical Reposition",
                "icon": "🔫",
                "desc": "[DASH] Rolls forward in joystick direction and immediately reloads full ammunition for her active weapon.",
                "manaCost": 0,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 125,
                "telegraph": "line",
                "physics": "dash",
                "color": "#BAE6FD",
                "foreswing": 0.1,
                "backswing": 0.14,
                "wallCross": true
            },
            {
                "slot": 3,
                "name": "4 Weapon Ultimates",
                "icon": "🌟",
                "desc": "**Renner's Apathy** (ultra-long-range 700 + 250% Total Phys ATK sniper shot), **Bennett's Rage** (5 AoE mortar shells slowing 40%), **Wesker's Elation** (5 wide shotgun blasts), **Nibiru's Passion** (6 rapid SMG volleys). [Alt Form / S4: Need Backup]",
                "manaCost": 0,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 620,
                "radius": 175,
                "telegraph": "line",
                "physics": "projectile",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "ccType": "slow",
                "ccDuration": 1.5
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Dawnbreak Star",
                "tag": "Classic",
                "color": "#38A3FF",
                "accent": "#BAE6FD",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Beatrix",
                "tag": "Collector",
                "color": "#BAE6FD",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "brody",
        "name": "Brody",
        "title": "Lone Star",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Burst",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#38A3FF",
        "accentColor": "#BAE6FD",
        "weaponIcon": "🎯",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 85
        },
        "passiveName": "Abyss Corrosion",
        "passiveDesc": "Can move freely while winding up heavy slow-firing Basic Attacks (140% Total Phys ATK), applying **Abyss Marks** (up to 4 stacks, each stack increases Brody's damage to target by +5% and grants +5% MS).",
        "skills": [
            {
                "slot": 1,
                "name": "Abyss Impact",
                "icon": "💥",
                "desc": "[PROJECTILE_LINE] Fires a piercing shockwave (250 + 130% Total Phys ATK, 30% Slow) that gains +10% damage and +1 Abyss Mark for every enemy pierced.",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "projectile",
                "color": "#38A3FF",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "slow",
                "ccDuration": 1.5
            },
            {
                "slot": 2,
                "name": "Corrosive Strike",
                "icon": "⚡",
                "desc": "[DASH / STUN] Dashes onto target enemy dealing 200 (+70% Total Phys ATK) Physical Damage, **Stunning** for 0.8s, applying 1 Abyss Mark, and vaulting backward in joystick direction.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 125,
                "telegraph": "line",
                "physics": "dash",
                "color": "#BAE6FD",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "stun",
                "ccDuration": 1,
                "wallCross": true
            },
            {
                "slot": 3,
                "name": "Torn-Apart Memory",
                "icon": "🌟",
                "desc": "[GROUND_AOE / HOMING] Locks onto all marked enemies within 800 range, firing homing energy missiles dealing 340 (+180% Extra Phys ATK) + 136 (+72% Extra Phys ATK) + 6% Target Missing HP per Abyss Mark stack!",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 620,
                "radius": 175,
                "telegraph": "circle",
                "physics": "aoe",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Lone Star",
                "tag": "Classic",
                "color": "#38A3FF",
                "accent": "#BAE6FD",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Brody",
                "tag": "Collector",
                "color": "#BAE6FD",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "bruno",
        "name": "Bruno",
        "title": "Protector",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Burst",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#F97316",
        "accentColor": "#FED7AA",
        "weaponIcon": "💥",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 52
        },
        "passiveName": "Mecha Legs",
        "passiveDesc": "Each skill hit grants +2% Crit Chance (stacks up to 10 times = +20% Crit Chance); Bruno gains 80% value from Attack Speed bonuses.",
        "skills": [
            {
                "slot": 1,
                "name": "Volley Shot",
                "icon": "⚡",
                "desc": "[SELF_BUFF / PROJECTILE_LINE] Infuses next Basic Attack with a high-crit **Powerball** (120 + 100% Total Phys ATK + 30% Slow) that rebounds toward Bruno; catching the Powerball refreshes its duration and reduces S2 cooldown by 1s.",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 0,
                "radius": 125,
                "telegraph": "self",
                "physics": "buff",
                "color": "#F97316",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "slow",
                "ccDuration": 1.5
            },
            {
                "slot": 2,
                "name": "Flying Tackle",
                "icon": "☄️",
                "desc": "[DASH / STUN] Slide-tackles forward (140 + 40% Total Phys ATK) **Stunning** enemies in path for 0.5s and magnet-pulling any active Powerball straight to Bruno.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 125,
                "telegraph": "line",
                "physics": "dash",
                "color": "#FED7AA",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "pull",
                "ccDuration": 0.7,
                "wallCross": true
            },
            {
                "slot": 3,
                "name": "Worldie",
                "icon": "🌟",
                "desc": "[PROJECTILE_LINE / KNOCKBACK] Kicks an energy soccer ball (250 + 83% Total Phys ATK) that knocks back the first enemy and bounces up to 10 times between nearby enemies while shredding -4% Physical Defense per hit (stacks 3x).",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 620,
                "radius": 175,
                "telegraph": "line",
                "physics": "displacement",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "ccType": "knockback",
                "ccDuration": 0.8
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Protector",
                "tag": "Classic",
                "color": "#F97316",
                "accent": "#FED7AA",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Bruno",
                "tag": "Collector",
                "color": "#FED7AA",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "claude",
        "name": "Claude",
        "title": "Master Thief",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Burst · Chase",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#EAB308",
        "accentColor": "#FEF08A",
        "weaponIcon": "⚡",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 71
        },
        "passiveName": "Battle Side-by-Side",
        "passiveDesc": "Monkey companion **Dexter** automatically mirrors every Basic Attack Claude fires (35% Basic Attack damage + 35% Attack Effects).",
        "skills": [
            {
                "slot": 1,
                "name": "Art of Thievery",
                "icon": "☄️",
                "desc": "[CONE_SWEEP] Fan wave (160 + 40% Total Phys ATK) stealing +4%–7% Movement Speed and +4%–7% Attack Speed from hit enemies (2x from enemy heroes, stacking up to 5 times for 6s).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "cone",
                "physics": "aoe",
                "color": "#EAB308",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Battle Mirror Image",
                "icon": "🏹",
                "desc": "[SUMMON / BLINK] Places a stationary hologram of Dexter (5.5s) that automatically attacks enemies; recasting swaps Claude's position with Dexter's hologram.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 125,
                "telegraph": "line",
                "physics": "blink",
                "color": "#FEF08A",
                "foreswing": 0.1,
                "backswing": 0.14,
                "wallCross": true
            },
            {
                "slot": 3,
                "name": "Blazing Duet",
                "icon": "🌟",
                "desc": "[CHANNEL / GROUND_AOE] Fires a moving 3s rapid-fire bullet storm (100 + 10% Total Phys ATK per shot, scaling with Attack Speed) at all enemies in range while gaining a Shield (20 + 3% Total Phys ATK per hit).",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 620,
                "radius": 175,
                "telegraph": "ring",
                "physics": "channel",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Master Thief",
                "tag": "Classic",
                "color": "#EAB308",
                "accent": "#FEF08A",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Claude",
                "tag": "Collector",
                "color": "#FEF08A",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "clint",
        "name": "Clint",
        "title": "West Justice",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Burst",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#38A3FF",
        "accentColor": "#BAE6FD",
        "weaponIcon": "☄️",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 88
        },
        "passiveName": "Double Shot",
        "passiveDesc": "After casting ANY skill, Clint's next Basic Attack within 4s penetrates a long straight line (950 range) dealing 100 (+120% Total Phys ATK) Physical Damage (can Crit and trigger Attack Effects).",
        "skills": [
            {
                "slot": 1,
                "name": "Quick Draw",
                "icon": "🏹",
                "desc": "[CONE_SWEEP] Rapidly fires 5 fan bullets (250 + 85% Total Phys ATK first bullet; subsequent hits on same target deal 30%–55%).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "cone",
                "physics": "aoe",
                "color": "#38A3FF",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Trapping Recoil",
                "icon": "🔫",
                "desc": "[DASH / IMMOBILIZE] Vaults backward while firing a trap net forward (140 + 30% Total Phys ATK + 150% Magic Power) that **Immobilizes** the first enemy hit for 1.2s and cuts S2 cooldown by 40% on hit.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 125,
                "telegraph": "line",
                "physics": "dash",
                "color": "#BAE6FD",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "root",
                "ccDuration": 1.2,
                "wallCross": true
            },
            {
                "slot": 3,
                "name": "Grenade Bombardment",
                "icon": "🌟",
                "desc": "[PROJECTILE_LINE] Stores up to 5 grenade charges (12s recharge); launches an explosive grenade (280 + 100% Total Phys ATK) that bursts in AoE and slows 25% (1.2s).",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 620,
                "radius": 175,
                "telegraph": "line",
                "physics": "projectile",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "ccType": "slow",
                "ccDuration": 1.5
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "West Justice",
                "tag": "Classic",
                "color": "#38A3FF",
                "accent": "#BAE6FD",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Clint",
                "tag": "Collector",
                "color": "#BAE6FD",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "granger",
        "name": "Granger",
        "title": "Death Chanter",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Burst · Finisher",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#EAB308",
        "accentColor": "#FEF08A",
        "weaponIcon": "⚡",
        "resource": "energy",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 100,
        "manaGrowth": 0,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 77
        },
        "passiveName": "Capriccio",
        "passiveDesc": "Uses regenerating Gun & Cannon Energy instead of Mana (50% of CDR converts into faster Energy regeneration); every 6th Basic Attack deals guaranteed **Critical Damage** (140%), and killing units permanently increases Max Energy.",
        "skills": [
            {
                "slot": 1,
                "name": "Rhapsody",
                "icon": "☄️",
                "desc": "[CHANNEL / PROJECTILE_LINE] Moves freely while rapidly firing 6 bullets in target direction (45 + 70% Total Phys ATK each; 6th bullet guaranteed Crit + +10% MS).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 175,
                "telegraph": "ring",
                "physics": "channel",
                "color": "#EAB308",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Rondo",
                "icon": "🏹",
                "desc": "[DASH] Quick directional dash immediately restoring 15%–25% Gun Energy and boosting next Basic Attacks.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 125,
                "telegraph": "line",
                "physics": "dash",
                "color": "#FEF08A",
                "foreswing": 0.1,
                "backswing": 0.14,
                "wallCross": true
            },
            {
                "slot": 3,
                "name": "Death Sonata",
                "icon": "🌟",
                "desc": "[PROJECTILE_LINE] Consumes Cannon Energy to fire up to 6 long-range explosive cannon shells (200 + 100% Total Phys ATK + 80% slow) with small repositioning dash steps between shots.",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 175,
                "telegraph": "line",
                "physics": "dash",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "ccType": "slow",
                "ccDuration": 1.5,
                "wallCross": true
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Death Chanter",
                "tag": "Classic",
                "color": "#EAB308",
                "accent": "#FEF08A",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Granger",
                "tag": "Collector",
                "color": "#FEF08A",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "hanabi",
        "name": "Hanabi",
        "title": "Scarlet Flower",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Damage",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#38A3FF",
        "accentColor": "#BAE6FD",
        "weaponIcon": "🎯",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 45
        },
        "passiveName": "Ninjutsu: Petal Barrage",
        "passiveDesc": "Basic Attacks and skills bounce up to 4 times between nearby enemies (40% decaying damage). Whenever Hanabi holds **ANY Shield** (from S1, items, emblems, or allies), she gains **complete CC Immunity** and +20% MS!",
        "skills": [
            {
                "slot": 1,
                "name": "Ninjutsu: Equinox",
                "icon": "💥",
                "desc": "[SELF_BUFF] Grants a Shield (300 + 40% Total Phys ATK) for 5s, +20% MS, and +30% Attack Speed.",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 0,
                "radius": 125,
                "telegraph": "self",
                "physics": "buff",
                "color": "#38A3FF",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Ninjutsu: Soul Scroll",
                "icon": "⚡",
                "desc": "[PROJECTILE_LINE] Fires a piercing energy kunai (450 + 80% Total Phys ATK, 60% Slow 1s) marking hit enemies so Petal Barrage bounces deal 100% full damage to them.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "projectile",
                "color": "#BAE6FD",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "slow",
                "ccDuration": 1.5
            },
            {
                "slot": 3,
                "name": "Forbidden Jutsu: Higanbana",
                "icon": "🌟",
                "desc": "[PROJECTILE_LINE / IMMOBILIZE] Throws a blooming Higanbana flower (300 + 100% Total Phys ATK) that **Immobilizes** the first enemy hero (0.8s) and spreads secondary blooms to nearby enemies after 1s.",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 620,
                "radius": 175,
                "telegraph": "line",
                "physics": "projectile",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "ccType": "root",
                "ccDuration": 1.2
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Scarlet Flower",
                "tag": "Classic",
                "color": "#38A3FF",
                "accent": "#BAE6FD",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Hanabi",
                "tag": "Collector",
                "color": "#BAE6FD",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "irithel",
        "name": "Irithel",
        "title": "Jungle Heart",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Burst",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#38A3FF",
        "accentColor": "#BAE6FD",
        "weaponIcon": "☄️",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 48
        },
        "passiveName": "Jungle Heart",
        "passiveDesc": "Rides smilodon Leo firing 2-arrow volleys (55% Total Phys ATK each) while moving continuously with zero stop-to-shoot animation; moving builds Jungle Heart charge (10 max) adding an extra heavy arrow at full charge.",
        "skills": [
            {
                "slot": 1,
                "name": "Strafe",
                "icon": "🏹",
                "desc": "[GROUND_AOE] Rains arrows on target circle (450 + 60% Total Phys ATK) shredding enemy Physical Defense by -15 to -40 for 3s.",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "circle",
                "physics": "aoe",
                "color": "#38A3FF",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Force of the Queen",
                "icon": "🔫",
                "desc": "[GROUND_AOE] Leo roars dealing 200 (+60% Total Phys ATK) Physical Damage and slowing surrounding enemies by 40% for 2s.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "circle",
                "physics": "aoe",
                "color": "#BAE6FD",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "slow",
                "ccDuration": 1.5
            },
            {
                "slot": 3,
                "name": "Heavy Crossbow",
                "icon": "🌟",
                "desc": "[DASH / SELF_BUFF] Leaps forward (+30–50 MS) and equips Heavy Crossbow for 15s, turning every Basic Attack into an explosive AoE splash volley (180 + 105% Total Phys ATK).",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 175,
                "telegraph": "line",
                "physics": "dash",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "wallCross": true
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Jungle Heart",
                "tag": "Classic",
                "color": "#38A3FF",
                "accent": "#BAE6FD",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Irithel",
                "tag": "Collector",
                "color": "#BAE6FD",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "ixia",
        "name": "Ixia",
        "title": "Arclight Outlaw",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Damage",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#F97316",
        "accentColor": "#FED7AA",
        "weaponIcon": "🏹",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 65
        },
        "passiveName": "Siphon Starlium",
        "passiveDesc": "Every 2 Basic Attacks/skills charges Starlium; the 3rd Basic Attack unleashes **Siphon Starlium** (40 + 100% Total Phys ATK + 40 per stack Physical Damage, cannot Crit) healing Ixia for 100% of the damage dealt!",
        "skills": [
            {
                "slot": 1,
                "name": "Dual Beam",
                "icon": "🔫",
                "desc": "[PROJECTILE_LINE] Fires two parallel energy beams (175 + 80% Total Phys ATK each; hitting same target deals 2x) and grants +40% MS (3s).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "projectile",
                "color": "#F97316",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Star Helix",
                "icon": "🎯",
                "desc": "[PROJECTILE_LINE / VORTEX_PULL] Fires a wave (200 + 60% Total Phys ATK) that pulls enemies toward the center line and knocks them slightly back.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "displacement",
                "color": "#FED7AA",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "knockback",
                "ccDuration": 0.8
            },
            {
                "slot": 3,
                "name": "Full Barrage",
                "icon": "🌟",
                "desc": "[CHANNEL / CONE_SWEEP] Roots Ixia in place for 4s while deploying 6 floating cannons in a massive 120-degree mega-range fan, allowing her Basic Attacks, S1, and S2 to strike up to 6 enemies inside the sector simultaneously!",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 620,
                "radius": 175,
                "telegraph": "ring",
                "physics": "channel",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "ccType": "root",
                "ccDuration": 1.2
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Arclight Outlaw",
                "tag": "Classic",
                "color": "#F97316",
                "accent": "#FED7AA",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Ixia",
                "tag": "Collector",
                "color": "#FED7AA",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "karrie",
        "name": "Karrie",
        "title": "Lost Star",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Damage",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#EAB308",
        "accentColor": "#FEF08A",
        "weaponIcon": "⚡",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 85
        },
        "passiveName": "Lightwheel Mark",
        "passiveDesc": "Every Basic Attack or skill applies 1 **Lightwheel Mark** (max 5); at 5 marks, triggers an explosion dealing 6%–8% of Target's Max HP as **True Damage** (max 300 vs creeps).",
        "skills": [
            {
                "slot": 1,
                "name": "Spinning Lightwheel",
                "icon": "☄️",
                "desc": "[PROJECTILE_LINE / GROUND_AOE] Fires a spinning energy wheel (250 + 90% Extra Phys ATK) that stops at target spot, ticking 150 (+20% Extra Phys ATK) damage and slowing 80% (1s).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "circle",
                "physics": "aoe",
                "color": "#EAB308",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "slow",
                "ccDuration": 1.5
            },
            {
                "slot": 2,
                "name": "Phantom Step",
                "icon": "🏹",
                "desc": "[DASH] Quick repositioning dash firing a lightwheel (150 + 70% Total Phys ATK) at the nearest enemy.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 125,
                "telegraph": "line",
                "physics": "dash",
                "color": "#FEF08A",
                "foreswing": 0.1,
                "backswing": 0.14,
                "wallCross": true
            },
            {
                "slot": 3,
                "name": "Speedy Lightwheel",
                "icon": "🌟",
                "desc": "[SELF_BUFF] Enters dual-wield stance for 6s–10s, gaining +20% MS and throwing 2 lightwheels per Basic Attack (50%–70% Basic Attack damage each + Attack Effects).",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 0,
                "radius": 175,
                "telegraph": "self",
                "physics": "buff",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Lost Star",
                "tag": "Classic",
                "color": "#EAB308",
                "accent": "#FEF08A",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Karrie",
                "tag": "Collector",
                "color": "#FEF08A",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "kimmy",
        "name": "Kimmy",
        "title": "Jetpack Rebel",
        "role": "Marksman",
        "secondaryRole": "Mage",
        "lane": "Mid",
        "specialty": "Damage · Magic Damage",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#EAB308",
        "accentColor": "#FEF08A",
        "weaponIcon": "🔫",
        "resource": "energy",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 100,
        "manaGrowth": 0,
        "basePhysAtk": 105,
        "physAtkGrowth": 6,
        "baseMagicPow": 24,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 86
        },
        "passiveName": "Chemist's Instinct",
        "passiveDesc": "Twin-stick free-aiming spray gun fires continuously while walking in any direction (converts Attack Speed into Movement Speed and generates Energy on hits).",
        "skills": [
            {
                "slot": 1,
                "name": "Energy Transformation",
                "icon": "🎯",
                "desc": "[SELF_BUFF / PROJECTILE_LINE] Toggles chemical plasma cannon mode consuming Energy per shot to fire explosive AoE magic bolts (40% Total Phys ATK + 45% Magic Power).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0,
                "magicScale": 0.9,
                "damageType": "magic",
                "range": 0,
                "radius": 125,
                "telegraph": "self",
                "physics": "buff",
                "color": "#EAB308",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Chemical Refinement",
                "icon": "💥",
                "desc": "[DASH] Jetpack-dashes backward firing a chemical spray trail (180 + 30% Total Phys ATK + 40% Magic Power) that slows enemies by 40% and restores Energy.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0,
                "magicScale": 0.9,
                "damageType": "magic",
                "range": 420,
                "radius": 125,
                "telegraph": "line",
                "physics": "dash",
                "color": "#FEF08A",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "slow",
                "ccDuration": 1.5,
                "wallCross": true
            },
            {
                "slot": 3,
                "name": "Maximum Charge",
                "icon": "🌟",
                "desc": "[PROJECTILE_LINE / GROUND_AOE] Charges up to 1.5s then fires a long-range plasma missile exploding on hit for 238 (+58% Total Phys ATK) (+70% Magic Power) primary + 198 (+48% Total Phys ATK) (+56% Magic Power) AoE Magic Damage.",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 0,
                "magicScale": 1.4,
                "damageType": "magic",
                "range": 620,
                "radius": 175,
                "telegraph": "circle",
                "physics": "aoe",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Jetpack Rebel",
                "tag": "Classic",
                "color": "#EAB308",
                "accent": "#FEF08A",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Kimmy",
                "tag": "Collector",
                "color": "#FEF08A",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "layla",
        "name": "Layla",
        "title": "Energy Gunner",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Damage",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#EAB308",
        "accentColor": "#FEF08A",
        "weaponIcon": "⚡",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 87
        },
        "passiveName": "Malefic Gun",
        "passiveDesc": "Basic Attacks and skills scale from 100% up to 130% damage based on distance between Layla and her target (maxing at 600+ units).",
        "skills": [
            {
                "slot": 1,
                "name": "Malefic Bomb",
                "icon": "☄️",
                "desc": "[PROJECTILE_LINE] Fires a fast energy bolt (200 + 80% Total Phys ATK); hitting an enemy increases Layla's Basic Attack and S2 range to match S1 for 3s and grants +60% decaying MS (1.2s).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "projectile",
                "color": "#EAB308",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Void Projectile",
                "icon": "🏹",
                "desc": "[TARGET_LOCK / GROUND_AOE] Fires an orb (170 + 65% Total Phys ATK) applying **Magic Marks** (3s); hitting a marked enemy detonates AoE damage (100 + 35% Total Phys ATK) and **Stuns** for 0.25s.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "circle",
                "physics": "aoe",
                "color": "#FEF08A",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "stun",
                "ccDuration": 1
            },
            {
                "slot": 3,
                "name": "Destruction Rush",
                "icon": "🌟",
                "desc": "[PROJECTILE_LINE] Fires a 1100-unit plasma cannon blast (500 + 150% Total Phys ATK); each rank passively increases Basic Attack and S2 range by +40/+80/+120 units.",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 620,
                "radius": 175,
                "telegraph": "line",
                "physics": "projectile",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Energy Gunner",
                "tag": "Classic",
                "color": "#EAB308",
                "accent": "#FEF08A",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Layla",
                "tag": "Collector",
                "color": "#FEF08A",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "lesley",
        "name": "Lesley",
        "title": "Deadly Sniper",
        "role": "Marksman",
        "secondaryRole": "Assassin",
        "lane": "Gold",
        "specialty": "Finisher · Burst",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#F97316",
        "accentColor": "#FED7AA",
        "weaponIcon": "🏹",
        "resource": "energy",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 100,
        "manaGrowth": 0,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 71
        },
        "passiveName": "Lethal Shoot",
        "passiveDesc": "Out of taking damage for 5s, Lesley's next Basic Attack has +15% range, 50% Crit Chance, 1.3x damage, and converts **100% of its damage into True Damage** (casting any skill resets this immediately; each 1 point of Physical Penetration converts into +0.5% Crit Damage).",
        "skills": [
            {
                "slot": 1,
                "name": "Master of Camouflage",
                "icon": "🔫",
                "desc": "[STEALTH / SELF_BUFF] Enters 3s **Camouflage** (+40% MS, +85 Phys ATK) and immediately charges **Lethal Shoot** (taking/dealing damage ends camouflage).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 0,
                "radius": 125,
                "telegraph": "self",
                "physics": "buff",
                "color": "#F97316",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Tactical Grenade",
                "icon": "🎯",
                "desc": "[DASH / KNOCKBACK] Vaults backward tossing a grenade forward (150 + 50% Total Phys ATK) that knocks back close enemies (and cancels enemy channels).",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "displacement",
                "color": "#FED7AA",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "knockback",
                "ccDuration": 0.8
            },
            {
                "slot": 3,
                "name": "Ultimate Snipe",
                "icon": "🌟",
                "desc": "[CHANNEL / TARGET_LOCK] Locks onto target enemy hero (1200+ range, revealing stealth) and fires 4 homing sniper rounds (250 + 80% Extra Phys ATK + 5% Target Missing HP each, restoring 10 Energy per hit; enemy heroes can body-block bullets).",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 620,
                "radius": 175,
                "telegraph": "ring",
                "physics": "channel",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Deadly Sniper",
                "tag": "Classic",
                "color": "#F97316",
                "accent": "#FED7AA",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Lesley",
                "tag": "Collector",
                "color": "#FED7AA",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "melissa",
        "name": "Melissa",
        "title": "Cursed Needle",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Damage",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#38A3FF",
        "accentColor": "#BAE6FD",
        "weaponIcon": "☄️",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 58
        },
        "passiveName": "Doll Buster",
        "passiveDesc": "Deals 125% damage to minions, jungle creeps, and summoned units.",
        "skills": [
            {
                "slot": 1,
                "name": "Falling!",
                "icon": "🏹",
                "desc": "[DASH / SELF_BUFF] Dashes forward gaining +35%–75% Attack Speed for 3s and pulling her **Muddles** doll along with her (each Basic Attack on Muddles cuts S1 CD by 1.2s).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 125,
                "telegraph": "line",
                "physics": "dash",
                "color": "#38A3FF",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "pull",
                "ccDuration": 0.7,
                "wallCross": true
            },
            {
                "slot": 2,
                "name": "Eyes on You!",
                "icon": "🔫",
                "desc": "[PROJECTILE_LINE / TETHER] Throws **Muddles** (250 + 80% Total Phys ATK, 60% slow 1.5s) which links up to 5 nearby enemies for 6s; whenever Melissa attacks Muddles, 70% of the Basic Attack damage + Attack Effects transfers to ALL linked enemies!",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "tether",
                "color": "#BAE6FD",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "slow",
                "ccDuration": 1.5
            },
            {
                "slot": 3,
                "name": "Go Away!",
                "icon": "🌟",
                "desc": "[GROUND_AOE / KNOCKBACK] Summons an impenetrable 4s **Field of Protection** (500 + 100% Magic Power) that knocks out and physically blocks ALL enemy melee heroes and dashes from entering!",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 620,
                "radius": 175,
                "telegraph": "circle",
                "physics": "displacement",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "ccType": "knockback",
                "ccDuration": 0.8
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Cursed Needle",
                "tag": "Classic",
                "color": "#38A3FF",
                "accent": "#BAE6FD",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Melissa",
                "tag": "Collector",
                "color": "#BAE6FD",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "miya",
        "name": "Miya",
        "title": "Moonlight Archer",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Damage",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#38A3FF",
        "accentColor": "#BAE6FD",
        "weaponIcon": "🎯",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 59
        },
        "passiveName": "Moon Blessing",
        "passiveDesc": "Each Basic Attack grants +5% Attack Speed (4s, max 5 stacks = +25% ATK Speed); at full stacks, summons a **Moonlight Shadow** spirit firing an extra arrow (30 + 30% Total Phys ATK, inherits Attack Effects) on every Basic Attack.",
        "skills": [
            {
                "slot": 1,
                "name": "Moon Arrow",
                "icon": "💥",
                "desc": "[SELF_BUFF] For 4s, Miya's Basic Attacks split into 3 arrows hitting the primary target (100%) and up to 2 nearby targets (30%).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 0,
                "radius": 125,
                "telegraph": "self",
                "physics": "buff",
                "color": "#38A3FF",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Arrow of Eclipse",
                "icon": "⚡",
                "desc": "[GROUND_AOE / IMMOBILIZE] Calls down lunar power on target circle (270 + 45% Total Phys ATK), **Immobilizing** enemies inside for 1.2s and splitting into 8 minor arrows (40 + 20% Total Phys ATK, 30% slow 2s).",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "circle",
                "physics": "aoe",
                "color": "#BAE6FD",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "root",
                "ccDuration": 1.2
            },
            {
                "slot": 3,
                "name": "Hidden Moonlight",
                "icon": "🌟",
                "desc": "[STEALTH / SELF_BUFF] Immediately **cleanses ALL Crowd Control**, enters 2s **Concealment (Stealth)**, gains +35% MS, and immediately fills all 5 **Moon Blessing** stacks!",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 0,
                "radius": 175,
                "telegraph": "self",
                "physics": "buff",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Moonlight Archer",
                "tag": "Classic",
                "color": "#38A3FF",
                "accent": "#BAE6FD",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Miya",
                "tag": "Collector",
                "color": "#BAE6FD",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "moskov",
        "name": "Moskov",
        "title": "Spear of Quiescence",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Chase",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#F97316",
        "accentColor": "#FED7AA",
        "weaponIcon": "💥",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 76
        },
        "passiveName": "Spear of Quiescence",
        "passiveDesc": "Basic Attacks pierce through the primary target to strike all enemies behind in a line, and every Basic Attack hit reduces S1 and S2 cooldowns by 0.8s.",
        "skills": [
            {
                "slot": 1,
                "name": "Abyss Walker",
                "icon": "⚡",
                "desc": "[BLINK / SELF_BUFF] Blinks through walls to target spot, gaining +30%–55% Attack Speed for 3s and increasing pierce damage by +15%.",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 125,
                "telegraph": "line",
                "physics": "blink",
                "color": "#F97316",
                "foreswing": 0.1,
                "backswing": 0.14,
                "wallCross": true
            },
            {
                "slot": 2,
                "name": "Spear of Misery",
                "icon": "☄️",
                "desc": "[TARGET_LOCK / KNOCKBACK / STUN] Fires a heavy spear (450 + 80% Total Phys ATK) knocking target enemy backward; if the knocked target collides with a map wall or another enemy hero, both take 270 (+40% Total Phys ATK) bonus damage and are **Stunned** for 1.5s!",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "displacement",
                "color": "#FED7AA",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "knockback",
                "ccDuration": 0.8
            },
            {
                "slot": 3,
                "name": "Spear of Destruction",
                "icon": "🌟",
                "desc": "[GLOBAL_CAST / PROJECTILE_LINE / BLINK] Throws a global map-wide piercing spear (340 + 100% Total Phys ATK + 80% slow 3s) leaving a shadow behind the first enemy hero hit; recasting **teleports Moskov directly behind that hero** and refreshes S1!",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 1200,
                "radius": 175,
                "telegraph": "line",
                "physics": "blink",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "ccType": "slow",
                "ccDuration": 1.5,
                "wallCross": true
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Spear of Quiescence",
                "tag": "Classic",
                "color": "#F97316",
                "accent": "#FED7AA",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Moskov",
                "tag": "Collector",
                "color": "#FED7AA",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "natan",
        "name": "Natan",
        "title": "Spacetime Walker",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Burst · Magic Damage",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#38A3FF",
        "accentColor": "#BAE6FD",
        "weaponIcon": "☄️",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 105,
        "physAtkGrowth": 6,
        "baseMagicPow": 24,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 60
        },
        "passiveName": "Theory of Everything",
        "passiveDesc": "Converts 100% Physical Lifesteal/Penetration into Magic Lifesteal/Penetration; Basic Attacks deal **Magic Damage** (60 + 70% Total Phys ATK + 35% Magic Power) and boomerang back. Hitting enemies grants 1 **Entanglement** stack (max 6, +7.5%–15% ATK Speed & +7.5% MS per stack).",
        "skills": [
            {
                "slot": 1,
                "name": "Superposition",
                "icon": "🏹",
                "desc": "[PROJECTILE_LINE] Fires a piercing gravitational beam (225 + 100% Total Phys ATK + 140% Magic Power).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0,
                "magicScale": 0.9,
                "damageType": "magic",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "projectile",
                "color": "#38A3FF",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Interference!",
                "icon": "🔫",
                "desc": "[PROJECTILE_LINE / KNOCKBACK] Fires a gravitational attractor (150 + 50% Total Phys ATK + 70% Magic Power) knocking enemies back along its path and imploding at endpoint (0.6s pull).",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0,
                "magicScale": 0.9,
                "damageType": "magic",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "displacement",
                "color": "#BAE6FD",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "knockback",
                "ccDuration": 0.8
            },
            {
                "slot": 3,
                "name": "Entropy?",
                "icon": "🌟",
                "desc": "[SUMMON / BLINK] Summons a **Reverse-Clone** (8s) at target spot that mirrors every Basic Attack and skill Natan casts (35% damage); recasting swaps Natan's position with the Reverse-Clone and cuts S1/S2 CDs by 50%.",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 0,
                "magicScale": 1.4,
                "damageType": "magic",
                "range": 420,
                "radius": 175,
                "telegraph": "line",
                "physics": "blink",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "wallCross": true
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Spacetime Walker",
                "tag": "Classic",
                "color": "#38A3FF",
                "accent": "#BAE6FD",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Natan",
                "tag": "Collector",
                "color": "#BAE6FD",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "obsidia",
        "name": "Obsidia",
        "title": "Sovereign of Dark's End",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Damage",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#F97316",
        "accentColor": "#FED7AA",
        "weaponIcon": "💥",
        "resource": "none",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 0,
        "manaGrowth": 0,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 78
        },
        "passiveName": "Return to Bone",
        "passiveDesc": "Dealing damage builds **Bone Energy** (1 per non-hero BA, 2 per hero BA, 3x on skills; 0 on creeps); every 30 Bone Energy forms 1 orbiting **Bone Shard** (up to 25 shards). Basic Attacks fire ALL stored Bone Shards simultaneously (7% Total Phys ATK + 7% Attack Effects per shard).",
        "skills": [
            {
                "slot": 1,
                "name": "Abyssal Bone Needle",
                "icon": "⚡",
                "desc": "[PROJECTILE_LINE] Launches a piercing void bone needle (325 + 80% Total Phys ATK) triggering *Return to Bone* on the first enemy hero hit.",
                "manaCost": 0,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "projectile",
                "color": "#F97316",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 2,
                "name": "Phantom Shadowmeld",
                "icon": "☄️",
                "desc": "[STEALTH / SELF_BUFF] Descends into the Abyss entering **Shadowmeld Form** and gaining +500% Movement Speed for 0.3s (1s duration & -33% CD during Ultimate).",
                "manaCost": 0,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 0,
                "radius": 125,
                "telegraph": "self",
                "physics": "buff",
                "color": "#FED7AA",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 3,
                "name": "Hunt of Bone",
                "icon": "🌟",
                "desc": "[PROJECTILE_LINE / TETHER / STUN] Shoots **Bones of Wrath** (125 + 60% Total Phys ATK), briefly **Stunning** the first enemy hero hit, pulling Obsidia near them, and tethering within 4 units for 3s—**disabling all enemy Dash/Blink skills**, granting 5 temporary Bone Shards, wall-phasing, and moving Basic Attacks!",
                "manaCost": 0,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 420,
                "radius": 175,
                "telegraph": "line",
                "physics": "blink",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "ccType": "pull",
                "ccDuration": 0.7,
                "wallCross": true
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Sovereign of Dark's End",
                "tag": "Classic",
                "color": "#F97316",
                "accent": "#FED7AA",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Obsidia",
                "tag": "Collector",
                "color": "#FED7AA",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "popol_and_kupa",
        "name": "Popol and Kupa",
        "title": "Icefield Companions",
        "role": "Marksman",
        "lane": "Jungle",
        "specialty": "Push · Burst",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#38A3FF",
        "accentColor": "#BAE6FD",
        "weaponIcon": "🎯",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 63
        },
        "passiveName": "We Are Friends",
        "passiveDesc": "Wolf **Kupa** fights alongside Popol inheriting 100% of Popol's Attack/Stats (2500 + 200% Extra Phys ATK HP); every 3 Kupa hits empowers Popol's next Basic Attack (+200% damage). Popol can revive Kupa via 3s channel.",
        "skills": [
            {
                "slot": 1,
                "name": "Bite 'em, Kupa!",
                "icon": "💥",
                "desc": "[TARGET_LOCK] Popol throws a spear (80 + 100% Total Phys ATK) commanding Kupa to lunge and bite (120 + 75% Total Phys ATK x 3; **Alpha Wolf** stuns for 1s).",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "projectile",
                "color": "#38A3FF",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "stun",
                "ccDuration": 1
            },
            {
                "slot": 2,
                "name": "Kupa, Help!",
                "icon": "⚡",
                "desc": "[SELF_BUFF / AIRBORNE] Calls Kupa back granting a Shield (240 + 120% Extra Phys ATK); **Alpha Wolf** knocks nearby enemies **Airborne** (0.6s).",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 0,
                "radius": 125,
                "telegraph": "self",
                "physics": "buff",
                "color": "#BAE6FD",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "airborne",
                "ccDuration": 0.8
            },
            {
                "slot": 3,
                "name": "We Are Angry!",
                "icon": "🌟",
                "desc": "[TRANSFORM / SELF_BUFF] Enrages Kupa into giant **Alpha Wolf** (12s), restoring Kupa's HP, granting +15% MS, +50% ATK Speed, +30 Phys ATK, and upgrading S1 & S2. [Alt Form / S4: Popol's Surprise]",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 0,
                "radius": 175,
                "telegraph": "self",
                "physics": "buff",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Icefield Companions",
                "tag": "Classic",
                "color": "#38A3FF",
                "accent": "#BAE6FD",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Popol and Kupa",
                "tag": "Collector",
                "color": "#BAE6FD",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    },
    {
        "id": "wanwan",
        "name": "Wanwan",
        "title": "Agile Tiger",
        "role": "Marksman",
        "lane": "Gold",
        "specialty": "Finisher · Burst",
        "costBp": 32000,
        "costDiamonds": 599,
        "starter": false,
        "primaryColor": "#38A3FF",
        "accentColor": "#BAE6FD",
        "weaponIcon": "🎯",
        "resource": "mana",
        "attackRange": 430,
        "isRanged": true,
        "baseHp": 2460,
        "hpGrowth": 148,
        "baseMana": 480,
        "manaGrowth": 42,
        "basePhysAtk": 124,
        "physAtkGrowth": 11,
        "baseMagicPow": 0,
        "basePhysDef": 17,
        "physDefGrowth": 3.6,
        "baseMagicDef": 15,
        "magicDefGrowth": 2,
        "baseMoveSpd": 246,
        "baseAtkSpd": 0.94,
        "ratings": {
            "durability": 42,
            "offense": 88,
            "control": 54,
            "difficulty": 69
        },
        "passiveName": "Tiger Pace",
        "passiveDesc": "Can perform a free directional **hop-dash** after **EVERY Basic Attack** (hop speed scales with Attack Speed!). Hitting an enemy hero reveals 3 **Weaknesses** around them; striking all 3 Weaknesses deals 55 (+3 * Lv) **True Damage**, amplifies damage taken by +10% (5s), and unlocks **Crossbow of Tang**.",
        "skills": [
            {
                "slot": 1,
                "name": "Swallow's Path",
                "icon": "💥",
                "desc": "[PROJECTILE_LINE / STUN] Fires a Fire Swallow (120 + 40% Total Phys ATK, popping front Weakness) that splits into 3 returning daggers (60 + 65% Total Phys ATK, popping rear Weakness); enemies hit twice by daggers are **Stunned** for 0.5s.",
                "manaCost": 55,
                "cooldown": [
                    8.5,
                    8,
                    7.5,
                    7,
                    6.5,
                    6
                ],
                "baseDmg": [
                    210,
                    250,
                    290,
                    330,
                    370,
                    410
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 540,
                "radius": 125,
                "telegraph": "line",
                "physics": "boomerang",
                "color": "#38A3FF",
                "foreswing": 0.1,
                "backswing": 0.14,
                "ccType": "stun",
                "ccDuration": 1
            },
            {
                "slot": 2,
                "name": "Needles in Flowers",
                "icon": "⚡",
                "desc": "[SELF_BUFF / GROUND_AOE] Immediately **cleanses ALL Crowd Control** and fires deadly needles (150 + 60% Total Phys ATK) around self.",
                "manaCost": 65,
                "cooldown": [
                    10,
                    9.5,
                    9,
                    8.5,
                    8,
                    7.5
                ],
                "baseDmg": [
                    230,
                    270,
                    310,
                    350,
                    390,
                    430
                ],
                "physScale": 0.85,
                "magicScale": 0,
                "damageType": "physical",
                "range": 0,
                "radius": 125,
                "telegraph": "self",
                "physics": "buff",
                "color": "#BAE6FD",
                "foreswing": 0.1,
                "backswing": 0.14
            },
            {
                "slot": 3,
                "name": "Crossbow of Tang",
                "icon": "🌟",
                "desc": "[TARGET_LOCK / I_FRAME] Castable only when an enemy hero has all 3 Weaknesses broken. Leaps into mid-air becoming completely **Untargetable & Invulnerable** for 2.5s while firing rapid arrows (70 + 40% Total Phys ATK each, triggering Attack Effects); killing the target extends duration by +1s and automatically switches to the next nearest enemy!",
                "manaCost": 110,
                "cooldown": [
                    38,
                    33,
                    28
                ],
                "baseDmg": [
                    460,
                    620,
                    780
                ],
                "physScale": 1.35,
                "magicScale": 0,
                "damageType": "physical",
                "range": 620,
                "radius": 175,
                "telegraph": "cone",
                "physics": "iframe",
                "color": "#F5C451",
                "foreswing": 0.16,
                "backswing": 0.14,
                "wallCross": true
            }
        ],
        "recommendedBuild": [
            "swift_boots",
            "haas_claws",
            "berserkers_fury",
            "wind_of_nature",
            "malefic_gun",
            "blade_of_despair"
        ],
        "skins": [
            {
                "id": "default",
                "name": "Agile Tiger",
                "tag": "Classic",
                "color": "#38A3FF",
                "accent": "#BAE6FD",
                "costDiamonds": 0
            },
            {
                "id": "collector",
                "name": "Arcane Wanwan",
                "tag": "Collector",
                "color": "#BAE6FD",
                "accent": "#F5C451",
                "costDiamonds": 450
            }
        ]
    }
];

});

})(window.ArcadeMod);

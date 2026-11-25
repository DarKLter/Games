(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/engine/EquipmentCombatEngine ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/EquipmentCombatEngine", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get appendEquipmentHudBuffs () {
        return appendEquipmentHudBuffs;
    },
    get applyDefensiveItemAndTalentMitigation () {
        return applyDefensiveItemAndTalentMitigation;
    },
    get applyEquipmentAndTalentStatMods () {
        return applyEquipmentAndTalentStatMods;
    },
    get applyLowHpDefensiveTriggers () {
        return applyLowHpDefensiveTriggers;
    },
    get applyPostHitOffensiveTriggers () {
        return applyPostHitOffensiveTriggers;
    },
    get checkSkyPiercerExecute () {
        return checkSkyPiercerExecute;
    },
    get computeHealOrShieldAmpMultiplier () {
        return computeHealOrShieldAmpMultiplier;
    },
    get computeOffensiveItemAndTalentMods () {
        return computeOffensiveItemAndTalentMods;
    },
    get createInitialEquipState () {
        return createInitialEquipState;
    },
    get ensureEquipState () {
        return ensureEquipState;
    },
    get getEffectiveAttackRange () {
        return getEffectiveAttackRange;
    },
    get getJungleDamageMultiplier () {
        return getJungleDamageMultiplier;
    },
    get getSpellOrActiveCdMultiplier () {
        return getSpellOrActiveCdMultiplier;
    },
    get onHeroDeathEquipHooks () {
        return onHeroDeathEquipHooks;
    },
    get onHeroKillOrAssistEquipHooks () {
        return onHeroKillOrAssistEquipHooks;
    },
    get onHeroSkillCastEquipHooks () {
        return onHeroSkillCastEquipHooks;
    },
    get onMinionKillEquipHooks () {
        return onMinionKillEquipHooks;
    },
    get stepEquipmentAndTalentTimers () {
        return stepEquipmentAndTalentTimers;
    },
    get triggerSupportHealOrShieldHooks () {
        return triggerSupportHealOrShieldHooks;
    }
});
var _CombatMath = require("./CombatMath");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _create_for_of_iterator_helper_loose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);
    if (Array.isArray(o) || (it = _unsupported_iterable_to_array(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        return function() {
            if (i >= o.length) return {
                done: true
            };
            return {
                done: false,
                value: o[i++]
            };
        };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function createInitialEquipState() {
    return {
        skyPiercerStacks: 0,
        thunderBeltStacks: 0,
        thunderBeltCd: 0,
        warAxeStacks: 0,
        warAxeTimer: 0,
        hunterStrikeHits: 0,
        hunterStrikeCd: 0,
        bruteForceStacks: 0,
        bruteForceTimer: 0,
        radiantStacks: 0,
        radiantTimer: 0,
        warriorBootsStacks: 0,
        warriorBootsTimer: 0,
        antiqueDebuffStacks: 0,
        antiqueDebuffTimer: 0,
        concentratedStacks: 0,
        concentratedTimer: 0,
        clockStacks: 0,
        clockTimer: 0,
        clockHealCd: 0,
        geniusShredStacks: 0,
        geniusShredTimer: 0,
        impulseStacks: 0,
        impulseTimer: 0,
        dhsStacks: 0,
        dhsTimer: 0,
        berserkerBuffTimer: 0,
        haasBuffTimer: 0,
        bodBuffTimer: 0,
        ogreCrisisCd: 0,
        wishingLanternAccum: {},
        athenaActiveTimer: 0,
        athenaCd: 0,
        twilightCd: 0,
        bloodWingsShieldCd: 0,
        roseGoldCd: 0,
        queensWingsTimer: 0,
        queensWingsCd: 0,
        chastiseCd: 0,
        flaskOasisCd: 0,
        windtalkerCd: 0,
        lightningTruncheonCd: 0,
        greatDragonCd: 0,
        spellbladeReady: false,
        spellbladeCd: 0,
        goldenStaffHits: 0,
        direHitCd: 0,
        favorCd: 0,
        glowingBurnTimer: 0,
        glowingBurnSourceId: null,
        cursedTickAccum: 0,
        manaSpringAccum: 0,
        dominanceSlowTimer: 0,
        chastiseSlowTimer: 0,
        weaknessAtkSlowTimer: 0,
        festivalStacks: 0,
        impureRageCd: 0,
        quantumChargeCd: 0,
        concussiveBlastCd: 0,
        braveSmiteCd: 0,
        weaknessFinderCd: 0,
        lethalIgnitionHits: 0,
        lethalIgnitionWindow: 0,
        lethalIgnitionCd: 0,
        warCryHits: 0,
        warCryTimer: 0,
        temporalReignTimer: 0,
        focusingMarkTimer: 0,
        focusingMarkTeam: null,
        inspireAttacksLeft: 0,
        flickerDefTimer: 0,
        flameRetriBonusAtk: 0,
        flameRetriTimer: 0,
        flameRetriDebuffAtk: 0,
        flameRetriDebuffTimer: 0,
        bloodyDrainTimer: 0,
        bloodyDrainSourceId: null,
        bloodyDrainTickAccum: 0,
        revitalizeZoneTimer: 0,
        revitalizeZoneX: 0,
        revitalizeZoneY: 0,
        revitalizeTickAccum: 0,
        revitalizeAmpTimer: 0
    };
}
function ensureEquipState(h) {
    if (!h.equipState) {
        h.equipState = createInitialEquipState();
    }
    return h.equipState;
}
function getEffectiveAttackRange(h) {
    var base = h.heroDef.attackRange;
    return h.items.includes('malefic_gun') ? Math.round(base * 1.12) : base;
}
function getSpellOrActiveCdMultiplier(h) {
    return h.talents.t2 === 'pull_yourself_together' ? 0.85 : 1.0;
}
function applyEquipmentAndTalentStatMods(h, itemAndEmblemBonusPhys, itemAndEmblemBonusMagic, allHeroes, inJungleOrRiver) {
    var st = ensureEquipState(h);
    var prefersMagic = h.role === 'Mage' || h.role === 'Support' && h.heroDef.baseMagicPow >= 0;
    // Weapon Master (Tier-2 Talent): +5% bonus Physical Attack & Magic Power from items & emblems
    if (h.talents.t2 === 'weapon_master') {
        h.physAtk += Math.round(itemAndEmblemBonusPhys * 0.05);
        h.magicPow += Math.round(itemAndEmblemBonusMagic * 0.05);
    }
    // Holy Crystal (Mystery): +21% to +35% Total Magic Power scaling with hero level
    if (h.items.includes('holy_crystal')) {
        var mult = 0.21 + (h.level - 1) / 14 * 0.14;
        h.magicPow = Math.round(h.magicPow * (1 + mult));
    }
    // War Axe (Fighting Spirit): +12 Phys ATK per stack (max 6 = +72)
    if (st.warAxeTimer > 0 && st.warAxeStacks > 0) {
        h.physAtk += st.warAxeStacks * 12;
    }
    // Blade of Despair active buff (+25% Phys ATK for 2s)
    if (st.bodBuffTimer > 0) {
        h.physAtk = Math.round(h.physAtk * 1.25);
    }
    // Berserker's Fury (Doom): +5% Phys ATK for 2s after crit
    if (st.berserkerBuffTimer > 0) {
        h.physAtk = Math.round(h.physAtk * 1.05);
    }
    // Brute Force Breastplate: +6 Adaptive ATK & +2% MS per stack (max 6); +15% CC Res at max
    if (st.bruteForceTimer > 0 && st.bruteForceStacks > 0) {
        var adapt = st.bruteForceStacks * 6;
        if (prefersMagic) h.magicPow += adapt;
        else h.physAtk += adapt;
        h.moveSpd = Math.round(h.moveSpd * (1 + st.bruteForceStacks * 0.02));
        if (st.bruteForceStacks >= 6) {
            h.ccResPct = Math.min(0.6, h.ccResPct + 0.15);
        }
    }
    // Concentrated Energy: +5 Magic Power per stack (max 6 = +30)
    if (st.concentratedTimer > 0 && st.concentratedStacks > 0) {
        h.magicPow += st.concentratedStacks * 5;
    }
    // Clock of Destiny: +4.5 Hybrid DEF per stack (max 6)
    if (st.clockTimer > 0 && st.clockStacks > 0) {
        var bonus = Math.round(st.clockStacks * (4.5 + h.level * 0.35));
        h.physDef += bonus;
        h.magicDef += bonus;
    }
    // Thunder Belt: permanent +1 Hybrid DEF per stack
    if (st.thunderBeltStacks > 0) {
        h.physDef += st.thunderBeltStacks;
        h.magicDef += st.thunderBeltStacks;
    }
    // Radiant Armor: +5..+8 Magic DEF per stack (max 6)
    if (st.radiantTimer > 0 && st.radiantStacks > 0) {
        var perStack = 5 + Math.round((h.level - 1) / 14 * 3);
        h.magicDef += st.radiantStacks * perStack;
    }
    // Warrior Boots (Valor): +4 Phys DEF per stack (max 5 = +20)
    if (st.warriorBootsTimer > 0 && st.warriorBootsStacks > 0) {
        h.physDef += st.warriorBootsStacks * 4;
    }
    // Tenacity (Tier-2 Talent): <50% HP grants +15 Physical & Magic Defense
    if (h.talents.t2 === 'tenacity' && h.hp / Math.max(1, h.maxHp) < 0.5) {
        h.physDef += 15;
        h.magicDef += 15;
    }
    // Flicker brief Hybrid Defense bonus (+6 + 1*Lv for 1.5s)
    if (st.flickerDefTimer > 0) {
        var bonus1 = 6 + h.level;
        h.physDef += bonus1;
        h.magicDef += bonus1;
    }
    // Flame Retribution Adaptive Attack steal / debuff
    if (st.flameRetriTimer > 0 && st.flameRetriBonusAtk > 0) {
        if (prefersMagic) h.magicPow += st.flameRetriBonusAtk;
        else h.physAtk += st.flameRetriBonusAtk;
    }
    if (st.flameRetriDebuffTimer > 0 && st.flameRetriDebuffAtk > 0) {
        h.physAtk = Math.max(20, h.physAtk - st.flameRetriDebuffAtk);
        h.magicPow = Math.max(0, h.magicPow - st.flameRetriDebuffAtk);
    }
    // Antique Cuirass / Dreadnaught Armor debuff (-6% Phys ATK per stack up to 3x = -18%)
    if (st.antiqueDebuffTimer > 0 && st.antiqueDebuffStacks > 0) {
        h.physAtk = Math.round(h.physAtk * Math.max(0.75, 1 - st.antiqueDebuffStacks * 0.06));
    }
    // Genius Wand Magic DEF shred
    if (st.geniusShredTimer > 0 && st.geniusShredStacks > 0) {
        h.magicDef -= st.geniusShredStacks * (3 + Math.floor(h.level * 0.28));
    }
    // Encourage Roam Blessing passive aura (+12..+30 Adaptive ATK & +15% ATK Speed to nearby allies)
    var hasEncourageAura = allHeroes.some(function(ally) {
        return ally.alive && ally.team === h.team && ally.id !== h.id && ally.blessingId === 'roam_encourage' && (0, _CombatMath.dist)(ally.x, ally.y, h.x, h.y) <= 520;
    });
    if (hasEncourageAura) {
        var bonusAtk = 12 + Math.round((h.level - 1) / 14 * 18);
        if (prefersMagic) h.magicPow += bonusAtk;
        else h.physAtk += bonusAtk;
        h.atkSpd = Math.min(5.0, h.atkSpd * 1.15);
    }
    // Festival of Blood (Tier-2 Talent): +0.5% Spell Vamp per stack (max 8 stacks = +4% extra -> +10% total)
    if (h.talents.t2 === 'festival_of_blood' && st.festivalStacks > 0) {
        h.spellVampPct += Math.min(8, st.festivalStacks) * 0.005;
    }
    // DHS Lifesteal stacks (+3% per stack up to 5x)
    if (st.dhsTimer > 0 && st.dhsStacks > 0) {
        h.lifestealPct += st.dhsStacks * 0.03;
    }
    // Impulse (Corrosion Scythe / Feather of Heaven / Swift Crossbow) & Haas's Claws ATK Speed boosts
    if (st.impulseTimer > 0 && st.impulseStacks > 0) {
        h.atkSpd = Math.min(5.0, h.atkSpd * (1 + st.impulseStacks * 0.06));
    }
    if (st.haasBuffTimer > 0) {
        h.atkSpd = Math.min(5.0, h.atkSpd * 1.2);
    }
    // Golden Staff (Swift): converts Crit Chance into extra Attack Speed (1% Crit -> +1% ATK Spd) and disables crit
    if (h.items.includes('golden_staff') && h.critChance > 0) {
        h.atkSpd = Math.min(5.0, h.atkSpd * (1 + h.critChance));
        h.critChance = 0;
    }
    // Dominance Ice / Chastise Pauldron / Weakness Finder Attack Speed reduction debuffs
    var atkSpdMult = 1;
    if (st.dominanceSlowTimer > 0) atkSpdMult = Math.min(atkSpdMult, 0.8);
    if (st.chastiseSlowTimer > 0) atkSpdMult = Math.min(atkSpdMult, 0.78);
    if (st.weaknessAtkSlowTimer > 0) atkSpdMult = Math.min(atkSpdMult, 0.7);
    if (atkSpdMult < 1) {
        h.atkSpd = Math.max(0.45, h.atkSpd * atkSpdMult);
    }
    // Wilderness Blessing (Tier-2 Talent): +10% MS in Jungle/River (halved in combat)
    if (h.talents.t2 === 'wilderness_blessing' && inJungleOrRiver) {
        var bonus2 = h.outOfCombatTimer >= 4 ? 0.1 : 0.05;
        h.moveSpd = Math.round(h.moveSpd * (1 + bonus2));
    }
    // Rapid Boots Side Effect: -25 MS in combat
    if (h.items.includes('rapid_boots') && h.outOfCombatTimer < 5) {
        h.moveSpd = Math.max(180, h.moveSpd - 25);
    }
    // Blood Wings Guard: +30 MS while shield is active
    if (h.items.includes('blood_wings') && h.shield > 0) {
        h.moveSpd += 30;
    }
}
function computeOffensiveItemAndTalentMods(attacker, target, rawDmg, dmgType, isBasic, isCrit, allHeroes, callbacks) {
    var ast = ensureEquipState(attacker);
    var tst = ensureEquipState(target);
    var adj = rawDmg;
    var bonusTrueDmg = 0;
    var bonusMagicDmg = 0;
    var bonusPhysDmg = 0;
    var extraPctPhysPen = 0;
    var extraPctMagicPen = 0;
    var ignoreFlatDef = 0;
    // --- Penetration Scaling Passives ---
    // Malefic Roar (Breaker): +0.1% Phys PEN per point of enemy Phys DEF (up to +30% extra = 60% total)
    if (dmgType === 'physical' && attacker.items.includes('malefic_roar')) {
        extraPctPhysPen = Math.min(0.3, Math.max(0, target.physDef) * 0.001);
    }
    // Divine Glaive (Spellbreaker): +0.1% Magic PEN per point of enemy Magic DEF (up to +20% extra = 60% total)
    if (dmgType === 'magic' && attacker.items.includes('divine_glaive')) {
        extraPctMagicPen = Math.min(0.2, Math.max(0, target.magicDef) * 0.001);
    }
    // --- Inspire 8-Hit Basic Attack Charge (Armor Ignore + Heal) ---
    if (isBasic && attacker.inspireTimer > 0 && ast.inspireAttacksLeft > 0) {
        ast.inspireAttacksLeft--;
        ignoreFlatDef += 8 + attacker.level;
        callbacks.healHero(attacker, 60 + attacker.physAtk * 0.15, attacker);
        if (ast.inspireAttacksLeft <= 0) attacker.inspireTimer = 0;
    }
    // --- Percentage Multipliers ---
    // Blade of Despair (<50% HP triggers +25% Phys ATK buff for 2s)
    if (attacker.items.includes('blade_of_despair') && target.hp / Math.max(1, target.maxHp) < 0.5) {
        ast.bodBuffTimer = 2.0;
        adj *= 1.25;
    }
    // Berserker's Fury crit buff
    if (isCrit && attacker.items.includes('berserkers_fury')) {
        ast.berserkerBuffTimer = 2.0;
    }
    // Haas's Claws crit atk spd surge
    if (isCrit && attacker.items.includes('haas_claws')) {
        ast.haasBuffTimer = 2.0;
    }
    // Sea Halberd (Punish): +8% damage vs higher Max HP heroes
    if (attacker.items.includes('sea_halberd') && target.maxHp > attacker.maxHp) {
        adj *= 1.08;
    }
    // Queen's Wings (Defiance): up to +15% damage based on missing HP
    if (attacker.items.includes('queens_wings')) {
        var missingRatio = 1 - attacker.hp / Math.max(1, attacker.maxHp);
        adj *= 1 + (0, _CombatMath.clamp)(missingRatio * 0.25, 0, 0.15);
    }
    // Concentrated Energy: stack Magic Power & +12% Magic Damage at 6 stacks
    if (dmgType === 'magic' && attacker.items.includes('concentrated_energy')) {
        ast.concentratedStacks = Math.min(6, ast.concentratedStacks + 1);
        ast.concentratedTimer = 4.0;
        if (ast.concentratedStacks >= 6) adj *= 1.12;
    }
    // Master Assassin (Tier-2 Talent): +7% Damage in 1v1 duel
    if (attacker.talents.t2 === 'master_assassin') {
        var nearbyEnemies = allHeroes.filter(function(eh) {
            return eh.alive && eh.team !== attacker.team && (0, _CombatMath.dist)(eh.x, eh.y, target.x, target.y) <= 460;
        });
        if (nearbyEnemies.length <= 1) adj *= 1.07;
    }
    // Focusing Mark (Tier-3 Talent): +6% allied damage on marked target
    if (tst.focusingMarkTimer > 0 && tst.focusingMarkTeam === attacker.team) {
        adj *= 1.06;
    }
    if (attacker.talents.t3 === 'focusing_mark') {
        tst.focusingMarkTimer = 3.0;
        tst.focusingMarkTeam = attacker.team;
    }
    // War Cry (Tier-3 Talent): 3 hits -> +8% all damage for 6s
    if (attacker.talents.t3 === 'war_cry') {
        if (ast.warCryTimer > 0) {
            adj *= 1.08;
        } else {
            ast.warCryHits++;
            if (ast.warCryHits >= 3) {
                ast.warCryHits = 0;
                ast.warCryTimer = 6.0;
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: attacker.x,
                    y: attacker.y,
                    radius: 68,
                    color: '#F59E0B',
                    ttl: 0.45,
                    maxTtl: 0.45
                });
            }
        }
    }
    // --- Stacking Passives on Damage Dealt ---
    if (attacker.items.includes('war_axe')) {
        ast.warAxeStacks = Math.min(6, ast.warAxeStacks + 1);
        ast.warAxeTimer = 4.0;
        if (ast.warAxeStacks >= 6) {
            bonusTrueDmg += Math.round(adj * 0.1);
        }
    }
    if (attacker.items.includes('brute_force_breastplate')) {
        ast.bruteForceStacks = Math.min(6, ast.bruteForceStacks + 1);
        ast.bruteForceTimer = 4.0;
    }
    if (attacker.items.includes('clock_of_destiny') && dmgType === 'magic') {
        ast.clockStacks = Math.min(6, ast.clockStacks + 1);
        ast.clockTimer = 5.0;
    }
    if (attacker.items.includes('ogre_tomahawk') && ast.ogreCrisisCd <= 0) {
        ast.ogreCrisisCd = 4.0;
        attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.1);
        attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 2.0);
    }
    if (attacker.items.includes('hunter_strike') && ast.hunterStrikeCd <= 0) {
        ast.hunterStrikeHits++;
        if (ast.hunterStrikeHits >= 5) {
            ast.hunterStrikeHits = 0;
            ast.hunterStrikeCd = 8.0;
            attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.5);
            attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 3.0);
        }
    }
    if (attacker.items.includes('malefic_gun') && isBasic) {
        attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.1);
        attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 1.0);
    }
    if (attacker.items.includes('genius_wand') && dmgType === 'magic') {
        tst.geniusShredStacks = Math.min(3, tst.geniusShredStacks + 1);
        tst.geniusShredTimer = 2.0;
    }
    if (attacker.items.includes('glowing_wand') && dmgType === 'magic') {
        tst.glowingBurnTimer = 3.0;
        tst.glowingBurnSourceId = attacker.id;
    }
    if (!isBasic && attacker.items.includes('ice_queen_wand')) {
        target.slowPct = Math.max(target.slowPct, 0.25);
        target.slowTimer = Math.max(target.slowTimer, 2.0);
    }
    // --- On-Hit Basic Attack Passives (with Golden Staff 3x Endless Strike!) ---
    if (isBasic) {
        var onHitMult = 1;
        if (attacker.items.includes('golden_staff')) {
            ast.goldenStaffHits++;
            if (ast.goldenStaffHits >= 3) {
                ast.goldenStaffHits = 0;
                onHitMult = 3;
            }
        }
        // Demon Hunter Sword: 8% Target Current HP Phys Damage + Lifesteal stack
        if (attacker.items.includes('demon_hunter_sword')) {
            bonusPhysDmg += Math.round(target.hp * 0.08 * onHitMult);
            ast.dhsStacks = Math.min(5, ast.dhsStacks + 1);
            ast.dhsTimer = 3.0;
        }
        // Corrosion Scythe / Swift Crossbow / Feather of Heaven
        if (attacker.items.includes('corrosion_scythe')) {
            bonusPhysDmg += 80 * onHitMult;
            ast.impulseStacks = Math.min(5, ast.impulseStacks + 1);
            ast.impulseTimer = 3.0;
            target.slowPct = Math.max(target.slowPct, 0.3);
            target.slowTimer = Math.max(target.slowTimer, 1.5);
        } else if (attacker.items.includes('swift_crossbow')) {
            bonusPhysDmg += 40 * onHitMult;
            ast.impulseStacks = Math.min(5, ast.impulseStacks + 1);
            ast.impulseTimer = 3.0;
        }
        if (attacker.items.includes('feather_of_heaven')) {
            bonusMagicDmg += Math.round((50 + attacker.magicPow * 0.3) * onHitMult);
            ast.impulseStacks = Math.min(5, ast.impulseStacks + 1);
            ast.impulseTimer = 3.0;
        }
        // Blade of the Heptaseas (Ambush): Out of combat >= 5s
        if (attacker.items.includes('blade_of_heptaseas') && attacker.outOfCombatTimer >= 5.0) {
            bonusPhysDmg += Math.round(160 + attacker.physAtk * 0.4);
            target.slowPct = Math.max(target.slowPct, 0.4);
            target.slowTimer = Math.max(target.slowTimer, 1.5);
            callbacks.spawnVfx({
                kind: 'burst',
                x: target.x,
                y: target.y,
                radius: 60,
                color: '#F97316',
                ttl: 0.35,
                maxTtl: 0.35
            });
        }
        // Spellblade Passives: Endless Battle (Divine Justice) + Starlium Scythe (Crisis) + Azure Blade (Judgment)
        if (ast.spellbladeReady && ast.spellbladeCd <= 0) {
            var triggered = false;
            if (attacker.items.includes('endless_battle')) {
                bonusTrueDmg += Math.round(attacker.physAtk * 0.6);
                attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.1);
                attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 1.5);
                triggered = true;
            }
            if (attacker.items.includes('starlium_scythe')) {
                bonusTrueDmg += Math.round(100 + attacker.magicPow);
                attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.1);
                attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 1.5);
                triggered = true;
            } else if (attacker.items.includes('azure_blade') && !triggered) {
                bonusTrueDmg += Math.round(50 + attacker.magicPow * 0.6);
                triggered = true;
            }
            if (triggered) {
                ast.spellbladeReady = false;
                ast.spellbladeCd = 1.5;
            }
        }
        // Thunder Belt (Thunderbolt): Every 4s AoE True Damage + Permanent +1 Hybrid DEF stack!
        if (attacker.items.includes('thunder_belt') && ast.thunderBeltCd <= 0) {
            ast.thunderBeltCd = 4.0;
            ast.thunderBeltStacks += 1;
            var tbTrue = Math.round(50 + attacker.physDef + attacker.magicDef);
            bonusTrueDmg += tbTrue;
            target.slowPct = Math.max(target.slowPct, 0.4);
            target.slowTimer = Math.max(target.slowTimer, 1.0);
            callbacks.spawnVfx({
                kind: 'ring',
                x: target.x,
                y: target.y,
                radius: 105,
                color: '#38BDF8',
                ttl: 0.4,
                maxTtl: 0.4
            });
            callbacks.spawnVfx({
                kind: 'text',
                x: attacker.x,
                y: attacker.y - 40,
                radius: 0,
                color: '#38BDF8',
                text: "⛈️ +1 DEF (" + ast.thunderBeltStacks + ")",
                ttl: 0.75,
                maxTtl: 0.75
            });
        }
        // Windtalker (Typhoon): Chain lightning to up to 3 foes
        if (attacker.items.includes('windtalker') && ast.windtalkerCd <= 0) {
            ast.windtalkerCd = Math.max(2.0, 5.0 - attacker.atkSpd * 0.8);
            var typhDmg = Math.round(150 + attacker.level * 14);
            bonusMagicDmg += typhDmg;
            var chains = allHeroes.filter(function(e) {
                return e.alive && e.team !== attacker.team && e.id !== target.id && (0, _CombatMath.dist)(e.x, e.y, target.x, target.y) <= 280;
            }).slice(0, 2);
            for(var _iterator = _create_for_of_iterator_helper_loose(chains), _step; !(_step = _iterator()).done;){
                var ch = _step.value;
                ch.hp = Math.max(1, ch.hp - Math.round(typhDmg * 0.75));
                callbacks.spawnVfx({
                    kind: 'beam',
                    x: target.x,
                    y: target.y,
                    tx: ch.x,
                    ty: ch.y,
                    radius: 10,
                    color: '#38BDF8',
                    ttl: 0.25,
                    maxTtl: 0.25
                });
            }
        }
        // Tier-3 Talents on Basic Attack: Quantum Charge, Concussive Blast, Weakness Finder
        if (attacker.talents.t3 === 'quantum_charge' && ast.quantumChargeCd <= 0) {
            ast.quantumChargeCd = 8.0;
            attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.3);
            attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 1.5);
            callbacks.healHero(attacker, 75 + attacker.level * 7, attacker);
        }
        if (attacker.talents.t3 === 'concussive_blast' && ast.concussiveBlastCd <= 0) {
            ast.concussiveBlastCd = 15.0;
            var blastDmg = Math.round(100 + attacker.maxHp * 0.07);
            bonusMagicDmg += blastDmg;
            callbacks.spawnVfx({
                kind: 'burst',
                x: target.x,
                y: target.y,
                radius: 145,
                color: '#38BDF8',
                ttl: 0.45,
                maxTtl: 0.45
            });
        }
        if (attacker.talents.t3 === 'weakness_finder' && ast.weaknessFinderCd <= 0) {
            ast.weaknessFinderCd = 10.0;
            target.slowPct = Math.max(target.slowPct, 0.5);
            target.slowTimer = Math.max(target.slowTimer, 1.0);
            tst.weaknessAtkSlowTimer = 1.0;
        }
    } else {
        // --- Skill-Hit Triggers ---
        // Lightning Truncheon (Resonate): 6s CD AoE chain lightning + +30% MS
        if (attacker.items.includes('lightning_truncheon') && ast.lightningTruncheonCd <= 0) {
            ast.lightningTruncheonCd = 6.0;
            var ltDmg = Math.round(attacker.magicPow * 1.2);
            bonusMagicDmg += ltDmg;
            attacker.speedBoostPct = Math.max(attacker.speedBoostPct, 0.3);
            attacker.speedBoostTimer = Math.max(attacker.speedBoostTimer, 2.0);
            var chains1 = allHeroes.filter(function(e) {
                return e.alive && e.team !== attacker.team && e.id !== target.id && (0, _CombatMath.dist)(e.x, e.y, target.x, target.y) <= 300;
            }).slice(0, 2);
            for(var _iterator1 = _create_for_of_iterator_helper_loose(chains1), _step1; !(_step1 = _iterator1()).done;){
                var ch1 = _step1.value;
                ch1.hp = Math.max(1, ch1.hp - Math.round(ltDmg * 0.7));
                callbacks.spawnVfx({
                    kind: 'beam',
                    x: target.x,
                    y: target.y,
                    tx: ch1.x,
                    ty: ch1.y,
                    radius: 12,
                    color: '#60A5FA',
                    ttl: 0.3,
                    maxTtl: 0.3
                });
            }
        }
        // Impure Rage (Tier-3 Talent): 4% Target Current HP Adaptive Damage + 2% Max Mana restore (5s CD)
        if (attacker.talents.t3 === 'impure_rage' && ast.impureRageCd <= 0) {
            ast.impureRageCd = 5.0;
            var irDmg = Math.round(target.hp * 0.04);
            if (dmgType === 'magic') bonusMagicDmg += irDmg;
            else bonusPhysDmg += irDmg;
            attacker.mana = Math.min(attacker.maxMana, attacker.mana + attacker.maxMana * 0.02);
        }
        // Brave Smite (Tier-3 Talent): Skill hit restores 5% Max HP (6s CD)
        if (attacker.talents.t3 === 'brave_smite' && ast.braveSmiteCd <= 0) {
            ast.braveSmiteCd = 6.0;
            callbacks.healHero(attacker, attacker.maxHp * 0.05, attacker);
        }
    }
    // --- Roam Dire Hit Blessing (<35% HP target burst, 30s CD) ---
    if (attacker.blessingId === 'roam_dire_hit' && ast.direHitCd <= 0 && target.hp / Math.max(1, target.maxHp) <= 0.35) {
        ast.direHitCd = 30.0;
        var pct = 0.07 + (attacker.level - 1) / 14 * 0.11;
        bonusMagicDmg += Math.round(target.maxHp * pct);
        callbacks.spawnVfx({
            kind: 'burst',
            x: target.x,
            y: target.y,
            radius: 70,
            color: '#EF4444',
            ttl: 0.35,
            maxTtl: 0.35
        });
    }
    return {
        adjustedRaw: adj,
        bonusTrueDmg: bonusTrueDmg,
        bonusMagicDmg: bonusMagicDmg,
        bonusPhysDmg: bonusPhysDmg,
        extraPctPhysPen: extraPctPhysPen,
        extraPctMagicPen: extraPctMagicPen,
        ignoreFlatDef: ignoreFlatDef
    };
}
function applyPostHitOffensiveTriggers(attacker, target, dealtDmg, dmgType, callbacks) {
    var ast = ensureEquipState(attacker);
    var extraDmg = 0;
    // Wishing Lantern (Butterfly Goddess): every 800 Magic Damage -> 8% target Current HP Magic Damage
    if (dmgType === 'magic' && attacker.items.includes('wishing_lantern') && dealtDmg > 0) {
        var _ast_wishingLanternAccum_target_id;
        var prev = (_ast_wishingLanternAccum_target_id = ast.wishingLanternAccum[target.id]) != null ? _ast_wishingLanternAccum_target_id : 0;
        var next = prev + dealtDmg;
        if (next >= 800) {
            ast.wishingLanternAccum[target.id] = next % 800;
            var butterflyDmg = Math.max(60, Math.round(target.hp * 0.08));
            extraDmg += butterflyDmg;
            callbacks.spawnVfx({
                kind: 'beam',
                x: attacker.x,
                y: attacker.y,
                tx: target.x,
                ty: target.y,
                radius: 14,
                color: '#FDE047',
                ttl: 0.35,
                maxTtl: 0.35
            });
            callbacks.spawnVfx({
                kind: 'text',
                x: target.x - 16,
                y: target.y - 42,
                radius: 0,
                color: '#FDE047',
                text: "\uD83C\uDFEE " + butterflyDmg,
                ttl: 0.65,
                maxTtl: 0.65
            });
        } else {
            ast.wishingLanternAccum[target.id] = next;
        }
    }
    // Lethal Ignition (Tier-3 Talent): 3 hits each >=7% target Max HP within 5s scorches for 162-750 Adaptive Dmg
    if (attacker.talents.t3 === 'lethal_ignition' && ast.lethalIgnitionCd <= 0 && dealtDmg >= target.maxHp * 0.07) {
        if (ast.lethalIgnitionWindow <= 0) {
            ast.lethalIgnitionHits = 1;
            ast.lethalIgnitionWindow = 5.0;
        } else {
            ast.lethalIgnitionHits++;
        }
        if (ast.lethalIgnitionHits >= 3) {
            ast.lethalIgnitionHits = 0;
            ast.lethalIgnitionWindow = 0;
            ast.lethalIgnitionCd = 15.0;
            var scorch = Math.round(162 + (attacker.level - 1) / 14 * 588);
            extraDmg += scorch;
            callbacks.spawnVfx({
                kind: 'burst',
                x: target.x,
                y: target.y,
                radius: 85,
                color: '#F97316',
                ttl: 0.45,
                maxTtl: 0.45
            });
        }
    }
    return extraDmg;
}
function applyDefensiveItemAndTalentMitigation(attacker, target, incomingDmg, dmgType, isBasic, isCrit, callbacks) {
    var tst = ensureEquipState(target);
    var dmg = incomingDmg;
    // Blade Armor: +20% Critical Damage Reduction
    if (isCrit && target.items.includes('blade_armor')) {
        dmg = Math.round(dmg * 0.8);
    }
    // Athena's Shield: Upon taking Magic Damage, reduces all Magic Damage taken by 25% for 3s (10s OOC CD)
    if (dmgType === 'magic' && target.items.includes('athenas_shield')) {
        if (tst.athenaActiveTimer <= 0 && tst.athenaCd <= 0) {
            tst.athenaActiveTimer = 3.0;
            tst.athenaCd = 10.0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: target.x,
                y: target.y,
                radius: 72,
                color: '#C084FC',
                ttl: 0.4,
                maxTtl: 0.4
            });
        }
        if (tst.athenaActiveTimer > 0) {
            dmg = Math.round(dmg * 0.75);
        }
    }
    // Radiant Armor: Taking Magic Damage stacks Magic DEF (up to 6x)
    if (dmgType === 'magic' && target.items.includes('radiant_armor')) {
        tst.radiantStacks = Math.min(6, tst.radiantStacks + 1);
        tst.radiantTimer = 5.0;
    }
    // Warrior Boots (Valor): Taking Physical Damage stacks Phys DEF (up to 5x)
    if (dmgType === 'physical' && target.items.includes('warrior_boots')) {
        tst.warriorBootsStacks = Math.min(5, tst.warriorBootsStacks + 1);
        tst.warriorBootsTimer = 3.0;
    }
    // Antique Cuirass / Dreadnaught Armor: Enemy skill hits reduce attacker Phys ATK (-6% x3)
    if (attacker && !isBasic && (target.items.includes('antique_cuirass') || target.items.includes('dreadnaught_armor'))) {
        var ast = ensureEquipState(attacker);
        ast.antiqueDebuffStacks = Math.min(3, ast.antiqueDebuffStacks + 1);
        ast.antiqueDebuffTimer = 2.0;
    }
    // Chastise Pauldron: slows attacker ATK Speed on hit
    if (attacker && target.items.includes('chastise_pauldron')) {
        var ast1 = ensureEquipState(attacker);
        ast1.chastiseSlowTimer = 1.5;
    }
    // Queen's Wings (Demonize): Below 40% HP grants 30% DR for 3s & -2s skill CDs (60s CD)
    if (target.items.includes('queens_wings')) {
        if (tst.queensWingsTimer <= 0 && tst.queensWingsCd <= 0 && (target.hp - dmg) / Math.max(1, target.maxHp) <= 0.4) {
            tst.queensWingsTimer = 3.0;
            tst.queensWingsCd = 60.0;
            target.skillCds[0] = Math.max(0, target.skillCds[0] - 2);
            target.skillCds[1] = Math.max(0, target.skillCds[1] - 2);
            target.skillCds[2] = Math.max(0, target.skillCds[2] - 2);
            callbacks.spawnVfx({
                kind: 'ring',
                x: target.x,
                y: target.y,
                radius: 75,
                color: '#F43F5E',
                ttl: 0.45,
                maxTtl: 0.45
            });
        }
        if (tst.queensWingsTimer > 0) {
            dmg = Math.round(dmg * 0.7);
        }
    }
    // Twilight Armor: reduces single-hit burst exceeding 500 by (0.4% Max HP + 15)% (5s CD)
    if (target.items.includes('twilight_armor') && dmg > 500 && tst.twilightCd <= 0) {
        tst.twilightCd = 5.0;
        var excess = dmg - 500;
        var reductionFrac = (0, _CombatMath.clamp)((target.maxHp * 0.004 + 15) / 100, 0.15, 0.65);
        dmg = Math.round(500 + excess * (1 - reductionFrac));
        callbacks.spawnVfx({
            kind: 'ring',
            x: target.x,
            y: target.y,
            radius: 80,
            color: '#818CF8',
            ttl: 0.4,
            maxTtl: 0.4
        });
    }
    // Vengeance (exact 35% Magic reflect) & Blade Armor (30% Basic Attack + 20% Phys DEF reflect + 15% slow)
    if (attacker && attacker.alive) {
        if (target.vengeanceTimer > 0) {
            var refl = Math.max(1, Math.round(dmg * 0.35));
            attacker.hp = Math.max(1, attacker.hp - refl);
            callbacks.spawnVfx({
                kind: 'text',
                x: attacker.x,
                y: attacker.y - 26,
                radius: 0,
                color: '#C084FC',
                text: "" + refl,
                ttl: 0.45,
                maxTtl: 0.45
            });
        } else if (isBasic && target.items.includes('blade_armor')) {
            var refl1 = Math.max(1, Math.round(dmg * 0.3 + target.physDef * 0.2));
            attacker.hp = Math.max(1, attacker.hp - refl1);
            attacker.slowPct = Math.max(attacker.slowPct, 0.15);
            attacker.slowTimer = Math.max(attacker.slowTimer, 1.0);
        } else if (target.heroDef.id === 'belerick') {
            attacker.hp = Math.max(1, attacker.hp - Math.round(dmg * 0.22));
        }
    }
    return Math.max(0, dmg);
}
function applyLowHpDefensiveTriggers(target, callbacks) {
    if (!target.alive || target.hp <= 0) return;
    var tst = ensureEquipState(target);
    var hpRatio = target.hp / Math.max(1, target.maxHp);
    // Rose Gold Meteor / Magic Blade (Lifeline <30% HP shield + 50% MS, 60s CD)
    if (hpRatio <= 0.3 && tst.roseGoldCd <= 0) {
        if (target.items.includes('rose_gold_meteor')) {
            tst.roseGoldCd = 60.0;
            callbacks.grantShield(target, 840 + target.level * 35);
            target.speedBoostPct = Math.max(target.speedBoostPct, 0.5);
            target.speedBoostTimer = Math.max(target.speedBoostTimer, 3.0);
            callbacks.spawnVfx({
                kind: 'ring',
                x: target.x,
                y: target.y,
                radius: 85,
                color: '#FB7185',
                ttl: 0.5,
                maxTtl: 0.5
            });
        } else if (target.items.includes('magic_blade')) {
            tst.roseGoldCd = 60.0;
            callbacks.grantShield(target, 400 + target.level * 30);
            target.speedBoostPct = Math.max(target.speedBoostPct, 0.5);
            target.speedBoostTimer = Math.max(target.speedBoostTimer, 2.5);
        }
    }
    // Chastise Pauldron (Redemption <30% HP restores 20% Max HP, 60s CD)
    if (hpRatio <= 0.3 && target.items.includes('chastise_pauldron') && tst.chastiseCd <= 0) {
        tst.chastiseCd = 60.0;
        callbacks.healHero(target, target.maxHp * 0.2, target);
        callbacks.spawnVfx({
            kind: 'ring',
            x: target.x,
            y: target.y,
            radius: 85,
            color: '#2CE58B',
            ttl: 0.5,
            maxTtl: 0.5
        });
    }
    // Clock of Destiny (Gift <50% HP restores 15% HP & Mana, 60s CD)
    if (hpRatio <= 0.5 && target.items.includes('clock_of_destiny') && tst.clockHealCd <= 0) {
        tst.clockHealCd = 60.0;
        callbacks.healHero(target, target.maxHp * 0.15, target);
        target.mana = Math.min(target.maxMana, target.mana + target.maxMana * 0.15);
    }
}
function checkSkyPiercerExecute(attacker, target, callbacks) {
    if (!attacker || !target.alive || target.hp <= 0 || target.isTrainingDummy) return false;
    if (!attacker.items.includes('sky_piercer')) return false;
    var ast = ensureEquipState(attacker);
    var threshold = 0.04 + Math.min(80, ast.skyPiercerStacks) * 0.001; // 4% base -> 12% at 80 stacks
    if (target.hp / Math.max(1, target.maxHp) <= threshold) {
        target.hp = 0;
        callbacks.spawnVfx({
            kind: 'burst',
            x: target.x,
            y: target.y,
            radius: 95,
            color: '#FDE047',
            ttl: 0.45,
            maxTtl: 0.45
        });
        callbacks.spawnVfx({
            kind: 'text',
            x: target.x,
            y: target.y - 44,
            radius: 0,
            color: '#FDE047',
            text: "\uD83C\uDF20 EXECUTED (" + Math.round(threshold * 100) + "%)",
            ttl: 0.85,
            maxTtl: 0.85
        });
        return true;
    }
    return false;
}
function computeHealOrShieldAmpMultiplier(target, isHeal) {
    var tst = ensureEquipState(target);
    var mult = 1.0;
    if (target.items.includes('oracle')) mult += 0.3;
    if (isHeal && tst.revitalizeAmpTimer > 0) mult += 0.25;
    return mult;
}
function triggerSupportHealOrShieldHooks(healer, target, allHeroes, callbacks) {
    if (!healer || !healer.alive) return;
    var hst = ensureEquipState(healer);
    // Flask of the Oasis (Blessing): ally <35% HP gets 680-1800 Shield & caster -2s CDs (60s CD)
    if (healer.items.includes('flask_of_the_oasis') && hst.flaskOasisCd <= 0 && target.hp / Math.max(1, target.maxHp) <= 0.35) {
        hst.flaskOasisCd = 60.0;
        var shieldAmt = Math.round(680 + (healer.level - 1) / 14 * 1120);
        callbacks.grantShield(target, shieldAmt);
        healer.skillCds[0] = Math.max(0, healer.skillCds[0] - 2);
        healer.skillCds[1] = Math.max(0, healer.skillCds[1] - 2);
        healer.skillCds[2] = Math.max(0, healer.skillCds[2] - 2);
        callbacks.spawnVfx({
            kind: 'ring',
            x: target.x,
            y: target.y,
            radius: 95,
            color: '#2CE58B',
            ttl: 0.55,
            maxTtl: 0.55
        });
    }
    // Roam Favor Blessing: bonus 300-750 HP to lowest-HP nearby ally (15s CD)
    if (healer.blessingId === 'roam_favor' && hst.favorCd <= 0) {
        var lowest = allHeroes.filter(function(a) {
            return a.alive && a.team === healer.team && (0, _CombatMath.dist)(a.x, a.y, healer.x, healer.y) <= 520;
        }).sort(function(a, b) {
            return a.hp / a.maxHp - b.hp / b.maxHp;
        })[0];
        if (lowest) {
            hst.favorCd = 15.0;
            var bonusHeal = Math.round(300 + (healer.level - 1) / 14 * 450);
            lowest.hp = Math.min(lowest.maxHp, lowest.hp + bonusHeal);
            callbacks.spawnVfx({
                kind: 'text',
                x: lowest.x,
                y: lowest.y - 34,
                radius: 0,
                color: '#34D399',
                text: "+" + bonusHeal + " \uD83D\uDC9A",
                ttl: 0.65,
                maxTtl: 0.65
            });
        }
    }
}
function onHeroSkillCastEquipHooks(caster, slot) {
    var st = ensureEquipState(caster);
    if (caster.items.includes('endless_battle') || caster.items.includes('starlium_scythe') || caster.items.includes('azure_blade')) {
        st.spellbladeReady = true;
    }
    if (slot === 3) {
        if (caster.items.includes('great_dragon_spear') && st.greatDragonCd <= 0) {
            st.greatDragonCd = 15.0;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.3);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 7.5);
        }
        if (caster.talents.t3 === 'temporal_reign') {
            st.temporalReignTimer = 4.0;
        }
    }
}
function onHeroKillOrAssistEquipHooks(actor, isKill, callbacks) {
    var st = ensureEquipState(actor);
    if (actor.items.includes('fleeting_time')) {
        actor.skillCds[2] = Math.max(0, actor.skillCds[2] * 0.7);
    }
    if (isKill && actor.items.includes('sky_piercer')) {
        st.skyPiercerStacks = Math.min(80, st.skyPiercerStacks + 10);
    }
    if (actor.talents.t2 === 'festival_of_blood') {
        st.festivalStacks = Math.min(8, st.festivalStacks + 1);
    }
    if (isKill && actor.talents.t3 === 'killing_spree') {
        var lostHp = Math.max(0, actor.maxHp - actor.hp);
        callbacks.healHero(actor, lostHp * 0.1, actor);
        actor.speedBoostPct = Math.max(actor.speedBoostPct, 0.2);
        actor.speedBoostTimer = Math.max(actor.speedBoostTimer, 3.0);
    }
    if (actor.items.includes('demon_shoes')) {
        actor.mana = Math.min(actor.maxMana, actor.mana + actor.maxMana * 0.1);
    }
}
function onHeroDeathEquipHooks(victim) {
    var st = ensureEquipState(victim);
    if (st.skyPiercerStacks > 0) {
        st.skyPiercerStacks = Math.floor(st.skyPiercerStacks * 0.7);
    }
}
function onMinionKillEquipHooks(killer, callbacks) {
    if (killer.talents.t2 === 'life_drain') {
        callbacks.healHero(killer, killer.maxHp * 0.03, killer);
        killer.mana = Math.min(killer.maxMana, killer.mana + killer.maxMana * 0.03);
    }
    if (killer.items.includes('demon_shoes')) {
        killer.mana = Math.min(killer.maxMana, killer.mana + killer.maxMana * 0.04);
    }
}
function getJungleDamageMultiplier(attacker) {
    if (!attacker) return 1;
    return attacker.talents.t2 === 'seasoned_hunter' ? 1.15 : 1.0;
}
function stepEquipmentAndTalentTimers(h, dt, allHeroes, jungleMobs, minions, callbacks) {
    var st = ensureEquipState(h);
    // Decay cooldowns & active timers
    st.thunderBeltCd = Math.max(0, st.thunderBeltCd - dt);
    st.warAxeTimer = Math.max(0, st.warAxeTimer - dt);
    if (st.warAxeTimer <= 0) st.warAxeStacks = 0;
    st.hunterStrikeCd = Math.max(0, st.hunterStrikeCd - dt);
    st.bruteForceTimer = Math.max(0, st.bruteForceTimer - dt);
    if (st.bruteForceTimer <= 0) st.bruteForceStacks = 0;
    st.radiantTimer = Math.max(0, st.radiantTimer - dt);
    if (st.radiantTimer <= 0) st.radiantStacks = 0;
    st.warriorBootsTimer = Math.max(0, st.warriorBootsTimer - dt);
    if (st.warriorBootsTimer <= 0) st.warriorBootsStacks = 0;
    st.antiqueDebuffTimer = Math.max(0, st.antiqueDebuffTimer - dt);
    if (st.antiqueDebuffTimer <= 0) st.antiqueDebuffStacks = 0;
    st.concentratedTimer = Math.max(0, st.concentratedTimer - dt);
    if (st.concentratedTimer <= 0) st.concentratedStacks = 0;
    st.clockTimer = Math.max(0, st.clockTimer - dt);
    if (st.clockTimer <= 0) st.clockStacks = 0;
    st.clockHealCd = Math.max(0, st.clockHealCd - dt);
    st.geniusShredTimer = Math.max(0, st.geniusShredTimer - dt);
    if (st.geniusShredTimer <= 0) st.geniusShredStacks = 0;
    st.impulseTimer = Math.max(0, st.impulseTimer - dt);
    if (st.impulseTimer <= 0) st.impulseStacks = 0;
    st.dhsTimer = Math.max(0, st.dhsTimer - dt);
    if (st.dhsTimer <= 0) st.dhsStacks = 0;
    st.berserkerBuffTimer = Math.max(0, st.berserkerBuffTimer - dt);
    st.haasBuffTimer = Math.max(0, st.haasBuffTimer - dt);
    st.bodBuffTimer = Math.max(0, st.bodBuffTimer - dt);
    st.ogreCrisisCd = Math.max(0, st.ogreCrisisCd - dt);
    st.athenaActiveTimer = Math.max(0, st.athenaActiveTimer - dt);
    if (h.outOfCombatTimer >= 5) st.athenaCd = Math.max(0, st.athenaCd - dt);
    st.twilightCd = Math.max(0, st.twilightCd - dt);
    st.bloodWingsShieldCd = Math.max(0, st.bloodWingsShieldCd - dt);
    st.roseGoldCd = Math.max(0, st.roseGoldCd - dt);
    st.queensWingsTimer = Math.max(0, st.queensWingsTimer - dt);
    st.queensWingsCd = Math.max(0, st.queensWingsCd - dt);
    st.chastiseCd = Math.max(0, st.chastiseCd - dt);
    st.flaskOasisCd = Math.max(0, st.flaskOasisCd - dt);
    st.windtalkerCd = Math.max(0, st.windtalkerCd - dt);
    st.lightningTruncheonCd = Math.max(0, st.lightningTruncheonCd - dt);
    st.greatDragonCd = Math.max(0, st.greatDragonCd - dt);
    st.spellbladeCd = Math.max(0, st.spellbladeCd - dt);
    st.direHitCd = Math.max(0, st.direHitCd - dt);
    st.favorCd = Math.max(0, st.favorCd - dt);
    st.dominanceSlowTimer = Math.max(0, st.dominanceSlowTimer - dt);
    st.chastiseSlowTimer = Math.max(0, st.chastiseSlowTimer - dt);
    st.weaknessAtkSlowTimer = Math.max(0, st.weaknessAtkSlowTimer - dt);
    st.impureRageCd = Math.max(0, st.impureRageCd - dt);
    st.quantumChargeCd = Math.max(0, st.quantumChargeCd - dt);
    st.concussiveBlastCd = Math.max(0, st.concussiveBlastCd - dt);
    st.braveSmiteCd = Math.max(0, st.braveSmiteCd - dt);
    st.weaknessFinderCd = Math.max(0, st.weaknessFinderCd - dt);
    st.lethalIgnitionWindow = Math.max(0, st.lethalIgnitionWindow - dt);
    if (st.lethalIgnitionWindow <= 0) st.lethalIgnitionHits = 0;
    st.lethalIgnitionCd = Math.max(0, st.lethalIgnitionCd - dt);
    st.warCryTimer = Math.max(0, st.warCryTimer - dt);
    st.focusingMarkTimer = Math.max(0, st.focusingMarkTimer - dt);
    st.flickerDefTimer = Math.max(0, st.flickerDefTimer - dt);
    st.flameRetriTimer = Math.max(0, st.flameRetriTimer - dt);
    st.flameRetriDebuffTimer = Math.max(0, st.flameRetriDebuffTimer - dt);
    st.revitalizeAmpTimer = Math.max(0, st.revitalizeAmpTimer - dt);
    // Temporal Reign (Tier-3 Talent): extra 0.5x CD tick on S1 & S2 (total 1.5x speed for 4s)
    if (st.temporalReignTimer > 0) {
        st.temporalReignTimer = Math.max(0, st.temporalReignTimer - dt);
        h.skillCds[0] = Math.max(0, h.skillCds[0] - dt * 0.5);
        h.skillCds[1] = Math.max(0, h.skillCds[1] - dt * 0.5);
    }
    // Guardian Helmet (Recovery): 2.5% Max HP/s OOC, 0.5% Max HP/s in combat
    if (h.items.includes('guardian_helmet')) {
        var rate = h.outOfCombatTimer >= 5 ? 0.025 : 0.005;
        h.hp = Math.min(h.maxHp, h.hp + h.maxHp * rate * dt);
    }
    // Blood Wings (Guard): regenerates 800 (+100% Magic Power) Shield every 20s when depleted
    if (h.items.includes('blood_wings') && h.shield <= 0 && st.bloodWingsShieldCd <= 0) {
        st.bloodWingsShieldCd = 20.0;
        callbacks.grantShield(h, Math.round(800 + h.magicPow));
    }
    // Enchanted Talisman (Mana Spring): restores 15% Max Mana every 10s
    if (h.items.includes('enchanted_talisman')) {
        st.manaSpringAccum += dt;
        if (st.manaSpringAccum >= 10.0) {
            st.manaSpringAccum = 0;
            h.mana = Math.min(h.maxMana, h.mana + h.maxMana * 0.15);
        }
    }
    // Glowing Wand Scorch DoT (1.5% Max HP/s Magic burn)
    if (st.glowingBurnTimer > 0) {
        st.glowingBurnTimer = Math.max(0, st.glowingBurnTimer - dt);
        var burnTick = Math.max(1, h.maxHp * 0.015 * dt);
        h.hp = Math.max(1, h.hp - burnTick);
    }
    // Bloody Retribution 4s Max HP Drain (12.5% user Max HP over 4s)
    if (st.bloodyDrainTimer > 0) {
        st.bloodyDrainTimer = Math.max(0, st.bloodyDrainTimer - dt);
        st.bloodyDrainTickAccum += dt;
        if (st.bloodyDrainTickAccum >= 1.0) {
            st.bloodyDrainTickAccum -= 1.0;
            var src = allHeroes.find(function(x) {
                return x.id === st.bloodyDrainSourceId && x.alive;
            });
            var drainAmt = Math.round((src ? src.maxHp : h.maxHp) * 0.03125);
            h.hp = Math.max(1, h.hp - drainAmt);
            if (src) callbacks.healHero(src, drainAmt, src);
        }
    }
    // Revitalize 4s Healing Spring Zone (2.5% Max HP every 0.5s + +25% Healing Received)
    if (st.revitalizeZoneTimer > 0) {
        st.revitalizeZoneTimer = Math.max(0, st.revitalizeZoneTimer - dt);
        st.revitalizeTickAccum += dt;
        if (st.revitalizeTickAccum >= 0.5) {
            st.revitalizeTickAccum -= 0.5;
            callbacks.spawnVfx({
                kind: 'ring',
                x: st.revitalizeZoneX,
                y: st.revitalizeZoneY,
                radius: 220,
                color: '#2CE58B',
                ttl: 0.45,
                maxTtl: 0.45
            });
            for(var _iterator = _create_for_of_iterator_helper_loose(allHeroes), _step; !(_step = _iterator()).done;){
                var ally = _step.value;
                if (ally.alive && ally.team === h.team && (0, _CombatMath.dist)(ally.x, ally.y, st.revitalizeZoneX, st.revitalizeZoneY) <= 220) {
                    ensureEquipState(ally).revitalizeAmpTimer = 0.8;
                    callbacks.healHero(ally, ally.maxHp * 0.025, h);
                }
            }
        }
    }
    // Dominance Ice / Black Ice Shield nearby aura (Arctic Cold + 50% Lifebane Anti-Heal)
    var hasDomIce = h.items.includes('dominance_ice');
    var hasBlackIce = !hasDomIce && h.items.includes('black_ice_shield');
    if (hasDomIce || hasBlackIce) {
        for(var _iterator1 = _create_for_of_iterator_helper_loose(allHeroes), _step1; !(_step1 = _iterator1()).done;){
            var enemy = _step1.value;
            if (enemy.alive && enemy.team !== h.team && (0, _CombatMath.dist)(h.x, h.y, enemy.x, enemy.y) <= 320) {
                ensureEquipState(enemy).dominanceSlowTimer = 0.5;
                if (hasDomIce) enemy.antiHealTimer = Math.max(enemy.antiHealTimer, 0.6);
            }
        }
    }
    // Cursed Helmet / Molten Essence (Burning Soul AoE Magic DPS every 1s)
    var hasCursed = h.items.includes('cursed_helmet');
    var hasMolten = !hasCursed && h.items.includes('molten_essence');
    if (hasCursed || hasMolten) {
        st.cursedTickAccum += dt;
        if (st.cursedTickAccum >= 1.0) {
            st.cursedTickAccum -= 1.0;
            var pct = hasCursed ? 0.012 : 0.006;
            var heroDps = Math.round(h.maxHp * pct);
            var creepDps = Math.round(heroDps * (hasCursed ? 2.4 : 2.0));
            for(var _iterator2 = _create_for_of_iterator_helper_loose(allHeroes), _step2; !(_step2 = _iterator2()).done;){
                var enemy1 = _step2.value;
                if (enemy1.alive && enemy1.team !== h.team && (0, _CombatMath.dist)(h.x, h.y, enemy1.x, enemy1.y) <= 220) {
                    callbacks.dealDamageToHero(h, enemy1, heroDps, 'magic', false, false, 'Burning Soul');
                }
            }
            for(var _iterator3 = _create_for_of_iterator_helper_loose(jungleMobs), _step3; !(_step3 = _iterator3()).done;){
                var mob = _step3.value;
                if (mob.alive && (0, _CombatMath.dist)(h.x, h.y, mob.x, mob.y) <= 220) {
                    callbacks.dealDamageToJungle(h, mob, creepDps, 'magic');
                }
            }
            for(var _iterator4 = _create_for_of_iterator_helper_loose(minions), _step4; !(_step4 = _iterator4()).done;){
                var min = _step4.value;
                if (min.alive && min.team !== h.team && (0, _CombatMath.dist)(h.x, h.y, min.x, min.y) <= 220) {
                    callbacks.dealDamageToMinion(h, min, creepDps, 'magic');
                }
            }
        }
    }
}
function appendEquipmentHudBuffs(p, activeBuffs) {
    var st = p.equipState;
    if (!st) return;
    if (p.items.includes('sky_piercer') && st.skyPiercerStacks > 0) {
        activeBuffs.push({
            id: 'sky_piercer',
            label: "Sky Piercer (" + st.skyPiercerStacks + ")",
            icon: '🌠',
            remaining: st.skyPiercerStacks,
            max: 80,
            color: '#FDE047'
        });
    }
    if (p.items.includes('thunder_belt') && st.thunderBeltStacks > 0) {
        activeBuffs.push({
            id: 'thunder_belt',
            label: "Thunder +" + st.thunderBeltStacks + " DEF",
            icon: '⛈️',
            remaining: st.thunderBeltStacks,
            max: Math.max(20, st.thunderBeltStacks),
            color: '#38BDF8'
        });
    }
    if (st.warCryTimer > 0) {
        activeBuffs.push({
            id: 'war_cry',
            label: 'War Cry +8%',
            icon: '📣',
            remaining: st.warCryTimer,
            max: 6,
            color: '#F59E0B'
        });
    }
    if (st.temporalReignTimer > 0) {
        activeBuffs.push({
            id: 'temporal_reign',
            label: 'Temporal 1.5x',
            icon: '⏳',
            remaining: st.temporalReignTimer,
            max: 4,
            color: '#22D3EE'
        });
    }
    if (st.athenaActiveTimer > 0) {
        activeBuffs.push({
            id: 'athena',
            label: 'Athena -25% Mag',
            icon: '🔰',
            remaining: st.athenaActiveTimer,
            max: 3,
            color: '#C084FC'
        });
    }
    if (st.revitalizeZoneTimer > 0) {
        activeBuffs.push({
            id: 'revitalize',
            label: 'Healing Spring',
            icon: '🌿',
            remaining: st.revitalizeZoneTimer,
            max: 4,
            color: '#2CE58B'
        });
    }
}

});
// === MODULE: src/games/legends-arena/mlbb/engine/ThreeMapBuilder ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/ThreeMapBuilder", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "buildLandOfDawn3D", {
    enumerable: true,
    get: function() {
        return buildLandOfDawn3D;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _mapData = require("../data/mapData");
var _ThreeHeroModels = require("./ThreeHeroModels");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _create_for_of_iterator_helper_loose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);
    if (Array.isArray(o) || (it = _unsupported_iterable_to_array(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        return function() {
            if (i >= o.length) return {
                done: true
            };
            return {
                done: false,
                value: o[i++]
            };
        };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
        default: obj
    };
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var BRIGHT_SKY_PALETTES = {
    imperial_sanctuary: {
        zenith: 0x3b82f6,
        horizon: 0xd9f0ff,
        grassMain: '#3e8446',
        grassAlt: '#4c9752',
        lane: 0xd9caa8,
        trim: 0xf0c65b,
        rock: 0x6b7280
    },
    western_expanse: {
        zenith: 0x38bdf8,
        horizon: 0xfef3c7,
        grassMain: '#a68b55',
        grassAlt: '#b89a61',
        lane: 0xe3cfa6,
        trim: 0xf59e0b,
        rock: 0x8d5b34
    },
    celestial_palace: {
        zenith: 0x2563eb,
        horizon: 0xe0f2fe,
        grassMain: '#36757f',
        grassAlt: '#428994',
        lane: 0xedf2f7,
        trim: 0xf7d060,
        rock: 0x5c6f89
    },
    sanctum_island: {
        zenith: 0x0ea5e9,
        horizon: 0xccfbf1,
        grassMain: '#2f8564',
        grassAlt: '#3b9a74',
        lane: 0xd6cab0,
        trim: 0xe8c468,
        rock: 0x45696d
    },
    harmonic_sanctuary: {
        zenith: 0x1e1b4b,
        horizon: 0x5b4b8a,
        grassMain: '#284a45',
        grassAlt: '#335d56',
        lane: 0xbcb0c4,
        trim: 0xf5c451,
        rock: 0x3c3756
    }
};
function createGroundTexture(themeId) {
    var _BRIGHT_SKY_PALETTES_themeId;
    var pal = (_BRIGHT_SKY_PALETTES_themeId = BRIGHT_SKY_PALETTES[themeId]) != null ? _BRIGHT_SKY_PALETTES_themeId : BRIGHT_SKY_PALETTES.imperial_sanctuary;
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    var ctx = c.getContext('2d');
    if (ctx) {
        ctx.fillStyle = pal.grassMain;
        ctx.fillRect(0, 0, 512, 512);
        for(var i = 0; i < 65; i++){
            var rx = i * 137 % 512;
            var ry = i * 211 % 512;
            var rad = 26 + i % 4 * 16;
            var g = ctx.createRadialGradient(rx, ry, 2, rx, ry, rad);
            g.addColorStop(0, pal.grassAlt);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(rx, ry, rad, 0, Math.PI * 2);
            ctx.fill();
        }
        for(var i1 = 0; i1 < 750; i1++){
            var rx1 = (i1 * 97 + i1 % 7 * 19) % 512;
            var ry1 = (i1 * 151 + i1 % 5 * 23) % 512;
            ctx.fillStyle = i1 % 9 === 0 ? 'rgba(254,249,195,0.22)' : 'rgba(20,55,28,0.14)';
            ctx.fillRect(rx1, ry1, 2, 5);
        }
    }
    var tex = new _three.CanvasTexture(c);
    tex.colorSpace = _three.SRGBColorSpace;
    tex.wrapS = _three.RepeatWrapping;
    tex.wrapT = _three.RepeatWrapping;
    tex.repeat.set(12, 12);
    return tex;
}
function createRiverTexture(themeId) {
    var _MAP_THEMES_themeId;
    var theme = (_MAP_THEMES_themeId = _mapData.MAP_THEMES[themeId]) != null ? _MAP_THEMES_themeId : _mapData.MAP_THEMES.imperial_sanctuary;
    var c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    var ctx = c.getContext('2d');
    if (ctx) {
        var grad = ctx.createLinearGradient(0, 0, 256, 0);
        grad.addColorStop(0, theme.riverA);
        grad.addColorStop(0.5, themeId === 'sanctum_island' ? '#2dd4bf' : themeId === 'celestial_palace' ? '#67e8f9' : '#38bdf8');
        grad.addColorStop(1, theme.riverA);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        // Animated water ripples
        ctx.strokeStyle = 'rgba(240,249,255,0.44)';
        ctx.lineWidth = 3.5;
        for(var y = 14; y < 256; y += 32){
            ctx.beginPath();
            ctx.moveTo(18, y);
            ctx.quadraticCurveTo(128, y + 12, 238, y);
            ctx.stroke();
        }
        // Crisp directional flowing current chevrons (signals +15% river move speed!)
        ctx.strokeStyle = 'rgba(224,242,254,0.72)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for(var y1 = 36; y1 < 256; y1 += 64){
            ctx.beginPath();
            ctx.moveTo(96, y1 - 14);
            ctx.lineTo(128, y1 + 12);
            ctx.lineTo(160, y1 - 14);
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        for(var i = 0; i < 36; i++){
            ctx.fillRect(i * 53 % 240, i * 89 % 240, 10, 3);
        }
    }
    var tex = new _three.CanvasTexture(c);
    tex.colorSpace = _three.SRGBColorSpace;
    tex.wrapS = _three.RepeatWrapping;
    tex.wrapT = _three.RepeatWrapping;
    tex.repeat.set(1, 16);
    return tex;
}
function createLaneDecalTexture(kind) {
    var c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    var ctx = c.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, 256, 256);
        var isExp = kind === 'exp';
        var col = isExp ? '#22D3EE' : '#FACC15';
        var glow = isExp ? 'rgba(34,211,238,0.34)' : 'rgba(250,204,21,0.34)';
        var grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 118);
        grad.addColorStop(0, glow);
        grad.addColorStop(0.75, isExp ? 'rgba(14,165,233,0.12)' : 'rgba(245,158,11,0.12)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(128, 128, 118, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(128, 128, 96, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([
            14,
            10
        ]);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(128, 128, 82, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 68px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(isExp ? '⚔' : '🪙', 128, 112);
        ctx.font = 'bold 28px sans-serif';
        ctx.fillStyle = col;
        ctx.fillText(isExp ? 'EXP LANE' : 'GOLD LANE', 128, 178);
    }
    var tex = new _three.CanvasTexture(c);
    tex.colorSpace = _three.SRGBColorSpace;
    return tex;
}
function createSkyDome(zenithHex, horizonHex) {
    var skyGeo = new _three.SphereGeometry(265, 24, 14);
    var skyMat = new _three.ShaderMaterial({
        side: _three.BackSide,
        depthWrite: false,
        uniforms: {
            uTop: {
                value: new _three.Color(zenithHex)
            },
            uBottom: {
                value: new _three.Color(horizonHex)
            }
        },
        vertexShader: "\n      varying vec3 vWorldPos;\n      void main() {\n        vec4 wp = modelMatrix * vec4(position, 1.0);\n        vWorldPos = wp.xyz;\n        gl_Position = projectionMatrix * viewMatrix * wp;\n      }\n    ",
        fragmentShader: "\n      uniform vec3 uTop;\n      uniform vec3 uBottom;\n      varying vec3 vWorldPos;\n      void main() {\n        float h = normalize(vWorldPos).y;\n        float t = pow(max(h, 0.0), 0.55);\n        gl_FragColor = vec4(mix(uBottom, uTop, t), 1.0);\n      }\n    "
    });
    return new _three.Mesh(skyGeo, skyMat);
}
function buildLandOfDawn3D(themeId, variant, isBrawl, expLane, goldLane) {
    if (expLane === void 0) expLane = 'top';
    if (goldLane === void 0) goldLane = 'bot';
    var _MAP_THEMES_themeId, _BRIGHT_SKY_PALETTES_themeId;
    var theme = (_MAP_THEMES_themeId = _mapData.MAP_THEMES[themeId]) != null ? _MAP_THEMES_themeId : _mapData.MAP_THEMES.imperial_sanctuary;
    var pal = (_BRIGHT_SKY_PALETTES_themeId = BRIGHT_SKY_PALETTES[themeId]) != null ? _BRIGHT_SKY_PALETTES_themeId : BRIGHT_SKY_PALETTES.imperial_sanctuary;
    var root = new _three.Group();
    var textures = [];
    var shortcutWallMeshes = new Map();
    var cycloneMeshes = new Map();
    // 0. Theme-Matched Sky Dome
    root.add(createSkyDome(pal.zenith, pal.horizon));
    var mapSpan = _mapData.WORLD_SIZE * _ThreeHeroModels.WORLD_SCALE; // 200 units
    var laneStoneMat = new _three.MeshStandardMaterial({
        color: pal.lane,
        roughness: 0.72,
        metalness: 0.1
    });
    var laneTrimMat = new _three.MeshStandardMaterial({
        color: pal.trim,
        roughness: 0.3,
        metalness: 0.68
    });
    var rockMat = new _three.MeshStandardMaterial({
        color: pal.rock,
        roughness: 0.82,
        metalness: 0.1
    });
    var riverMat = null;
    var riverTex = null;
    var bushMesh = null;
    var bushBaseMatrices = [];
    var flyingCloudGroup = null;
    var themeAmbientGroup = null;
    var expDecalMesh = null;
    var goldDecalMesh = null;
    if (isBrawl) {
        // ================= DEDICATED 3D BRAWL SINGLE-LANE ELEVATED BRIDGE =================
        riverTex = createRiverTexture(themeId);
        textures.push(riverTex);
        riverMat = new _three.MeshStandardMaterial({
            map: riverTex,
            roughness: 0.18,
            metalness: 0.35,
            emissive: 0x0c4a6e,
            emissiveIntensity: 0.45
        });
        // Deep luminous abyssal river chasm below the bridge
        var chasmWater = new _three.Mesh(new _three.PlaneGeometry(mapSpan + 160, mapSpan + 160), riverMat);
        chasmWater.rotation.x = -Math.PI / 2;
        chasmWater.position.y = -7.2;
        root.add(chasmWater);
        // Wide elevated Stone & Gold Bridge Deck spanning Blue Base to Red Base
        var ax = (0, _ThreeHeroModels.toThreeX)(_mapData.BLUE_FOUNTAIN.x);
        var az = (0, _ThreeHeroModels.toThreeZ)(_mapData.BLUE_FOUNTAIN.y);
        var bx = (0, _ThreeHeroModels.toThreeX)(_mapData.RED_FOUNTAIN.x);
        var bz = (0, _ThreeHeroModels.toThreeZ)(_mapData.RED_FOUNTAIN.y);
        var bridgeLen = Math.hypot(bx - ax, bz - az) + 12;
        var bridgeW = _mapData.BRAWL_BRIDGE_HALF_WIDTH * 2 * _ThreeHeroModels.WORLD_SCALE;
        var ang = Math.atan2(bx - ax, bz - az);
        var bridgeGroup = new _three.Group();
        bridgeGroup.rotation.y = ang;
        var deck = new _three.Mesh(new _three.BoxGeometry(bridgeW, 1.4, bridgeLen), laneStoneMat);
        deck.position.y = -0.68;
        deck.receiveShadow = true;
        var underArch = new _three.Mesh(new _three.BoxGeometry(bridgeW - 1.6, 5.8, bridgeLen - 8), rockMat);
        underArch.position.y = -4.2;
        var trimL = new _three.Mesh(new _three.BoxGeometry(1.1, 1.8, bridgeLen), laneTrimMat);
        trimL.position.set(-bridgeW * 0.5 - 0.35, 0.28, 0);
        trimL.castShadow = true;
        var trimR = trimL.clone();
        trimR.position.x = bridgeW * 0.5 + 0.35;
        // Glowing arcane bridge guard rails & side lanterns
        var railMat = new _three.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.9,
            roughness: 0.2
        });
        var railL = new _three.Mesh(new _three.BoxGeometry(0.28, 0.24, bridgeLen - 16), railMat);
        railL.position.set(-bridgeW * 0.5 - 0.35, 1.42, 0);
        var railR = railL.clone();
        railR.position.x = bridgeW * 0.5 + 0.35;
        for(var z = -bridgeLen * 0.42; z <= bridgeLen * 0.42; z += 18){
            for(var _i = 0, _iter = [
                -1,
                1
            ]; _i < _iter.length; _i++){
                var side = _iter[_i];
                var post = new _three.Mesh(new _three.CylinderGeometry(0.45, 0.65, 3.2, 8), laneStoneMat);
                post.position.set(side * (bridgeW * 0.5 + 0.45), 1.4, z);
                post.castShadow = true;
                var orb = new _three.Mesh(new _three.OctahedronGeometry(0.45, 0), laneTrimMat);
                orb.position.set(side * (bridgeW * 0.5 + 0.45), 3.3, z);
                bridgeGroup.add(post, orb);
            }
        }
        bridgeGroup.add(deck, underArch, trimL, trimR, railL, railR);
        root.add(bridgeGroup);
        // Side Alcove Platforms for the 2 Brawl Healing Shrines
        for(var _iterator = _create_for_of_iterator_helper_loose(_mapData.BRAWL_HEALING_SHRINES), _step; !(_step = _iterator()).done;){
            var sh = _step.value;
            var alcove = new _three.Mesh(new _three.CylinderGeometry(4.2, 4.6, 1.3, 12), laneStoneMat);
            alcove.position.set((0, _ThreeHeroModels.toThreeX)(sh.x), -0.58, (0, _ThreeHeroModels.toThreeZ)(sh.y));
            alcove.receiveShadow = true;
            var alcoveTrim = new _three.Mesh(new _three.TorusGeometry(4.25, 0.22, 8, 24), laneTrimMat);
            alcoveTrim.rotation.x = Math.PI / 2;
            alcoveTrim.position.set((0, _ThreeHeroModels.toThreeX)(sh.x), 0.14, (0, _ThreeHeroModels.toThreeZ)(sh.y));
            root.add(alcove, alcoveTrim);
        }
    } else {
        // ================= 5v5 LAND OF DAWN 3-LANE ARENA =================
        // 1. Main Meadow Terrain + Extended Valley Apron
        var groundTex = createGroundTexture(themeId);
        textures.push(groundTex);
        var groundMat = new _three.MeshStandardMaterial({
            map: groundTex,
            roughness: 0.88,
            metalness: 0.04
        });
        var ground = new _three.Mesh(new _three.PlaneGeometry(mapSpan + 140, mapSpan + 140), groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        ground.receiveShadow = true;
        root.add(ground);
        // 2. Sculpted Marble/Sandstone & Gold-Trimmed 3D Lanes
        var addLaneSegment = function addLaneSegment(x1, y1, x2, y2, widthWorld) {
            var ax = (0, _ThreeHeroModels.toThreeX)(x1);
            var az = (0, _ThreeHeroModels.toThreeZ)(y1);
            var bx = (0, _ThreeHeroModels.toThreeX)(x2);
            var bz = (0, _ThreeHeroModels.toThreeZ)(y2);
            var len = Math.hypot(bx - ax, bz - az) + widthWorld * _ThreeHeroModels.WORLD_SCALE * 0.45;
            var ang = Math.atan2(bx - ax, bz - az);
            var w3 = widthWorld * _ThreeHeroModels.WORLD_SCALE;
            var border = new _three.Mesh(new _three.BoxGeometry(w3 + 1.35, 0.14, len), laneTrimMat);
            border.position.set((ax + bx) * 0.5, 0.02, (az + bz) * 0.5);
            border.rotation.y = ang;
            border.receiveShadow = true;
            var stone = new _three.Mesh(new _three.BoxGeometry(w3, 0.2, len - 0.4), laneStoneMat);
            stone.position.set((ax + bx) * 0.5, 0.05, (az + bz) * 0.5);
            stone.rotation.y = ang;
            stone.receiveShadow = true;
            root.add(border, stone);
        };
        addLaneSegment(420, 3480, 420, 420, 210);
        addLaneSegment(420, 420, 3480, 420, 210);
        addLaneSegment(520, 3580, 3580, 3580, 210);
        addLaneSegment(3580, 3580, 3580, 520, 210);
        addLaneSegment(520, 3480, 3480, 520, 210);
        // 2B. Glowing 00:00 EXP Lane (Cyan Sword) & Gold Lane (Gold Coin) Floor Decals
        var expPos = (0, _mapData.getLaneDecalPosition)(expLane);
        var goldPos = (0, _mapData.getLaneDecalPosition)(goldLane);
        var expTex = createLaneDecalTexture('exp');
        var goldTex = createLaneDecalTexture('gold');
        textures.push(expTex, goldTex);
        expDecalMesh = new _three.Mesh(new _three.PlaneGeometry(11.5, 11.5), new _three.MeshBasicMaterial({
            map: expTex,
            transparent: true,
            opacity: 0.92,
            depthWrite: false
        }));
        expDecalMesh.rotation.x = -Math.PI / 2;
        expDecalMesh.position.set((0, _ThreeHeroModels.toThreeX)(expPos.x), 0.19, (0, _ThreeHeroModels.toThreeZ)(expPos.y));
        goldDecalMesh = new _three.Mesh(new _three.PlaneGeometry(11.5, 11.5), new _three.MeshBasicMaterial({
            map: goldTex,
            transparent: true,
            opacity: 0.92,
            depthWrite: false
        }));
        goldDecalMesh.rotation.x = -Math.PI / 2;
        goldDecalMesh.position.set((0, _ThreeHeroModels.toThreeX)(goldPos.x), 0.19, (0, _ThreeHeroModels.toThreeZ)(goldPos.y));
        root.add(expDecalMesh, goldDecalMesh);
        // 3. Flowing Diagonal River + Semicircular Objective Pits (Turtle / Lord) + Mid-Lane Bridge Pillars
        var expanding = variant === 'expanding_rivers';
        riverTex = createRiverTexture(themeId);
        textures.push(riverTex);
        riverMat = new _three.MeshStandardMaterial({
            map: riverTex,
            roughness: 0.14,
            metalness: 0.28,
            transparent: true,
            opacity: 0.92
        });
        var riverLen = Math.hypot(3560, 3560) * _ThreeHeroModels.WORLD_SCALE;
        var riverWidth = (expanding ? 345 : 225) * _ThreeHeroModels.WORLD_SCALE;
        var riverPlane = new _three.Mesh(new _three.PlaneGeometry(riverWidth, riverLen), riverMat);
        riverPlane.rotation.x = -Math.PI / 2;
        riverPlane.rotation.z = -Math.PI / 4;
        riverPlane.position.set(0, 0.08, 0);
        root.add(riverPlane);
        // Sculpted Semicircular Objective Pits (Turtle Pit & Lord Pit)
        var pitSpecs = [
            {
                wx: 1280,
                wy: 1280,
                col: expLane === 'top' ? 0x2ce58b : 0xf59e0b,
                rot: Math.PI / 4
            },
            {
                wx: 2720,
                wy: 2720,
                col: expLane === 'top' ? 0xf59e0b : 0x2ce58b,
                rot: -Math.PI * 0.75
            }
        ];
        for(var _iterator1 = _create_for_of_iterator_helper_loose(pitSpecs), _step1; !(_step1 = _iterator1()).done;){
            var pit = _step1.value;
            var px = (0, _ThreeHeroModels.toThreeX)(pit.wx);
            var pz = (0, _ThreeHeroModels.toThreeZ)(pit.wy);
            var pitFloor = new _three.Mesh(new _three.CircleGeometry(10.5, 24), new _three.MeshStandardMaterial({
                color: pal.lane,
                roughness: 0.75,
                metalness: 0.12
            }));
            pitFloor.rotation.x = -Math.PI / 2;
            pitFloor.position.set(px, 0.09, pz);
            var pitArc = new _three.Mesh(new _three.TorusGeometry(10.8, 0.55, 8, 22, Math.PI * 1.15), rockMat);
            pitArc.rotation.x = Math.PI / 2;
            pitArc.rotation.z = pit.rot;
            pitArc.position.set(px, 0.55, pz);
            var pitRune = new _three.Mesh(new _three.RingGeometry(8.6, 9.2, 28), new _three.MeshBasicMaterial({
                color: pit.col,
                side: _three.DoubleSide,
                transparent: true,
                opacity: 0.52,
                depthWrite: false
            }));
            pitRune.rotation.x = -Math.PI / 2;
            pitRune.position.set(px, 0.12, pz);
            root.add(pitFloor, pitArc, pitRune);
        }
        // Mid-Lane Bridge Parapets & Lantern Posts
        var bridgeOffsets = [
            [
                -6.5,
                -6.5
            ],
            [
                6.5,
                6.5
            ],
            [
                -4.2,
                -8.8
            ],
            [
                8.8,
                4.2
            ]
        ];
        for(var _iterator2 = _create_for_of_iterator_helper_loose(bridgeOffsets), _step2; !(_step2 = _iterator2()).done;){
            var _step_value = _step2.value, bx1 = _step_value[0], bz1 = _step_value[1];
            var post1 = new _three.Mesh(new _three.CylinderGeometry(0.45, 0.58, 2.6, 8), laneStoneMat);
            post1.position.set(bx1, 1.3, bz1);
            post1.castShadow = true;
            var cap = new _three.Mesh(new _three.OctahedronGeometry(0.42, 0), laneTrimMat);
            cap.position.set(bx1, 2.95, bz1);
            root.add(post1, cap);
        }
        if (expanding) {
            var eddyGeo = new _three.CircleGeometry(215 * _ThreeHeroModels.WORLD_SCALE, 28);
            var eddyA = new _three.Mesh(eddyGeo, riverMat);
            eddyA.rotation.x = -Math.PI / 2;
            eddyA.position.set((0, _ThreeHeroModels.toThreeX)(1420), 0.075, (0, _ThreeHeroModels.toThreeZ)(1650));
            var eddyB = new _three.Mesh(eddyGeo, riverMat);
            eddyB.rotation.x = -Math.PI / 2;
            eddyB.position.set((0, _ThreeHeroModels.toThreeX)(2580), 0.075, (0, _ThreeHeroModels.toThreeZ)(2350));
            root.add(eddyA, eddyB);
        }
        // 5. Sculpted Multi-Tier 3D Jungle Cliffs & Ruined Stone Walls
        var mossCapMat = new _three.MeshStandardMaterial({
            color: (0, _ThreeHeroModels.hexToInt)(pal.grassAlt, 0x4c9752),
            roughness: 0.85,
            metalness: 0.05
        });
        var activeWalls = (0, _mapData.getActiveMapWalls)(variant);
        for(var _iterator3 = _create_for_of_iterator_helper_loose(activeWalls), _step3; !(_step3 = _iterator3()).done;){
            var w = _step3.value;
            var w3 = w.w * _ThreeHeroModels.WORLD_SCALE;
            var d3 = w.h * _ThreeHeroModels.WORLD_SCALE;
            var cx = (0, _ThreeHeroModels.toThreeX)(w.x + w.w * 0.5);
            var cz = (0, _ThreeHeroModels.toThreeZ)(w.y + w.h * 0.5);
            var wall = new _three.Mesh(new _three.BoxGeometry(w3, 3.6, d3), rockMat);
            wall.position.set(cx, 1.8, cz);
            wall.castShadow = true;
            wall.receiveShadow = true;
            var mossCap = new _three.Mesh(new _three.BoxGeometry(w3 + 0.45, 0.48, d3 + 0.45), mossCapMat);
            mossCap.position.y = 1.92;
            mossCap.receiveShadow = true;
            var ruinSpire = new _three.Mesh(new _three.DodecahedronGeometry(Math.min(w3, d3) * 0.42, 0), rockMat);
            ruinSpire.position.set(0, 2.55, 0);
            ruinSpire.scale.set(1.2, 0.85, 1.1);
            ruinSpire.castShadow = true;
            var trim = new _three.Mesh(new _three.BoxGeometry(w3 + 0.15, 0.22, d3 + 0.15), laneTrimMat);
            trim.position.y = 1.55;
            wall.add(mossCap, ruinSpire, trim);
            root.add(wall);
            if (w.shortcutCampId) {
                shortcutWallMeshes.set(w.shortcutCampId, wall);
            }
        }
        if (variant === 'broken_walls') {
            var rubbleMat = new _three.MeshBasicMaterial({
                color: 0xf59e0b,
                transparent: true,
                opacity: 0.36,
                depthWrite: false
            });
            for(var _iterator4 = _create_for_of_iterator_helper_loose(_mapData.MAP_WALLS), _step4; !(_step4 = _iterator4()).done;){
                var w1 = _step4.value;
                if (!_mapData.BROKEN_WALL_IDS.has(w1.id)) continue;
                var pad = new _three.Mesh(new _three.PlaneGeometry(w1.w * _ThreeHeroModels.WORLD_SCALE, w1.h * _ThreeHeroModels.WORLD_SCALE), rubbleMat);
                pad.rotation.x = -Math.PI / 2;
                pad.position.set((0, _ThreeHeroModels.toThreeX)(w1.x + w1.w * 0.5), 0.12, (0, _ThreeHeroModels.toThreeZ)(w1.y + w1.h * 0.5));
                root.add(pad);
            }
        }
        // 6. Lush Multi-Cluster Swaying 3D Bushes
        var bushes = (0, _mapData.getActiveMapBushes)(variant);
        var bushGeo = new _three.DodecahedronGeometry(1.0, 1);
        var bushMat = new _three.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.82,
            metalness: 0.04
        });
        bushMesh = new _three.InstancedMesh(bushGeo, bushMat, bushes.length * 4);
        bushMesh.castShadow = true;
        bushMesh.receiveShadow = true;
        bushMesh.frustumCulled = false;
        var baseCol = new _three.Color(variant === 'dangerous_grass' ? 0x166534 : (0, _ThreeHeroModels.hexToInt)(theme.bush, 0x22663a));
        var tmpCol = new _three.Color();
        var dummy = new _three.Object3D();
        var idx = 0;
        for(var _iterator5 = _create_for_of_iterator_helper_loose(bushes), _step5; !(_step5 = _iterator5()).done;){
            var b = _step5.value;
            var bx2 = (0, _ThreeHeroModels.toThreeX)(b.cx);
            var bz2 = (0, _ThreeHeroModels.toThreeZ)(b.cy);
            var rx3 = b.rx * _ThreeHeroModels.WORLD_SCALE;
            var ry3 = b.ry * _ThreeHeroModels.WORLD_SCALE;
            for(var k = 0; k < 4; k++){
                var off = (k - 1.5) * rx3 * 0.38;
                var ox = bx2 + Math.cos(b.angle) * off;
                var oz = bz2 + Math.sin(b.angle) * off;
                var sx = rx3 * (0.52 + k % 2 * 0.1);
                var sz = ry3 * (0.78 + (k + 1) % 2 * 0.12);
                dummy.position.set(ox, 1.15, oz);
                dummy.rotation.set(0, -b.angle + k * 0.4, 0);
                dummy.scale.set(sx, 1.55 + (k === 1 || k === 2 ? 0.35 : 0), sz);
                dummy.updateMatrix();
                bushMesh.setMatrixAt(idx, dummy.matrix);
                tmpCol.copy(baseCol).offsetHSL(0, 0.04, (k - 1.5) * 0.045);
                bushMesh.setColorAt(idx, tmpCol);
                bushBaseMatrices.push({
                    x: ox,
                    z: oz,
                    sx: sx,
                    sz: sz,
                    rot: -b.angle + k * 0.4
                });
                idx++;
            }
        }
        bushMesh.instanceMatrix.needsUpdate = true;
        if (bushMesh.instanceColor) bushMesh.instanceColor.needsUpdate = true;
        root.add(bushMesh);
        // 7. Cyclone Eyes (Rotating Turquoise Wind Rings)
        var ceGeo = new _three.TorusGeometry(2.2, 0.2, 8, 22, Math.PI * 1.5);
        for(var _iterator6 = _create_for_of_iterator_helper_loose(_mapData.CYCLONE_EYES), _step6; !(_step6 = _iterator6()).done;){
            var ce = _step6.value;
            var mat = new _three.MeshBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.85
            });
            var ring = new _three.Mesh(ceGeo, mat);
            ring.rotation.x = Math.PI / 2;
            ring.position.set((0, _ThreeHeroModels.toThreeX)(ce.x), 0.38, (0, _ThreeHeroModels.toThreeZ)(ce.y));
            root.add(ring);
            cycloneMeshes.set(ce.id, ring);
        }
        // 8. Flying Cloud Launch Pedestal (2026 Variant)
        if (variant === 'flying_cloud') {
            flyingCloudGroup = new _three.Group();
            flyingCloudGroup.position.set((0, _ThreeHeroModels.toThreeX)(_mapData.FLYING_CLOUD_BLUE.x), 0.36, (0, _ThreeHeroModels.toThreeZ)(_mapData.FLYING_CLOUD_BLUE.y));
            var pad1 = new _three.Mesh(new _three.CylinderGeometry(3.8, 4.2, 0.36, 20), new _three.MeshStandardMaterial({
                color: 0xc084fc,
                emissive: 0xa855f7,
                emissiveIntensity: 0.65,
                roughness: 0.28
            }));
            var swirl = new _three.Mesh(new _three.TorusGeometry(3.4, 0.24, 8, 28), new _three.MeshBasicMaterial({
                color: 0xf0abfc,
                transparent: true,
                opacity: 0.88
            }));
            swirl.rotation.x = Math.PI / 2;
            swirl.position.y = 0.5;
            flyingCloudGroup.add(pad1, swirl);
            root.add(flyingCloudGroup);
        }
        // 9. Theme-Specific Signature 3D Visual Landmarks & Atmospheric Particles
        themeAmbientGroup = new _three.Group();
        if (themeId === 'harmonic_sanctuary') {
            // Glowing twilight roadside lanterns + floating lotus blossoms along the diagonal river
            var lanternMat = new _three.MeshBasicMaterial({
                color: 0xfde047
            });
            var lotusMat = new _three.MeshBasicMaterial({
                color: 0xf472b6,
                transparent: true,
                opacity: 0.92
            });
            for(var i = 0; i < 12; i++){
                var t = -75 + i * 13.5;
                var lotus = new _three.Mesh(new _three.CylinderGeometry(0.95, 0.6, 0.22, 7), lotusMat);
                lotus.position.set(t + (i % 2 === 0 ? 2.4 : -2.4), 0.24, t - (i % 2 === 0 ? 1.8 : -1.8));
                themeAmbientGroup.add(lotus);
            }
            var lanternCoords = [
                [
                    600,
                    2600
                ],
                [
                    600,
                    1400
                ],
                [
                    1400,
                    600
                ],
                [
                    2600,
                    600
                ],
                [
                    3400,
                    1400
                ],
                [
                    3400,
                    2600
                ],
                [
                    2600,
                    3400
                ],
                [
                    1400,
                    3400
                ]
            ];
            for(var _iterator7 = _create_for_of_iterator_helper_loose(lanternCoords), _step7; !(_step7 = _iterator7()).done;){
                var _step_value1 = _step7.value, lx = _step_value1[0], ly = _step_value1[1];
                var post2 = new _three.Mesh(new _three.CylinderGeometry(0.18, 0.25, 3.6, 6), rockMat);
                post2.position.set((0, _ThreeHeroModels.toThreeX)(lx), 1.8, (0, _ThreeHeroModels.toThreeZ)(ly));
                var glow = new _three.Mesh(new _three.SphereGeometry(0.55, 8, 8), lanternMat);
                glow.position.set((0, _ThreeHeroModels.toThreeX)(lx), 3.8, (0, _ThreeHeroModels.toThreeZ)(ly));
                themeAmbientGroup.add(post2, glow);
            }
        } else if (themeId === 'western_expanse') {
            // Floating golden-amber desert dust motes
            var count = 220;
            var positions = new Float32Array(count * 3);
            for(var i1 = 0; i1 < count; i1++){
                positions[i1 * 3] = i1 * 73 % 200 - 100;
                positions[i1 * 3 + 1] = 1.5 + i1 * 29 % 14;
                positions[i1 * 3 + 2] = i1 * 113 % 200 - 100;
            }
            var pGeo = new _three.BufferGeometry();
            pGeo.setAttribute('position', new _three.BufferAttribute(positions, 3));
            var dust = new _three.Points(pGeo, new _three.PointsMaterial({
                color: 0xfcd34d,
                size: 0.75,
                transparent: true,
                opacity: 0.7
            }));
            themeAmbientGroup.add(dust);
        } else if (themeId === 'celestial_palace') {
            // Floating golden astral halo rings framing the sky arena perimeter
            var cloudMat = new _three.MeshBasicMaterial({
                color: 0xfef3c7,
                transparent: true,
                opacity: 0.45
            });
            for(var i2 = 0; i2 < 16; i2++){
                var a = i2 / 16 * Math.PI * 2;
                var puff = new _three.Mesh(new _three.SphereGeometry(7.5, 10, 8), cloudMat);
                puff.scale.set(1.8, 0.42, 1.3);
                puff.position.set(Math.cos(a) * 116, 4.5 + i2 % 3 * 2.5, Math.sin(a) * 116);
                themeAmbientGroup.add(puff);
            }
        } else if (themeId === 'sanctum_island') {
            // Misty coastal teal waterfall pillars flanking outer cliff edges
            var mistMat = new _three.MeshBasicMaterial({
                color: 0x5eead4,
                transparent: true,
                opacity: 0.42
            });
            for(var i3 = 0; i3 < 8; i3++){
                var a1 = i3 / 8 * Math.PI * 2 + 0.35;
                var fall = new _three.Mesh(new _three.CylinderGeometry(2.6, 3.8, 16, 8), mistMat);
                fall.position.set(Math.cos(a1) * 118, 6.5, Math.sin(a1) * 118);
                themeAmbientGroup.add(fall);
            }
        }
        root.add(themeAmbientGroup);
    }
    // 4. Stepped Blue Sanctuary & Red Citadel Base Terraces + Glowing Fountains + Banner Pillars (Both 5v5 and Brawl)
    var addBasePlaza = function addBasePlaza(wx, wy, ringCol, glowCol) {
        var cx = (0, _ThreeHeroModels.toThreeX)(wx);
        var cz = (0, _ThreeHeroModels.toThreeZ)(wy);
        var lowerStep = new _three.Mesh(new _three.CylinderGeometry(465 * _ThreeHeroModels.WORLD_SCALE, 495 * _ThreeHeroModels.WORLD_SCALE, 0.32, 24), rockMat);
        lowerStep.position.set(cx, 0.08, cz);
        lowerStep.receiveShadow = true;
        var plaza = new _three.Mesh(new _three.CylinderGeometry(440 * _ThreeHeroModels.WORLD_SCALE, 455 * _ThreeHeroModels.WORLD_SCALE, 0.28, 24), laneStoneMat);
        plaza.position.set(cx, 0.24, cz);
        plaza.receiveShadow = true;
        var borderRing = new _three.Mesh(new _three.RingGeometry(420 * _ThreeHeroModels.WORLD_SCALE, 448 * _ThreeHeroModels.WORLD_SCALE, 32), new _three.MeshBasicMaterial({
            color: ringCol,
            side: _three.DoubleSide,
            transparent: true,
            opacity: 0.78
        }));
        borderRing.rotation.x = -Math.PI / 2;
        borderRing.position.set(cx, 0.4, cz);
        var fountainRim = new _three.Mesh(new _three.TorusGeometry(185 * _ThreeHeroModels.WORLD_SCALE, 0.35, 8, 28), laneTrimMat);
        fountainRim.rotation.x = Math.PI / 2;
        fountainRim.position.set(cx, 0.42, cz);
        var fountain = new _three.Mesh(new _three.CircleGeometry(185 * _ThreeHeroModels.WORLD_SCALE, 28), new _three.MeshBasicMaterial({
            color: glowCol,
            transparent: true,
            opacity: 0.46,
            depthWrite: false
        }));
        fountain.rotation.x = -Math.PI / 2;
        fountain.position.set(cx, 0.41, cz);
        root.add(lowerStep, plaza, borderRing, fountainRim, fountain);
        var bannerMat = new _three.MeshStandardMaterial({
            color: ringCol,
            emissive: ringCol,
            emissiveIntensity: 0.55,
            roughness: 0.3
        });
        for(var i = 0; i < 4; i++){
            var a = i * Math.PI / 2 + Math.PI / 4;
            var px = cx + Math.cos(a) * 19.5;
            var pz = cz + Math.sin(a) * 19.5;
            var colMesh = new _three.Mesh(new _three.CylinderGeometry(0.6, 0.85, 5.2, 8), laneStoneMat);
            colMesh.position.set(px, 2.7, pz);
            colMesh.castShadow = true;
            var gem = new _three.Mesh(new _three.OctahedronGeometry(0.65, 0), bannerMat);
            gem.position.set(px, 5.85, pz);
            root.add(colMesh, gem);
        }
    };
    addBasePlaza(_mapData.BLUE_FOUNTAIN.x, _mapData.BLUE_FOUNTAIN.y, 0x38bdf8, 0x22d3ee);
    addBasePlaza(_mapData.RED_FOUNTAIN.x, _mapData.RED_FOUNTAIN.y, 0xf43f5e, 0xfb7185);
    // 10. Horizon Perimeter Pine Groves & Canyon Cliffs (for 5v5)
    if (!isBrawl) {
        var treeCount = 72;
        var trunkMesh = new _three.InstancedMesh(new _three.CylinderGeometry(0.45, 0.72, 3.8, 6), new _three.MeshStandardMaterial({
            color: 0x5c3d24,
            roughness: 0.9
        }), treeCount);
        var canopyLow = new _three.InstancedMesh(new _three.ConeGeometry(3.1, 5.8, 7), new _three.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.8
        }), treeCount);
        var canopyHigh = new _three.InstancedMesh(new _three.ConeGeometry(2.1, 4.6, 7), new _three.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.78
        }), treeCount);
        var cliffCount = 36;
        var cliffMesh = new _three.InstancedMesh(new _three.DodecahedronGeometry(7.5, 0), rockMat, cliffCount);
        var pineBaseCol = new _three.Color((0, _ThreeHeroModels.hexToInt)(theme.bush, 0x1f6b3b));
        var cTmp = new _three.Color();
        var tDummy = new _three.Object3D();
        for(var i4 = 0; i4 < treeCount; i4++){
            var side1 = i4 % 4;
            var frac = (Math.floor(i4 / 4) + 0.5) / (treeCount / 4) * 2 - 1;
            var distEdge = 107 + i4 % 4 * 5.5;
            var tx = side1 === 0 ? -distEdge : side1 === 1 ? distEdge : frac * 112;
            var tz = side1 === 2 ? -distEdge : side1 === 3 ? distEdge : frac * 112;
            var sc = 0.85 + i4 % 5 * 0.16;
            tDummy.position.set(tx, 1.9 * sc, tz);
            tDummy.rotation.set(0, i4 * 0.9 % Math.PI, 0);
            tDummy.scale.setScalar(sc);
            tDummy.updateMatrix();
            trunkMesh.setMatrixAt(i4, tDummy.matrix);
            tDummy.position.set(tx, 5.2 * sc, tz);
            tDummy.updateMatrix();
            canopyLow.setMatrixAt(i4, tDummy.matrix);
            tDummy.position.set(tx, 8.2 * sc, tz);
            tDummy.updateMatrix();
            canopyHigh.setMatrixAt(i4, tDummy.matrix);
            cTmp.copy(pineBaseCol).offsetHSL(0, 0.05, (i4 % 5 - 2) * 0.04);
            canopyLow.setColorAt(i4, cTmp);
            cTmp.offsetHSL(0, 0.03, 0.05);
            canopyHigh.setColorAt(i4, cTmp);
        }
        trunkMesh.instanceMatrix.needsUpdate = true;
        canopyLow.instanceMatrix.needsUpdate = true;
        canopyHigh.instanceMatrix.needsUpdate = true;
        if (canopyLow.instanceColor) canopyLow.instanceColor.needsUpdate = true;
        if (canopyHigh.instanceColor) canopyHigh.instanceColor.needsUpdate = true;
        trunkMesh.computeBoundingSphere();
        canopyLow.computeBoundingSphere();
        canopyHigh.computeBoundingSphere();
        for(var i5 = 0; i5 < cliffCount; i5++){
            var ang1 = i5 / cliffCount * Math.PI * 2;
            var r = 128 + i5 % 3 * 14;
            var sx1 = 1.2 + i5 % 4 * 0.45;
            var sy = 1.6 + i5 % 5 * 0.55;
            tDummy.position.set(Math.cos(ang1) * r, sy * 3.2, Math.sin(ang1) * r);
            tDummy.rotation.set(0, ang1, 0);
            tDummy.scale.set(sx1, sy, sx1 * 0.85);
            tDummy.updateMatrix();
            cliffMesh.setMatrixAt(i5, tDummy.matrix);
        }
        cliffMesh.instanceMatrix.needsUpdate = true;
        cliffMesh.computeBoundingSphere();
        root.add(trunkMesh, canopyLow, canopyHigh, cliffMesh);
    }
    // 11. Real-Time 3D Ground Fog-of-War Illumination Overlay (dims unlit zones outside allied vision radii!)
    var fogCanvas = document.createElement('canvas');
    fogCanvas.width = 128;
    fogCanvas.height = 128;
    var fogCtx = fogCanvas.getContext('2d');
    var fogTex = new _three.CanvasTexture(fogCanvas);
    fogTex.minFilter = _three.LinearFilter;
    fogTex.magFilter = _three.LinearFilter;
    textures.push(fogTex);
    var fogPlane = new _three.Mesh(new _three.PlaneGeometry(mapSpan + 4, mapSpan + 4), new _three.MeshBasicMaterial({
        map: fogTex,
        transparent: true,
        depthWrite: false,
        opacity: 1
    }));
    fogPlane.rotation.x = -Math.PI / 2;
    fogPlane.position.y = 0.44;
    fogPlane.renderOrder = 3;
    root.add(fogPlane);
    var updateFogOfWar = function updateFogOfWar(visionCircles, revealAll) {
        if (!fogCtx) return;
        if (revealAll) {
            fogPlane.visible = false;
            return;
        }
        fogPlane.visible = true;
        fogCtx.globalCompositeOperation = 'source-over';
        fogCtx.clearRect(0, 0, 128, 128);
        fogCtx.fillStyle = 'rgba(4, 10, 24, 0.54)';
        fogCtx.fillRect(0, 0, 128, 128);
        fogCtx.globalCompositeOperation = 'destination-out';
        var scale = 128 / _mapData.WORLD_SIZE;
        for(var _iterator = _create_for_of_iterator_helper_loose(visionCircles), _step; !(_step = _iterator()).done;){
            var c = _step.value;
            var cx = c.x * scale;
            var cy = c.y * scale;
            var r = Math.max(4, c.radius * scale);
            var grad = fogCtx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
            grad.addColorStop(0, 'rgba(0,0,0,1)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            fogCtx.fillStyle = grad;
            fogCtx.beginPath();
            fogCtx.arc(cx, cy, r, 0, Math.PI * 2);
            fogCtx.fill();
        }
        fogCtx.globalCompositeOperation = 'source-over';
        fogTex.needsUpdate = true;
    };
    var dispose = function dispose() {
        root.traverse(function(obj) {
            var m = obj;
            if (m.geometry) m.geometry.dispose();
            var mats = Array.isArray(m.material) ? m.material : m.material ? [
                m.material
            ] : [];
            for(var _iterator = _create_for_of_iterator_helper_loose(mats), _step; !(_step = _iterator()).done;){
                var mat = _step.value;
                mat.dispose();
            }
        });
        for(var _iterator = _create_for_of_iterator_helper_loose(textures), _step; !(_step = _iterator()).done;){
            var tex = _step.value;
            tex.dispose();
        }
    };
    return {
        root: root,
        riverMat: riverMat,
        riverTex: riverTex,
        bushMesh: bushMesh,
        bushBaseMatrices: bushBaseMatrices,
        shortcutWallMeshes: shortcutWallMeshes,
        cycloneMeshes: cycloneMeshes,
        flyingCloudGroup: flyingCloudGroup,
        themeAmbientGroup: themeAmbientGroup,
        expDecalMesh: expDecalMesh,
        goldDecalMesh: goldDecalMesh,
        updateFogOfWar: updateFogOfWar,
        dispose: dispose
    };
}

});

})(window.ArcadeMod);

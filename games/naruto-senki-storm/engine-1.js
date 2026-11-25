(function(ArcadeMod){
// === MODULE: src/games/naruto-senki-storm/NarutoSenkiStorm ===
ArcadeMod.define("src/games/naruto-senki-storm/NarutoSenkiStorm", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NarutoSenkiStormGame", {
    enumerable: true,
    get: function() {
        return NarutoSenkiStormGame;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _arenaRoster = require("../../core/arenaRoster");
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
var _viewport = require("../../core/viewport");
var _threeShared = require("../../core/threeShared");
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
var _stormCamDesired = new _three.Vector3();
var _stormProjVec = new _three.Vector3();
var NarutoSenkiStormGame = /*#__PURE__*/ function() {
    "use strict";
    function NarutoSenkiStormGame(canvas, ctx, threeContainer, diff, level, gameIdx) {
        var _this = this;
        var _NARUTO_SHINOBI_ROSTER_chosenHeroId, _NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport1, _NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport2, _NARUTO_MODES_find, _NARUTO_STAGES_find;
        this.score = 0;
        this.lives = 100;
        this.maxLives = 100;
        this.isPaused = false;
        this.gameOver = false;
        this.isRunning = false;
        this.moveDx = 0;
        this.moveDy = 0;
        this.steerLeftHeld = false;
        this.steerRightHeld = false;
        this.chakraChargeHeld = false;
        this.guardHeld = false;
        this.cutInBanner = null;
        // --- PART 1: 2D SENKI STATE ---
        this.senkiWidth = 800;
        this.senkiHeight = 600;
        this.senkiLaneWidth = 2600;
        this.senkiGroundY = 420;
        this.senkiCameraX = 0;
        this.senkiFighters = [];
        this.senkiMinions = [];
        this.senkiTowers = [];
        this.senkiProjectiles = [];
        this.senkiFloatTexts = [];
        this.senkiWaveTimer = 2.5;
        this.senkiGold = 120;
        this.senkiGoldTick = 0;
        this.senkiRamenCds = [
            0,
            0,
            0
        ];
        this.senkiKills = 0;
        this.senkiDeaths = 0;
        this.senkiTowersDestroyedCount = 0;
        this.senkiAnimFrame = null;
        this.senkiLastTs = 0;
        // --- PART 2: 3D STORM STATE ---
        this.three = null;
        this.stormArenaGroup = new _three.Group();
        this.stormAmenominakaIndex = 0;
        this.stormPlayerTeam = [];
        this.stormEnemyTeam = [];
        this.stormActivePlayerSlot = 0;
        this.stormActiveEnemySlot = 0;
        this.stormSupportCds = [
            0,
            0
        ];
        this.stormGauge = 0; // 0..100
        this.stormToolUses = [
            2,
            2,
            3,
            2
        ];
        this.stormToolCds = [
            0,
            0,
            0,
            0
        ];
        this.stormProjectiles = [];
        this.stormLogs = [];
        this.stormLastTs = 0;
        this.loopSenki2D = function() {
            if (_this.gameOver || !_this.isRunning) return;
            var now = performance.now();
            var dt = Math.min(0.05, Math.max(0.008, (now - _this.senkiLastTs) / 1000));
            _this.senkiLastTs = now;
            if (!_this.isPaused) {
                _this.updateSenki2D(dt);
            }
            if (_this.gameOver || !_this.isRunning) return;
            _this.renderSenki2D();
            _this.senkiAnimFrame = requestAnimationFrame(_this.loopSenki2D);
        };
        this.loopStorm3D = function() {
            if (_this.gameOver || !_this.isRunning || !_this.three || _this.three.disposed) return;
            var now = performance.now();
            var dt = Math.min(0.05, Math.max(0.008, (now - _this.stormLastTs) / 1000));
            _this.stormLastTs = now;
            if (!_this.isPaused) {
                _this.updateStorm3D(dt);
            }
            if (_this.gameOver || !_this.isRunning || !_this.three || _this.three.disposed) return;
            _this.three.render();
            _this.three.scheduleNextFrame(_this.loopStorm3D);
        };
        this.canvas = canvas;
        this.ctx = ctx;
        this.threeContainer = threeContainer;
        this.diff = diff;
        this.level = level;
        this.gameIdx = gameIdx;
        var chosenHeroId = _storage.playerState.narutoTrialHeroId !== null ? _storage.playerState.narutoTrialHeroId : _storage.playerState.selectedNarutoHero;
        this.leadDef = (_NARUTO_SHINOBI_ROSTER_chosenHeroId = _arenaRoster.NARUTO_SHINOBI_ROSTER[chosenHeroId]) != null ? _NARUTO_SHINOBI_ROSTER_chosenHeroId : _arenaRoster.NARUTO_SHINOBI_ROSTER[0];
        this.support1Def = (_NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport1 = _arenaRoster.NARUTO_SHINOBI_ROSTER[_storage.playerState.selectedNarutoSupport1]) != null ? _NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport1 : _arenaRoster.NARUTO_SHINOBI_ROSTER[(this.leadDef.id + 1) % _arenaRoster.NARUTO_SHINOBI_ROSTER.length];
        this.support2Def = (_NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport2 = _arenaRoster.NARUTO_SHINOBI_ROSTER[_storage.playerState.selectedNarutoSupport2]) != null ? _NARUTO_SHINOBI_ROSTER_playerState_selectedNarutoSupport2 : _arenaRoster.NARUTO_SHINOBI_ROSTER[(this.leadDef.id + 2) % _arenaRoster.NARUTO_SHINOBI_ROSTER.length];
        this.support1Type = _storage.playerState.narutoSupport1Type || 'attack';
        this.support2Type = _storage.playerState.narutoSupport2Type || 'guard';
        this.modeDef = (_NARUTO_MODES_find = _arenaRoster.NARUTO_MODES.find(function(m) {
            return m.id === _storage.playerState.selectedNarutoMode;
        })) != null ? _NARUTO_MODES_find : _arenaRoster.NARUTO_MODES[0];
        this.stageDef = (_NARUTO_STAGES_find = _arenaRoster.NARUTO_STAGES.find(function(s) {
            return s.id === _storage.playerState.selectedNarutoStage;
        })) != null ? _NARUTO_STAGES_find : _arenaRoster.NARUTO_STAGES[0];
        this.uses3DViewport = this.modeDef.engine === 'storm_3d';
        this.teamSynergy = (0, _arenaRoster.resolveNarutoTeamSynergy)([
            this.leadDef.id,
            this.support1Def.id,
            this.support2Def.id
        ]);
    }
    var _proto = NarutoSenkiStormGame.prototype;
    _proto.start = function start() {
        this.gameOver = false;
        this.isPaused = false;
        this.isRunning = true;
        this.score = 0;
        this.cutInBanner = {
            title: this.leadDef.name.toUpperCase() + " — " + this.modeDef.title.toUpperCase(),
            subtitle: this.stageDef.name + " • Team Synergy: " + this.teamSynergy.name,
            color: "#" + this.leadDef.chakraColor.toString(16).padStart(6, '0'),
            timer: 2.8
        };
        if (this.uses3DViewport) {
            this.initStorm3D();
        } else {
            this.initSenki2D();
        }
    };
    _proto.stop = function stop() {
        this.isRunning = false;
        this.gameOver = true;
        if (this.senkiAnimFrame !== null) {
            cancelAnimationFrame(this.senkiAnimFrame);
            this.senkiAnimFrame = null;
        }
        if (this.three) {
            this.three.dispose();
            this.three = null;
        }
        (0, _runtimeBridge.updateNarutoHud)(null);
    };
    _proto.pause = function pause() {
        this.isPaused = true;
    };
    _proto.resume = function resume() {
        this.isPaused = false;
        this.senkiLastTs = performance.now();
        this.stormLastTs = performance.now();
    };
    _proto.releaseInputs = function releaseInputs() {
        this.moveDx = 0;
        this.moveDy = 0;
        this.steerLeftHeld = false;
        this.steerRightHeld = false;
        this.chakraChargeHeld = false;
        this.guardHeld = false;
    };
    _proto.setMoveDir = function setMoveDir(dx, dy) {
        this.moveDx = dx;
        this.moveDy = dy;
    };
    _proto.setSteerLeft = function setSteerLeft(down) {
        this.steerLeftHeld = down;
    };
    _proto.setSteerRight = function setSteerRight(down) {
        this.steerRightHeld = down;
    };
    _proto.attack = function attack() {
        if (this.gameOver || this.isPaused) return;
        if (this.uses3DViewport) {
            this.performStormMeleeOrKunai(false);
        } else {
            var player = this.senkiFighters.find(function(f) {
                return f.isPlayer;
            });
            if (player && player.alive && player.attackCd <= 0) {
                this.performSenkiBasicAttack(player);
            }
        }
    };
    _proto.jump = function jump() {
        this.triggerAction('jump', true);
    };
    _proto.triggerAction = function triggerAction(actionKey, pressed) {
        if (this.gameOver || this.isPaused) return;
        if (actionKey === 'chakra') {
            this.chakraChargeHeld = pressed;
            return;
        }
        if (actionKey === 'guard') {
            this.guardHeld = pressed;
            return;
        }
        if (!pressed) return;
        if (this.uses3DViewport) {
            var p = this.stormPlayerTeam[this.stormActivePlayerSlot];
            var e = this.stormEnemyTeam[this.stormActiveEnemySlot];
            if (!p || !e) return;
            if (actionKey === 'action' || actionKey === 'attack' || actionKey === 'fire') {
                this.performStormMeleeOrKunai(false);
            } else if (actionKey === 'jump' || actionKey === 'skill1') {
                // Skill 1 / Jump = Signature Ninjutsu (or Chakra Dash if holding Chakra)
                if (this.chakraChargeHeld && p.chakra >= 10) {
                    p.chakra -= 10;
                    p.dashTimer = 0.36;
                    _audio.ArcadeAudio.play('dash');
                } else {
                    this.performStormNinjutsu(p, e);
                }
            } else if (actionKey === 'skill2') {
                // Skill 2 = Chakra Shuriken / Counterattack Parry if Guarding
                if (this.guardHeld || p.isGuarding) {
                    if (p.counterStartupTimer <= 0) {
                        p.counterStartupTimer = 0.48;
                        p.chakraLockedTimer = 16.0; // Locks 35% of max Chakra grey for 16s
                        p.chakra = Math.min(p.chakra, 65);
                        _audio.ArcadeAudio.play('sword');
                    }
                } else {
                    this.performStormMeleeOrKunai(true);
                }
            } else if (actionKey === 'skill3') {
                // Skill 3 = Chakra Dash (10% Chakra)
                if (p.chakra >= 10) {
                    p.chakra -= 10;
                    p.dashTimer = 0.36;
                    _audio.ArcadeAudio.play('dash');
                }
            } else if (actionKey === 'skill4') {
                // Skill 4 = Secret Technique (Ougi) or Linked Team Ultimate (45% Chakra)
                this.performStormUltimateOugi(p, e);
            } else if (actionKey === 'skill5') {
                // Skill 5 = True Awakening
                this.performStormAwakening(p);
            } else if (actionKey === 'sub') {
                // Substitution Log (Kawarimi)
                this.triggerSubstitutionKawarimi(p, e);
            } else if (actionKey === 'support') {
                // Call Support Assist 1 or 2
                if (this.stormSupportCds[0] <= 0) this.triggerStormSupport(1);
                else this.triggerStormSupport(2);
            }
        } else {
            var player = this.senkiFighters.find(function(f) {
                return f.isPlayer;
            });
            if (!player || !player.alive) return;
            if (actionKey === 'action' || actionKey === 'attack' || actionKey === 'fire') {
                if (player.attackCd <= 0) this.performSenkiBasicAttack(player);
            } else if (actionKey === 'jump' || actionKey === 'skill1') {
                this.castSenkiSkill(player, 0);
            } else if (actionKey === 'skill2') {
                this.castSenkiSkill(player, 1);
            } else if (actionKey === 'skill3') {
                this.castSenkiSkill(player, 2);
            } else if (actionKey === 'skill4') {
                this.castSenkiSkill(player, 3);
            } else if (actionKey === 'skill5') {
                this.castSenkiSkill(player, 4);
            } else if (actionKey === 'sub') {
                // Quick evade dash in Senki
                player.iFrameTimer = Math.max(player.iFrameTimer, 0.45);
                player.x = Math.max(120, Math.min(this.senkiLaneWidth - 120, player.x - player.facing * 95));
                _audio.ArcadeAudio.play('dash');
            } else if (actionKey === 'support') {
                this.buySenkiItem('ramen');
            }
        }
    };
    // ============================================================================
    // PART 1: 2D NARUTO SENKI INITIALIZATION & LOOP
    // ============================================================================
    _proto.resizeSenkiCanvas = function resizeSenkiCanvas() {
        var vp = typeof window !== 'undefined' ? (0, _viewport.getViewportSize)() : {
            width: 800,
            height: 600
        };
        this.senkiWidth = Math.max(240, vp.width);
        this.senkiHeight = Math.max(240, vp.height);
        var dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
        this.canvas.width = Math.floor(this.senkiWidth * dpr);
        this.canvas.height = Math.floor(this.senkiHeight * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var prevGroundY = this.senkiGroundY;
        var isCompactLandscape = this.senkiWidth > this.senkiHeight * 1.2 && this.senkiHeight <= 460;
        this.senkiGroundY = isCompactLandscape ? Math.round(this.senkiHeight * 0.72) : Math.max(270, Math.min(520, this.senkiHeight - 108));
        var dy = this.senkiGroundY - prevGroundY;
        if (dy !== 0) {
            for(var _iterator = _create_for_of_iterator_helper_loose(this.senkiTowers), _step; !(_step = _iterator()).done;){
                var t = _step.value;
                t.y = this.senkiGroundY;
            }
            for(var _iterator1 = _create_for_of_iterator_helper_loose(this.senkiMinions), _step1; !(_step1 = _iterator1()).done;){
                var m = _step1.value;
                m.y = this.senkiGroundY;
            }
            for(var _iterator2 = _create_for_of_iterator_helper_loose(this.senkiFighters), _step2; !(_step2 = _iterator2()).done;){
                var f = _step2.value;
                f.y = this.senkiGroundY;
            }
            for(var _iterator3 = _create_for_of_iterator_helper_loose(this.senkiProjectiles), _step3; !(_step3 = _iterator3()).done;){
                var p = _step3.value;
                p.y += dy;
            }
            for(var _iterator4 = _create_for_of_iterator_helper_loose(this.senkiFloatTexts), _step4; !(_step4 = _iterator4()).done;){
                var ft = _step4.value;
                ft.y += dy;
            }
        }
    };
    _proto.initSenki2D = function initSenki2D() {
        var _this = this;
        this.senkiFighters = [];
        this.senkiMinions = [];
        this.senkiTowers = [];
        this.senkiProjectiles = [];
        this.senkiFloatTexts = [];
        this.senkiGold = 120;
        this.senkiGoldTick = 0;
        this.senkiRamenCds = [
            0,
            0,
            0
        ];
        this.senkiKills = 0;
        this.senkiDeaths = 0;
        this.senkiTowersDestroyedCount = 0;
        this.resizeSenkiCanvas();
        var hpMult = this.modeDef.id === 'senki_4v4' ? 1.25 : 1.0;
        var towerSetup = [
            {
                id: 'k_base',
                team: 'konoha',
                tier: 3,
                label: 'Konoha Hokage Base',
                x: 240,
                hp: Math.round(6000 * hpMult),
                atk: 185
            },
            {
                id: 'k_inner',
                team: 'konoha',
                tier: 2,
                label: 'Konoha Inner Tower',
                x: 580,
                hp: Math.round(4500 * hpMult),
                atk: 155
            },
            {
                id: 'k_outer',
                team: 'konoha',
                tier: 1,
                label: 'Konoha Outer Tower',
                x: 920,
                hp: Math.round(3000 * hpMult),
                atk: 130
            },
            {
                id: 'a_outer',
                team: 'akatsuki',
                tier: 1,
                label: 'Akatsuki Outer Tower',
                x: 1680,
                hp: Math.round(3000 * hpMult),
                atk: 130
            },
            {
                id: 'a_inner',
                team: 'akatsuki',
                tier: 2,
                label: 'Akatsuki Inner Tower',
                x: 2020,
                hp: Math.round(4500 * hpMult),
                atk: 155
            },
            {
                id: 'a_base',
                team: 'akatsuki',
                tier: 3,
                label: 'Akatsuki Main Crystal',
                x: 2360,
                hp: Math.round(6000 * hpMult),
                atk: 185
            }
        ];
        for(var _iterator = _create_for_of_iterator_helper_loose(towerSetup), _step; !(_step = _iterator()).done;){
            var t = _step.value;
            this.senkiTowers.push({
                id: t.id,
                team: t.team,
                tier: t.tier,
                label: t.label,
                x: t.x,
                y: this.senkiGroundY,
                hp: t.hp,
                maxHp: t.hp,
                atk: t.atk,
                range: 270,
                fireCd: 0,
                targetUid: null
            });
        }
        var teamSize = this.modeDef.teamSize;
        var allyDefs = [
            this.leadDef,
            this.support1Def,
            this.support2Def
        ];
        if (teamSize >= 4) {
            var _NARUTO_SHINOBI_ROSTER_find;
            var fourth = (_NARUTO_SHINOBI_ROSTER_find = _arenaRoster.NARUTO_SHINOBI_ROSTER.find(function(h) {
                return h.id !== _this.leadDef.id && h.id !== _this.support1Def.id && h.id !== _this.support2Def.id;
            })) != null ? _NARUTO_SHINOBI_ROSTER_find : _arenaRoster.NARUTO_SHINOBI_ROSTER[3];
            allyDefs.push(fourth);
        }
        allyDefs.slice(0, teamSize).forEach(function(def, idx) {
            _this.senkiFighters.push(_this.createSenkiFighter(def, 'konoha', idx === 0, 320 + idx * 55));
        });
        var enemyPool = _arenaRoster.NARUTO_SHINOBI_ROSTER.filter(function(h) {
            return h.id !== _this.leadDef.id && (h.faction === 'Akatsuki & Villains' || h.faction === 'Boruto & Otsutsuki' || h.faction === 'Five Kage & Legends');
        });
        for(var i = 0; i < teamSize; i++){
            var _enemyPool_;
            var def = (_enemyPool_ = enemyPool[(this.level + i * 5) % enemyPool.length]) != null ? _enemyPool_ : _arenaRoster.NARUTO_SHINOBI_ROSTER[30 + i];
            this.senkiFighters.push(this.createSenkiFighter(def, 'akatsuki', false, 2280 - i * 55));
        }
        this.spawnSenkiMinionWave();
        this.senkiLastTs = performance.now();
        this.loopSenki2D();
    };
    _proto.createSenkiFighter = function createSenkiFighter(def, team, isPlayer, x, isClone, ownerUid) {
        if (isClone === void 0) isClone = false;
        var lv1 = (0, _arenaRoster.computeSenkiLevelStats)(def, 1);
        var cloneMult = isClone ? 0.42 : 1;
        return {
            uid: team + "_" + def.id + "_" + (isClone ? 'clone_' : '') + Math.random().toString(36).slice(2, 7),
            team: team,
            isPlayer: isPlayer,
            isClone: isClone,
            ownerUid: ownerUid,
            cloneTtl: isClone ? 14 : 0,
            def: def,
            x: x,
            y: this.senkiGroundY,
            facing: team === 'konoha' ? 1 : -1,
            level: 1,
            xp: 0,
            xpNext: lv1.xpToNext,
            hp: Math.round(lv1.maxHp * cloneMult),
            maxHp: Math.round(lv1.maxHp * cloneMult),
            atk: Math.round(lv1.atk * cloneMult),
            speed: def.speed,
            alive: true,
            respawnTimer: 0,
            attackCd: 0,
            skillCds: [
                0,
                0,
                0,
                0,
                0
            ],
            superArmorTimer: 0,
            iFrameTimer: 0,
            stunTimer: 0,
            awakenedTimer: 0,
            atkBuffTimer: 0,
            speedBuffTimer: 0,
            jashinTimer: 0,
            rebirthUsed: false,
            lastDamagedEnemyHeroTimer: 0,
            animPhase: Math.random() * Math.PI * 2
        };
    };
    _proto.spawnSenkiMinionWave = function spawnSenkiMinionWave() {
        for(var i = 0; i < 3; i++){
            this.senkiMinions.push({
                uid: "m_konoha_" + Date.now() + "_" + i,
                team: 'konoha',
                x: 340 - i * 38,
                y: this.senkiGroundY,
                hp: 460,
                maxHp: 460,
                atk: 42,
                attackCd: 0,
                alive: true
            });
            this.senkiMinions.push({
                uid: "m_akatsuki_" + Date.now() + "_" + i,
                team: 'akatsuki',
                x: 2260 + i * 38,
                y: this.senkiGroundY,
                hp: 460,
                maxHp: 460,
                atk: 42,
                attackCd: 0,
                alive: true
            });
        }
    };
    _proto.grantSenkiXpAndGold = function grantSenkiXpAndGold(fighter, xpGain, goldGain) {
        if (fighter.isClone) return;
        if (fighter.team === 'konoha' && goldGain > 0) {
            this.senkiGold += goldGain;
            if (fighter.isPlayer) {
                this.senkiFloatTexts.push({
                    x: fighter.x,
                    y: fighter.y - 78,
                    text: "+" + goldGain + "G",
                    color: '#facc15',
                    ttl: 1.1
                });
            }
        }
        if (fighter.level >= 6) return;
        fighter.xp += xpGain;
        while(fighter.level < 6 && fighter.xp >= fighter.xpNext){
            fighter.xp -= fighter.xpNext;
            fighter.level += 1;
            var scaled = (0, _arenaRoster.computeSenkiLevelStats)(fighter.def, fighter.level);
            var hpDelta = scaled.maxHp - fighter.maxHp;
            fighter.maxHp = scaled.maxHp;
            fighter.hp = Math.min(fighter.maxHp, fighter.hp + hpDelta + Math.round(fighter.maxHp * 0.25));
            fighter.atk = scaled.atk;
            fighter.xpNext = scaled.xpToNext;
            if (fighter.isPlayer) {
                _audio.ArcadeAudio.play('levelup');
                var unlockNote = fighter.level === 4 ? 'OUGI 1 UNLOCKED!' : fighter.level === 6 ? 'OUGI 2 / AWAKENING UNLOCKED!' : "LEVEL " + fighter.level + "!";
                this.senkiFloatTexts.push({
                    x: fighter.x,
                    y: fighter.y - 95,
                    text: unlockNote,
                    color: '#38bdf8',
                    ttl: 1.6
                });
            }
        }
    };
    _proto.buySenkiItem = function buySenkiItem(itemId) {
        if (this.uses3DViewport || this.gameOver) return false;
        var player = this.senkiFighters.find(function(f) {
            return f.isPlayer;
        });
        if (!player || !player.alive) return false;
        var idx = _arenaRoster.SENKI_RAMEN_ITEMS.findIndex(function(i) {
            return i.id === itemId;
        });
        if (idx < 0) return false;
        var item = _arenaRoster.SENKI_RAMEN_ITEMS[idx];
        if (this.senkiRamenCds[idx] > 0 || this.senkiGold < item.cost) return false;
        this.senkiGold -= item.cost;
        this.senkiRamenCds[idx] = item.cooldownSec;
        _audio.ArcadeAudio.play('coin');
        if (itemId === 'ramen') {
            var heal = Math.round(player.maxHp * 0.42);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            this.senkiFloatTexts.push({
                x: player.x,
                y: player.y - 82,
                text: "\uD83C\uDF5C +" + heal + " HP",
                color: '#4ade80',
                ttl: 1.3
            });
        } else if (itemId === 'pill') {
            player.atkBuffTimer = item.durationSec;
            this.senkiFloatTexts.push({
                x: player.x,
                y: player.y - 82,
                text: '💊 +25% ATK (15s)',
                color: '#f97316',
                ttl: 1.3
            });
        } else if (itemId === 'speed_tag') {
            player.speedBuffTimer = item.durationSec;
            this.senkiFloatTexts.push({
                x: player.x,
                y: player.y - 82,
                text: '⚡ +30% SPD & 2x CD (12s)',
                color: '#38bdf8',
                ttl: 1.3
            });
        }
        return true;
    };
    _proto.castSenkiSkill = function castSenkiSkill(fighter, slotIndex) {
        var _skill_stunSec;
        var skill = fighter.def.skills[slotIndex];
        if (!skill) return;
        if (fighter.level < skill.unlockLevel) return;
        if (fighter.skillCds[slotIndex] > 0) return;
        fighter.skillCds[slotIndex] = skill.cooldown;
        if (skill.grantsSuperArmor) {
            fighter.superArmorTimer = Math.max(fighter.superArmorTimer, slotIndex >= 3 ? 2.2 : 1.1);
        }
        if (skill.grantsIFrames) {
            fighter.iFrameTimer = Math.max(fighter.iFrameTimer, 0.95);
        }
        if (slotIndex >= 3) {
            if (slotIndex === 4) {
                fighter.awakenedTimer = 14.0;
                fighter.hp = Math.min(fighter.maxHp, fighter.hp + Math.round(fighter.maxHp * 0.22));
            }
            if (fighter.isPlayer) {
                _audio.ArcadeAudio.play('explosion');
                this.cutInBanner = {
                    title: fighter.def.name.toUpperCase() + " — " + skill.name.toUpperCase() + "!",
                    subtitle: slotIndex === 4 ? "AWAKENING: " + fighter.def.awakeningName : 'SECRET TECHNIQUE (OUGI)',
                    color: skill.color,
                    timer: 1.9
                };
            }
        } else if (fighter.isPlayer) {
            _audio.ArcadeAudio.play('magic');
        }
        if (skill.spawnsClones && skill.spawnsClones > 0) {
            var existingClones = this.senkiFighters.filter(function(f) {
                return f.isClone && f.ownerUid === fighter.uid && f.alive;
            });
            var countToSpawn = Math.min(skill.spawnsClones, Math.max(0, 3 - existingClones.length));
            for(var i = 0; i < countToSpawn; i++){
                var clone = this.createSenkiFighter(fighter.def, fighter.team, false, fighter.x + fighter.facing * (35 + i * 28), true, fighter.uid);
                clone.level = fighter.level;
                this.senkiFighters.push(clone);
            }
        }
        if (skill.healsAlliesPct) {
            for(var _iterator = _create_for_of_iterator_helper_loose(this.senkiFighters), _step; !(_step = _iterator()).done;){
                var ally = _step.value;
                if (ally.team === fighter.team && ally.alive && Math.abs(ally.x - fighter.x) <= skill.range + 120) {
                    var heal = Math.round(ally.maxHp * skill.healsAlliesPct);
                    ally.hp = Math.min(ally.maxHp, ally.hp + heal);
                    this.senkiFloatTexts.push({
                        x: ally.x,
                        y: ally.y - 68,
                        text: "+" + heal + " HP",
                        color: '#4ade80',
                        ttl: 1.0
                    });
                }
            }
        }
        if (fighter.def.passiveTrait === 'jashin_immortality' && slotIndex >= 2) {
            fighter.jashinTimer = 7.0;
        }
        if (skill.kind === 'dash' || skill.grantsIFrames) {
            fighter.x = Math.max(120, Math.min(this.senkiLaneWidth - 120, fighter.x + fighter.facing * Math.min(185, skill.range * 0.72)));
        }
        var synergyMult = fighter.team === 'konoha' ? 1 + this.teamSynergy.bonusPct / 100 : 1;
        var buffMult = (fighter.atkBuffTimer > 0 ? 1.25 : 1) * (fighter.awakenedTimer > 0 ? 1.32 : 1) * synergyMult;
        var totalDmg = Math.round((skill.damage + fighter.atk * 0.85) * buffMult);
        this.senkiProjectiles.push({
            x: fighter.x + fighter.facing * 34,
            y: fighter.y - 34,
            vx: fighter.facing * (skill.kind === 'projectile' ? 540 : 380),
            vy: 0,
            radius: slotIndex >= 3 ? 58 : 34,
            color: skill.color,
            team: fighter.team,
            dmg: totalDmg,
            hitsTowers: skill.hitsTowers,
            ttl: Math.max(0.32, skill.range / 440),
            stunSec: (_skill_stunSec = skill.stunSec) != null ? _skill_stunSec : slotIndex >= 3 ? 0.9 : 0.25
        });
    };
    _proto.dealSenkiDamageToFighter = function dealSenkiDamageToFighter(target, rawDmg, attacker, stunSec) {
        if (stunSec === void 0) stunSec = 0;
        if (!target.alive || target.iFrameTimer > 0) return;
        var dmg = rawDmg;
        if (attacker) {
            if (attacker.def.passiveTrait === 'sharingan_crit' && target.hp / target.maxHp < 0.65) {
                dmg = Math.round(dmg * 1.22);
            }
            if (attacker.def.passiveTrait === 'berserk_low_hp' && attacker.hp / attacker.maxHp < 0.45) {
                dmg = Math.round(dmg * 1.28);
            }
            if (attacker.def.passiveTrait === 'shadow_clone_synergy') {
                var clones = this.senkiFighters.filter(function(c) {
                    return c.isClone && c.ownerUid === attacker.uid && c.alive;
                }).length;
                if (clones > 0) dmg = Math.round(dmg * (1 + clones * 0.12));
            }
            if (attacker.def.passiveTrait === 'samehada_lifesteal') {
                attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.round(dmg * 0.18));
            }
            if (target.def.passiveTrait === 'bone_reflect' && Math.abs(attacker.x - target.x) < 110) {
                attacker.hp = Math.max(1, attacker.hp - Math.round(dmg * 0.2));
            }
            if (!target.isClone) {
                attacker.lastDamagedEnemyHeroTimer = 3.5;
            }
        }
        if (target.awakenedTimer > 0) {
            dmg = Math.round(dmg * 0.72);
        }
        target.hp -= dmg;
        if (stunSec > 0 && target.superArmorTimer <= 0) {
            target.stunTimer = Math.max(target.stunTimer, stunSec);
        }
        if (target.hp <= 0 && target.jashinTimer > 0) {
            target.hp = 1;
        }
        if (target.hp <= 0 && !target.isClone && target.def.passiveTrait === 'white_snake_rebirth' && !target.rebirthUsed) {
            target.rebirthUsed = true;
            target.hp = Math.round(target.maxHp * 0.35);
            target.iFrameTimer = 1.2;
            this.senkiFloatTexts.push({
                x: target.x,
                y: target.y - 84,
                text: '🐍 WHITE SNAKE REBIRTH!',
                color: '#a855f7',
                ttl: 1.5
            });
            return;
        }
        if (target.hp <= 0) {
            target.hp = 0;
            target.alive = false;
            target.respawnTimer = target.isClone ? 0 : 5 + target.level * 1.5;
            if (attacker && !target.isClone) {
                this.grantSenkiXpAndGold(attacker, 135, 220);
                if (attacker.team === 'konoha') {
                    this.senkiKills += 1;
                    _storage.playerState.narutoKillsTotal += 1;
                }
            }
            if (target.isPlayer) {
                this.senkiDeaths += 1;
            }
        }
    };
    _proto.updateSenki2D = function updateSenki2D(dt) {
        var _this, _loop = function() {
            var t = _step5.value;
            if (t.hp <= 0) {
                t.targetUid = null;
                return "continue";
            }
            t.fireCd = Math.max(0, t.fireCd - dt);
            var candidates = [];
            for(var _iterator = _create_for_of_iterator_helper_loose(_this.senkiMinions), _step; !(_step = _iterator()).done;){
                var m = _step.value;
                if (m.alive && m.team !== t.team) {
                    candidates.push({
                        id: m.uid,
                        kind: 'minion',
                        distance: Math.abs(m.x - t.x),
                        damagedAlliedHeroRecently: false
                    });
                }
            }
            for(var _iterator1 = _create_for_of_iterator_helper_loose(_this.senkiFighters), _step1; !(_step1 = _iterator1()).done;){
                var f = _step1.value;
                if (f.alive && f.team !== t.team && f.iFrameTimer <= 0) {
                    candidates.push({
                        id: f.uid,
                        kind: f.isClone ? 'clone' : 'hero',
                        distance: Math.abs(f.x - t.x),
                        damagedAlliedHeroRecently: f.lastDamagedEnemyHeroTimer > 0
                    });
                }
            }
            t.targetUid = (0, _arenaRoster.selectSenkiTowerTarget)(candidates, t.range);
            if (t.targetUid && t.fireCd <= 0) {
                t.fireCd = 1.15;
                var hitMinion = _this.senkiMinions.find(function(m) {
                    return m.uid === t.targetUid && m.alive;
                });
                if (hitMinion) {
                    hitMinion.hp -= t.atk;
                    if (hitMinion.hp <= 0) hitMinion.alive = false;
                } else {
                    var hitFighter = _this.senkiFighters.find(function(f) {
                        return f.uid === t.targetUid && f.alive;
                    });
                    if (hitFighter) {
                        _this.dealSenkiDamageToFighter(hitFighter, t.atk, null, 0);
                    }
                }
            }
        }, _this1, _loop1 = function(i1) {
            var _this_senkiFighters_find;
            var p = _this1.senkiProjectiles[i1];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.ttl -= dt;
            for(var _iterator = _create_for_of_iterator_helper_loose(_this1.senkiMinions), _step; !(_step = _iterator()).done;){
                var m = _step.value;
                if (m.alive && m.team !== p.team && Math.abs(m.x - p.x) <= p.radius + 20) {
                    m.hp -= p.dmg;
                    if (m.hp <= 0) {
                        m.alive = false;
                        var player = _this1.senkiFighters.find(function(f) {
                            return f.isPlayer;
                        });
                        if (player && p.team === 'konoha') {
                            _this1.grantSenkiXpAndGold(player, 36, 32);
                        }
                    }
                }
            }
            var owner = (_this_senkiFighters_find = _this1.senkiFighters.find(function(f) {
                return f.team === p.team && !f.isClone;
            })) != null ? _this_senkiFighters_find : null;
            for(var _iterator1 = _create_for_of_iterator_helper_loose(_this1.senkiFighters), _step1; !(_step1 = _iterator1()).done;){
                var f = _step1.value;
                if (f.alive && f.team !== p.team && Math.abs(f.x - p.x) <= p.radius + 26) {
                    _this1.dealSenkiDamageToFighter(f, p.dmg * dt * 3.2, owner, p.stunSec);
                }
            }
            for(var _iterator2 = _create_for_of_iterator_helper_loose(_this1.senkiTowers), _step2; !(_step2 = _iterator2()).done;){
                var t = _step2.value;
                if (t.hp > 0 && t.team !== p.team && Math.abs(t.x - p.x) <= p.radius + 36) {
                    var towerDmg = p.hitsTowers ? p.dmg * dt * 2.1 : p.dmg * dt * 0.45;
                    var prevHp = t.hp;
                    t.hp = Math.max(0, t.hp - towerDmg);
                    if (prevHp > 0 && t.hp <= 0 && p.team === 'konoha') {
                        _this1.senkiTowersDestroyedCount += 1;
                        _storage.playerState.narutoTowersDestroyed += 1;
                        var player1 = _this1.senkiFighters.find(function(f) {
                            return f.isPlayer;
                        });
                        if (player1) _this1.grantSenkiXpAndGold(player1, 180, 300);
                    }
                }
            }
            if (p.ttl <= 0) {
                _this1.senkiProjectiles.splice(i1, 1);
            }
        };
        if (this.cutInBanner) {
            this.cutInBanner.timer -= dt;
            if (this.cutInBanner.timer <= 0) this.cutInBanner = null;
        }
        this.senkiGoldTick += dt;
        if (this.senkiGoldTick >= 3.0) {
            this.senkiGoldTick -= 3.0;
            this.senkiGold += 10;
        }
        for(var i = 0; i < 3; i++){
            this.senkiRamenCds[i] = Math.max(0, this.senkiRamenCds[i] - dt);
        }
        this.senkiWaveTimer -= dt;
        if (this.senkiWaveTimer <= 0) {
            this.senkiWaveTimer = 11.0;
            this.spawnSenkiMinionWave();
        }
        var inputDx = Math.abs(this.moveDx) > 0.08 ? this.moveDx : (this.steerRightHeld ? 1 : 0) - (this.steerLeftHeld ? 1 : 0);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.senkiFighters), _step; !(_step = _iterator()).done;){
            var f = _step.value;
            if (!f.alive) {
                if (!f.isClone) {
                    f.respawnTimer -= dt;
                    if (f.respawnTimer <= 0) {
                        f.alive = true;
                        f.hp = f.maxHp;
                        f.rebirthUsed = false;
                        f.x = f.team === 'konoha' ? 290 : this.senkiLaneWidth - 290;
                        f.iFrameTimer = 1.5;
                    }
                }
                continue;
            }
            if (f.isClone) {
                f.cloneTtl -= dt;
                if (f.cloneTtl <= 0) {
                    f.alive = false;
                    continue;
                }
            }
            if (f.def.passiveTrait === 'hashirama_regen') {
                f.hp = Math.min(f.maxHp, f.hp + f.maxHp * 0.022 * dt);
            }
            f.attackCd = Math.max(0, f.attackCd - dt);
            f.superArmorTimer = Math.max(0, f.superArmorTimer - dt);
            f.iFrameTimer = Math.max(0, f.iFrameTimer - dt);
            f.stunTimer = Math.max(0, f.stunTimer - dt);
            f.awakenedTimer = Math.max(0, f.awakenedTimer - dt);
            f.atkBuffTimer = Math.max(0, f.atkBuffTimer - dt);
            f.speedBuffTimer = Math.max(0, f.speedBuffTimer - dt);
            f.jashinTimer = Math.max(0, f.jashinTimer - dt);
            f.lastDamagedEnemyHeroTimer = Math.max(0, f.lastDamagedEnemyHeroTimer - dt);
            var cdRate = (f.speedBuffTimer > 0 ? 2.0 : 1.0) * (f.def.passiveTrait === 'byakugan_cd' ? 1.2 : 1.0);
            for(var s = 0; s < 5; s++){
                f.skillCds[s] = Math.max(0, f.skillCds[s] - dt * cdRate);
            }
            if (f.stunTimer > 0) continue;
            var moveSpeed = f.speed * 38 * (f.speedBuffTimer > 0 ? 1.3 : 1) * (f.awakenedTimer > 0 ? 1.2 : 1) * (f.def.passiveTrait === 'yellow_flash' ? 1.15 : 1);
            if (f.isPlayer) {
                if (Math.abs(inputDx) > 0.05) {
                    f.x += inputDx * moveSpeed * dt;
                    f.facing = inputDx >= 0 ? 1 : -1;
                    f.animPhase += dt * 11;
                }
                f.x = Math.max(120, Math.min(this.senkiLaneWidth - 120, f.x));
            } else {
                this.updateSenkiAiFighter(f, moveSpeed, dt);
            }
        }
        // Update Minions
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.senkiMinions), _step1; !(_step1 = _iterator1()).done;){
            var m = _step1.value;
            if (!m.alive) continue;
            m.attackCd = Math.max(0, m.attackCd - dt);
            var dir = m.team === 'konoha' ? 1 : -1;
            var closestDist = 9999;
            var targetFighter = null;
            var targetMinion = null;
            var targetTower = null;
            for(var _iterator2 = _create_for_of_iterator_helper_loose(this.senkiMinions), _step2; !(_step2 = _iterator2()).done;){
                var em = _step2.value;
                if (em.alive && em.team !== m.team) {
                    var d = Math.abs(em.x - m.x);
                    if (d < closestDist) {
                        closestDist = d;
                        targetMinion = em;
                    }
                }
            }
            for(var _iterator3 = _create_for_of_iterator_helper_loose(this.senkiFighters), _step3; !(_step3 = _iterator3()).done;){
                var ef = _step3.value;
                if (ef.alive && ef.team !== m.team) {
                    var d1 = Math.abs(ef.x - m.x);
                    if (d1 < closestDist) {
                        closestDist = d1;
                        targetFighter = ef;
                        targetMinion = null;
                    }
                }
            }
            for(var _iterator4 = _create_for_of_iterator_helper_loose(this.senkiTowers), _step4; !(_step4 = _iterator4()).done;){
                var et = _step4.value;
                if (et.hp > 0 && et.team !== m.team) {
                    var d2 = Math.abs(et.x - m.x);
                    if (d2 < closestDist) {
                        closestDist = d2;
                        targetTower = et;
                        targetFighter = null;
                        targetMinion = null;
                    }
                }
            }
            if (closestDist <= 62) {
                if (m.attackCd <= 0) {
                    m.attackCd = 1.05;
                    if (targetMinion) {
                        targetMinion.hp -= m.atk;
                        if (targetMinion.hp <= 0) targetMinion.alive = false;
                    } else if (targetFighter) {
                        this.dealSenkiDamageToFighter(targetFighter, m.atk, null, 0);
                    } else if (targetTower) {
                        targetTower.hp = Math.max(0, targetTower.hp - m.atk * 0.65);
                    }
                }
            } else {
                m.x += dir * 92 * dt;
            }
        }
        // Update Towers with strict Senki Tower Aggro Priority
        for(var _iterator5 = _create_for_of_iterator_helper_loose(this.senkiTowers), _step5; !(_step5 = _iterator5()).done;)_this = this, _loop();
        // Update Projectiles
        for(var i1 = this.senkiProjectiles.length - 1; i1 >= 0; i1--)_this1 = this, _loop1(i1);
        this.senkiMinions = this.senkiMinions.filter(function(m) {
            return m.alive;
        });
        this.senkiFighters = this.senkiFighters.filter(function(f) {
            return !f.isClone || f.alive;
        });
        for(var i2 = this.senkiFloatTexts.length - 1; i2 >= 0; i2--){
            this.senkiFloatTexts[i2].y -= 28 * dt;
            this.senkiFloatTexts[i2].ttl -= dt;
            if (this.senkiFloatTexts[i2].ttl <= 0) this.senkiFloatTexts.splice(i2, 1);
        }
        var konohaBase = this.senkiTowers.find(function(t) {
            return t.id === 'k_base';
        });
        var akatsukiBase = this.senkiTowers.find(function(t) {
            return t.id === 'a_base';
        });
        if (akatsukiBase && akatsukiBase.hp <= 0) {
            this.finishMatch(true);
            return;
        }
        if (konohaBase && konohaBase.hp <= 0) {
            this.finishMatch(false);
            return;
        }
        var player = this.senkiFighters.find(function(f) {
            return f.isPlayer;
        });
        if (player) {
            var _ref, _ref1;
            var targetCamX = Math.max(0, Math.min(this.senkiLaneWidth - this.senkiWidth, player.x - this.senkiWidth * 0.42));
            this.senkiCameraX += (targetCamX - this.senkiCameraX) * Math.min(1, dt * 8);
            this.score = this.senkiKills * 250 + this.senkiTowersDestroyedCount * 500 + this.senkiGold;
            this.lives = Math.max(0, Math.round(player.hp));
            this.maxLives = player.maxHp;
            (0, _runtimeBridge.updateInGameHud)(this.score, player.level, this.gameIdx);
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
            var s1 = player.def.skills[0];
            var s2 = player.def.skills[1];
            var s3 = player.def.skills[2];
            var s4 = player.def.skills[3];
            var s5 = player.def.skills[4];
            (0, _runtimeBridge.updateNarutoHud)({
                engine: 'senki_2d',
                modeName: this.modeDef.title,
                heroName: player.def.name,
                heroIcon: player.def.icon,
                traitName: player.def.passiveName,
                level: player.level,
                xpPct: Math.min(100, Math.round(player.xp / Math.max(1, player.xpNext) * 100)),
                gold: this.senkiGold,
                awakenedSec: Number(player.awakenedTimer.toFixed(1)),
                superArmor: player.superArmorTimer > 0,
                iFrames: player.iFrameTimer > 0,
                ramenCd: Number(this.senkiRamenCds[0].toFixed(1)),
                pillCd: Number(this.senkiRamenCds[1].toFixed(1)),
                pillBuffSec: Number(player.atkBuffTimer.toFixed(1)),
                speedTagCd: Number(this.senkiRamenCds[2].toFixed(1)),
                speedTagBuffSec: Number(player.speedBuffTimer.toFixed(1)),
                teamHp: Math.round(player.hp),
                teamMaxHp: player.maxHp,
                enemyHp: Math.round((_ref = akatsukiBase == null ? void 0 : akatsukiBase.hp) != null ? _ref : 0),
                enemyMaxHp: (_ref1 = akatsukiBase == null ? void 0 : akatsukiBase.maxHp) != null ? _ref1 : 6000,
                subLogs: 4,
                subRechargeSec: 0,
                chakra: 100,
                maxUsableChakra: 100,
                counterPenaltySec: 0,
                guardHp: 100,
                guardBrokenSec: 0,
                stormGauge: 0,
                comboHits: 0,
                prorationPct: 100,
                fatigueSec: 0,
                toolCharges: [
                    0,
                    0,
                    0,
                    0
                ],
                support1Name: this.support1Def.name,
                support1Icon: this.support1Def.icon,
                support1Cd: 0,
                support2Name: this.support2Def.name,
                support2Icon: this.support2Def.icon,
                support2Cd: 0,
                actionLabel: '⚔️ ATK',
                jumpSkill1: {
                    label: s1.name.slice(0, 7),
                    icon: '🌀',
                    cd: Number(player.skillCds[0].toFixed(1)),
                    maxCd: s1.cooldown,
                    visible: true
                },
                skill2: {
                    label: player.level >= 2 ? s2.name.slice(0, 7) : 'Lv.2',
                    icon: '⚡',
                    cd: Number(player.skillCds[1].toFixed(1)),
                    maxCd: s2.cooldown,
                    visible: true
                },
                skill3: {
                    label: player.level >= 3 ? s3.name.slice(0, 7) : 'Lv.3',
                    icon: '🔥',
                    cd: Number(player.skillCds[2].toFixed(1)),
                    maxCd: s3.cooldown,
                    visible: true
                },
                skill4: {
                    label: player.level >= 4 ? 'OUGI 1' : 'Lv.4',
                    icon: '💥',
                    cd: Number(player.skillCds[3].toFixed(1)),
                    maxCd: s4.cooldown,
                    visible: true
                },
                skill5: {
                    label: player.level >= 6 ? 'OUGI 2' : 'Lv.6',
                    icon: '🌟',
                    cd: Number(player.skillCds[4].toFixed(1)),
                    maxCd: s5.cooldown,
                    visible: true,
                    activeBuff: player.awakenedTimer > 0
                },
                subBtn: {
                    label: 'EVADE',
                    icon: '💨',
                    cd: 0,
                    maxCd: 1,
                    visible: true
                },
                supportBtn: {
                    label: 'RAMEN',
                    icon: '🍜',
                    cd: Number(this.senkiRamenCds[0].toFixed(1)),
                    maxCd: 10,
                    visible: true
                },
                chakraBtn: {
                    label: 'PILL',
                    icon: '💊',
                    cd: Number(this.senkiRamenCds[1].toFixed(1)),
                    maxCd: 20,
                    visible: false
                },
                guardBtn: {
                    label: 'TAG',
                    icon: '⚡',
                    cd: Number(this.senkiRamenCds[2].toFixed(1)),
                    maxCd: 22,
                    visible: false
                }
            });
        }
    };
    _proto.performSenkiBasicAttack = function performSenkiBasicAttack(f) {
        f.attackCd = 0.42;
        var range = 92;
        var dmg = Math.round(f.atk * (f.atkBuffTimer > 0 ? 1.25 : 1) * (f.awakenedTimer > 0 ? 1.3 : 1));
        if (f.isPlayer) _audio.ArcadeAudio.play('punch');
        for(var _iterator = _create_for_of_iterator_helper_loose(this.senkiMinions), _step; !(_step = _iterator()).done;){
            var m = _step.value;
            if (m.alive && m.team !== f.team && Math.abs(m.x - f.x) <= range && Math.sign(m.x - f.x || f.facing) === f.facing) {
                m.hp -= dmg;
                if (m.hp <= 0) {
                    m.alive = false;
                    this.grantSenkiXpAndGold(f, 38, 35);
                }
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.senkiFighters), _step1; !(_step1 = _iterator1()).done;){
            var ef = _step1.value;
            if (ef.alive && ef.team !== f.team && Math.abs(ef.x - f.x) <= range) {
                this.dealSenkiDamageToFighter(ef, dmg, f, 0.12);
            }
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.senkiTowers), _step2; !(_step2 = _iterator2()).done;){
            var t = _step2.value;
            if (t.hp > 0 && t.team !== f.team && Math.abs(t.x - f.x) <= range + 24) {
                var prev = t.hp;
                t.hp = Math.max(0, t.hp - dmg * 0.9);
                if (prev > 0 && t.hp <= 0 && f.team === 'konoha') {
                    this.senkiTowersDestroyedCount += 1;
                    _storage.playerState.narutoTowersDestroyed += 1;
                    this.grantSenkiXpAndGold(f, 180, 300);
                }
            }
        }
    };
    _proto.updateSenkiAiFighter = function updateSenkiAiFighter(f, moveSpeed, dt) {
        var targetX = f.team === 'konoha' ? this.senkiLaneWidth - 240 : 240;
        var closestDist = 9999;
        var enemyHeroDist = 9999;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.senkiFighters), _step; !(_step = _iterator()).done;){
            var ef = _step.value;
            if (ef.alive && ef.team !== f.team) {
                var d = Math.abs(ef.x - f.x);
                if (d < closestDist) {
                    closestDist = d;
                    targetX = ef.x;
                }
                if (d < enemyHeroDist) enemyHeroDist = d;
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.senkiMinions), _step1; !(_step1 = _iterator1()).done;){
            var em = _step1.value;
            if (em.alive && em.team !== f.team) {
                var d1 = Math.abs(em.x - f.x);
                if (d1 < closestDist) {
                    closestDist = d1;
                    targetX = em.x;
                }
            }
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.senkiTowers), _step2; !(_step2 = _iterator2()).done;){
            var et = _step2.value;
            if (et.hp > 0 && et.team !== f.team) {
                var d2 = Math.abs(et.x - f.x);
                if (d2 < closestDist) {
                    closestDist = d2;
                    targetX = et.x;
                }
            }
        }
        f.facing = targetX >= f.x ? 1 : -1;
        if (!f.isClone && Math.random() < dt * 0.45) {
            this.grantSenkiXpAndGold(f, 22, 0);
        }
        if (closestDist > 82) {
            f.x += f.facing * moveSpeed * 0.78 * dt;
            f.animPhase += dt * 9;
        } else {
            if (f.attackCd <= 0) {
                this.performSenkiBasicAttack(f);
            }
            if (!f.isClone && enemyHeroDist < 260) {
                for(var s = 4; s >= 0; s--){
                    var sk = f.def.skills[s];
                    if (sk && f.level >= sk.unlockLevel && f.skillCds[s] <= 0 && Math.random() < 0.35) {
                        this.castSenkiSkill(f, s);
                        break;
                    }
                }
            }
        }
        f.x = Math.max(120, Math.min(this.senkiLaneWidth - 120, f.x));
    };
    _proto.renderSenki2D = function renderSenki2D() {
        var _this, _loop = function() {
            var t = _step.value;
            if (t.hp <= 0) return "continue";
            var isKonoha = t.team === 'konoha';
            var towerH = t.tier === 3 ? 138 : t.tier === 2 ? 112 : 95;
            var towerW = t.tier === 3 ? 58 : 44;
            ctx.fillStyle = isKonoha ? '#1d4ed8' : '#b91c1c';
            ctx.fillRect(t.x - towerW / 2, _this.senkiGroundY - towerH, towerW, towerH);
            ctx.strokeStyle = isKonoha ? '#60a5fa' : '#f87171';
            ctx.lineWidth = 2;
            ctx.strokeRect(t.x - towerW / 2, _this.senkiGroundY - towerH, towerW, towerH);
            ctx.fillStyle = isKonoha ? '#38bdf8' : '#ef4444';
            ctx.beginPath();
            ctx.arc(t.x, _this.senkiGroundY - towerH - 12, 12, 0, Math.PI * 2);
            ctx.fill();
            var hpPct = Math.max(0, t.hp / t.maxHp);
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(t.x - 38, _this.senkiGroundY - towerH - 36, 76, 8);
            ctx.fillStyle = isKonoha ? '#22c55e' : '#ef4444';
            ctx.fillRect(t.x - 38, _this.senkiGroundY - towerH - 36, 76 * hpPct, 8);
            if (t.targetUid) {
                var tf = _this.senkiFighters.find(function(f) {
                    return f.uid === t.targetUid && f.alive;
                });
                var tm = _this.senkiMinions.find(function(m) {
                    return m.uid === t.targetUid && m.alive;
                });
                var tx = tf ? tf.x : tm ? tm.x : null;
                var ty = tf ? _this.senkiGroundY - 35 : tm ? _this.senkiGroundY - 20 : null;
                if (tx !== null && ty !== null) {
                    ctx.strokeStyle = tf && !tf.isClone ? 'rgba(239, 68, 68, 0.92)' : 'rgba(250, 204, 21, 0.55)';
                    ctx.lineWidth = tf && !tf.isClone ? 2.5 : 1.5;
                    ctx.beginPath();
                    ctx.moveTo(t.x, _this.senkiGroundY - towerH - 12);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();
                }
            }
        };
        var ctx = this.ctx;
        var w = this.senkiWidth;
        var h = this.senkiHeight;
        var grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#" + this.stageDef.skyColor.toString(16).padStart(6, '0'));
        grad.addColorStop(1, "#" + this.stageDef.groundColor.toString(16).padStart(6, '0'));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.translate(-this.senkiCameraX, 0);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        for(var i = 0; i < 14; i++){
            var mx = i * 210;
            var mh = 110 + i % 4 * 35;
            ctx.beginPath();
            ctx.moveTo(mx, this.senkiGroundY);
            ctx.lineTo(mx + 105, this.senkiGroundY - mh);
            ctx.lineTo(mx + 210, this.senkiGroundY);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, this.senkiGroundY, this.senkiLaneWidth, h - this.senkiGroundY);
        ctx.fillStyle = "#" + this.stageDef.accentColor.toString(16).padStart(6, '0');
        ctx.fillRect(0, this.senkiGroundY, this.senkiLaneWidth, 4);
        for(var _iterator = _create_for_of_iterator_helper_loose(this.senkiTowers), _step; !(_step = _iterator()).done;)_this = this, _loop();
        for(var _iterator1 = _create_for_of_iterator_helper_loose(this.senkiMinions), _step1; !(_step1 = _iterator1()).done;){
            var m = _step1.value;
            if (!m.alive) continue;
            ctx.fillStyle = m.team === 'konoha' ? '#2563eb' : '#dc2626';
            ctx.fillRect(m.x - 10, this.senkiGroundY - 32, 20, 32);
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(m.x - 10, this.senkiGroundY - 28, 20, 4);
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(m.x - 14, this.senkiGroundY - 42, 28, 4);
            ctx.fillStyle = m.team === 'konoha' ? '#4ade80' : '#f87171';
            ctx.fillRect(m.x - 14, this.senkiGroundY - 42, 28 * (m.hp / m.maxHp), 4);
        }
        for(var _iterator2 = _create_for_of_iterator_helper_loose(this.senkiFighters), _step2; !(_step2 = _iterator2()).done;){
            var f = _step2.value;
            if (!f.alive) continue;
            var fy = this.senkiGroundY;
            var primaryHex = "#" + f.def.primaryColor.toString(16).padStart(6, '0');
            var accentHex = "#" + f.def.accentColor.toString(16).padStart(6, '0');
            var hairHex = "#" + f.def.hairColor.toString(16).padStart(6, '0');
            var chakraHex = "#" + f.def.chakraColor.toString(16).padStart(6, '0');
            ctx.save();
            if (f.iFrameTimer > 0) ctx.globalAlpha = 0.55;
            else if (f.isClone) ctx.globalAlpha = 0.78;
            if (f.awakenedTimer > 0 || f.superArmorTimer > 0) {
                ctx.strokeStyle = f.awakenedTimer > 0 ? chakraHex : '#facc15';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(f.x, fy - 28, 30, 0, Math.PI * 2);
                ctx.stroke();
            }
            var stride = Math.sin(f.animPhase) * 6;
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(f.x - 8 + stride * 0.5, fy - 18, 6, 18);
            ctx.fillRect(f.x + 2 - stride * 0.5, fy - 18, 6, 18);
            ctx.fillStyle = primaryHex;
            ctx.fillRect(f.x - 13, fy - 44, 26, 26);
            ctx.fillStyle = accentHex;
            ctx.fillRect(f.x - 11, fy - 42, 22, 14);
            ctx.fillStyle = '#fde68a';
            ctx.fillRect(f.x - 10, fy - 60, 20, 16);
            ctx.fillStyle = '#334155';
            ctx.fillRect(f.x - 11, fy - 57, 22, 4);
            ctx.fillStyle = hairHex;
            ctx.beginPath();
            ctx.moveTo(f.x - 13, fy - 58);
            ctx.lineTo(f.x - 6, fy - 69);
            ctx.lineTo(f.x + 1, fy - 61);
            ctx.lineTo(f.x + 8, fy - 70);
            ctx.lineTo(f.x + 13, fy - 58);
            ctx.closePath();
            ctx.fill();
            var barW = f.isClone ? 38 : 56;
            var barY = fy - 80;
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(f.x - barW / 2, barY, barW, 7);
            ctx.fillStyle = f.team === 'konoha' ? f.isPlayer ? '#38bdf8' : '#22c55e' : '#ef4444';
            ctx.fillRect(f.x - barW / 2, barY, barW * Math.max(0, f.hp / f.maxHp), 7);
            if (!f.isClone) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText("Lv." + f.level + " " + f.def.name.split(' ')[0], f.x, barY - 4);
            }
            ctx.restore();
        }
        for(var _iterator3 = _create_for_of_iterator_helper_loose(this.senkiProjectiles), _step3; !(_step3 = _iterator3()).done;){
            var p = _step3.value;
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 0.65, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
        for(var _iterator4 = _create_for_of_iterator_helper_loose(this.senkiFloatTexts), _step4; !(_step4 = _iterator4()).done;){
            var ft = _step4.value;
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.restore();
        // Top Single-Lane Minimap Radar (clears health bar & Ramen strip on all viewports)
        var mapW = Math.min(300, w * 0.46);
        var mapH = 20;
        var mapX = (w - mapW) / 2;
        var mapY = w < 560 ? 124 : 46;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(mapX, mapY, mapW, mapH);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.strokeRect(mapX, mapY, mapW, mapH);
        for(var _iterator5 = _create_for_of_iterator_helper_loose(this.senkiTowers), _step5; !(_step5 = _iterator5()).done;){
            var t = _step5.value;
            if (t.hp <= 0) continue;
            var mx1 = mapX + t.x / this.senkiLaneWidth * mapW;
            ctx.fillStyle = t.team === 'konoha' ? '#38bdf8' : '#ef4444';
            ctx.fillRect(mx1 - 3, mapY + 3, 6, mapH - 6);
        }
        for(var _iterator6 = _create_for_of_iterator_helper_loose(this.senkiFighters), _step6; !(_step6 = _iterator6()).done;){
            var f1 = _step6.value;
            if (!f1.alive || f1.isClone) continue;
            var mx2 = mapX + f1.x / this.senkiLaneWidth * mapW;
            ctx.fillStyle = f1.isPlayer ? '#facc15' : f1.team === 'konoha' ? '#4ade80' : '#f87171';
            ctx.beginPath();
            ctx.arc(mx2, mapY + mapH / 2, f1.isPlayer ? 4.5 : 3, 0, Math.PI * 2);
            ctx.fill();
        }
        if (this.cutInBanner) {
            var bannerY = h < 460 ? h * 0.34 : h * 0.25;
            ctx.fillStyle = 'rgba(9, 13, 22, 0.86)';
            ctx.fillRect(0, bannerY, w, 54);
            ctx.strokeStyle = this.cutInBanner.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(0, bannerY, w, 54);
            ctx.fillStyle = '#ffffff';
            ctx.font = w < 460 ? 'bold 13px sans-serif' : 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.cutInBanner.title, w / 2, bannerY + 23);
            ctx.fillStyle = this.cutInBanner.color;
            ctx.font = 'bold 11.5px sans-serif';
            ctx.fillText(this.cutInBanner.subtitle, w / 2, bannerY + 42);
        }
    };
    // ============================================================================
    // PART 2: 3D ULTIMATE NINJA STORM INITIALIZATION & LOOP
    // ============================================================================
    _proto.initStorm3D = function initStorm3D() {
        var _this = this;
        var _enemyPool_, _enemyPool_1, _enemyPool_2;
        this.three = new _threeShared.StudioThreeContext(this.threeContainer, {
            skyColor: this.stageDef.skyColor,
            fogColor: this.stageDef.fogColor,
            fogNear: 24,
            fogFar: 110,
            keyColor: 0xfff3d6,
            keyIntensity: 2.0,
            hemiSky: this.stageDef.accentColor,
            hemiGround: this.stageDef.groundColor,
            hemiIntensity: 0.85,
            shadowExtent: 34,
            fov: 50,
            withOverlayCanvas: true
        });
        this.stormArenaGroup = new _three.Group();
        this.three.scene.add(this.stormArenaGroup);
        this.buildStormArenaEnvironment(this.stageDef);
        this.stormPlayerTeam = [];
        this.stormEnemyTeam = [];
        this.stormActivePlayerSlot = 0;
        this.stormActiveEnemySlot = 0;
        this.stormSupportCds = [
            0,
            0
        ];
        this.stormGauge = 0;
        this.stormToolUses = [
            2,
            2,
            3,
            2
        ];
        this.stormToolCds = [
            0,
            0,
            0,
            0
        ];
        this.stormProjectiles = [];
        this.stormLogs = [];
        var isTeamMode = this.modeDef.id === 'storm_3v3';
        var playerRoster = isTeamMode ? [
            this.leadDef,
            this.support1Def,
            this.support2Def
        ] : [
            this.leadDef
        ];
        var playerSupportTypes = [
            'attack',
            this.support1Type,
            this.support2Type
        ];
        playerRoster.forEach(function(def, idx) {
            var _playerSupportTypes_idx;
            var c = _this.createStormCombatant(def, 'player', idx, (_playerSupportTypes_idx = playerSupportTypes[idx]) != null ? _playerSupportTypes_idx : 'attack', -8, 0);
            c.rig.group.visible = idx === 0;
            _this.three.scene.add(c.rig.group);
            _this.stormPlayerTeam.push(c);
        });
        var enemyPool = _arenaRoster.NARUTO_SHINOBI_ROSTER.filter(function(h) {
            return h.id !== _this.leadDef.id;
        });
        var enemyLead = (_enemyPool_ = enemyPool[(this.level * 3 + 7) % enemyPool.length]) != null ? _enemyPool_ : _arenaRoster.NARUTO_SHINOBI_ROSTER[1];
        var enemySup1 = (_enemyPool_1 = enemyPool[(this.level * 3 + 15) % enemyPool.length]) != null ? _enemyPool_1 : _arenaRoster.NARUTO_SHINOBI_ROSTER[30];
        var enemySup2 = (_enemyPool_2 = enemyPool[(this.level * 3 + 23) % enemyPool.length]) != null ? _enemyPool_2 : _arenaRoster.NARUTO_SHINOBI_ROSTER[31];
        var enemyRoster = isTeamMode ? [
            enemyLead,
            enemySup1,
            enemySup2
        ] : [
            enemyLead
        ];
        enemyRoster.forEach(function(def, idx) {
            var c = _this.createStormCombatant(def, 'enemy', idx, idx === 1 ? 'attack' : 'cover_fire', 8, 0);
            c.rig.group.visible = idx === 0;
            _this.three.scene.add(c.rig.group);
            _this.stormEnemyTeam.push(c);
        });
        this.three.prewarm();
        this.stormLastTs = performance.now();
        this.loopStorm3D();
    };
    _proto.buildStormArenaEnvironment = function buildStormArenaEnvironment(stage) {
        if (!this.three) return;
        while(this.stormArenaGroup.children.length > 0){
            var child = this.stormArenaGroup.children[0];
            child.traverse(function(obj) {
                var _m_geometry_userData;
                var m = obj;
                if (m.geometry && !((_m_geometry_userData = m.geometry.userData) == null ? void 0 : _m_geometry_userData.noDispose)) m.geometry.dispose();
                var mats = Array.isArray(m.material) ? m.material : m.material ? [
                    m.material
                ] : [];
                for(var _iterator = _create_for_of_iterator_helper_loose(mats), _step; !(_step = _iterator()).done;){
                    var mat = _step.value;
                    var _mat_userData;
                    if (mat && !((_mat_userData = mat.userData) == null ? void 0 : _mat_userData.noDispose)) mat.dispose();
                }
            });
            this.stormArenaGroup.remove(child);
        }
        this.three.scene.background = new _three.Color(stage.skyColor);
        this.three.scene.fog = new _three.Fog(stage.fogColor, 24, 110);
        var floor = new _three.Mesh(new _three.CylinderGeometry(22, 23.5, 1.2, 48), new _three.MeshStandardMaterial({
            color: stage.groundColor,
            roughness: 0.72,
            metalness: 0.15
        }));
        floor.position.y = -0.6;
        floor.receiveShadow = true;
        this.stormArenaGroup.add(floor);
        var ringOuter = new _three.Mesh(new _three.RingGeometry(20.6, 21.3, 48), new _three.MeshBasicMaterial({
            color: stage.accentColor,
            side: _three.DoubleSide
        }));
        ringOuter.rotation.x = -Math.PI / 2;
        ringOuter.position.y = 0.02;
        this.stormArenaGroup.add(ringOuter);
        var pillarMat = new _three.MeshStandardMaterial({
            color: stage.accentColor,
            roughness: 0.6,
            metalness: 0.25
        });
        for(var i = 0; i < 12; i++){
            var ang = i * Math.PI * 2 / 12;
            var h = 4.5 + i % 3 * 2.2;
            var pillar = new _three.Mesh(new _three.BoxGeometry(2.2, h, 2.2), pillarMat);
            pillar.position.set(Math.cos(ang) * 23.5, h / 2, Math.sin(ang) * 23.5);
            pillar.lookAt(0, h / 2, 0);
            this.stormArenaGroup.add(pillar);
        }
    };
    _proto.createStormCombatant = function createStormCombatant(def, team, slotIndex, supportType, x, z) {
        var rig = (0, _threeShared.buildShinobiMesh)(def, 1.18, false);
        rig.group.position.set(x, 0, z);
        var facingAngle = team === 'player' ? Math.PI / 2 : -Math.PI / 2;
        rig.group.rotation.y = facingAngle;
        return {
            team: team,
            slotIndex: slotIndex,
            def: def,
            supportType: supportType,
            rig: rig,
            x: x,
            z: z,
            y: 0,
            facingAngle: facingAngle,
            hp: 2000,
            maxHp: 2000,
            chakra: 100,
            chakraLockedTimer: 0,
            chakraFatigueTimer: 0,
            subLogs: 4,
            subCooldownTimer: 0,
            guardHp: 100,
            isGuarding: false,
            guardBreakTimer: 0,
            hitstunTimer: 0,
            iFrameTimer: 0,
            superArmorTimer: 0,
            dashTimer: 0,
            comboCount: 0,
            comboResetTimer: 0,
            awakened: false,
            awakeningTimer: 0,
            atkBuffTimer: 0,
            defBuffTimer: 0,
            speedBuffTimer: 0,
            exhaustDebuffTimer: 0,
            attackCooldown: 0,
            jutsuCooldown: 0,
            counterStartupTimer: 0
        };
    };
    _proto.useStormNinjaTool = function useStormNinjaTool(slotIndex) {
        if (!this.uses3DViewport || this.gameOver) return false;
        var p = this.stormPlayerTeam[this.stormActivePlayerSlot];
        var e = this.stormEnemyTeam[this.stormActiveEnemySlot];
        if (!p || !e) return false;
        if (this.stormToolUses[slotIndex] <= 0 || this.stormToolCds[slotIndex] > 0) return false;
        this.stormToolUses[slotIndex] -= 1;
        this.stormToolCds[slotIndex] = 6.0;
        _audio.ArcadeAudio.play('coin');
        if (slotIndex === 0) {
            p.atkBuffTimer = 12.0;
        } else if (slotIndex === 1) {
            p.defBuffTimer = 12.0;
            p.guardHp = Math.min(100, p.guardHp + 45);
        } else if (slotIndex === 2) {
            this.spawnStormProjectile(p, e, 165, 0xf97316, true, false);
        } else if (slotIndex === 3) {
            p.speedBuffTimer = 10.0;
            e.exhaustDebuffTimer = 8.0;
        }
        return true;
    };
    _proto.switchStormLeader = function switchStormLeader() {
        if (!this.uses3DViewport || this.gameOver) return;
        if (this.stormPlayerTeam.length <= 1) return;
        var prev = this.stormPlayerTeam[this.stormActivePlayerSlot];
        var nextSlot = (this.stormActivePlayerSlot + 1) % this.stormPlayerTeam.length;
        var next = this.stormPlayerTeam[nextSlot];
        if (!prev || !next) return;
        next.hp = prev.hp;
        next.subLogs = prev.subLogs;
        next.subCooldownTimer = prev.subCooldownTimer;
        next.x = prev.x;
        next.z = prev.z;
        next.y = prev.y;
        next.chakra = Math.max(40, prev.chakra);
        prev.rig.group.visible = false;
        next.rig.group.visible = true;
        next.rig.group.position.set(next.x, next.y, next.z);
        this.stormActivePlayerSlot = nextSlot;
        this.stormGauge = Math.min(100, this.stormGauge + 14);
        _audio.ArcadeAudio.play('dash');
    };
    _proto.performStormMeleeOrKunai = function performStormMeleeOrKunai(isKunai) {
        var p = this.stormPlayerTeam[this.stormActivePlayerSlot];
        var e = this.stormEnemyTeam[this.stormActiveEnemySlot];
        if (!p || !e || p.hitstunTimer > 0 || p.guardBreakTimer > 0 || p.attackCooldown > 0) return;
        var dist = Math.hypot(e.x - p.x, e.z - p.z);
        if (isKunai) {
            p.attackCooldown = 0.3;
            var chakraEnhanced = this.chakraChargeHeld && p.chakra >= 5;
            if (chakraEnhanced) p.chakra -= 5;
            _audio.ArcadeAudio.play('arrow');
            this.spawnStormProjectile(p, e, chakraEnhanced ? 95 : 55, p.def.chakraColor, chakraEnhanced, false);
            if (this.stormGauge >= 50 && (this.support1Type === 'cover_fire' || this.support2Type === 'cover_fire')) {
                this.spawnStormProjectile(p, e, 48, this.support1Def.chakraColor, true, false);
            }
            return;
        }
        p.attackCooldown = 0.26;
        p.rig.armR.rotation.x = -1.2;
        _audio.ArcadeAudio.play('punch');
        if (dist <= (p.awakened ? 4.4 : 3.2)) {
            this.dealStormDamage(p, e, p.def.baseAtk * 0.72, 18, false);
            if (this.stormGauge >= 50 && (this.support1Type === 'attack' || this.support2Type === 'attack')) {
                this.dealStormDamage(p, e, 36, 8, false);
            }
        } else {
            p.x += Math.sin(p.facingAngle) * 1.15;
            p.z += Math.cos(p.facingAngle) * 1.15;
        }
    };
    _proto.performStormNinjutsu = function performStormNinjutsu(p, e) {
        if (p.jutsuCooldown > 0 || p.chakra < 22 || p.hitstunTimer > 0 || p.guardBreakTimer > 0) return;
        p.chakra -= 22;
        p.jutsuCooldown = 1.4;
        var jutsuSkill = p.def.skills[0];
        _audio.ArcadeAudio.play('magic');
        var dist = Math.hypot(e.x - p.x, e.z - p.z);
        if (dist <= 4.2) {
            this.dealStormDamage(p, e, jutsuSkill.damage * 0.78, 34, false);
        } else {
            this.spawnStormProjectile(p, e, jutsuSkill.damage * 0.75, p.def.chakraColor, true, false);
        }
    };
    _proto.performStormUltimateOugi = function performStormUltimateOugi(p, e) {
        if (p.jutsuCooldown > 0 || p.chakra < 45 || p.hitstunTimer > 0 || p.guardBreakTimer > 0) return;
        p.chakra -= 45;
        p.jutsuCooldown = 2.4;
        p.superArmorTimer = 1.6;
        var isTeamLinked = this.stormGauge >= 100 && this.stormPlayerTeam.length > 1;
        if (isTeamLinked) this.stormGauge = 0;
        var ougiSkill = p.def.skills[3];
        var ultDmg = isTeamLinked ? 460 : 340;
        _audio.ArcadeAudio.play('explosion');
        this.cutInBanner = {
            title: isTeamLinked ? "LINKED SECRET TECHNIQUE: " + this.teamSynergy.name.toUpperCase() + "!" : "SECRET TECHNIQUE: " + ougiSkill.name.toUpperCase() + "!",
            subtitle: isTeamLinked ? this.leadDef.name + " • " + this.support1Def.name + " • " + this.support2Def.name : p.def.name,
            color: ougiSkill.color,
            timer: 2.1
        };
        var dist = Math.hypot(e.x - p.x, e.z - p.z);
        if (dist <= 6.5) {
            this.dealStormDamage(p, e, ultDmg, 100, true);
        } else {
            this.spawnStormProjectile(p, e, ultDmg, p.def.chakraColor, true, true);
        }
    };
    _proto.performStormAwakening = function performStormAwakening(p) {
        var canAwaken = !p.awakened && p.chakraFatigueTimer <= 0 && (p.hp <= p.maxHp * 0.45 || p.chakra >= 90);
        if (!canAwaken) return;
        p.awakened = true;
        p.awakeningTimer = 16.0;
        p.superArmorTimer = 16.0;
        p.rig.awakeningAura.visible = true;
        p.rig.group.scale.setScalar(1.18 * 1.42);
        _audio.ArcadeAudio.play('levelup');
        this.cutInBanner = {
            title: "TRUE AWAKENING: " + p.def.awakeningName.toUpperCase() + "!",
            subtitle: "" + p.def.name + " unleashes full Chakra power!",
            color: "#" + p.def.chakraColor.toString(16).padStart(6, '0'),
            timer: 2.2
        };
        if (p.def.passiveTrait === 'amenominaka_dimension') {
            this.stormAmenominakaIndex = (this.stormAmenominakaIndex + 1) % _arenaRoster.NARUTO_STAGES.length;
            this.buildStormArenaEnvironment(_arenaRoster.NARUTO_STAGES[this.stormAmenominakaIndex]);
        }
    };
    _proto.triggerSubstitutionKawarimi = function triggerSubstitutionKawarimi(victim, attacker) {
        if (victim.subLogs <= 0 || victim.guardBreakTimer > 0) return;
        var stepped = (0, _arenaRoster.stepSubstitutionGauge)(victim.subLogs, victim.subCooldownTimer, 0, true);
        victim.subLogs = stepped.logs;
        victim.subCooldownTimer = stepped.timerSec; // Resets to 0.0s (full 14.0s wait)
        if (this.three) {
            var logGroup = new _three.Group();
            var trunk = new _three.Mesh(new _three.CylinderGeometry(0.28, 0.28, 1.25, 10), new _three.MeshStandardMaterial({
                color: 0x78350f,
                roughness: 0.85
            }));
            trunk.rotation.z = 0.4;
            trunk.position.y = 0.7;
            logGroup.add(trunk);
            logGroup.position.set(victim.x, victim.y, victim.z);
            this.three.scene.add(logGroup);
            this.stormLogs.push({
                mesh: logGroup,
                x: victim.x,
                y: victim.y,
                z: victim.z,
                ttl: 1.8
            });
        }
        var behindX = attacker.x - Math.sin(attacker.facingAngle) * 2.6;
        var behindZ = attacker.z - Math.cos(attacker.facingAngle) * 2.6;
        var clampedR = Math.hypot(behindX, behindZ);
        if (clampedR > 19.5) {
            victim.x = behindX / clampedR * 19.5;
            victim.z = behindZ / clampedR * 19.5;
        } else {
            victim.x = behindX;
            victim.z = behindZ;
        }
        victim.hitstunTimer = 0;
        victim.iFrameTimer = 0.28;
        attacker.comboCount = 0;
        _audio.ArcadeAudio.play('dash');
    };
    _proto.triggerStormSupport = function triggerStormSupport(slotOffset) {
        if (this.stormPlayerTeam.length <= slotOffset) return;
        var cdIdx = slotOffset - 1;
        if (this.stormSupportCds[cdIdx] > 0) return;
        var lead = this.stormPlayerTeam[this.stormActivePlayerSlot];
        var sup = this.stormPlayerTeam[(this.stormActivePlayerSlot + slotOffset) % this.stormPlayerTeam.length];
        var enemy = this.stormEnemyTeam[this.stormActiveEnemySlot];
        if (!lead || !sup || !enemy) return;
        this.stormSupportCds[cdIdx] = 9.5;
        this.stormGauge = Math.min(100, this.stormGauge + 18);
        _audio.ArcadeAudio.play('magic');
        this.spawnStormProjectile(lead, enemy, 155, sup.def.chakraColor, true, false);
    };
    _proto.spawnStormProjectile = function spawnStormProjectile(caster, target, dmg, colorHex, isChakraEnhanced, isUltimate) {
        if (!this.three) return;
        var radius = isUltimate ? 1.15 : isChakraEnhanced ? 0.55 : 0.28;
        var mesh = new _three.Mesh(new _three.SphereGeometry(radius, 14, 14), new _three.MeshBasicMaterial({
            color: colorHex
        }));
        var sx = caster.x + Math.sin(caster.facingAngle) * 1.2;
        var sz = caster.z + Math.cos(caster.facingAngle) * 1.2;
        var sy = 1.15;
        mesh.position.set(sx, sy, sz);
        this.three.scene.add(mesh);
        var dx = target.x - sx;
        var dz = target.z - sz;
        var dist = Math.max(0.1, Math.hypot(dx, dz));
        var speed = isUltimate ? 28 : isChakraEnhanced ? 24 : 20;
        this.stormProjectiles.push({
            mesh: mesh,
            team: caster.team,
            x: sx,
            y: sy,
            z: sz,
            vx: dx / dist * speed,
            vy: 0,
            vz: dz / dist * speed,
            radius: radius,
            dmg: dmg,
            isChakraEnhanced: isChakraEnhanced,
            isUltimate: isUltimate,
            ttl: 1.8
        });
    };
    _proto.dealStormDamage = function dealStormDamage(attacker, defender, baseDmg, guardDmg, isUltimate) {
        if (isUltimate === void 0) isUltimate = false;
        if (defender.iFrameTimer > 0) return;
        if (defender.counterStartupTimer > 0 && !isUltimate) {
            defender.counterStartupTimer = 0;
            attacker.hitstunTimer = 1.8;
            attacker.chakraLockedTimer = 16.0;
            attacker.chakra = Math.min(attacker.chakra, 65);
            _audio.ArcadeAudio.play('explosion');
            return;
        }
        if (defender.isGuarding && defender.guardBreakTimer <= 0 && !isUltimate) {
            var supportGuardBonus = defender.team === 'player' && this.stormGauge >= 50 && (this.support1Type === 'guard' || this.support2Type === 'guard') ? 0.6 : 1.0;
            defender.guardHp -= guardDmg * supportGuardBonus;
            if (defender.guardHp <= 0) {
                defender.guardHp = 0;
                defender.isGuarding = false;
                defender.guardBreakTimer = 2.5;
                _audio.ArcadeAudio.play('break');
            } else {
                _audio.ArcadeAudio.play('hit');
            }
            return;
        }
        attacker.comboCount += 1;
        attacker.comboResetTimer = 1.85;
        var proration = isUltimate ? 1.0 : (0, _arenaRoster.computeStormComboProration)(attacker.comboCount);
        var atkMult = (attacker.awakened ? 1.38 : 1.0) * (attacker.atkBuffTimer > 0 ? 1.25 : 1.0) * (attacker.team === 'player' ? 1 + this.teamSynergy.bonusPct / 100 : 1.0);
        var defMult = defender.defBuffTimer > 0 ? 0.72 : 1.0;
        var finalDmg = Math.max(8, Math.round(baseDmg * proration * atkMult * defMult));
        var teamList = defender.team === 'player' ? this.stormPlayerTeam : this.stormEnemyTeam;
        for(var _iterator = _create_for_of_iterator_helper_loose(teamList), _step; !(_step = _iterator()).done;){
            var member = _step.value;
            member.hp = Math.max(0, member.hp - finalDmg);
        }
        if (defender.superArmorTimer <= 0 && !defender.awakened) {
            defender.hitstunTimer = isUltimate ? 1.15 : 0.48;
        }
        if (attacker.team === 'player') {
            this.stormGauge = Math.min(100, this.stormGauge + (isUltimate ? 20 : 6));
        }
    };
    _proto.updateStorm3D = function updateStorm3D(dt) {
        var p = this.stormPlayerTeam[this.stormActivePlayerSlot];
        var e = this.stormEnemyTeam[this.stormActiveEnemySlot];
        if (!p || !e) return;
        if (this.cutInBanner) {
            this.cutInBanner.timer -= dt;
            if (this.cutInBanner.timer <= 0) this.cutInBanner = null;
        }
        var pSub = (0, _arenaRoster.stepSubstitutionGauge)(p.subLogs, p.subCooldownTimer, dt, false);
        p.subLogs = pSub.logs;
        p.subCooldownTimer = pSub.timerSec;
        for(var _iterator = _create_for_of_iterator_helper_loose(this.stormPlayerTeam), _step; !(_step = _iterator()).done;){
            var m = _step.value;
            m.subLogs = p.subLogs;
            m.subCooldownTimer = p.subCooldownTimer;
        }
        var eSub = (0, _arenaRoster.stepSubstitutionGauge)(e.subLogs, e.subCooldownTimer, dt, false);
        e.subLogs = eSub.logs;
        e.subCooldownTimer = eSub.timerSec;
        this.stormSupportCds[0] = Math.max(0, this.stormSupportCds[0] - dt);
        this.stormSupportCds[1] = Math.max(0, this.stormSupportCds[1] - dt);
        for(var i = 0; i < 4; i++){
            this.stormToolCds[i] = Math.max(0, this.stormToolCds[i] - dt);
        }
        this.stepStormCombatantTimers(p, dt);
        this.stepStormCombatantTimers(e, dt);
        var distToEnemy = Math.max(0.1, Math.hypot(e.x - p.x, e.z - p.z));
        p.facingAngle = Math.atan2(e.x - p.x, e.z - p.z);
        e.facingAngle = Math.atan2(p.x - e.x, p.z - e.z);
        var pMaxChakra = (0, _arenaRoster.computeStormMaxUsableChakra)(p.chakraLockedTimer);
        p.isGuarding = this.guardHeld && p.hitstunTimer <= 0 && p.guardBreakTimer <= 0;
        if (p.hitstunTimer <= 0 && p.guardBreakTimer <= 0) {
            if (this.chakraChargeHeld && p.chakraFatigueTimer <= 0 && !p.isGuarding) {
                var chargeBonus = this.stormGauge >= 50 && (this.support1Type === 'charge' || this.support2Type === 'charge') ? 1.35 : 1.0;
                p.chakra = Math.min(pMaxChakra, p.chakra + 34 * chargeBonus * dt);
            }
            var inputDx = Math.abs(this.moveDx) > 0.08 ? this.moveDx : (this.steerRightHeld ? 1 : 0) - (this.steerLeftHeld ? 1 : 0);
            var inputDy = this.moveDy;
            if (!p.isGuarding && (Math.abs(inputDx) > 0.05 || Math.abs(inputDy) > 0.05)) {
                var speedMult = (p.speedBuffTimer > 0 ? 1.25 : 1.0) * (p.exhaustDebuffTimer > 0 ? 0.72 : 1.0) * (p.awakened ? 1.22 : 1.0);
                var step = p.def.speed * 2.25 * speedMult * dt;
                var forwardX = Math.sin(p.facingAngle);
                var forwardZ = Math.cos(p.facingAngle);
                var rightX = Math.cos(p.facingAngle);
                var rightZ = -Math.sin(p.facingAngle);
                p.x += (-inputDy * forwardX + inputDx * rightX) * step;
                p.z += (-inputDy * forwardZ + inputDx * rightZ) * step;
            }
        }
        if (p.dashTimer > 0) {
            p.x += Math.sin(p.facingAngle) * 22 * dt;
            p.z += Math.cos(p.facingAngle) * 22 * dt;
            if (distToEnemy <= 2.2) {
                p.dashTimer = 0;
                this.dealStormDamage(p, e, 85, 22, false);
            }
        }
        this.updateStormEnemyAi(e, p, distToEnemy, dt);
        for(var _i = 0, _iter = [
            p,
            e
        ]; _i < _iter.length; _i++){
            var unit = _iter[_i];
            var r = Math.hypot(unit.x, unit.z);
            if (r > 20.5) {
                unit.x = unit.x / r * 20.5;
                unit.z = unit.z / r * 20.5;
            }
            unit.rig.group.position.set(unit.x, unit.y, unit.z);
            unit.rig.group.rotation.y = unit.facingAngle;
            unit.rig.armR.rotation.x *= 0.85;
            unit.rig.guardShield.visible = unit.isGuarding;
            if (unit.isGuarding) {
                var shieldMat = unit.rig.guardShield.material;
                shieldMat.color.setHex(unit.guardHp > 60 ? 0x38bdf8 : unit.guardHp > 30 ? 0xfacc15 : 0xef4444);
            }
        }
        for(var i1 = this.stormProjectiles.length - 1; i1 >= 0; i1--){
            var proj = this.stormProjectiles[i1];
            proj.x += proj.vx * dt;
            proj.z += proj.vz * dt;
            proj.ttl -= dt;
            proj.mesh.position.set(proj.x, proj.y, proj.z);
            var target = proj.team === 'player' ? e : p;
            var attacker = proj.team === 'player' ? p : e;
            if (Math.hypot(target.x - proj.x, target.z - proj.z) <= proj.radius + 1.05) {
                this.dealStormDamage(attacker, target, proj.dmg, proj.isChakraEnhanced ? 26 : 12, proj.isUltimate);
                proj.ttl = 0;
            }
            if (proj.ttl <= 0) {
                var _this_three;
                (_this_three = this.three) == null ? void 0 : _this_three.scene.remove(proj.mesh);
                proj.mesh.geometry.dispose();
                proj.mesh.material.dispose();
                this.stormProjectiles.splice(i1, 1);
            }
        }
        for(var i2 = this.stormLogs.length - 1; i2 >= 0; i2--){
            var lg = this.stormLogs[i2];
            lg.ttl -= dt;
            lg.mesh.rotation.y += dt * 4;
            if (lg.ttl <= 0) {
                var _this_three1;
                lg.mesh.traverse(function(obj) {
                    var _m_geometry_userData;
                    var m = obj;
                    if (m.geometry && !((_m_geometry_userData = m.geometry.userData) == null ? void 0 : _m_geometry_userData.noDispose)) m.geometry.dispose();
                    var mats = Array.isArray(m.material) ? m.material : m.material ? [
                        m.material
                    ] : [];
                    for(var _iterator = _create_for_of_iterator_helper_loose(mats), _step; !(_step = _iterator()).done;){
                        var mat = _step.value;
                        var _mat_userData;
                        if (mat && !((_mat_userData = mat.userData) == null ? void 0 : _mat_userData.noDispose)) mat.dispose();
                    }
                });
                (_this_three1 = this.three) == null ? void 0 : _this_three1.scene.remove(lg.mesh);
                this.stormLogs.splice(i2, 1);
            }
        }
        if (this.three) {
            var midX = (p.x + e.x) * 0.5;
            var midZ = (p.z + e.z) * 0.5;
            var camX = p.x - Math.sin(p.facingAngle) * 7.8 + Math.cos(p.facingAngle) * 2.2;
            var camZ = p.z - Math.cos(p.facingAngle) * 7.8 - Math.sin(p.facingAngle) * 2.2;
            _stormCamDesired.set(camX, 3.8, camZ);
            this.three.camera.position.lerp(_stormCamDesired, Math.min(1, dt * 8));
            this.three.camera.lookAt(midX, 1.35, midZ);
            this.renderStormOverlay2D(p, e);
        }
        if (e.hp <= 0) {
            _storage.playerState.narutoKillsTotal += 1;
            this.finishMatch(true);
            return;
        }
        if (p.hp <= 0) {
            this.finishMatch(false);
            return;
        }
        var prorationPct = Math.round((0, _arenaRoster.computeStormComboProration)(Math.max(1, p.comboCount)) * 100);
        this.score = Math.round((2000 - e.hp) * 2 + p.hp);
        this.lives = Math.round(p.hp);
        this.maxLives = p.maxHp;
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, this.gameIdx);
        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        (0, _runtimeBridge.updateNarutoHud)({
            engine: 'storm_3d',
            modeName: this.modeDef.title,
            heroName: p.def.name,
            heroIcon: p.def.icon,
            traitName: p.def.passiveName,
            level: 6,
            xpPct: 100,
            gold: 0,
            awakenedSec: Number(p.awakeningTimer.toFixed(1)),
            superArmor: p.superArmorTimer > 0,
            iFrames: p.iFrameTimer > 0,
            ramenCd: 0,
            pillCd: 0,
            pillBuffSec: Number(p.atkBuffTimer.toFixed(1)),
            speedTagCd: 0,
            speedTagBuffSec: Number(p.speedBuffTimer.toFixed(1)),
            teamHp: Math.round(p.hp),
            teamMaxHp: p.maxHp,
            enemyHp: Math.round(e.hp),
            enemyMaxHp: e.maxHp,
            subLogs: p.subLogs,
            subRechargeSec: Number(p.subCooldownTimer.toFixed(1)),
            chakra: Math.round(p.chakra),
            maxUsableChakra: pMaxChakra,
            counterPenaltySec: Number(p.chakraLockedTimer.toFixed(1)),
            guardHp: Math.round(p.guardHp),
            guardBrokenSec: Number(p.guardBreakTimer.toFixed(1)),
            stormGauge: Math.round(this.stormGauge),
            comboHits: p.comboCount,
            prorationPct: prorationPct,
            fatigueSec: Number(p.chakraFatigueTimer.toFixed(1)),
            toolCharges: [].concat(this.stormToolUses),
            support1Name: this.support1Def.name,
            support1Icon: this.support1Def.icon,
            support1Cd: Number(this.stormSupportCds[0].toFixed(1)),
            support2Name: this.support2Def.name,
            support2Icon: this.support2Def.icon,
            support2Cd: Number(this.stormSupportCds[1].toFixed(1)),
            actionLabel: '🥊 COMBO',
            jumpSkill1: {
                label: 'JUTSU',
                icon: '🌀',
                cd: Number(p.jutsuCooldown.toFixed(1)),
                maxCd: 1.4,
                visible: true
            },
            skill2: {
                label: this.guardHeld ? 'PARRY' : 'KUNAI',
                icon: '🗡️',
                cd: Number(p.attackCooldown.toFixed(1)),
                maxCd: 0.3,
                visible: true
            },
            skill3: {
                label: 'DASH',
                icon: '💨',
                cd: Number(p.dashTimer.toFixed(1)),
                maxCd: 0.36,
                visible: true
            },
            skill4: {
                label: this.stormGauge >= 100 ? 'TEAM ULT' : 'OUGI',
                icon: '💥',
                cd: Number(p.jutsuCooldown.toFixed(1)),
                maxCd: 2.4,
                visible: true
            },
            skill5: {
                label: 'AWAKEN',
                icon: '🌟',
                cd: Number(p.chakraFatigueTimer.toFixed(1)),
                maxCd: 10,
                visible: true,
                activeBuff: p.awakened
            },
            subBtn: {
                label: "SUB (" + p.subLogs + ")",
                icon: '🪵',
                cd: p.subLogs <= 0 ? Number((14 - p.subCooldownTimer).toFixed(1)) : 0,
                maxCd: 14,
                visible: true
            },
            supportBtn: {
                label: 'ASSIST',
                icon: '🤝',
                cd: Number(Math.min(this.stormSupportCds[0], this.stormSupportCds[1]).toFixed(1)),
                maxCd: 9.5,
                visible: true
            },
            chakraBtn: {
                label: 'CHAKRA',
                icon: '💙',
                cd: Number(p.chakraFatigueTimer.toFixed(1)),
                maxCd: 10,
                visible: true,
                activeBuff: this.chakraChargeHeld
            },
            guardBtn: {
                label: 'GUARD',
                icon: '🛡️',
                cd: Number(p.guardBreakTimer.toFixed(1)),
                maxCd: 2.5,
                visible: true,
                activeBuff: p.isGuarding
            }
        });
    };
    _proto.stepStormCombatantTimers = function stepStormCombatantTimers(c, dt) {
        c.chakraLockedTimer = Math.max(0, c.chakraLockedTimer - dt);
        c.chakraFatigueTimer = Math.max(0, c.chakraFatigueTimer - dt);
        c.guardBreakTimer = Math.max(0, c.guardBreakTimer - dt);
        c.hitstunTimer = Math.max(0, c.hitstunTimer - dt);
        c.iFrameTimer = Math.max(0, c.iFrameTimer - dt);
        c.superArmorTimer = Math.max(0, c.superArmorTimer - dt);
        c.dashTimer = Math.max(0, c.dashTimer - dt);
        c.atkBuffTimer = Math.max(0, c.atkBuffTimer - dt);
        c.defBuffTimer = Math.max(0, c.defBuffTimer - dt);
        c.speedBuffTimer = Math.max(0, c.speedBuffTimer - dt);
        c.exhaustDebuffTimer = Math.max(0, c.exhaustDebuffTimer - dt);
        c.attackCooldown = Math.max(0, c.attackCooldown - dt);
        c.jutsuCooldown = Math.max(0, c.jutsuCooldown - dt);
        c.counterStartupTimer = Math.max(0, c.counterStartupTimer - dt);
        if (!c.isGuarding && c.guardBreakTimer <= 0) {
            c.guardHp = Math.min(100, c.guardHp + 12 * dt);
        }
        if (c.comboResetTimer > 0) {
            c.comboResetTimer -= dt;
            if (c.comboResetTimer <= 0) c.comboCount = 0;
        }
        if (c.awakened) {
            c.awakeningTimer -= dt;
            if (c.awakeningTimer <= 0) {
                c.awakened = false;
                c.chakraFatigueTimer = 10.0;
                c.chakra = 20;
                c.rig.awakeningAura.visible = false;
                c.rig.group.scale.setScalar(1.18);
            }
        }
    };
    _proto.updateStormEnemyAi = function updateStormEnemyAi(e, p, dist, dt) {
        if (e.guardBreakTimer > 0) return;
        if (e.hitstunTimer > 0 && p.comboCount >= 3 && e.subLogs > 0 && Math.random() < 0.35) {
            this.triggerSubstitutionKawarimi(e, p);
            return;
        }
        if (e.hitstunTimer > 0) return;
        var eMaxChakra = (0, _arenaRoster.computeStormMaxUsableChakra)(e.chakraLockedTimer);
        e.chakra = Math.min(eMaxChakra, e.chakra + 14 * dt);
        if (!e.awakened && e.chakraFatigueTimer <= 0 && e.hp <= 750 && e.chakra >= 70) {
            e.awakened = true;
            e.awakeningTimer = 14.0;
            e.superArmorTimer = 14.0;
            e.rig.awakeningAura.visible = true;
            e.rig.group.scale.setScalar(1.18 * 1.42);
        }
        if (dist > 3.1) {
            e.isGuarding = false;
            var spd = e.def.speed * 1.85 * (e.exhaustDebuffTimer > 0 ? 0.72 : 1.0) * dt;
            e.x += Math.sin(e.facingAngle) * spd;
            e.z += Math.cos(e.facingAngle) * spd;
            if (dist > 7.5 && e.jutsuCooldown <= 0 && e.chakra >= 25 && Math.random() < dt * 1.4) {
                e.chakra -= 22;
                e.jutsuCooldown = 2.2;
                this.spawnStormProjectile(e, p, e.def.skills[0].damage * 0.65, e.def.chakraColor, true, false);
            }
        } else {
            e.isGuarding = Math.random() < 0.22;
            if (!e.isGuarding && e.attackCooldown <= 0) {
                e.attackCooldown = 0.48;
                e.rig.armR.rotation.x = -1.2;
                this.dealStormDamage(e, p, e.def.baseAtk * 0.58, 15, false);
            }
        }
    };
    _proto.renderStormOverlay2D = function renderStormOverlay2D(p, e) {
        var _this_three;
        var octx = (_this_three = this.three) == null ? void 0 : _this_three.overlayCtx;
        if (!octx || !this.three) return;
        this.three.clearOverlay();
        var w = this.three.width;
        var h = this.three.height;
        _stormProjVec.set(e.x, 2.55, e.z).project(this.three.camera);
        if (_stormProjVec.z > -1 && _stormProjVec.z < 1) {
            var sx = (_stormProjVec.x * 0.5 + 0.5) * w;
            var sy = (-_stormProjVec.y * 0.5 + 0.5) * h;
            octx.fillStyle = 'rgba(9, 13, 22, 0.82)';
            octx.fillRect(sx - 56, sy - 22, 112, 18);
            octx.fillStyle = '#f8fafc';
            octx.font = 'bold 11px sans-serif';
            octx.textAlign = 'center';
            var statusTag = e.guardBreakTimer > 0 ? '💫 GUARD BROKEN!' : e.awakened ? '🔥 AWAKENED' : e.isGuarding ? "\uD83D\uDEE1️ GUARD " + Math.round(e.guardHp) + "%" : e.def.name;
            octx.fillText(statusTag, sx, sy - 9);
        }
        if (p.comboCount >= 2) {
            var prorationPct = Math.round((0, _arenaRoster.computeStormComboProration)(p.comboCount) * 100);
            octx.fillStyle = '#f97316';
            octx.font = '900 22px sans-serif';
            octx.textAlign = 'right';
            octx.fillText("" + p.comboCount + " HITS!", w - 20, h * 0.36);
            octx.fillStyle = '#fde047';
            octx.font = 'bold 11.5px sans-serif';
            octx.fillText("Combo Scaling: " + prorationPct + "%", w - 20, h * 0.36 + 17);
        }
        if (this.cutInBanner) {
            var bannerY = h < 460 ? h * 0.34 : h * 0.25;
            octx.fillStyle = 'rgba(9, 13, 22, 0.88)';
            octx.fillRect(0, bannerY, w, 54);
            octx.strokeStyle = this.cutInBanner.color;
            octx.lineWidth = 2;
            octx.strokeRect(0, bannerY, w, 54);
            octx.fillStyle = '#ffffff';
            octx.font = w < 460 ? 'bold 13px sans-serif' : 'bold 16px sans-serif';
            octx.textAlign = 'center';
            octx.fillText(this.cutInBanner.title, w / 2, bannerY + 23);
            octx.fillStyle = this.cutInBanner.color;
            octx.font = 'bold 11.5px sans-serif';
            octx.fillText(this.cutInBanner.subtitle, w / 2, bannerY + 42);
        }
    };
    // ============================================================================
    // MATCH COMPLETION & CLEANUP
    // ============================================================================
    _proto.finishMatch = function finishMatch(won) {
        if (this.gameOver) return;
        this.gameOver = true;
        this.isRunning = false;
        _storage.playerState.narutoMatchesPlayed += 1;
        if (won) _storage.playerState.narutoWins += 1;
        _storage.playerState.narutoTrialHeroId = null;
        (0, _storage.persistNarutoProgression)();
        var coinsEarned = won ? 85 + this.senkiKills * 10 : 25;
        (0, _runtimeBridge.addCoins)(coinsEarned);
        (0, _runtimeBridge.addXp)(won ? 120 : 45);
        (0, _runtimeBridge.triggerGameOver)(this.score, coinsEarned, this.level, this.gameIdx, won);
    };
    _proto.resize = function resize() {
        if (this.uses3DViewport) {
            var _this_three;
            (_this_three = this.three) == null ? void 0 : _this_three.resize();
        } else {
            this.resizeSenkiCanvas();
        }
    };
    return NarutoSenkiStormGame;
}();

});

})(window.ArcadeMod);

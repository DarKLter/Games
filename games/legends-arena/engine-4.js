(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/engine/AudioEngine ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/AudioEngine", function(require, module, exports) {
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
    get MlbbAudioEngine () {
        return MlbbAudioEngine;
    },
    get mlbbAudio () {
        return mlbbAudio;
    }
});
var ANNOUNCER_PHRASES = {
    first_blood: 'First Blood!',
    double: 'Double Kill!',
    triple: 'Triple Kill!',
    maniac: 'Maniac!',
    savage: 'Savage!',
    unstoppable: 'Unstoppable!',
    godlike: 'Godlike!',
    legendary: 'Legendary!',
    shutdown: 'Shut Down!',
    wiped_out: 'Wiped Out!',
    victory: 'Victory!',
    defeat: 'Defeat!'
};
var MlbbAudioEngine = /*#__PURE__*/ function() {
    "use strict";
    function MlbbAudioEngine() {
        this.ctx = null;
        this.masterGain = 0.8;
        this.sfxGain = 0.85;
        this.bgmGain = 0.4;
        this.voiceGain = 0.85;
        this.killAnnouncer = true;
        this.bgmBus = null;
        this.bgmOscs = [];
        this.bgmTimer = null;
        this.bgmActive = false;
    }
    var _proto = MlbbAudioEngine.prototype;
    _proto.setVolumes = function setVolumes(sound) {
        this.masterGain = Math.max(0, Math.min(1, sound.master / 100));
        this.sfxGain = Math.max(0, Math.min(1, sound.sfx / 100));
        this.bgmGain = Math.max(0, Math.min(1, sound.bgm / 100));
        this.voiceGain = Math.max(0, Math.min(1, sound.voice / 100));
        this.killAnnouncer = sound.killAnnouncer;
        if (this.bgmBus && this.ctx) {
            var target = Math.max(0.0001, this.masterGain * this.bgmGain * 0.065);
            try {
                this.bgmBus.gain.setTargetAtTime(target, this.ctx.currentTime, 0.12);
            } catch (unused) {
            // Ignore timing errors on suspended context
            }
        }
    };
    _proto.startLobbyBgm = function startLobbyBgm() {
        var _this = this;
        if (this.bgmActive) return;
        var ctx = this.ensureContext();
        if (!ctx || ctx.state === 'suspended') return;
        var gainVal = this.masterGain * this.bgmGain * 0.065;
        if (gainVal <= 0.001) return;
        this.bgmActive = true;
        var bus = ctx.createGain();
        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(540, ctx.currentTime);
        bus.gain.setValueAtTime(0.0001, ctx.currentTime);
        bus.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + 1.4);
        filter.connect(bus);
        bus.connect(ctx.destination);
        this.bgmBus = bus;
        // Warm celestial royal D-minor / F-major sanctuary pad drone
        var freqs = [
            146.83,
            220.0,
            293.66
        ];
        this.bgmOscs = freqs.map(function(f, idx) {
            var osc = ctx.createOscillator();
            osc.type = idx === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(f, ctx.currentTime);
            var subGain = ctx.createGain();
            subGain.gain.setValueAtTime(idx === 0 ? 0.55 : idx === 1 ? 0.28 : 0.17, ctx.currentTime);
            osc.connect(subGain);
            subGain.connect(filter);
            osc.start();
            return osc;
        });
        // Gentle heroic arpeggio chime every 3.6s
        var arp = [
            293.66,
            349.23,
            440.0,
            523.25,
            440.0,
            392.0
        ];
        var step = 0;
        this.bgmTimer = window.setInterval(function() {
            if (!_this.bgmActive || !_this.ctx || _this.ctx.state !== 'running') return;
            var note = arp[step % arp.length];
            step += 1;
            _this.tone(note, note * 1.003, 1.3, 'sine', 0.045, 'bgm', 0);
        }, 3600);
    };
    _proto.stopLobbyBgm = function stopLobbyBgm() {
        this.bgmActive = false;
        if (this.bgmTimer !== null && typeof window !== 'undefined') {
            window.clearInterval(this.bgmTimer);
        }
        this.bgmTimer = null;
        var bus = this.bgmBus;
        var oscs = this.bgmOscs;
        this.bgmBus = null;
        this.bgmOscs = [];
        if (bus && this.ctx) {
            try {
                bus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
            } catch (unused) {
            // Ignore
            }
        }
        if (typeof window === 'undefined') return;
        window.setTimeout(function() {
            oscs.forEach(function(o) {
                try {
                    o.stop();
                    o.disconnect();
                } catch (unused) {
                // Ignore
                }
            });
            try {
                bus == null ? void 0 : bus.disconnect();
            } catch (unused) {
            // Ignore
            }
        }, 260);
    };
    _proto.ensureContext = function ensureContext() {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            var AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            try {
                this.ctx = new AudioCtx();
            } catch (unused) {
                return null;
            }
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(function() {});
        }
        return this.ctx;
    };
    _proto.tone = function tone(freq, endFreq, duration, type, vol, channel, delay) {
        if (channel === void 0) channel = 'sfx';
        if (delay === void 0) delay = 0;
        var ctx = this.ensureContext();
        if (!ctx) return;
        var chanVol = channel === 'sfx' ? this.sfxGain : channel === 'voice' ? this.voiceGain : this.bgmGain;
        var gainVal = this.masterGain * chanVol * vol;
        if (gainVal <= 0.002) return;
        var now = ctx.currentTime + delay;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(Math.max(40, freq), now);
        if (endFreq !== freq) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
        }
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(gainVal, now + Math.min(0.015, duration * 0.2));
        gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.02);
    };
    _proto.noiseBurst = function noiseBurst(duration, vol, delay, highpass) {
        if (delay === void 0) delay = 0;
        if (highpass === void 0) highpass = 600;
        var ctx = this.ensureContext();
        if (!ctx) return;
        var gainVal = this.masterGain * this.sfxGain * vol;
        if (gainVal <= 0.002) return;
        var sampleCount = Math.max(128, Math.floor(ctx.sampleRate * duration));
        var buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for(var i = 0; i < sampleCount; i++){
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleCount * 0.35));
        }
        var now = ctx.currentTime + delay;
        var src = ctx.createBufferSource();
        src.buffer = buffer;
        var filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(highpass, now);
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start(now);
        src.stop(now + duration + 0.02);
    };
    // ==================== UI SFX ====================
    _proto.playClick = function playClick() {
        // Metallic gold button click
        this.tone(760, 1080, 0.048, 'triangle', 0.11);
        this.tone(1520, 1980, 0.032, 'sine', 0.05, 'sfx', 0.008);
    };
    _proto.playSwoosh = function playSwoosh() {
        this.noiseBurst(0.11, 0.06, 0, 950);
        this.tone(360, 740, 0.1, 'sine', 0.07);
    };
    _proto.playModalOpen = function playModalOpen() {
        this.tone(523.25, 783.99, 0.11, 'sine', 0.09, 'sfx', 0);
        this.tone(783.99, 1046.5, 0.15, 'triangle', 0.08, 'sfx', 0.05);
    };
    _proto.playPurchase = function playPurchase() {
        this.tone(1318.5, 1760, 0.07, 'sine', 0.13, 'sfx', 0);
        this.tone(1760, 2349.3, 0.11, 'triangle', 0.12, 'sfx', 0.055);
        this.tone(2637, 2637, 0.09, 'sine', 0.08, 'sfx', 0.11);
    };
    _proto.playClaimFanfare = function playClaimFanfare() {
        var _this = this;
        var notes = [
            523.25,
            659.25,
            783.99,
            1046.5
        ];
        notes.forEach(function(n, i) {
            _this.tone(n, n * 1.01, 0.16, 'triangle', 0.13, 'sfx', i * 0.065);
        });
    };
    // ==================== MATCHMAKING & DRAFT SFX ====================
    _proto.playMatchFoundGong = function playMatchFoundGong() {
        // Pulsing heartbeat low gong + golden shimmer
        this.tone(110, 68, 0.42, 'sawtooth', 0.18, 'sfx', 0);
        this.tone(220, 146.8, 0.36, 'triangle', 0.16, 'sfx', 0.03);
        this.tone(440, 659.25, 0.28, 'sine', 0.11, 'sfx', 0.12);
        this.tone(120, 76, 0.24, 'triangle', 0.14, 'sfx', 0.34);
    };
    _proto.playPlayerReady = function playPlayerReady() {
        this.tone(880, 1318.5, 0.08, 'sine', 0.11, 'sfx', 0);
        this.tone(1318.5, 1760, 0.1, 'triangle', 0.08, 'sfx', 0.045);
    };
    _proto.playBanSlam = function playBanSlam() {
        // Heavy war drum + iron clang
        this.tone(150, 48, 0.26, 'sawtooth', 0.2, 'sfx', 0);
        this.tone(92, 42, 0.3, 'triangle', 0.2, 'sfx', 0.02);
        this.noiseBurst(0.14, 0.12, 0, 320);
    };
    _proto.playHeroLockIn = function playHeroLockIn() {
        // Heroic brass chord (D major triad + octave)
        this.tone(293.66, 293.66, 0.34, 'sawtooth', 0.11, 'sfx', 0);
        this.tone(369.99, 369.99, 0.34, 'sawtooth', 0.09, 'sfx', 0.02);
        this.tone(440, 440, 0.36, 'triangle', 0.12, 'sfx', 0.03);
        this.tone(587.33, 620, 0.38, 'sine', 0.14, 'sfx', 0.06);
    };
    _proto.playCountdownTick = function playCountdownTick(urgent) {
        if (urgent === void 0) urgent = false;
        if (urgent) {
            this.tone(980, 1240, 0.065, 'square', 0.11, 'sfx', 0);
        } else {
            this.tone(680, 740, 0.05, 'triangle', 0.08, 'sfx', 0);
        }
    };
    // ==================== BATTLEFIELD & SKILL CAST SFX ====================
    _proto.playAttack = function playAttack(isRanged, isCrit) {
        if (isCrit) {
            this.tone(540, 1280, 0.09, 'sawtooth', 0.16);
            this.tone(240, 110, 0.1, 'triangle', 0.14);
            return;
        }
        if (isRanged) {
            this.tone(860, 420, 0.065, 'sine', 0.1);
        } else {
            this.tone(260, 110, 0.075, 'sawtooth', 0.12);
        }
    };
    _proto.playSkillKind = function playSkillKind(kind) {
        switch(kind){
            case 'slash':
                this.noiseBurst(0.1, 0.1, 0, 1200);
                this.tone(420, 150, 0.11, 'sawtooth', 0.14);
                break;
            case 'magic':
                this.tone(540, 1040, 0.15, 'sine', 0.14);
                this.tone(810, 1380, 0.13, 'triangle', 0.1, 'sfx', 0.03);
                break;
            case 'laser':
                this.tone(1120, 480, 0.22, 'sawtooth', 0.14);
                this.tone(1680, 740, 0.18, 'square', 0.08, 'sfx', 0.02);
                break;
            case 'blink':
                this.tone(380, 1420, 0.09, 'sine', 0.13);
                this.noiseBurst(0.08, 0.08, 0.01, 1800);
                break;
            case 'freeze':
                this.tone(1560, 2240, 0.14, 'triangle', 0.12);
                this.tone(1180, 1980, 0.18, 'sine', 0.1, 'sfx', 0.04);
                break;
            case 'heal':
                this.tone(523.25, 659.25, 0.14, 'sine', 0.12, 'sfx', 0);
                this.tone(659.25, 987.77, 0.18, 'triangle', 0.11, 'sfx', 0.07);
                break;
            case 'explosion':
                this.tone(180, 45, 0.28, 'sawtooth', 0.18);
                this.noiseBurst(0.24, 0.15, 0, 240);
                break;
        }
    };
    _proto.playSkill = function playSkill(slot, damageType) {
        if (slot === 3) {
            this.tone(220, 680, 0.24, 'sawtooth', 0.18);
            this.tone(440, 880, 0.22, 'triangle', 0.14, 'sfx', 0.04);
            return;
        }
        if (damageType === 'magic') {
            this.playSkillKind('magic');
        } else if (damageType === 'true') {
            this.playSkillKind('laser');
        } else {
            this.playSkillKind('slash');
        }
    };
    _proto.playGold = function playGold() {
        this.tone(1180, 1560, 0.07, 'sine', 0.12);
        this.tone(1560, 2040, 0.09, 'triangle', 0.1, 'sfx', 0.05);
    };
    _proto.playTurret = function playTurret() {
        this.tone(180, 82, 0.22, 'sawtooth', 0.16);
        this.tone(520, 240, 0.16, 'triangle', 0.11);
    };
    _proto.playLevelUp = function playLevelUp() {
        this.tone(523, 659, 0.12, 'triangle', 0.14, 'sfx', 0);
        this.tone(659, 784, 0.12, 'triangle', 0.14, 'sfx', 0.08);
        this.tone(784, 1046, 0.2, 'sine', 0.16, 'sfx', 0.16);
    };
    _proto.playEmote = function playEmote(sfx) {
        if (sfx === 'chime') {
            this.tone(880, 1320, 0.12, 'sine', 0.15, 'voice', 0);
            this.tone(1320, 1760, 0.16, 'triangle', 0.13, 'voice', 0.08);
        } else if (sfx === 'horn') {
            this.tone(240, 320, 0.18, 'sawtooth', 0.14, 'voice', 0);
            this.tone(320, 480, 0.24, 'sawtooth', 0.14, 'voice', 0.12);
        } else if (sfx === 'spark') {
            this.tone(660, 1480, 0.1, 'triangle', 0.15, 'voice', 0);
            this.tone(1040, 1920, 0.12, 'sine', 0.12, 'voice', 0.06);
        } else {
            this.tone(580, 460, 0.07, 'triangle', 0.13, 'voice', 0);
            this.tone(620, 490, 0.07, 'triangle', 0.13, 'voice', 0.09);
            this.tone(680, 520, 0.09, 'triangle', 0.13, 'voice', 0.18);
        }
    };
    // ==================== KILL STREAK ANNOUNCER & PINGS ====================
    _proto.playAnnouncer = function playAnnouncer(intensity) {
        if (!this.killAnnouncer) return;
        if (intensity === 'epic') {
            this.tone(293.66, 440, 0.18, 'sawtooth', 0.15, 'voice', 0);
            this.tone(440, 587.33, 0.24, 'triangle', 0.16, 'voice', 0.12);
            this.tone(587.33, 880, 0.34, 'sine', 0.18, 'voice', 0.24);
        } else if (intensity === 'kill') {
            this.tone(330, 523.25, 0.16, 'triangle', 0.15, 'voice', 0);
            this.tone(523.25, 659.25, 0.22, 'sine', 0.15, 'voice', 0.1);
        } else {
            this.tone(440, 660, 0.14, 'triangle', 0.12, 'voice', 0);
        }
    };
    _proto.playKillStreakAnnouncer = function playKillStreakAnnouncer(streak) {
        if (!this.killAnnouncer) return;
        var isEpic = streak === 'maniac' || streak === 'savage' || streak === 'legendary' || streak === 'godlike' || streak === 'wiped_out';
        if (streak === 'victory' || streak === 'defeat') {
            this.playFanfare(streak === 'victory');
        } else {
            this.playAnnouncer(isEpic ? 'epic' : streak === 'shutdown' ? 'normal' : 'kill');
        }
        // Optional browser speech synthesis for crisp offline voice callouts
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.masterGain * this.voiceGain > 0.05) {
            try {
                var phrase = ANNOUNCER_PHRASES[streak];
                var utter = new SpeechSynthesisUtterance(phrase);
                utter.volume = Math.min(1, this.masterGain * this.voiceGain);
                utter.rate = streak === 'savage' || streak === 'legendary' ? 0.95 : 1.05;
                utter.pitch = streak === 'defeat' ? 0.78 : 0.92;
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utter);
            } catch (unused) {
            // Ignore browser speech restrictions
            }
        }
    };
    _proto.playPing = function playPing(kind) {
        if (kind === 'attack') {
            // Sword clash
            this.noiseBurst(0.08, 0.09, 0, 1800);
            this.tone(880, 660, 0.1, 'sawtooth', 0.14, 'voice', 0);
            this.tone(1100, 880, 0.12, 'triangle', 0.14, 'voice', 0.08);
        } else if (kind === 'retreat') {
            // Shield bell
            this.tone(620, 420, 0.11, 'square', 0.13, 'voice', 0);
            this.tone(520, 340, 0.13, 'square', 0.13, 'voice', 0.09);
        } else if (kind === 'gather') {
            // Rally horn
            this.tone(329.63, 440, 0.14, 'sawtooth', 0.13, 'voice', 0);
            this.tone(440, 659.25, 0.2, 'triangle', 0.14, 'voice', 0.09);
        } else if (kind === 'omw') {
            // Cyan ping
            this.tone(523.25, 783.99, 0.11, 'sine', 0.13, 'voice', 0);
            this.tone(783.99, 1046.5, 0.14, 'triangle', 0.14, 'voice', 0.07);
        } else if (kind === 'missing') {
            this.tone(740, 980, 0.09, 'triangle', 0.13, 'voice', 0);
            this.tone(740, 980, 0.09, 'triangle', 0.12, 'voice', 0.11);
        } else {
            this.tone(660, 990, 0.11, 'sine', 0.13, 'voice', 0);
            this.tone(990, 1320, 0.12, 'triangle', 0.11, 'voice', 0.07);
        }
    };
    _proto.playTurretLockBeep = function playTurretLockBeep() {
        this.tone(980, 1180, 0.075, 'square', 0.12, 'sfx', 0);
        this.tone(1180, 980, 0.075, 'square', 0.1, 'sfx', 0.085);
    };
    _proto.playEyeSpot = function playEyeSpot() {
        this.tone(680, 1020, 0.08, 'sine', 0.08, 'sfx', 0);
    };
    _proto.playShieldShatter = function playShieldShatter() {
        this.noiseBurst(0.24, 0.14, 0, 1600);
        this.tone(1320, 440, 0.28, 'triangle', 0.14, 'sfx', 0);
        this.tone(1760, 880, 0.24, 'sine', 0.11, 'sfx', 0.05);
    };
    _proto.playCrystalShatter = function playCrystalShatter() {
        this.noiseBurst(0.55, 0.2, 0, 420);
        this.tone(220, 48, 0.72, 'sawtooth', 0.22, 'sfx', 0);
        this.tone(880, 260, 0.55, 'triangle', 0.16, 'sfx', 0.04);
        this.tone(1560, 520, 0.48, 'sine', 0.13, 'sfx', 0.12);
    };
    _proto.playShrineHeal = function playShrineHeal() {
        this.tone(523.25, 783.99, 0.15, 'sine', 0.12, 'sfx', 0);
        this.tone(783.99, 1046.5, 0.22, 'triangle', 0.11, 'sfx', 0.08);
    };
    _proto.playFanfare = function playFanfare(victory) {
        var _this = this;
        var notes = victory ? [
            523.25,
            659.25,
            783.99,
            1046.5
        ] : [
            392,
            349.23,
            311.13,
            261.63
        ];
        notes.forEach(function(n, idx) {
            _this.tone(n, n, 0.26, victory ? 'triangle' : 'sawtooth', 0.15, 'bgm', idx * 0.14);
        });
    };
    return MlbbAudioEngine;
}();
var mlbbAudio = new MlbbAudioEngine();

});
// === MODULE: src/games/legends-arena/mlbb/engine/BattlefieldSystems ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/BattlefieldSystems", function(require, module, exports) {
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
    get computeEarlyLaneMinionRewards () {
        return computeEarlyLaneMinionRewards;
    },
    get computeOuterTurretPlateDamage () {
        return computeOuterTurretPlateDamage;
    },
    get computeTurretRingState () {
        return computeTurretRingState;
    },
    get createInitialBrawlShrines () {
        return createInitialBrawlShrines;
    },
    get createWalkieGrassWard () {
        return createWalkieGrassWard;
    },
    get selectWeakestEnemyLane () {
        return selectWeakestEnemyLane;
    },
    get stepWalkieGrassWards () {
        return stepWalkieGrassWards;
    }
});
var _mapData = require("../data/mapData");
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
function createInitialBrawlShrines() {
    return _mapData.BRAWL_HEALING_SHRINES.map(function(s) {
        return {
            id: s.id,
            side: s.side,
            x: s.x,
            y: s.y,
            active: false,
            respawnTimer: _mapData.MLBB_TIMERS.BRAWL_SHRINE_FIRST_SPAWN,
            maxRespawn: _mapData.MLBB_TIMERS.BRAWL_SHRINE_FIRST_SPAWN
        };
    });
}
function createWalkieGrassWard(id, team, x, y) {
    return {
        id: id,
        team: team,
        x: x,
        y: y,
        originX: x,
        originY: y,
        radius: 460,
        ttl: _mapData.MLBB_TIMERS.WALKIE_GRASS_DURATION,
        maxTtl: _mapData.MLBB_TIMERS.WALKIE_GRASS_DURATION,
        phase: 0
    };
}
function stepWalkieGrassWards(wards, dt) {
    var next = [];
    for(var _iterator = _create_for_of_iterator_helper_loose(wards), _step; !(_step = _iterator()).done;){
        var w = _step.value;
        w.ttl -= dt;
        if (w.ttl <= 0) continue;
        w.phase += dt * 0.72;
        var drift = Math.sin(w.phase) * 260;
        w.x = w.originX + drift;
        w.y = w.originY + drift;
        next.push(w);
    }
    return next;
}
function computeEarlyLaneMinionRewards(kind, lane, expLane, goldLane, matchTimeSec) {
    var baseGold = kind === 'super' ? 90 : kind === 'siege' ? 75 : kind === 'melee' ? 45 : kind === 'ranged' ? 40 : 60;
    var baseExp = kind === 'super' ? 135 : kind === 'siege' ? 110 : kind === 'melee' ? 75 : kind === 'ranged' ? 70 : 95;
    if (kind === 'siege' && matchTimeSec < _mapData.MLBB_TIMERS.OUTER_SHIELD_EXPIRE) {
        if (lane === goldLane) {
            return {
                gold: Math.round(baseGold * 1.45),
                exp: baseExp
            };
        }
        if (lane === expLane) {
            return {
                gold: baseGold,
                exp: Math.round(baseExp * 1.35)
            };
        }
    }
    return {
        gold: baseGold,
        exp: baseExp
    };
}
function computeOuterTurretPlateDamage(rawDmg, isOuterTier1, shieldHp, plateDamageAccum, matchTimeSec) {
    var shieldActive = isOuterTier1 && shieldHp > 0 && matchTimeSec < _mapData.MLBB_TIMERS.OUTER_SHIELD_EXPIRE;
    if (!shieldActive) {
        return {
            finalDamage: Math.max(1, Math.round(rawDmg)),
            nextShieldHp: shieldHp,
            nextPlateAccum: plateDamageAccum,
            platesBroken: 0,
            plateGoldAward: 0
        };
    }
    var mitigated = Math.max(1, Math.round(rawDmg * 0.5));
    var shieldUsed = Math.min(shieldHp, mitigated);
    var nextShieldHp = Math.max(0, shieldHp - shieldUsed);
    var totalAccum = plateDamageAccum + shieldUsed;
    var platesBroken = Math.floor(totalAccum / _mapData.MLBB_TIMERS.OUTER_PLATE_CHUNK);
    var nextPlateAccum = totalAccum - platesBroken * _mapData.MLBB_TIMERS.OUTER_PLATE_CHUNK;
    return {
        finalDamage: mitigated,
        nextShieldHp: nextShieldHp,
        nextPlateAccum: nextPlateAccum,
        platesBroken: platesBroken,
        plateGoldAward: platesBroken * _mapData.MLBB_TIMERS.OUTER_PLATE_GOLD
    };
}
function selectWeakestEnemyLane(turrets, enemyTeam) {
    var _loop = function() {
        var lane = _step.value;
        var laneTurrets = turrets.filter(function(t) {
            return t.team === enemyTeam && t.lane === lane && t.alive;
        });
        var count = laneTurrets.length;
        var totalHp = laneTurrets.reduce(function(sum, t) {
            return sum + t.hp;
        }, 0);
        if (count < bestCount || count === bestCount && totalHp < bestHp) {
            bestCount = count;
            bestHp = totalHp;
            bestLane = lane;
        }
    };
    var lanes = [
        'top',
        'mid',
        'bot'
    ];
    var bestLane = 'mid';
    var bestCount = Infinity;
    var bestHp = Infinity;
    for(var _iterator = _create_for_of_iterator_helper_loose(lanes), _step; !(_step = _iterator()).done;)_loop();
    return bestLane;
}
function computeTurretRingState(turret, playerId, playerTeam, minions) {
    if (turret.targetId === playerId) return 'locked';
    var bestMinionHpRatio = 0;
    for(var _iterator = _create_for_of_iterator_helper_loose(minions), _step; !(_step = _iterator()).done;){
        var m = _step.value;
        if (!m.alive || m.team !== playerTeam) continue;
        if ((0, _CombatMath.dist)(m.x, m.y, turret.x, turret.y) <= turret.range) {
            var ratio = m.hp / Math.max(1, m.maxHp);
            if (ratio > bestMinionHpRatio) bestMinionHpRatio = ratio;
        }
    }
    if (bestMinionHpRatio >= 0.35) return 'safe';
    return 'warn';
}

});
// === MODULE: src/games/legends-arena/mlbb/engine/CombatMath ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/CombatMath", function(require, module, exports) {
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
    get applyAntiHealReduction () {
        return applyAntiHealReduction;
    },
    get applyAttackSpeedCap () {
        return applyAttackSpeedCap;
    },
    get applyCdrCap () {
        return applyCdrCap;
    },
    get applyMoveSpeedSoftCap () {
        return applyMoveSpeedSoftCap;
    },
    get buildOmwRouteFromHero () {
        return buildOmwRouteFromHero;
    },
    get canCleanseCc () {
        return canCleanseCc;
    },
    get clamp () {
        return clamp;
    },
    get classifyPingGesture () {
        return classifyPingGesture;
    },
    get computeCriticalMultiplier () {
        return computeCriticalMultiplier;
    },
    get computeDeathRecapBreakdown () {
        return computeDeathRecapBreakdown;
    },
    get computeEffectiveDefense () {
        return computeEffectiveDefense;
    },
    get computeFinalDamage () {
        return computeFinalDamage;
    },
    get computeMatchRatingAndMedal () {
        return computeMatchRatingAndMedal;
    },
    get computeRetributionThreshold () {
        return computeRetributionThreshold;
    },
    get computeTurretRampMultiplier () {
        return computeTurretRampMultiplier;
    },
    get dist () {
        return dist;
    },
    get distSq () {
        return distSq;
    },
    get getCcPriority () {
        return getCcPriority;
    },
    get isDashBlockingCc () {
        return isDashBlockingCc;
    },
    get isHardDisableCc () {
        return isHardDisableCc;
    },
    get isMovementBlockingCc () {
        return isMovementBlockingCc;
    },
    get resolveUniqueItemPassives () {
        return resolveUniqueItemPassives;
    }
});
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
function computeEffectiveDefense(baseDef, flatPen, pctPen) {
    var safePct = Math.max(0, Math.min(1, pctPen));
    var eff = (baseDef - Math.max(0, flatPen)) * (1 - safePct);
    return Math.max(-60, eff);
}
function computeFinalDamage(rawDamage, effectiveDefense, damageType) {
    if (rawDamage <= 0) return 0;
    if (damageType === 'true') return Math.round(rawDamage);
    var clampedDef = Math.max(-60, effectiveDefense);
    var mult = clampedDef >= 0 ? 120 / (120 + clampedDef) : 2 - 120 / (120 - clampedDef);
    return Math.max(1, Math.round(rawDamage * mult));
}
function computeCriticalMultiplier(hasBerserkersFury, extraCritDmgPct) {
    if (extraCritDmgPct === void 0) extraCritDmgPct = 0;
    var base = hasBerserkersFury ? 2.4 : 2.0;
    return base + Math.max(0, extraCritDmgPct);
}
function applyAttackSpeedCap(rawAtkSpd, hasGoldenStaff) {
    var cap = hasGoldenStaff ? 5.0 : 3.0;
    return Number(Math.max(0.45, Math.min(cap, rawAtkSpd)).toFixed(2));
}
function applyCdrCap(rawCdr, hasEnchantedTalisman) {
    var cap = hasEnchantedTalisman ? 0.45 : 0.4;
    return Math.max(0, Math.min(cap, rawCdr));
}
function applyAntiHealReduction(rawAmount, antiHealActive, bypassAntiHeal) {
    if (bypassAntiHeal === void 0) bypassAntiHeal = false;
    if (rawAmount <= 0) return 0;
    if (antiHealActive && !bypassAntiHeal) {
        return Math.round(rawAmount * 0.5);
    }
    return Math.round(rawAmount);
}
function applyMoveSpeedSoftCap(rawMs) {
    var ms = Math.max(120, rawMs);
    if (ms <= 415) return Math.round(ms);
    if (ms <= 490) {
        return Math.round(415 + (ms - 415) * 0.8);
    }
    return Math.round(415 + 75 * 0.8 + (ms - 490) * 0.5);
}
function getCcPriority(ccType) {
    switch(ccType){
        case 'slow':
        case 'grounded':
            return 1;
        case 'silence':
        case 'root':
        case 'disarm':
        case 'taunt':
            return 2;
        case 'stun':
        case 'freeze':
        case 'petrify':
        case 'transform':
            return 3;
        case 'airborne':
        case 'knockback':
        case 'pull':
        case 'vortex':
            return 4;
        case 'suppression':
            return 5;
    }
}
function canCleanseCc(ccType) {
    return ccType !== 'suppression';
}
function isHardDisableCc(ccType) {
    return getCcPriority(ccType) >= 3;
}
function isDashBlockingCc(ccType) {
    return ccType === 'grounded' || ccType === 'root' || ccType === 'silence' || ccType === 'taunt' || getCcPriority(ccType) >= 3;
}
function isMovementBlockingCc(ccType) {
    return ccType === 'root' || getCcPriority(ccType) >= 3;
}
function computeTurretRampMultiplier(consecutiveHits) {
    var n = Math.max(0, Math.floor(consecutiveHits));
    return Math.min(2.6, 1 + n * 0.4);
}
function computeRetributionThreshold(level, evolved) {
    var base = 520 + Math.max(1, level) * 80;
    return evolved ? Math.round(base * 1.45) : base;
}
function resolveUniqueItemPassives(ownedItemIds) {
    var uniqueSet = new Set(ownedItemIds);
    var activePassiveNames = new Set();
    var hasLifebane = uniqueSet.has('sea_halberd') || uniqueSet.has('glowing_wand') || uniqueSet.has('dominance_ice');
    if (hasLifebane) activePassiveNames.add('Lifebane');
    var hasArmorBuster = uniqueSet.has('malefic_roar') || uniqueSet.has('malefic_gun');
    if (hasArmorBuster) activePassiveNames.add('Armor Buster');
    var hasDivineJustice = uniqueSet.has('endless_battle');
    if (hasDivineJustice) activePassiveNames.add('Divine Justice');
    if (uniqueSet.has('starlium_scythe')) activePassiveNames.add('Crisis');
    var burningSoulMaxHpPct = uniqueSet.has('cursed_helmet') ? 0.012 : uniqueSet.has('molten_essence') ? 0.006 : 0;
    if (burningSoulMaxHpPct > 0) activePassiveNames.add('Burning Soul');
    var lifelineShieldTier = uniqueSet.has('rose_gold_meteor') ? 'rose_gold' : uniqueSet.has('magic_blade') ? 'magic_blade' : 'none';
    if (lifelineShieldTier !== 'none') activePassiveNames.add('Lifeline');
    var hasImpulse = uniqueSet.has('corrosion_scythe') || uniqueSet.has('feather_of_heaven') || uniqueSet.has('swift_crossbow');
    if (hasImpulse) activePassiveNames.add('Impulse');
    var hasGoldenStaff = uniqueSet.has('golden_staff');
    if (hasGoldenStaff) activePassiveNames.add('Swift');
    var hasBerserkersFury = uniqueSet.has('berserkers_fury');
    if (hasBerserkersFury) activePassiveNames.add('Doom');
    var cdrCapPct = uniqueSet.has('enchanted_talisman') ? 45 : 40;
    if (cdrCapPct === 45) activePassiveNames.add('Magic Mastery');
    var spellbladeStacks = (hasDivineJustice ? 1 : 0) + (uniqueSet.has('starlium_scythe') ? 1 : 0);
    return {
        activePassiveNames: Array.from(activePassiveNames),
        antiHealReductionPct: hasLifebane ? 50 : 0,
        armorBusterPctPen: hasArmorBuster ? 0.3 : 0,
        hasDivineJustice: hasDivineJustice,
        hasCrisis: uniqueSet.has('starlium_scythe'),
        spellbladeStacks: spellbladeStacks,
        burningSoulMaxHpPct: burningSoulMaxHpPct,
        lifelineShieldTier: lifelineShieldTier,
        hasImpulse: hasImpulse,
        hasGoldenStaff: hasGoldenStaff,
        hasBerserkersFury: hasBerserkersFury,
        cdrCapPct: cdrCapPct
    };
}
function computeDeathRecapBreakdown(hits, deathTimeSec, killerName, killerHeroId, ccEvents) {
    if (ccEvents === void 0) ccEvents = [];
    var recent = hits.filter(function(h) {
        return deathTimeSec - h.timeSec <= 15 && h.amount > 0;
    });
    var physicalTotal = 0;
    var magicTotal = 0;
    var trueTotal = 0;
    var byAttacker = new Map();
    for(var _iterator = _create_for_of_iterator_helper_loose(recent), _step; !(_step = _iterator()).done;){
        var h = _step.value;
        var _entry_sources_get;
        if (h.damageType === 'physical') physicalTotal += h.amount;
        else if (h.damageType === 'magic') magicTotal += h.amount;
        else trueTotal += h.amount;
        var entry = byAttacker.get(h.attackerId);
        if (!entry) {
            entry = {
                attackerId: h.attackerId,
                attackerName: h.attackerName,
                heroId: h.heroId,
                totalDamage: 0,
                physical: 0,
                magic: 0,
                trueDmg: 0,
                sources: new Map()
            };
            byAttacker.set(h.attackerId, entry);
        }
        entry.totalDamage += h.amount;
        if (h.damageType === 'physical') entry.physical += h.amount;
        else if (h.damageType === 'magic') entry.magic += h.amount;
        else entry.trueDmg += h.amount;
        entry.sources.set(h.sourceName, ((_entry_sources_get = entry.sources.get(h.sourceName)) != null ? _entry_sources_get : 0) + h.amount);
    }
    var totalDamage = Math.max(1, physicalTotal + magicTotal + trueTotal);
    var physicalPct = Math.round(physicalTotal / totalDamage * 100);
    var magicPct = Math.round(magicTotal / totalDamage * 100);
    var truePct = Math.max(0, 100 - physicalPct - magicPct);
    var contributors = Array.from(byAttacker.values()).sort(function(a, b) {
        return b.totalDamage - a.totalDamage;
    }).slice(0, 3).map(function(e) {
        var topSkills = Array.from(e.sources.entries()).sort(function(a, b) {
            return b[1] - a[1];
        }).slice(0, 3).map(function(param) {
            var name = param[0], dmg = param[1];
            return {
                name: name,
                damage: Math.round(dmg)
            };
        });
        return {
            attackerId: e.attackerId,
            attackerName: e.attackerName,
            heroId: e.heroId,
            totalDamage: Math.round(e.totalDamage),
            sharePct: Math.round(e.totalDamage / totalDamage * 100),
            physical: Math.round(e.physical),
            magic: Math.round(e.magic),
            trueDmg: Math.round(e.trueDmg),
            topSkills: topSkills
        };
    });
    // Aggregate Crowd Control suffered over the last 15 seconds
    var recentCc = ccEvents.filter(function(c) {
        return deathTimeSec - c.timeSec <= 15 && c.durationSec > 0;
    });
    var ccByType = new Map();
    var rawCcTotal = 0;
    for(var _iterator1 = _create_for_of_iterator_helper_loose(recentCc), _step1; !(_step1 = _iterator1()).done;){
        var c = _step1.value;
        var _ccByType_get;
        rawCcTotal += c.durationSec;
        var prev = (_ccByType_get = ccByType.get(c.ccType)) != null ? _ccByType_get : {
            durationSec: 0,
            count: 0
        };
        ccByType.set(c.ccType, {
            durationSec: prev.durationSec + c.durationSec,
            count: prev.count + 1
        });
    }
    var ccBreakdown = Array.from(ccByType.entries()).map(function(param) {
        var ccType = param[0], info = param[1];
        return {
            ccType: ccType,
            durationSec: Math.round(info.durationSec * 10) / 10,
            count: info.count
        };
    }).sort(function(a, b) {
        return b.durationSec - a.durationSec;
    });
    return {
        killerName: killerName,
        killerHeroId: killerHeroId,
        deathTimeSec: deathTimeSec,
        totalDamage: Math.round(physicalTotal + magicTotal + trueTotal),
        physicalTotal: Math.round(physicalTotal),
        magicTotal: Math.round(magicTotal),
        trueTotal: Math.round(trueTotal),
        physicalPct: physicalPct,
        magicPct: magicPct,
        truePct: truePct,
        totalCcSec: Math.round(rawCcTotal * 10) / 10,
        ccBreakdown: ccBreakdown,
        contributors: contributors
    };
}
function classifyPingGesture(elapsedMs, movedPx) {
    return elapsedMs >= 140 || movedPx > 10 ? 'drag' : 'tap';
}
function buildOmwRouteFromHero(heroX, heroY, destX, destY, segments) {
    if (segments === void 0) segments = 6;
    var count = Math.max(2, Math.floor(segments));
    var pts = [];
    for(var i = 0; i <= count; i++){
        var t = i / count;
        pts.push({
            x: Math.round(heroX + (destX - heroX) * t),
            y: Math.round(heroY + (destY - heroY) * t)
        });
    }
    return pts;
}
function computeMatchRatingAndMedal(kills, deaths, assists, damageDealt, turretDamage, teamfightPct) {
    var kdaScore = (kills * 1.25 + assists * 0.72) / Math.max(1, deaths + 0.65);
    var contribScore = Math.min(2.2, damageDealt / 18000) + Math.min(1.4, turretDamage / 8000) + Math.min(1.6, teamfightPct / 45);
    var raw = 4.2 + Math.min(6.4, kdaScore * 1.35) + contribScore;
    var rating = Math.max(3.0, Math.min(15.0, Math.round(raw * 10) / 10));
    var medal = rating >= 8.2 ? 'Gold' : rating >= 6.0 ? 'Silver' : 'Bronze';
    return {
        rating: rating,
        medal: medal
    };
}
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}
function distSq(ax, ay, bx, by) {
    var dx = ax - bx;
    var dy = ay - by;
    return dx * dx + dy * dy;
}
function dist(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
}

});

})(window.ArcadeMod);

(function(ArcadeMod){
// === MODULE: src/games/stockfish-chess/ChessEngine ===
ArcadeMod.define("src/games/stockfish-chess/ChessEngine", function(require, module, exports) {
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
    get classifyChessMove () {
        return classifyChessMove;
    },
    get cpToWinPercent () {
        return cpToWinPercent;
    },
    get createGeniusChessEngine () {
        return createGeniusChessEngine;
    }
});
function createGeniusChessEngine() {
    var P_N = 2, P_B = 3, P_R = 4, P_Q = 5, P_K = 6, P_P = 1;
    var CHAR_MAP = {
        P: 1,
        N: 2,
        B: 3,
        R: 4,
        Q: 5,
        K: 6,
        p: -1,
        n: -2,
        b: -3,
        r: -4,
        q: -5,
        k: -6
    };
    var PROM_CHARS = [
        '',
        '',
        'n',
        'b',
        'r',
        'q'
    ];
    var MG_VAL = [
        0,
        82,
        337,
        365,
        477,
        1025,
        20000
    ];
    var EG_VAL = [
        0,
        94,
        281,
        297,
        512,
        936,
        20000
    ];
    var SEE_VAL = [
        0,
        100,
        325,
        340,
        500,
        950,
        20000
    ];
    var PHASE_W = [
        0,
        0,
        1,
        1,
        2,
        4,
        0
    ];
    var MG_PST = [
        null,
        [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            98,
            134,
            61,
            95,
            68,
            126,
            34,
            -11,
            -6,
            7,
            26,
            31,
            65,
            56,
            25,
            -20,
            -14,
            13,
            6,
            21,
            23,
            12,
            17,
            -23,
            -27,
            -2,
            -5,
            12,
            17,
            6,
            10,
            -25,
            -26,
            -4,
            -4,
            -10,
            3,
            3,
            33,
            -12,
            -35,
            -1,
            -20,
            -23,
            -15,
            24,
            38,
            -22,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ],
        [
            -167,
            -89,
            -34,
            -49,
            61,
            -97,
            -15,
            -107,
            -73,
            -41,
            72,
            36,
            23,
            62,
            7,
            -17,
            -47,
            60,
            37,
            65,
            84,
            129,
            73,
            44,
            -9,
            17,
            19,
            53,
            37,
            69,
            18,
            22,
            -13,
            4,
            16,
            13,
            28,
            19,
            21,
            -8,
            -23,
            -9,
            12,
            10,
            19,
            17,
            25,
            -16,
            -29,
            -53,
            -12,
            -3,
            -1,
            18,
            -14,
            -19,
            -105,
            -21,
            -58,
            -33,
            -17,
            -28,
            -19,
            -23
        ],
        [
            -29,
            4,
            -82,
            -37,
            -25,
            -42,
            7,
            -8,
            -26,
            16,
            -18,
            -13,
            30,
            59,
            18,
            -47,
            -16,
            37,
            43,
            40,
            35,
            50,
            37,
            -2,
            -4,
            5,
            19,
            50,
            37,
            37,
            7,
            -2,
            -6,
            13,
            13,
            26,
            34,
            12,
            10,
            4,
            0,
            15,
            15,
            15,
            14,
            27,
            18,
            10,
            4,
            15,
            16,
            0,
            7,
            21,
            33,
            1,
            -33,
            -3,
            -14,
            -21,
            -13,
            -12,
            -39,
            -21
        ],
        [
            32,
            42,
            32,
            51,
            63,
            9,
            31,
            43,
            27,
            32,
            58,
            62,
            80,
            67,
            26,
            44,
            -5,
            19,
            26,
            36,
            17,
            45,
            61,
            16,
            -24,
            -11,
            7,
            26,
            24,
            35,
            -8,
            -20,
            -36,
            -26,
            -12,
            -1,
            9,
            -7,
            6,
            -23,
            -45,
            -25,
            -16,
            -17,
            3,
            0,
            -5,
            -33,
            -44,
            -16,
            -20,
            -9,
            -1,
            11,
            -6,
            -71,
            -19,
            -13,
            1,
            17,
            16,
            7,
            -37,
            -26
        ],
        [
            -28,
            0,
            29,
            12,
            59,
            44,
            43,
            45,
            -24,
            -39,
            -5,
            1,
            -16,
            57,
            28,
            54,
            -13,
            -17,
            7,
            8,
            29,
            56,
            47,
            57,
            -27,
            -27,
            -16,
            -16,
            -1,
            17,
            -2,
            1,
            -9,
            -26,
            -9,
            -10,
            -2,
            -4,
            3,
            -3,
            -14,
            2,
            -11,
            -2,
            -5,
            2,
            14,
            5,
            -35,
            -8,
            11,
            2,
            8,
            15,
            -3,
            1,
            -1,
            -18,
            -9,
            10,
            -15,
            -25,
            -31,
            -50
        ],
        [
            -65,
            23,
            16,
            -15,
            -56,
            -34,
            2,
            13,
            29,
            -1,
            -20,
            -7,
            -8,
            -4,
            -38,
            -29,
            -9,
            24,
            2,
            -16,
            -20,
            6,
            22,
            -22,
            -17,
            -20,
            -12,
            -27,
            -30,
            -25,
            -14,
            -36,
            -49,
            -1,
            -27,
            -39,
            -46,
            -44,
            -33,
            -51,
            -14,
            -14,
            -22,
            -46,
            -44,
            -30,
            -15,
            -27,
            1,
            7,
            -8,
            -64,
            -43,
            -16,
            9,
            8,
            -15,
            36,
            12,
            -54,
            8,
            -28,
            24,
            14
        ]
    ];
    var EG_PST = [
        null,
        [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            178,
            173,
            158,
            134,
            147,
            132,
            165,
            187,
            94,
            100,
            85,
            67,
            56,
            53,
            82,
            84,
            32,
            24,
            13,
            5,
            -2,
            4,
            17,
            17,
            13,
            9,
            -3,
            -7,
            -7,
            -8,
            3,
            -1,
            4,
            7,
            -6,
            1,
            0,
            -5,
            -1,
            -8,
            13,
            8,
            8,
            10,
            13,
            0,
            2,
            -7,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ],
        [
            -58,
            -38,
            -13,
            -28,
            -31,
            -27,
            -63,
            -99,
            -25,
            -8,
            -25,
            -2,
            -9,
            -25,
            -24,
            -52,
            -24,
            -20,
            10,
            9,
            -1,
            -9,
            -19,
            -41,
            -17,
            3,
            22,
            22,
            22,
            11,
            8,
            -18,
            -18,
            -6,
            16,
            25,
            16,
            17,
            4,
            -18,
            -23,
            -3,
            -1,
            15,
            10,
            -3,
            -20,
            -22,
            -42,
            -20,
            -10,
            -5,
            -2,
            -20,
            -23,
            -44,
            -29,
            -51,
            -23,
            -15,
            -22,
            -18,
            -50,
            -64
        ],
        [
            -14,
            -21,
            -11,
            -8,
            -7,
            -9,
            -17,
            -24,
            -8,
            -4,
            7,
            -12,
            -3,
            -13,
            -4,
            -14,
            2,
            -8,
            0,
            -1,
            -2,
            6,
            0,
            4,
            -3,
            9,
            12,
            9,
            14,
            10,
            3,
            2,
            -6,
            3,
            13,
            19,
            7,
            10,
            -3,
            -9,
            -12,
            -3,
            8,
            10,
            13,
            3,
            -7,
            -15,
            -14,
            -18,
            -7,
            -1,
            4,
            -9,
            -15,
            -27,
            -23,
            -9,
            -23,
            -5,
            -9,
            -16,
            -5,
            -17
        ],
        [
            13,
            10,
            18,
            15,
            12,
            12,
            8,
            5,
            11,
            13,
            13,
            11,
            -33,
            8,
            13,
            12,
            7,
            7,
            7,
            5,
            4,
            -3,
            -5,
            -3,
            4,
            3,
            13,
            1,
            2,
            1,
            -1,
            2,
            3,
            5,
            8,
            4,
            -5,
            -6,
            -8,
            -11,
            -4,
            0,
            -5,
            -1,
            -7,
            -12,
            -8,
            -16,
            -6,
            -6,
            0,
            2,
            -9,
            -9,
            -11,
            -3,
            -9,
            2,
            3,
            -1,
            -5,
            -13,
            4,
            -20
        ],
        [
            -9,
            22,
            22,
            27,
            27,
            19,
            10,
            20,
            -17,
            20,
            32,
            41,
            58,
            25,
            30,
            0,
            -20,
            6,
            9,
            49,
            47,
            35,
            19,
            9,
            3,
            22,
            24,
            45,
            57,
            40,
            57,
            36,
            -18,
            28,
            19,
            47,
            31,
            34,
            39,
            23,
            -16,
            -27,
            15,
            6,
            9,
            17,
            10,
            5,
            -22,
            -23,
            -30,
            -16,
            -16,
            -23,
            -36,
            -32,
            -33,
            -28,
            -22,
            -43,
            -5,
            -32,
            -20,
            -41
        ],
        [
            -74,
            -35,
            -18,
            -18,
            -11,
            15,
            4,
            -17,
            -12,
            17,
            14,
            17,
            17,
            38,
            23,
            11,
            10,
            17,
            23,
            15,
            20,
            45,
            44,
            13,
            -8,
            22,
            24,
            27,
            26,
            33,
            26,
            3,
            -18,
            -4,
            21,
            24,
            27,
            23,
            9,
            -11,
            -19,
            -3,
            11,
            21,
            23,
            16,
            7,
            -9,
            -27,
            -11,
            4,
            13,
            14,
            4,
            -5,
            -17,
            -53,
            -34,
            -21,
            -11,
            -28,
            -14,
            -24,
            -43
        ]
    ];
    var seed = 0x9e3779b9;
    function nextRand32() {
        seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return (t ^ t >>> 14) >>> 0;
    }
    var Z_HI = new Uint32Array(13 * 64);
    var Z_LO = new Uint32Array(13 * 64);
    for(var i = 0; i < 13 * 64; i++){
        Z_HI[i] = nextRand32() & 0x1fffff;
        Z_LO[i] = nextRand32();
    }
    var Z_TURN_HI = nextRand32() & 0x1fffff, Z_TURN_LO = nextRand32();
    var Z_CAS_HI = new Uint32Array(16), Z_CAS_LO = new Uint32Array(16);
    for(var i1 = 0; i1 < 16; i1++){
        Z_CAS_HI[i1] = nextRand32() & 0x1fffff;
        Z_CAS_LO[i1] = nextRand32();
    }
    var Z_EP_HI = new Uint32Array(8), Z_EP_LO = new Uint32Array(8);
    for(var i2 = 0; i2 < 8; i2++){
        Z_EP_HI[i2] = nextRand32() & 0x1fffff;
        Z_EP_LO[i2] = nextRand32();
    }
    var OPENING_BOOK = {
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [
            'e2e4',
            'd2d4',
            'c2c4',
            'g1f3'
        ],
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -': [
            'c7c5',
            'e7e5',
            'e7e6',
            'c7c6'
        ],
        'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -': [
            'g8f6',
            'd7d5',
            'e7e6'
        ],
        'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq -': [
            'e7e5',
            'g8f6',
            'c7c5',
            'e7e6'
        ],
        'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -': [
            'd7d5',
            'g8f6',
            'c7c5'
        ],
        'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': [
            'g1f3',
            'f1c4',
            'b1c3'
        ],
        'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -': [
            'b8c6',
            'g8f6'
        ],
        'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -': [
            'f1b5',
            'f1c4',
            'd2d4'
        ],
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -': [
            'g1f3',
            'b1c3',
            'c2c3'
        ],
        'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -': [
            'c2c4',
            'g1f3',
            'c1f4'
        ],
        'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -': [
            'c2c4',
            'g1f3',
            'c1f4'
        ]
    };
    function parseFen(fen) {
        var parts = fen.trim().split(/\s+/);
        var rows = parts[0].split('/');
        var b = new Int8Array(64);
        for(var r = 0; r < 8; r++){
            var c = 0;
            var row = rows[r];
            for(var i = 0; i < row.length; i++){
                var ch = row[i];
                if (ch >= '1' && ch <= '8') c += parseInt(ch, 10);
                else {
                    b[r * 8 + c] = CHAR_MAP[ch] || 0;
                    c++;
                }
            }
        }
        var turn = parts[1] === 'b' ? -1 : 1;
        var castle = 0;
        var cs = parts[2] || '-';
        if (cs.includes('K')) castle |= 1;
        if (cs.includes('Q')) castle |= 2;
        if (cs.includes('k')) castle |= 4;
        if (cs.includes('q')) castle |= 8;
        var ep = -1;
        if (parts[3] && parts[3] !== '-') {
            ep = (8 - parseInt(parts[3][1], 10)) * 8 + (parts[3].charCodeAt(0) - 97);
        }
        var hi = 0, lo = 0;
        for(var sq = 0; sq < 64; sq++){
            if (b[sq]) {
                var pIdx = (b[sq] + 6) * 64 + sq;
                hi ^= Z_HI[pIdx];
                lo ^= Z_LO[pIdx];
            }
        }
        if (turn === -1) {
            hi ^= Z_TURN_HI;
            lo ^= Z_TURN_LO;
        }
        hi ^= Z_CAS_HI[castle];
        lo ^= Z_CAS_LO[castle];
        if (ep >= 0) {
            hi ^= Z_EP_HI[ep & 7];
            lo ^= Z_EP_LO[ep & 7];
        }
        return {
            b: b,
            turn: turn,
            castle: castle,
            ep: ep,
            hi: hi,
            lo: lo
        };
    }
    function hashKey(st) {
        return (st.hi >>> 0) * 4294967296 + (st.lo >>> 0);
    }
    function isAttacked(b, sq, bySide) {
        var r = sq >> 3, c = sq & 7;
        var pawn = bySide * P_P;
        var pr = bySide === 1 ? r + 1 : r - 1;
        if (pr >= 0 && pr < 8) {
            if (c > 0 && b[pr * 8 + c - 1] === pawn) return true;
            if (c < 7 && b[pr * 8 + c + 1] === pawn) return true;
        }
        var kn = bySide * P_N;
        var kOff = [
            [
                -2,
                -1
            ],
            [
                -2,
                1
            ],
            [
                -1,
                -2
            ],
            [
                -1,
                2
            ],
            [
                1,
                -2
            ],
            [
                1,
                2
            ],
            [
                2,
                -1
            ],
            [
                2,
                1
            ]
        ];
        for(var i = 0; i < 8; i++){
            var nr = r + kOff[i][0], nc = c + kOff[i][1];
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === kn) return true;
        }
        var kg = bySide * P_K;
        for(var dr = -1; dr <= 1; dr++)for(var dc = -1; dc <= 1; dc++){
            if (!dr && !dc) continue;
            var kr = r + dr, kc = c + dc;
            if (kr >= 0 && kr < 8 && kc >= 0 && kc < 8 && b[kr * 8 + kc] === kg) return true;
        }
        var rk = bySide * P_R, bs = bySide * P_B, qn = bySide * P_Q;
        var dirs = [
            [
                -1,
                0
            ],
            [
                1,
                0
            ],
            [
                0,
                -1
            ],
            [
                0,
                1
            ],
            [
                -1,
                -1
            ],
            [
                -1,
                1
            ],
            [
                1,
                -1
            ],
            [
                1,
                1
            ]
        ];
        for(var d = 0; d < 8; d++){
            var sr = r + dirs[d][0], sc = c + dirs[d][1];
            while(sr >= 0 && sr < 8 && sc >= 0 && sc < 8){
                var p = b[sr * 8 + sc];
                if (p) {
                    if (d < 4 && (p === rk || p === qn)) return true;
                    if (d >= 4 && (p === bs || p === qn)) return true;
                    break;
                }
                sr += dirs[d][0];
                sc += dirs[d][1];
            }
        }
        return false;
    }
    var seeGain = new Int32Array(32);
    var seeSavedSq = new Int32Array(32);
    var seeSavedP = new Int8Array(32);
    function findSmallestAttacker(b, sq, side) {
        var r = sq >> 3, c = sq & 7;
        var pawn = side * P_P;
        var pr = side === 1 ? r + 1 : r - 1;
        if (pr >= 0 && pr < 8) {
            if (c > 0 && b[pr * 8 + c - 1] === pawn) return pr * 8 + c - 1;
            if (c < 7 && b[pr * 8 + c + 1] === pawn) return pr * 8 + c + 1;
        }
        var kn = side * P_N;
        var kOff = [
            [
                -2,
                -1
            ],
            [
                -2,
                1
            ],
            [
                -1,
                -2
            ],
            [
                -1,
                2
            ],
            [
                1,
                -2
            ],
            [
                1,
                2
            ],
            [
                2,
                -1
            ],
            [
                2,
                1
            ]
        ];
        for(var i = 0; i < 8; i++){
            var nr = r + kOff[i][0], nc = c + kOff[i][1];
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === kn) return nr * 8 + nc;
        }
        var bs = side * P_B, rk = side * P_R, qn = side * P_Q;
        var dirs = [
            [
                -1,
                0
            ],
            [
                1,
                0
            ],
            [
                0,
                -1
            ],
            [
                0,
                1
            ],
            [
                -1,
                -1
            ],
            [
                -1,
                1
            ],
            [
                1,
                -1
            ],
            [
                1,
                1
            ]
        ];
        var rookHit = -1, queenHit = -1;
        for(var d = 0; d < 8; d++){
            var sr = r + dirs[d][0], sc = c + dirs[d][1];
            while(sr >= 0 && sr < 8 && sc >= 0 && sc < 8){
                var sIdx = sr * 8 + sc, p = b[sIdx];
                if (p) {
                    if (d >= 4 && p === bs) return sIdx;
                    if (d < 4 && p === rk && rookHit < 0) rookHit = sIdx;
                    if (p === qn && queenHit < 0) queenHit = sIdx;
                    break;
                }
                sr += dirs[d][0];
                sc += dirs[d][1];
            }
        }
        if (rookHit >= 0) return rookHit;
        if (queenHit >= 0) return queenHit;
        var kg = side * P_K;
        for(var dr = -1; dr <= 1; dr++)for(var dc = -1; dc <= 1; dc++){
            if (!dr && !dc) continue;
            var kr = r + dr, kc = c + dc;
            if (kr >= 0 && kr < 8 && kc >= 0 && kc < 8 && b[kr * 8 + kc] === kg) return kr * 8 + kc;
        }
        return -1;
    }
    function fastSee(b, from, to, turn) {
        var origFrom = b[from];
        if (!origFrom) return 0;
        var origTo = b[to];
        var curPiece = Math.abs(origFrom);
        var curSide = turn;
        seeGain[0] = origTo ? SEE_VAL[Math.abs(origTo)] : curPiece === P_P && (from & 7) !== (to & 7) ? 100 : 0;
        b[from] = 0;
        var savedCount = 0;
        var d = 1;
        while(d < 24){
            seeGain[d] = SEE_VAL[curPiece] - seeGain[d - 1];
            curSide = -curSide;
            var atkSq = findSmallestAttacker(b, to, curSide);
            if (atkSq < 0) break;
            curPiece = Math.abs(b[atkSq]);
            seeSavedSq[savedCount] = atkSq;
            seeSavedP[savedCount] = b[atkSq];
            b[atkSq] = 0;
            savedCount++;
            if (curPiece === P_K && isAttacked(b, to, -curSide)) break;
            d++;
        }
        for(var k = savedCount - 1; k >= 0; k--)b[seeSavedSq[k]] = seeSavedP[k];
        b[from] = origFrom;
        while(--d > 0)seeGain[d - 1] = -Math.max(-seeGain[d - 1], seeGain[d]);
        return seeGain[0];
    }
    function applyMove(st, m) {
        var nb = st.b.slice();
        var p = nb[m.from];
        var turn = st.turn;
        var hi = st.hi ^ Z_TURN_HI, lo = st.lo ^ Z_TURN_LO;
        hi ^= Z_CAS_HI[st.castle];
        lo ^= Z_CAS_LO[st.castle];
        if (st.ep >= 0) {
            hi ^= Z_EP_HI[st.ep & 7];
            lo ^= Z_EP_LO[st.ep & 7];
        }
        var fpIdx = (p + 6) * 64 + m.from;
        hi ^= Z_HI[fpIdx];
        lo ^= Z_LO[fpIdx];
        if (nb[m.to]) {
            var tpIdx = (nb[m.to] + 6) * 64 + m.to;
            hi ^= Z_HI[tpIdx];
            lo ^= Z_LO[tpIdx];
        }
        var placed = m.prom ? turn * m.prom : p;
        nb[m.to] = placed;
        nb[m.from] = 0;
        var ppIdx = (placed + 6) * 64 + m.to;
        hi ^= Z_HI[ppIdx];
        lo ^= Z_LO[ppIdx];
        if (m.isEp) {
            var epSq = (m.from >> 3) * 8 + (m.to & 7);
            var epP = nb[epSq];
            var eIdx = (epP + 6) * 64 + epSq;
            hi ^= Z_HI[eIdx];
            lo ^= Z_LO[eIdx];
            nb[epSq] = 0;
        }
        if (m.castle) {
            var rf = 0, rt = 0;
            var rk = turn * P_R;
            if (m.castle === 1) {
                rf = 63;
                rt = 61;
            } else if (m.castle === 2) {
                rf = 56;
                rt = 59;
            } else if (m.castle === 4) {
                rf = 7;
                rt = 5;
            } else {
                rf = 0;
                rt = 3;
            }
            var r1 = (rk + 6) * 64 + rf, r2 = (rk + 6) * 64 + rt;
            hi ^= Z_HI[r1] ^ Z_HI[r2];
            lo ^= Z_LO[r1] ^ Z_LO[r2];
            nb[rt] = rk;
            nb[rf] = 0;
        }
        var nc = st.castle;
        if (m.from === 60) nc &= ~3;
        if (m.from === 4) nc &= ~12;
        if (m.from === 63 || m.to === 63) nc &= ~1;
        if (m.from === 56 || m.to === 56) nc &= ~2;
        if (m.from === 7 || m.to === 7) nc &= ~4;
        if (m.from === 0 || m.to === 0) nc &= ~8;
        hi ^= Z_CAS_HI[nc];
        lo ^= Z_CAS_LO[nc];
        var nep = m.epSet !== undefined ? m.epSet : -1;
        if (nep >= 0) {
            hi ^= Z_EP_HI[nep & 7];
            lo ^= Z_EP_LO[nep & 7];
        }
        return {
            b: nb,
            turn: -turn,
            castle: nc,
            ep: nep,
            hi: hi,
            lo: lo
        };
    }
    function genMoves(st, capturesOnly) {
        var b = st.b, turn = st.turn;
        var moves = [];
        for(var sq = 0; sq < 64; sq++){
            var p = b[sq];
            if (!p || (p > 0 ? 1 : -1) !== turn) continue;
            var r = sq >> 3, c = sq & 7, t = Math.abs(p);
            if (t === P_P) {
                var dir = turn === 1 ? -1 : 1, startR = turn === 1 ? 6 : 1, promR = turn === 1 ? 0 : 7;
                var nr = r + dir;
                if (nr >= 0 && nr < 8) {
                    var f1 = nr * 8 + c;
                    if (!b[f1]) {
                        if (nr === promR) {
                            moves.push({
                                from: sq,
                                to: f1,
                                prom: P_Q,
                                cap: true
                            });
                            if (!capturesOnly) {
                                moves.push({
                                    from: sq,
                                    to: f1,
                                    prom: P_N,
                                    cap: true
                                });
                                moves.push({
                                    from: sq,
                                    to: f1,
                                    prom: P_R,
                                    cap: true
                                });
                                moves.push({
                                    from: sq,
                                    to: f1,
                                    prom: P_B,
                                    cap: true
                                });
                            }
                        } else if (!capturesOnly) {
                            moves.push({
                                from: sq,
                                to: f1
                            });
                            var f2 = (r + dir * 2) * 8 + c;
                            if (r === startR && !b[f2]) moves.push({
                                from: sq,
                                to: f2,
                                epSet: f1
                            });
                        }
                    }
                    for(var ci = -1; ci <= 1; ci += 2){
                        var cc = c + ci;
                        if (cc < 0 || cc > 7) continue;
                        var to = nr * 8 + cc, targ = b[to];
                        if (targ && (targ > 0 ? 1 : -1) !== turn || to === st.ep) {
                            if (nr === promR) {
                                moves.push({
                                    from: sq,
                                    to: to,
                                    prom: P_Q,
                                    isEp: to === st.ep,
                                    cap: true
                                });
                                if (!capturesOnly) moves.push({
                                    from: sq,
                                    to: to,
                                    prom: P_N,
                                    isEp: to === st.ep,
                                    cap: true
                                });
                            } else {
                                moves.push({
                                    from: sq,
                                    to: to,
                                    isEp: to === st.ep,
                                    cap: true
                                });
                            }
                        }
                    }
                }
            } else if (t === P_N || t === P_K) {
                var offs = t === P_N ? [
                    [
                        -2,
                        -1
                    ],
                    [
                        -2,
                        1
                    ],
                    [
                        -1,
                        -2
                    ],
                    [
                        -1,
                        2
                    ],
                    [
                        1,
                        -2
                    ],
                    [
                        1,
                        2
                    ],
                    [
                        2,
                        -1
                    ],
                    [
                        2,
                        1
                    ]
                ] : [
                    [
                        -1,
                        -1
                    ],
                    [
                        -1,
                        0
                    ],
                    [
                        -1,
                        1
                    ],
                    [
                        0,
                        -1
                    ],
                    [
                        0,
                        1
                    ],
                    [
                        1,
                        -1
                    ],
                    [
                        1,
                        0
                    ],
                    [
                        1,
                        1
                    ]
                ];
                for(var i = 0; i < 8; i++){
                    var nr1 = r + offs[i][0], nc = c + offs[i][1];
                    if (nr1 < 0 || nr1 > 7 || nc < 0 || nc > 7) continue;
                    var to1 = nr1 * 8 + nc, targ1 = b[to1];
                    if (!targ1) {
                        if (!capturesOnly) moves.push({
                            from: sq,
                            to: to1
                        });
                    } else if ((targ1 > 0 ? 1 : -1) !== turn) moves.push({
                        from: sq,
                        to: to1,
                        cap: true
                    });
                }
                if (t === P_K && !capturesOnly) {
                    if (turn === 1 && sq === 60 && !isAttacked(b, 60, -1)) {
                        if (st.castle & 1 && !b[61] && !b[62] && !isAttacked(b, 61, -1) && !isAttacked(b, 62, -1)) moves.push({
                            from: 60,
                            to: 62,
                            castle: 1
                        });
                        if (st.castle & 2 && !b[59] && !b[58] && !b[57] && !isAttacked(b, 59, -1) && !isAttacked(b, 58, -1)) moves.push({
                            from: 60,
                            to: 58,
                            castle: 2
                        });
                    } else if (turn === -1 && sq === 4 && !isAttacked(b, 4, 1)) {
                        if (st.castle & 4 && !b[5] && !b[6] && !isAttacked(b, 5, 1) && !isAttacked(b, 6, 1)) moves.push({
                            from: 4,
                            to: 6,
                            castle: 4
                        });
                        if (st.castle & 8 && !b[3] && !b[2] && !b[1] && !isAttacked(b, 3, 1) && !isAttacked(b, 2, 1)) moves.push({
                            from: 4,
                            to: 2,
                            castle: 8
                        });
                    }
                }
            } else {
                var sIdx = t === P_B ? 4 : 0, eIdx = t === P_R ? 4 : 8;
                var dirs = [
                    [
                        -1,
                        0
                    ],
                    [
                        1,
                        0
                    ],
                    [
                        0,
                        -1
                    ],
                    [
                        0,
                        1
                    ],
                    [
                        -1,
                        -1
                    ],
                    [
                        -1,
                        1
                    ],
                    [
                        1,
                        -1
                    ],
                    [
                        1,
                        1
                    ]
                ];
                for(var d = sIdx; d < eIdx; d++){
                    var sr = r + dirs[d][0], sc = c + dirs[d][1];
                    while(sr >= 0 && sr < 8 && sc >= 0 && sc < 8){
                        var to2 = sr * 8 + sc, targ2 = b[to2];
                        if (!targ2) {
                            if (!capturesOnly) moves.push({
                                from: sq,
                                to: to2
                            });
                        } else {
                            if ((targ2 > 0 ? 1 : -1) !== turn) moves.push({
                                from: sq,
                                to: to2,
                                cap: true
                            });
                            break;
                        }
                        sr += dirs[d][0];
                        sc += dirs[d][1];
                    }
                }
            }
        }
        var legal = [], myKing = turn * P_K;
        for(var i1 = 0; i1 < moves.length; i1++){
            var m = moves[i1], ns = applyMove(st, m);
            var kSq = -1;
            for(var q = 0; q < 64; q++)if (ns.b[q] === myKing) {
                kSq = q;
                break;
            }
            if (kSq >= 0 && !isAttacked(ns.b, kSq, -turn)) legal.push(m);
        }
        return legal;
    }
    function evaluate(st) {
        var b = st.b;
        var mg = 0, eg = 0, phase = 0, wb = 0, bb = 0, wKsq = -1, bKsq = -1;
        var wPawnFiles = new Int8Array(8), bPawnFiles = new Int8Array(8);
        for(var sq = 0; sq < 64; sq++){
            var p = b[sq];
            if (!p) continue;
            var t = Math.abs(p);
            if (p > 0) {
                if (t === P_K) wKsq = sq;
                else if (t === P_P) wPawnFiles[sq & 7]++;
                else if (t === P_B) wb++;
                mg += MG_VAL[t] + (MG_PST[t] ? MG_PST[t][sq] : 0);
                eg += EG_VAL[t] + (EG_PST[t] ? EG_PST[t][sq] : 0);
            } else {
                if (t === P_K) bKsq = sq;
                else if (t === P_P) bPawnFiles[sq & 7]++;
                else if (t === P_B) bb++;
                var flip = (7 - (sq >> 3)) * 8 + (sq & 7);
                mg -= MG_VAL[t] + (MG_PST[t] ? MG_PST[t][flip] : 0);
                eg -= EG_VAL[t] + (EG_PST[t] ? EG_PST[t][flip] : 0);
            }
            phase += PHASE_W[t];
        }
        if (wb >= 2) {
            mg += 35;
            eg += 52;
        }
        if (bb >= 2) {
            mg -= 35;
            eg -= 52;
        }
        for(var sq1 = 0; sq1 < 64; sq1++){
            var p1 = b[sq1];
            if (!p1) continue;
            var t1 = Math.abs(p1), r = sq1 >> 3, f = sq1 & 7;
            if (t1 === P_P) {
                if (p1 > 0) {
                    if (wPawnFiles[f] > 1) {
                        mg -= 10;
                        eg -= 14;
                    }
                    if ((f === 0 || !wPawnFiles[f - 1]) && (f === 7 || !wPawnFiles[f + 1])) {
                        mg -= 12;
                        eg -= 14;
                    }
                } else {
                    if (bPawnFiles[f] > 1) {
                        mg += 10;
                        eg += 14;
                    }
                    if ((f === 0 || !bPawnFiles[f - 1]) && (f === 7 || !bPawnFiles[f + 1])) {
                        mg += 12;
                        eg += 14;
                    }
                }
            } else if (t1 === P_R) {
                if (p1 > 0 && !wPawnFiles[f]) {
                    var bn = !bPawnFiles[f] ? 24 : 13;
                    mg += bn;
                    eg += bn - 4;
                }
                if (p1 < 0 && !bPawnFiles[f]) {
                    var bn1 = !wPawnFiles[f] ? 24 : 13;
                    mg -= bn1;
                    eg -= bn1 - 4;
                }
            }
        }
        if (phase <= 6 && wKsq >= 0 && bKsq >= 0) {
            var kDist = Math.abs((wKsq >> 3) - (bKsq >> 3)) + Math.abs((wKsq & 7) - (bKsq & 7));
            if (eg >= 180) eg += Math.round(Math.max(Math.abs((bKsq >> 3) - 3.5), Math.abs((bKsq & 7) - 3.5)) * 10 + (14 - kDist) * 5);
            else if (eg <= -180) eg -= Math.round(Math.max(Math.abs((wKsq >> 3) - 3.5), Math.abs((wKsq & 7) - 3.5)) * 10 + (14 - kDist) * 5);
        }
        var mgPhase = Math.min(24, phase), egPhase = 24 - mgPhase;
        var tapered = Math.round((mg * mgPhase + eg * egPhase) / 24);
        return st.turn * (tapered + (st.turn === 1 ? 10 : -10));
    }
    function toUci(m) {
        return String.fromCharCode(97 + (m.from & 7)) + (8 - (m.from >> 3)) + String.fromCharCode(97 + (m.to & 7)) + (8 - (m.to >> 3)) + (m.prom ? PROM_CHARS[m.prom] : '');
    }
    var tt = new Map();
    var killers = [];
    var history = new Int32Array(2 * 64 * 64);
    var repHistorySet = new Set();
    var startTime = 0, timeLimit = 1200, aborted = false, nodes = 0;
    function uciToMoveObj(st, uci) {
        if (!uci || uci.length < 4) return null;
        var from = (8 - parseInt(uci[1], 10)) * 8 + (uci.charCodeAt(0) - 97);
        var to = (8 - parseInt(uci[3], 10)) * 8 + (uci.charCodeAt(2) - 97);
        var promChar = uci[4] || '';
        var prom = promChar === 'q' ? P_Q : promChar === 'r' ? P_R : promChar === 'b' ? P_B : promChar === 'n' ? P_N : 0;
        var moves = genMoves(st, false);
        return moves.find(function(m) {
            return m.from === from && m.to === to && (m.prom || 0) === prom;
        }) || null;
    }
    function scoreMoveForOrder(st, m, ttMove, ply) {
        if (ttMove && m.from === ttMove.from && m.to === ttMove.to && m.prom === ttMove.prom) return 2000000;
        var s = 0;
        if (m.prom) s += 1500000 + m.prom * 1000;
        if (st.b[m.to] || m.isEp) {
            var see = fastSee(st.b, m.from, m.to, st.turn);
            return s + (see >= 0 ? 1000000 : 100000) + see * 10 + (st.b[m.to] ? SEE_VAL[Math.abs(st.b[m.to])] : 100);
        }
        var kl = killers[ply];
        if (kl) {
            if (kl[0] && kl[0].from === m.from && kl[0].to === m.to) return 900000;
            if (kl[1] && kl[1].from === m.from && kl[1].to === m.to) return 850000;
        }
        if (m.castle) return 700000;
        return history[(st.turn === 1 ? 0 : 4096) + (m.from << 6) + m.to];
    }
    function orderMoves(st, moves, ttMove, ply) {
        for(var i = 0; i < moves.length; i++)moves[i]._ord = scoreMoveForOrder(st, moves[i], ttMove, ply);
        moves.sort(function(a, b) {
            return (b._ord || 0) - (a._ord || 0);
        });
    }
    function hasNonPawnMaterial(b, turn) {
        for(var i = 0; i < 64; i++){
            var p = b[i];
            if (p && (p > 0 ? 1 : -1) === turn) {
                var t = Math.abs(p);
                if (t >= P_N && t <= P_Q) return true;
            }
        }
        return false;
    }
    function quiesce(st, alpha, beta, ply) {
        nodes++;
        if ((nodes & 2047) === 0 && performance.now() - startTime > timeLimit) {
            aborted = true;
            return alpha;
        }
        var myK = st.turn * P_K;
        var kSq = -1;
        for(var i = 0; i < 64; i++)if (st.b[i] === myK) {
            kSq = i;
            break;
        }
        var inChk = kSq >= 0 && isAttacked(st.b, kSq, -st.turn);
        var stand = 0;
        if (!inChk) {
            stand = evaluate(st);
            if (stand >= beta) return beta;
            if (stand > alpha) alpha = stand;
        }
        if (ply >= 24) return inChk ? evaluate(st) : stand;
        var moves = genMoves(st, !inChk);
        if (!moves.length) return inChk ? -30000 + ply : stand;
        orderMoves(st, moves, null, ply);
        for(var i1 = 0; i1 < moves.length; i1++){
            var m = moves[i1];
            if (!inChk && !m.prom) {
                var capVal = m.isEp ? 100 : st.b[m.to] ? SEE_VAL[Math.abs(st.b[m.to])] : 0;
                if (stand + capVal + 200 < alpha) continue;
                if (fastSee(st.b, m.from, m.to, st.turn) < -20) continue;
            }
            var val = -quiesce(applyMove(st, m), -beta, -alpha, ply + 1);
            if (aborted) return alpha;
            if (val >= beta) return beta;
            if (val > alpha) alpha = val;
        }
        return alpha;
    }
    function negamax(st, depth, alpha, beta, ply, allowNull) {
        nodes++;
        if ((nodes & 2047) === 0 && performance.now() - startTime > timeLimit) {
            aborted = true;
            return alpha;
        }
        var key = hashKey(st);
        if (ply > 0 && repHistorySet.has(key)) return 0;
        var myK = st.turn * P_K;
        var kSq = -1;
        for(var i = 0; i < 64; i++)if (st.b[i] === myK) {
            kSq = i;
            break;
        }
        var inChk = kSq >= 0 && isAttacked(st.b, kSq, -st.turn);
        if (inChk && ply < 16) depth++;
        if (depth <= 0) return quiesce(st, alpha, beta, ply);
        var origAlpha = alpha;
        var entry = tt.get(key);
        if (entry && entry.depth >= depth && ply > 0) {
            if (entry.flag === 0) return entry.val;
            if (entry.flag === 1 && entry.val > alpha) alpha = entry.val;
            else if (entry.flag === 2 && entry.val < beta) beta = entry.val;
            if (alpha >= beta) return entry.val;
        }
        if (allowNull && !inChk && depth >= 3 && ply > 0 && hasNonPawnMaterial(st.b, st.turn)) {
            var R = depth >= 6 ? 3 : 2;
            var nhi = st.hi ^ Z_TURN_HI, nlo = st.lo ^ Z_TURN_LO;
            if (st.ep >= 0) {
                nhi ^= Z_EP_HI[st.ep & 7];
                nlo ^= Z_EP_LO[st.ep & 7];
            }
            var nullScore = -negamax({
                b: st.b,
                turn: -st.turn,
                castle: st.castle,
                ep: -1,
                hi: nhi,
                lo: nlo
            }, depth - 1 - R, -beta, -beta + 1, ply + 1, false);
            if (aborted) return alpha;
            if (nullScore >= beta) return beta;
        }
        var moves = genMoves(st, false);
        if (!moves.length) return inChk ? -30000 + ply : 0;
        orderMoves(st, moves, entry ? entry.best : null, ply);
        var best = -999999, bestMove = moves[0];
        var enemyKing = -st.turn * P_K;
        for(var i1 = 0; i1 < moves.length; i1++){
            var m = moves[i1], ns = applyMove(st, m);
            var givesCheck = false;
            for(var q = 0; q < 64; q++)if (ns.b[q] === enemyKing) {
                givesCheck = isAttacked(ns.b, q, st.turn);
                break;
            }
            var score = void 0;
            var isQuiet = !st.b[m.to] && !m.isEp && !m.prom;
            if (i1 === 0) score = -negamax(ns, depth - 1, -beta, -alpha, ply + 1, true);
            else {
                var red = 0;
                if (depth >= 3 && i1 >= 4 && isQuiet && !inChk && !givesCheck) red = i1 >= 10 && depth >= 6 ? 2 : 1;
                score = -negamax(ns, depth - 1 - red, -alpha - 1, -alpha, ply + 1, true);
                if (!aborted && red > 0 && score > alpha) score = -negamax(ns, depth - 1, -alpha - 1, -alpha, ply + 1, true);
                if (!aborted && score > alpha && score < beta) score = -negamax(ns, depth - 1, -beta, -alpha, ply + 1, true);
            }
            if (aborted) return best === -999999 ? alpha : best;
            if (score > best) {
                best = score;
                bestMove = m;
            }
            if (score > alpha) alpha = score;
            if (alpha >= beta) {
                if (isQuiet) {
                    if (!killers[ply]) killers[ply] = [
                        null,
                        null
                    ];
                    if (!killers[ply][0] || killers[ply][0].from !== m.from || killers[ply][0].to !== m.to) {
                        killers[ply][1] = killers[ply][0];
                        killers[ply][0] = m;
                    }
                    var hIdx = (st.turn === 1 ? 0 : 4096) + (m.from << 6) + m.to;
                    history[hIdx] = Math.min(400000, history[hIdx] + depth * depth);
                }
                break;
            }
        }
        var flag = best <= origAlpha ? 2 : best >= beta ? 1 : 0;
        if (tt.size > 180000) tt.clear();
        tt.set(key, {
            depth: depth,
            val: best,
            flag: flag,
            best: bestMove
        });
        return best;
    }
    function findBestMove(fen, maxDepth, budgetMs, skill, priorHashes) {
        var _loop = function(d) {
            timeLimit = d <= 3 ? Math.max(budgetMs, 1600) : Math.max(budgetMs, 350);
            aborted = false;
            orderMoves(st, moves, bestMove, 0);
            var alpha = d >= 4 ? bestScore - 55 : -999999;
            var beta = d >= 4 ? bestScore + 55 : 999999;
            var runRoot = function runRoot(a, b) {
                var locBest = moves[0], locScore = -999999;
                for(var i = 0; i < moves.length; i++){
                    var ns = applyMove(st, moves[i]);
                    var scKey = hashKey(ns);
                    var sc = void 0;
                    if (repHistorySet.has(scKey)) sc = 0;
                    else if (i === 0) sc = -negamax(ns, d - 1, -b, -a, 1, true);
                    else {
                        sc = -negamax(ns, d - 1, -a - 1, -a, 1, true);
                        if (!aborted && sc > a && sc < b) sc = -negamax(ns, d - 1, -b, -a, 1, true);
                    }
                    if (aborted) return null;
                    if (sc > locScore) {
                        locScore = sc;
                        locBest = moves[i];
                    }
                    if (sc > a) a = sc;
                }
                return {
                    locBest: locBest,
                    locScore: locScore
                };
            };
            var res = runRoot(alpha, beta);
            if (res && (res.locScore <= alpha || res.locScore >= beta) && !aborted) res = runRoot(-999999, 999999);
            if (!res || aborted) return "break";
            bestMove = res.locBest;
            bestScore = res.locScore;
            completedDepth = d;
            if (Math.abs(bestScore) >= 29000 || d >= 4 && performance.now() - startTime > Math.max(budgetMs, 350) * 0.7) return "break";
        };
        if (maxDepth === void 0) maxDepth = 10;
        if (budgetMs === void 0) budgetMs = 1400;
        if (skill === void 0) skill = 20;
        if (priorHashes === void 0) priorHashes = null;
        var st = parseFen(fen);
        var moves = genMoves(st, false);
        if (!moves.length) return {
            bestUci: '(none)',
            scoreCp: 0,
            depth: 0
        };
        repHistorySet = new Set(priorHashes || []);
        var bookKey = fen.split(' ').slice(0, 4).join(' ');
        if (OPENING_BOOK[bookKey]) {
            var cands = OPENING_BOOK[bookKey];
            var pick = cands[Math.floor(Math.random() * cands.length)];
            if (moves.some(function(m) {
                return toUci(m) === pick;
            })) return {
                bestUci: pick,
                scoreCp: 25,
                depth: 12
            };
        }
        startTime = performance.now();
        timeLimit = Math.max(budgetMs, 350);
        aborted = false;
        nodes = 0;
        killers = [];
        var effectiveMaxDepth = skill <= 14 ? Math.min(maxDepth, 6) : skill <= 18 ? Math.min(maxDepth, 8) : maxDepth;
        var bestMove = moves[0], bestScore = 0, completedDepth = 0;
        for(var d = 1; d <= effectiveMaxDepth; d++){
            var _ret = _loop(d);
            if (_ret === "break") break;
        }
        return {
            bestUci: toUci(bestMove),
            scoreCp: bestScore,
            depth: completedDepth
        };
    }
    function analyzePositionMove(fenBefore, playedUci, searchDepth, budgetMs) {
        if (searchDepth === void 0) searchDepth = 4;
        if (budgetMs === void 0) budgetMs = 280;
        var st = parseFen(fenBefore);
        var moves = genMoves(st, false);
        if (!moves.length) return {
            bestUci: '',
            bestMoverCp: 0,
            secondBestMoverCp: 0,
            playedMoverCp: 0,
            numLegalMoves: 0,
            isSacrificeOffer: false
        };
        var playedMoveObj = moves.find(function(m) {
            return toUci(m) === playedUci;
        }) || moves[0];
        var playedSt = applyMove(st, playedMoveObj);
        var movedPieceVal = SEE_VAL[Math.abs(st.b[playedMoveObj.from])];
        var capVal = playedMoveObj.isEp ? 100 : st.b[playedMoveObj.to] ? SEE_VAL[Math.abs(st.b[playedMoveObj.to])] : 0;
        var isSacrificeOffer = movedPieceVal >= 320 && movedPieceVal > capVal + 135 && isAttacked(playedSt.b, playedMoveObj.to, -st.turn);
        startTime = performance.now();
        timeLimit = Math.max(budgetMs, 150);
        aborted = false;
        nodes = 0;
        killers = [];
        var targetDepth = Math.max(2, searchDepth);
        var bestMoveObj = playedMoveObj, bestUci = toUci(playedMoveObj);
        var bestMoverCp = 0, secondBestMoverCp = 0, playedMoverCp = 0;
        for(var d = 2; d <= targetDepth; d++){
            var childDepth = d - 1;
            timeLimit = d === 2 ? Math.max(budgetMs, 1800) : Math.max(budgetMs, 150);
            aborted = false;
            orderMoves(st, moves, d === 2 ? null : bestMoveObj, 0);
            var curPlayedCp = -negamax(playedSt, childDepth, -999999, 999999, 1, true);
            if (d > 2 && aborted) break;
            var curBestCp = -999999, curSecondCp = -999999, curBestObj = moves[0], curBestUci = toUci(moves[0]), depthComplete = true;
            for(var i = 0; i < moves.length; i++){
                var m = moves[i], uci = toUci(m);
                var sc = void 0;
                if (uci === playedUci) sc = curPlayedCp;
                else {
                    var floor = curBestCp >= 20000 ? 280 : Math.max(-35000, curBestCp - 650);
                    sc = -negamax(applyMove(st, m), childDepth, -999999, -floor, 1, true);
                    if (d > 2 && aborted) {
                        depthComplete = false;
                        break;
                    }
                }
                if (sc > curBestCp) {
                    curSecondCp = curBestCp;
                    curBestCp = sc;
                    curBestObj = m;
                    curBestUci = uci;
                } else if (uci !== curBestUci && sc > curSecondCp) curSecondCp = sc;
            }
            if (!depthComplete) break;
            if (curSecondCp === -999999) curSecondCp = curBestCp;
            bestMoveObj = curBestObj;
            bestUci = curBestUci;
            bestMoverCp = curBestCp;
            secondBestMoverCp = curSecondCp;
            playedMoverCp = curPlayedCp;
            if (performance.now() - startTime > Math.max(budgetMs, 150) * 0.55) break;
        }
        return {
            bestUci: bestUci,
            bestMoverCp: bestMoverCp,
            secondBestMoverCp: secondBestMoverCp,
            playedMoverCp: playedMoverCp,
            numLegalMoves: moves.length,
            isSacrificeOffer: isSacrificeOffer
        };
    }
    return {
        findBestMove: findBestMove,
        analyzePositionMove: analyzePositionMove,
        parseFen: parseFen,
        applyMove: applyMove,
        hashKey: hashKey,
        uciToMoveObj: uciToMoveObj
    };
}
function cpToWinPercent(cp) {
    if (cp >= 20000) return 100.0;
    if (cp <= -20000) return 0.0;
    var clamped = Math.max(-1500, Math.min(1500, cp));
    return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clamped)) - 1);
}
function classifyChessMove(analysis, playedUci, isCheckmateAfter) {
    var bestUci = analysis.bestUci, bestMoverCp = analysis.bestMoverCp, secondBestMoverCp = analysis.secondBestMoverCp, playedMoverCp = analysis.playedMoverCp, numLegalMoves = analysis.numLegalMoves, isSacrificeOffer = analysis.isSacrificeOffer;
    var cpLoss = Math.max(0, bestMoverCp - playedMoverCp);
    var winBefore = cpToWinPercent(bestMoverCp);
    var winAfter = cpToWinPercent(playedMoverCp);
    var winLoss = Math.max(0, winBefore - winAfter);
    var uniquenessGap = bestMoverCp - secondBestMoverCp;
    if (isCheckmateAfter) return {
        tag: 'best',
        badge: '★',
        icon: '⭐',
        label: 'Best',
        color: '#2ecc71',
        cpLoss: 0,
        winLoss: 0
    };
    if (bestMoverCp > -20000 && playedMoverCp <= -20000) return {
        tag: 'blunder',
        badge: '??',
        icon: '💥',
        label: 'Blunder',
        color: '#e74c3c',
        cpLoss: cpLoss,
        winLoss: winLoss
    };
    if (bestMoverCp >= 20000 && playedMoverCp < 250) return {
        tag: 'blunder',
        badge: '??',
        icon: '💥',
        label: 'Blunder',
        color: '#e74c3c',
        cpLoss: cpLoss,
        winLoss: winLoss
    };
    if (winLoss >= 20.0 || cpLoss >= 290 && bestMoverCp > -600 && playedMoverCp < 650 || cpLoss >= 480 && bestMoverCp > -700) {
        return {
            tag: 'blunder',
            badge: '??',
            icon: '💥',
            label: 'Blunder',
            color: '#e74c3c',
            cpLoss: cpLoss,
            winLoss: winLoss
        };
    }
    if (bestMoverCp >= 20000 && playedMoverCp < 20000 || winLoss >= 10.0 || cpLoss >= 145 && bestMoverCp > -600 && playedMoverCp < 750) {
        return {
            tag: 'mistake',
            badge: '?',
            icon: '❓',
            label: 'Mistake',
            color: '#e67e22',
            cpLoss: cpLoss,
            winLoss: winLoss
        };
    }
    if (winLoss >= 4.5 || cpLoss >= 70 && bestMoverCp > -600 && playedMoverCp < 750) {
        return {
            tag: 'inaccuracy',
            badge: '?!',
            icon: '⚠️',
            label: 'Inaccuracy',
            color: '#f1c40f',
            cpLoss: cpLoss,
            winLoss: winLoss
        };
    }
    if (isSacrificeOffer && winLoss <= 2.2 && cpLoss <= 25 && playedMoverCp >= -40 && (bestMoverCp < 750 || secondBestMoverCp < 300)) {
        return {
            tag: 'brilliant',
            badge: '!!',
            icon: '💎',
            label: 'Brilliant',
            color: '#1abc9c',
            cpLoss: cpLoss,
            winLoss: winLoss
        };
    }
    if (numLegalMoves >= 3 && winLoss <= 1.8 && cpLoss <= 15 && (uniquenessGap >= 135 || winBefore - cpToWinPercent(secondBestMoverCp) >= 12.0)) {
        return {
            tag: 'great',
            badge: '!',
            icon: '❗',
            label: 'Great',
            color: '#3498db',
            cpLoss: cpLoss,
            winLoss: winLoss
        };
    }
    if (playedUci === bestUci || bestMoverCp >= 20000 && playedMoverCp >= 20000 || cpLoss <= 8 && winLoss <= 0.8) {
        return {
            tag: 'best',
            badge: '★',
            icon: '⭐',
            label: 'Best',
            color: '#2ecc71',
            cpLoss: cpLoss,
            winLoss: winLoss
        };
    }
    return {
        tag: 'good',
        badge: '✓',
        icon: '👍',
        label: 'Good',
        color: '#84fab0',
        cpLoss: cpLoss,
        winLoss: winLoss
    };
}

});
// === MODULE: src/games/stockfish-chess/ChessFallback ===
ArcadeMod.define("src/games/stockfish-chess/ChessFallback", function(require, module, exports) {
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
    get FallbackChess () {
        return FallbackChess;
    },
    get createChessInstance () {
        return createChessInstance;
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
var FallbackChess = /*#__PURE__*/ function() {
    "use strict";
    function FallbackChess() {
        this.b = [];
        this._turn = 'w';
        this.castle = 'KQkq';
        this.ep = -1;
        this.half = 0;
        this.full = 1;
        this._hist = [];
        this.reset();
    }
    var _proto = FallbackChess.prototype;
    _proto.reset = function reset() {
        this.b = [
            'r',
            'n',
            'b',
            'q',
            'k',
            'b',
            'n',
            'r',
            'p',
            'p',
            'p',
            'p',
            'p',
            'p',
            'p',
            'p',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            'P',
            'P',
            'P',
            'P',
            'P',
            'P',
            'P',
            'P',
            'R',
            'N',
            'B',
            'Q',
            'K',
            'B',
            'N',
            'R'
        ];
        this._turn = 'w';
        this.castle = 'KQkq';
        this.ep = -1;
        this.half = 0;
        this.full = 1;
        this._hist = [];
    };
    _proto.load = function load(fenStr) {
        var parts = (fenStr || '').trim().split(/\s+/);
        var rows = (parts[0] || '').split('/');
        if (rows.length !== 8) return false;
        var nb = new Array(64).fill(null);
        for(var r = 0; r < 8; r++){
            var c = 0;
            for(var i = 0; i < rows[r].length; i++){
                var ch = rows[r][i];
                if (ch >= '1' && ch <= '8') c += parseInt(ch, 10);
                else {
                    nb[r * 8 + c] = ch;
                    c++;
                }
            }
        }
        this.b = nb;
        this._turn = parts[1] === 'b' ? 'b' : 'w';
        this.castle = !parts[2] || parts[2] === '-' ? '' : parts[2];
        this.ep = parts[3] && parts[3] !== '-' ? this.sqToIdx(parts[3]) : -1;
        this.half = parseInt(parts[4] || '0', 10) || 0;
        this.full = parseInt(parts[5] || '1', 10) || 1;
        this._hist = [];
        return true;
    };
    _proto.turn = function turn() {
        return this._turn;
    };
    _proto.sqToIdx = function sqToIdx(sq) {
        if (!sq || sq.length < 2) return -1;
        var f = sq.charCodeAt(0) - 97;
        var r = 8 - parseInt(sq[1], 10);
        return r >= 0 && r < 8 && f >= 0 && f < 8 ? r * 8 + f : -1;
    };
    _proto.idxToSq = function idxToSq(i) {
        return String.fromCharCode(97 + (i & 7)) + (8 - (i >> 3));
    };
    _proto.isW = function isW(p) {
        return !!p && p === p.toUpperCase();
    };
    _proto.get = function get(sq) {
        var i = this.sqToIdx(sq);
        if (i < 0 || !this.b[i]) return null;
        var p = this.b[i];
        return {
            type: p.toLowerCase(),
            color: this.isW(p) ? 'w' : 'b'
        };
    };
    _proto.board = function board() {
        var out = [];
        for(var r = 0; r < 8; r++){
            var row = [];
            for(var c = 0; c < 8; c++){
                var p = this.b[r * 8 + c];
                row.push(p ? {
                    type: p.toLowerCase(),
                    color: this.isW(p) ? 'w' : 'b'
                } : null);
            }
            out.push(row);
        }
        return out;
    };
    _proto.fen = function fen() {
        var rows = [];
        for(var r = 0; r < 8; r++){
            var s = '';
            var empty = 0;
            for(var c = 0; c < 8; c++){
                var p = this.b[r * 8 + c];
                if (!p) empty++;
                else {
                    if (empty) {
                        s += empty;
                        empty = 0;
                    }
                    s += p;
                }
            }
            if (empty) s += empty;
            rows.push(s);
        }
        var epStr = this.ep >= 0 ? this.idxToSq(this.ep) : '-';
        return rows.join('/') + " " + this._turn + " " + (this.castle || '-') + " " + epStr + " " + this.half + " " + this.full;
    };
    _proto.attacked = function attacked(b, sq, byW) {
        var r = sq >> 3;
        var c = sq & 7;
        var pr = byW ? r + 1 : r - 1;
        if (pr >= 0 && pr < 8) {
            var pawn = byW ? 'P' : 'p';
            if (c > 0 && b[pr * 8 + c - 1] === pawn) return true;
            if (c < 7 && b[pr * 8 + c + 1] === pawn) return true;
        }
        var kn = byW ? 'N' : 'n';
        for(var _i = 0, _iter = [
            [
                -2,
                -1
            ],
            [
                -2,
                1
            ],
            [
                -1,
                -2
            ],
            [
                -1,
                2
            ],
            [
                1,
                -2
            ],
            [
                1,
                2
            ],
            [
                2,
                -1
            ],
            [
                2,
                1
            ]
        ]; _i < _iter.length; _i++){
            var _iter__i = _iter[_i], dr = _iter__i[0], dc = _iter__i[1];
            var nr = r + dr;
            var nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === kn) return true;
        }
        var kg = byW ? 'K' : 'k';
        for(var dr1 = -1; dr1 <= 1; dr1++){
            for(var dc1 = -1; dc1 <= 1; dc1++){
                if (!dr1 && !dc1) continue;
                var kr = r + dr1;
                var kc = c + dc1;
                if (kr >= 0 && kr < 8 && kc >= 0 && kc < 8 && b[kr * 8 + kc] === kg) return true;
            }
        }
        var rk = byW ? 'R' : 'r';
        var qn = byW ? 'Q' : 'q';
        var bs = byW ? 'B' : 'b';
        var dirs = [
            [
                -1,
                0
            ],
            [
                1,
                0
            ],
            [
                0,
                -1
            ],
            [
                0,
                1
            ],
            [
                -1,
                -1
            ],
            [
                -1,
                1
            ],
            [
                1,
                -1
            ],
            [
                1,
                1
            ]
        ];
        for(var d = 0; d < 8; d++){
            var sr = r + dirs[d][0];
            var sc = c + dirs[d][1];
            while(sr >= 0 && sr < 8 && sc >= 0 && sc < 8){
                var p = b[sr * 8 + sc];
                if (p) {
                    if (d < 4 && (p === rk || p === qn)) return true;
                    if (d >= 4 && (p === bs || p === qn)) return true;
                    break;
                }
                sr += dirs[d][0];
                sc += dirs[d][1];
            }
        }
        return false;
    };
    _proto.genLegal = function genLegal(onlySq) {
        if (onlySq === void 0) onlySq = -1;
        var wTurn = this._turn === 'w';
        var raw = [];
        for(var sq = 0; sq < 64; sq++){
            if (onlySq >= 0 && sq !== onlySq) continue;
            var p = this.b[sq];
            if (!p || this.isW(p) !== wTurn) continue;
            var r = sq >> 3;
            var c = sq & 7;
            var t = p.toLowerCase();
            if (t === 'p') {
                var dir = wTurn ? -1 : 1;
                var startR = wTurn ? 6 : 1;
                var promR = wTurn ? 0 : 7;
                var f1 = (r + dir) * 8 + c;
                if (r + dir >= 0 && r + dir < 8 && !this.b[f1]) {
                    if (r + dir === promR) {
                        for(var _i = 0, _iter = [
                            'q',
                            'r',
                            'b',
                            'n'
                        ]; _i < _iter.length; _i++){
                            var pr = _iter[_i];
                            raw.push({
                                from: sq,
                                to: f1,
                                prom: pr
                            });
                        }
                    } else {
                        raw.push({
                            from: sq,
                            to: f1
                        });
                        var f2 = (r + dir * 2) * 8 + c;
                        if (r === startR && !this.b[f2]) raw.push({
                            from: sq,
                            to: f2,
                            epSet: f1
                        });
                    }
                }
                for(var _i1 = 0, _iter1 = [
                    -1,
                    1
                ]; _i1 < _iter1.length; _i1++){
                    var dc = _iter1[_i1];
                    var cc = c + dc;
                    if (cc < 0 || cc > 7) continue;
                    var to = (r + dir) * 8 + cc;
                    var target = this.b[to];
                    if (target && this.isW(target) !== wTurn || to === this.ep) {
                        if (r + dir === promR) {
                            for(var _i2 = 0, _iter2 = [
                                'q',
                                'r',
                                'b',
                                'n'
                            ]; _i2 < _iter2.length; _i2++){
                                var pr1 = _iter2[_i2];
                                raw.push({
                                    from: sq,
                                    to: to,
                                    prom: pr1,
                                    isEp: to === this.ep
                                });
                            }
                        } else {
                            raw.push({
                                from: sq,
                                to: to,
                                isEp: to === this.ep
                            });
                        }
                    }
                }
            } else if (t === 'n' || t === 'k') {
                var offs = t === 'n' ? [
                    [
                        -2,
                        -1
                    ],
                    [
                        -2,
                        1
                    ],
                    [
                        -1,
                        -2
                    ],
                    [
                        -1,
                        2
                    ],
                    [
                        1,
                        -2
                    ],
                    [
                        1,
                        2
                    ],
                    [
                        2,
                        -1
                    ],
                    [
                        2,
                        1
                    ]
                ] : [
                    [
                        -1,
                        -1
                    ],
                    [
                        -1,
                        0
                    ],
                    [
                        -1,
                        1
                    ],
                    [
                        0,
                        -1
                    ],
                    [
                        0,
                        1
                    ],
                    [
                        1,
                        -1
                    ],
                    [
                        1,
                        0
                    ],
                    [
                        1,
                        1
                    ]
                ];
                for(var _iterator = _create_for_of_iterator_helper_loose(offs), _step; !(_step = _iterator()).done;){
                    var _step_value = _step.value, dr = _step_value[0], dc1 = _step_value[1];
                    var nr = r + dr;
                    var nc = c + dc1;
                    if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
                    var to1 = nr * 8 + nc;
                    if (!this.b[to1] || this.isW(this.b[to1]) !== wTurn) raw.push({
                        from: sq,
                        to: to1
                    });
                }
                if (t === 'k') {
                    if (wTurn && sq === 60 && !this.attacked(this.b, 60, false)) {
                        if (this.castle.includes('K') && !this.b[61] && !this.b[62] && !this.attacked(this.b, 61, false) && !this.attacked(this.b, 62, false)) raw.push({
                            from: 60,
                            to: 62,
                            castle: 'K'
                        });
                        if (this.castle.includes('Q') && !this.b[59] && !this.b[58] && !this.b[57] && !this.attacked(this.b, 59, false) && !this.attacked(this.b, 58, false)) raw.push({
                            from: 60,
                            to: 58,
                            castle: 'Q'
                        });
                    } else if (!wTurn && sq === 4 && !this.attacked(this.b, 4, true)) {
                        if (this.castle.includes('k') && !this.b[5] && !this.b[6] && !this.attacked(this.b, 5, true) && !this.attacked(this.b, 6, true)) raw.push({
                            from: 4,
                            to: 6,
                            castle: 'k'
                        });
                        if (this.castle.includes('q') && !this.b[3] && !this.b[2] && !this.b[1] && !this.attacked(this.b, 3, true) && !this.attacked(this.b, 2, true)) raw.push({
                            from: 4,
                            to: 2,
                            castle: 'q'
                        });
                    }
                }
            } else {
                var rays = t === 'r' ? [
                    [
                        -1,
                        0
                    ],
                    [
                        1,
                        0
                    ],
                    [
                        0,
                        -1
                    ],
                    [
                        0,
                        1
                    ]
                ] : t === 'b' ? [
                    [
                        -1,
                        -1
                    ],
                    [
                        -1,
                        1
                    ],
                    [
                        1,
                        -1
                    ],
                    [
                        1,
                        1
                    ]
                ] : [
                    [
                        -1,
                        0
                    ],
                    [
                        1,
                        0
                    ],
                    [
                        0,
                        -1
                    ],
                    [
                        0,
                        1
                    ],
                    [
                        -1,
                        -1
                    ],
                    [
                        -1,
                        1
                    ],
                    [
                        1,
                        -1
                    ],
                    [
                        1,
                        1
                    ]
                ];
                for(var _iterator1 = _create_for_of_iterator_helper_loose(rays), _step1; !(_step1 = _iterator1()).done;){
                    var _step_value1 = _step1.value, dr1 = _step_value1[0], dc2 = _step_value1[1];
                    var sr = r + dr1;
                    var sc = c + dc2;
                    while(sr >= 0 && sr < 8 && sc >= 0 && sc < 8){
                        var to2 = sr * 8 + sc;
                        if (!this.b[to2]) raw.push({
                            from: sq,
                            to: to2
                        });
                        else {
                            if (this.isW(this.b[to2]) !== wTurn) raw.push({
                                from: sq,
                                to: to2
                            });
                            break;
                        }
                        sr += dr1;
                        sc += dc2;
                    }
                }
            }
        }
        var legal = [];
        var myK = wTurn ? 'K' : 'k';
        for(var _iterator2 = _create_for_of_iterator_helper_loose(raw), _step2; !(_step2 = _iterator2()).done;){
            var m = _step2.value;
            var nb = this.b.slice();
            var p1 = nb[m.from];
            nb[m.to] = m.prom ? wTurn ? m.prom.toUpperCase() : m.prom : p1;
            nb[m.from] = null;
            if (m.isEp) nb[(m.from >> 3) * 8 + (m.to & 7)] = null;
            if (m.castle === 'K') {
                nb[61] = 'R';
                nb[63] = null;
            } else if (m.castle === 'Q') {
                nb[59] = 'R';
                nb[56] = null;
            } else if (m.castle === 'k') {
                nb[5] = 'r';
                nb[7] = null;
            } else if (m.castle === 'q') {
                nb[3] = 'r';
                nb[0] = null;
            }
            var kSq = nb.indexOf(myK);
            if (kSq >= 0 && !this.attacked(nb, kSq, !wTurn)) legal.push(m);
        }
        return legal;
    };
    _proto.moves = function moves(opts) {
        var _this = this;
        if (opts === void 0) opts = {};
        var idx = opts.square ? this.sqToIdx(opts.square) : -1;
        return this.genLegal(idx).map(function(m) {
            var cap = m.isEp ? 'p' : _this.b[m.to] ? _this.b[m.to].toLowerCase() : undefined;
            return {
                from: _this.idxToSq(m.from),
                to: _this.idxToSq(m.to),
                captured: cap,
                promotion: m.prom
            };
        });
    };
    _proto.move = function move(arg) {
        var from = arg.from;
        var to = arg.to;
        var promotion = arg.promotion || 'q';
        var f = this.sqToIdx(from);
        var t = this.sqToIdx(to);
        var legal = this.genLegal(f);
        var m = legal.find(function(x) {
            return x.to === t && (!x.prom || x.prom === promotion);
        });
        if (!m) return null;
        var cap = m.isEp ? 'p' : this.b[t] ? this.b[t].toLowerCase() : undefined;
        var wTurn = this._turn === 'w';
        var p = this.b[f];
        var pType = p.toLowerCase();
        var san = '';
        if (m.castle === 'K' || m.castle === 'k') san = 'O-O';
        else if (m.castle === 'Q' || m.castle === 'q') san = 'O-O-O';
        else {
            if (pType !== 'p') san += pType.toUpperCase();
            else if (cap) san += from[0];
            if (cap) san += 'x';
            san += to;
            if (m.prom) san += '=' + m.prom.toUpperCase();
        }
        var moveObj = {
            from: from,
            to: to,
            captured: cap,
            promotion: m.prom,
            san: san
        };
        this._hist.push({
            b: this.b.slice(),
            turn: this._turn,
            castle: this.castle,
            ep: this.ep,
            half: this.half,
            full: this.full,
            moveObj: moveObj
        });
        this.b[t] = m.prom ? wTurn ? m.prom.toUpperCase() : m.prom : p;
        this.b[f] = null;
        if (m.isEp) this.b[(f >> 3) * 8 + (t & 7)] = null;
        if (m.castle === 'K') {
            this.b[61] = 'R';
            this.b[63] = null;
        } else if (m.castle === 'Q') {
            this.b[59] = 'R';
            this.b[56] = null;
        } else if (m.castle === 'k') {
            this.b[5] = 'r';
            this.b[7] = null;
        } else if (m.castle === 'q') {
            this.b[3] = 'r';
            this.b[0] = null;
        }
        if (f === 60) this.castle = this.castle.replace('K', '').replace('Q', '');
        if (f === 4) this.castle = this.castle.replace('k', '').replace('q', '');
        if (f === 63 || t === 63) this.castle = this.castle.replace('K', '');
        if (f === 56 || t === 56) this.castle = this.castle.replace('Q', '');
        if (f === 7 || t === 7) this.castle = this.castle.replace('k', '');
        if (f === 0 || t === 0) this.castle = this.castle.replace('q', '');
        this.ep = m.epSet !== undefined ? m.epSet : -1;
        if (!wTurn) this.full++;
        this._turn = wTurn ? 'b' : 'w';
        if (this.in_check()) {
            san += this.genLegal().length === 0 ? '#' : '+';
            moveObj.san = san;
        }
        return moveObj;
    };
    _proto.undo = function undo() {
        var prev = this._hist.pop();
        if (!prev) return null;
        this.b = prev.b;
        this._turn = prev.turn;
        this.castle = prev.castle;
        this.ep = prev.ep;
        this.half = prev.half;
        this.full = prev.full;
        return prev.moveObj;
    };
    _proto.history = function history() {
        return this._hist.map(function(h) {
            return h.moveObj;
        });
    };
    _proto.in_check = function in_check() {
        var wTurn = this._turn === 'w';
        var kSq = this.b.indexOf(wTurn ? 'K' : 'k');
        return kSq >= 0 && this.attacked(this.b, kSq, !wTurn);
    };
    _proto.in_checkmate = function in_checkmate() {
        return this.in_check() && this.genLegal().length === 0;
    };
    _proto.in_draw = function in_draw() {
        return !this.in_check() && this.genLegal().length === 0;
    };
    _proto.game_over = function game_over() {
        return this.genLegal().length === 0;
    };
    return FallbackChess;
}();
function createChessInstance() {
    var Ctor = typeof window !== 'undefined' && window.Chess || FallbackChess;
    return new Ctor();
}

});

})(window.ArcadeMod);

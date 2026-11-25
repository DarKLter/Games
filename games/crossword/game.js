(function(ArcadeMod){
// === MODULE: src/games/crossword/Crossword ===
ArcadeMod.define("src/games/crossword/Crossword", function(require, module, exports) {
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
    get CROSSWORD_PACKS () {
        return CROSSWORD_PACKS;
    },
    get Crossword () {
        return Crossword;
    }
});
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
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
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var CROSSWORD_PACKS = [
    {
        title: '🌿 Garden & Nature',
        grid: [
            '.P.....',
            'FLOWER.',
            '.A.A...',
            '.NATURE',
            '.T.E..A',
            '..TREES',
            '......T'
        ],
        clues: {
            A: {
                '1,0': 'Colorful blossom in a garden',
                '3,1': 'The outdoors, trees, and wildlife',
                '5,2': 'Tall woody garden plants'
            },
            D: {
                '0,1': 'Grow one in soil or a pot',
                '1,3': 'Essential liquid for plants',
                '3,6': 'Sunrise compass direction'
            }
        }
    },
    {
        title: '🎮 Arcade & Tech',
        grid: [
            'CODE...',
            'O.A.B.H',
            'INTRO.E',
            'N.A.N.R',
            '...AUTO',
            '....S..'
        ],
        clues: {
            A: {
                '0,0': 'Instructions written for a computer',
                '2,0': 'Opening sequence of a game',
                '4,3': 'Automatic mode or car prefix'
            },
            D: {
                '0,0': 'Golden arcade currency',
                '0,2': 'Stored facts or numbers',
                '1,4': 'Extra reward points',
                '1,6': 'Main playable champion'
            }
        }
    },
    {
        title: '🚀 Space & Science',
        grid: [
            '.SATURN',
            '.O.I..O',
            'PLUTO.V',
            '.A.A..A',
            'IRON...'
        ],
        clues: {
            A: {
                '0,1': 'Ringed gas giant planet',
                '2,0': 'Famous icy dwarf planet',
                '4,0': 'Dense metallic element in planetary cores'
            },
            D: {
                '0,1': 'Relating to the Sun and its system',
                '0,3': 'Largest moon orbiting Saturn',
                '0,6': 'Sudden bright star explosion'
            }
        }
    },
    {
        title: '🌊 Ocean & Coast',
        grid: [
            '.CORAL.',
            '.R.E...',
            'WAVE...',
            '.B.FISH',
            '.....E.',
            '..TIDAL'
        ],
        clues: {
            A: {
                '0,1': 'Colorful underwater reef builder',
                '2,0': 'Cresting ocean swell',
                '3,3': 'Gilled swimmers in the sea',
                '5,2': 'Driven by rising and falling ocean levels'
            },
            D: {
                '0,1': 'Sideways-walking clawed crustacean',
                '0,3': 'Shallow underwater ridge of rock or coral',
                '3,5': 'Vast body of salt water'
            }
        }
    },
    {
        title: '🍕 Kitchen & Feast',
        grid: [
            'BREAD..',
            'A..P...',
            'C..P...',
            'O..LIME',
            'N..E..G',
            '....FIG'
        ],
        clues: {
            A: {
                '0,0': 'Baked loaf sliced for sandwiches',
                '3,3': 'Tart green citrus fruit',
                '5,4': 'Sweet purple fruit baked in tarts'
            },
            D: {
                '0,0': 'Crispy breakfast strips',
                '0,3': 'Crisp orchard fruit',
                '3,6': 'Shell-covered breakfast staple'
            }
        }
    },
    {
        title: '🎵 Music & Rhythm',
        grid: [
            'MUSIC..',
            '..O.U..',
            '.BLUES.',
            '..O..O.',
            '...BAND',
            '.....G.'
        ],
        clues: {
            A: {
                '0,0': 'Organized melody, harmony, and rhythm',
                '2,1': 'Soulful twelve-bar jazz genre',
                '4,3': 'Group of musicians playing together'
            },
            D: {
                '0,2': 'Performance by a single musician',
                '0,4': 'Stage signal to start playing',
                '2,5': 'Short musical piece with lyrics'
            }
        }
    }
];
var Crossword = /*#__PURE__*/ function() {
    "use strict";
    function Crossword(lvl, diff) {
        this.score = 0;
        this.lives = 1;
        this.maxLives = 1;
        this.isPaused = false;
        this.gameOver = false;
        this.packs = CROSSWORD_PACKS;
        this.packIdx = 0;
        this.dir = 'A';
        this.sel = {
            r: 1,
            c: 0
        };
        this.rows = 0;
        this.cols = 0;
        this.userGrid = [];
        this.solvedWords = new Set();
        this.cellNums = {};
        this.packTimer = null;
        this.advancingPack = false;
        this.level = lvl;
        this.diff = diff;
    }
    var _proto = Crossword.prototype;
    _proto.start = function start() {
        var _this = this;
        var _document_getElementById;
        _storage.playerState.sessionCoins = 0;
        _storage.playerState.sessionExp = 0;
        (_document_getElementById = document.getElementById('crosswordUI')) == null ? void 0 : _document_getElementById.classList.add('show');
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 20);
        this.buildKeyboard();
        this.loadPack(0);
        var dirBtn = document.getElementById('cwDirBtn');
        if (dirBtn) {
            dirBtn.onclick = function() {
                if (_this.gameOver || _this.isPaused) return;
                _this.dir = _this.dir === 'A' ? 'D' : 'A';
                _audio.ArcadeAudio.play('click');
                _this.renderGrid();
            };
        }
        var hintBtn = document.getElementById('cwHintBtn');
        if (hintBtn) {
            hintBtn.onclick = function() {
                return _this.useHint();
            };
        }
    };
    _proto.pause = function pause() {
        this.isPaused = true;
    };
    _proto.resume = function resume() {
        this.isPaused = false;
    };
    _proto.stop = function stop() {
        var _document_getElementById;
        this.gameOver = true;
        if (this.packTimer) {
            clearTimeout(this.packTimer);
            this.packTimer = null;
        }
        var dirBtn = document.getElementById('cwDirBtn');
        if (dirBtn) dirBtn.onclick = null;
        var hintBtn = document.getElementById('cwHintBtn');
        if (hintBtn) hintBtn.onclick = null;
        var kb = document.getElementById('cwKeyboard');
        if (kb) kb.innerHTML = '';
        (_document_getElementById = document.getElementById('crosswordUI')) == null ? void 0 : _document_getElementById.classList.remove('show');
    };
    _proto.buildKeyboard = function buildKeyboard() {
        var _this = this;
        var kb = document.getElementById('cwKeyboard');
        if (!kb) return;
        kb.innerHTML = '';
        [
            'QWERTYUIOP',
            'ASDFGHJKL',
            'ZXCVBNM'
        ].forEach(function(rowStr, rIdx) {
            var _loop = function() {
                var ch = _step.value;
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'cw-key';
                b.textContent = ch;
                b.onclick = function() {
                    return _this.handleKey(ch);
                };
                rowDiv.appendChild(b);
            };
            var rowDiv = document.createElement('div');
            rowDiv.className = 'cw-kbd-row';
            for(var _iterator = _create_for_of_iterator_helper_loose(rowStr), _step; !(_step = _iterator()).done;)_loop();
            if (rIdx === 2) {
                var bk = document.createElement('button');
                bk.type = 'button';
                bk.className = 'cw-key wide';
                bk.textContent = '⌫';
                bk.onclick = function() {
                    return _this.handleKey('Backspace');
                };
                rowDiv.appendChild(bk);
            }
            kb.appendChild(rowDiv);
        });
    };
    _proto.loadPack = function loadPack(idx) {
        this.advancingPack = false;
        this.packIdx = idx % this.packs.length;
        var pk = this.packs[this.packIdx];
        this.rows = pk.grid.length;
        this.cols = pk.grid[0].length;
        this.userGrid = pk.grid.map(function(r) {
            return r.split('').map(function(ch) {
                return ch === '.' ? null : '';
            });
        });
        this.solvedWords.clear();
        this.cellNums = {};
        var nextNum = 1;
        for(var r = 0; r < this.rows; r++){
            for(var c = 0; c < this.cols; c++){
                if (pk.clues.A[r + "," + c] || pk.clues.D[r + "," + c]) {
                    this.cellNums[r + "," + c] = nextNum++;
                }
            }
        }
        var firstKey = Object.keys(pk.clues.A)[0].split(',').map(Number);
        this.sel = {
            r: firstKey[0],
            c: firstKey[1]
        };
        this.dir = 'A';
        var titleEl = document.getElementById('cwPackTitle');
        if (titleEl) titleEl.textContent = pk.title;
        this.renderGrid();
    };
    _proto.getWordBounds = function getWordBounds(r, c, dir) {
        var _g_r, _g_r1;
        var g = this.packs[this.packIdx].grid;
        if (((_g_r = g[r]) == null ? void 0 : _g_r[c]) === '.' || ((_g_r1 = g[r]) == null ? void 0 : _g_r1[c]) === undefined) return [];
        var cells = [];
        if (dir === 'A') {
            var sc = c;
            while(sc > 0 && g[r][sc - 1] !== '.')sc--;
            while(sc < this.cols && g[r][sc] !== '.'){
                cells.push({
                    r: r,
                    c: sc
                });
                sc++;
            }
        } else {
            var sr = r;
            while(sr > 0 && g[sr - 1][c] !== '.')sr--;
            while(sr < this.rows && g[sr][c] !== '.'){
                cells.push({
                    r: sr,
                    c: c
                });
                sr++;
            }
        }
        return cells;
    };
    _proto.renderGrid = function renderGrid() {
        var _this, _loop = function(r) {
            var _this2, _loop = function(c) {
                var target = pk.grid[r][c];
                var div = document.createElement('div');
                if (target === '.') {
                    div.className = 'cw-cell block';
                    gridEl.appendChild(div);
                    return "continue";
                }
                total++;
                var val = _this2.userGrid[r][c] || '';
                if (val === target) filled++;
                var inW = wordCells.some(function(p) {
                    return p.r === r && p.c === c;
                });
                var isAct = _this2.sel.r === r && _this2.sel.c === c;
                div.className = 'cw-cell' + (inW ? ' in-word' : '') + (isAct ? ' active' : '') + (val ? val === target ? ' correct' : ' wrong' : '');
                div.textContent = val;
                var cellNum = _this2.cellNums[r + "," + c];
                if (cellNum) {
                    var n = document.createElement('span');
                    n.className = 'cw-num';
                    n.textContent = String(cellNum);
                    div.appendChild(n);
                }
                div.onclick = function() {
                    if (_this1.gameOver || _this1.isPaused) return;
                    if (_this1.sel.r === r && _this1.sel.c === c) _this1.dir = _this1.dir === 'A' ? 'D' : 'A';
                    _this1.sel = {
                        r: r,
                        c: c
                    };
                    _audio.ArcadeAudio.play('click');
                    _this1.renderGrid();
                };
                gridEl.appendChild(div);
            };
            for(var c = 0; c < _this.cols; c++)_this2 = _this, _loop(c);
        };
        var _this1 = this;
        var pk = this.packs[this.packIdx];
        var gridEl = document.getElementById('cwGrid');
        if (!gridEl) return;
        gridEl.style.gridTemplateColumns = "repeat(" + this.cols + ", auto)";
        gridEl.innerHTML = '';
        var wordCells = this.getWordBounds(this.sel.r, this.sel.c, this.dir);
        var filled = 0;
        var total = 0;
        for(var r = 0; r < this.rows; r++)_this = this, _loop(r);
        var dirBtn = document.getElementById('cwDirBtn');
        if (dirBtn) dirBtn.textContent = this.dir === 'A' ? '↔ ACROSS' : '↕ DOWN';
        var progEl = document.getElementById('cwProgress');
        if (progEl) progEl.textContent = filled + " / " + total + " Letters";
        var clueText = 'Tap any word cell to type!';
        if (wordCells.length >= 2) {
            var key = wordCells[0].r + "," + wordCells[0].c;
            var numPrefix = this.cellNums[key] ? "" + this.cellNums[key] + this.dir + ": " : '';
            var desc = pk.clues[this.dir][key] || pk.clues[this.dir === 'A' ? 'D' : 'A'][key] || "" + wordCells.length + "-letter word";
            clueText = "" + numPrefix + desc;
        }
        var clueEl = document.getElementById('cwActiveClue');
        if (clueEl) clueEl.textContent = clueText;
        if (filled === total && total > 0 && !this.gameOver && !this.advancingPack) {
            this.advancingPack = true;
            this.score += 150;
            (0, _runtimeBridge.addCoins)(15);
            this.level++;
            _audio.ArcadeAudio.play('win');
            (0, _runtimeBridge.addXp)(30);
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 20);
            this.packTimer = setTimeout(function() {
                _this1.packTimer = null;
                if (!_this1.gameOver) _this1.loadPack(_this1.packIdx + 1);
            }, 700);
        }
    };
    _proto.useHint = function useHint() {
        var _this_packs_this_packIdx_grid_this_sel_r;
        if (this.gameOver || this.isPaused) return;
        var target = (_this_packs_this_packIdx_grid_this_sel_r = this.packs[this.packIdx].grid[this.sel.r]) == null ? void 0 : _this_packs_this_packIdx_grid_this_sel_r[this.sel.c];
        if (!target || target === '.' || !(0, _runtimeBridge.spendCoins)(5)) {
            _audio.ArcadeAudio.play('hurt');
            return;
        }
        this.handleKey(target, true);
    };
    _proto.handleKey = function handleKey(key, free) {
        var _this = this;
        if (free === void 0) free = false;
        var _pk_grid_this_sel_r;
        if (this.gameOver || this.isPaused) return;
        var pk = this.packs[this.packIdx];
        if (key.startsWith('Arrow')) {
            var dr = key === 'ArrowDown' ? 1 : key === 'ArrowUp' ? -1 : 0;
            var dc = key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : 0;
            var nr = this.sel.r + dr;
            var nc = this.sel.c + dc;
            while(nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols){
                var _pk_grid_nr;
                if (((_pk_grid_nr = pk.grid[nr]) == null ? void 0 : _pk_grid_nr[nc]) !== '.') {
                    this.sel = {
                        r: nr,
                        c: nc
                    };
                    _audio.ArcadeAudio.play('click');
                    this.renderGrid();
                    return;
                }
                nr += dr;
                nc += dc;
            }
            return;
        }
        if (key === 'Backspace') {
            this.userGrid[this.sel.r][this.sel.c] = '';
            var w = this.getWordBounds(this.sel.r, this.sel.c, this.dir);
            var idx = w.findIndex(function(p) {
                return p.r === _this.sel.r && p.c === _this.sel.c;
            });
            if (idx > 0) this.sel = _extends({}, w[idx - 1]);
            _audio.ArcadeAudio.play('click');
            this.renderGrid();
            return;
        }
        var ch = key.toUpperCase();
        if (!/^[A-Z]$/.test(ch)) return;
        if (((_pk_grid_this_sel_r = pk.grid[this.sel.r]) == null ? void 0 : _pk_grid_this_sel_r[this.sel.c]) === '.') return;
        this.userGrid[this.sel.r][this.sel.c] = ch;
        if (ch === pk.grid[this.sel.r][this.sel.c]) {
            if (!free) {
                this.score += 10;
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 20);
            }
            _audio.ArcadeAudio.play('key');
        } else {
            _audio.ArcadeAudio.play('hurt');
        }
        var w1 = this.getWordBounds(this.sel.r, this.sel.c, this.dir);
        if (w1.length >= 2 && w1.every(function(p) {
            return _this.userGrid[p.r][p.c] === pk.grid[p.r][p.c];
        })) {
            var wk = this.dir + "_" + w1[0].r + "_" + w1[0].c;
            if (!this.solvedWords.has(wk)) {
                this.solvedWords.add(wk);
                this.score += 40;
                (0, _runtimeBridge.addCoins)(2);
                _audio.ArcadeAudio.play('wordSolved');
                (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 20);
            }
        }
        var idx1 = w1.findIndex(function(p) {
            return p.r === _this.sel.r && p.c === _this.sel.c;
        });
        if (idx1 >= 0 && idx1 + 1 < w1.length) this.sel = _extends({}, w1[idx1 + 1]);
        this.renderGrid();
    };
    return Crossword;
}();

});

})(window.ArcadeMod);

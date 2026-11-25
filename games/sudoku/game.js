(function(ArcadeMod){
// === MODULE: src/games/sudoku/Sudoku ===
ArcadeMod.define("src/games/sudoku/Sudoku", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Sudoku", {
    enumerable: true,
    get: function() {
        return Sudoku;
    }
});
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
var _sudokuLogic = require("./sudokuLogic");
var Sudoku = /*#__PURE__*/ function() {
    "use strict";
    function Sudoku(lvl, diff) {
        this.score = 0;
        this.lives = 3;
        this.maxLives = 3;
        this.isPaused = false;
        this.gameOver = false;
        this.mistakes = 0;
        this.notesMode = false;
        this.selected = {
            r: 0,
            c: 0
        };
        this.board = [];
        this.solution = [];
        this.givens = [];
        this.notes = [];
        this.boardTimer = null;
        this.boardSolvedLock = false;
        this.level = lvl;
        this.diff = diff;
    }
    var _proto = Sudoku.prototype;
    _proto.start = function start() {
        var _document_getElementById, _document_getElementById1;
        _storage.playerState.sessionCoins = 0;
        _storage.playerState.sessionExp = 0;
        this.mistakes = 0;
        this.lives = 3;
        this.maxLives = 3;
        this.notesMode = false;
        (_document_getElementById = document.getElementById('sdkNotesBtn')) == null ? void 0 : _document_getElementById.classList.remove('active');
        (_document_getElementById1 = document.getElementById('sudokuUI')) == null ? void 0 : _document_getElementById1.classList.add('show');
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 21);
        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        this.buildNumpad();
        this.bindTools();
        this.newBoard(true);
    };
    _proto.pause = function pause() {
        this.isPaused = true;
    };
    _proto.resume = function resume() {
        this.isPaused = false;
    };
    _proto.stop = function stop() {
        var _document_getElementById, _document_getElementById1;
        this.gameOver = true;
        this.notesMode = false;
        (_document_getElementById = document.getElementById('sdkNotesBtn')) == null ? void 0 : _document_getElementById.classList.remove('active');
        if (this.boardTimer) {
            clearTimeout(this.boardTimer);
            this.boardTimer = null;
        }
        for(var _i = 0, _iter = [
            'sdkNotesBtn',
            'sdkEraseBtn',
            'sdkHintBtn',
            'sdkNewBtn'
        ]; _i < _iter.length; _i++){
            var id = _iter[_i];
            var el = document.getElementById(id);
            if (el) el.onclick = null;
        }
        (_document_getElementById1 = document.getElementById('sudokuUI')) == null ? void 0 : _document_getElementById1.classList.remove('show');
    };
    _proto.newBoard = function newBoard(resetLives) {
        if (resetLives === void 0) resetLives = true;
        if (this.boardTimer) {
            clearTimeout(this.boardTimer);
            this.boardTimer = null;
        }
        this.boardSolvedLock = false;
        var data = (0, _sudokuLogic.generateSudokuBoard)(this.diff, this.level);
        this.board = data.puzzle;
        this.solution = data.solution;
        this.givens = data.givens;
        this.notes = Array.from({
            length: 9
        }, function() {
            return Array.from({
                length: 9
            }, function() {
                return new Set();
            });
        });
        if (resetLives) {
            this.mistakes = 0;
            this.lives = 3;
        }
        (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
        // Pick first empty square as default selection
        outer: for(var r = 0; r < 9; r++){
            for(var c = 0; c < 9; c++){
                if (!this.givens[r][c]) {
                    this.selected = {
                        r: r,
                        c: c
                    };
                    break outer;
                }
            }
        }
        this.render();
    };
    _proto.bindTools = function bindTools() {
        var _this = this;
        var notesBtn = document.getElementById('sdkNotesBtn');
        if (notesBtn) {
            notesBtn.onclick = function() {
                if (_this.gameOver || _this.isPaused) return;
                _this.notesMode = !_this.notesMode;
                notesBtn.classList.toggle('active', _this.notesMode);
                _audio.ArcadeAudio.play('click');
            };
        }
        var eraseBtn = document.getElementById('sdkEraseBtn');
        if (eraseBtn) {
            eraseBtn.onclick = function() {
                return _this.handleKey('Backspace');
            };
        }
        var hintBtn = document.getElementById('sdkHintBtn');
        if (hintBtn) {
            hintBtn.onclick = function() {
                return _this.useHint();
            };
        }
        var newBtn = document.getElementById('sdkNewBtn');
        if (newBtn) {
            newBtn.onclick = function() {
                if (_this.gameOver || _this.isPaused) return;
                _audio.ArcadeAudio.play('click');
                _this.newBoard(false);
            };
        }
    };
    _proto.buildNumpad = function buildNumpad() {
        var _loop = function(n) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'sdk-num-btn';
            btn.textContent = String(n);
            btn.onclick = function() {
                return _this.handleKey(String(n));
            };
            pad.appendChild(btn);
        };
        var _this = this;
        var pad = document.getElementById('sdkNumpad');
        if (!pad) return;
        pad.innerHTML = '';
        for(var n = 1; n <= 9; n++)_loop(n);
    };
    _proto.useHint = function useHint() {
        var _this_givens_r, _this_board_r, _this_solution_r;
        if (this.gameOver || this.isPaused) return;
        var _this_selected = this.selected, r = _this_selected.r, c = _this_selected.c;
        if (((_this_givens_r = this.givens[r]) == null ? void 0 : _this_givens_r[c]) || ((_this_board_r = this.board[r]) == null ? void 0 : _this_board_r[c]) === ((_this_solution_r = this.solution[r]) == null ? void 0 : _this_solution_r[c])) {
            // Find first unsolved cell automatically
            var found = null;
            for(var rr = 0; rr < 9 && !found; rr++){
                for(var cc = 0; cc < 9 && !found; cc++){
                    if (this.board[rr][cc] !== this.solution[rr][cc]) found = {
                        r: rr,
                        c: cc
                    };
                }
            }
            if (!found) return;
            this.selected = found;
        }
        if (!(0, _runtimeBridge.spendCoins)(5)) {
            _audio.ArcadeAudio.play('hurt');
            return;
        }
        var tr = this.selected.r;
        var tc = this.selected.c;
        this.board[tr][tc] = this.solution[tr][tc];
        this.notes[tr][tc].clear();
        _audio.ArcadeAudio.play('sudokuOk');
        this.checkWin();
        this.render();
    };
    _proto.handleKey = function handleKey(key) {
        var _this_givens_r;
        if (this.gameOver || this.isPaused) return;
        var _this_selected = this.selected, r = _this_selected.r, c = _this_selected.c;
        if (key === 'ArrowUp') {
            this.selected.r = (r + 8) % 9;
            this.render();
            return;
        }
        if (key === 'ArrowDown') {
            this.selected.r = (r + 1) % 9;
            this.render();
            return;
        }
        if (key === 'ArrowLeft') {
            this.selected.c = (c + 8) % 9;
            this.render();
            return;
        }
        if (key === 'ArrowRight') {
            this.selected.c = (c + 1) % 9;
            this.render();
            return;
        }
        if ((_this_givens_r = this.givens[r]) == null ? void 0 : _this_givens_r[c]) return;
        if (key === 'Backspace' || key === 'Delete' || key === '0') {
            this.board[r][c] = 0;
            this.notes[r][c].clear();
            _audio.ArcadeAudio.play('click');
            this.render();
            return;
        }
        var num = parseInt(key, 10);
        if (Number.isNaN(num) || num < 1 || num > 9) return;
        if (this.notesMode) {
            if (this.notes[r][c].has(num)) this.notes[r][c].delete(num);
            else this.notes[r][c].add(num);
            _audio.ArcadeAudio.play('key');
            this.render();
            return;
        }
        this.board[r][c] = num;
        this.notes[r][c].clear();
        if (num === this.solution[r][c]) {
            this.score += 20;
            (0, _runtimeBridge.addCoins)(1);
            (0, _runtimeBridge.addXp)(4);
            _audio.ArcadeAudio.play('sudokuOk');
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 21);
            this.checkWin();
        } else {
            this.mistakes++;
            this.lives = Math.max(0, 3 - this.mistakes);
            _audio.ArcadeAudio.play('hurt');
            (0, _runtimeBridge.updateHealthDisplay)(this.lives, this.maxLives);
            if (this.mistakes >= 3) {
                this.gameOver = true;
                (0, _runtimeBridge.triggerGameOver)(this.score, _storage.playerState.sessionCoins, this.level, 21, false);
                return;
            }
        }
        this.render();
    };
    _proto.checkWin = function checkWin() {
        var _this = this;
        if (this.boardSolvedLock || this.gameOver) return;
        if ((0, _sudokuLogic.isSudokuSolved)(this.board, this.solution)) {
            this.boardSolvedLock = true;
            this.score += 250;
            this.level++;
            (0, _runtimeBridge.addCoins)(20);
            (0, _runtimeBridge.addXp)(40);
            _audio.ArcadeAudio.play('win');
            (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 21);
            this.boardTimer = setTimeout(function() {
                _this.boardTimer = null;
                if (!_this.gameOver) _this.newBoard();
            }, 900);
        }
    };
    _proto.render = function render() {
        var _this, _loop = function(r) {
            var _this2, _loop = function(c) {
                var val = _this2.board[r][c];
                var cell = document.createElement('div');
                var cls = 'sdk-cell';
                if (c === 2 || c === 5) cls += ' box-right';
                if (r === 2 || r === 5) cls += ' box-bottom';
                if (_this2.givens[r][c]) cls += ' given';
                var isSelected = r === _this2.selected.r && c === _this2.selected.c;
                var isPeer = r === _this2.selected.r || c === _this2.selected.c || Math.floor(r / 3) === selBoxR && Math.floor(c / 3) === selBoxC;
                if (isPeer && !isSelected) cls += ' peer';
                if (selVal > 0 && val === selVal && !isSelected) cls += ' same-num';
                if (isSelected) cls += ' selected';
                if (val > 0 && !_this2.givens[r][c] && (val !== _this2.solution[r][c] || (0, _sudokuLogic.hasSudokuConflict)(_this2.board, r, c))) {
                    cls += ' conflict';
                }
                cell.className = cls;
                if (val > 0) {
                    cell.textContent = String(val);
                } else if (_this2.notes[r][c].size > 0) {
                    var notesWrap = document.createElement('div');
                    notesWrap.className = 'sdk-notes';
                    for(var d = 1; d <= 9; d++){
                        var sp = document.createElement('span');
                        sp.textContent = _this2.notes[r][c].has(d) ? String(d) : '';
                        notesWrap.appendChild(sp);
                    }
                    cell.appendChild(notesWrap);
                }
                cell.onclick = function() {
                    if (_this1.gameOver || _this1.isPaused) return;
                    _this1.selected = {
                        r: r,
                        c: c
                    };
                    _audio.ArcadeAudio.play('click');
                    _this1.render();
                };
                gridEl.appendChild(cell);
            };
            for(var c = 0; c < 9; c++)_this2 = _this, _loop(c);
        };
        var _this1 = this;
        var _this_board_this_selected_r;
        var gridEl = document.getElementById('sdkGrid');
        var titleEl = document.getElementById('sdkTitle');
        var mistEl = document.getElementById('sdkMistakes');
        if (titleEl) titleEl.textContent = "\uD83D\uDD22 Sudoku \xb7 Lvl " + this.level + " (" + this.diff.toUpperCase() + ")";
        if (mistEl) mistEl.textContent = "Mistakes: " + this.mistakes + "/3";
        if (!gridEl) return;
        gridEl.innerHTML = '';
        var selVal = ((_this_board_this_selected_r = this.board[this.selected.r]) == null ? void 0 : _this_board_this_selected_r[this.selected.c]) || 0;
        var selBoxR = Math.floor(this.selected.r / 3);
        var selBoxC = Math.floor(this.selected.c / 3);
        for(var r = 0; r < 9; r++)_this = this, _loop(r);
    };
    return Sudoku;
}();

});
// === MODULE: src/games/sudoku/sudokuLogic ===
ArcadeMod.define("src/games/sudoku/sudokuLogic", function(require, module, exports) {
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
    get generateSudokuBoard () {
        return generateSudokuBoard;
    },
    get hasSudokuConflict () {
        return hasSudokuConflict;
    },
    get isSudokuSolved () {
        return isSudokuSolved;
    }
});
var BASE_SOLUTION = [
    [
        5,
        3,
        4,
        6,
        7,
        8,
        9,
        1,
        2
    ],
    [
        6,
        7,
        2,
        1,
        9,
        5,
        3,
        4,
        8
    ],
    [
        1,
        9,
        8,
        3,
        4,
        2,
        5,
        6,
        7
    ],
    [
        8,
        5,
        9,
        7,
        6,
        1,
        4,
        2,
        3
    ],
    [
        4,
        2,
        6,
        8,
        5,
        3,
        7,
        9,
        1
    ],
    [
        7,
        1,
        3,
        9,
        2,
        4,
        8,
        5,
        6
    ],
    [
        9,
        6,
        1,
        5,
        3,
        7,
        2,
        8,
        4
    ],
    [
        2,
        8,
        7,
        4,
        1,
        9,
        6,
        3,
        5
    ],
    [
        3,
        4,
        5,
        2,
        8,
        6,
        1,
        7,
        9
    ]
];
function shuffleArray(arr) {
    var out = [].concat(arr);
    for(var i = out.length - 1; i > 0; i--){
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
    }
    return out;
}
function generateSudokuBoard(diff, level) {
    if (level === void 0) level = 1;
    // Relabel digits 1..9 randomly, permute band rows & stack cols to keep 100% valid 9x9 Sudoku
    var digits = shuffleArray([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
    ]);
    var digitMap = new Map();
    digits.forEach(function(d, i) {
        return digitMap.set(i + 1, d);
    });
    var rowOrder = [
        0,
        1,
        2
    ].flatMap(function(b) {
        return shuffleArray([
            0,
            1,
            2
        ]).map(function(r) {
            return b * 3 + r;
        });
    });
    var colOrder = [
        0,
        1,
        2
    ].flatMap(function(s) {
        return shuffleArray([
            0,
            1,
            2
        ]).map(function(c) {
            return s * 3 + c;
        });
    });
    var solution = rowOrder.map(function(r) {
        return colOrder.map(function(c) {
            return digitMap.get(BASE_SOLUTION[r][c]) || BASE_SOLUTION[r][c];
        });
    });
    var removeCounts = {
        easy: 34,
        medium: 42,
        hard: 50,
        extreme: 56
    };
    var blanks = Math.min(60, (removeCounts[diff] || 36) + Math.min(6, Math.max(0, level - 1) * 2));
    var puzzle = solution.map(function(row) {
        return [].concat(row);
    });
    var givens = solution.map(function(row) {
        return row.map(function() {
            return true;
        });
    });
    var positions = shuffleArray(Array.from({
        length: 81
    }, function(_, i) {
        return i;
    }));
    for(var k = 0; k < blanks; k++){
        var pos = positions[k];
        var r = Math.floor(pos / 9);
        var c = pos % 9;
        puzzle[r][c] = 0;
        givens[r][c] = false;
    }
    return {
        puzzle: puzzle,
        solution: solution,
        givens: givens
    };
}
function hasSudokuConflict(board, row, col) {
    var _board_row;
    var val = ((_board_row = board[row]) == null ? void 0 : _board_row[col]) || 0;
    if (val === 0) return false;
    for(var i = 0; i < 9; i++){
        if (i !== col && board[row][i] === val) return true;
        if (i !== row && board[i][col] === val) return true;
    }
    var br = Math.floor(row / 3) * 3;
    var bc = Math.floor(col / 3) * 3;
    for(var r = br; r < br + 3; r++){
        for(var c = bc; c < bc + 3; c++){
            if ((r !== row || c !== col) && board[r][c] === val) return true;
        }
    }
    return false;
}
function isSudokuSolved(board, solution) {
    for(var r = 0; r < 9; r++){
        for(var c = 0; c < 9; c++){
            var _board_r, _solution_r;
            if (((_board_r = board[r]) == null ? void 0 : _board_r[c]) !== ((_solution_r = solution[r]) == null ? void 0 : _solution_r[c])) return false;
        }
    }
    return true;
}

});

})(window.ArcadeMod);

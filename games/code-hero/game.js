(function(ArcadeMod){
// === MODULE: src/games/code-hero/CodeHero ===
ArcadeMod.define("src/games/code-hero/CodeHero", function(require, module, exports) {
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
    get CODE_HERO_QUESTIONS () {
        return CODE_HERO_QUESTIONS;
    },
    get CodeHeroGame () {
        return CodeHeroGame;
    },
    get buildQuestionDeck () {
        return buildQuestionDeck;
    },
    get getCodeHeroConfig () {
        return getCodeHeroConfig;
    }
});
var _audio = require("../../core/audio");
var _runtimeBridge = require("../../core/runtimeBridge");
var _storage = require("../../core/storage");
var CODE_HERO_QUESTIONS = [
    // Easy Tier (Core Web, JS Basics, Python Basics)
    {
        tier: 'easy',
        lesson: 'In JavaScript, `const` declares a block-scoped variable that cannot be reassigned.',
        q: 'Which keyword creates a constant variable in JavaScript?',
        opts: [
            'const',
            'var',
            'let',
            'static'
        ],
        ans: 0
    },
    {
        tier: 'easy',
        lesson: 'In CSS Flexbox, `justify-content: center` aligns items along the main horizontal axis.',
        q: 'Which CSS property centers flex items horizontally?',
        opts: [
            'align-items: center',
            'justify-content: center',
            'text-align: middle',
            'float: center'
        ],
        ans: 1
    },
    {
        tier: 'easy',
        lesson: 'In Python, `len(items)` returns the number of elements in a list, string, or tuple.',
        q: 'What does `len([10, 20, 30])` return in Python?',
        opts: [
            '2',
            '30',
            '3',
            'Error'
        ],
        ans: 2
    },
    {
        tier: 'easy',
        lesson: 'HTML semantic tags like `<nav>`, `<main>`, and `<article>` improve accessibility and SEO.',
        q: 'Which HTML tag defines the primary navigation links?',
        opts: [
            '<links>',
            '<nav>',
            '<menu-bar>',
            '<header-nav>'
        ],
        ans: 1
    },
    {
        tier: 'easy',
        lesson: 'Array `.map()` transforms each element and returns a brand-new array of the same length.',
        q: 'What does `[1, 2, 3].map(x => x * 2)` return?',
        opts: [
            '[2, 4, 6]',
            '6',
            '[1, 2, 3, 2, 4, 6]',
            'undefined'
        ],
        ans: 0
    },
    {
        tier: 'easy',
        lesson: 'In SQL, `SELECT DISTINCT` filters out duplicate rows from query results.',
        q: 'Which SQL keyword removes duplicate values in a SELECT query?',
        opts: [
            'UNIQUE',
            'FILTER',
            'DISTINCT',
            'ONLY'
        ],
        ans: 2
    },
    {
        tier: 'easy',
        lesson: 'In Git, `git status` displays modified, untracked, and staged files in your working tree.',
        q: 'Which Git command shows modified and staged files without committing?',
        opts: [
            'git check',
            'git status',
            'git diff-all',
            'git stage'
        ],
        ans: 1
    },
    {
        tier: 'easy',
        lesson: 'JSON keys and string values must always use double quotes (`"`), never single quotes.',
        q: 'Which snippet is valid JSON?',
        opts: [
            "{'name': 'Ada'}",
            '{"name": "Ada"}',
            '{name: "Ada"}',
            '{"name": "Ada",}'
        ],
        ans: 1
    },
    // Medium Tier (TypeScript, DOM, Algorithms, HTTP)
    {
        tier: 'medium',
        lesson: 'Strict equality (`===`) compares both value and runtime type without implicit coercion.',
        q: 'What does `0 === "0"` evaluate to in JavaScript?',
        opts: [
            'true',
            'false',
            'TypeError',
            'undefined'
        ],
        ans: 1
    },
    {
        tier: 'medium',
        lesson: 'HTTP status code `404` means Not Found; `201` means Created; `401` means Unauthorized.',
        q: 'Which HTTP status code indicates a resource was successfully created?',
        opts: [
            '200',
            '201',
            '204',
            '301'
        ],
        ans: 1
    },
    {
        tier: 'medium',
        lesson: 'Binary search halves the remaining sorted search space on every comparison: O(log n).',
        q: 'What is the worst-case time complexity of binary search on n sorted items?',
        opts: [
            'O(1)',
            'O(log n)',
            'O(n)',
            'O(n log n)'
        ],
        ans: 1
    },
    {
        tier: 'medium',
        lesson: 'In TypeScript, `unknown` forces type narrowing before property access, unlike `any`.',
        q: 'Which TypeScript type is type-safe until narrowed before use?',
        opts: [
            'any',
            'unknown',
            'never',
            'object'
        ],
        ans: 1
    },
    {
        tier: 'medium',
        lesson: 'A Set stores unique values; checking membership with `set.has(x)` averages O(1) time.',
        q: 'What is `new Set([1, 2, 2, 3, 1]).size`?',
        opts: [
            '5',
            '4',
            '3',
            '2'
        ],
        ans: 2
    },
    {
        tier: 'medium',
        lesson: 'Array `.filter()` keeps only elements for which the predicate callback returns truthy.',
        q: 'What does `[5, 12, 8, 20].filter(n => n > 10)` return?',
        opts: [
            '[12, 20]',
            '[5, 8]',
            '[true, false]',
            '2'
        ],
        ans: 0
    },
    {
        tier: 'medium',
        lesson: 'Python list slicing `[a:b]` includes index `a` and excludes index `b`.',
        q: 'In Python, what does `"ARCADE"[1:4]` evaluate to?',
        opts: [
            '"ARC"',
            '"RCA"',
            '"RCAD"',
            '"CAD"'
        ],
        ans: 1
    },
    {
        tier: 'medium',
        lesson: '`event.stopPropagation()` stops bubbling to parent handlers without canceling default navigation.',
        q: 'Which DOM method prevents an event from bubbling up to ancestor elements?',
        opts: [
            'preventDefault()',
            'stopPropagation()',
            'cancelBubble()',
            'haltEvent()'
        ],
        ans: 1
    },
    // Hard Tier (Async JS, React, SQL Joins, Data Structures)
    {
        tier: 'hard',
        lesson: 'Microtasks (Promises, `queueMicrotask`) flush completely after the call stack empties, before macrotasks (`setTimeout`).',
        q: 'In the JS event loop, which runs first after synchronous code finishes?',
        opts: [
            'setTimeout(..., 0)',
            'Promise.then(...) microtask',
            'requestAnimationFrame',
            'setInterval(..., 0)'
        ],
        ans: 1
    },
    {
        tier: 'hard',
        lesson: 'In React, functional state updates `setCount(c => c + 1)` read the latest queued value across batched renders.',
        q: 'Why pass a callback to a React `setState` setter when incrementing twice in one handler?',
        opts: [
            'Avoids stale closure state during batching',
            'Bypasses virtual DOM diffing',
            'Forces synchronous network sync',
            'Prevents component unmount'
        ],
        ans: 0
    },
    {
        tier: 'hard',
        lesson: 'A stack follows LIFO (Last-In, First-Out); a queue follows FIFO (First-In, First-Out).',
        q: 'Which data structure does Breadth-First Search (BFS) use to explore level by level?',
        opts: [
            'Stack (LIFO)',
            'Queue (FIFO)',
            'Min-Heap only',
            'LinkedHashSet only'
        ],
        ans: 1
    },
    {
        tier: 'hard',
        lesson: 'In SQL, `LEFT JOIN` returns every row from the left table even when no right-table row matches.',
        q: 'Which SQL join preserves all left-table rows with NULLs for unmatched right-table columns?',
        opts: [
            'INNER JOIN',
            'CROSS JOIN',
            'LEFT JOIN',
            'SELF JOIN'
        ],
        ans: 2
    },
    {
        tier: 'hard',
        lesson: 'The nullish coalescing operator `??` falls back only on `null` or `undefined`, keeping `0` and `""`.',
        q: 'What does `0 ?? 42` evaluate to in JavaScript?',
        opts: [
            '42',
            '0',
            'null',
            'false'
        ],
        ans: 1
    },
    {
        tier: 'hard',
        lesson: 'TypeScript `Readonly<T>` marks top-level properties readonly at compile time.',
        q: 'Which TypeScript utility type makes all properties of `T` optional?',
        opts: [
            'Required<T>',
            'Partial<T>',
            'Pick<T, K>',
            'Record<K, T>'
        ],
        ans: 1
    },
    {
        tier: 'hard',
        lesson: 'CSS `tabular-nums` gives all digits equal advance width so live countdown timers do not jitter.',
        q: 'Which CSS `font-variant-numeric` value keeps live timer digits aligned without horizontal jitter?',
        opts: [
            'oldstyle-nums',
            'proportional-nums',
            'tabular-nums',
            'lining-nums'
        ],
        ans: 2
    },
    // Extreme Tier (Systems, WebGL/Perf, Security, Algorithms)
    {
        tier: 'extreme',
        lesson: '`Promise.allSettled` waits for every promise to finish regardless of rejections, returning status objects.',
        q: 'Which Promise combinator settles with every outcome even when some promises reject?',
        opts: [
            'Promise.all',
            'Promise.race',
            'Promise.any',
            'Promise.allSettled'
        ],
        ans: 3
    },
    {
        tier: 'extreme',
        lesson: 'Hash table average lookup is O(1), but worst-case lookup with degenerate collisions degrades to O(n).',
        q: 'What is the theoretical worst-case lookup time for a chained hash table under hash collisions?',
        opts: [
            'O(1)',
            'O(log n)',
            'O(n)',
            'O(n^2)'
        ],
        ans: 2
    },
    {
        tier: 'extreme',
        lesson: 'Calling `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` after resizing `canvas.width/height` keeps HiDPI coordinates crisp.',
        q: 'Why call `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` instead of repeated `ctx.scale(dpr, dpr)` on resize?',
        opts: [
            'Avoids compounding transforms across resizes',
            'Enables WebGL2 hardware AA',
            'Clears the alpha channel faster',
            'Locks frame rate to 60fps'
        ],
        ans: 0
    },
    {
        tier: 'extreme',
        lesson: 'Parameterized SQL queries separate query structure from user input to prevent SQL injection.',
        q: 'Which defense eliminates SQL injection vulnerabilities at the database driver level?',
        opts: [
            'Client-side regex stripping',
            'Parameterized / prepared statements',
            'Base64 encoding strings',
            'Checking Content-Length'
        ],
        ans: 1
    },
    {
        tier: 'extreme',
        lesson: 'Topological sort exists if and only if a directed graph is acyclic (a DAG).',
        q: 'Which graph property is required for a valid topological ordering to exist?',
        opts: [
            'Graph must be undirected',
            'Graph must be a Directed Acyclic Graph (DAG)',
            'All edge weights must be positive',
            'Graph must be complete'
        ],
        ans: 1
    },
    {
        tier: 'extreme',
        lesson: 'In Three.js, GPU buffers allocated by geometries, materials, and textures are freed via `.dispose()`.',
        q: 'What must be called on dynamically created Three.js geometries and materials when tearing down a scene?',
        opts: [
            '.destroy()',
            '.gc()',
            '.dispose()',
            '.free()'
        ],
        ans: 2
    },
    {
        tier: 'extreme',
        lesson: '`IntersectionObserver` asynchronously reports element visibility without forcing synchronous layout reflows.',
        q: 'Why prefer `IntersectionObserver` over `scroll` + `getBoundingClientRect()` for visibility checks?',
        opts: [
            'Avoids main-thread layout thrashing on scroll',
            'Runs in a Web Worker automatically',
            'Supports CSS keyframes natively',
            'Compresses DOM nodes'
        ],
        ans: 0
    }
];
var TIER_RANK = {
    easy: 0,
    medium: 1,
    hard: 2,
    extreme: 3
};
function getCodeHeroConfig(diff) {
    if (diff === 'extreme') return {
        startTime: 20,
        bonusTime: 2,
        penaltyTime: 2,
        scoreMult: 3
    };
    if (diff === 'hard') return {
        startTime: 25,
        bonusTime: 3,
        penaltyTime: 2,
        scoreMult: 2
    };
    if (diff === 'medium') return {
        startTime: 30,
        bonusTime: 4,
        penaltyTime: 1,
        scoreMult: 1.5
    };
    return {
        startTime: 35,
        bonusTime: 5,
        penaltyTime: 0,
        scoreMult: 1
    };
}
function buildQuestionDeck(diff) {
    var _TIER_RANK_diff;
    var targetRank = (_TIER_RANK_diff = TIER_RANK[diff]) != null ? _TIER_RANK_diff : 0;
    var primary = CODE_HERO_QUESTIONS.filter(function(q) {
        return TIER_RANK[q.tier] === targetRank;
    });
    var secondary = CODE_HERO_QUESTIONS.filter(function(q) {
        return TIER_RANK[q.tier] !== targetRank;
    }).sort(function(a, b) {
        return Math.abs(TIER_RANK[a.tier] - targetRank) - Math.abs(TIER_RANK[b.tier] - targetRank);
    });
    var shuffle = function shuffle(arr) {
        var out = [].concat(arr);
        for(var i = out.length - 1; i > 0; i--){
            var j = Math.floor(Math.random() * (i + 1));
            var ref;
            ref = [
                out[j],
                out[i]
            ], out[i] = ref[0], out[j] = ref[1], ref;
        }
        return out;
    };
    return [].concat(shuffle(primary), shuffle(secondary));
}
var CodeHeroGame = /*#__PURE__*/ function() {
    "use strict";
    function CodeHeroGame(lvl, diff) {
        this.score = 0;
        this.lives = 3;
        this.maxLives = 3;
        this.isPaused = false;
        this.gameOver = false;
        this.timerId = null;
        this.questionTimer = null;
        this.timeLeft = 30;
        this.qIndex = 0;
        this.streak = 0;
        this.deck = [];
        this.level = lvl;
        this.diff = diff;
        this.cfg = getCodeHeroConfig(diff);
        this.timeLeft = this.cfg.startTime;
        this.deck = buildQuestionDeck(diff);
    }
    var _proto = CodeHeroGame.prototype;
    _proto.updateTimerEl = function updateTimerEl() {
        var timerEl = document.getElementById('codeTimer');
        if (timerEl) timerEl.textContent = "⏱️ " + this.timeLeft + "s";
    };
    _proto.pause = function pause() {
        this.isPaused = true;
    };
    _proto.resume = function resume() {
        this.isPaused = false;
    };
    _proto.start = function start() {
        var _this = this;
        var _document_getElementById, _document_getElementById1;
        _storage.playerState.sessionCoins = 0;
        _storage.playerState.sessionExp = 0;
        this.streak = 0;
        this.qIndex = 0;
        this.timeLeft = this.cfg.startTime;
        this.deck = buildQuestionDeck(this.diff);
        (_document_getElementById = document.getElementById('codeHeroUI')) == null ? void 0 : _document_getElementById.classList.add('show');
        var settingsBtn = document.getElementById('gameSettingsBtn');
        if (settingsBtn) settingsBtn.style.display = 'flex';
        (_document_getElementById1 = document.getElementById('inGameHud')) == null ? void 0 : _document_getElementById1.classList.add('show');
        (0, _runtimeBridge.updateInGameHud)(this.score, this.level, 4);
        this.updateTimerEl();
        this.loadQuestion();
        this.timerId = setInterval(function() {
            if (_this.isPaused || _this.gameOver) return;
            _this.timeLeft = Math.max(0, _this.timeLeft - 1);
            _this.updateTimerEl();
            if (_this.timeLeft <= 0) {
                _this.gameOver = true;
                _this.stop();
                (0, _runtimeBridge.triggerGameOver)(_this.score, _storage.playerState.sessionCoins, _this.level, 4, _this.score >= 50);
            }
        }, 1000);
    };
    _proto.loadQuestion = function loadQuestion() {
        var _this = this;
        if (this.questionTimer) {
            clearTimeout(this.questionTimer);
            this.questionTimer = null;
        }
        var pool = this.deck.length ? this.deck : CODE_HERO_QUESTIONS;
        var item = pool[this.qIndex % pool.length];
        var lessonEl = document.getElementById('codeLesson');
        var qEl = document.getElementById('codeQuestion');
        var coinsEl = document.getElementById('codeCoins');
        var fb = document.getElementById('codeFeedback');
        var optsEl = document.getElementById('codeOptions');
        if (!lessonEl || !qEl || !coinsEl || !fb || !optsEl) return;
        lessonEl.textContent = "[" + item.tier.toUpperCase() + "] " + item.lesson;
        qEl.textContent = "Q" + (this.qIndex + 1) + ": " + item.q;
        coinsEl.textContent = "\uD83E\uDE99 Session: " + _storage.playerState.sessionCoins + (this.streak >= 2 ? " \xb7 \uD83D\uDD25" + this.streak : '');
        fb.textContent = '';
        optsEl.innerHTML = '';
        item.opts.forEach(function(optText, idx) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'code-opt-btn';
            btn.textContent = [
                'A',
                'B',
                'C',
                'D'
            ][idx] + ". " + optText;
            btn.onclick = function() {
                if (_this.gameOver || _this.isPaused) return;
                optsEl.querySelectorAll('button').forEach(function(b) {
                    b.disabled = true;
                });
                if (idx === item.ans) {
                    _audio.ArcadeAudio.play('coin');
                    _this.streak++;
                    var pts = Math.round((20 + Math.min(25, (_this.streak - 1) * 5)) * _this.cfg.scoreMult);
                    var coinBonus = _this.streak >= 3 ? 8 : 5;
                    _this.score += pts;
                    (0, _runtimeBridge.addCoins)(coinBonus);
                    _this.timeLeft = Math.min(60, _this.timeLeft + _this.cfg.bonusTime);
                    _this.updateTimerEl();
                    (0, _runtimeBridge.addXp)(10);
                    if ((_this.qIndex + 1) % 3 === 0) _this.level++;
                    (0, _runtimeBridge.updateInGameHud)(_this.score, _this.level, 4);
                    coinsEl.textContent = "\uD83E\uDE99 Session: " + _storage.playerState.sessionCoins + (_this.streak >= 2 ? " \xb7 \uD83D\uDD25" + _this.streak : '');
                    fb.style.color = '#84fab0';
                    fb.textContent = "✅ Correct! +" + pts + " Score & +" + coinBonus + " Coins (+" + _this.cfg.bonusTime + "s)";
                } else {
                    _this.streak = 0;
                    _audio.ArcadeAudio.play('hurt');
                    if (_this.cfg.penaltyTime > 0) {
                        _this.timeLeft = Math.max(1, _this.timeLeft - _this.cfg.penaltyTime);
                        _this.updateTimerEl();
                    }
                    fb.style.color = '#ff6b6b';
                    fb.textContent = "❌ Incorrect! Answer: " + item.opts[item.ans] + (_this.cfg.penaltyTime > 0 ? " (-" + _this.cfg.penaltyTime + "s)" : '');
                }
                _this.qIndex++;
                _this.questionTimer = setTimeout(function() {
                    _this.questionTimer = null;
                    if (!_this.gameOver && _this.timerId !== null) _this.loadQuestion();
                }, 850);
            };
            optsEl.appendChild(btn);
        });
    };
    _proto.stop = function stop() {
        var _document_getElementById;
        this.gameOver = true;
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        if (this.questionTimer) {
            clearTimeout(this.questionTimer);
            this.questionTimer = null;
        }
        (_document_getElementById = document.getElementById('codeHeroUI')) == null ? void 0 : _document_getElementById.classList.remove('show');
    };
    return CodeHeroGame;
}();

});

})(window.ArcadeMod);

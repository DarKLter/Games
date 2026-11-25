import { ArcadeAudio } from '../../core/audio';
import { addCoins, addXp, triggerGameOver, updateInGameHud } from '../../core/runtimeBridge';
import { playerState } from '../../core/storage';
import { Difficulty, GameInstance } from '../../core/types';

export interface CodeQuestion {
  tier: Difficulty;
  lesson: string;
  q: string;
  opts: string[];
  ans: number;
}

export const CODE_HERO_QUESTIONS: CodeQuestion[] = [
  // Easy Tier (Core Web, JS Basics, Python Basics)
  {
    tier: 'easy',
    lesson: 'In JavaScript, `const` declares a block-scoped variable that cannot be reassigned.',
    q: 'Which keyword creates a constant variable in JavaScript?',
    opts: ['const', 'var', 'let', 'static'],
    ans: 0
  },
  {
    tier: 'easy',
    lesson: 'In CSS Flexbox, `justify-content: center` aligns items along the main horizontal axis.',
    q: 'Which CSS property centers flex items horizontally?',
    opts: ['align-items: center', 'justify-content: center', 'text-align: middle', 'float: center'],
    ans: 1
  },
  {
    tier: 'easy',
    lesson: 'In Python, `len(items)` returns the number of elements in a list, string, or tuple.',
    q: 'What does `len([10, 20, 30])` return in Python?',
    opts: ['2', '30', '3', 'Error'],
    ans: 2
  },
  {
    tier: 'easy',
    lesson: 'HTML semantic tags like `<nav>`, `<main>`, and `<article>` improve accessibility and SEO.',
    q: 'Which HTML tag defines the primary navigation links?',
    opts: ['<links>', '<nav>', '<menu-bar>', '<header-nav>'],
    ans: 1
  },
  {
    tier: 'easy',
    lesson: 'Array `.map()` transforms each element and returns a brand-new array of the same length.',
    q: 'What does `[1, 2, 3].map(x => x * 2)` return?',
    opts: ['[2, 4, 6]', '6', '[1, 2, 3, 2, 4, 6]', 'undefined'],
    ans: 0
  },
  {
    tier: 'easy',
    lesson: 'In SQL, `SELECT DISTINCT` filters out duplicate rows from query results.',
    q: 'Which SQL keyword removes duplicate values in a SELECT query?',
    opts: ['UNIQUE', 'FILTER', 'DISTINCT', 'ONLY'],
    ans: 2
  },
  {
    tier: 'easy',
    lesson: 'In Git, `git status` displays modified, untracked, and staged files in your working tree.',
    q: 'Which Git command shows modified and staged files without committing?',
    opts: ['git check', 'git status', 'git diff-all', 'git stage'],
    ans: 1
  },
  {
    tier: 'easy',
    lesson: 'JSON keys and string values must always use double quotes (`"`), never single quotes.',
    q: 'Which snippet is valid JSON?',
    opts: ["{'name': 'Ada'}", '{"name": "Ada"}', '{name: "Ada"}', '{"name": "Ada",}'],
    ans: 1
  },
  // Medium Tier (TypeScript, DOM, Algorithms, HTTP)
  {
    tier: 'medium',
    lesson: 'Strict equality (`===`) compares both value and runtime type without implicit coercion.',
    q: 'What does `0 === "0"` evaluate to in JavaScript?',
    opts: ['true', 'false', 'TypeError', 'undefined'],
    ans: 1
  },
  {
    tier: 'medium',
    lesson: 'HTTP status code `404` means Not Found; `201` means Created; `401` means Unauthorized.',
    q: 'Which HTTP status code indicates a resource was successfully created?',
    opts: ['200', '201', '204', '301'],
    ans: 1
  },
  {
    tier: 'medium',
    lesson: 'Binary search halves the remaining sorted search space on every comparison: O(log n).',
    q: 'What is the worst-case time complexity of binary search on n sorted items?',
    opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    ans: 1
  },
  {
    tier: 'medium',
    lesson: 'In TypeScript, `unknown` forces type narrowing before property access, unlike `any`.',
    q: 'Which TypeScript type is type-safe until narrowed before use?',
    opts: ['any', 'unknown', 'never', 'object'],
    ans: 1
  },
  {
    tier: 'medium',
    lesson: 'A Set stores unique values; checking membership with `set.has(x)` averages O(1) time.',
    q: 'What is `new Set([1, 2, 2, 3, 1]).size`?',
    opts: ['5', '4', '3', '2'],
    ans: 2
  },
  {
    tier: 'medium',
    lesson: 'Array `.filter()` keeps only elements for which the predicate callback returns truthy.',
    q: 'What does `[5, 12, 8, 20].filter(n => n > 10)` return?',
    opts: ['[12, 20]', '[5, 8]', '[true, false]', '2'],
    ans: 0
  },
  {
    tier: 'medium',
    lesson: 'Python list slicing `[a:b]` includes index `a` and excludes index `b`.',
    q: 'In Python, what does `"ARCADE"[1:4]` evaluate to?',
    opts: ['"ARC"', '"RCA"', '"RCAD"', '"CAD"'],
    ans: 1
  },
  {
    tier: 'medium',
    lesson: '`event.stopPropagation()` stops bubbling to parent handlers without canceling default navigation.',
    q: 'Which DOM method prevents an event from bubbling up to ancestor elements?',
    opts: ['preventDefault()', 'stopPropagation()', 'cancelBubble()', 'haltEvent()'],
    ans: 1
  },
  // Hard Tier (Async JS, React, SQL Joins, Data Structures)
  {
    tier: 'hard',
    lesson: 'Microtasks (Promises, `queueMicrotask`) flush completely after the call stack empties, before macrotasks (`setTimeout`).',
    q: 'In the JS event loop, which runs first after synchronous code finishes?',
    opts: ['setTimeout(..., 0)', 'Promise.then(...) microtask', 'requestAnimationFrame', 'setInterval(..., 0)'],
    ans: 1
  },
  {
    tier: 'hard',
    lesson: 'In React, functional state updates `setCount(c => c + 1)` read the latest queued value across batched renders.',
    q: 'Why pass a callback to a React `setState` setter when incrementing twice in one handler?',
    opts: ['Avoids stale closure state during batching', 'Bypasses virtual DOM diffing', 'Forces synchronous network sync', 'Prevents component unmount'],
    ans: 0
  },
  {
    tier: 'hard',
    lesson: 'A stack follows LIFO (Last-In, First-Out); a queue follows FIFO (First-In, First-Out).',
    q: 'Which data structure does Breadth-First Search (BFS) use to explore level by level?',
    opts: ['Stack (LIFO)', 'Queue (FIFO)', 'Min-Heap only', 'LinkedHashSet only'],
    ans: 1
  },
  {
    tier: 'hard',
    lesson: 'In SQL, `LEFT JOIN` returns every row from the left table even when no right-table row matches.',
    q: 'Which SQL join preserves all left-table rows with NULLs for unmatched right-table columns?',
    opts: ['INNER JOIN', 'CROSS JOIN', 'LEFT JOIN', 'SELF JOIN'],
    ans: 2
  },
  {
    tier: 'hard',
    lesson: 'The nullish coalescing operator `??` falls back only on `null` or `undefined`, keeping `0` and `""`.',
    q: 'What does `0 ?? 42` evaluate to in JavaScript?',
    opts: ['42', '0', 'null', 'false'],
    ans: 1
  },
  {
    tier: 'hard',
    lesson: 'TypeScript `Readonly<T>` marks top-level properties readonly at compile time.',
    q: 'Which TypeScript utility type makes all properties of `T` optional?',
    opts: ['Required<T>', 'Partial<T>', 'Pick<T, K>', 'Record<K, T>'],
    ans: 1
  },
  {
    tier: 'hard',
    lesson: 'CSS `tabular-nums` gives all digits equal advance width so live countdown timers do not jitter.',
    q: 'Which CSS `font-variant-numeric` value keeps live timer digits aligned without horizontal jitter?',
    opts: ['oldstyle-nums', 'proportional-nums', 'tabular-nums', 'lining-nums'],
    ans: 2
  },
  // Extreme Tier (Systems, WebGL/Perf, Security, Algorithms)
  {
    tier: 'extreme',
    lesson: '`Promise.allSettled` waits for every promise to finish regardless of rejections, returning status objects.',
    q: 'Which Promise combinator settles with every outcome even when some promises reject?',
    opts: ['Promise.all', 'Promise.race', 'Promise.any', 'Promise.allSettled'],
    ans: 3
  },
  {
    tier: 'extreme',
    lesson: 'Hash table average lookup is O(1), but worst-case lookup with degenerate collisions degrades to O(n).',
    q: 'What is the theoretical worst-case lookup time for a chained hash table under hash collisions?',
    opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    ans: 2
  },
  {
    tier: 'extreme',
    lesson: 'Calling `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` after resizing `canvas.width/height` keeps HiDPI coordinates crisp.',
    q: 'Why call `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` instead of repeated `ctx.scale(dpr, dpr)` on resize?',
    opts: ['Avoids compounding transforms across resizes', 'Enables WebGL2 hardware AA', 'Clears the alpha channel faster', 'Locks frame rate to 60fps'],
    ans: 0
  },
  {
    tier: 'extreme',
    lesson: 'Parameterized SQL queries separate query structure from user input to prevent SQL injection.',
    q: 'Which defense eliminates SQL injection vulnerabilities at the database driver level?',
    opts: ['Client-side regex stripping', 'Parameterized / prepared statements', 'Base64 encoding strings', 'Checking Content-Length'],
    ans: 1
  },
  {
    tier: 'extreme',
    lesson: 'Topological sort exists if and only if a directed graph is acyclic (a DAG).',
    q: 'Which graph property is required for a valid topological ordering to exist?',
    opts: ['Graph must be undirected', 'Graph must be a Directed Acyclic Graph (DAG)', 'All edge weights must be positive', 'Graph must be complete'],
    ans: 1
  },
  {
    tier: 'extreme',
    lesson: 'In Three.js, GPU buffers allocated by geometries, materials, and textures are freed via `.dispose()`.',
    q: 'What must be called on dynamically created Three.js geometries and materials when tearing down a scene?',
    opts: ['.destroy()', '.gc()', '.dispose()', '.free()'],
    ans: 2
  },
  {
    tier: 'extreme',
    lesson: '`IntersectionObserver` asynchronously reports element visibility without forcing synchronous layout reflows.',
    q: 'Why prefer `IntersectionObserver` over `scroll` + `getBoundingClientRect()` for visibility checks?',
    opts: ['Avoids main-thread layout thrashing on scroll', 'Runs in a Web Worker automatically', 'Supports CSS keyframes natively', 'Compresses DOM nodes'],
    ans: 0
  }
];

const TIER_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2, extreme: 3 };

export function getCodeHeroConfig(diff: Difficulty): { startTime: number; bonusTime: number; penaltyTime: number; scoreMult: number } {
  if (diff === 'extreme') return { startTime: 20, bonusTime: 2, penaltyTime: 2, scoreMult: 3 };
  if (diff === 'hard') return { startTime: 25, bonusTime: 3, penaltyTime: 2, scoreMult: 2 };
  if (diff === 'medium') return { startTime: 30, bonusTime: 4, penaltyTime: 1, scoreMult: 1.5 };
  return { startTime: 35, bonusTime: 5, penaltyTime: 0, scoreMult: 1 };
}

export function buildQuestionDeck(diff: Difficulty): CodeQuestion[] {
  const targetRank = TIER_RANK[diff] ?? 0;
  const primary = CODE_HERO_QUESTIONS.filter((q) => TIER_RANK[q.tier] === targetRank);
  const secondary = CODE_HERO_QUESTIONS.filter((q) => TIER_RANK[q.tier] !== targetRank).sort(
    (a, b) => Math.abs(TIER_RANK[a.tier] - targetRank) - Math.abs(TIER_RANK[b.tier] - targetRank)
  );
  const shuffle = <T>(arr: T[]): T[] => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  return [...shuffle(primary), ...shuffle(secondary)];
}

export class CodeHeroGame implements GameInstance {
  level: number;
  diff: Difficulty;
  score = 0;
  lives = 3;
  maxLives = 3;
  isPaused = false;
  gameOver = false;
  timerId: ReturnType<typeof setInterval> | null = null;
  questionTimer: ReturnType<typeof setTimeout> | null = null;
  timeLeft = 30;
  qIndex = 0;
  streak = 0;
  deck: CodeQuestion[] = [];
  private cfg: ReturnType<typeof getCodeHeroConfig>;

  constructor(lvl: number, diff: Difficulty) {
    this.level = lvl;
    this.diff = diff;
    this.cfg = getCodeHeroConfig(diff);
    this.timeLeft = this.cfg.startTime;
    this.deck = buildQuestionDeck(diff);
  }

  private updateTimerEl(): void {
    const timerEl = document.getElementById('codeTimer');
    if (timerEl) timerEl.textContent = `⏱️ ${this.timeLeft}s`;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  start(): void {
    playerState.sessionCoins = 0;
    playerState.sessionExp = 0;
    this.streak = 0;
    this.qIndex = 0;
    this.timeLeft = this.cfg.startTime;
    this.deck = buildQuestionDeck(this.diff);
    document.getElementById('codeHeroUI')?.classList.add('show');
    const settingsBtn = document.getElementById('gameSettingsBtn');
    if (settingsBtn) settingsBtn.style.display = 'flex';
    document.getElementById('inGameHud')?.classList.add('show');
    updateInGameHud(this.score, this.level, 4);
    this.updateTimerEl();
    this.loadQuestion();
    this.timerId = setInterval(() => {
      if (this.isPaused || this.gameOver) return;
      this.timeLeft = Math.max(0, this.timeLeft - 1);
      this.updateTimerEl();
      if (this.timeLeft <= 0) {
        this.gameOver = true;
        this.stop();
        triggerGameOver(this.score, playerState.sessionCoins, this.level, 4, this.score >= 50);
      }
    }, 1000);
  }

  loadQuestion(): void {
    if (this.questionTimer) {
      clearTimeout(this.questionTimer);
      this.questionTimer = null;
    }
    const pool = this.deck.length ? this.deck : CODE_HERO_QUESTIONS;
    const item = pool[this.qIndex % pool.length];
    const lessonEl = document.getElementById('codeLesson');
    const qEl = document.getElementById('codeQuestion');
    const coinsEl = document.getElementById('codeCoins');
    const fb = document.getElementById('codeFeedback');
    const optsEl = document.getElementById('codeOptions');
    if (!lessonEl || !qEl || !coinsEl || !fb || !optsEl) return;

    lessonEl.textContent = `[${item.tier.toUpperCase()}] ${item.lesson}`;
    qEl.textContent = `Q${this.qIndex + 1}: ${item.q}`;
    coinsEl.textContent = `🪙 Session: ${playerState.sessionCoins}${this.streak >= 2 ? ` · 🔥${this.streak}` : ''}`;
    fb.textContent = '';
    optsEl.innerHTML = '';

    item.opts.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-opt-btn';
      btn.textContent = `${['A', 'B', 'C', 'D'][idx]}. ${optText}`;
      btn.onclick = () => {
        if (this.gameOver || this.isPaused) return;
        optsEl.querySelectorAll('button').forEach((b) => {
          (b as HTMLButtonElement).disabled = true;
        });
        if (idx === item.ans) {
          ArcadeAudio.play('coin');
          this.streak++;
          const pts = Math.round((20 + Math.min(25, (this.streak - 1) * 5)) * this.cfg.scoreMult);
          const coinBonus = this.streak >= 3 ? 8 : 5;
          this.score += pts;
          addCoins(coinBonus);
          this.timeLeft = Math.min(60, this.timeLeft + this.cfg.bonusTime);
          this.updateTimerEl();
          addXp(10);
          if ((this.qIndex + 1) % 3 === 0) this.level++;
          updateInGameHud(this.score, this.level, 4);
          coinsEl.textContent = `🪙 Session: ${playerState.sessionCoins}${this.streak >= 2 ? ` · 🔥${this.streak}` : ''}`;
          fb.style.color = '#84fab0';
          fb.textContent = `✅ Correct! +${pts} Score & +${coinBonus} Coins (+${this.cfg.bonusTime}s)`;
        } else {
          this.streak = 0;
          ArcadeAudio.play('hurt');
          if (this.cfg.penaltyTime > 0) {
            this.timeLeft = Math.max(1, this.timeLeft - this.cfg.penaltyTime);
            this.updateTimerEl();
          }
          fb.style.color = '#ff6b6b';
          fb.textContent = `❌ Incorrect! Answer: ${item.opts[item.ans]}${this.cfg.penaltyTime > 0 ? ` (-${this.cfg.penaltyTime}s)` : ''}`;
        }
        this.qIndex++;
        this.questionTimer = setTimeout(() => {
          this.questionTimer = null;
          if (!this.gameOver && this.timerId !== null) this.loadQuestion();
        }, 850);
      };
      optsEl.appendChild(btn);
    });
  }

  stop(): void {
    this.gameOver = true;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.questionTimer) {
      clearTimeout(this.questionTimer);
      this.questionTimer = null;
    }
    document.getElementById('codeHeroUI')?.classList.remove('show');
  }
}

/**
 * Legacy CSS Downgrade Post-Processor (Android 5 / Chrome 45+ / iOS 10+ Safari / Acode WebView)
 * - Unwraps Tailwind v4 @layer blocks and promotes @property / @supports fallback initial values
 *   unconditionally to *, :before, :after so --tw-gradient-* / --tw-border-style / --tw-scale-*
 *   work identically on BOTH legacy and modern browsers (fixes invisible bg-gradient-* buttons!).
 * - Converts oklch(L C H [/ A]) color tokens to exact sRGB rgb()/rgba().
 * - Strips modern gradient interpolation clauses ("in oklab", "in oklch", "in srgb", "in hsl").
 * - Removes redundant Tailwind @supports (color: color-mix(...)) overrides that broke alpha
 *   fallbacks, and resolves remaining color-mix() expressions using the :root color palette.
 * - Expands inset shorthand, adds 100vh before 100dvh, flattens :where(), adds -webkit- prefixes,
 *   and outputs clean multi-line LF formatting for Acode & VS Code compatibility.
 */

const NAMED_RGB = {
  white: [255, 255, 255],
  black: [0, 0, 0],
  transparent: [0, 0, 0, 0],
};

function clampByte(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function linearToSrgbByte(c) {
  const clamped = Math.max(0, Math.min(1, c));
  const v = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return clampByte(v * 255);
}

/**
 * Standard Bjorn Ottosson OKLCH -> OKLab -> linear sRGB -> sRGB converter.
 */
function oklchToRgba(L, C, Hdeg, alpha) {
  const hRad = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const r = linearToSrgbByte(rLin);
  const g = linearToSrgbByte(gLin);
  const bl = linearToSrgbByte(bLin);

  if (alpha != null && alpha < 0.999) {
    return `rgba(${r},${g},${bl},${+Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
  }
  return `rgb(${r},${g},${bl})`;
}

function convertAllOklch(css) {
  return css.replace(
    /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+)(%?))?\s*\)/gi,
    (_m, lRaw, lPct, cRaw, hRaw, aRaw, aPct) => {
      const L = lPct === '%' ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
      const C = parseFloat(cRaw);
      const H = parseFloat(hRaw);
      let alpha = null;
      if (aRaw != null) {
        alpha = aPct === '%' ? parseFloat(aRaw) / 100 : parseFloat(aRaw);
      }
      return oklchToRgba(L, C, H, alpha);
    }
  );
}

function parseColorToken(token, varMap) {
  const raw = token.trim();
  const s = raw.toLowerCase();
  if (NAMED_RGB[s]) return NAMED_RGB[s];
  if (s.startsWith('var(') && varMap) {
    const m = raw.match(/^var\(\s*(--[a-zA-Z0-9_-]+)/);
    if (m && varMap[m[1]]) {
      return parseColorToken(varMap[m[1]], null);
    }
  }
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    if (hex.length === 4) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
        parseInt(hex[3] + hex[3], 16) / 255,
      ];
    }
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
    if (hex.length === 8) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        parseInt(hex.slice(6, 8), 16) / 255,
      ];
    }
  }
  const rgbMatch = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
  if (rgbMatch) {
    let a = 1;
    if (rgbMatch[4]) {
      a = rgbMatch[4].endsWith('%') ? parseFloat(rgbMatch[4]) / 100 : parseFloat(rgbMatch[4]);
    }
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3]), a];
  }
  return null;
}

function buildRootColorVarMap(css) {
  const map = {};
  const re = /(--color-[a-zA-Z0-9_-]+)\s*:\s*([^;{}]+);/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    map[m[1]] = m[2].trim();
  }
  return map;
}

function splitTopLevelArgs(inner) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function resolveColorMixExpr(inner, varMap) {
  const args = splitTopLevelArgs(inner);
  if (args.length < 3) return 'rgba(255,255,255,0.15)';
  const parsePart = (raw) => {
    const m = raw.match(/^(.*?)\s+([\d.]+)%$/);
    if (m) return { colorStr: m[1].trim(), pct: Math.max(0, Math.min(100, parseFloat(m[2]))) };
    return { colorStr: raw.trim(), pct: null };
  };
  const p1 = parsePart(args[1]);
  const p2 = parsePart(args[2]);

  const alpha = p1.pct != null ? +(p1.pct / 100).toFixed(3) : p2.pct != null ? +(1 - p2.pct / 100).toFixed(3) : 0.5;
  const c1 = parseColorToken(p1.colorStr, varMap);
  const c2 = parseColorToken(p2.colorStr, varMap);

  if (p2.colorStr === 'transparent' || (c2 && c2[3] === 0)) {
    if (c1) {
      const baseA = c1.length >= 4 ? c1[3] : 1;
      return `rgba(${Math.round(c1[0])},${Math.round(c1[1])},${Math.round(c1[2])},${+(baseA * alpha).toFixed(3)})`;
    }
    if (p1.colorStr.startsWith('var(')) return p1.colorStr;
    return `rgba(255,255,255,${alpha})`;
  }
  if (c1 && c2) {
    const w1 = alpha;
    const w2 = 1 - alpha;
    const r = Math.round(c1[0] * w1 + c2[0] * w2);
    const g = Math.round(c1[1] * w1 + c2[1] * w2);
    const b = Math.round(c1[2] * w1 + c2[2] * w2);
    return `rgb(${r},${g},${b})`;
  }
  if (c1) return `rgb(${Math.round(c1[0])},${Math.round(c1[1])},${Math.round(c1[2])})`;
  if (p1.colorStr.startsWith('var(')) return p1.colorStr;
  return 'rgba(255,255,255,0.2)';
}

function findMatchingBrace(css, openBraceIdx) {
  let depth = 0;
  let inQuote = '';
  let inComment = false;
  for (let i = openBraceIdx; i < css.length; i++) {
    const ch = css[i];
    const next = css[i + 1];
    if (inComment) {
      if (ch === '*' && next === '/') {
        inComment = false;
        i++;
      }
      continue;
    }
    if (inQuote) {
      if (ch === '\\') i++;
      else if (ch === inQuote) inQuote = '';
      continue;
    }
    if (ch === '/' && next === '*') {
      inComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Removes Tailwind v4's redundant `@supports (color: color-mix(...)) { ... }` wrapper blocks
 * because Tailwind already emits exact sRGB/rgba fallback declarations directly before them.
 */
function stripColorMixSupportsBlocks(css) {
  let out = css;
  let guard = 0;
  while (guard++ < 3000) {
    const m = out.match(/@supports\s*\([^)]*color-mix\([^)]*\)[^)]*\)\s*\{/);
    if (!m || m.index == null) break;
    const openIdx = m.index + m[0].length - 1;
    const closeIdx = findMatchingBrace(out, openIdx);
    if (closeIdx === -1) break;
    out = out.slice(0, m.index) + out.slice(closeIdx + 1);
  }
  return out;
}

/**
 * Promotes Tailwind v4's `@supports (((-webkit-hyphens:none)) ...)` @property-fallback block
 * unconditionally to top-level rules AND extracts any `@property --*` initial-value declarations
 * into a guaranteed `*, :before, :after` initializer so gradients, borders, rings, and transforms
 * work on EVERY browser (Android 5 WebView through Chrome 130+).
 */
function promoteTailwindPropertyDefaults(css) {
  let out = css;

  // 1. Unwrap Tailwind's @property fallback @supports block so it runs on modern browsers too
  let guard = 0;
  while (guard++ < 30) {
    const m = out.match(/@supports\s*\(\(\(-webkit-hyphens\s*:\s*none\)\)[\s\S]*?\)\s*\{/);
    if (!m || m.index == null) break;
    const openIdx = m.index + m[0].length - 1;
    const closeIdx = findMatchingBrace(out, openIdx);
    if (closeIdx === -1) break;
    const inner = out.slice(openIdx + 1, closeIdx);
    out = out.slice(0, m.index) + inner + out.slice(closeIdx + 1);
  }

  // 2. Extract initial-value from every @property --<name> { ... } block
  const propDefaults = {};
  out = out.replace(/@property\s+(--[a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g, (_m, propName, body) => {
    const initMatch = body.match(/initial-value\s*:\s*([^;]+)/i);
    if (initMatch) {
      propDefaults[propName.trim()] = initMatch[1].trim();
    }
    return '';
  });

  // 3. Guarantee core Tailwind v4 gradient/border/transform custom property defaults
  const requiredDefaults = {
    '--tw-translate-x': '0',
    '--tw-translate-y': '0',
    '--tw-translate-z': '0',
    '--tw-scale-x': '1',
    '--tw-scale-y': '1',
    '--tw-scale-z': '1',
    '--tw-border-style': 'solid',
    '--tw-gradient-position': 'initial',
    '--tw-gradient-from': 'rgba(0,0,0,0)',
    '--tw-gradient-via': 'rgba(0,0,0,0)',
    '--tw-gradient-to': 'rgba(0,0,0,0)',
    '--tw-gradient-stops': 'initial',
    '--tw-gradient-via-stops': 'initial',
    '--tw-gradient-from-position': '0%',
    '--tw-gradient-via-position': '50%',
    '--tw-gradient-to-position': '100%',
    '--tw-shadow': '0 0 rgba(0,0,0,0)',
    '--tw-inset-shadow': '0 0 rgba(0,0,0,0)',
    '--tw-ring-shadow': '0 0 rgba(0,0,0,0)',
    '--tw-inset-ring-shadow': '0 0 rgba(0,0,0,0)',
    '--tw-ring-offset-width': '0px',
    '--tw-ring-offset-color': '#fff',
    '--tw-ring-offset-shadow': '0 0 rgba(0,0,0,0)',
    '--tw-outline-style': 'solid',
  };

  const merged = Object.assign({}, requiredDefaults, propDefaults);
  const decls = Object.keys(merged)
    .map((k) => `${k}:${merged[k]}`)
    .join(';');

  // Prepend only if Tailwind utility variables are referenced in this stylesheet
  if (out.includes('--tw-')) {
    out = `*,:before,:after{${decls}}\n` + out;
  }

  return out;
}

function stripGradientColorSpaceInterpolation(css) {
  // Tailwind v4 emits `--tw-gradient-position: to right in oklab` or `linear-gradient(to right in oklab, ...)`
  // Older browsers (and many Android WebViews) reject the entire gradient if `in oklab` / `in oklch` is present!
  return css
    .replace(/\s+in\s+(?:oklab|oklch|srgb|srgb-linear|hsl|hwb|lab|lch)\b/gi, '')
    .replace(/#0000\b/g, 'rgba(0,0,0,0)');
}

function replaceAllColorMix(css, varMap) {
  let out = css;
  let guard = 0;
  while (out.includes('color-mix(') && guard++ < 5000) {
    const idx = out.indexOf('color-mix(');
    let depth = 0;
    let end = -1;
    for (let i = idx + 'color-mix'.length; i < out.length; i++) {
      if (out[i] === '(') depth++;
      else if (out[i] === ')') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) break;
    const inner = out.slice(idx + 'color-mix('.length, end);
    const replacement = resolveColorMixExpr(inner, varMap);
    out = out.slice(0, idx) + replacement + out.slice(end + 1);
  }
  return out;
}

function unwrapAtLayers(css) {
  let out = css;
  out = out.replace(/@layer\s+[^{;]+;/g, '');

  let guard = 0;
  while (guard++ < 200) {
    const m = out.match(/@layer\b[^{;]*\{/);
    if (!m || m.index == null) break;
    const startIdx = m.index;
    const openBraceIdx = startIdx + m[0].length - 1;
    const closeBraceIdx = findMatchingBrace(out, openBraceIdx);
    if (closeBraceIdx === -1) break;
    const inner = out.slice(openBraceIdx + 1, closeBraceIdx);
    out = out.slice(0, startIdx) + inner + out.slice(closeBraceIdx + 1);
  }
  return out;
}

function expandInsetDeclarations(css) {
  return css.replace(/([;{])inset\s*:\s*([^;}]+)/g, (_m, prefix, rawVal) => {
    const parts = rawVal.trim().split(/\s+/);
    const t = parts[0];
    const r = parts[1] ?? t;
    const b = parts[2] ?? t;
    const l = parts[3] ?? r;
    return `${prefix}top:${t};right:${r};bottom:${b};left:${l}`;
  });
}

function addLegacyViewportFallbacks(css) {
  return css.replace(/([;{])((?:min-|max-)?height)\s*:\s*([\d.]+)(?:d|s|l)vh/g, '$1$2:$3vh;$2:$3dvh');
}

function simplifyWhereSelectors(css) {
  return css.replace(/:where\(([^(),{}]+)\)/g, '$1');
}

function addWebkitPrefixes(css) {
  let out = css;
  out = out.replace(/([;{])backdrop-filter\s*:\s*([^;}]+)/g, '$1-webkit-backdrop-filter:$2;backdrop-filter:$2');
  out = out.replace(/([;{])user-select\s*:\s*([^;}]+)/g, '$1-webkit-user-select:$2;user-select:$2');
  return out;
}

/**
 * Ensures emitted CSS is multi-line LF (never one giant 100 KB line that freezes Acode on Android).
 */
function formatReadableMultilineCss(css) {
  const normalized = css.replace(/\r\n?/g, '\n');
  // Insert newline after closing braces when tightly packed (minified Tailwind output)
  return normalized
    .replace(/\}\s*(?=[^\n\}])/g, '}\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

export function downgradeCssForLegacyBrowsers(cssContent) {
  let css = cssContent;
  css = unwrapAtLayers(css);
  css = convertAllOklch(css);
  const varMap = buildRootColorVarMap(css);
  css = stripColorMixSupportsBlocks(css);
  css = replaceAllColorMix(css, varMap);
  css = promoteTailwindPropertyDefaults(css);
  css = stripGradientColorSpaceInterpolation(css);
  css = expandInsetDeclarations(css);
  css = addLegacyViewportFallbacks(css);
  css = simplifyWhereSelectors(css);
  css = addWebkitPrefixes(css);
  css = formatReadableMultilineCss(css);
  return css;
}

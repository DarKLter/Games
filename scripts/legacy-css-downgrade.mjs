/**
 * Legacy CSS Downgrade Post-Processor (Android 5 / Chrome 45+ / iOS 10+ Safari)
 * Unwraps Tailwind v4 @layer blocks, converts color-mix() to rgba() fallbacks,
 * expands inset shorthand, adds 100vh before 100dvh, flattens :where(), and adds -webkit- prefixes.
 */

const NAMED_RGB = {
  white: [255, 255, 255],
  black: [0, 0, 0],
  transparent: [0, 0, 0, 0],
};

function parseColorToken(token) {
  const s = token.trim().toLowerCase();
  if (NAMED_RGB[s]) return NAMED_RGB[s];
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

function resolveColorMixExpr(inner) {
  const args = splitTopLevelArgs(inner);
  if (args.length < 3) return 'rgba(255,255,255,0.15)';
  // args[0] = "in oklab" / "in srgb", args[1] = "<color1> <pct>%", args[2] = "<color2> [<pct>%]"
  const parsePart = (raw) => {
    const m = raw.match(/^(.*?)\s+([\d.]+)%$/);
    if (m) return { colorStr: m[1].trim(), pct: Math.max(0, Math.min(100, parseFloat(m[2]))) };
    return { colorStr: raw.trim(), pct: null };
  };
  const p1 = parsePart(args[1]);
  const p2 = parsePart(args[2]);

  const alpha = p1.pct != null ? +(p1.pct / 100).toFixed(3) : p2.pct != null ? +(1 - p2.pct / 100).toFixed(3) : 0.5;
  const c1 = parseColorToken(p1.colorStr);
  const c2 = parseColorToken(p2.colorStr);

  if (p2.colorStr === 'transparent' || (c2 && c2[3] === 0)) {
    if (c1) {
      const baseA = c1.length >= 4 ? c1[3] : 1;
      return `rgba(${Math.round(c1[0])},${Math.round(c1[1])},${Math.round(c1[2])},${+(baseA * alpha).toFixed(3)})`;
    }
    // var(--color-...) mixed with transparent -> return the CSS variable or safe rgba
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

function replaceAllColorMix(css) {
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
    const replacement = resolveColorMixExpr(inner);
    out = out.slice(0, idx) + replacement + out.slice(end + 1);
  }
  return out;
}

function unwrapAtLayers(css) {
  let out = css;
  // Remove standalone layer-order statements: @layer theme,base,components,utilities;
  out = out.replace(/@layer\s+[^{;]+;/g, '');

  // Unwrap every @layer ... { ... } block while preserving inner CSS verbatim
  let guard = 0;
  while (guard++ < 200) {
    const m = out.match(/@layer\b[^{;]*\{/);
    if (!m || m.index == null) break;
    const startIdx = m.index;
    const openBraceIdx = startIdx + m[0].length - 1;
    let depth = 0;
    let inQuote = '';
    let inComment = false;
    let closeBraceIdx = -1;

    for (let i = openBraceIdx; i < out.length; i++) {
      const ch = out[i];
      const next = out[i + 1];
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
        if (depth === 0) {
          closeBraceIdx = i;
          break;
        }
      }
    }
    if (closeBraceIdx === -1) break;
    const inner = out.slice(openBraceIdx + 1, closeBraceIdx);
    out = out.slice(0, startIdx) + inner + out.slice(closeBraceIdx + 1);
  }
  return out;
}

function expandInsetDeclarations(css) {
  return css.replace(/([;{])inset\s*:\s*([^;}]+)/g, (_m, prefix, rawVal) => {
    const parts = rawVal.trim().split(/\s+/);
    let t = parts[0];
    let r = parts[1] ?? t;
    let b = parts[2] ?? t;
    let l = parts[3] ?? r;
    return `${prefix}top:${t};right:${r};bottom:${b};left:${l}`;
  });
}

function addLegacyViewportFallbacks(css) {
  // Replace 100dvh / 100svh / 100lvh with safe vh fallback before modern unit
  return css.replace(/([;{])((?:min-|max-)?height)\s*:\s*([\d.]+)(?:d|s|l)vh/g, '$1$2:$3vh;$2:$3dvh');
}

function simplifyWhereSelectors(css) {
  // Flatten single-selector :where(...) so Chrome <88 / Safari <14 match Tailwind preflight/utilities
  return css.replace(/:where\(([^(),{}]+)\)/g, '$1');
}

function addWebkitPrefixes(css) {
  let out = css;
  out = out.replace(/([;{])backdrop-filter\s*:\s*([^;}]+)/g, '$1-webkit-backdrop-filter:$2;backdrop-filter:$2');
  out = out.replace(/([;{])user-select\s*:\s*([^;}]+)/g, '$1-webkit-user-select:$2;user-select:$2');
  return out;
}

export function downgradeCssForLegacyBrowsers(cssContent) {
  let css = cssContent;
  css = unwrapAtLayers(css);
  css = replaceAllColorMix(css);
  css = expandInsetDeclarations(css);
  css = addLegacyViewportFallbacks(css);
  css = simplifyWhereSelectors(css);
  css = addWebkitPrefixes(css);
  css = css.replace(/@property\s+--[^{]+\{[^}]*\}/g, '');
  return css;
}

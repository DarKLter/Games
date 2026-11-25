/**
 * Ultra-Legacy ES5 Pre-Boot Polyfill Runtime (Android 5 / Chrome 45+ / iOS 10+ Safari)
 * Pure ES5 syntax only (var + function) so it parses cleanly before any bundled code runs.
 */
export const LEGACY_POLYFILL_SCRIPT = `(function () {
  var g = typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : this);
  if (!g) return;

  // 1. Pre-boot error diagnostic trap (prevents silent blank screen on ancient WebViews)
  if (!g.__TSEPANG_ERR_TRAP__) {
    g.__TSEPANG_ERR_TRAP__ = true;
    var reportBootErr = function (msg) {
      if (g.__TSEPANG_BOOTED__) return;
      try {
        var st = document.getElementById('arcadeBootStatus');
        var help = document.getElementById('arcadeBootHelp');
        var err = document.getElementById('arcadeBootErr');
        if (st) st.textContent = 'Legacy browser compatibility issue detected.';
        if (help) help.style.display = 'block';
        if (err) err.textContent = String(msg || 'Unknown boot error');
      } catch (_) {}
    };
    g.__TSEPANG_REPORT_BOOT_ERROR__ = reportBootErr;
    var prevOnErr = g.onerror;
    g.onerror = function (message, source, lineno, colno, error) {
      if (!g.__TSEPANG_BOOTED__) {
        reportBootErr((error && error.message ? error.message : message) + (lineno ? ' (line ' + lineno + ')' : ''));
      }
      if (typeof prevOnErr === 'function') {
        return prevOnErr.apply(this, arguments);
      }
      return false;
    };
  }

  // 2. globalThis
  if (typeof g.globalThis === 'undefined') {
    g.globalThis = g;
  }

  // 3. queueMicrotask
  if (typeof g.queueMicrotask !== 'function') {
    g.queueMicrotask = function (cb) {
      if (typeof Promise === 'function') {
        Promise.resolve().then(cb)['catch'](function (e) {
          setTimeout(function () { throw e; }, 0);
        });
      } else {
        setTimeout(cb, 0);
      }
    };
  }

  // 4. Object polyfills (assign, values, entries, fromEntries, hasOwn)
  if (typeof Object.assign !== 'function') {
    Object.assign = function (target) {
      if (target == null) throw new TypeError('Cannot convert undefined or null to object');
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var next = arguments[i];
        if (next != null) {
          for (var k in next) {
            if (Object.prototype.hasOwnProperty.call(next, k)) to[k] = next[k];
          }
        }
      }
      return to;
    };
  }
  if (typeof Object.values !== 'function') {
    Object.values = function (obj) {
      var res = [];
      var keys = Object.keys(obj);
      for (var i = 0; i < keys.length; i++) res.push(obj[keys[i]]);
      return res;
    };
  }
  if (typeof Object.entries !== 'function') {
    Object.entries = function (obj) {
      var res = [];
      var keys = Object.keys(obj);
      for (var i = 0; i < keys.length; i++) res.push([keys[i], obj[keys[i]]]);
      return res;
    };
  }
  if (typeof Object.fromEntries !== 'function') {
    Object.fromEntries = function (entries) {
      var out = {};
      if (!entries) return out;
      if (Array.isArray(entries)) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i]) out[entries[i][0]] = entries[i][1];
        }
      } else if (typeof entries.forEach === 'function') {
        entries.forEach(function (v, k) { out[k] = v; });
      }
      return out;
    };
  }
  if (typeof Object.hasOwn !== 'function') {
    Object.hasOwn = function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(Object(obj), prop);
    };
  }

  // 5. Array polyfills (from, includes, find, findIndex, fill, flat, flatMap, at)
  if (typeof Array.from !== 'function') {
    Array.from = function (list, mapFn, thisArg) {
      var arr = [];
      if (list == null) return arr;
      if (typeof list.length === 'number') {
        for (var i = 0; i < list.length; i++) {
          arr.push(mapFn ? mapFn.call(thisArg, list[i], i) : list[i]);
        }
      } else if (typeof list.forEach === 'function') {
        var idx = 0;
        list.forEach(function (v) {
          arr.push(mapFn ? mapFn.call(thisArg, v, idx++) : v);
        });
      }
      return arr;
    };
  }
  if (typeof Array.prototype.includes !== 'function') {
    Array.prototype.includes = function (val, from) {
      var len = this.length >>> 0;
      if (len === 0) return false;
      var k = Math.max(from >= 0 ? from : len - Math.abs(from || 0), 0);
      while (k < len) {
        if (this[k] === val || (this[k] !== this[k] && val !== val)) return true;
        k++;
      }
      return false;
    };
  }
  if (typeof Array.prototype.find !== 'function') {
    Array.prototype.find = function (pred, thisArg) {
      for (var i = 0; i < this.length; i++) {
        if (pred.call(thisArg, this[i], i, this)) return this[i];
      }
      return undefined;
    };
  }
  if (typeof Array.prototype.findIndex !== 'function') {
    Array.prototype.findIndex = function (pred, thisArg) {
      for (var i = 0; i < this.length; i++) {
        if (pred.call(thisArg, this[i], i, this)) return i;
      }
      return -1;
    };
  }
  if (typeof Array.prototype.fill !== 'function') {
    Array.prototype.fill = function (val, start, end) {
      var len = this.length >>> 0;
      var s = start >> 0;
      var k = s < 0 ? Math.max(len + s, 0) : Math.min(s, len);
      var e = end === undefined ? len : end >> 0;
      var fin = e < 0 ? Math.max(len + e, 0) : Math.min(e, len);
      while (k < fin) { this[k++] = val; }
      return this;
    };
  }
  if (typeof Array.prototype.flat !== 'function') {
    Array.prototype.flat = function (depth) {
      var d = depth === undefined ? 1 : Number(depth) || 0;
      var out = [];
      (function flatten(arr, cur) {
        for (var i = 0; i < arr.length; i++) {
          if (Array.isArray(arr[i]) && cur > 0) flatten(arr[i], cur - 1);
          else out.push(arr[i]);
        }
      })(this, d);
      return out;
    };
  }
  if (typeof Array.prototype.flatMap !== 'function') {
    Array.prototype.flatMap = function (fn, thisArg) {
      var out = [];
      for (var i = 0; i < this.length; i++) {
        var r = fn.call(thisArg, this[i], i, this);
        if (Array.isArray(r)) {
          for (var j = 0; j < r.length; j++) out.push(r[j]);
        } else {
          out.push(r);
        }
      }
      return out;
    };
  }
  if (typeof Array.prototype.at !== 'function') {
    Array.prototype.at = function (idx) {
      var n = Math.trunc(idx) || 0;
      var k = n < 0 ? this.length + n : n;
      return k >= 0 && k < this.length ? this[k] : undefined;
    };
  }

  // 6. String & Number & Math polyfills
  if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (s, pos) {
      pos = !pos || pos < 0 ? 0 : +pos;
      return this.substring(pos, pos + s.length) === s;
    };
  }
  if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (s, len) {
      if (len === undefined || len > this.length) len = this.length;
      return this.substring(len - s.length, len) === s;
    };
  }
  if (typeof String.prototype.includes !== 'function') {
    String.prototype.includes = function (s, pos) {
      return this.indexOf(s, pos || 0) !== -1;
    };
  }
  if (typeof String.prototype.repeat !== 'function') {
    String.prototype.repeat = function (count) {
      var n = Math.floor(Number(count) || 0);
      var out = '';
      for (var i = 0; i < n; i++) out += this;
      return out;
    };
  }
  if (typeof String.prototype.padStart !== 'function') {
    String.prototype.padStart = function (targetLen, padStr) {
      var str = String(this);
      targetLen = targetLen >> 0;
      padStr = String(padStr !== undefined ? padStr : ' ');
      if (str.length >= targetLen || !padStr) return str;
      var fill = targetLen - str.length;
      while (padStr.length < fill) padStr += padStr;
      return padStr.slice(0, fill) + str;
    };
  }
  if (typeof String.prototype.padEnd !== 'function') {
    String.prototype.padEnd = function (targetLen, padStr) {
      var str = String(this);
      targetLen = targetLen >> 0;
      padStr = String(padStr !== undefined ? padStr : ' ');
      if (str.length >= targetLen || !padStr) return str;
      var fill = targetLen - str.length;
      while (padStr.length < fill) padStr += padStr;
      return str + padStr.slice(0, fill);
    };
  }
  if (typeof String.prototype.trimStart !== 'function') {
    String.prototype.trimStart = function () { return this.replace(/^\\s+/, ''); };
  }
  if (typeof String.prototype.trimEnd !== 'function') {
    String.prototype.trimEnd = function () { return this.replace(/\\s+$/, ''); };
  }
  if (typeof String.prototype.replaceAll !== 'function') {
    String.prototype.replaceAll = function (search, rep) {
      if (search instanceof RegExp) {
        return this.replace(search.global ? search : new RegExp(search.source, search.flags + 'g'), rep);
      }
      return this.split(String(search)).join(String(rep));
    };
  }
  if (typeof Number.isNaN !== 'function') {
    Number.isNaN = function (v) { return typeof v === 'number' && v !== v; };
  }
  if (typeof Number.isFinite !== 'function') {
    Number.isFinite = function (v) { return typeof v === 'number' && isFinite(v); };
  }
  if (typeof Number.isInteger !== 'function') {
    Number.isInteger = function (v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v; };
  }
  if (typeof Math.trunc !== 'function') {
    Math.trunc = function (v) { var n = +v; return n < 0 ? Math.ceil(n) : Math.floor(n); };
  }
  if (typeof Math.sign !== 'function') {
    Math.sign = function (v) { var n = +v; return (n === 0 || isNaN(n)) ? n : (n > 0 ? 1 : -1); };
  }
  if (typeof Math.hypot !== 'function') {
    Math.hypot = function () {
      var sum = 0;
      for (var i = 0; i < arguments.length; i++) sum += arguments[i] * arguments[i];
      return Math.sqrt(sum);
    };
  }
  if (typeof Math.imul !== 'function') {
    Math.imul = function (a, b) {
      var ah = (a >>> 16) & 0xffff, al = a & 0xffff;
      var bh = (b >>> 16) & 0xffff, bl = b & 0xffff;
      return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
    };
  }
  if (typeof Math.clz32 !== 'function') {
    Math.clz32 = function (x) {
      var n = x >>> 0;
      return n ? 31 - Math.floor(Math.log(n + 0.5) * Math.LOG2E) : 32;
    };
  }

  // 7. Promise helpers (finally, allSettled)
  if (typeof Promise === 'function') {
    if (typeof Promise.prototype['finally'] !== 'function') {
      Promise.prototype['finally'] = function (cb) {
        var P = this.constructor;
        return this.then(
          function (v) { return P.resolve(cb()).then(function () { return v; }); },
          function (r) { return P.resolve(cb()).then(function () { throw r; }); }
        );
      };
    }
    if (typeof Promise.allSettled !== 'function') {
      Promise.allSettled = function (arr) {
        return Promise.all(Array.from(arr).map(function (p) {
          return Promise.resolve(p).then(
            function (value) { return { status: 'fulfilled', value: value }; },
            function (reason) { return { status: 'rejected', reason: reason }; }
          );
        }));
      };
    }
  }

  // 8. structuredClone fallback
  if (typeof g.structuredClone !== 'function') {
    g.structuredClone = function (val) {
      return val === undefined ? undefined : JSON.parse(JSON.stringify(val));
    };
  }

  // 9. URLSearchParams minimal polyfill (Android 5 / iOS 10.0)
  if (typeof g.URLSearchParams !== 'function') {
    g.URLSearchParams = function (init) {
      this._map = {};
      var q = String(init || '').replace(/^\\?/, '');
      if (q) {
        var pairs = q.split('&');
        for (var i = 0; i < pairs.length; i++) {
          var idx = pairs[i].indexOf('=');
          var k = decodeURIComponent((idx >= 0 ? pairs[i].slice(0, idx) : pairs[i]).replace(/\\+/g, ' '));
          var v = idx >= 0 ? decodeURIComponent(pairs[i].slice(idx + 1).replace(/\\+/g, ' ')) : '';
          if (k) this._map[k] = v;
        }
      }
    };
    g.URLSearchParams.prototype.get = function (k) { return Object.prototype.hasOwnProperty.call(this._map, k) ? this._map[k] : null; };
    g.URLSearchParams.prototype.has = function (k) { return Object.prototype.hasOwnProperty.call(this._map, k); };
    g.URLSearchParams.prototype.set = function (k, v) { this._map[k] = String(v); };
  }

  // 10. DOM & NodeList shims (matches, closest, remove, forEach, DOMTokenList.toggle force arg)
  if (typeof Element !== 'undefined') {
    var ep = Element.prototype;
    if (!ep.matches) {
      ep.matches = ep.webkitMatchesSelector || ep.msMatchesSelector || ep.mozMatchesSelector || function () { return false; };
    }
    if (!ep.closest) {
      ep.closest = function (sel) {
        var el = this;
        while (el && el.nodeType === 1) {
          if (el.matches(sel)) return el;
          el = el.parentElement || el.parentNode;
        }
        return null;
      };
    }
    if (!ep.remove) {
      ep.remove = function () { if (this.parentNode) this.parentNode.removeChild(this); };
    }
    if (!ep.toggleAttribute) {
      ep.toggleAttribute = function (name, force) {
        var has = this.hasAttribute(name);
        if (force === true || (force === undefined && !has)) { this.setAttribute(name, ''); return true; }
        if (force === false || (force === undefined && has)) { this.removeAttribute(name); return false; }
        return this.hasAttribute(name);
      };
    }
    if (!ep.setPointerCapture) ep.setPointerCapture = function () {};
    if (!ep.releasePointerCapture) ep.releasePointerCapture = function () {};
  }
  if (typeof NodeList !== 'undefined' && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  // 11. requestAnimationFrame / performance.now / AudioContext shims
  if (typeof g.requestAnimationFrame !== 'function') {
    g.requestAnimationFrame = g.webkitRequestAnimationFrame || g.mozRequestAnimationFrame || function (cb) {
      return g.setTimeout(function () { cb(Date.now()); }, 16);
    };
  }
  if (typeof g.cancelAnimationFrame !== 'function') {
    g.cancelAnimationFrame = g.webkitCancelAnimationFrame || g.mozCancelAnimationFrame || function (id) {
      g.clearTimeout(id);
    };
  }
  if (typeof g.performance === 'undefined' || typeof g.performance.now !== 'function') {
    var startTs = Date.now();
    g.performance = { now: function () { return Date.now() - startTs; } };
  }
  if (typeof g.AudioContext === 'undefined' && typeof g.webkitAudioContext !== 'undefined') {
    g.AudioContext = g.webkitAudioContext;
  }

  // 12. CanvasRenderingContext2D.prototype.roundRect (CRITICAL: fixes 78 calls on Chrome <99 / Safari <15.4)
  if (typeof CanvasRenderingContext2D !== 'undefined' && typeof CanvasRenderingContext2D.prototype.roundRect !== 'function') {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
      var r = [0, 0, 0, 0];
      var parseR = function (v) {
        if (typeof v === 'number') return Math.max(0, v);
        if (v && typeof v === 'object') return Math.max(0, Number(v.x || v.y || 0));
        return 0;
      };
      if (typeof radii === 'number' || (radii && typeof radii === 'object' && !Array.isArray(radii))) {
        var rv = parseR(radii);
        r = [rv, rv, rv, rv];
      } else if (Array.isArray(radii) && radii.length) {
        if (radii.length === 1) { var a = parseR(radii[0]); r = [a, a, a, a]; }
        else if (radii.length === 2) { var b0 = parseR(radii[0]), b1 = parseR(radii[1]); r = [b0, b1, b0, b1]; }
        else if (radii.length === 3) { var c0 = parseR(radii[0]), c1 = parseR(radii[1]), c2 = parseR(radii[2]); r = [c0, c1, c2, c1]; }
        else { r = [parseR(radii[0]), parseR(radii[1]), parseR(radii[2]), parseR(radii[3])]; }
      }
      if (w < 0) { x += w; w = -w; }
      if (h < 0) { y += h; h = -h; }
      var maxR = Math.min(w * 0.5, h * 0.5);
      for (var i = 0; i < 4; i++) { if (r[i] > maxR) r[i] = maxR; }
      this.moveTo(x + r[0], y);
      this.lineTo(x + w - r[1], y);
      if (r[1] > 0) this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
      this.lineTo(x + w, y + h - r[2]);
      if (r[2] > 0) this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
      this.lineTo(x + r[3], y + h);
      if (r[3] > 0) this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
      this.lineTo(x, y + r[0]);
      if (r[0] > 0) this.quadraticCurveTo(x, y, x + r[0], y);
      this.closePath();
      return this;
    };
  }

  // 13. ResizeObserver fallback (Chrome <64 / Safari <13.1)
  if (typeof g.ResizeObserver === 'undefined') {
    g.ResizeObserver = function (callback) {
      this._cb = callback;
      this._targets = [];
      this._timer = null;
      var self = this;
      this._check = function () {
        var entries = [];
        for (var i = 0; i < self._targets.length; i++) {
          var t = self._targets[i];
          var rect = t.el.getBoundingClientRect ? t.el.getBoundingClientRect() : { width: 0, height: 0, top: 0, left: 0 };
          if (rect.width !== t.w || rect.height !== t.h) {
            t.w = rect.width;
            t.h = rect.height;
            entries.push({ target: t.el, contentRect: rect });
          }
        }
        if (entries.length && typeof self._cb === 'function') {
          try { self._cb(entries, self); } catch (_) {}
        }
      };
      this._onWinResize = function () { self._check(); };
    };
    g.ResizeObserver.prototype.observe = function (el) {
      if (!el) return;
      this._targets.push({ el: el, w: -1, h: -1 });
      if (this._targets.length === 1) {
        g.addEventListener('resize', this._onWinResize);
        this._timer = g.setInterval(this._check, 350);
      }
      var self = this;
      g.setTimeout(function () { self._check(); }, 0);
    };
    g.ResizeObserver.prototype.unobserve = function (el) {
      this._targets = this._targets.filter(function (t) { return t.el !== el; });
      if (!this._targets.length) this.disconnect();
    };
    g.ResizeObserver.prototype.disconnect = function () {
      this._targets = [];
      g.removeEventListener('resize', this._onWinResize);
      if (this._timer) { g.clearInterval(this._timer); this._timer = null; }
    };
  }

  // 14. Touch-to-Pointer Event Bridge (CRITICAL for iOS 10-12 Safari & Android 5-6 WebViews lacking PointerEvent)
  if (typeof g.PointerEvent === 'undefined' && typeof document !== 'undefined') {
    var dispatchPtr = function (type, src, target, pointerId, pointerType, buttons) {
      if (!target) return;
      var ev;
      try {
        ev = document.createEvent('Event');
        ev.initEvent(type, true, true);
      } catch (_) {
        return;
      }
      ev.pointerId = pointerId;
      ev.pointerType = pointerType;
      ev.isPrimary = true;
      ev.buttons = buttons;
      ev.button = 0;
      ev.clientX = src.clientX || 0;
      ev.clientY = src.clientY || 0;
      ev.pageX = src.pageX || 0;
      ev.pageY = src.pageY || 0;
      ev.screenX = src.screenX || 0;
      ev.screenY = src.screenY || 0;
      target.dispatchEvent(ev);
    };
    var touchTargetMap = {};
    document.addEventListener('touchstart', function (e) {
      var list = e.changedTouches || [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        touchTargetMap[t.identifier] = t.target || e.target;
        dispatchPtr('pointerdown', t, touchTargetMap[t.identifier], t.identifier + 1, 'touch', 1);
      }
    }, true);
    document.addEventListener('touchmove', function (e) {
      var list = e.changedTouches || [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        var tgt = touchTargetMap[t.identifier] || t.target || e.target;
        dispatchPtr('pointermove', t, tgt, t.identifier + 1, 'touch', 1);
      }
    }, true);
    document.addEventListener('touchend', function (e) {
      var list = e.changedTouches || [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        var tgt = touchTargetMap[t.identifier] || t.target || e.target;
        delete touchTargetMap[t.identifier];
        dispatchPtr('pointerup', t, tgt, t.identifier + 1, 'touch', 0);
      }
    }, true);
    document.addEventListener('touchcancel', function (e) {
      var list = e.changedTouches || [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        var tgt = touchTargetMap[t.identifier] || t.target || e.target;
        delete touchTargetMap[t.identifier];
        dispatchPtr('pointercancel', t, tgt, t.identifier + 1, 'touch', 0);
      }
    }, true);
  }
})();`;

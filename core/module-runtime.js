/* Tsepang Arcade Live Modular Classic-ES5 Runtime (Zero fetch, Zero ES Modules) */
(function(global){
  "use strict";
  global.ARCADE_BUILD_VERSION = "Tsepang Arcade · Live Modular v2.6 (rev ?v=8 · Hoops 2K26 Part 7 Complete 7-Tab Settings, Sliders, HUD Editor, Replay & MVP · Offline Ready)";
  var defs = {};
  var aliases = {};
  var chunkStore = {};
  var cache = {};

  function stripExt(p) {
    return p.replace(/\.(tsx|ts|jsx|mjs|cjs|js)$/i, "");
  }

  function normalizePath(baseId, req) {
    if (!req) return "";
    if (req.indexOf("./") !== 0 && req.indexOf("../") !== 0) {
      return aliases[req] || req;
    }
    var baseParts = baseId.split("/");
    baseParts.pop();
    var reqParts = req.split("/");
    for (var i = 0; i < reqParts.length; i++) {
      var seg = reqParts[i];
      if (!seg || seg === ".") continue;
      if (seg === "..") {
        if (baseParts.length > 0) baseParts.pop();
      } else {
        baseParts.push(seg);
      }
    }
    var joined = baseParts.join("/");
    return aliases[joined] || joined;
  }

  function resolveId(baseId, req) {
    if (/\.css(\?.*)?$/i.test(req)) return "__CSS_NOOP__";
    var direct = normalizePath(baseId, req);
    if (defs[direct]) return direct;
    var stripped = stripExt(direct);
    if (defs[stripped]) return stripped;
    if (aliases[stripped] && defs[aliases[stripped]]) return aliases[stripped];
    if (defs[stripped + "/index"]) return stripped + "/index";
    if (defs[direct + "/index"]) return direct + "/index";
    return stripped;
  }

  function loadModule(id) {
    if (id === "__CSS_NOOP__") return {};
    if (aliases[id]) id = aliases[id];
    if (cache[id]) return cache[id].exports;
    var factory = defs[id];
    if (!factory) {
      throw new Error("ArcadeMod: module not found -> " + id);
    }
    var mod = { exports: {} };
    cache[id] = mod;
    var localRequire = function(spec) {
      var target = resolveId(id, spec);
      return loadModule(target);
    };
    factory(localRequire, mod, mod.exports);
    return mod.exports;
  }

  global.ArcadeMod = {
    define: function(id, factory) {
      defs[id] = factory;
    },
    alias: function(fromId, toId) {
      aliases[fromId] = toId;
    },
    defineChunk: function(id, partIdx, totalParts, partStr) {
      if (!chunkStore[id]) chunkStore[id] = new Array(totalParts);
      chunkStore[id][partIdx] = partStr;
      var ready = true;
      for (var i = 0; i < totalParts; i++) {
        if (typeof chunkStore[id][i] !== "string") {
          ready = false;
          break;
        }
      }
      if (ready) {
        var joined = chunkStore[id].join("");
        delete chunkStore[id];
        defs[id] = new Function("require", "module", "exports", joined);
      }
    },
    require: function(id) {
      return loadModule(resolveId("", id));
    },
    has: function(id) {
      return Boolean(defs[id] || aliases[id]);
    }
  };
})(window);

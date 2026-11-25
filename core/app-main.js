(function(ArcadeMod){
// === MODULE: src/main ===
ArcadeMod.define("src/main", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _jsxruntime = require("react/jsx-runtime");
var _client = require("react-dom/client");
var _arcadeGlobal = require("./core/arcadeGlobal");
var _viewport = require("./core/viewport");
var _Apptsx = /*#__PURE__*/ _interop_require_default(require("./App.tsx"));
require("./index.css");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
(0, _viewport.installBrowserPolyfills)();
(0, _arcadeGlobal.installArcadeGlobal)();
function mountApp() {
    var win = window;
    if (win.__TSEPANG_BOOTED__) return;
    var rootEl = document.getElementById('root');
    if (rootEl) {
        win.__TSEPANG_BOOTED__ = true;
        var bootStyle = document.getElementById('arcade-boot-style');
        if (bootStyle) bootStyle.remove();
        (0, _client.createRoot)(rootEl).render(/*#__PURE__*/ (0, _jsxruntime.jsx)(_Apptsx.default, {}));
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp, {
        once: true
    });
} else {
    mountApp();
}

});
ArcadeMod.require("src/main");
})(window.ArcadeMod);

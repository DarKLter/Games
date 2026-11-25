(function(ArcadeMod){
ArcadeMod.define("src/main",function(require,module,exports){
Object.defineProperty(exports,"__esModule",{value:!0});var e,r=require("react/jsx-runtime"),t=require("react-dom/client"),o=require("./core/arcadeGlobal"),a=require("./core/viewport"),d=(e=require("./App.tsx"))&&e.__esModule?e:{default:e};function n(){var e=window;if(!e.__TSEPANG_BOOTED__){var o=document.getElementById("root");if(o){e.__TSEPANG_BOOTED__=!0;var a=document.getElementById("arcade-boot-style");a&&a.remove(),(0,t.createRoot)(o).render((0,r.jsx)(d.default,{}))}}}require("./index.css"),(0,a.installBrowserPolyfills)(),(0,o.installArcadeGlobal)(),"loading"===document.readyState?document.addEventListener("DOMContentLoaded",n,{once:!0}):n();
});
ArcadeMod.require("src/main");
})(window.ArcadeMod);

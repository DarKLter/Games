import { GAME_LIST } from "../instructions";
import { GameCategory } from "../types";

export const THEME_PRESETS = [
  { gradient: "linear-gradient(135deg, #141e14, #228b22)", accent: "#84fab0", bg: "rgba(20, 30, 20, 0.92)", text: "#ffffff", label: "Forest Theme" },
  { gradient: "linear-gradient(135deg, #1a0933, #7b2cbf)", accent: "#e0aaff", bg: "rgba(26, 9, 51, 0.92)", text: "#ffffff", label: "Royal Purple Theme" },
  { gradient: "linear-gradient(135deg, #03045e, #0077b6)", accent: "#90e0ef", bg: "rgba(3, 4, 94, 0.92)", text: "#ffffff", label: "Ocean Theme" },
  { gradient: "linear-gradient(135deg, #3d0000, #ff0000)", accent: "#ffb3b3", bg: "rgba(61, 0, 0, 0.92)", text: "#ffffff", label: "Crimson Theme" },
  { gradient: "linear-gradient(135deg, #1f1f1f, #434343)", accent: "#ffd700", bg: "rgba(31, 31, 31, 0.92)", text: "#ffffff", label: "Gold Noir Theme" }
];

export const TOTAL_3D_GAMES = GAME_LIST.filter((g) => Boolean(g.is3DGame)).length;
export const TOTAL_2D_GAMES = GAME_LIST.length - TOTAL_3D_GAMES;

export const ARCADE_CATEGORIES: Array<{ key: "all" | GameCategory; label: string }> = [
  { key: "all", label: "All" },
  { key: "action", label: "Action" },
  { key: "racing", label: "Racing" },
  { key: "shooter", label: "Shooter" },
  { key: "puzzle", label: "Puzzle" },
  { key: "strategy", label: "Strategy" },
  { key: "sports", label: "Sports" },
  { key: "arcade", label: "Arcade" }
];

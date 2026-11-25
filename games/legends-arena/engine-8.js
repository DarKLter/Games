(function(ArcadeMod){
// === MODULE CHUNK: src/games/legends-arena/mlbb/engine/GameEngine (4/4) ===
ArcadeMod.defineChunk("src/games/legends-arena/mlbb/engine/GameEngine", 3, 4, [
  "                noCooldown: this.cheatNoCooldown,\n",
  "                godMode: this.cheatGodMode,\n",
  "                dummyAlive: this.heroes.some(function(h) {\n",
  "                    return h.isTrainingDummy && h.alive;\n",
  "                }),\n",
  "                turretsInvincible: this.cheatTurretsInvincible,\n",
  "                dummyDps: Math.round(this.dummyDamageEvents.filter(function(ev) {\n",
  "                    return _this.matchTimeSec - ev.time <= 5;\n",
  "                }).reduce(function(s, ev) {\n",
  "                    return s + ev.amount;\n",
  "                }, 0) / 5),\n",
  "                dummyLastHit: this.dummyLastHit,\n",
  "                dummyTotalDmg: this.dummyTotalDmg,\n",
  "                dummyPeakBurst: this.dummyPeakBurst\n",
  "            },\n",
  "            angelaAttachChoices: p.heroDef.id === 'angela' && p.skillLevels[2] > 0 && p.skillCds[2] <= 0 ? teammates.filter(function(t) {\n",
  "                return t.alive;\n",
  "            }).map(function(t) {\n",
  "                return {\n",
  "                    id: t.id,\n",
  "                    name: t.name,\n",
  "                    hpPct: t.hpPct,\n",
  "                    color: t.color\n",
  "                };\n",
  "            }) : []\n",
  "        };\n",
  "    };\n",
  "    return MlbbGameEngine;\n",
  "}();\n"
].join(""));

})(window.ArcadeMod);

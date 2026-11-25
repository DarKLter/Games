// ============================================================================
// PART 6 — FULL MyPLAYER BUILDER & 5-SLOT BUILD MANAGER
// Features:
// - 5 Persistent Build Slots + instant [⚡ SWAP BUILD] switcher
// - Step 1: Vitals & Body (Name, Jersey #, Position PG-C, Height 5'9"-7'4",
//   Weight, Wingspan dynamically shifting attribute caps, Appearance/Gear with
//   live 3D rotating Three.js preview!)
// - Step 2: 99-OVR Attribute Allocator across all 18 attributes (25-99) +
//   2K26 Cap Breakers (+1..+5), Dynamic Archetype Build Name Generator, and
//   live 2K26 5-Tier Badge Threshold Calculator (Bronze..Legend)
// - Step 3: Custom Jumpshot Speed, Primary Takeover & VC Attribute Upgrades
// ============================================================================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ATTRIBUTE_META,
  BADGE_CATALOG,
  type ArmSleeveOption,
  type AttributeKey,
  type HairStyle,
  type PlayerPosition,
} from '../hybrid/rosterTypes';
import { useUltimateHybridStore } from '../hybrid/store';
import { HybridAudioEngine } from '../hybrid/audioEngine';
import type { UIEraMode } from '../hybrid/types';
import {
  BUILD_MAX_ATTR_BUDGET,
  clampNum,
  computeAttributePointBudgetUsed,
  computeBuildOvr,
  computeDynamicAttributeCaps,
  computeUnlockedBadges5Tier,
  deriveBuildArchetypeName,
  formatHeightInches,
  getEffectiveBuildAttributes,
  ModesStore,
  useModesStore,
} from './modesStore';
import {
  JUMPSHOT_SPEED_OPTIONS,
  TAKEOVER_OPTIONS,
  type MyPlayerBuildSlot,
} from './modesTypes';
import './modesHud.css';

export interface MyPlayerBuilderProps {
  eraMode: UIEraMode;
  onBack: () => void;
  onEnterCity: () => void;
  onNotify: (msg: string) => void;
}

const POSITIONS: PlayerPosition[] = ['PG', 'SG', 'SF', 'PF', 'C'];
const SKIN_SWATCHES = ['#f5cba7', '#d8a47f', '#c68642', '#8d5524', '#5c3818', '#3b2210'];
const HAIR_STYLES: HairStyle[] = ['FADE', 'BUZZ', 'AFRO', 'DREADS', 'BRAIDS', 'SHORT', 'PONYTAIL', 'BALD'];

function detectSoftwareGl(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

// Live 3D Rotating Preview of the MyPLAYER Build
const MyPlayer3DTurntable: React.FC<{ draft: MyPlayerBuildSlot }> = ({ draft }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const isSoftwareGl = detectSoftwareGl();

    const renderer = new THREE.WebGLRenderer({ antialias: !isSoftwareGl, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(el.clientWidth || 300, el.clientHeight || 340);
    el.innerHTML = '';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(36, (el.clientWidth || 300) / (el.clientHeight || 340), 0.1, 40);
    camera.position.set(0, 1.45, 4.1);
    camera.lookAt(0, 1.15, 0);

    scene.add(new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.8));
    const key = new THREE.DirectionalLight(0xfff1d6, 1.5);
    key.position.set(3, 5, 4);
    scene.add(key);

    // Pedestal ring
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.08, 0.16, 28),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.6 })
    );
    pedestal.position.y = 0.08;
    scene.add(pedestal);
    const trimRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.96, 0.03, 10, 32),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.45, metalness: 0.8, roughness: 0.2 })
    );
    trimRing.rotation.x = Math.PI / 2;
    trimRing.position.y = 0.17;
    scene.add(trimRing);

    const avatarGroup = new THREE.Group();
    avatarGroup.position.y = 0.16;
    scene.add(avatarGroup);

    const rebuildAvatar = (b: MyPlayerBuildSlot) => {
      while (avatarGroup.children.length > 0) {
        const ch = avatarGroup.children.pop()!;
        avatarGroup.remove(ch);
      }
      const skinMat = new THREE.MeshStandardMaterial({ color: b.cosmetics.skinTone || '#8d5524', roughness: 0.62 });
      const jerseyMat = new THREE.MeshStandardMaterial({ color: b.cosmetics.headbandColor || '#06b6d4', roughness: 0.52 });
      const shortsMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.65 });
      const sleeveMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 });
      const shoeMat = new THREE.MeshStandardMaterial({ color: b.cosmetics.shoeColor || '#f59e0b', roughness: 0.3, metalness: 0.25 });
      const hairMat = new THREE.MeshStandardMaterial({ color: b.cosmetics.hairColor || '#111827', roughness: 0.85 });

      const hScale = THREE.MathUtils.clamp((b.heightInches - 58) / 20, 0.85, 1.24);
      const wScale = THREE.MathUtils.clamp(0.84 + (b.weightLbs - 165) / 340, 0.84, 1.22);
      const armLen = THREE.MathUtils.clamp(0.6 + (b.wingspanInches - b.heightInches) * 0.025, 0.52, 0.82);
      avatarGroup.scale.set(wScale, hScale, wScale);

      // Legs
      const legMat = b.cosmetics.legCompression ? shortsMat : skinMat;
      const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.78, 0.18), legMat);
      lLeg.position.set(-0.14, 0.46, 0);
      avatarGroup.add(lLeg);
      const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.78, 0.18), legMat);
      rLeg.position.set(0.14, 0.46, 0);
      avatarGroup.add(rLeg);

      // Sneakers
      const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.32), shoeMat);
      lShoe.position.set(-0.14, 0.07, 0.05);
      avatarGroup.add(lShoe);
      const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.32), shoeMat);
      rShoe.position.set(0.14, 0.07, 0.05);
      avatarGroup.add(rShoe);

      // Shorts + Jersey Torso
      const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.3), shortsMat);
      shorts.position.y = 0.92;
      avatarGroup.add(shorts);
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.66, 0.28), jerseyMat);
      torso.position.y = 1.4;
      avatarGroup.add(torso);

      // Arms scaled by Wingspan
      const lArmMat = b.cosmetics.armSleeve === 'LEFT' || b.cosmetics.armSleeve === 'BOTH' ? sleeveMat : skinMat;
      const rArmMat = b.cosmetics.armSleeve === 'RIGHT' || b.cosmetics.armSleeve === 'BOTH' ? sleeveMat : skinMat;
      const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, armLen, 0.14), lArmMat);
      lArm.position.set(-0.36, 1.66 - armLen / 2, 0);
      avatarGroup.add(lArm);
      const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, armLen, 0.14), rArmMat);
      rArm.position.set(0.36, 1.66 - armLen / 2, 0);
      avatarGroup.add(rArm);

      // Head + Hair + Headband
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 14), skinMat);
      head.position.y = 1.94;
      avatarGroup.add(head);

      if (b.cosmetics.hairStyle !== 'BALD') {
        const hairH = b.cosmetics.hairStyle === 'AFRO' ? 0.24 : b.cosmetics.hairStyle === 'DREADS' ? 0.22 : 0.13;
        const hairR = b.cosmetics.hairStyle === 'AFRO' ? 0.24 : 0.205;
        const hair = new THREE.Mesh(new THREE.SphereGeometry(hairR, 14, 12), hairMat);
        hair.position.y = 2.02 + hairH * 0.22;
        avatarGroup.add(hair);
      }

      if (b.cosmetics.headband) {
        const hb = new THREE.Mesh(
          new THREE.CylinderGeometry(0.21, 0.21, 0.06, 18),
          new THREE.MeshStandardMaterial({ color: b.cosmetics.headbandColor || '#f59e0b', roughness: 0.45 })
        );
        hb.position.y = 2.01;
        avatarGroup.add(hb);
      }
    };

    rebuildAvatar(draftRef.current);

    let disposed = false;
    let frameId = 0;
    let lastTs = performance.now();

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      avatarGroup.rotation.y += dt * 0.65;
      renderer.render(scene, camera);
      if (isSoftwareGl) {
        frameId = window.setTimeout(tick, 90);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      envTex.dispose();
      renderer.dispose();
    };
  }, [
    draft.heightInches,
    draft.weightLbs,
    draft.wingspanInches,
    draft.cosmetics.skinTone,
    draft.cosmetics.hairStyle,
    draft.cosmetics.headband,
    draft.cosmetics.headbandColor,
    draft.cosmetics.armSleeve,
    draft.cosmetics.legCompression,
    draft.cosmetics.shoeColor,
  ]);

  return <div ref={hostRef} className="h2k-builder-turntable" />;
};

export const MyPlayerBuilder: React.FC<MyPlayerBuilderProps> = ({
  eraMode,
  onBack,
  onEnterCity,
  onNotify,
}) => {
  const hybridSave = useUltimateHybridStore();
  const modes = useModesStore();
  const [slotIdx, setSlotIdx] = useState(modes.activeBuildSlotIndex);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [draft, setDraft] = useState<MyPlayerBuildSlot>(() => ({
    ...modes.buildSlots[modes.activeBuildSlotIndex],
    attributes: { ...modes.buildSlots[modes.activeBuildSlotIndex].attributes },
    capBreakers: { ...modes.buildSlots[modes.activeBuildSlotIndex].capBreakers },
    cosmetics: { ...modes.buildSlots[modes.activeBuildSlotIndex].cosmetics },
  }));

  const switchSlot = (idx: number) => {
    setSlotIdx(idx);
    ModesStore.setActiveBuildSlot(idx);
    const src = ModesStore.getState().buildSlots[idx];
    setDraft({
      ...src,
      attributes: { ...src.attributes },
      capBreakers: { ...src.capBreakers },
      cosmetics: { ...src.cosmetics },
    });
    HybridAudioEngine.playUi('switch', eraMode);
  };

  const caps = useMemo(
    () =>
      computeDynamicAttributeCaps(
        draft.position,
        draft.heightInches,
        draft.weightLbs,
        draft.wingspanInches
      ),
    [draft.position, draft.heightInches, draft.weightLbs, draft.wingspanInches]
  );

  const effectiveAttrs = useMemo(() => getEffectiveBuildAttributes(draft), [draft]);
  const liveOvr = useMemo(
    () => computeBuildOvr(draft.attributes, draft.capBreakers),
    [draft.attributes, draft.capBreakers]
  );
  const liveArchetype = useMemo(
    () => deriveBuildArchetypeName(effectiveAttrs, draft.position),
    [effectiveAttrs, draft.position]
  );
  const liveBadges = useMemo(
    () => computeUnlockedBadges5Tier(draft.attributes, draft.capBreakers),
    [draft.attributes, draft.capBreakers]
  );
  const budgetUsed = useMemo(
    () => computeAttributePointBudgetUsed(draft.attributes),
    [draft.attributes]
  );
  const capBreakersUsed = useMemo(
    () => Object.values(draft.capBreakers).reduce((s, n) => s + (n ?? 0), 0),
    [draft.capBreakers]
  );

  const updateBody = (patch: Partial<Pick<MyPlayerBuildSlot, 'position' | 'heightInches' | 'weightLbs' | 'wingspanInches'>>) => {
    setDraft((prev) => {
      const nextH = patch.heightInches ?? prev.heightInches;
      const nextWing = clampNum(
        patch.wingspanInches ?? prev.wingspanInches,
        nextH - 2,
        nextH + 8
      );
      const nextPos = patch.position ?? prev.position;
      const nextW = patch.weightLbs ?? prev.weightLbs;
      const nextCaps = computeDynamicAttributeCaps(nextPos, nextH, nextW, nextWing);
      const clampedAttrs = { ...prev.attributes };
      ATTRIBUTE_META.forEach((m) => {
        clampedAttrs[m.key] = clampNum(clampedAttrs[m.key], 25, nextCaps[m.key]);
      });
      return {
        ...prev,
        position: nextPos,
        heightInches: nextH,
        weightLbs: nextW,
        wingspanInches: nextWing,
        attributes: clampedAttrs,
      };
    });
  };

  const setAttr = (key: AttributeKey, val: number) => {
    setDraft((prev) => {
      const capped = clampNum(val, 25, caps[key]);
      const otherSum = computeAttributePointBudgetUsed(prev.attributes) - prev.attributes[key];
      const maxAllowed = Math.min(caps[key], Math.max(25, BUILD_MAX_ATTR_BUDGET - otherSum));
      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [key]: Math.min(capped, maxAllowed),
        },
      };
    });
  };

  const adjustCapBreaker = (key: AttributeKey, delta: 1 | -1) => {
    setDraft((prev) => {
      const curr = prev.capBreakers[key] ?? 0;
      const used = Object.values(prev.capBreakers).reduce((s, n) => s + (n ?? 0), 0);
      if (delta > 0 && (used >= prev.capBreakersEarned || curr >= 5 || prev.attributes[key] + curr >= 99)) {
        return prev;
      }
      if (delta < 0 && curr <= 0) return prev;
      return {
        ...prev,
        capBreakers: { ...prev.capBreakers, [key]: curr + delta },
      };
    });
  };

  const handleSaveBuild = () => {
    ModesStore.saveBuildSlot(slotIdx, draft);
    HybridAudioEngine.playUi('confirm', eraMode);
    onNotify(`Saved Slot #${slotIdx + 1}: ${draft.name} (${liveOvr} OVR ${liveArchetype})!`);
  };

  const handleVcUpgrade = (key: AttributeKey) => {
    ModesStore.saveBuildSlot(slotIdx, draft);
    const res = ModesStore.upgradeBuildAttributeWithVc(slotIdx, key);
    if (res.ok) {
      const fresh = ModesStore.getState().buildSlots[slotIdx];
      setDraft({
        ...fresh,
        attributes: { ...fresh.attributes },
        capBreakers: { ...fresh.capBreakers },
        cosmetics: { ...fresh.cosmetics },
      });
      HybridAudioEngine.playUi('confirm', eraMode);
    }
    onNotify(res.message);
  };

  const unlockedBadgeList = BADGE_CATALOG.filter((b) => Boolean(liveBadges[b.id]));

  return (
    <div className="h2k-mode-root">
      <header className="h2k-mode-topbar">
        <div className="h2k-mode-top-left">
          <button type="button" className="h2k-mode-btn" onClick={onBack}>
            ← Main Menu
          </button>
          <div>
            <h2 className="h2k-mode-title">MyPLAYER BUILDER · 5 PERSISTENT SLOTS</h2>
            <div className="h2k-mode-submeta">
              {liveArchetype} · {liveOvr} OVR · Playable in The City, MyCAREER &amp; Blacktop
            </div>
          </div>
        </div>
        <div className="h2k-mode-top-right">
          <span className="h2k-wallet-vc h2k-tabular" style={{ fontWeight: 700, fontSize: 13 }}>
            VC {hybridSave.currencies.vc.toLocaleString()}
          </span>
          <button type="button" className="h2k-mode-btn primary" onClick={handleSaveBuild}>
            💾 Save Build
          </button>
          <button
            type="button"
            className="h2k-mode-btn cyan"
            onClick={() => {
              handleSaveBuild();
              onEnterCity();
            }}
          >
            🏙️ Take Build to The City
          </button>
        </div>
      </header>

      {/* 5-Slot Instant Swap Bar + 3-Step Tabs */}
      <div className="h2k-mode-tabs" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {modes.buildSlots.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              className={`h2k-mode-tab ${slotIdx === idx ? 'active' : ''}`}
              onClick={() => switchSlot(idx)}
            >
              ⚡ Slot {idx + 1}: {s.position} {s.ovr}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className={`h2k-mode-tab ${step === 1 ? 'active' : ''}`}
            onClick={() => setStep(1)}
          >
            1. Vitals &amp; Body
          </button>
          <button
            type="button"
            className={`h2k-mode-tab ${step === 2 ? 'active' : ''}`}
            onClick={() => setStep(2)}
          >
            2. Attributes, Cap Breakers &amp; Badges
          </button>
          <button
            type="button"
            className={`h2k-mode-tab ${step === 3 ? 'active' : ''}`}
            onClick={() => setStep(3)}
          >
            3. Jumpshot, Takeover &amp; VC Upgrades
          </button>
        </div>
      </div>

      <div className="h2k-mode-scroll">
        <div className="h2k-builder-layout">
          {/* LEFT COLUMN: LIVE 3D TURNTABLE & BUILD CARD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MyPlayer3DTurntable draft={draft} />
            <div className="h2k-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="h2k-muted">ARCHETYPE</div>
                  <strong style={{ fontSize: 16, color: '#fcd34d' }}>{liveArchetype}</strong>
                </div>
                <div className="h2k-mt-ovr" style={{ color: '#22c55e' }}>
                  {liveOvr}
                </div>
              </div>
              <div className="h2k-muted h2k-tabular" style={{ marginTop: 8 }}>
                {draft.name} · #{draft.jerseyNumber} · {draft.position} · {formatHeightInches(draft.heightInches)} ·{' '}
                {draft.weightLbs} lbs · {formatHeightInches(draft.wingspanInches)} Wing
              </div>
              <div className="h2k-muted h2k-tabular" style={{ marginTop: 6 }}>
                Badges Unlocked: <strong style={{ color: '#f8fafc' }}>{unlockedBadgeList.length}</strong> · Cap Breakers:{' '}
                <strong style={{ color: '#38bdf8' }}>{capBreakersUsed}/{draft.capBreakersEarned}</strong>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE STEP EDITOR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {step === 1 && (
              <div className="h2k-card">
                <div className="h2k-section-head">
                  <h3>Step 1 · Vitals, Physicals &amp; Appearance</h3>
                </div>
                <div className="h2k-grid-2">
                  <label style={{ fontSize: 12 }}>
                    <div className="h2k-muted" style={{ marginBottom: 4 }}>MyPLAYER Name</div>
                    <input
                      type="text"
                      className="h2k-input"
                      style={{ width: '100%' }}
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    <div className="h2k-muted" style={{ marginBottom: 4 }}>Jersey Number (0-99)</div>
                    <input
                      type="number"
                      className="h2k-input"
                      style={{ width: '100%' }}
                      min={0}
                      max={99}
                      value={draft.jerseyNumber}
                      onChange={(e) =>
                        setDraft({ ...draft, jerseyNumber: clampNum(Number(e.target.value) || 0, 0, 99) })
                      }
                    />
                  </label>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div className="h2k-muted" style={{ marginBottom: 6 }}>Position</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        className={`h2k-mode-btn ${draft.position === pos ? 'primary' : ''}`}
                        style={{ flex: 1 }}
                        onClick={() => updateBody({ position: pos })}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h2k-grid-3" style={{ marginTop: 14 }}>
                  <label style={{ fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Height</span>
                      <strong className="h2k-tabular">{formatHeightInches(draft.heightInches)}</strong>
                    </div>
                    <input
                      type="range"
                      min={69}
                      max={88}
                      value={draft.heightInches}
                      onChange={(e) => updateBody({ heightInches: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Weight</span>
                      <strong className="h2k-tabular">{draft.weightLbs} lbs</strong>
                    </div>
                    <input
                      type="range"
                      min={165}
                      max={295}
                      value={draft.weightLbs}
                      onChange={(e) => updateBody({ weightLbs: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Wingspan</span>
                      <strong className="h2k-tabular">{formatHeightInches(draft.wingspanInches)}</strong>
                    </div>
                    <input
                      type="range"
                      min={draft.heightInches - 2}
                      max={draft.heightInches + 8}
                      value={draft.wingspanInches}
                      onChange={(e) => updateBody({ wingspanInches: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </label>
                </div>

                <div className="h2k-muted" style={{ marginTop: 10 }}>
                  Live Cap Preview: Max 3PT <strong>{caps.threePt}</strong> · Max Dunk <strong>{caps.drivingDunk}</strong> ·
                  Max Ball Handle <strong>{caps.ballHandle}</strong> · Max Block <strong>{caps.block}</strong> · Max Steal{' '}
                  <strong>{caps.steal}</strong>
                </div>

                <div className="h2k-grid-3" style={{ marginTop: 14 }}>
                  <div>
                    <div className="h2k-muted" style={{ marginBottom: 6 }}>Skin Tone</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {SKIN_SWATCHES.map((sw) => (
                        <button
                          key={sw}
                          type="button"
                          onClick={() => setDraft({ ...draft, cosmetics: { ...draft.cosmetics, skinTone: sw } })}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: sw,
                            border: draft.cosmetics.skinTone === sw ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.2)',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <label style={{ fontSize: 12 }}>
                    <div className="h2k-muted" style={{ marginBottom: 4 }}>Hairstyle</div>
                    <select
                      className="h2k-select"
                      style={{ width: '100%' }}
                      value={draft.cosmetics.hairStyle}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          cosmetics: { ...draft.cosmetics, hairStyle: e.target.value as HairStyle },
                        })
                      }
                    >
                      {HAIR_STYLES.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ fontSize: 12 }}>
                    <div className="h2k-muted" style={{ marginBottom: 4 }}>Arm Sleeve</div>
                    <select
                      className="h2k-select"
                      style={{ width: '100%' }}
                      value={draft.cosmetics.armSleeve}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          cosmetics: { ...draft.cosmetics, armSleeve: e.target.value as ArmSleeveOption },
                        })
                      }
                    >
                      <option value="NONE">None</option>
                      <option value="LEFT">Left Arm</option>
                      <option value="RIGHT">Right Arm</option>
                      <option value="BOTH">Both Arms</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={draft.cosmetics.headband}
                      onChange={(e) =>
                        setDraft({ ...draft, cosmetics: { ...draft.cosmetics, headband: e.target.checked } })
                      }
                    />
                    Equip Headband
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={draft.cosmetics.legCompression}
                      onChange={(e) =>
                        setDraft({ ...draft, cosmetics: { ...draft.cosmetics, legCompression: e.target.checked } })
                      }
                    />
                    Equip Leg Compression
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                <div className="h2k-card">
                  <div className="h2k-section-head">
                    <h3>Step 2 · 18-Attribute Allocator &amp; 2K26 Cap Breakers</h3>
                    <span className="h2k-tabular" style={{ fontSize: 12, color: '#38bdf8' }}>
                      Budget: {budgetUsed} / {BUILD_MAX_ATTR_BUDGET} · Cap Breakers Left:{' '}
                      {draft.capBreakersEarned - capBreakersUsed}
                    </span>
                  </div>
                  <div className="h2k-grid-2">
                    {ATTRIBUTE_META.map((m) => {
                      const base = draft.attributes[m.key];
                      const cb = draft.capBreakers[m.key] ?? 0;
                      const eff = effectiveAttrs[m.key];
                      return (
                        <div key={m.key} className="h2k-attr-row">
                          <span>
                            {m.label} <span className="h2k-muted">(cap {caps[m.key]})</span>
                          </span>
                          <input
                            type="range"
                            min={25}
                            max={caps[m.key]}
                            value={base}
                            onChange={(e) => setAttr(m.key, Number(e.target.value))}
                          />
                          <strong className="h2k-tabular" style={{ textAlign: 'right', color: cb > 0 ? '#38bdf8' : '#f8fafc' }}>
                            {eff}
                          </strong>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="h2k-mode-btn"
                              style={{ minHeight: 26, padding: '0 7px' }}
                              onClick={() => adjustCapBreaker(m.key, -1)}
                              disabled={cb <= 0}
                              title="Remove Cap Breaker"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              className="h2k-mode-btn cyan"
                              style={{ minHeight: 26, padding: '0 7px' }}
                              onClick={() => adjustCapBreaker(m.key, 1)}
                              disabled={capBreakersUsed >= draft.capBreakersEarned || eff >= 99}
                              title="Apply +1 Cap Breaker past physical ceiling"
                            >
                              +CB
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h2k-card">
                  <div className="h2k-section-head">
                    <h3>Live 2K26 5-Tier Badge Threshold Calculator ({unlockedBadgeList.length} Unlocked)</h3>
                  </div>
                  <div className="h2k-badge-grid">
                    {unlockedBadgeList.map((b) => {
                      const tier = liveBadges[b.id]!;
                      return (
                        <div key={b.id} className="h2k-badge-tile">
                          <span>{b.name}</span>
                          <strong className={`h2k-tier-${tier}`}>{tier}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="h2k-card">
                  <div className="h2k-section-head">
                    <h3>Step 3 · Custom Jumpshot Speed &amp; Primary Takeover</h3>
                  </div>
                  <div className="h2k-muted" style={{ marginBottom: 8 }}>Jumpshot Release Speed</div>
                  <div className="h2k-grid-4" style={{ marginBottom: 16 }}>
                    {JUMPSHOT_SPEED_OPTIONS.map((js) => (
                      <button
                        key={js.id}
                        type="button"
                        className={`h2k-mode-btn ${draft.jumpshotSpeed === js.id ? 'primary' : ''}`}
                        onClick={() => setDraft({ ...draft, jumpshotSpeed: js.id })}
                      >
                        {js.label}
                      </button>
                    ))}
                  </div>

                  <div className="h2k-muted" style={{ marginBottom: 8 }}>Primary Takeover Specialization</div>
                  <div className="h2k-grid-3">
                    {TAKEOVER_OPTIONS.map((tk) => (
                      <button
                        key={tk.id}
                        type="button"
                        className={`h2k-card`}
                        style={{
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderColor: draft.primaryTakeover === tk.id ? tk.accent : 'rgba(255,255,255,0.1)',
                          background: draft.primaryTakeover === tk.id ? 'rgba(245,158,11,0.12)' : 'rgba(15,23,42,0.92)',
                        }}
                        onClick={() => setDraft({ ...draft, primaryTakeover: tk.id })}
                      >
                        <strong style={{ color: tk.accent, fontSize: 14 }}>{tk.label}</strong>
                        <div className="h2k-muted" style={{ marginTop: 4 }}>{tk.boostText}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h2k-card">
                  <div className="h2k-section-head">
                    <h3>VC Attribute Upgrades (Spend Earned VC)</h3>
                    <span className="h2k-wallet-vc h2k-tabular">
                      Balance: {hybridSave.currencies.vc.toLocaleString()} VC
                    </span>
                  </div>
                  <div className="h2k-grid-3">
                    {ATTRIBUTE_META.slice(0, 12).map((m) => {
                      const val = draft.attributes[m.key];
                      const atCap = val >= caps[m.key];
                      const cost = Math.round(180 + Math.max(0, val - 65) * 32);
                      return (
                        <div
                          key={m.key}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: 'rgba(30,41,59,0.72)',
                            fontSize: 12,
                          }}
                        >
                          <div>
                            <strong>{m.label}</strong>
                            <div className="h2k-muted h2k-tabular">
                              {val} / {caps[m.key]}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="h2k-mode-btn primary"
                            style={{ minHeight: 30, padding: '0 10px' }}
                            disabled={atCap}
                            onClick={() => handleVcUpgrade(m.key)}
                          >
                            {atCap ? 'MAX' : `+1 (${cost})`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

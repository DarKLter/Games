// ============================================================================
// PART 3 — 60 FPS THREE.JS 3D BASKETBALL BATTLEFIELD COMPONENT (Court3D.tsx)
// Accepts live MatchRenderState via ref (zero React re-renders per frame).
// Enforces RoomEnvironment PBR, Software-WebGL guard + fenceSync pacing,
// zero-GC scratch vectors, webglcontextlost recovery, and full disposal.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { JerseyVariant, MatchVenueId, UIEraMode } from '../hybrid/types';
import type { TeamData } from '../hybrid/rosterTypes';
import {
  COURT_DIMS,
  isOutdoorVenue,
  solveCameraTarget,
  type CourtCameraConfig,
  type CourtVisualConfig,
  type MatchRenderState,
} from './courtTypes';
import { createBasketballTexture, JerseyTextureCache } from './CourtTextures';
import { PlayerMesh3D } from './PlayerMesh3D';
import { buildVenue3D, type BuiltVenue3D } from './VenueBuilder3D';
import { CourtOverlays3D } from './CourtOverlays3D';
import type { ProjectedCourtAnchors, ReplayOrbitState } from './SimTacticsAndReplay';

export interface Court3DProps {
  matchStateRef: React.MutableRefObject<MatchRenderState>;
  homeTeam: TeamData;
  awayTeam: TeamData;
  venue: MatchVenueId;
  homeJersey: JerseyVariant;
  awayJersey: JerseyVariant;
  uiEraMode: UIEraMode;
  cameraConfig: CourtCameraConfig;
  visualConfig: CourtVisualConfig;
  streakStamp?: string;
  projectedAnchorsRef?: React.MutableRefObject<ProjectedCourtAnchors>;
  replayOrbitRef?: React.MutableRefObject<ReplayOrbitState>;
  capturePngRef?: React.MutableRefObject<(() => string | null) | null>;
  onTickFrame?: (dt: number, elapsedSec: number) => void;
  onFpsSample?: (fps: number) => void;
}

// Module-scoped zero-GC scratch vectors
const _camTargetPos = new THREE.Vector3();
const _camTargetLook = new THREE.Vector3();
const _camCurLook = new THREE.Vector3();
const _handPos = new THREE.Vector3();
const _projScratch = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export const Court3D: React.FC<Court3DProps> = ({
  matchStateRef,
  homeTeam,
  awayTeam,
  venue,
  homeJersey,
  awayJersey,
  uiEraMode,
  cameraConfig,
  visualConfig,
  streakStamp,
  projectedAnchorsRef,
  replayOrbitRef,
  capturePngRef,
  onTickFrame,
  onFpsSample,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  // Store reactive props in refs so camera/visual switches NEVER recreate WebGL context
  const camCfgRef = useRef(cameraConfig);
  const visCfgRef = useRef(visualConfig);
  const eraRef = useRef(uiEraMode);
  const projOutRef = useRef(projectedAnchorsRef);
  const orbitRef = useRef(replayOrbitRef);
  const capPngPropRef = useRef(capturePngRef);
  const tickCbRef = useRef(onTickFrame);
  const fpsCbRef = useRef(onFpsSample);
  const venueHandleRef = useRef<BuiltVenue3D | null>(null);

  camCfgRef.current = cameraConfig;
  visCfgRef.current = visualConfig;
  eraRef.current = uiEraMode;
  projOutRef.current = projectedAnchorsRef;
  orbitRef.current = replayOrbitRef;
  capPngPropRef.current = capturePngRef;
  tickCbRef.current = onTickFrame;
  fpsCbRef.current = onFpsSample;

  // Live toggle for 2K14 Glossy Hardwood Reflections without rebuilding the scene
  useEffect(() => {
    if (venueHandleRef.current) {
      venueHandleRef.current.setHardwoodReflections(visualConfig.hardwoodReflections);
    }
  }, [visualConfig.hardwoodReflections]);

  // Core Three.js scene lifecycle — rebuilds only on venue/team/jersey change
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setContextLost(true);
      return;
    }

    const initW = Math.max(320, container.clientWidth || window.innerWidth || 960);
    const initH = Math.max(240, container.clientHeight || window.innerHeight || 540);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(
      isSoftwareGl
        ? 1
        : Math.min(window.devicePixelRatio || 1, visCfgRef.current.cinema3DQuality === 'HIGH' ? 2 : 1.35)
    );
    renderer.setSize(initW, initH);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const outdoor = isOutdoorVenue(venue);
    const skyBgHex =
      venue === 'SKYLINE_PARK'
        ? 0xf59e6c
        : venue === 'SUNSET_BEACH'
          ? 0x38bdf8
          : venue === 'RIVET_CITY'
            ? 0x2a1f24
            : venue === 'OLD_TOWN'
              ? 0x64748b
              : venue === 'BLACKTOP_CAGE'
                ? 0x0b1120
                : venue === 'STREET_KINGS'
                  ? 0x2b1d14
                  : venue === 'ARENA_2K14'
                    ? 0x0b0810
                    : 0x070b14;
    scene.background = new THREE.Color(skyBgHex);
    scene.fog = new THREE.FogExp2(skyBgHex, outdoor ? 0.011 : 0.014);

    // RoomEnvironment IBL for realistic glossy hardwood & chrome rim reflections
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    // 3-Point Arena / Outdoor Daylight Rig
    const hemi = new THREE.HemisphereLight(
      outdoor ? 0xfff3d6 : 0xdbeafe,
      outdoor ? 0x334155 : 0x1e293b,
      outdoor ? 1.15 : 0.85
    );
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(
      venue === 'SKYLINE_PARK' || venue === 'ARENA_2K14' ? 0xffe4b5 : 0xffffff,
      outdoor ? 1.85 : 1.55
    );
    keyLight.position.set(10, 22, 14);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 2;
      keyLight.shadow.camera.far = 55;
      keyLight.shadow.camera.left = -18;
      keyLight.shadow.camera.right = 18;
      keyLight.shadow.camera.top = 12;
      keyLight.shadow.camera.bottom = -12;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimFill = new THREE.DirectionalLight(0x93c5fd, 0.55);
    rimFill.position.set(-14, 15, -12);
    scene.add(rimFill);

    // PerspectiveCamera initialized cleanly to active camera angle
    const camera = new THREE.PerspectiveCamera(48, initW / initH, 0.15, 160);
    const initSt = matchStateRef.current;
    const initPose = solveCameraTarget(
      camCfgRef.current,
      initSt.ball.x,
      initSt.ball.y,
      initSt.ball.z,
      initSt.players[0]?.x ?? 0,
      initSt.players[0]?.z ?? 0,
      initSt.attackDirX
    );
    camera.position.set(initPose.posX, initPose.posY, initPose.posZ);
    _camCurLook.set(initPose.lookX, initPose.lookY, initPose.lookZ);
    camera.lookAt(_camCurLook);

    // Build Venue (Court, Hoops, Nets, Crowd, Jumbotron, Outdoor Props)
    const builtVenue = buildVenue3D(
      venue,
      homeTeam,
      visCfgRef.current.hardwoodReflections,
      streakStamp
    );
    venueHandleRef.current = builtVenue;
    scene.add(builtVenue.root);

    // Floor Overlays (Active Ring, Stamina, Pips, Takeover, PlayVision, Hot/Cold, Mark Star)
    const overlays = new CourtOverlays3D();
    scene.add(overlays.root);

    // 10 Articulated Height-Scaled Players (5 Home + 5 Away)
    const jerseyCache = new JerseyTextureCache();
    const playerMeshes = new Map<string, PlayerMesh3D>();
    for (let i = 0; i < initSt.players.length; i++) {
      const pl = initSt.players[i];
      const teamData = pl.teamSide === 'HOME' ? homeTeam : awayTeam;
      const variant = pl.teamSide === 'HOME' ? homeJersey : awayJersey;
      const pm = new PlayerMesh3D(pl, teamData, variant, jerseyCache);
      playerMeshes.set(pl.id, pm);
      scene.add(pm.root);
    }

    // Spinning Textured Basketball + Contact Shadow
    const ballTex = createBasketballTexture();
    const ballGeo = new THREE.SphereGeometry(COURT_DIMS.BALL_RADIUS, 20, 16);
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTex,
      roughness: 0.52,
      metalness: 0.06,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.castShadow = true;
    scene.add(ballMesh);

    const ballShadowGeo = new THREE.CircleGeometry(0.18, 16);
    const ballShadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
    });
    const ballShadow = new THREE.Mesh(ballShadowGeo, ballShadowMat);
    ballShadow.rotation.x = -Math.PI / 2;
    ballShadow.position.y = 0.017;
    scene.add(ballShadow);

    // Context loss & restore recovery
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // ResizeObserver for crisp layout across desktop & mobile full screen
    const handleResize = () => {
      const w = Math.max(320, container.clientWidth || window.innerWidth || 960);
      const h = Math.max(240, container.clientHeight || window.innerHeight || 540);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    if (ro) ro.observe(container);
    window.addEventListener('resize', handleResize);

    // WebGL2 fenceSync pacing helper for software renderers (zero queued-frame stutter)
    const glCtx = renderer.getContext();
    const isWebGL2 =
      typeof WebGL2RenderingContext !== 'undefined' && glCtx instanceof WebGL2RenderingContext;
    let disposed = false;
    let rafId = 0;

    const afterDraw = (next: () => void) => {
      if (disposed) return;
      if (!isSoftwareGl || !isWebGL2) {
        rafId = window.requestAnimationFrame(next);
        return;
      }
      const sync = (glCtx as WebGL2RenderingContext).fenceSync(
        (glCtx as WebGL2RenderingContext).SYNC_GPU_COMMANDS_COMPLETE,
        0
      );
      if (!sync) {
        rafId = window.requestAnimationFrame(next);
        return;
      }
      glCtx.flush();
      const poll = () => {
        if (disposed) {
          (glCtx as WebGL2RenderingContext).deleteSync(sync);
          return;
        }
        const status = (glCtx as WebGL2RenderingContext).clientWaitSync(sync, 0, 0);
        if (status === (glCtx as WebGL2RenderingContext).TIMEOUT_EXPIRED) {
          window.setTimeout(poll, 4);
        } else {
          (glCtx as WebGL2RenderingContext).deleteSync(sync);
          rafId = window.requestAnimationFrame(next);
        }
      };
      window.setTimeout(poll, 4);
    };

    let lastTs = performance.now();
    let elapsedSec = 0;
    let fpsAccum = 0;
    let fpsFrames = 0;
    let jumboTimer = 0;

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      elapsedSec += dt;

      if (tickCbRef.current) {
        tickCbRef.current(dt, elapsedSec);
      }

      const st = matchStateRef.current;

      // Update all 10 articulated players
      for (let i = 0; i < st.players.length; i++) {
        const pl = st.players[i];
        const pm = playerMeshes.get(pl.id);
        if (pm) pm.update(pl);
      }

      // Sync basketball to active holder's dribbling/shooting hand or airborne arc
      if (!st.ball.inFlight && st.ball.holderPlayerId) {
        const holderMesh = playerMeshes.get(st.ball.holderPlayerId);
        const holderState = st.players.find((p) => p.id === st.ball.holderPlayerId);
        if (holderMesh && holderState) {
          const handSide =
            holderState.animState === 'DRIBBLE_LEFT' ? 'left' : 'right';
          holderMesh.getHandWorldPos(handSide, _handPos);
          if (
            holderState.animState === 'DRIBBLE_RIGHT' ||
            holderState.animState === 'DRIBBLE_LEFT' ||
            holderState.animState === 'CROSSOVER'
          ) {
            const dribbleWave = Math.abs(Math.sin(holderState.animPhase * 1.4));
            st.ball.x = _handPos.x;
            st.ball.z = _handPos.z;
            st.ball.y = COURT_DIMS.BALL_RADIUS + dribbleWave * Math.max(0.5, _handPos.y - 0.16);
          } else {
            st.ball.x = _handPos.x;
            st.ball.y = Math.max(COURT_DIMS.BALL_RADIUS, _handPos.y);
            st.ball.z = _handPos.z;
          }
        }
      }

      ballMesh.position.set(st.ball.x, st.ball.y, st.ball.z);
      ballMesh.rotation.x += (st.ball.inFlight ? st.ball.spinX : 3.2) * dt;
      ballMesh.rotation.z += (st.ball.inFlight ? st.ball.spinZ : 1.4) * dt;

      ballShadow.position.set(st.ball.x, 0.017, st.ball.z);
      const bScale = Math.max(0.35, 1.15 - st.ball.y * 0.18);
      ballShadow.scale.set(bScale, bScale, 1);

      // Update hoops (rim flex, rippling nets, buzzer LEDs), environment & floor overlays
      builtVenue.updateHoops(st.hoops);
      builtVenue.updateEnvironment(elapsedSec, st.crowdExcitement);
      overlays.update(st, visCfgRef.current, eraRef.current, elapsedSec);

      // Update Jumbotron canvas at 2 Hz
      jumboTimer += dt;
      if (jumboTimer >= 0.5) {
        jumboTimer = 0;
        const mins = Math.floor(st.quarterClockSec / 60);
        const secs = Math.floor(st.quarterClockSec % 60);
        const clk = `Q${st.quarter} ${mins}:${secs < 10 ? '0' : ''}${secs} · SC ${Math.ceil(st.shotClockSec)}`;
        builtVenue.updateJumbotron(
          st.awayAbbr,
          st.awayScore,
          st.homeAbbr,
          st.homeScore,
          clk,
          st.jumbotronBanner
        );
      }

      // Spring-damped 7-Camera Controller + Contact Dunk Camera Shake
      const focusPl =
        st.players.find((p) => p.isUserControlled && p.visible) || st.players[0];
      const camCfg = camCfgRef.current;
      const solved = solveCameraTarget(
        camCfg,
        st.ball.x,
        st.ball.y,
        st.ball.z,
        focusPl ? focusPl.x : 0,
        focusPl ? focusPl.z : 0,
        st.attackDirX
      );

      const orbitState = orbitRef.current?.current;
      let targetFov = solved.fov;
      if (orbitState && orbitState.active) {
        const fx = orbitState.focusMode === 'COURT' ? 0 : st.ball.x;
        const fy = orbitState.focusMode === 'COURT' ? 1.4 : Math.max(1.0, st.ball.y);
        const fz = orbitState.focusMode === 'COURT' ? 0 : st.ball.z;
        const dist = Math.max(3.5, Math.min(24, orbitState.distance));
        const pol = Math.max(0.24, Math.min(1.42, orbitState.polar));
        const sinP = Math.sin(pol);
        _camTargetLook.set(fx, fy, fz);
        _camTargetPos.set(
          fx + dist * sinP * Math.cos(orbitState.azimuth),
          Math.max(0.65, fy + dist * Math.cos(pol)),
          fz + dist * sinP * Math.sin(orbitState.azimuth)
        );
        targetFov = 46;
      } else {
        _camTargetPos.set(solved.posX, solved.posY, solved.posZ);
        _camTargetLook.set(solved.lookX, solved.lookY, solved.lookZ);
      }

      const damp = 1 - Math.exp(-(orbitState && orbitState.active ? 10.5 : 6.2) * dt);
      camera.position.lerp(_camTargetPos, damp);
      _camCurLook.lerp(_camTargetLook, damp);

      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov += (targetFov - camera.fov) * damp;
        camera.updateProjectionMatrix();
      }

      if (camCfg.dunkCameraShake && st.cameraShake > 0.01 && !(orbitState && orbitState.active)) {
        const shakeAmt = st.cameraShake * 0.24;
        camera.position.x += Math.sin(elapsedSec * 68) * shakeAmt;
        camera.position.y += Math.cos(elapsedSec * 57) * shakeAmt * 0.8;
      }

      camera.lookAt(_camCurLook);

      // Project 3D player head/feet + ball into 2D viewport coords (zero-GC)
      if (projOutRef.current && projOutRef.current.current) {
        const out = projOutRef.current.current;
        const vw = container.clientWidth || initW;
        const vh = container.clientHeight || initH;
        out.width = vw;
        out.height = vh;
        camera.updateMatrixWorld();

        for (let i = 0; i < st.players.length; i++) {
          const pl = st.players[i];
          const headH = Math.max(1.75, (pl.heightInches || 78) * 0.0254) + 0.35;
          _projScratch.set(pl.x, pl.y + headH, pl.z).project(camera);
          const headVis = _projScratch.z > -1 && _projScratch.z < 1;
          const hx = (_projScratch.x * 0.5 + 0.5) * vw;
          const hy = (-_projScratch.y * 0.5 + 0.5) * vh;

          _projScratch.set(pl.x, 0.04, pl.z).project(camera);
          const fx = (_projScratch.x * 0.5 + 0.5) * vw;
          const fy = (-_projScratch.y * 0.5 + 0.5) * vh;

          let slot = out.players[pl.id];
          if (!slot) {
            slot = { headX: hx, headY: hy, feetX: fx, feetY: fy, visible: headVis && pl.visible };
            out.players[pl.id] = slot;
          } else {
            slot.headX = hx;
            slot.headY = hy;
            slot.feetX = fx;
            slot.feetY = fy;
            slot.visible = headVis && pl.visible;
          }
        }

        _projScratch.set(st.ball.x, st.ball.y, st.ball.z).project(camera);
        out.ball.x = (_projScratch.x * 0.5 + 0.5) * vw;
        out.ball.y = (-_projScratch.y * 0.5 + 0.5) * vh;
        out.ball.visible = _projScratch.z > -1 && _projScratch.z < 1;
      }

      renderer.render(scene, camera);

      // Sample FPS once per second
      fpsAccum += dt;
      fpsFrames += 1;
      if (fpsAccum >= 0.75) {
        if (fpsCbRef.current) {
          fpsCbRef.current(Math.min(120, Math.max(15, Math.round(fpsFrames / fpsAccum))));
        }
        fpsAccum = 0;
        fpsFrames = 0;
      }

      afterDraw(tick);
    };

    if (capPngPropRef.current) {
      capPngPropRef.current.current = () => {
        if (disposed) return null;
        try {
          renderer.render(scene, camera);
          return renderer.domElement.toDataURL('image/png');
        } catch {
          return null;
        }
      };
    }

    rafId = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      if (capPngPropRef.current) {
        capPngPropRef.current.current = null;
      }
      window.cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      venueHandleRef.current = null;
      builtVenue.dispose();
      overlays.dispose();
      playerMeshes.forEach((pm) => pm.dispose());
      jerseyCache.dispose();
      ballGeo.dispose();
      ballMat.dispose();
      ballTex.dispose();
      ballShadowGeo.dispose();
      ballShadowMat.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [venue, homeTeam, awayTeam, homeJersey, awayJersey, streakStamp, matchStateRef]);

  return (
    <div className="h2k-court3d-wrap">
      <div ref={mountRef} className="h2k-court3d-mount" />
      {contextLost && (
        <div className="h2k-court3d-fallback">
          WebGL 3D context interrupted — recovering arena renderer...
        </div>
      )}
    </div>
  );
};

import { MmAvatarConfig, MmBiomeId, MmMapDef, MmTeam } from '../types';
import { MM_BOOTS, MM_OUTFITS } from '../data/progression';
import { getMmWeaponById } from '../data/weapons';

export interface DrawSoldierParams {
  x: number;
  y: number;
  aimAngle: number;
  avatar: MmAvatarConfig;
  team: MmTeam;
  weaponId: string;
  offhandWeaponId?: string | null;
  crouching?: boolean;
  jetpacking?: boolean;
  walkPhase?: number;
  scale?: number;
  hpPct?: number;
  name?: string;
  showTag?: boolean;
  stealthAlpha?: number;
  spawnShield?: boolean;
  boosted?: boolean;
  burning?: boolean;
  empDisabled?: boolean;
  carryingFlagColor?: string | null;
  muzzleFlash?: number;
  meleeSwing?: number;
  speechText?: string | null;
  timeSec?: number;
}

/**
 * Draws a crisp, hand-drawn "Doodle Army" cartoon soldier with bold ink outlines,
 * all 6 customization layers, 360-degree weapons, Dual Wield, Riot Shield & Rocket Boots.
 */
export function drawDoodleSoldier(ctx: CanvasRenderingContext2D, p: DrawSoldierParams): void {
  const s = p.scale ?? 1;
  const facingLeft = Math.cos(p.aimAngle) < 0;
  const outfit = MM_OUTFITS.find((o) => o.id === p.avatar.outfit) ?? MM_OUTFITS[0];
  const boot = MM_BOOTS.find((b) => b.id === p.avatar.boots) ?? MM_BOOTS[0];
  const teamAccent = p.team === 'blue' ? '#2B82D9' : p.team === 'red' ? '#D93829' : p.avatar.accentColor;
  const crouchOff = p.crouching ? 10 : 0;
  const t = p.timeSec ?? 0;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  if (p.stealthAlpha !== undefined && p.stealthAlpha < 1) {
    ctx.globalAlpha = p.stealthAlpha;
  }

  // Speed/Power boost red aura
  if (p.boosted) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, -14 + crouchOff * 0.5, 32 + Math.sin(t * 14) * 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
    ctx.fill();
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // CTF Flag mounted on back
  if (p.carryingFlagColor) {
    ctx.save();
    const bx = facingLeft ? 10 : -10;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, -6 + crouchOff);
    ctx.lineTo(bx + (facingLeft ? 8 : -8), -48 + crouchOff);
    ctx.stroke();
    ctx.fillStyle = p.carryingFlagColor;
    ctx.beginPath();
    const fx = bx + (facingLeft ? 8 : -8);
    const fy = -48 + crouchOff;
    const wave = Math.sin(t * 10) * 3;
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + (facingLeft ? 24 : -24), fy + 6 + wave);
    ctx.lineTo(fx, fy + 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Legs + Rocket Boots
  const legSwing = p.jetpacking ? 0.35 : Math.sin(p.walkPhase ?? 0) * 6;
  const legY = p.crouching ? 8 : 11;
  [-6, 6].forEach((lx, idx) => {
    const offX = idx === 0 ? legSwing : -legSwing;
    const footX = lx + offX * 0.7;
    const footY = legY + (p.jetpacking ? 3 : Math.abs(offX) * 0.25);

    // Thruster flame underneath Rocket Boots when flying!
    if (p.jetpacking && !p.empDisabled) {
      ctx.save();
      const fl = 14 + Math.sin(t * 40 + idx * 2) * 6;
      ctx.beginPath();
      ctx.moveTo(footX - 4, footY + 6);
      ctx.lineTo(footX, footY + 6 + fl);
      ctx.lineTo(footX + 4, footY + 6);
      ctx.closePath();
      ctx.fillStyle = boot.flame;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(footX - 2, footY + 6);
      ctx.lineTo(footX, footY + 6 + fl * 0.55);
      ctx.lineTo(footX + 2, footY + 6);
      ctx.closePath();
      ctx.fillStyle = '#FEF9C3';
      ctx.fill();
      ctx.restore();
    }

    // Leg line
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lx * 0.7, 0 + crouchOff * 0.6);
    ctx.lineTo(footX, footY);
    ctx.stroke();

    // Rocket Boot housing
    ctx.fillStyle = boot.color;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(footX - 6, footY - 2, 12, 8, 3);
    ctx.fill();
    ctx.stroke();
  });

  // Armored Torso
  ctx.fillStyle = outfit.primary;
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.roundRect(-11, -14 + crouchOff, 22, p.crouching ? 18 : 22, 7);
  ctx.fill();
  ctx.stroke();

  // Tactical Vest / Belt & Team Stripe
  ctx.fillStyle = outfit.secondary;
  ctx.fillRect(-9, -6 + crouchOff, 18, 6);
  ctx.fillStyle = teamAccent;
  ctx.fillRect(-10, -10 + crouchOff, 20, 4);

  // Oversized Cartoon Doodle Head
  const headY = -25 + crouchOff;
  ctx.save();
  ctx.translate(0, headY);
  if (facingLeft) ctx.scale(-1, 1);

  // Base head circle
  ctx.fillStyle = p.avatar.skinTone;
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, 0, 14.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Expressive Eyes
  const eyeColor = p.avatar.eyeStyle === 'cyber' ? '#EF4444' : '#111827';
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(5, -2, 3.6, 4.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.arc(6.4, -2, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrow / expression
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  if (p.avatar.eyeStyle === 'angry' || p.avatar.eyeStyle === 'determined') {
    ctx.moveTo(1, -7.5);
    ctx.lineTo(9.5, -5.2);
  } else if (p.avatar.eyeStyle === 'sarge') {
    ctx.moveTo(1, -5.8);
    ctx.lineTo(10, -5.8);
  } else {
    ctx.moveTo(1.5, -7);
    ctx.lineTo(9, -7.5);
  }
  ctx.stroke();

  if (p.avatar.eyeStyle === 'scarred') {
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(4, -8);
    ctx.lineTo(7, 5);
    ctx.stroke();
  }

  // Facial Hair / Mouth
  drawFacialLayer(ctx, p.avatar.facial);

  // Eyewear Layer
  drawEyewearLayer(ctx, p.avatar.eyewear);

  // Headgear / Hair Layer
  drawHeadgearLayer(ctx, p.avatar.headgear, teamAccent);

  ctx.restore();

  // Weapons & 360° Articulated Hands
  const shoulderY = -7 + crouchOff;
  // Off-hand weapon (if Dual Wielding or holding Riot Shield)
  if (p.offhandWeaponId) {
    ctx.save();
    ctx.translate(facingLeft ? -4 : 4, shoulderY + 3);
    ctx.rotate(p.aimAngle);
    if (facingLeft) ctx.scale(1, -1);
    drawWeaponVector(ctx, p.offhandWeaponId, (p.muzzleFlash ?? 0) * 0.85, p.meleeSwing ?? 0);
    ctx.restore();
  }

  // Primary active weapon
  ctx.save();
  ctx.translate(0, shoulderY);
  ctx.rotate(p.aimAngle);
  if (facingLeft) ctx.scale(1, -1);
  drawWeaponVector(ctx, p.weaponId, p.muzzleFlash ?? 0, p.meleeSwing ?? 0);
  ctx.restore();

  // Status VFX: Burning / EMP Zapped / Spawn Shield
  if (p.burning) {
    ctx.fillStyle = 'rgba(251, 146, 60, 0.72)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(Math.sin(t * 14 + i * 2) * 10, -14 - i * 8 + Math.cos(t * 12 + i) * 3, 5 - i, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (p.empDisabled) {
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -10 + crouchOff, 22, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (p.spawnShield) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, -12 + crouchOff * 0.5, 29, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(248, 250, 252, 0.24)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.restore();
  }

  // Overhead Nametag & HP Bar (hidden when crouch-stealthed)
  if (p.showTag && p.name) {
    const tagY = -50 + crouchOff;
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeText(p.name, 0, tagY - 7);
    ctx.fillStyle = p.team === 'blue' ? '#60A5FA' : p.team === 'red' ? '#F87171' : '#F4F4EC';
    ctx.fillText(p.name, 0, tagY - 7);

    if (p.hpPct !== undefined) {
      const bw = 34;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-bw / 2 - 1, tagY - 3, bw + 2, 6);
      ctx.fillStyle = p.hpPct > 0.5 ? '#4ADE80' : p.hpPct > 0.25 ? '#FACC15' : '#EF4444';
      ctx.fillRect(-bw / 2, tagY - 2, bw * Math.max(0, Math.min(1, p.hpPct)), 4);
    }
  }

  // Comic Speech Bubble (Sarge / Quick Chat / Taunts)
  if (p.speechText) {
    ctx.save();
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    const tw = Math.max(64, ctx.measureText(p.speechText).width + 18);
    const bx = -tw / 2;
    const by = -86 + crouchOff;
    ctx.fillStyle = '#FEFCE8';
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, tw, 24, 8);
    ctx.fill();
    ctx.stroke();
    // Tail triangle
    ctx.beginPath();
    ctx.moveTo(-4, by + 24);
    ctx.lineTo(0, by + 31);
    ctx.lineTo(6, by + 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.fillText(p.speechText, 0, by + 16);
    ctx.restore();
  }

  ctx.restore();
}

function drawFacialLayer(ctx: CanvasRenderingContext2D, facial: string): void {
  ctx.save();
  switch (facial) {
    case 'sarge_stache':
      ctx.fillStyle = '#573B26';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(1, 3, 13, 5.5, 2.5);
      ctx.fill();
      ctx.stroke();
      break;
    case 'cigar':
      ctx.fillStyle = '#573B26';
      ctx.beginPath();
      ctx.roundRect(1, 2.5, 11, 4.5, 2);
      ctx.fill();
      ctx.fillStyle = '#78350F';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1.3;
      ctx.fillRect(8, 5, 11, 3.2);
      ctx.strokeRect(8, 5, 11, 3.2);
      ctx.fillStyle = '#F97316';
      ctx.fillRect(18, 5, 2.5, 3.2);
      break;
    case 'full_beard':
      ctx.fillStyle = '#451A03';
      ctx.beginPath();
      ctx.arc(2, 3, 12.5, 0.05 * Math.PI, 0.92 * Math.PI);
      ctx.fill();
      break;
    case 'goatee':
      ctx.fillStyle = '#3F2715';
      ctx.beginPath();
      ctx.arc(8, 9, 4.5, 0, Math.PI);
      ctx.fill();
      break;
    case 'stubble':
      ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.beginPath();
      ctx.arc(3, 5, 10, 0.1 * Math.PI, 0.85 * Math.PI);
      ctx.fill();
      break;
    case 'war_grin':
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(3, 4.5, 9, 4.5, 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'respirator':
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(3, 2, 12, 9, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(10, 6.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'skull_bandana':
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.roundRect(-6, 2, 20, 11, 3);
      ctx.fill();
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(5, 5, 2, 5);
      ctx.fillRect(9, 5, 2, 5);
      break;
    case 'whistle':
      ctx.fillStyle = '#CBD5E1';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(8, 5, 9, 4, 2);
      ctx.fill();
      ctx.stroke();
      break;
    default:
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(4, 6);
      ctx.lineTo(10, 5.5);
      ctx.stroke();
  }
  ctx.restore();
}

function drawEyewearLayer(ctx: CanvasRenderingContext2D, eyewear: string): void {
  if (eyewear === 'none') return;
  ctx.save();
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 1.6;
  switch (eyewear) {
    case 'aviators':
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(1, -5.5, 11.5, 6.5, 2.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(3, -4.5, 3, 2);
      break;
    case 'tactical_goggles':
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(0, -6.5, 12.5, 7, 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'nvg':
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(2, -7.5, 13, 7);
      ctx.strokeRect(2, -7.5, 13, 7);
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(8, -4, 2.4, 0, Math.PI * 2);
      ctx.arc(13, -4, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'cyber_visor':
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.roundRect(1, -5.5, 13, 4.5, 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'eyepatch':
      ctx.fillStyle = '#09090B';
      ctx.beginPath();
      ctx.arc(6, -2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.lineTo(10, -2);
      ctx.stroke();
      break;
    case 'monocle':
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(6, -2, 4.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'ski_goggles':
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.roundRect(0, -6, 13, 7, 3);
      ctx.fill();
      ctx.stroke();
      break;
    case 'battle_paint':
      ctx.fillStyle = '#14532D';
      ctx.fillRect(2, 1.5, 9, 2.2);
      break;
    case 'bandage':
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-13, -7, 26, 4);
      ctx.strokeRect(-13, -7, 26, 4);
      break;
  }
  ctx.restore();
}

function drawHeadgearLayer(ctx: CanvasRenderingContext2D, gear: string, teamAccent: string): void {
  ctx.save();
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2.4;
  switch (gear) {
    case 'bald':
      break;
    case 'buzzcut':
      ctx.fillStyle = '#27272A';
      ctx.beginPath();
      ctx.arc(0, -2, 14.2, Math.PI * 1.05, Math.PI * 1.95);
      ctx.fill();
      break;
    case 'spiked_hair':
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.moveTo(-13, -6);
      ctx.lineTo(-9, -22);
      ctx.lineTo(-2, -14);
      ctx.lineTo(3, -24);
      ctx.lineTo(8, -14);
      ctx.lineTo(14, -19);
      ctx.lineTo(13, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'mohawk':
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(-8, -12);
      ctx.lineTo(-4, -25);
      ctx.lineTo(4, -24);
      ctx.lineTo(9, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'red_beret':
      ctx.fillStyle = '#B91C1C';
      ctx.beginPath();
      ctx.ellipse(-2, -13, 15, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'commando_bandana':
      ctx.fillStyle = teamAccent;
      ctx.fillRect(-14.5, -10, 29, 5.5);
      ctx.strokeRect(-14.5, -10, 29, 5.5);
      ctx.beginPath();
      ctx.moveTo(-14, -8);
      ctx.lineTo(-23, -4);
      ctx.lineTo(-21, -11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'swat_helmet':
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(0, -3, 16, Math.PI, 0);
      ctx.lineTo(17, -2);
      ctx.lineTo(-17, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'pilot_cap':
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(0, -2, 15.5, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(5, -12, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'viking_helm':
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.arc(0, -4, 15.5, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FEF3C7';
      ctx.beginPath();
      ctx.moveTo(-12, -11);
      ctx.lineTo(-22, -23);
      ctx.lineTo(-7, -15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, -11);
      ctx.lineTo(22, -23);
      ctx.lineTo(7, -15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'ninja_hood':
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.arc(0, 0, 15.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F7CBA4';
      ctx.beginPath();
      ctx.roundRect(0, -6.5, 13.5, 7, 3);
      ctx.fill();
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(6.5, -3, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'gas_mask':
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(0, 0, 15.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4ADE80';
      ctx.beginPath();
      ctx.arc(6, -3, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(12, 6, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'skull_mask':
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.arc(0, 0, 15.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#09090B';
      ctx.beginPath();
      ctx.arc(6, -2, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(4, 6, 8, 2.5);
      break;
    case 'halo':
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.ellipse(0, -21, 13, 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'crown':
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.moveTo(-11, -12);
      ctx.lineTo(-12, -23);
      ctx.lineTo(-4, -17);
      ctx.lineTo(0, -25);
      ctx.lineTo(4, -17);
      ctx.lineTo(12, -23);
      ctx.lineTo(11, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'space_visor':
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.arc(0, 0, 16.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(4, -1, 10, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.fill();
      ctx.stroke();
      break;
    case 'cowboy_hat':
      ctx.fillStyle = '#92400E';
      ctx.beginPath();
      ctx.roundRect(-20, -13, 40, 4.5, 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(-10, -23, 20, 11, 4);
      ctx.fill();
      ctx.stroke();
      break;
    case 'ghillie_hood':
      ctx.fillStyle = '#365314';
      ctx.beginPath();
      ctx.arc(0, -4, 17, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();
      ctx.stroke();
      break;
    default: // army_helmet
      ctx.fillStyle = '#3E4A2E';
      ctx.beginPath();
      ctx.arc(0, -4, 16, Math.PI * 0.98, Math.PI * 2.02);
      ctx.lineTo(18, -4);
      ctx.lineTo(-18, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = teamAccent;
      ctx.fillRect(-14, -8, 28, 3.2);
  }
  ctx.restore();
}

export function drawWeaponVector(
  ctx: CanvasRenderingContext2D,
  weaponId: string,
  muzzleFlash: number,
  meleeSwing: number
): void {
  const w = getMmWeaponById(weaponId);
  ctx.save();
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2.2;

  if (w.isShield) {
    // Riot Shield held forward vertically
    ctx.fillStyle = '#1E3A8A';
    ctx.beginPath();
    ctx.roundRect(14, -20, 9, 40, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#93C5FD';
    ctx.fillRect(15.5, -13, 6, 9);
    ctx.restore();
    return;
  }

  if (w.isMelee) {
    const swingRot = meleeSwing > 0 ? Math.sin(meleeSwing * Math.PI) * 1.65 - 0.5 : -0.35;
    ctx.rotate(swingRot);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(8, -2.5, 8, 5);
    ctx.strokeRect(8, -2.5, 8, 5);
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(16, -3);
    ctx.lineTo(38, -5);
    ctx.lineTo(42, 0);
    ctx.lineTo(36, 4);
    ctx.lineTo(16, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Hand circle
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(12, 2, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const len =
    w.id === 'm93ba' || w.id === 'smaw'
      ? 36
      : w.id === 'hunting_rifle' || w.id === 'm14' || w.id === 'minigun' || w.id === 'phasr'
        ? 30
        : w.oneHanded
          ? 18
          : 26;
  const h = w.id === 'smaw' || w.id === 'minigun' || w.id === 'saw_gun' ? 9 : w.oneHanded ? 5.5 : 7;

  // Receiver & Barrel
  ctx.fillStyle = w.color;
  ctx.beginPath();
  ctx.roundRect(8, -h / 2, len, h, 2);
  ctx.fill();
  ctx.stroke();

  // Accent / Scope / Sawblade
  ctx.fillStyle = w.accent;
  if (w.id === 'm93ba' || w.id === 'hunting_rifle' || w.id === 'm14') {
    ctx.fillRect(14, -h / 2 - 4, 12, 3.5);
    ctx.strokeRect(14, -h / 2 - 4, 12, 3.5);
  } else if (w.id === 'saw_gun') {
    ctx.beginPath();
    ctx.arc(8 + len, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (w.id === 'minigun') {
    ctx.fillRect(20, -4, 18, 2);
    ctx.fillRect(20, 2, 18, 2);
  } else {
    ctx.fillRect(14, -1.5, Math.max(6, len * 0.45), 3);
  }

  // Glowing Muzzle Flash
  if (muzzleFlash > 0) {
    ctx.save();
    ctx.translate(10 + len, 0);
    ctx.fillStyle = w.id === 'phasr' ? '#22D3EE' : w.id === 'emp_gun' ? '#60A5FA' : '#FDE047';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(14 + muzzleFlash * 8, 0);
    ctx.lineTo(0, 6);
    ctx.lineTo(5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws 4-layer biome parallax backgrounds (0.1x, 0.3x, 0.6x, 1.0x camera scroll).
 */
export function drawParallaxBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  biome: MmBiomeId,
  camX: number,
  camY: number,
  timeSec: number,
  isLobby = false
): void {
  // Layer 0 (0.0x): Sky / Deep Cavern Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  if (biome === 'jungle') {
    grad.addColorStop(0, '#1D4E7A');
    grad.addColorStop(0.55, '#5995B5');
    grad.addColorStop(1, '#98B899');
  } else if (biome === 'underground') {
    grad.addColorStop(0, '#111318');
    grad.addColorStop(0.5, '#1F2229');
    grad.addColorStop(1, '#14171C');
  } else if (biome === 'arctic') {
    grad.addColorStop(0, '#64748B');
    grad.addColorStop(0.6, '#CBD5E1');
    grad.addColorStop(1, '#E2E8F0');
  } else if (biome === 'lunar') {
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.6, '#0F172A');
    grad.addColorStop(1, '#1E293B');
  } else if (biome === 'desert') {
    grad.addColorStop(0, '#7C2D12');
    grad.addColorStop(0.5, '#D97706');
    grad.addColorStop(1, '#FDE68A');
  } else {
    grad.addColorStop(0, '#1F2937');
    grad.addColorStop(0.55, '#374151');
    grad.addColorStop(1, '#4B5563');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Layer 1 (0.1x): Celestial / Clouds / Stars
  if (biome === 'lunar') {
    ctx.fillStyle = '#F8FAFC';
    for (let i = 0; i < 42; i++) {
      const sx = ((i * 197 - camX * 0.06) % w + w) % w;
      const sy = ((i * 89 - camY * 0.04) % (h * 0.72) + h * 0.72) % (h * 0.72);
      ctx.fillRect(sx, sy, (i % 3) + 1, (i % 3) + 1);
    }
    // Glowing Earth suspended in sky
    const ex = w * 0.76 - (camX * 0.04) % 120;
    const ey = h * 0.24;
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.arc(ex, ey, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(ex - 10, ey - 8, 16, 0, Math.PI * 2);
    ctx.arc(ex + 14, ey + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(147,197,253,0.45)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(ex, ey, 46, 0, Math.PI * 2);
    ctx.stroke();
  } else if (biome !== 'underground') {
    ctx.fillStyle = biome === 'desert' ? 'rgba(254, 243, 199, 0.22)' : 'rgba(255, 255, 255, 0.22)';
    for (let i = 0; i < 7; i++) {
      const cx = (((i * 290 + timeSec * 14 - camX * 0.1) % (w + 260)) + w + 260) % (w + 260) - 130;
      const cy = 50 + (i % 3) * 44;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 62, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 30, cy - 8, 42, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Lobby occasional helicopter flyby
  if (isLobby) {
    const hx = ((timeSec * 65) % (w + 340)) - 170;
    const hy = 72 + Math.sin(timeSec * 2.2) * 8;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-38, -2, 22, 4);
    ctx.fillRect(-40, -8, 4, 12);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    const blade = Math.sin(timeSec * 40) * 32;
    ctx.beginPath();
    ctx.moveTo(-blade, -12);
    ctx.lineTo(blade, -12);
    ctx.stroke();
    ctx.restore();
  }

  // Layer 2 (0.3x): Distant Mountains / Dunes / Cavern Pillars / Factories
  const hillColor =
    biome === 'jungle'
      ? '#2E4C36'
      : biome === 'arctic'
        ? '#94A3B8'
        : biome === 'desert'
          ? '#B45309'
          : biome === 'lunar'
            ? '#334155'
            : biome === 'underground'
              ? '#27272A'
              : '#1E293B';
  ctx.fillStyle = hillColor;
  const span = 320;
  const offset = -((camX * 0.3) % span);
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = offset - span; x <= w + span; x += span) {
    if (biome === 'industrial') {
      ctx.lineTo(x, h * 0.56);
      ctx.lineTo(x + 90, h * 0.56);
      ctx.lineTo(x + 90, h * 0.42);
      ctx.lineTo(x + 140, h * 0.42);
      ctx.lineTo(x + 140, h * 0.62);
      ctx.lineTo(x + span, h * 0.62);
    } else if (biome === 'underground') {
      ctx.lineTo(x, h * 0.25);
      ctx.lineTo(x + 110, h * 0.44);
      ctx.lineTo(x + 210, h * 0.22);
      ctx.lineTo(x + span, h * 0.35);
    } else {
      ctx.lineTo(x, h * 0.66);
      ctx.lineTo(x + span * 0.5, h * 0.42);
      ctx.lineTo(x + span, h * 0.66);
    }
  }
  ctx.lineTo(w + span, h);
  ctx.closePath();
  ctx.fill();

  // Layer 3 (0.6x): Midground Watchtowers / Palms / Torches / Girders
  const midSpan = 420;
  const midOff = -((camX * 0.6) % midSpan);
  for (let x = midOff - midSpan; x <= w + midSpan; x += midSpan) {
    if (biome === 'jungle') {
      // Distant watchtower with flickering amber beacon
      ctx.fillStyle = '#1E2E1D';
      ctx.fillRect(x + 140, h * 0.52, 10, h * 0.48);
      ctx.fillRect(x + 178, h * 0.52, 10, h * 0.48);
      ctx.fillRect(x + 132, h * 0.48, 64, 24);
      if (Math.sin(timeSec * 5 + x) > 0) {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(x + 164, h * 0.46, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Swaying palm silhouette
      const sway = Math.sin(timeSec * 1.8 + x * 0.01) * 6;
      ctx.strokeStyle = '#1A2E1A';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x + 310, h);
      ctx.quadraticCurveTo(x + 300 + sway, h * 0.72, x + 316 + sway, h * 0.58);
      ctx.stroke();
    } else if (biome === 'underground') {
      // Glowing cavern torch
      const ty = h * 0.48;
      ctx.fillStyle = '#78350F';
      ctx.fillRect(x + 180, ty, 8, 28);
      const glow = 16 + Math.sin(timeSec * 12 + x) * 4;
      ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
      ctx.beginPath();
      ctx.arc(x + 184, ty - 4, glow, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(x + 184, ty - 4, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (biome === 'desert') {
      ctx.fillStyle = '#92400E';
      ctx.beginPath();
      ctx.moveTo(x + 80, h);
      ctx.lineTo(x + 210, h * 0.54);
      ctx.lineTo(x + 340, h);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/**
 * Draws a crisp vector silhouette minimap of any of the 20 maps for the Custom Room & Map Vote UI.
 */
export function drawMapMiniSilhouette(
  ctx: CanvasRenderingContext2D,
  map: MmMapDef,
  w: number,
  h: number
): void {
  drawParallaxBackground(ctx, w, h, map.biome, 0, 0, 1.5, false);
  const sx = w / map.width;
  const sy = h / map.height;

  for (const plat of map.platforms) {
    ctx.fillStyle = plat.oneWay ? '#C2B280' : '#23272A';
    ctx.fillRect(plat.x * sx, plat.y * sy, Math.max(2, plat.w * sx), Math.max(2, plat.h * sy));
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1;
    ctx.strokeRect(plat.x * sx, plat.y * sy, Math.max(2, plat.w * sx), Math.max(2, plat.h * sy));
  }

  // Flag markers
  ctx.fillStyle = '#2B82D9';
  ctx.beginPath();
  ctx.arc(map.blueFlagPos.x * sx, map.blueFlagPos.y * sy, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#D93829';
  ctx.beginPath();
  ctx.arc(map.redFlagPos.x * sx, map.redFlagPos.y * sy, 4, 0, Math.PI * 2);
  ctx.fill();

  // Weapon pads
  ctx.fillStyle = '#F5A623';
  for (const pad of map.pads) {
    ctx.fillRect(pad.x * sx - 2, pad.y * sy - 2, 4, 4);
  }
}

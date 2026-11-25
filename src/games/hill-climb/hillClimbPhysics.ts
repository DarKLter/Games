export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(0.0001, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function terrainY(x: number, screenHeight: number): number {
  const base = screenHeight * 0.67;
  // Flat starting launch pad (x <= 380) smoothly blending into progressive rolling & steep hills
  const ramp = smoothstep(380, 1050, x);
  if (ramp <= 0) return base;
  const distFactor = 1 + Math.min(0.9, Math.max(0, x - 380) / 6200);
  const amp = Math.min(122, screenHeight * 0.2) * distFactor * ramp;
  const hx = x - 380;
  return (
    base -
    (Math.sin(hx * 0.0055) * amp * 0.48 +
      Math.sin(hx * 0.0135 + 1.1) * amp * 0.32 +
      Math.sin(hx * 0.024 + 0.4) * amp * 0.18 +
      (1 - Math.cos(hx * 0.0024)) * amp * 0.22)
  );
}

export function terrainSlope(x: number, screenHeight: number): number {
  return (terrainY(x + 4, screenHeight) - terrainY(x - 4, screenHeight)) / 8;
}

export function normalizeAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function isCrashLanding(carAngle: number, slopeAngle: number): boolean {
  const normCar = normalizeAngle(carAngle);
  if (Math.abs(normCar) > 1.38) return true;
  const diff = normalizeAngle(normCar - slopeAngle);
  return Math.abs(diff) > 0.92;
}

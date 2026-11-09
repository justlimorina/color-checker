import assert from 'node:assert/strict';
import { ColorUtils } from '../assets/script/utils.js';

// 1. HEX <-> RGB round-trip
const rgb = ColorUtils.hexToRgb('624E9A');
assert.deepEqual(rgb, { r: 98, g: 78, b: 154 });
assert.equal(ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b), '624E9A');

// 2. RGB <-> OKLCH round-trip within ±1 channel rounding
const oklch = ColorUtils.rgbToOklch(rgb.r, rgb.g, rgb.b);
const backRgb = ColorUtils.oklchToRgb(oklch.l, oklch.c, oklch.h);
assert.ok(Math.abs(backRgb.r - rgb.r) <= 1 && Math.abs(backRgb.g - rgb.g) <= 1 && Math.abs(backRgb.b - rgb.b) <= 1);

// 3. WCAG 2.1 contrast ratio & APCA Lc score on Black/White
const white = { r: 255, g: 255, b: 255 };
const black = { r: 0, g: 0, b: 0 };
assert.equal(ColorUtils.getContrastRatio(white, black), 21);
assert.ok(Math.round(ColorUtils.getAPCAContrast(black, white)) === 106);

// 4. DTCG tokens export (used by ProjectManager.exportProjectTokens)
const dtcg = ColorUtils.formatDTCGTokens('Test Project', ['624E9A']);
assert.equal(dtcg.color['color-1'].$value, '#624E9A');
assert.equal(dtcg.color['color-1'].$extensions['com.limorina.color'].name, 'Ultrapurple Merge');

console.log('All ColorUtils assertions passed!');

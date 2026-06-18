import { getNearestColor } from './colornames.bestof.js';

export const ColorUtils = {
    hexToRgb(hex) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return { r, g, b };
    },

    rgbToHex(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    },

    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) h = s = 0;
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    },

    hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
    },

    rgbToCmyk(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const k = 1 - Math.max(r, g, b);
        if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    },

    mixColors(rgb1, rgb2, weight) {
        const w = weight / 100;
        return {
            r: Math.round(rgb1.r * (1 - w) + rgb2.r * w),
            g: Math.round(rgb1.g * (1 - w) + rgb2.g * w),
            b: Math.round(rgb1.b * (1 - w) + rgb2.b * w)
        };
    },

    getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    },

    getContrastRatio(rgb1, rgb2) {
        const L1 = ColorUtils.getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const L2 = ColorUtils.getLuminance(rgb2.r, rgb2.g, rgb2.b);
        return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    },

    rgbToOklabRaw(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const linR = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        const linG = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        const linB = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

        const l = 0.4122214708 * linR + 0.5363325363 * linG + 0.0514459929 * linB;
        const m = 0.2119034982 * linR + 0.6806995451 * linG + 0.1073969566 * linB;
        const s = 0.0883024619 * linR + 0.2817188376 * linG + 0.6299787005 * linB;

        const l_ = Math.cbrt(l);
        const m_ = Math.cbrt(m);
        const s_ = Math.cbrt(s);

        const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720403 * s_;
        const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
        const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
        
        return { L, a, b: b_ };
    },

    rgbToOklch(r, g, b) {
        const oklab = ColorUtils.rgbToOklabRaw(r, g, b);
        const C = Math.sqrt(oklab.a * oklab.a + oklab.b * oklab.b);
        let h = Math.atan2(oklab.b, oklab.a) * 180 / Math.PI;
        if (h < 0) h += 360;
        return { l: oklab.L * 100, c: C, h: h };
    },

    rgbToOklab(r, g, b) {
        const oklab = ColorUtils.rgbToOklabRaw(r, g, b);
        return { l: oklab.L * 100, a: oklab.a, b: oklab.b };
    },

    oklabToRgb(L, a, b) {
        L /= 100;
        const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
        const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
        const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

        const l = l_ * l_ * l_;
        const m = m_ * m_ * m_;
        const s = s_ * s_ * s_;

        let linR = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
        let linG = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
        let linB = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

        const gamma = (x) => {
            x = Math.max(0, Math.min(1, x));
            return x >= 0.0031308 ? 1.055 * Math.pow(x, 1.0/2.4) - 0.055 : 12.92 * x;
        };

        return {
            r: Math.round(gamma(linR) * 255),
            g: Math.round(gamma(linG) * 255),
            b: Math.round(gamma(linB) * 255)
        };
    },

    oklchToRgb(L, C, h) {
        const hRad = h * Math.PI / 180;
        const a = C * Math.cos(hRad);
        const b = C * Math.sin(hRad);
        return ColorUtils.oklabToRgb(L, a, b);
    },

    getColorName(hex) {
        return getNearestColor(hex).name;
    },

    simulateBlindness(rgb, type) {
        const matrices = {
            protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
            deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
            tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
            achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114]
        };
        const m = matrices[type] || matrices.achromatopsia;
        return {
            r: Math.round(rgb.r * m[0] + rgb.g * m[1] + rgb.b * m[2]),
            g: Math.round(rgb.r * m[3] + rgb.g * m[4] + rgb.b * m[5]),
            b: Math.round(rgb.r * m[6] + rgb.g * m[7] + rgb.b * m[8])
        };
    },

    getAPCAContrast(rgbText, rgbBg) {
        const sRGBtoY = (rgb) => {
            const r = Math.pow(rgb.r / 255.0, 2.4);
            const g = Math.pow(rgb.g / 255.0, 2.4);
            const b = Math.pow(rgb.b / 255.0, 2.4);
            return 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
        };

        let txtY = sRGBtoY(rgbText);
        let bgY = sRGBtoY(rgbBg);

        const blkThrs = 0.022;
        const blkClmp = 1.414;
        const scaleBoW = 1.14;
        const scaleWoB = 1.14;
        const loBoWoffset = 0.027;
        const loWoBoffset = 0.027;
        const deltaYmin = 0.0005;
        const loClip = 0.1;

        txtY = (txtY > blkThrs) ? txtY : txtY + Math.pow(blkThrs - txtY, blkClmp);
        bgY = (bgY > blkThrs) ? bgY : bgY + Math.pow(blkThrs - bgY, blkClmp);

        if (Math.abs(bgY - txtY) < deltaYmin) {
            return 0.0;
        }

        let SAPC = 0.0;
        let outputContrast = 0.0;

        if (bgY > txtY) {
            SAPC = (Math.pow(bgY, 0.56) - Math.pow(txtY, 0.57)) * scaleBoW;
            outputContrast = (SAPC < loClip) ? 0.0 : SAPC - loBoWoffset;
        } else {
            SAPC = (Math.pow(bgY, 0.65) - Math.pow(txtY, 0.62)) * scaleWoB;
            outputContrast = (SAPC > -loClip) ? 0.0 : SAPC + loWoBoffset;
        }

        return outputContrast * 100.0;
    }
};

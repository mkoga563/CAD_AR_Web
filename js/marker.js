// ======================================================
// CAD AR System
// marker.js（デバッグ強化・安定版）
// ======================================================

"use strict";

import { AppState } from "./state.js";
import { MARKER } from "./config.js";
import { log } from "./utils.js";
import { applyHomography } from "./utils.js";

class MarkerRenderer {

    constructor() {
        this.ctx = null;
    }

    /* ======================================================
       初期化
    ====================================================== */

    initialize() {
        this.ctx = AppState.ctx;
        log("Marker Initialized");
    }

    /* ======================================================
       クリア
    ====================================================== */

    clear() {
        if (!this.ctx) return;

        this.ctx.clearRect(
            0,
            0,
            AppState.canvas.width,
            AppState.canvas.height
        );
    }

    /* ======================================================
       基本描画
    ====================================================== */

    drawCircle(x, y, radius = MARKER.RADIUS, color = MARKER.COLOR) {
        if (!this.ctx) return;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = MARKER.LINE_WIDTH;
        this.ctx.stroke();
    }

    drawCross(x, y, size = 10, color = MARKER.COLOR) {
        if (!this.ctx) return;

        this.ctx.beginPath();

        this.ctx.moveTo(x - size, y);
        this.ctx.lineTo(x + size, y);

        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x, y + size);

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawText(text, x, y) {
        if (!this.ctx) return;

        this.ctx.fillStyle = MARKER.FONT_COLOR;
        this.ctx.font = `${MARKER.FONT_SIZE}px sans-serif`;
        this.ctx.fillText(text, x, y);
    }

    /* ======================================================
       単一穴
    ====================================================== */

    drawHole(hole) {
        this.drawCircle(hole.x, hole.y, hole.r ?? MARKER.RADIUS);
        this.drawCross(hole.x, hole.y);

        if (hole.name) {
            this.drawText(hole.name, hole.x + 12, hole.y - 10);
        }
    }

    /* ======================================================
       通常描画
    ====================================================== */

    drawHoleList(holeList) {
        this.clear();

        for (const hole of holeList) {
            this.drawHole(hole);
        }
    }

    /* ======================================================
       AR描画（デバッグ強化版）
    ====================================================== */

    drawAR(holeList, H) {

        if (!this.ctx) {
            log("❌ ctxなし");
            return;
        }

        if (!holeList || holeList.length === 0) {
            log("⚠ holeList empty");
            return;
        }

        if (!H) {
            log("⚠ Homography null");
            return;
        }

        this.clear();

        log("AR DRAW START");

        for (const hole of holeList) {

            const p = applyHomography(H, hole.x, hole.y);

            // --------------------------
            // 異常チェック
            // --------------------------
            if (!p || isNaN(p.x) || isNaN(p.y)) {
                log(`❌ transform fail: ${hole.x},${hole.y}`);
                continue;
            }

            // --------------------------
            // デバッグ表示（重要）
            // --------------------------
            log(`→ ${hole.x},${hole.y} => ${p.x.toFixed(1)},${p.y.toFixed(1)}`);

            // --------------------------
            // 強制可視マーカー（超重要）
            // --------------------------

            // 赤点（絶対見える）
            this.ctx.fillStyle = "red";
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            this.ctx.fill();

            // 円
            this.drawCircle(p.x, p.y, hole.r ?? MARKER.RADIUS, "lime");

            // 十字
            this.drawCross(p.x, p.y, 10, "lime");

            // テキスト
            if (hole.name) {
                this.drawText(
                    hole.name,
                    p.x + 10,
                    p.y - 10
                );
            }
        }

        log("AR DRAW END");
    }
}

export const marker = new MarkerRenderer();
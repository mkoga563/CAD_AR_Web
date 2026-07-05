// ======================================================
// CAD AR System
// Version 2.0
// marker.js
// マーカー描画クラス（通常＋AR対応）
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
       円
    ====================================================== */

    drawCircle(x, y, radius = MARKER.RADIUS) {

        if (!this.ctx) return;

        this.ctx.beginPath();

        this.ctx.arc(x, y, radius, 0, Math.PI * 2);

        this.ctx.strokeStyle = MARKER.COLOR;

        this.ctx.lineWidth = MARKER.LINE_WIDTH;

        this.ctx.stroke();

    }

    /* ======================================================
       十字
    ====================================================== */

    drawCross(x, y, size = 12) {

        if (!this.ctx) return;

        this.ctx.beginPath();

        this.ctx.moveTo(x - size, y);
        this.ctx.lineTo(x + size, y);

        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x, y + size);

        this.ctx.strokeStyle = MARKER.COLOR;

        this.ctx.lineWidth = 2;

        this.ctx.stroke();

    }

    /* ======================================================
       テキスト
    ====================================================== */

    drawText(text, x, y) {

        if (!this.ctx) return;

        this.ctx.fillStyle = MARKER.FONT_COLOR;

        this.ctx.font = `${MARKER.FONT_SIZE}px sans-serif`;

        this.ctx.fillText(text, x, y);

    }

    /* ======================================================
       単一穴描画（通常）
    ====================================================== */

    drawHole(hole) {

        this.drawCircle(hole.x, hole.y, hole.r ?? MARKER.RADIUS);

        this.drawCross(hole.x, hole.y);

        if (hole.name) {

            this.drawText(hole.name, hole.x + 15, hole.y - 10);

        }

    }

    /* ======================================================
       穴リスト（通常）
    ====================================================== */

    drawHoleList(holeList) {

        this.clear();

        for (const hole of holeList) {

            this.drawHole(hole);

        }

    }

    /* ======================================================
       AR描画（ホモグラフィ変換あり）
    ====================================================== */

    drawAR(holeList, H) {

        if (!this.ctx) return;

        this.clear();

        if (!H) return;

        for (const hole of holeList) {

            const p = applyHomography(H, hole.x, hole.y);

            if (!p) continue;

            this.drawCircle(p.x, p.y, hole.r ?? MARKER.RADIUS);

            this.drawCross(p.x, p.y);

            if (hole.name) {

                this.drawText(
                    hole.name,
                    p.x + 15,
                    p.y - 10
                );

            }

        }

    }

}

/* ======================================================
   シングルトン
====================================================== */

export const marker = new MarkerRenderer();
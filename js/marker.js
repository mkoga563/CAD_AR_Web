// ======================================================
// CAD AR System
// Version 3.0
// marker.js
// ======================================================

"use strict";

import { APP } from "./js/config.js";
/* ======================================================
    Marker Renderer
====================================================== */

class MarkerRenderer {

    constructor() {

        this.holes = [];
        this.outline = [];

        this.visible = true;

        this.markerRadius =
            APP.AR.MARKER_RADIUS;

        this.originX = 0;
        this.originY = 0;

    }

    /* ==================================================
        初期化
    ================================================== */

    clear() {

        this.holes = [];
        this.outline = [];

    }

    /* ==================================================
        CADデータ読込
    ================================================== */

    load(data) {

        this.clear();

        if (!data)
            return;

        if (Array.isArray(data)) {

            this.holes = data;

        }
        else {

            this.holes = data.holes || [];
            this.outline = data.outline || [];

        }
        //------------------------------------------
        // CAD原点取得
        //------------------------------------------

        if (this.outline.length > 0) {

            let minX = Number.MAX_VALUE;
            let minY = Number.MAX_VALUE;

            for (const p of this.outline) {

                if (p.x < minX) minX = p.x;
                if (p.y < minY) minY = p.y;

            }

            this.originX = minX;
            this.originY = minY;

        }

    }

    /* ==================================================
        穴数
    ================================================== */

    count() {

        return this.holes.length;

    }

    /* ==================================================
        表示切替
    ================================================== */

    show(flag = true) {

        this.visible = flag;

    }

    /* ==================================================
        色取得
    ================================================== */

    getColor(hole) {

        const d = hole.diameter || hole.d;

        if (!d)
            return APP.COLOR.OTHER;

        if (Math.abs(d - 2.6) < 0.2)
            return APP.COLOR.M3;   // M3

        if (Math.abs(d - 3.4) < 0.2)
            return APP.COLOR.M4;   // M4

        if (Math.abs(d - 4.3) < 0.2)
            return APP.COLOR.M5;   // M5

        return APP.COLOR.OTHER;

    }
    /* ==================================================
    描画
================================================== */

    draw(ctx, transform) {

        if (!this.visible)
            return;

        if (!ctx)
            return;

        if (!transform)
            return;

        //------------------------------------------
        // 輪郭描画
        //------------------------------------------

        if (this.outline.length > 1) {

            ctx.strokeStyle =
                APP.COLOR.OUTLINE;
            ctx.lineWidth = 2;

            ctx.beginPath();

            this.outline.forEach((p, index) => {

                const pt = this.transformPoint(p, transform);

                if (index === 0)
                    ctx.moveTo(pt.x, pt.y);
                else
                    ctx.lineTo(pt.x, pt.y);

            });

            ctx.closePath();
            ctx.stroke();

        }

        //------------------------------------------
        // 穴描画
        //------------------------------------------



        this.drawAll(
            ctx,
            transform
        );



    }

    /* ==================================================
        穴描画
    ================================================== */

    drawHole(ctx, hole, transform) {

        const p = this.transformPoint(
            hole,
            transform
        );

        const color =
            this.getColor(hole);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        //------------------------------------------
        // マーカー半径
        //------------------------------------------

        const radius =

            this.markerRadius *

            Math.max(
                0.7,
                transform.scale
            );

        //------------------------------------------
        // 円
        //------------------------------------------

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        //------------------------------------------
        // 十字
        //------------------------------------------

        const crossSize =
            APP.AR.CROSS_SIZE *
            Math.max(0.7, transform.scale);

        ctx.beginPath();

        ctx.moveTo(p.x - crossSize, p.y);
        ctx.lineTo(p.x + crossSize, p.y);

        ctx.moveTo(p.x, p.y - crossSize);
        ctx.lineTo(p.x, p.y + crossSize);

        ctx.stroke();
        //------------------------------------------
        // 穴径
        //------------------------------------------

        if (hole.diameter || hole.d) {

            ctx.font = "16px Arial";

            ctx.fillText(

                (hole.diameter || hole.d).toFixed(1),

                p.x + 10,

                p.y - 10

            );

        }

    }

    /* ==================================================
    座標変換
================================================== */

    transformPoint(point, transform) {

        //------------------------------------------
        // CAD原点補正
        //------------------------------------------

        const originX = this.originX || 0;
        const originY = this.originY || 0;

        const rad =
            transform.rotation * Math.PI / 180;

        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        //------------------------------------------
        // 原点を補正して拡大
        //------------------------------------------

        const x =
            (point.x - originX) * transform.scale;

        const y =
            (point.y - originY) * transform.scale;

        //------------------------------------------
        // 回転＋移動
        //------------------------------------------

        return {

            x:
                transform.x +
                x * cos -
                y * sin,

            y:
                transform.y +
                x * sin +
                y * cos

        };

    }
    /* ==================================================
    マーカーサイズ
================================================== */

    setMarkerRadius(radius) {

        if (radius <= 0)
            return;

        this.markerRadius = radius;

    }

    /* ==================================================
        表示切替
    ================================================== */

    toggle() {

        this.visible = !this.visible;

    }

    /* ==================================================
        穴番号表示
    ================================================== */

    drawIndex(ctx, hole, point, index) {

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px Arial";

        ctx.fillText(

            String(index + 1),

            point.x + 12,

            point.y + 14

        );

    }

    /* ==================================================
        デバッグ表示
    ================================================== */

    drawDebug(ctx) {

        if (!ctx)
            return;

        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "16px Arial";

        ctx.fillText(
            "Hole Count : " + this.holes.length,
            20,
            30
        );

        ctx.fillText(
            "Outline : " + this.outline.length,
            20,
            55
        );

        ctx.fillText(
            "Marker Radius : " + this.markerRadius,
            20,
            80
        );
        ctx.fillText(

            "Visible : " + this.visible,

            20,

            105

        );

    }

    /* ==================================================
        描画範囲チェック
    ================================================== */

    isInsideCanvas(ctx, point) {

        if (
            point.x < 0 ||
            point.y < 0 ||
            point.x > ctx.canvas.width ||
            point.y > ctx.canvas.height
        ) {

            return false;

        }

        return true;

    }

    /* ==================================================
        全穴描画（改良版）
    ================================================== */

    drawAll(ctx, transform) {

        if (!this.visible)
            return;

        let index = 0;

        for (const hole of this.holes) {

            const p = this.transformPoint(
                hole,
                transform
            );

            if (!this.isInsideCanvas(ctx, p))
                continue;

            this.drawHole(
                ctx,
                hole,
                transform
            );

            this.drawIndex(
                ctx,
                hole,
                p,
                index
            );

            index++;

        }

    }

    /* ==================================================
        情報取得
    ================================================== */

    getHoles() {

        return this.holes;

    }

    getOutline() {

        return this.outline;

    }

}

/* ======================================================
    Singleton
====================================================== */

export const marker =
    new MarkerRenderer();
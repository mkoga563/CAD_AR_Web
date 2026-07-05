// ======================================================
// CAD AR System
// Version 2.0
// utils.js
// 共通ユーティリティ
// ======================================================

"use strict";

import { DEBUG } from "./config.js";

/* ======================================================
   ログ
====================================================== */

export function log(...message) {

    if (!DEBUG.ENABLE_LOG) return;

    console.log("[CAD AR]", ...message);

}

/* ======================================================
   エラー
====================================================== */

export function error(...message) {

    console.error("[CAD AR]", ...message);

}

/* ======================================================
   警告
====================================================== */

export function warn(...message) {

    console.warn("[CAD AR]", ...message);

}

/* ======================================================
   現在時刻(ms)
====================================================== */

export function now() {

    return performance.now();

}

/* ======================================================
   日時文字列
====================================================== */

export function getDateTime() {

    return new Date().toLocaleString("ja-JP");

}

/* ======================================================
   FPS計算
====================================================== */

export function calculateFPS(lastTime) {

    const current = performance.now();

    const fps = 1000 / (current - lastTime);

    return {

        fps: fps.toFixed(1),

        time: current

    };

}

/* ======================================================
   数値範囲
====================================================== */

export function clamp(value, min, max) {

    return Math.min(Math.max(value, min), max);

}

/* ======================================================
   度⇔ラジアン
====================================================== */

export function degToRad(degree) {

    return degree * Math.PI / 180;

}

export function radToDeg(rad) {

    return rad * 180 / Math.PI;

}

/* ======================================================
   距離
====================================================== */

export function distance(x1, y1, x2, y2) {

    return Math.sqrt(

        (x2 - x1) ** 2 +

        (y2 - y1) ** 2

    );

}

/* ======================================================
   UUID
====================================================== */

export function uuid() {

    return crypto.randomUUID();

}

/* ======================================================
   sleep
====================================================== */

export function sleep(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}

/* ======================================================
   Canvasクリア
====================================================== */

export function clearCanvas(ctx, canvas) {

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

}

/* ======================================================
   Canvas座標変換
====================================================== */

export function canvasPoint(canvas, clientX, clientY) {

    const rect = canvas.getBoundingClientRect();

    return {

        x: (clientX - rect.left) * canvas.width / rect.width,

        y: (clientY - rect.top) * canvas.height / rect.height

    };

}

/* ======================================================
   ファイル存在確認
====================================================== */

export async function fileExists(url) {

    try {

        const response = await fetch(url, {

            method: "HEAD"

        });

        return response.ok;

    }

    catch {

        return false;

    }

}

/* ======================================================
   JSON読込
====================================================== */

export async function loadJSON(url) {

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error("JSON読込失敗");

    }

    return await response.json();

}

/* ======================================================
   テキスト読込
====================================================== */

export async function loadText(url) {

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error("ファイル読込失敗");

    }

    return await response.text();

}
// ======================================================
// ホモグラフィ変換
// ======================================================

export function applyHomography(H, x, y) {

    if (!H) return null;

    const denom =
        H.data64F[6] * x +
        H.data64F[7] * y +
        H.data64F[8];

    const newX =
        (H.data64F[0] * x + H.data64F[1] * y + H.data64F[2]) / denom;

    const newY =
        (H.data64F[3] * x + H.data64F[4] * y + H.data64F[5]) / denom;

    return { x: newX, y: newY };
}
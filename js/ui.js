// ======================================================
// CAD AR System
// Version 2.0
// ui.js
// ユーザーインターフェース
// ======================================================

"use strict";

/* ======================================================
   HTML要素
====================================================== */

let partNoInput = null;
let loadButton = null;
let statusLabel = null;
let fpsLabel = null;

/* ======================================================
   初期化
====================================================== */

export function initializeUI() {

    partNoInput = document.getElementById("partNo");
    loadButton = document.getElementById("loadBtn");
    statusLabel = document.getElementById("statusText");
    fpsLabel = document.getElementById("fps");

    if (!partNoInput) {
        console.error("partNo が見つかりません。");
    }

    if (!loadButton) {
        console.error("loadBtn が見つかりません。");
    }

    if (!statusLabel) {
        console.error("statusText が見つかりません。");
    }

    if (!fpsLabel) {
        console.error("fps が見つかりません。");
    }

    // Enterキーでも読込み
    partNoInput?.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            loadButton.click();

        }

    });

}

/* ======================================================
   型番取得
====================================================== */

export function getPartNumber() {

    if (!partNoInput) {

        return "";

    }

    return partNoInput.value.trim();

}

/* ======================================================
   型番設定
====================================================== */

export function setPartNumber(value) {

    if (!partNoInput) return;

    partNoInput.value = value;

}

/* ======================================================
   型番入力へフォーカス
====================================================== */

export function focusPartNumber() {

    if (!partNoInput) return;

    partNoInput.focus();

}

/* ======================================================
   読込みボタン
====================================================== */

export function bindLoadButton(callback) {

    if (!loadButton) return;

    loadButton.addEventListener("click", callback);

}

/* ======================================================
   状態表示
====================================================== */

export function setStatus(message) {

    if (!statusLabel) return;

    statusLabel.textContent = message;

}

/* ======================================================
   FPS表示
====================================================== */

export function setFPS(value) {

    if (!fpsLabel) return;

    fpsLabel.textContent = value;

}

/* ======================================================
   ボタン有効
====================================================== */

export function enableLoadButton() {

    if (!loadButton) return;

    loadButton.disabled = false;

}

/* ======================================================
   ボタン無効
====================================================== */

export function disableLoadButton() {

    if (!loadButton) return;

    loadButton.disabled = true;

}

/* ======================================================
   型番クリア
====================================================== */

export function clearPartNumber() {

    if (!partNoInput) return;

    partNoInput.value = "";

}

/* ======================================================
   UI初期状態
====================================================== */

export function resetUI() {

    clearPartNumber();

    setStatus("準備完了");

    setFPS("0");

    enableLoadButton();

}

/* ======================================================
   エラー表示
====================================================== */

export function showError(message) {

    setStatus("エラー");

    alert(message);

}
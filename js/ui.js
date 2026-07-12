// ======================================================
// CAD AR System
// Version 3.0
// ui.js
// ======================================================

"use strict";

import { AppState } from "./js/state.js";

/* ======================================================
    UI Element
====================================================== */

const ui = {

    partNo: null,

    loadButton: null,

    status: null,

    debug: null,

    markerCheck: null

};

/* ======================================================
    初期化
====================================================== */

export function initializeUI() {

    ui.partNo =
        document.getElementById("partNo");

    ui.loadButton =
        document.getElementById("loadButton");

    ui.status =
        document.getElementById("status");

    ui.debug =
        document.getElementById("debug");

    ui.markerCheck =
        document.getElementById("markerVisible");

    console.log("UI Ready");

}

/* ======================================================
    Load Button
====================================================== */

export function bindLoadButton(callback) {

    if (!ui.loadButton)
        return;

    ui.loadButton.onclick = callback;

}

/* ======================================================
    部品番号取得
====================================================== */

export function getPartNumber() {

    if (!ui.partNo)
        return "";

    return ui.partNo.value.trim();

}

/* ======================================================
    ステータス表示
====================================================== */

export function setStatus(text) {

    AppState.setStatus(text);

    if (ui.status)
        ui.status.textContent = text;

}
/* ======================================================
    部品番号設定
====================================================== */

export function setPartNumber(partNo) {

    if (!ui.partNo)
        return;

    ui.partNo.value = partNo;

}

/* ======================================================
    Debug表示
====================================================== */

export function addDebug(text) {

    if (!ui.debug)
        return;

    const time = new Date().toLocaleTimeString();

    ui.debug.innerHTML +=

        "[" + time + "] " +
        text +
        "<br>";

    ui.debug.scrollTop =
        ui.debug.scrollHeight;

}

/* ======================================================
    Debugクリア
====================================================== */

export function clearDebug() {

    if (!ui.debug)
        return;

    ui.debug.innerHTML = "";

}

/* ======================================================
    FPS表示
====================================================== */

export function updateFPS() {

    const fpsLabel =
        document.getElementById("fps");

    if (!fpsLabel)
        return;

    fpsLabel.textContent =
        AppState.fps + " FPS";

}

/* ======================================================
    Message
====================================================== */

export function showMessage(text) {

    console.log(text);

    setStatus(text);

}

/* ======================================================
    Error
====================================================== */

export function showError(text) {

    console.error(text);

    setStatus(text);

    alert(text);

}

/* ======================================================
    Marker表示
====================================================== */

export function bindMarkerCheck(callback) {

    if (!ui.markerCheck)
        return;

    ui.markerCheck.onchange = () => {

        callback(ui.markerCheck.checked);

    };

}

/* ======================================================
    Marker状態
====================================================== */

export function markerVisible() {

    if (!ui.markerCheck)
        return true;

    return ui.markerCheck.checked;

}
/* ======================================================
    Enterキーで読込み
====================================================== */

export function bindEnterKey(callback) {

    if (!ui.partNo)
        return;

    ui.partNo.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {

            e.preventDefault();

            callback();

        }

    });

}

/* ======================================================
    部品番号保存
====================================================== */

export function saveLastPartNumber() {

    if (!ui.partNo)
        return;

    localStorage.setItem(
        "cadar-last-part",
        ui.partNo.value.trim()
    );

}

/* ======================================================
    部品番号復元
====================================================== */

export function loadLastPartNumber() {

    if (!ui.partNo)
        return;

    const partNo = localStorage.getItem(
        "cadar-last-part"
    );

    if (partNo) {

        ui.partNo.value = partNo;

    }

}

/* ======================================================
    ローディング表示
====================================================== */

export function showLoading(text = "Loading...") {

    setStatus(text);

    document.body.style.cursor = "wait";

}

/* ======================================================
    ローディング終了
====================================================== */

export function hideLoading() {

    document.body.style.cursor = "default";

}

/* ======================================================
    UIリセット
====================================================== */

export function resetUI() {

    clearDebug();

    setStatus("待機中");

}

/* ======================================================
    ダークモード
====================================================== */

export function setDarkMode(enable) {

    document.body.classList.toggle(
        "dark",
        enable
    );

}

/* ======================================================
    Version表示
====================================================== */

export function setVersion(version) {

    const label =
        document.getElementById("version");

    if (!label)
        return;

    label.textContent =
        "Version " + version;

}

/* ======================================================
    Destroy
====================================================== */

export function destroyUI() {

    clearDebug();

    if (ui.loadButton)
        ui.loadButton.onclick = null;

    if (ui.markerCheck)
        ui.markerCheck.onchange = null;

}

/* ======================================================
    Export
====================================================== */

export {

    ui

};
// ======================================================
// CAD AR System
// Version 2.0
// state.js
// アプリケーション状態管理
// ======================================================

"use strict";

/**
 * アプリケーション全体の状態
 *
 * 他のモジュールはこのオブジェクト経由で
 * データを共有します。
 */
export const AppState = {

    /* ==========================================
       アプリ状態
    ========================================== */

    initialized: false,

    busy: false,

    error: false,

    /* ==========================================
       型番
    ========================================== */

    partNumber: "",

    /* ==========================================
       カメラ
    ========================================== */

    cameraReady: false,

    stream: null,

    video: null,

    canvas: null,

    ctx: null,

    width: 0,

    height: 0,

    /* ==========================================
       FPS
    ========================================== */

    fps: 0,

    frameCount: 0,

    lastFrameTime: 0,

    /* ==========================================
       DXF
    ========================================== */

    dxfLoaded: false,

    dxfData: null,

    holeList: [],

    /* ==========================================
       基準画像
    ========================================== */

    referenceImage: null,

    referenceMat: null,

    /* ==========================================
       OpenCV
    ========================================== */

    cvReady: false,

    recognizing: false,

    homography: null,

    keypointsScene: null,

    keypointsReference: null,

    matches: [],

    /* ==========================================
       描画
    ========================================== */

    markerVisible: true,

    drawCount: 0

};

/* ======================================================
   初期化
====================================================== */

export function resetState() {

    AppState.busy = false;

    AppState.error = false;

    AppState.partNumber = "";

    AppState.cameraReady = false;

    AppState.stream = null;

    AppState.video = null;

    AppState.canvas = null;

    AppState.ctx = null;

    AppState.width = 0;

    AppState.height = 0;

    AppState.fps = 0;

    AppState.frameCount = 0;

    AppState.lastFrameTime = 0;

    AppState.dxfLoaded = false;

    AppState.dxfData = null;

    AppState.holeList = [];

    AppState.referenceImage = null;

    AppState.referenceMat = null;

    AppState.cvReady = false;

    AppState.recognizing = false;

    AppState.homography = null;

    AppState.keypointsScene = null;

    AppState.keypointsReference = null;

    AppState.matches = [];

    AppState.markerVisible = true;

    AppState.drawCount = 0;

}

/* ======================================================
   状態取得
====================================================== */

export function getState() {

    return AppState;

}

/* ======================================================
   型番
====================================================== */

export function setPartNumber(partNumber) {

    AppState.partNumber = partNumber;

}

export function getPartNumber() {

    return AppState.partNumber;

}

/* ======================================================
   FPS
====================================================== */

export function setFPS(fps) {

    AppState.fps = fps;

}

export function getFPS() {

    return AppState.fps;

}

/* ======================================================
   ホールデータ
====================================================== */

export function setHoleList(holeList) {

    AppState.holeList = holeList;

}

export function getHoleList() {

    return AppState.holeList;

}

/* ======================================================
   認識状態
====================================================== */

export function setRecognizing(value) {

    AppState.recognizing = value;

}

export function isRecognizing() {

    return AppState.recognizing;

}
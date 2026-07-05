/// ======================================================
// CAD AR System
// Version 2.0
// app.js
// Debug Enhanced Version
// ======================================================

"use strict";

/* ======================================================
    Import
====================================================== */

import { APP } from "./config.js";
import { AppState } from "./state.js";
import { log as utilLog, error } from "./utils.js";
import { initializeUI, bindLoadButton, getPartNumber, setStatus } from "./ui.js";
import { createQRCode } from "./qr.js";
import { camera } from "./camera.js";
import { dxfLoader } from "./dxf.js";
import { marker } from "./marker.js";
import { recognizer } from "./opencv-ar.js";

/* ======================================================
    画面デバッグログ（強化版）
====================================================== */

function log(msg) {
    const el = document.getElementById("debug");
    if (!el) return;

    const time = new Date().toLocaleTimeString();
    el.innerHTML += `[${time}] ${msg}<br>`;
    el.scrollTop = el.scrollHeight;

    // コンソールにも出す（PC用）
    console.log(msg);
}

/* ======================================================
    OpenCV待機
====================================================== */

function waitForOpenCV() {

    log("OpenCV待機開始");

    return new Promise(resolve => {

        const check = () => {

            if (window.cv && cv.Mat) {

                log("cv検出OK");

                cv.onRuntimeInitialized = () => {
                    log("OpenCV Runtime Initialized");
                    resolve();
                };

                return;
            }

            requestAnimationFrame(check);
        };

        check();
    });
}

/* ======================================================
    CAD AR Application
====================================================== */

class CADARApplication {

    constructor() {

        log("=== APP START ===");
        log(APP.NAME);
        log(APP.VERSION);
    }

    /* ==================================================
        初期化
    ================================================== */

    async initialize() {

        try {

            log("① initialize start");

            //------------------------------------------
            // DOM取得
            //------------------------------------------

            AppState.video = document.getElementById("video");
            AppState.canvas = document.getElementById("canvas");

            if (!AppState.video || !AppState.canvas) {
                log("❌ video/canvas が見つからない");
            }

            AppState.ctx = AppState.canvas.getContext("2d");

            log("② DOM OK");

            //------------------------------------------
            // UI初期化
            //------------------------------------------

            initializeUI();
            log("③ UI initialized");

            //------------------------------------------
            // QR生成
            //------------------------------------------

            createQRCode();
            log("④ QR created");

            //------------------------------------------
            // ボタンイベント
            //------------------------------------------

            bindLoadButton(() => {
                log("LOAD button clicked");
                this.loadPart();
            });

            //------------------------------------------
            // カメラ起動
            //------------------------------------------

            setStatus("カメラ起動中");
            log("⑤ camera start");

            await camera.start();

            log("⑥ camera ready");

            //------------------------------------------
            // OpenCV起動待ち
            //------------------------------------------

            setStatus("OpenCV準備中");

            await waitForOpenCV();

            AppState.cvReady = true;

            recognizer.initialize();

            log("⑦ OpenCV ready");

            //------------------------------------------
            // ARループ開始
            //------------------------------------------

            this.startARLoop();

            //------------------------------------------
            // 完了
            //------------------------------------------

            AppState.initialized = true;

            setStatus("準備完了");

            log("=== APP READY ===");

        }

        catch (e) {

            error(e);

            log("❌ INIT ERROR: " + e.message);

            setStatus("初期化エラー");

        }

    }

    /* ==================================================
        型番読込
    ================================================== */

    async loadPart() {

        log("⑧ loadPart start");

        const partNumber = getPartNumber();

        log("型番: " + partNumber);

        if (!partNumber) {
            log("❌ 型番なし");
            alert("型番を入力してください。");
            return;
        }

        try {

            setStatus("図面読込中");

            const data = await dxfLoader.load(partNumber);

            log("DXF load OK");

            AppState.partNumber = partNumber;
            AppState.holeList = data.holes;

            log("穴数: " + (AppState.holeList ? AppState.holeList.length : 0));

            marker.initialize();

            await this.loadReferenceImage(partNumber);

            AppState.recognizing = true;

            setStatus("AR開始");

            log("=== AR READY ===");

        }

        catch (e) {

            error(e);

            log("❌ DXF ERROR: " + e);

            setStatus("読込エラー");

        }

    }

    /* ==================================================
        reference画像ロード
    ================================================== */

    async loadReferenceImage(partNumber) {

        log("reference load start");

        return new Promise((resolve, reject) => {

            const img = new Image();

            img.src = `parts/${partNumber}/reference.jpg`;

            img.onload = () => {

                log("reference loaded");

                const mat = cv.imread(img);

                AppState.referenceMat = mat;

                resolve();
            };

            img.onerror = () => {

                log("❌ reference.jpg not found");

                reject("reference not found");
            };

        });

    }

    /* ==================================================
        ARループ
    ================================================== */

    startARLoop() {

        log("AR loop start");

        const video = AppState.video;
        const ctx = AppState.ctx;

        const loop = () => {

            if (AppState.recognizing) {

                ctx.drawImage(video, 0, 0);

                if (AppState.referenceMat) {

                    const frameMat = cv.imread(video);

                    recognizer.process(frameMat, AppState.referenceMat);

                    frameMat.delete();
                }

                const H = AppState.homography;

                if (H && AppState.holeList && AppState.holeList.length > 0) {

                    marker.drawAR(AppState.holeList, H);

                } else {
                    // 軽い監視ログ（連打しない）
                    if (!this._warned) {
                        log("⚠ homography or holeList not ready");
                        this._warned = true;
                    }
                }

            }

            requestAnimationFrame(loop);
        };

        loop();
    }

}

/* ======================================================
    起動
====================================================== */

window.addEventListener("DOMContentLoaded", async () => {

    log("DOM loaded");

    const app = new CADARApplication();

    await app.initialize();

});
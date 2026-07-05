// ======================================================
// CAD AR System
// Version 2.0
// app.js
// メインアプリケーション（OpenCV完全接続版）
// ======================================================

"use strict";

/* ======================================================
    Import
====================================================== */

import { APP } from "./config.js";

import { AppState } from "./state.js";

import { log, error } from "./utils.js";

import { initializeUI, bindLoadButton, getPartNumber, setStatus } from "./ui.js";

import { createQRCode } from "./qr.js";

import { camera } from "./camera.js";

import { dxfLoader } from "./dxf.js";

import { marker } from "./marker.js";

import { recognizer } from "./opencv-ar.js";

/* ======================================================
    OpenCV待機
====================================================== */

function waitForOpenCV() {

    return new Promise(resolve => {

        const check = () => {

            if (window.cv && cv.Mat) {

                cv.onRuntimeInitialized = () => {

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

        log(APP.NAME);

        log(APP.VERSION);

    }

    /* ==================================================
        初期化
    ================================================== */

    async initialize() {

        try {

            log("Application Initialize");

            //------------------------------------------
            // DOM取得
            //------------------------------------------

            AppState.video = document.getElementById("video");

            AppState.canvas = document.getElementById("canvas");

            AppState.ctx = AppState.canvas.getContext("2d");

            //------------------------------------------
            // UI初期化
            //------------------------------------------

            initializeUI();

            //------------------------------------------
            // QR生成
            //------------------------------------------

            createQRCode();

            //------------------------------------------
            // ボタンイベント
            //------------------------------------------

            bindLoadButton(() => {

                this.loadPart();

            });

            //------------------------------------------
            // カメラ起動
            //------------------------------------------

            setStatus("カメラ起動中");

            await camera.start();

            //------------------------------------------
            // OpenCV起動待ち
            //------------------------------------------

            setStatus("OpenCV準備中");

            await waitForOpenCV();

            AppState.cvReady = true;

            recognizer.initialize();

            log("OpenCV Ready");

            //------------------------------------------
            // ARループ開始
            //------------------------------------------

            this.startARLoop();

            //------------------------------------------
            // 完了
            //------------------------------------------

            AppState.initialized = true;

            setStatus("準備完了");

            log("Application Ready");

        }

        catch (e) {

            error(e);

            setStatus("初期化エラー");

        }

    }

    /* ==================================================
        型番読込
    ================================================== */

    async loadPart() {

        const partNumber = getPartNumber();

        if (!partNumber) {

            alert("型番を入力してください。");

            return;

        }

        try {

            setStatus("図面読込中");

            // JSONロード
            const data = await dxfLoader.load(partNumber);

            AppState.partNumber = partNumber;

            AppState.holeList = data.holes;

            marker.initialize();

            // reference.jpg 読み込み
            await this.loadReferenceImage(partNumber);

            AppState.recognizing = true;

            setStatus("AR開始");

            log("AR Ready");

        }

        catch (e) {

            error(e);

            setStatus("読込エラー");

        }

    }

    /* ==================================================
        reference画像ロード
    ================================================== */

    async loadReferenceImage(partNumber) {

        return new Promise((resolve, reject) => {

            const img = new Image();

            img.src = `parts/${partNumber}/reference.jpg`;

            img.onload = () => {

                const mat = cv.imread(img);

                AppState.referenceMat = mat;

                log("Reference Loaded");

                resolve();

            };

            img.onerror = () => {

                reject("reference.jpg not found");

            };

        });

    }

    /* ==================================================
        ARループ
    ================================================== */

    startARLoop() {

        const video = AppState.video;

        const ctx = AppState.ctx;

        const loop = () => {

            if (AppState.recognizing && AppState.holeList) {

                // ① カメラ描画
                ctx.drawImage(video, 0, 0);

                // ② OpenCV処理
                if (AppState.referenceMat) {

                    const frameMat = cv.imread(video);

                    recognizer.process(frameMat, AppState.referenceMat);

                    frameMat.delete();

                }

                // ③ AR描画
                const H = AppState.homography;

                if (H && AppState.holeList.length > 0) {

                    marker.drawAR(AppState.holeList, H);

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

    const app = new CADARApplication();

    await app.initialize();

});
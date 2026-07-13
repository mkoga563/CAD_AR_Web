// ======================================================
// CAD AR System
// Version 3.0
// app.js
// ======================================================

"use strict";

/* ======================================================
    Import
====================================================== */

import { APP } from "./config.js";
import { AppState } from "./state.js";
import { log, error } from "./utils.js";

import {

    initializeUI,

    bindLoadButton,

    bindMarkerCheck,

    bindEnterKey,

    loadLastPartNumber,

    saveLastPartNumber,

    getPartNumber,

    setStatus

} from "./ui.js";

import { createQRCode } from "./qr.js";
import { camera } from "./camera.js";
import { dxfLoader } from "./dxf.js";
import { marker } from "./marker.js";
import { recognizer } from "./opencv-ar.js";

/* ======================================================
    デバッグ出力
====================================================== */

function debug(message) {

    console.log("[CAD-AR]", message);

    const el = document.getElementById("debug");

    if (!el) return;

    const t = new Date().toLocaleTimeString();

    el.innerHTML += `[${t}] ${message}<br>`;

    el.scrollTop = el.scrollHeight;

}

/* ======================================================
    OpenCV待機
====================================================== */

async function waitForOpenCV() {

    debug("OpenCV Loading...");

    return new Promise(resolve => {

        const timer = setInterval(() => {

            if (window.cv && typeof cv.Mat === "function") {

                clearInterval(timer);

                debug("OpenCV Ready");

                resolve();

            }

        }, 100);

    });

}
/* ======================================================
    CAD AR Application
====================================================== */

class CADARApplication {

    constructor() {

        debug("====================================");
        debug(APP.NAME);
        debug("Version : " + APP.VERSION);
        debug("====================================");

    }

    /* ==================================================
        初期化
    ================================================== */

    async initialize() {

        try {

            debug("Application Initialize");

            //------------------------------------------
            // DOM取得
            //------------------------------------------

            AppState.video = document.getElementById("video");
            AppState.canvas = document.getElementById("canvas");

            if (!AppState.video)
                throw new Error("video element not found");

            if (!AppState.canvas)
                throw new Error("canvas element not found");

            AppState.ctx = AppState.canvas.getContext("2d");

            debug("DOM OK");

            //------------------------------------------
            // UI
            //------------------------------------------

            initializeUI();

            loadLastPartNumber();

            bindEnterKey(() => {

                this.loadPart();

            });

            bindMarkerCheck((visible) => {

                marker.show(visible);

            });
            bindLoadButton(() => {

                this.loadPart();

            });

            debug("UI OK");

            //------------------------------------------
            // QR
            //------------------------------------------

            createQRCode();

            debug("QR OK");

            //------------------------------------------
            // Camera
            //------------------------------------------

            setStatus("カメラ起動中");

            await camera.start();

            await camera.enumerate();

            await camera.autoFocus();

            debug(
                "Camera : "
                + AppState.video.videoWidth
                + " x "
                + AppState.video.videoHeight
            );

            //------------------------------------------
            // Canvasサイズ
            //------------------------------------------

            const rect = AppState.video.getBoundingClientRect();

            AppState.canvas.width = rect.width;
            AppState.canvas.height = rect.height;

            debug(
                "Canvas : "
                + AppState.canvas.width
                + " x "
                + AppState.canvas.height
            );
            const canvasRect = AppState.canvas.getBoundingClientRect();

            alert(
                "Canvas\n" +
                "width=" + AppState.canvas.width +
                "\nheight=" + AppState.canvas.height +
                "\n表示=" + canvasRect.width + "×" + canvasRect.height
            );
            //------------------------------------------
            // OpenCV
            //------------------------------------------

            setStatus("OpenCV準備中");

            await waitForOpenCV();

            recognizer.initialize();

            AppState.cvReady = true;

            debug("Recognizer OK");

            //------------------------------------------
            // AR Loop
            //------------------------------------------

            this.startARLoop();

            //------------------------------------------
            // Finish
            //------------------------------------------

            AppState.initialized = true;

            setStatus("準備完了");

            debug("Application Ready");

        }

        catch (e) {

            console.error(e);

            error(e);

            debug("INIT ERROR : " + e.message);

            setStatus("初期化エラー");

        }

    }
    /* ==================================================
        部品読込み
    ================================================== */

    async loadPart() {

        try {

            const partNo = getPartNumber();

            if (!partNo) {

                alert("部品番号を入力してください。");
                return;

            }

            debug("------------------------------------");
            debug("Loading Part : " + partNo);

            setStatus("CADデータ読込中");

            //------------------------------------------
            // JSON読込
            //------------------------------------------

            const ok = await dxfLoader.load(partNo);

            if (!ok) {

                throw new Error("JSONの読み込みに失敗しました");

            }

            //------------------------------------------
            // マーカー生成
            //------------------------------------------

            marker.clear();

            marker.load(dxfLoader.getHoles());

            AppState.partLoaded = true;

            AppState.partNo = partNo;

            AppState.holes = dxfLoader.getHoles();

            AppState.outline = dxfLoader.getOutline();

            AppState.bounds = dxfLoader.getBounds();

            debug("Hole Count : " + marker.count());

            //------------------------------------------
            // 輪郭情報
            //------------------------------------------

            if (dxfLoader.getOutline) {

                const outline = dxfLoader.getOutline();

                debug("Outline : " + outline.length);

            }

            setStatus("CAD読込完了");

            debug("Part Ready");

        }

        catch (e) {

            console.error(e);

            error(e);

            debug("LOAD ERROR : " + e.message);

            setStatus("CAD読込失敗");

        }
        saveLastPartNumber();
    }

    /* ==================================================
        AR描画開始
    ================================================== */

    startARLoop() {

        debug("AR Loop Start");

        const loop = () => {

            if (!AppState.initialized) {

                requestAnimationFrame(loop);
                return;

            }

            //------------------------------------------
            // カメラ画像描画
            //------------------------------------------

            AppState.ctx.clearRect(
                0,
                0,
                AppState.canvas.width,
                AppState.canvas.height
            );

            function resizeCanvas() {

                if (!AppState.video || !AppState.canvas) return;

                const rect = AppState.video.getBoundingClientRect();

                AppState.canvas.width = rect.width;
                AppState.canvas.height = rect.height;

                debug(`Canvas Resize : ${rect.width} x ${rect.height}`);

            }



            //------------------------------------------
            // OpenCV認識
            //------------------------------------------
            recognizer.drawDebug(AppState.ctx);
            if (
                AppState.cvReady &&
                AppState.partLoaded
            ) {

                try {

                    recognizer.detect();

                    if (recognizer.isDetected()) {

                        marker.draw(
                            AppState.ctx,
                            recognizer.getTransform()
                        );

                    }



                }

                catch (e) {

                    console.error(e);

                }

            }

            requestAnimationFrame(loop);

        };

        requestAnimationFrame(loop);

    }

}
/* ==================================================
    Window Resize
================================================== */

function resizeCanvas() {

    if (!AppState.video || !AppState.canvas) return;

    const w = AppState.video.videoWidth;
    const h = AppState.video.videoHeight;

    if (w === 0 || h === 0) return;

    AppState.canvas.width = w;
    AppState.canvas.height = h;

    debug(`Canvas Resize : ${w} x ${h}`);

}

/* ==================================================
    Visibility
================================================== */

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        debug("Application Pause");

    } else {

        debug("Application Resume");

    }

});

/* ==================================================
    Resize Event
================================================== */

window.addEventListener("resize", () => {

    resizeCanvas();

});

/* ==================================================
    Error Handler
================================================== */

window.addEventListener("error", (event) => {

    console.error(event.error);

    debug("ERROR : " + event.message);

});

window.addEventListener("unhandledrejection", (event) => {

    console.error(event.reason);

    debug("Promise ERROR : " + event.reason);

});

/* ==================================================
    Start
================================================== */

window.addEventListener("DOMContentLoaded", async () => {

    debug("DOM Ready");

    const app = new CADARApplication();

    AppState.app = app;

    await app.initialize();

});

/* ==================================================
    Export
================================================== */

export default CADARApplication;
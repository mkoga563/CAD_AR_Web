// ======================================================
// CAD AR System
// Version 3.1
// app.js
// Part 1
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
    Debug
====================================================== */

function debug(message) {

    console.log("[CAD-AR]", message);

    const el = document.getElementById("debug");

    if (!el) return;

    const time = new Date().toLocaleTimeString();

    el.innerHTML += `[${time}] ${message}<br>`;

    el.scrollTop = el.scrollHeight;

}

/* ======================================================
    Canvas Resize
====================================================== */

function resizeCanvas() {

    if (!AppState.video) return;

    if (!AppState.canvas) return;

    const rect =
        AppState.video.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) return;

    AppState.canvas.width = rect.width;
    AppState.canvas.height = rect.height;

    debug(
        `Canvas ${rect.width} x ${rect.height}`
    );

}

/* ======================================================
    OpenCV Wait
====================================================== */

async function waitForOpenCV() {

    debug("Waiting OpenCV...");

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

        debug("===================================");

        debug(APP.NAME);

        debug("Version : " + APP.VERSION);

        debug("===================================");

    }
    /* ==================================================
    Initialize
================================================== */

    async initialize() {

        try {

            debug("Application Initialize");

            //------------------------------------------
            // DOM
            //------------------------------------------

            AppState.video =
                document.getElementById("video");

            AppState.canvas =
                document.getElementById("canvas");

            if (!AppState.video)
                throw new Error("video not found");

            if (!AppState.canvas)
                throw new Error("canvas not found");

            AppState.ctx =
                AppState.canvas.getContext("2d");

            debug("DOM Ready");

            //------------------------------------------
            // UI
            //------------------------------------------

            initializeUI();

            loadLastPartNumber();

            bindEnterKey(() => {

                this.loadPart();

            });

            bindLoadButton(() => {

                this.loadPart();

            });

            bindMarkerCheck((visible) => {

                marker.show(visible);

            });

            debug("UI Ready");

            //------------------------------------------
            // QR
            //------------------------------------------

            createQRCode();

            debug("QR Ready");

            //------------------------------------------
            // Camera
            //------------------------------------------

            setStatus("カメラ起動中");

            await camera.start();

            await new Promise(resolve => {

                if (AppState.video.readyState >= 1) {

                    resolve();

                } else {

                    AppState.video.onloadedmetadata =
                        () => resolve();

                }

            });

            await camera.enumerate();

            try {

                await camera.autoFocus();

            }

            catch {

                debug("AutoFocus Skip");

            }

            resizeCanvas();

            debug(

                "Video : " +

                AppState.video.videoWidth +

                " x " +

                AppState.video.videoHeight

            );

            //------------------------------------------
            // OpenCV
            //------------------------------------------

            setStatus("OpenCV準備中");

            await waitForOpenCV();

            recognizer.initialize();

            AppState.cvReady = true;

            debug("Recognizer Ready");

            //------------------------------------------
            // Resize Event
            //------------------------------------------

            window.addEventListener(

                "resize",

                resizeCanvas

            );

            //------------------------------------------
            // Finish
            //------------------------------------------

            AppState.initialized = true;

            setStatus("準備完了");

            debug("Application Ready");

            //------------------------------------------
            // AR Start
            //------------------------------------------

            this.startARLoop();

        }

        catch (e) {

            console.error(e);

            error(e);

            debug(e.message);

            setStatus("初期化エラー");

        }

    }
    /* ==================================================
    AR Loop
================================================== */

    startARLoop() {

        debug("AR Loop Start");

        const loop = () => {

            //------------------------------------------
            // 初期化待ち
            //------------------------------------------

            if (!AppState.initialized) {

                requestAnimationFrame(loop);

                return;

            }

            //------------------------------------------
            // Canvas Clear
            //------------------------------------------

            AppState.ctx.clearRect(

                0,
                0,

                AppState.canvas.width,
                AppState.canvas.height

            );

            //------------------------------------------
            // 認識処理
            //------------------------------------------

            if (

                AppState.cvReady &&

                AppState.partLoaded

            ) {

                try {

                    recognizer.detect();

                }

                catch (e) {

                    console.error(e);

                    debug(
                        "Recognizer : " +
                        e.message
                    );

                }

            }

            //------------------------------------------
            // Debug
            //------------------------------------------

            try {

                recognizer.drawDebug(
                    AppState.ctx
                );

            }

            catch {

            }

            //------------------------------------------
            // Hole Marker
            //------------------------------------------

            if (

                recognizer.isDetected()

            ) {

                try {

                    marker.draw(

                        AppState.ctx,

                        recognizer.getTransform()

                    );

                }

                catch (e) {

                    console.error(e);

                }

            }

            //------------------------------------------
            // Next Frame
            //------------------------------------------

            requestAnimationFrame(loop);

        };

        requestAnimationFrame(loop);

    }

}
/* ==================================================
    Visibility
================================================== */

document.addEventListener(

    "visibilitychange",

    () => {

        if (document.hidden) {

            debug("Application Pause");

        }

        else {

            debug("Application Resume");

            resizeCanvas();

        }

    }

);

/* ==================================================
    Window Resize
================================================== */

window.addEventListener(

    "resize",

    () => {

        resizeCanvas();

    }

);

/* ==================================================
    Orientation
================================================== */

window.addEventListener(

    "orientationchange",

    () => {

        setTimeout(() => {

            resizeCanvas();

        },300);

    }

);

/* ==================================================
    Error
================================================== */

window.addEventListener(

    "error",

    event => {

        console.error(event.error);

        debug(

            "ERROR : " +

            event.message

        );

    }

);

window.addEventListener(

    "unhandledrejection",

    event => {

        console.error(event.reason);

        debug(

            "Promise : " +

            event.reason

        );

    }

);

/* ==================================================
    DOM Ready
================================================== */

window.addEventListener(

    "DOMContentLoaded",

    async () => {

        debug("DOM Ready");

        const app =

            new CADARApplication();

        AppState.app = app;

        await app.initialize();

    }

);

/* ==================================================
    Export
================================================== */

export default CADARApplication;
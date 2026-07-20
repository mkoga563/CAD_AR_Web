// ======================================================
// CAD AR System
// Version 4.0
// app.js

// ======================================================

"use strict";

import { AppState } from "./state.js";
import { camera } from "./camera.js";
import { marker } from "./marker.js";
import { dxfLoader } from "./dxf.js";
import { createQRCode } from "./qr.js";

/* ======================================================
    CAD AR Application
====================================================== */

class CADARApplication {

    constructor() {

        console.log("CAD AR Version 4.0");

    }

    /* ==================================================
        Initialize
    ================================================== */

    async initialize() {

        try {

            //------------------------------------------
            // DOM
            //------------------------------------------

            AppState.video =
                document.getElementById("video");

            AppState.canvas =
                document.getElementById("canvas");

            AppState.ctx =
                AppState.canvas.getContext("2d");

            //------------------------------------------
            // Camera
            //------------------------------------------

            document.getElementById(
                "status"
            ).textContent =
                "カメラ起動中...";

            const ok =
                await camera.start();

            if (!ok) {

                throw new Error(
                    "Camera Start Error"
                );

            }

            //------------------------------------------
            // Canvas
            //------------------------------------------

            camera.resize();

            //------------------------------------------
            // Marker
            //------------------------------------------

             //marker.initialize();

            //------------------------------------------
            // QR
            //------------------------------------------

            createQRCode(
                "qrcode",
                window.location.href
            );

            //------------------------------------------
            // Status
            //------------------------------------------

            document.getElementById(
                "status"
            ).textContent =
                "準備完了";

            AppState.initialized = true;

            console.log("Application Ready");

        }

        catch (e) {

            console.error(e);

            alert(e.message);

        }

    }
    /* ==================================================
        CAD読込
    ================================================== */

    async loadPart() {

        try {

            const input =

                document.getElementById(

                    "partNo"

                );

            const partNo =

                input.value.trim();

            if (partNo === "") {

                alert("部品番号を入力してください。");

                return;

            }

            document.getElementById(

                "status"

            ).textContent =

                "CAD読込中...";

            //------------------------------------------
            // JSON
            //------------------------------------------

            const ok =

                await dxfLoader.load(

                    partNo

                );

            if (!ok) {

                document.getElementById(

                    "status"

                ).textContent =

                    "JSON読込失敗";

                return;

            }

            //------------------------------------------
            // 情報更新
            //------------------------------------------

            marker.updateInfo();

            //------------------------------------------
            // 保存
            //------------------------------------------

            localStorage.setItem(

                "cadar_part",

                partNo

            );

            document.getElementById(

                "status"

            ).textContent =

                "CAD読込完了";

            console.log(

                "Part Loaded",

                partNo

            );

        }

        catch (e) {

            console.error(e);

            alert(e.message);

        }

    }

    /* ==================================================
        Last Part
    ================================================== */

    loadLastPart() {

        const part =

            localStorage.getItem(

                "cadar_part"

            );

        if (!part) return;

        document.getElementById(

            "partNo"

        ).value = part;

    }

    /* ==================================================
        Event
    ================================================== */

    bindEvents() {

        //------------------------------------------
        // CAD読込
        //------------------------------------------

        document

            .getElementById(

                "loadButton"

            )

            .addEventListener(

                "click",

                () => {

                    this.loadPart();

                }

            );

        //------------------------------------------
        // Enter
        //------------------------------------------

        document

            .getElementById(

                "partNo"

            )

            .addEventListener(

                "keydown",

                (e) => {

                    if (

                        e.key === "Enter"

                    ) {

                        this.loadPart();

                    }

                }

            );

        //------------------------------------------
        // Reset
        //------------------------------------------

        document

            .getElementById(

                "resetButton"

            )

            .addEventListener(

                "click",

                () => {

                    marker.reset();

                }

            );

        //------------------------------------------
        // Outline
        //------------------------------------------

        document

            .getElementById(

                "outlineButton"

            )

            .addEventListener(

                "click",

                () => {

                    marker.toggleOutline();

                }

            );

        //------------------------------------------
        // Marker
        //------------------------------------------

        document

            .getElementById(

                "markerButton"

            )

            .addEventListener(

                "click",

                () => {

                    marker.toggleMarker();

                }

            );

    }
    /* ==================================================
    Start
================================================== */

    async start() {

        //------------------------------------------
        // 初期化
        //------------------------------------------

        await this.initialize();

        //------------------------------------------
        // ボタンイベント
        //------------------------------------------

        this.bindEvents();

        //------------------------------------------
        // 前回部品番号
        //------------------------------------------

        this.loadLastPart();

        //------------------------------------------
        // 前回自動読込（入力がある場合）
        //------------------------------------------

        const partNo =

            document.getElementById(

                "partNo"

            ).value.trim();

        if (partNo !== "") {

            await this.loadPart();

        }

        //------------------------------------------
        // Loading
        //------------------------------------------

        const loading =

            document.getElementById(

                "loading"

            );

        if (loading) {

            loading.style.display = "none";

        }

        console.log("System Start");

    }

}

/* ======================================================
    DOM Ready
====================================================== */

window.addEventListener(

    "DOMContentLoaded",

    async () => {

        const app =

            new CADARApplication();

        AppState.app = app;

        await app.start();

    }

);

/* ======================================================
    Before Unload
====================================================== */

window.addEventListener(

    "beforeunload",

    () => {

        if (AppState.stream) {

            camera.stop();

        }

    }

);

/* ======================================================
    Visibility Change
====================================================== */

document.addEventListener(

    "visibilitychange",

    () => {

        if (document.hidden) {

            console.log("Pause");

        }
        else {

            console.log("Resume");

            camera.resize();

        }

    }

);

/* ======================================================
    Window Resize
====================================================== */

window.addEventListener(

    "resize",

    () => {

        camera.resize();

    }

);

/* ======================================================
    Export
====================================================== */

export default CADARApplication;
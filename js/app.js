// ======================================================
// CAD AR System
// Version 4.1
// app.js (Part1)
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

        console.log("CAD AR Version 4.1");

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

            if (!AppState.video)
                throw new Error("video が見つかりません");

            if (!AppState.canvas)
                throw new Error("canvas が見つかりません");

            AppState.ctx =
                AppState.canvas.getContext("2d");

            //------------------------------------------
            // Camera
            //------------------------------------------

            document.getElementById("status").textContent =
                "カメラ起動中...";

            const ok =
                await camera.start();

            if (!ok) {

                throw new Error(
                    "Camera Start Error"
                );

            }

            camera.resize();

            //------------------------------------------
            // QR
            //------------------------------------------

            createQRCode(
                "qrcode",
                window.location.href
            );

            //------------------------------------------
            // Menu
            //------------------------------------------

            this.initializeMenu();

            //------------------------------------------
            // Status
            //------------------------------------------

            document.getElementById("status").textContent =
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
        Side Menu
    ================================================== */

    initializeMenu() {

        const menuButton =
            document.getElementById("menuButton");

        const sideMenu =
            document.getElementById("sideMenu");

        if (!menuButton || !sideMenu) {

            console.log("Side Menu Not Found");

            return;

        }

        menuButton.addEventListener(

            "click",

            () => {

                sideMenu.classList.toggle("open");

            }

        );

    }
        /* ==================================================
        CAD読込
    ================================================== */

    async loadPart() {

        try {

            const input =
                document.getElementById("partNo");

            if (!input) {

                throw new Error("partNo が見つかりません");

            }

            const partNo =
                input.value.trim();

            if (partNo === "") {

                alert("部品番号を入力してください。");

                input.focus();

                return;

            }

            //------------------------------------------
            // Status
            //------------------------------------------

            const status =
                document.getElementById("status");

            if (status) {

                status.textContent =
                    "CAD読込中...";

            }

            //------------------------------------------
            // JSON読込
            //------------------------------------------

            const ok =
                await dxfLoader.load(partNo);

            if (!ok) {

                if (status) {

                    status.textContent =
                        "JSON読込失敗";

                }

                return;

            }

            //------------------------------------------
            // Marker更新
            //------------------------------------------

            marker.updateInfo();

            //------------------------------------------
            // 前回部品保存
            //------------------------------------------

            localStorage.setItem(
                "cadar_part",
                partNo
            );

            //------------------------------------------
            // Status
            //------------------------------------------

            if (status) {

                status.textContent =
                    "CAD読込完了";

            }

            console.log(
                "Part Loaded :",
                partNo
            );

            console.log(
                "Hole Count :",
                dxfLoader.getHoleCount()
            );

        }

        catch (e) {

            console.error(e);

            alert(e.message);

        }

    }

    /* ==================================================
        前回部品読込
    ================================================== */

    loadLastPart() {

        const part =
            localStorage.getItem(
                "cadar_part"
            );

        if (!part) return;

        const input =
            document.getElementById("partNo");

        if (input) {

            input.value = part;

        }

    }
        /* ==================================================
        Event
    ================================================== */

    bindEvents() {

        //------------------------------------------
        // CAD読込
        //------------------------------------------

        const loadButton =
            document.getElementById("loadButton");

        if (loadButton) {

            loadButton.addEventListener(

                "click",

                () => {

                    this.loadPart();

                }

            );

        }

        //------------------------------------------
        // Enterキー
        //------------------------------------------

        const partNo =
            document.getElementById("partNo");

        if (partNo) {

            partNo.addEventListener(

                "keydown",

                (e) => {

                    if (e.key === "Enter") {

                        this.loadPart();

                    }

                }

            );

        }

        //------------------------------------------
        // リセット
        //------------------------------------------

        const resetButton =
            document.getElementById("resetButton");

        if (resetButton) {

            resetButton.addEventListener(

                "click",

                () => {

                    marker.reset();

                }

            );

        }

        //------------------------------------------
        // 外形表示
        //------------------------------------------

        const outlineCheck =
            document.getElementById("outlineCheck");

        if (outlineCheck) {

            outlineCheck.addEventListener(

                "change",

                () => {

                    marker.showOutline =
                        outlineCheck.checked;

                }

            );

        }

        //------------------------------------------
        // 穴表示
        //------------------------------------------

        const markerCheck =
            document.getElementById("markerCheck");

        if (markerCheck) {

            markerCheck.addEventListener(

                "change",

                () => {

                    marker.visible =
                        markerCheck.checked;

                }

            );

        }

        //------------------------------------------
        // カメラ切替
        //------------------------------------------

        const cameraButton =
            document.getElementById("cameraButton");

        if (cameraButton) {

            cameraButton.addEventListener(

                "click",

                async () => {

                    await camera.switchCamera();

                }

            );

        }

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
        // イベント
        //------------------------------------------

        this.bindEvents();

        //------------------------------------------
        // 前回部品
        //------------------------------------------

        this.loadLastPart();

        //------------------------------------------
        // 自動読込
        //------------------------------------------

        const input =
            document.getElementById("partNo");

        if (input && input.value.trim() !== "") {

            await this.loadPart();

        }

        //------------------------------------------
        // Loading終了
        //------------------------------------------

        const loading =
            document.getElementById("loading");

        if (loading) {

            loading.style.display = "none";

        }

        //------------------------------------------
        // 描画開始
        //------------------------------------------

        this.drawLoop();

        console.log("System Start");

    }

    /* ==================================================
        Draw Loop
    ================================================== */

    drawLoop() {

        const loop = () => {

            if (
                AppState.ctx &&
                AppState.initialized &&
                AppState.jsonLoaded
            ) {

                //----------------------------------
                // Canvasクリア
                //----------------------------------

                AppState.ctx.clearRect(
                    0,
                    0,
                    AppState.canvas.width,
                    AppState.canvas.height
                );

                //----------------------------------
                // CAD描画
                //----------------------------------

                marker.draw();

            }

            requestAnimationFrame(loop);

        };

        requestAnimationFrame(loop);

    }

}
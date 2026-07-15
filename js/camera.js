// ======================================================
// CAD AR System
// Version 4.0
// camera.js
// ======================================================

"use strict";

import { AppState } from "./state.js";

/* ======================================================
    Camera
====================================================== */

export const camera = {

    /* ==================================================
        Start Camera
    ================================================== */

    async start() {

        try {

            if (AppState.stream) {

                this.stop();

            }

            const constraints = {

                audio: false,

                video: {

                    facingMode: AppState.cameraFacing,

                    width: {

                        ideal: 1920

                    },

                    height: {

                        ideal: 1080

                    }

                }

            };

            AppState.stream =

                await navigator.mediaDevices.getUserMedia(

                    constraints

                );

            AppState.video.srcObject =

                AppState.stream;

            await AppState.video.play();

            await new Promise(resolve => {

                if (

                    AppState.video.readyState >= 2

                ) {

                    resolve();

                }

                else {

                    AppState.video.onloadedmetadata = () => {

                        resolve();

                    };

                }

            });

            this.resize();

            AppState.cameraReady = true;

            console.log(

                "Camera Ready",

                AppState.video.videoWidth,

                AppState.video.videoHeight

            );

            return true;

        }

        catch (e) {

            console.error(e);

            alert("カメラを起動できません。");

            return false;

        }

    },

    /* ==================================================
        Stop Camera
    ================================================== */

    stop() {

        if (!AppState.stream) return;

        AppState.stream

            .getTracks()

            .forEach(track => {

                track.stop();

            });

        AppState.stream = null;

        AppState.cameraReady = false;

    },

    /* ==================================================
        Switch Camera
    ================================================== */

    async switchCamera() {

        if (

            AppState.cameraFacing ===

            "environment"

        ) {

            AppState.cameraFacing = "user";

        }

        else {

            AppState.cameraFacing =

                "environment";

        }

        await this.start();

    },

    /* ==================================================
        Resize Canvas
    ================================================== */

    resize() {

        if (!AppState.video) return;

        if (!AppState.canvas) return;

        const rect =

            AppState.video.getBoundingClientRect();

        AppState.canvas.width =

            rect.width;

        AppState.canvas.height =

            rect.height;

        console.log(

            "Canvas",

            rect.width,

            rect.height

        );

    }

};

/* ======================================================
    Resize Event
====================================================== */

window.addEventListener(

    "resize",

    () => {

        camera.resize();

    }

);

/* ======================================================
    Orientation
====================================================== */

window.addEventListener(

    "orientationchange",

    () => {

        setTimeout(() => {

            camera.resize();

        },300);

    }

);
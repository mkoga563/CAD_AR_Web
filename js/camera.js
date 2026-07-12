// ======================================================
// CAD AR System
// Version 3.0
// camera.js
// ======================================================

"use strict";

import { APP } from "./js/config.js";

import { AppState } from "./js/state.js";

/* ======================================================
    Camera Controller
====================================================== */

class CameraController {

    constructor() {

        this.stream = null;

        this.deviceId = null;

        this.devices = [];

        this.constraints = {

            audio: false,

            video: {

                facingMode: "environment",

                width: {
                    ideal: APP.CAMERA.WIDTH
                },

                height: {
                    ideal: APP.CAMERA.HEIGHT
                }

            }

        };

    }

    /* ==================================================
        Camera Start
    ================================================== */

    async start() {

        try {

            await this.stop();

            this.stream =
                await navigator.mediaDevices.getUserMedia(
                    this.constraints
                );

            AppState.video.srcObject =
                this.stream;

            await AppState.video.play();

            await this.waitVideo();

            AppState.stream =
                this.stream;

            AppState.cameraWidth =
                AppState.video.videoWidth;

            AppState.cameraHeight =
                AppState.video.videoHeight;

            console.log(
                "Camera Started",
                AppState.cameraWidth,
                AppState.cameraHeight
            );

            return true;

        }

        catch (e) {

            console.error(e);

            return false;

        }

    }

    /* ==================================================
        Video待機
    ================================================== */

    async waitVideo() {

        return new Promise(resolve => {

            if (
                AppState.video.readyState >= 2
            ) {

                resolve();

                return;

            }

            AppState.video.onloadeddata = () => {

                resolve();

            };

        });

    }

    /* ==================================================
        Camera Stop
    ================================================== */

    async stop() {

        if (!this.stream)
            return;

        this.stream
            .getTracks()
            .forEach(track => {

                track.stop();

            });

        this.stream = null;

    }
        /* ==================================================
        カメラ一覧取得
    ================================================== */

    async enumerate() {

        try {

            const devices =
                await navigator.mediaDevices.enumerateDevices();

            this.devices =
                devices.filter(d => d.kind === "videoinput");

            console.log(
                "Camera Count :",
                this.devices.length
            );

            return this.devices;

        }

        catch (e) {

            console.error(e);

            return [];

        }

    }

    /* ==================================================
        背面カメラ取得
    ================================================== */

    getBackCamera() {

        if (this.devices.length === 0)
            return null;

        //------------------------------------------
        // labelから判定
        //------------------------------------------

        for (const device of this.devices) {

            const label =
                device.label.toLowerCase();

            if (
                label.includes("back") ||
                label.includes("rear") ||
                label.includes("environment")
            ) {

                return device;

            }

        }

        //------------------------------------------
        // 最後のカメラ
        //------------------------------------------

        return this.devices[
            this.devices.length - 1
        ];

    }

    /* ==================================================
        カメラ切替
    ================================================== */

    async switchCamera() {

        await this.enumerate();

        const device =
            this.getBackCamera();

        if (!device)
            return false;

        this.constraints.video = {

            deviceId: {

                exact: device.deviceId

            }

        };

        return await this.start();

    }

    /* ==================================================
        Zoom
    ================================================== */

    async setZoom(value) {

        if (!this.stream)
            return;

        const track =
            this.stream.getVideoTracks()[0];

        if (!track)
            return;

        const cap =
            track.getCapabilities();

        if (!cap.zoom)
            return;

        value = Math.max(
            cap.zoom.min,
            Math.min(
                cap.zoom.max,
                value
            )
        );

        try {

            await track.applyConstraints({

                advanced: [

                    {

                        zoom: value

                    }

                ]

            });

            console.log(
                "Zoom :",
                value
            );

        }

        catch (e) {

            console.error(e);

        }

    }

    /* ==================================================
        Focus
    ================================================== */

    async autoFocus() {

        if (!this.stream)
            return;

        const track =
            this.stream.getVideoTracks()[0];

        if (!track)
            return;

        try {

            await track.applyConstraints({

                advanced: [

                    {

                        focusMode: "continuous"

                    }

                ]

            });

        }

        catch (e) {

            console.warn(
                "Auto Focus Unsupported"
            );

        }

    }
        /* ==================================================
        タップフォーカス
    ================================================== */

    async focusAt(x, y) {

        if (!this.stream)
            return;

        const track = this.stream.getVideoTracks()[0];

        if (!track)
            return;

        try {

            await track.applyConstraints({

                advanced: [

                    {
                        focusMode: "continuous"
                    }

                ]

            });

            console.log(
                `Focus : (${x}, ${y})`
            );

        }

        catch (e) {

            console.warn(
                "Tap Focus Unsupported"
            );

        }

    }

    /* ==================================================
        FPS
    ================================================== */

    getFPS() {

        if (!AppState.video)
            return 0;

        if (AppState.video.getVideoPlaybackQuality) {

            const q =
                AppState.video.getVideoPlaybackQuality();

            return q.totalVideoFrames;

        }

        return 0;

    }

    /* ==================================================
        Camera Info
    ================================================== */

    getInfo() {

        return {

            width: AppState.cameraWidth,

            height: AppState.cameraHeight,

            deviceId: this.deviceId,

            cameraCount: this.devices.length,

            facingMode:
                this.constraints.video.facingMode

        };

    }

    /* ==================================================
        Destroy
    ================================================== */

    async destroy() {

        await this.stop();

        this.devices = [];

        this.deviceId = null;

    }

}

/* ======================================================
    Singleton
====================================================== */

export const camera =
    new CameraController();

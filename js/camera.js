// ======================================================
// CAD AR System
// Version 2.0
// camera.js
// Cameraクラス
// ======================================================

"use strict";

import { CAMERA } from "./config.js";
import { AppState } from "./state.js";
import { log, error } from "./utils.js";

class Camera {

    constructor() {

        this.stream = null;

    }

    async start() {

        if (!navigator.mediaDevices) {

            throw new Error("Camera APIに対応していません。");

        }

        try {

            this.stream = await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: {
                        ideal: CAMERA.FACING_MODE
                    },

                    width: {
                        ideal: CAMERA.WIDTH
                    },

                    height: {
                        ideal: CAMERA.HEIGHT
                    },

                    frameRate: {
                        ideal: CAMERA.FPS
                    }

                },

                audio: false

            });

            AppState.stream = this.stream;

            AppState.video.srcObject = this.stream;

            await new Promise(resolve => {

                AppState.video.onloadedmetadata = resolve;

            });

            await AppState.video.play();

            this.resize();

            AppState.cameraReady = true;

            log("Camera Started");

        }

        catch (e) {

            error(e);

            throw e;

        }

    }

    stop() {

        if (!this.stream) return;

        this.stream.getTracks().forEach(track => {

            track.stop();

        });

        this.stream = null;

        AppState.cameraReady = false;

        log("Camera Stopped");

    }

    resize() {

        const video = AppState.video;

        const canvas = AppState.canvas;

        canvas.width = video.videoWidth;

        canvas.height = video.videoHeight;

        AppState.width = video.videoWidth;

        AppState.height = video.videoHeight;

        log("Resolution");

        log(video.videoWidth + " x " + video.videoHeight);

    }

    getFrame() {

        return AppState.video;

    }

    async getDevices() {

        const devices = await navigator.mediaDevices.enumerateDevices();

        return devices.filter(device => device.kind === "videoinput");

    }

}

export const camera = new Camera();
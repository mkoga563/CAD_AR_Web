// ======================================================
// CAD AR System
// Version 3.0
// state.js
// ======================================================

"use strict";

/* ======================================================
    Application State
====================================================== */

export const AppState = {

    //--------------------------------------------------
    // App
    //--------------------------------------------------

    initialized: false,
    cvReady: false,
    partLoaded: false,

    app: null,

    //--------------------------------------------------
    // Camera
    //--------------------------------------------------

    video: null,
    stream: null,

    facingMode: "environment",

    cameraWidth: 0,
    cameraHeight: 0,

    //--------------------------------------------------
    // Canvas
    //--------------------------------------------------

    canvas: null,
    ctx: null,

    //--------------------------------------------------
    // CAD Data
    //--------------------------------------------------

    partNo: "",

    holes: [],
    outline: [],

    bounds: null,

    //--------------------------------------------------
    // AR
    //--------------------------------------------------

    transform: {

        x: 0,
        y: 0,
        scale: 1,
        rotation: 0

    },

    detected: false,

    //--------------------------------------------------
    // Debug
    //--------------------------------------------------

    debug: true,

    fps: 0,

    frameCount: 0,

    lastTime: performance.now(),

    //--------------------------------------------------
    // Status
    //--------------------------------------------------

    status: "",

    setStatus(text) {

        this.status = text;

    },

    //--------------------------------------------------
    // FPS
    //--------------------------------------------------

    updateFPS() {

        this.frameCount++;

        const now = performance.now();

        if (now - this.lastTime >= 1000) {

            this.fps = this.frameCount;

            this.frameCount = 0;

            this.lastTime = now;

        }

    },

    //--------------------------------------------------
    // Transform
    //--------------------------------------------------

    setTransform(transform) {

        this.transform = {

            x: transform.x,

            y: transform.y,

            scale: transform.scale,

            rotation: transform.rotation

        };

    },

    //--------------------------------------------------
    // Reset
    //--------------------------------------------------

    reset() {

        this.partLoaded = false;

        this.detected = false;

        this.partNo = "";

        this.holes = [];

        this.outline = [];

        this.bounds = null;

        this.transform = {

            x: 0,
            y: 0,
            scale: 1,
            rotation: 0

        };

    },

    //--------------------------------------------------
    // Debug表示
    //--------------------------------------------------

    print() {

        console.group("AppState");

        console.log("Initialized :", this.initialized);

        console.log("CV Ready :", this.cvReady);

        console.log("Part :", this.partNo);

        console.log("Loaded :", this.partLoaded);

        console.log("Detected :", this.detected);

        console.log("FPS :", this.fps);

        console.log("Transform :", this.transform);

        console.groupEnd();

    }

};
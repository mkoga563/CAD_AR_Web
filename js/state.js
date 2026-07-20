// ======================================================
// CAD AR System
// Version 4.0
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

    version: "4.0.1",

    debug: true,

    //--------------------------------------------------
    // DOM
    //--------------------------------------------------

    video: null,

    canvas: null,

    ctx: null,

    //--------------------------------------------------
    // Camera
    //--------------------------------------------------

    stream: null,
    
    app:null,
    cameraFacing: "environment",

    //--------------------------------------------------
    // Part
    //--------------------------------------------------

    partNo: "",

    holes: [],

    outline: [],

    width: 0,

    height: 0,

    //--------------------------------------------------
    // Marker Transform
    //--------------------------------------------------

    scale: 1.0,

    rotation: 0,

    offsetX: 0,

    offsetY: 0,

    //--------------------------------------------------
    // Touch
    //--------------------------------------------------

    dragging: false,

    rotating: false,

    pinching: false,

    lastX: 0,

    lastY: 0,

    lastDistance: 0,

    lastAngle: 0,

    //--------------------------------------------------
    // Display
    //--------------------------------------------------

    markerVisible: true,

    outlineVisible: true,

    holeVisible: true,

    opacity: 1.0,

    //--------------------------------------------------
    // Statistics
    //--------------------------------------------------

    holeCount: 0,

    fps: 0,

    lastFrameTime: 0,

    //--------------------------------------------------
    // QR
    //--------------------------------------------------

    qrCreated: false,

    //--------------------------------------------------
    // Flags
    //--------------------------------------------------

    jsonLoaded: false,

    cameraReady: false,

    drawing: false

};

/* ======================================================
    Reset Transform
====================================================== */

export function resetTransform(){

    AppState.scale = 1.0;

    AppState.rotation = 0;

    AppState.offsetX = 0;

    AppState.offsetY = 0;

}

/* ======================================================
    Reset Part
====================================================== */

export function clearPart(){

    AppState.partNo = "";

    AppState.holes = [];

    AppState.outline = [];

    AppState.width = 0;

    AppState.height = 0;

    AppState.holeCount = 0;

    AppState.jsonLoaded = false;

}

/* ======================================================
    Toggle
====================================================== */

export function toggleMarker(){

    AppState.markerVisible =
        !AppState.markerVisible;

}

export function toggleOutline(){

    AppState.outlineVisible =
        !AppState.outlineVisible;

}

/* ======================================================
    Set Part Data
====================================================== */

export function setPartData(data){

    AppState.partNo = data.partNo ?? "";

    AppState.holes = data.holes ?? [];

    AppState.outline = data.lines ?? [];

    AppState.holeCount = AppState.holes.length;

    // 幅・高さ計算
    let maxX = 0;
    let maxY = 0;

    for (const line of AppState.outline) {

        maxX = Math.max(maxX, line.start[0], line.end[0]);
        maxY = Math.max(maxY, line.start[1], line.end[1]);

    }

    AppState.width = maxX;
    AppState.height = maxY;

    AppState.jsonLoaded = true;

}

/* ======================================================
    Freeze
====================================================== */

Object.seal(AppState);
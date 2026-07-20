// ======================================================
// CAD AR System
// Version 4.0
// marker.js
// Part 1
// 描画エンジン
// ======================================================

"use strict";

import { AppState } from "./state.js";

/* ======================================================
    Marker
====================================================== */

export const marker = {

    //--------------------------------------------------
    // 表示
    //--------------------------------------------------

    visible: true,

    showOutline: true,

    showHoleNumber: false,

    opacity: 1.0,

    //--------------------------------------------------
    // 色
    //--------------------------------------------------

    color: {

        outline: "#00FFFF",

        M3: "#00FF00",

        M4: "#FFFF00",

        M5: "#FF4040",

        other: "#FFFFFF"

    },

    //--------------------------------------------------
    // サイズ
    //--------------------------------------------------

    holeRadius: 8,

    lineWidth: 2,

    font: "16px Arial",

    /* ==================================================
        Draw
    ================================================== */

    draw() {

        if (!AppState.ctx) return;

        if (!this.visible) return;

        if (!AppState.jsonLoaded) return;

        const ctx = AppState.ctx;

        ctx.save();

        //------------------------------------------
        // Transform
        //------------------------------------------

        ctx.translate(
            AppState.offsetX,
            AppState.offsetY
        );

        ctx.rotate(
            AppState.rotation * Math.PI / 180
        );

        ctx.scale(
            AppState.scale,
            AppState.scale
        );

        ctx.globalAlpha = this.opacity;

        //------------------------------------------
        // Outline
        //------------------------------------------

        if (this.showOutline) {

            this.drawOutline(ctx);

        }

        //------------------------------------------
        // Hole
        //------------------------------------------

        this.drawHoles(ctx);

        ctx.restore();

    },

    /* ==================================================
        Outline
    ================================================== */

    drawOutline(ctx) {

        const lines = AppState.outline;

        if (!lines || lines.length === 0) return;

        ctx.strokeStyle = "rgba(0,255,255,0.7)";
        ctx.lineWidth = 2;

        ctx.beginPath();

        for (const line of lines) {

            ctx.moveTo(
                line.start[0],
                line.start[1]
            );

            ctx.lineTo(
                line.end[0],
                line.end[1]
            );

        }

        ctx.stroke();

    
    },

    /* ==================================================
        Hole
    ================================================== */

    drawHoles(ctx) {

        for (

            const hole of AppState.holes

        ) {

            this.drawHole(

                ctx,

                hole

            );

        }

    },

    /* ==================================================
        Draw Hole
    ================================================== */

    drawHole(

        ctx,

        hole

    ) {

        //------------------------------------------
        // Color
        //------------------------------------------

        let color =

            this.color.other;

        switch (hole.type) {

            case "M3":

                color = this.color.M3;

                break;

            case "M4":

                color = this.color.M4;

                break;

            case "M5":

                color = this.color.M5;

                break;

        }

        //------------------------------------------
        // Circle
        //------------------------------------------

        ctx.beginPath();

        ctx.strokeStyle = color;

        ctx.lineWidth = 2;

        ctx.arc(

            hole.x,

            hole.y,

            this.holeRadius,

            0,

            Math.PI * 2

        );

        ctx.stroke();

        //------------------------------------------
        // Cross
        //------------------------------------------

        ctx.beginPath();

        ctx.moveTo(

            hole.x - 6,

            hole.y

        );

        ctx.lineTo(

            hole.x + 6,

            hole.y

        );

        ctx.moveTo(

            hole.x,

            hole.y - 6

        );

        ctx.lineTo(

            hole.x,

            hole.y + 6

        );

        ctx.stroke();

        //------------------------------------------
        // Hole Number
        //------------------------------------------

        if (

            this.showHoleNumber

        ) {

            ctx.fillStyle = color;

            ctx.font = this.font;

            ctx.fillText(

                hole.type,

                hole.x + 10,

                hole.y - 10

            );

        }

    },

    /* ==================================================
        Mouse Down
    ================================================== */

    mouseDown(event) {

        AppState.dragging = true;

        AppState.lastX = event.clientX;

        AppState.lastY = event.clientY;

    },

    /* ==================================================
        Mouse Move
    ================================================== */

    mouseMove(event) {

        if (!AppState.dragging) return;

        const dx =

            event.clientX - AppState.lastX;

        const dy =

            event.clientY - AppState.lastY;

        AppState.offsetX += dx;

        AppState.offsetY += dy;

        AppState.lastX = event.clientX;

        AppState.lastY = event.clientY;

    },

    /* ==================================================
        Mouse Up
    ================================================== */

    mouseUp() {

        AppState.dragging = false;

    },

    /* ==================================================
        Event Initialize
    ================================================== */

    initialize() {

        const canvas = AppState.canvas;

        if (!canvas) return;

        //------------------------------------------
        // Mouse
        //------------------------------------------

        canvas.addEventListener(

            "mousedown",

            (e) => {

                this.mouseDown(e);

            }

        );

        window.addEventListener(

            "mousemove",

            (e) => {

                this.mouseMove(e);

            }

        );

        window.addEventListener(

            "mouseup",

            () => {

                this.mouseUp();

            }

        );

        //------------------------------------------
        // Touch (1本指移動)
        //------------------------------------------

        canvas.addEventListener(

            "touchstart",

            (e) => {

                if (e.touches.length !== 1) return;

                e.preventDefault();

                const t = e.touches[0];

                AppState.dragging = true;

                AppState.lastX = t.clientX;

                AppState.lastY = t.clientY;

            },

            { passive: false }

        );

        canvas.addEventListener(

            "touchmove",

            (e) => {

                if (

                    !AppState.dragging ||

                    e.touches.length !== 1

                ) return;

                e.preventDefault();

                const t = e.touches[0];

                const dx = t.clientX - AppState.lastX;

                const dy = t.clientY - AppState.lastY;

                AppState.offsetX += dx;

                AppState.offsetY += dy;

                AppState.lastX = t.clientX;

                AppState.lastY = t.clientY;

            },

            { passive: false }

        );

        canvas.addEventListener(

            "touchend",

            () => {

                AppState.dragging = false;

            }

        );

        console.log(

            "Marker Event Ready"

        );

    },
    /* ==================================================
    Touch Distance
================================================== */

    touchDistance(t1, t2) {

        const dx = t2.clientX - t1.clientX;
        const dy = t2.clientY - t1.clientY;

        return Math.sqrt(dx * dx + dy * dy);

    },

    /* ==================================================
        Touch Angle
    ================================================== */

    touchAngle(t1, t2) {

        return Math.atan2(

            t2.clientY - t1.clientY,
            t2.clientX - t1.clientX

        );

    },

    /* ==================================================
        Pinch Start
    ================================================== */

    pinchStart(e) {

        if (e.touches.length !== 2) return;

        e.preventDefault();

        AppState.pinching = true;

        AppState.lastDistance =

            this.touchDistance(

                e.touches[0],

                e.touches[1]

            );

        AppState.lastAngle =

            this.touchAngle(

                e.touches[0],

                e.touches[1]

            );

    },

    /* ==================================================
        Pinch Move
    ================================================== */

    pinchMove(e) {

        if (

            !AppState.pinching ||

            e.touches.length !== 2

        ) return;

        e.preventDefault();

        //------------------------------------------
        // Scale
        //------------------------------------------

        const distance =

            this.touchDistance(

                e.touches[0],

                e.touches[1]

            );

        const scale =

            distance /

            AppState.lastDistance;

        AppState.scale *= scale;

        //------------------------------------------
        // Rotation
        //------------------------------------------

        const angle =

            this.touchAngle(

                e.touches[0],

                e.touches[1]

            );

        const diff =

            angle -

            AppState.lastAngle;

        AppState.rotation +=

            diff * 180 / Math.PI;

        //------------------------------------------

        AppState.lastDistance = distance;

        AppState.lastAngle = angle;

        //------------------------------------------
        // 表示更新
        //------------------------------------------

        const scaleLabel =

            document.getElementById(

                "scaleValue"

            );

        if (scaleLabel) {

            scaleLabel.textContent =

                (AppState.scale * 100)

                    .toFixed(0)

                + "%";

        }

        const rotationLabel =

            document.getElementById(

                "rotationValue"

            );

        if (rotationLabel) {

            rotationLabel.textContent =

                AppState.rotation

                    .toFixed(1)

                + "°";

        }

    },

    /* ==================================================
        Pinch End
    ================================================== */

    pinchEnd() {

        AppState.pinching = false;

    },
    /* ==================================================
    Reset
================================================== */

    reset() {

        AppState.scale = 1.0;

        AppState.rotation = 0;

        AppState.offsetX = 0;

        AppState.offsetY = 0;

        this.updateInfo();

    },

    /* ==================================================
        Marker Visible
    ================================================== */

    setVisible(flag) {

        this.visible = flag;

    },

    toggleMarker() {

        this.visible = !this.visible;

    },

    /* ==================================================
        Outline
    ================================================== */

    toggleOutline() {

        this.showOutline =

            !this.showOutline;

    },

    /* ==================================================
        Hole Number
    ================================================== */

    toggleHoleNumber() {

        this.showHoleNumber =

            !this.showHoleNumber;

    },

    /* ==================================================
        Opacity
    ================================================== */

    setOpacity(value) {

        value = Math.max(0.1, value);

        value = Math.min(1.0, value);

        this.opacity = value;

    },

    /* ==================================================
        Scale
    ================================================== */

    setScale(scale) {

        AppState.scale = scale;

        this.updateInfo();

    },

    /* ==================================================
        Rotation
    ================================================== */

    setRotation(rotation) {

        AppState.rotation = rotation;

        this.updateInfo();

    },

    /* ==================================================
        Position
    ================================================== */

    setPosition(x, y) {

        AppState.offsetX = x;

        AppState.offsetY = y;

    },

    /* ==================================================
        Information
    ================================================== */

    updateInfo() {

        const scale =

            document.getElementById(

                "scaleValue"

            );

        if (scale) {

            scale.textContent =

                (AppState.scale * 100).toFixed(0)

                + "%";

        }

        const rotation =

            document.getElementById(

                "rotationValue"

            );

        if (rotation) {

            rotation.textContent =

                AppState.rotation.toFixed(1)

                + "°";

        }

        const holes =

            document.getElementById(

                "holeCount"

            );

        if (holes) {

            holes.textContent =

                AppState.holes.length;

        }

    },

    /* ==================================================
        Animation
    ================================================== */

    render() {

        if (

            !AppState.ctx ||

            !AppState.canvas

        ) return;

        AppState.ctx.clearRect(

            0,

            0,

            AppState.canvas.width,

            AppState.canvas.height

        );

        this.draw();

    }

};

/* ======================================================
    Animation Loop
====================================================== */

function animationLoop() {

    marker.render();

    requestAnimationFrame(

        animationLoop

    );

}

requestAnimationFrame(

    animationLoop

);

/* ======================================================
    Toolbar
====================================================== */

window.addEventListener(

    "DOMContentLoaded",

    () => {

        const reset =

            document.getElementById(

                "resetButton"

            );

        if (reset) {

            reset.onclick = () => {

                marker.reset();

            };

        }

        const outline =

            document.getElementById(

                "outlineButton"

            );

        if (outline) {

            outline.onclick = () => {

                marker.toggleOutline();

            };

        }

        const markerButton =

            document.getElementById(

                "markerButton"

            );

        if (markerButton) {

            markerButton.onclick = () => {

                marker.toggleMarker();

            };

        }

    }

);
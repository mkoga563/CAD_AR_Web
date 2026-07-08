// ======================================================
// CAD AR System
// Version 3.1
// opencv-ar.js
// ======================================================

"use strict";

import { APP } from "./config.js";
import { AppState } from "./state.js";

/* ======================================================
    OpenCV Recognizer
====================================================== */

class OpenCVRecognizer {

    constructor() {

        this.initialized = false;

        //------------------------------------------
        // OpenCV
        //------------------------------------------

        this.cap = null;

        this.src = null;
        this.gray = null;
        this.blur = null;
        this.edge = null;
        this.lines = null;

        //------------------------------------------
        // Detection
        //------------------------------------------

        this.detected = false;

        this.leftLine = null;
        this.topLine = null;

        this.reference = {

            x: 0,
            y: 0

        };

        //------------------------------------------
        // CAD
        //------------------------------------------

        this.cadWidth = 0;
        this.cadHeight = 0;

        //------------------------------------------
        // Transform
        //------------------------------------------

        this.transform = {

            x: 0,
            y: 0,
            scale: 1,
            rotation: 0

        };

        this.prevTransform = {

            x: 0,
            y: 0,
            scale: 1,
            rotation: 0

        };

    }

    /* ==================================================
        Initialize
    ================================================== */

    initialize() {

        if (this.initialized)
            return;

        const width = AppState.video.videoWidth;
        const height = AppState.video.videoHeight;

        //------------------------------------------
        // Video Capture
        //------------------------------------------

        this.cap = new cv.VideoCapture(
            AppState.video
        );

        //------------------------------------------
        // Mats
        //------------------------------------------

        this.src = new cv.Mat(
            height,
            width,
            cv.CV_8UC4
        );

        this.gray = new cv.Mat(
            height,
            width,
            cv.CV_8UC1
        );

        this.blur = new cv.Mat(
            height,
            width,
            cv.CV_8UC1
        );

        this.edge = new cv.Mat(
            height,
            width,
            cv.CV_8UC1
        );

        this.lines = new cv.Mat();

        this.initialized = true;

        console.log("OpenCV Initialize OK");

    }

    /* ==================================================
        CAD Size
    ================================================== */

    setCADData(outline) {

        if (!outline)
            return;

        if (outline.length < 2)
            return;

        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;

        let maxX = Number.MIN_VALUE;
        let maxY = Number.MIN_VALUE;

        for (const p of outline) {

            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;

            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;

        }

        this.cadWidth = maxX - minX;
        this.cadHeight = maxY - minY;

    }

    /* ==================================================
        Detect
    ================================================== */

    detect() {

    try {

        if (!this.initialized)
            return false;

        if (!this.cap)
            return false;

        this.detected = false;

        //------------------------------------------
        // カメラ画像取得
        //------------------------------------------

        this.cap.read(this.src);

        if (this.src.empty()) {

            return false;

        }

        //------------------------------------------
        // Gray
        //------------------------------------------

        cv.cvtColor(
            this.src,
            this.gray,
            cv.COLOR_RGBA2GRAY
        );

        //------------------------------------------
        // Gaussian Blur
        //------------------------------------------

        cv.GaussianBlur(
            this.gray,
            this.blur,
            new cv.Size(5, 5),
            0,
            0,
            cv.BORDER_DEFAULT
        );

        //------------------------------------------
        // Canny
        //------------------------------------------

        cv.Canny(
            this.blur,
            this.edge,
            APP.OPENCV.CANNY1,
            APP.OPENCV.CANNY2,
            APP.OPENCV.APERTURE_SIZE
        );

        //------------------------------------------
        // HoughLinesP
        //------------------------------------------

        cv.HoughLinesP(
            this.edge,
            this.lines,
            1,
            Math.PI / 180,
            APP.OPENCV.HOUGH_THRESHOLD,
            APP.OPENCV.MIN_LINE_LENGTH,
            APP.OPENCV.MAX_LINE_GAP
        );

        //------------------------------------------
        // ラインが見つからない
        //------------------------------------------

        if (this.lines.rows === 0) {

            this.detected = false;

            return false;

        }

        //------------------------------------------
        // 基準線検索
        //------------------------------------------

        this.findReferenceLines();

        return this.detected;

    }

    catch (e) {

        console.error("OpenCV Detect Error:", e);

        this.detected = false;

        return false;

    }

}

    /* ==================================================
        基準線検索
    ================================================== */

    findReferenceLines() {

        this.leftLine = null;
        this.topLine = null;

        let leftX = Number.MAX_VALUE;
        let topY = Number.MAX_VALUE;

        for (let i = 0; i < this.lines.rows; i++) {

            const p = this.lines.data32S;

            const x1 = p[i * 4 + 0];
            const y1 = p[i * 4 + 1];
            const x2 = p[i * 4 + 2];
            const y2 = p[i * 4 + 3];

            const dx = x2 - x1;
            const dy = y2 - y1;

            const angle =
                Math.atan2(dy, dx) * 180 / Math.PI;

            //------------------------------------------
            // 縦線
            //------------------------------------------

            if (Math.abs(Math.abs(angle) - 90) < 10) {

                const x = (x1 + x2) / 2;

                if (x < leftX) {

                    leftX = x;

                    this.leftLine = {

                        x1,
                        y1,
                        x2,
                        y2,
                        angle

                    };

                }

            }

            //------------------------------------------
            // 横線
            //------------------------------------------

            if (Math.abs(angle) < 10) {

                const y = (y1 + y2) / 2;

                if (y < topY) {

                    topY = y;

                    this.topLine = {

                        x1,
                        y1,
                        x2,
                        y2,
                        angle

                    };

                }

            }

        }
                //------------------------------------------
        // 基準線が見つかった
        //------------------------------------------

        if (this.leftLine && this.topLine) {

            //--------------------------------------
            // 基準座標
            //--------------------------------------

            this.reference.x = leftX;
            this.reference.y = topY;

            //--------------------------------------
            // Transform
            //--------------------------------------

            this.transform.x = leftX;
            this.transform.y = topY;

            this.transform.rotation =
                this.leftLine.angle - 90;

            //--------------------------------------
            // スケール
            //--------------------------------------

            this.estimateScaleFromContour();

            //--------------------------------------
            // 平滑化
            //--------------------------------------

            this.smoothTransform();

            //--------------------------------------
            // AppStateへ反映
            //--------------------------------------

            AppState.detected = true;

            Object.assign(
              AppState.transform,
              this.prevTransform
            );

            this.detected = true;

        }

    }

    /* ==================================================
        スケール計算
    ================================================== */

    calculateScale() {

        if (!this.leftLine)
            return;

        if (!this.topLine)
            return;

        if (this.cadWidth <= 0)
            return;

        //------------------------------------------
        // 仮スケール
        //------------------------------------------

        const imageWidth =
            AppState.canvas.width;

        this.transform.scale =
            imageWidth / this.cadWidth;

    }

    /* ==================================================
        Transform平滑化
    ================================================== */

    smoothTransform() {

        const alpha =
            APP.AR.SMOOTHING;

        this.prevTransform.x +=
            (this.transform.x -
             this.prevTransform.x) * alpha;

        this.prevTransform.y +=
            (this.transform.y -
             this.prevTransform.y) * alpha;

        this.prevTransform.scale +=
            (this.transform.scale -
             this.prevTransform.scale) * alpha;

        this.prevTransform.rotation +=
            (this.transform.rotation -
             this.prevTransform.rotation) * alpha;

    }

    /* ==================================================
        認識結果
    ================================================== */

    isDetected() {

        return this.detected;

    }

    /* ==================================================
        Transform取得
    ================================================== */

    getTransform() {

        return this.prevTransform;

    }
        /* ==================================================
        輪郭解析
    ================================================== */

    estimateScaleFromContour() {

        if (!this.edge)
            return;

        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();

        try {

            cv.findContours(
                this.edge,
                contours,
                hierarchy,
                cv.RETR_EXTERNAL,
                cv.CHAIN_APPROX_SIMPLE
            );

            if (contours.size() === 0)
                return;

            //------------------------------------------
            // 最大輪郭を探す
            //------------------------------------------

            let largest = null;
            let largestArea = 0;

            for (let i = 0; i < contours.size(); i++) {

                const c = contours.get(i);

                const area = cv.contourArea(c);

                if (area > largestArea) {

                    largestArea = area;
                    largest = c;

                }

            }

            if (!largest)
                return;

            //------------------------------------------
            // 回転矩形
            //------------------------------------------

            const rect = cv.minAreaRect(largest);

            const width =
                Math.max(rect.size.width, rect.size.height);

            if (this.cadWidth > 0) {

                this.transform.scale =
                    width / this.cadWidth;

            }

        }
        finally {

            hierarchy.delete();

            for (let i = 0; i < contours.size(); i++) {

                contours.get(i).delete();


                

            }

            contours.delete();

        }

    }

    /* ==================================================
        デバッグ描画
    ================================================== */

    drawDebug(ctx) {

        if (!ctx)
            return;

        //------------------------------------------
        // 左基準線
        //------------------------------------------

        if (this.leftLine) {

            ctx.strokeStyle = "red";
            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.moveTo(
                this.leftLine.x1,
                this.leftLine.y1
            );

            ctx.lineTo(
                this.leftLine.x2,
                this.leftLine.y2
            );

            ctx.stroke();

        }

        //------------------------------------------
        // 上基準線
        //------------------------------------------

        if (this.topLine) {

            ctx.strokeStyle = "lime";
            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.moveTo(
                this.topLine.x1,
                this.topLine.y1
            );

            ctx.lineTo(
                this.topLine.x2,
                this.topLine.y2
            );

            ctx.stroke();

        }

        //------------------------------------------
        // 基準点
        //------------------------------------------

        if (this.detected) {

            ctx.fillStyle = "yellow";

            ctx.beginPath();

            ctx.arc(
                this.prevTransform.x,
                this.prevTransform.y,
                8,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

        //------------------------------------------
        // 情報表示
        //------------------------------------------

        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Arial";

        ctx.fillText(
            "Detected : " + this.detected,
            20,
            30
        );

        ctx.fillText(
            "Scale : " +
            this.prevTransform.scale.toFixed(3),
            20,
            55
        );

        ctx.fillText(
            "Rotation : " +
            this.prevTransform.rotation.toFixed(1),
            20,
            80
        );

    }
        /* ==================================================
        Reset
    ================================================== */

    reset() {

        this.detected = false;

        this.leftLine = null;
        this.topLine = null;

        this.transform = {

            x: 0,
            y: 0,
            scale: 1,
            rotation: 0

        };

    }

    /* ==================================================
        Release Memory
    ================================================== */

    release() {

        try {

            if (this.src) {

                this.src.delete();
                this.src = null;

            }

            if (this.gray) {

                this.gray.delete();
                this.gray = null;

            }

            if (this.blur) {

                this.blur.delete();
                this.blur = null;

            }

            if (this.edge) {

                this.edge.delete();
                this.edge = null;

            }

            if (this.lines) {

                this.lines.delete();
                this.lines = null;

            }

        }

        catch (e) {

            console.warn(
                "OpenCV Release Error",
                e
            );

        }

        if(this.cap){

         this.cap = null;

        }

        this.initialized = false;

    }

    /* ==================================================
        FPS
    ================================================== */

    getFPS() {

        return AppState.fps || 0;

    }

    /* ==================================================
        Destroy
    ================================================== */

    destroy() {

        this.release();

        this.reset();

        this.initialized=false;

    }

}

/* ======================================================
    Singleton
====================================================== */

export const recognizer =
    new OpenCVRecognizer();
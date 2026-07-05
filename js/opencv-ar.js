// ======================================================
// CAD AR System
// OpenCV AR Engine（完成版）
// ======================================================

"use strict";

import { AppState } from "./state.js";
import { log } from "./utils.js";

class OpenCVAR {

    constructor() {

        this.orb = null;

        this.matcher = null;

        this.lastProcessTime = 0;

    }

    /* ==================================================
        初期化
    ================================================== */

    initialize() {

        this.orb = new cv.ORB();

        this.matcher = new cv.BFMatcher(cv.NORM_HAMMING, true);

        log("OpenCV AR Ready");

    }

    /* ==================================================
        フレーム処理（リアルタイム）
    ================================================== */

    process(frameMat, referenceMat) {

        const now = performance.now();

        // 軽量化（10fps制限）
        if (now - this.lastProcessTime < 100) return;

        this.lastProcessTime = now;

        if (!frameMat || !referenceMat) return;

        const kp1 = new cv.KeyPointVector();

        const kp2 = new cv.KeyPointVector();

        const des1 = new cv.Mat();

        const des2 = new cv.Mat();

        // 特徴点抽出
        this.orb.detectAndCompute(frameMat, new cv.Mat(), kp1, des1);

        this.orb.detectAndCompute(referenceMat, new cv.Mat(), kp2, des2);

        if (des1.empty() || des2.empty()) return;

        const matches = new cv.DMatchVector();

        this.matcher.match(des1, des2, matches);

        let good = [];

        for (let i = 0; i < matches.size(); i++) {

            good.push(matches.get(i));

        }

        good.sort((a, b) => a.distance - b.distance);

        good = good.slice(0, 30);

        if (good.length < 8) return;

        const srcPts = [];

        const dstPts = [];

        for (const m of good) {

            const p1 = kp1.get(m.queryIdx).pt;

            const p2 = kp2.get(m.trainIdx).pt;

            srcPts.push(p1.x, p1.y);

            dstPts.push(p2.x, p2.y);

        }

        const srcMat = cv.matFromArray(good.length, 1, cv.CV_32FC2, srcPts);

        const dstMat = cv.matFromArray(good.length, 1, cv.CV_32FC2, dstPts);

        const mask = new cv.Mat();

        const H = cv.findHomography(srcMat, dstMat, cv.RANSAC, 5, mask);

        // ★ここが重要（全体へ反映）
        AppState.homography = H;

        // cleanup
        kp1.delete();

        kp2.delete();

        des1.delete();

        des2.delete();

        matches.delete();

        srcMat.delete();

        dstMat.delete();

        mask.delete();

    }

}

export const recognizer = new OpenCVAR();
// ======================================================
// CAD AR System
// OpenCV AR Engine（デバッグ版）
// ======================================================

"use strict";

import { AppState } from "./state.js";
import { log } from "./utils.js";

class OpenCVAR {

    constructor() {

        this.orb = null;
        this.matcher = null;
        this.lastProcessTime = 0;
        this.debugCounter = 0;

    }

    /* ==================================================
        初期化
    ================================================== */

    initialize() {

        this.orb = new cv.ORB(1000);

        this.matcher = new cv.BFMatcher(cv.NORM_HAMMING, false);

        log("OpenCV AR Ready");

    }

    /* ==================================================
        フレーム処理
    ================================================== */

    process(frameMat, referenceMat) {

        const now = performance.now();

        if (now - this.lastProcessTime < 100)
            return;

        this.lastProcessTime = now;

        if (!frameMat || !referenceMat)
            return;

        let grayScene = new cv.Mat();
        let grayRef = new cv.Mat();

        let kp1 = new cv.KeyPointVector();
        let kp2 = new cv.KeyPointVector();

        let des1 = new cv.Mat();
        let des2 = new cv.Mat();

        try {

            //------------------------------------------------
            // グレースケール化
            //------------------------------------------------

            cv.cvtColor(frameMat, grayScene, cv.COLOR_RGBA2GRAY);
            cv.cvtColor(referenceMat, grayRef, cv.COLOR_RGBA2GRAY);

            //------------------------------------------------
            // ORB
            //------------------------------------------------

            this.orb.detectAndCompute(
                grayScene,
                new cv.Mat(),
                kp1,
                des1
            );

            this.orb.detectAndCompute(
                grayRef,
                new cv.Mat(),
                kp2,
                des2
            );

            //------------------------------------------------
            // デバッグ
            //------------------------------------------------

            if (++this.debugCounter % 10 === 0) {

                log(
                    "KP Scene : " + kp1.size()
                );

                log(
                    "KP Ref   : " + kp2.size()
                );

            }

            if (des1.empty() || des2.empty()) {

                log("Descriptor Empty");

                AppState.homography = null;

                return;

            }

            //------------------------------------------------
            // KNN Match
            //------------------------------------------------

            let matches = new cv.DMatchVectorVector();

            this.matcher.knnMatch(
                des1,
                des2,
                matches,
                2
            );

            let good = [];

            for (let i = 0; i < matches.size(); i++) {

                const m = matches.get(i);

                if (m.size() < 2)
                    continue;

                const m1 = m.get(0);
                const m2 = m.get(1);

                if (m1.distance < 0.75 * m2.distance) {

                    good.push(m1);

                }

            }

            matches.delete();

            if (this.debugCounter % 10 === 0) {

                log("Good Match : " + good.length);

            }

            if (good.length < 8) {

                log("Not enough matches");

                AppState.homography = null;

                return;

            }

            //------------------------------------------------
            // 座標
            //------------------------------------------------

            let srcPts = [];
            let dstPts = [];

            for (const m of good) {

                const p1 = kp1.get(m.queryIdx).pt;
                const p2 = kp2.get(m.trainIdx).pt;

                srcPts.push(p1.x, p1.y);
                dstPts.push(p2.x, p2.y);

            }

            let srcMat =
                cv.matFromArray(
                    good.length,
                    1,
                    cv.CV_32FC2,
                    srcPts
                );

            let dstMat =
                cv.matFromArray(
                    good.length,
                    1,
                    cv.CV_32FC2,
                    dstPts
                );

            let mask = new cv.Mat();

            //------------------------------------------------
            // Homography
            //------------------------------------------------

            let H = cv.findHomography(
                srcMat,
                dstMat,
                cv.RANSAC,
                5,
                mask
            );

            if (!H || H.empty()) {

                log("Homography NG");

                AppState.homography = null;

            }
            else {

                AppState.homography = H;

                log("Homography OK");

            }

            srcMat.delete();
            dstMat.delete();
            mask.delete();

        }
        catch (e) {

            log("AR ERROR : " + e);

        }
        finally {

            grayScene.delete();
            grayRef.delete();

            kp1.delete();
            kp2.delete();

            des1.delete();
            des2.delete();

        }

    }

}

export const recognizer = new OpenCVAR();
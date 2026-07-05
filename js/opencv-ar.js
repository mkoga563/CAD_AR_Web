/// ======================================================
// CAD AR System
// OpenCV AR Engine（安定版）
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

        // ★ crossCheck無しに変更（安定性UP）
        this.matcher = new cv.BFMatcher(cv.NORM_HAMMING, false);

        log("OpenCV AR Ready");

    }

    /* ==================================================
        フレーム処理
    ================================================== */

    process(frameMat, referenceMat) {

        const now = performance.now();

        // ★ 10fps制限（維持）
        if (now - this.lastProcessTime < 100) return;

        this.lastProcessTime = now;

        if (!frameMat || !referenceMat) return;

        let kp1 = new cv.KeyPointVector();
        let kp2 = new cv.KeyPointVector();
        let des1 = new cv.Mat();
        let des2 = new cv.Mat();

        try {

            // ==========================
            // 特徴点抽出
            // ==========================
            this.orb.detectAndCompute(frameMat, new cv.Mat(), kp1, des1);
            this.orb.detectAndCompute(referenceMat, new cv.Mat(), kp2, des2);

            if (des1.empty() || des2.empty()) return;

            // ==========================
            // マッチング
            // ==========================
            let matches = new cv.DMatchVectorVector();

            this.matcher.knnMatch(des1, des2, matches, 2);

            let good = [];

            // Lowe ratio test（重要）
            for (let i = 0; i < matches.size(); i++) {

                const m = matches.get(i);

                if (m.size() < 2) continue;

                const m1 = m.get(0);
                const m2 = m.get(1);

                if (m1.distance < 0.75 * m2.distance) {
                    good.push(m1);
                }

            }

            matches.delete();

            if (good.length < 8) return;

            // ==========================
            // 座標生成
            // ==========================
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

            // ==========================
            // ホモグラフィ
            // ==========================
            const H = cv.findHomography(
                srcMat,
                dstMat,
                cv.RANSAC,
                5,
                mask
            );

            // ★ここが重要（安全代入）
            if (!H || H.empty()) {

                log("⚠ Homography failed");

                AppState.homography = null;

            } else {

                AppState.homography = H;

                log("H OK");

            }

            // ==========================
            // cleanup
            // ==========================
            srcMat.delete();
            dstMat.delete();
            mask.delete();

        }
        catch (e) {

            log("❌ AR ERROR: " + e.message);

        }
        finally {

            kp1.delete();
            kp2.delete();
            des1.delete();
            des2.delete();

        }
    }

}

export const recognizer = new OpenCVAR();
// ======================================================
// CAD AR System
// Version 3.0
// dxf.js
// ======================================================

"use strict";

/* ======================================================
    DXF Loader
====================================================== */

class DXFLoader {

    constructor() {

        this.reference = null;

        this.clear();

    }

    /* ==================================================
        初期化
    ================================================== */

    clear() {


        this.data = null;

        this.partNo = "";

        this.holes = [];

        this.outline = [];

        this.reference = null;

        this.bounds = {

            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0,
            width: 0,
            height: 0

        };

    }

    /* ==================================================
        JSON読込
    ================================================== */

    async load(partNo) {

        this.clear();

        this.partNo = partNo;

        try {

            const url =
                `parts/${partNo}/${partNo}.json`;

            const response = await fetch(url);

            if (!response.ok) {

                throw new Error(
                    "JSON File Not Found : " + url
                );

            }

            this.data = await response.json();

            //------------------------------------------
            // 穴
            //------------------------------------------

            if (Array.isArray(this.data.holes)) {

                this.holes = this.data.holes;

            }

            //------------------------------------------
            // 輪郭
            //------------------------------------------

            if (Array.isArray(this.data.outline)) {

                this.outline = this.data.outline;

            }

            //------------------------------------------
            // 外形計算
            //------------------------------------------

            this.calculateBounds();

            this.normalizeCoordinates();

            this.parse();

            this.debug();

            console.log(
                "DXF Loaded :",
                partNo
            );

            return true;

        }

        catch (e) {

            console.error(e);

            return false;

        }

    }
    /* ==================================================
    外形計算
================================================== */

    calculateBounds() {

        if (!this.outline.length)
            return;

        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;

        let maxX = Number.MIN_VALUE;
        let maxY = Number.MIN_VALUE;

        for (const p of this.outline) {

            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;

            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;

        }

        this.bounds.minX = minX;
        this.bounds.minY = minY;

        this.bounds.maxX = maxX;
        this.bounds.maxY = maxY;

        this.bounds.width = maxX - minX;
        this.bounds.height = maxY - minY;

    }

    /* ==================================================
        穴取得
    ================================================== */

    getHoles() {

        return this.holes;

    }

    /* ==================================================
        輪郭取得
    ================================================== */

    getOutline() {

        return this.outline;

    }

    /* ==================================================
        外形取得
    ================================================== */

    getBounds() {

        return this.bounds;

    }

    /* ==================================================
        部品番号
    ================================================== */

    getPartNo() {

        return this.partNo;

    }

    /* ==================================================
        JSON全体
    ================================================== */

    getData() {

        return this.data;

    }

    /* ==================================================
        読込み済み判定
    ================================================== */

    isLoaded() {

        return this.data !== null;

    }

    /* ==================================================
        穴数
    ================================================== */

    holeCount() {

        return this.holes.length;

    }

    /* ==================================================
        外形点数
    ================================================== */

    outlineCount() {

        return this.outline.length;

    }
    getBounds() {

        return this.bounds;

    }

    /* ==================================================
        座標正規化
    ================================================== */

    normalizeCoordinates() {

        const ox = this.bounds.minX;
        const oy = this.bounds.minY;

        //------------------------------------------
        // 穴
        //------------------------------------------

        this.holes.forEach(h => {

            h.x -= ox;
            h.y -= oy;

        });

        //------------------------------------------
        // 輪郭
        //------------------------------------------

        this.outline.forEach(p => {

            p.x -= ox;
            p.y -= oy;

        });

        //------------------------------------------
        // Bounds更新
        //------------------------------------------

        this.bounds.maxX -= ox;
        this.bounds.maxY -= oy;

        this.bounds.minX = 0;
        this.bounds.minY = 0;

    }


    /* ==================================================
    JSON解析
================================================== */

    parse() {

        if (!this.data)
            return;

        //------------------------------------------
        // 新Version
        //------------------------------------------

        if (this.data.reference) {

            this.reference = this.data.reference;

        }
        else {

            this.reference = {

                origin: {
                    x: this.bounds.minX,
                    y: this.bounds.minY
                },

                rotation: 0

            };

        }

        //------------------------------------------
        // 穴分類
        //------------------------------------------

        this.holes.forEach(hole => {

            const d = hole.diameter || hole.d || 0;

            if (Math.abs(d - 2.6) < 0.2)
                hole.type = "M3";

            else if (Math.abs(d - 3.4) < 0.2)
                hole.type = "M4";

            else if (Math.abs(d - 4.3) < 0.2)
                hole.type = "M5";

            else
                hole.type = "OTHER";

        });

    }

    /* ==================================================
        基準点取得
    ================================================== */

    getReference() {

        return this.reference;

    }

    /* ==================================================
        JSON Version
    ================================================== */

    getVersion() {

        return this.data.version || 1;

    }

    /* ==================================================
        Debug
    ================================================== */

    debug() {

        console.group("DXF Loader");

        console.log("Part :", this.partNo);

        console.log("Version :", this.getVersion());

        console.log("Hole :", this.holes.length);

        console.log("Outline :", this.outline.length);

        console.log("Bounds :", this.bounds);

        console.log("Reference :", this.reference);

        console.groupEnd();

    }

    /* ==================================================
        JSON Export
    ================================================== */

    exportJSON() {

        return {
            
            loaded: this.isLoaded(),
            
            version: this.getVersion(),

            partNo: this.partNo,

            holes: this.holes,

            outline: this.outline,

            bounds: this.bounds,

            reference: this.reference

        };

    }

}

/* ======================================================
    Singleton
====================================================== */

export const dxfLoader = new DXFLoader();
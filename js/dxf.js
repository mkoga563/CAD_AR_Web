// ======================================================
// CAD AR System
// Version 2.0
// dxf.js
// 型番 → JSON → 穴データ管理
// ======================================================

"use strict";

import { AppState } from "./state.js";
import { log, error } from "./utils.js";

/* ======================================================
    DXF Loader（実体はJSON管理）
====================================================== */

class DXFLoader {

    constructor() {

        this.basePath = "parts/";

    }

    /* ==================================================
        型番ロード
    ================================================== */

    async load(partNumber) {

        try {

            if (!partNumber) {

                throw new Error("partNumber is empty");

            }

            const path = `${this.basePath}${partNumber}/${partNumber}.json`;

            log("Loading Part Data");

            log(path);

            const response = await fetch(path);

            if (!response.ok) {

                throw new Error("JSON load failed");

            }

            const data = await response.json();

            this.validate(data);

            AppState.partNumber = data.partNumber;

            AppState.holeList = data.holes || [];

            log("DXF/JSON Loaded");

            log(`Holes: ${AppState.holeList.length}`);

            return data;

        }

        catch (e) {

            error(e);

            throw e;

        }

    }

    /* ==================================================
        データ検証
    ================================================== */

    validate(data) {

        if (!data) {

            throw new Error("No data");

        }

        if (!Array.isArray(data.holes)) {

            throw new Error("holes is not array");

        }

        for (const h of data.holes) {

            if (typeof h.x !== "number" || typeof h.y !== "number") {

                throw new Error("Invalid hole data");

            }

        }

    }

}

/* ======================================================
    Singleton
====================================================== */

export const dxfLoader = new DXFLoader();
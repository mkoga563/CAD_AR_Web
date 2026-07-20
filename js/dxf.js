// ======================================================
// CAD AR System
// Version 4.0
// dxf.js
// JSON Loader
// ======================================================

"use strict";

import {

    AppState,
    setPartData

} from "./state.js";

/* ======================================================
    Loader
====================================================== */

export const dxfLoader = {

    /* ==================================================
        Load JSON
    ================================================== */

    async load(partNo) {

        try {

            if (!partNo) {

                throw new Error("部品番号がありません");

            }

            const file =

                `./parts/${partNo}.json`;

            console.log(

                "Load :", file

            );

            const response =

                await fetch(file);

            if (!response.ok) {

                throw new Error(

                    "JSONが見つかりません"

                );

            }

            const data =

                await response.json();

            //------------------------------------------
            // Stateへ保存
            //------------------------------------------

            setPartData(data);

            console.log(

                "Part :", data.partNo

            );

            console.log(

                "Hole :", data.holes.length

            );

            console.log(

                "Lines :", data.lines.length

            );

            return true;

        }

        catch(e){

            console.error(e);

            alert(e.message);

            return false;

        }

    },

    /* ==================================================
        Hole
    ================================================== */

    getHoles(){

        return AppState.holes;

    },

    /* ==================================================
        Outline
    ================================================== */

    getOutline(){

        return AppState.outline;

    },

    /* ==================================================
        Size
    ================================================== */

    getWidth(){

        return AppState.width;

    },

    getHeight(){

        return AppState.height;

    },

    /* ==================================================
        Count
    ================================================== */

    getHoleCount(){

        return AppState.holeCount;

    },

    /* ==================================================
        Part
    ================================================== */

    getPartNo(){

        return AppState.partNo;

    },

    /* ==================================================
        Loaded
    ================================================== */

    isLoaded(){

        return AppState.jsonLoaded;

    },

    /* ==================================================
        Clear
    ================================================== */

    clear(){

        AppState.partNo="";

        AppState.holes=[];

        AppState.outline=[];

        AppState.width=0;

        AppState.height=0;

        AppState.holeCount=0;

        AppState.jsonLoaded=false;

    }

};
// ============================================
// CAD AR System
// qr.js
// QRコード生成モジュール
// ============================================

"use strict";

/**
 * URLからQRコードを生成
 *
 * @param {string} elementId 表示先DIVのID
 * @param {string} url QRコードにするURL
 */
export function createQRCode(elementId = "qrcode", url = window.location.href) {

    const qrElement = document.getElementById(elementId);

    if (!qrElement) {

        console.error("QRコード表示領域が見つかりません。");

        return;

    }

    // 古いQRコードを削除
    qrElement.innerHTML = "";

    // QRコード生成
    new QRCode(qrElement, {

        text: url,

        width: 90,

        height: 90,

        colorDark: "#000000",

        colorLight: "#ffffff",

        correctLevel: QRCode.CorrectLevel.H

    });

    console.log("QRコード生成完了");

    console.log(url);

}


/**
 * 現在のURLを取得
 *
 * @returns {string}
 */
export function getCurrentURL() {

    return window.location.href;

}
"use strict";
/* eslint-disable */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
const main_1 = require("main/main");
window.mobile = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    window.mobile = true;
}
let windwidth = 0;
let windheight = 0;
window.resizeHeader = function () {
    var _a, _b;
    windwidth = (_a = (0, jquery_1.default)(window).width()) !== null && _a !== void 0 ? _a : 0;
    windheight = (_b = (0, jquery_1.default)(window).height()) !== null && _b !== void 0 ? _b : 0;
    if (windwidth < 1500) {
        (0, jquery_1.default)("#main").addClass("smalltext");
    }
    else {
        (0, jquery_1.default)("#main").removeClass("smalltext");
    }
    if (windwidth < 1200) {
        (0, jquery_1.default)(".button").css({
            "font-size": "12px",
            "width": 70
        }).children("p").css("margin", "23px 0px");
        (0, jquery_1.default)(".longbutton").css("width", 90);
        (0, jquery_1.default)(".doublebutton").css("width", 80).children("p").css("margin", "16px 0px");
        (0, jquery_1.default)(".doublelongbutton").css("width", 90).children("p").css("margin", "16px 0px");
        (0, jquery_1.default)("#titlelogo").css({
            "width": 280,
            "height": 60,
            "margin-top": 0
        });
    }
    else {
        (0, jquery_1.default)(".button").css({
            "font-size": "16px",
            "width": 80
        }).children("p").css("margin", "21px 0px");
        (0, jquery_1.default)(".longbutton").css("width", 100);
        (0, jquery_1.default)(".doublebutton").css("width", 85).children("p").css("margin", "12px 0px");
        (0, jquery_1.default)(".doublelongbutton").css("width", 100).children("p").css("margin", "12px 0px");
        (0, jquery_1.default)("#titlelogo").css({
            "width": 280,
            "height": 60,
            "margin-top": 0
        });
    }
    if (windwidth < 1050) {
        (0, jquery_1.default)(".button").css({
            "font-size": "12px",
            "width": 65
        }).children("p").css("margin", "23px 0px");
        (0, jquery_1.default)(".longbutton").css("width", 75);
        (0, jquery_1.default)(".doublebutton").css("width", 70).children("p").css("margin", "16px 0px");
        (0, jquery_1.default)(".doublelongbutton").css("width", 75).children("p").css("margin", "16px 0px");
        (0, jquery_1.default)("#titlelogo").css({
            "width": 200,
            "height": 43,
            "margin-top": 10
        });
    }
    if (windwidth < 905) {
        (0, jquery_1.default)(".button").css({
            "font-size": "10px",
            "width": 50
        }).children("p").css("margin", "25px 0px");
        (0, jquery_1.default)(".longbutton").css("width", 60);
        (0, jquery_1.default)(".doublebutton").css("width", 55).children("p").css("margin", "19px 0px");
        (0, jquery_1.default)(".doublelongbutton").css("width", 60).children("p").css("margin", "19px 0px");
        (0, jquery_1.default)("#titlelogo").css({
            "width": 150,
            "height": 32,
            "margin-top": 16
        });
    }
    (0, jquery_1.default)("#main").css("min-height", windheight - 105 + "px");
};
let showHeader = true;
window.resize = function () {
    var _a, _b;
    window.resizeHeader();
    let head = showHeader ? 95 : 31;
    if (main_1.showDebug) {
        head += 60;
    }
    const wW = (_a = (0, jquery_1.default)(window).width()) !== null && _a !== void 0 ? _a : 0;
    const wH = (_b = (0, jquery_1.default)(window).height()) !== null && _b !== void 0 ? _b : 0;
    const maxScale = (wH - head) / 750;
    const scale = Math.min(maxScale, wW / 1200);
    const mY = (wH - head) - scale * 750;
    const mX = wW - scale * 1200;
    (0, jquery_1.default)("#display").css({
        "margin-left": (mX / 2) + "px",
        "margin-top": (mY / 2) + "px",
        "-webkit-transform": "scale(" + scale + ", " + scale + ")",
        "transform": "scale(" + scale + ", " + scale + ")",
        "-ms-transform": "scale(" + scale + ", " + scale + ")"
    });
    (0, jquery_1.default)("body").height(wH);
};
(0, jquery_1.default)(window).resize(function () {
    window.resize();
});

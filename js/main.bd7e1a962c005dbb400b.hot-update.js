"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdatemeleelight"]("main",{

/***/ "./src/stages/util/extremePoint.ts":
/*!*****************************************!*\
  !*** ./src/stages/util/extremePoint.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n// @flow\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.extremePoint = extremePoint;\n// export function extremePoint(wall : [Vec2D, Vec2D], extreme : string) : Vec2D {\nfunction extremePoint(wall, extreme) {\n    const v1 = wall[0];\n    const v2 = wall[1];\n    switch (extreme) {\n        case \"u\":\n        case \"t\":\n            if (v2.y < v1.y) {\n                return v1;\n            }\n            else {\n                return v2;\n            }\n        case \"d\":\n        case \"b\":\n            if (v2.y > v1.y) {\n                return v1;\n            }\n            else {\n                return v2;\n            }\n        case \"l\":\n            if (v2.x > v1.x) {\n                return v1;\n            }\n            else {\n                return v2;\n            }\n        case \"r\":\n            if (v2.x < v1.x) {\n                return v1;\n            }\n            else {\n                return v2;\n            }\n        default:\n            console.log(\"error in 'extremePoint': invalid parameter \" + extreme + \", not up/top/down/bottom/left/right\");\n            return v1; // just to make the type checker happy\n    }\n}\n;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvc3RhZ2VzL3V0aWwvZXh0cmVtZVBvaW50LnRzIiwibWFwcGluZ3MiOiJBQUFhO0FBQ2I7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0Qsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL21lbGVlbGlnaHQvLi9zcmMvc3RhZ2VzL3V0aWwvZXh0cmVtZVBvaW50LnRzP2JkMjAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBAZmxvd1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5leHRyZW1lUG9pbnQgPSBleHRyZW1lUG9pbnQ7XG4vLyBleHBvcnQgZnVuY3Rpb24gZXh0cmVtZVBvaW50KHdhbGwgOiBbVmVjMkQsIFZlYzJEXSwgZXh0cmVtZSA6IHN0cmluZykgOiBWZWMyRCB7XG5mdW5jdGlvbiBleHRyZW1lUG9pbnQod2FsbCwgZXh0cmVtZSkge1xuICAgIGNvbnN0IHYxID0gd2FsbFswXTtcbiAgICBjb25zdCB2MiA9IHdhbGxbMV07XG4gICAgc3dpdGNoIChleHRyZW1lKSB7XG4gICAgICAgIGNhc2UgXCJ1XCI6XG4gICAgICAgIGNhc2UgXCJ0XCI6XG4gICAgICAgICAgICBpZiAodjIueSA8IHYxLnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjI7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJkXCI6XG4gICAgICAgIGNhc2UgXCJiXCI6XG4gICAgICAgICAgICBpZiAodjIueSA+IHYxLnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjI7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJsXCI6XG4gICAgICAgICAgICBpZiAodjIueCA+IHYxLngpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjI7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJyXCI6XG4gICAgICAgICAgICBpZiAodjIueCA8IHYxLngpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjI7XG4gICAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yIGluICdleHRyZW1lUG9pbnQnOiBpbnZhbGlkIHBhcmFtZXRlciBcIiArIGV4dHJlbWUgKyBcIiwgbm90IHVwL3RvcC9kb3duL2JvdHRvbS9sZWZ0L3JpZ2h0XCIpO1xuICAgICAgICAgICAgcmV0dXJuIHYxOyAvLyBqdXN0IHRvIG1ha2UgdGhlIHR5cGUgY2hlY2tlciBoYXBweVxuICAgIH1cbn1cbjtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/stages/util/extremePoint.ts\n");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("a0f505c58143172206b9")
/******/ })();
/******/ 
/******/ }
);
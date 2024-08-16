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

/***/ "./src/main/util/Segment2D.ts":
/*!************************************!*\
  !*** ./src/main/util/Segment2D.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Segment2D = void 0;\nconst Vec2D_1 = __webpack_require__(/*! ./Vec2D */ \"./src/main/util/Vec2D.ts\");\nclass Segment2D {\n    constructor(x, y, vecx, vecy) {\n        this.segLength = function () {\n            const dx = vecx;\n            const dy = vecy;\n            return Math.sqrt(dx * dx + dy * dy);\n        };\n        this.project = function (segOnto) {\n            const vec = new Vec2D_1.Vec2D(vecx, vecy);\n            const onto = new Vec2D_1.Vec2D(segOnto.vecx, segOnto.vecy);\n            const d = onto.dot(onto);\n            if (0 < d) {\n                const dp = vec.dot(onto);\n                const multiplier = dp / d;\n                const rx = onto.x * multiplier;\n                const ry = onto.y * multiplier;\n                return new Vec2D_1.Vec2D(rx, ry);\n            }\n            return new Vec2D_1.Vec2D(0, 0);\n        };\n        this.x = x;\n        this.y = y;\n        this.vecx = vecx;\n        this.vecy = vecy;\n    }\n}\nexports.Segment2D = Segment2D;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbWFpbi91dGlsL1NlZ21lbnQyRC50cyIsIm1hcHBpbmdzIjoiQUFBYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxpQkFBaUI7QUFDakIsZ0JBQWdCLG1CQUFPLENBQUMseUNBQVM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQiIsInNvdXJjZXMiOlsid2VicGFjazovL21lbGVlbGlnaHQvLi9zcmMvbWFpbi91dGlsL1NlZ21lbnQyRC50cz8wM2MxIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TZWdtZW50MkQgPSB2b2lkIDA7XG5jb25zdCBWZWMyRF8xID0gcmVxdWlyZShcIi4vVmVjMkRcIik7XG5jbGFzcyBTZWdtZW50MkQge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIHZlY3gsIHZlY3kpIHtcbiAgICAgICAgdGhpcy5zZWdMZW5ndGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCBkeCA9IHZlY3g7XG4gICAgICAgICAgICBjb25zdCBkeSA9IHZlY3k7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5wcm9qZWN0ID0gZnVuY3Rpb24gKHNlZ09udG8pIHtcbiAgICAgICAgICAgIGNvbnN0IHZlYyA9IG5ldyBWZWMyRF8xLlZlYzJEKHZlY3gsIHZlY3kpO1xuICAgICAgICAgICAgY29uc3Qgb250byA9IG5ldyBWZWMyRF8xLlZlYzJEKHNlZ09udG8udmVjeCwgc2VnT250by52ZWN5KTtcbiAgICAgICAgICAgIGNvbnN0IGQgPSBvbnRvLmRvdChvbnRvKTtcbiAgICAgICAgICAgIGlmICgwIDwgZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRwID0gdmVjLmRvdChvbnRvKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtdWx0aXBsaWVyID0gZHAgLyBkO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJ4ID0gb250by54ICogbXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICBjb25zdCByeSA9IG9udG8ueSAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMyRF8xLlZlYzJEKHJ4LCByeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYzJEXzEuVmVjMkQoMCwgMCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMudmVjeCA9IHZlY3g7XG4gICAgICAgIHRoaXMudmVjeSA9IHZlY3k7XG4gICAgfVxufVxuZXhwb3J0cy5TZWdtZW50MkQgPSBTZWdtZW50MkQ7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/main/util/Segment2D.ts\n");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("daffe492bb7c4822d142")
/******/ })();
/******/ 
/******/ }
);
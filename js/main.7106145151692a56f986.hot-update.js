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

/***/ "./src/main/util/deepCopyObject.ts":
/*!*****************************************!*\
  !*** ./src/main/util/deepCopyObject.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.deepObjectMerge = deepObjectMerge;\n// warning: this function is currently buggy and does not properly deep copy objects...\n// use `deepCopy` instead wherever possible\nfunction deepObjectMerge(deep, target, object, exclusionList) {\n    // warning: this function is currently buggy and does not properly deep copy objects...\n    // use `deepCopy` instead wherever possible\n    if (deep) {\n        let result = target;\n        result = result || {};\n        for (let i = 2; i < arguments.length; i++) {\n            const obj = arguments[i];\n            if (arguments.length === 3 && obj instanceof Array) {\n                result = [];\n            }\n            if (!obj)\n                continue;\n            for (const key in obj) {\n                if (obj.hasOwnProperty(key)) {\n                    if (typeof obj[key] === 'object' && exclusionList && exclusionList.indexOf(key) === -1)\n                        // todo look into this (added empty list at the end)\n                        result[key] = deepObjectMerge(deep, result[key], obj[key], []);\n                    else\n                        result[key] = obj[key];\n                }\n            }\n        }\n        return result;\n    }\n    else {\n        return Object.assign(target, object);\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvbWFpbi91dGlsL2RlZXBDb3B5T2JqZWN0LnRzIiwibWFwcGluZ3MiOiJBQUFhO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHNCQUFzQjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL21lbGVlbGlnaHQvLi9zcmMvbWFpbi91dGlsL2RlZXBDb3B5T2JqZWN0LnRzPzEwYWIiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZXBPYmplY3RNZXJnZSA9IGRlZXBPYmplY3RNZXJnZTtcbi8vIHdhcm5pbmc6IHRoaXMgZnVuY3Rpb24gaXMgY3VycmVudGx5IGJ1Z2d5IGFuZCBkb2VzIG5vdCBwcm9wZXJseSBkZWVwIGNvcHkgb2JqZWN0cy4uLlxuLy8gdXNlIGBkZWVwQ29weWAgaW5zdGVhZCB3aGVyZXZlciBwb3NzaWJsZVxuZnVuY3Rpb24gZGVlcE9iamVjdE1lcmdlKGRlZXAsIHRhcmdldCwgb2JqZWN0LCBleGNsdXNpb25MaXN0KSB7XG4gICAgLy8gd2FybmluZzogdGhpcyBmdW5jdGlvbiBpcyBjdXJyZW50bHkgYnVnZ3kgYW5kIGRvZXMgbm90IHByb3Blcmx5IGRlZXAgY29weSBvYmplY3RzLi4uXG4gICAgLy8gdXNlIGBkZWVwQ29weWAgaW5zdGVhZCB3aGVyZXZlciBwb3NzaWJsZVxuICAgIGlmIChkZWVwKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSB0YXJnZXQ7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCB7fTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDI7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmIG9iaiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW9iailcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAnb2JqZWN0JyAmJiBleGNsdXNpb25MaXN0ICYmIGV4Y2x1c2lvbkxpc3QuaW5kZXhPZihrZXkpID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvZG8gbG9vayBpbnRvIHRoaXMgKGFkZGVkIGVtcHR5IGxpc3QgYXQgdGhlIGVuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gZGVlcE9iamVjdE1lcmdlKGRlZXAsIHJlc3VsdFtrZXldLCBvYmpba2V5XSwgW10pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IG9ialtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBvYmplY3QpO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/main/util/deepCopyObject.ts\n");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("808eeda025eb492a811a")
/******/ })();
/******/ 
/******/ }
);
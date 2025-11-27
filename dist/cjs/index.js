"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStartReadingUrl = exports.buildStillReadingUrl = exports.buildRendererUrl = exports.buildDeviceTokenUrl = exports.START_READING_URL = exports.STILL_READING_URL = exports.RENDERER_URL = exports.BOOKS_URL = exports.DEVICE_TOKEN_URL = exports.HttpClient = exports.Kindle = void 0;
// Main class
var kindle_js_1 = require("./kindle.js");
Object.defineProperty(exports, "Kindle", { enumerable: true, get: function () { return kindle_js_1.Kindle; } });
// HTTP client
var http_client_js_1 = require("./http-client.js");
Object.defineProperty(exports, "HttpClient", { enumerable: true, get: function () { return http_client_js_1.HttpClient; } });
// URL utilities
var urls_js_1 = require("./urls.js");
Object.defineProperty(exports, "DEVICE_TOKEN_URL", { enumerable: true, get: function () { return urls_js_1.DEVICE_TOKEN_URL; } });
Object.defineProperty(exports, "BOOKS_URL", { enumerable: true, get: function () { return urls_js_1.BOOKS_URL; } });
Object.defineProperty(exports, "RENDERER_URL", { enumerable: true, get: function () { return urls_js_1.RENDERER_URL; } });
Object.defineProperty(exports, "STILL_READING_URL", { enumerable: true, get: function () { return urls_js_1.STILL_READING_URL; } });
Object.defineProperty(exports, "START_READING_URL", { enumerable: true, get: function () { return urls_js_1.START_READING_URL; } });
Object.defineProperty(exports, "buildDeviceTokenUrl", { enumerable: true, get: function () { return urls_js_1.buildDeviceTokenUrl; } });
Object.defineProperty(exports, "buildRendererUrl", { enumerable: true, get: function () { return urls_js_1.buildRendererUrl; } });
Object.defineProperty(exports, "buildStillReadingUrl", { enumerable: true, get: function () { return urls_js_1.buildStillReadingUrl; } });
Object.defineProperty(exports, "buildStartReadingUrl", { enumerable: true, get: function () { return urls_js_1.buildStartReadingUrl; } });

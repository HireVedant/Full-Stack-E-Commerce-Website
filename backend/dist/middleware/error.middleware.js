"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
function errorHandler(err, _req, res, _next) {
    console.error("[Unhandled Error]", err.message, err.stack);
    res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
    });
}
function notFoundHandler(_req, res) {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
}
//# sourceMappingURL=error.middleware.js.map
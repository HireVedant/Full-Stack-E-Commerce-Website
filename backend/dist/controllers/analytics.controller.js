"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAnalyticsControllers = makeAnalyticsControllers;
function makeAnalyticsControllers(svc) {
    function getStats(req, res) {
        try {
            const stats = svc.getDashboardStats();
            res.json({ success: true, data: stats });
        }
        catch {
            res.status(500).json({ success: false, message: "Failed to load analytics" });
        }
    }
    return { getStats };
}
//# sourceMappingURL=analytics.controller.js.map
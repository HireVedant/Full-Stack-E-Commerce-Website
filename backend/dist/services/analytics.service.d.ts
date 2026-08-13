import type Database from "better-sqlite3";
export declare class AnalyticsService {
    private db;
    constructor(db?: Database.Database);
    getDashboardStats(): {
        totalProducts: any;
        totalUsers: any;
        totalOrders: any;
        totalRevenue: any;
        popularProducts: any[];
    };
}
//# sourceMappingURL=analytics.service.d.ts.map